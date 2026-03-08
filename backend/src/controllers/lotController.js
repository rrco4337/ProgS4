const { getConnection, sql } = require('../config/database');

// Récupérer tous les lots avec leurs informations de race
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT l.*, r.nom_race, r.pu_sakafo_g, r.pv_g, r.pv_oeuf
                    FROM Lot l
                    INNER JOIN Race r ON l.id_race = r.id_race
                    ORDER BY l.date_entree DESC`);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getAll lots:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Récupérer un lot par ID
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT l.*, r.nom_race, r.pu_sakafo_g, r.pv_g, r.pv_oeuf
                    FROM Lot l
                    INNER JOIN Race r ON l.id_race = r.id_race
                    WHERE l.id_lot = @id`);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lot non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Erreur getById lot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Calculer le poids actuel d'un lot
const getPoidsActuel = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        
        // Récupérer les infos du lot
        const lotResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT l.*, r.nom_race, r.pu_sakafo_g, r.pv_g, r.pv_oeuf
                    FROM Lot l
                    INNER JOIN Race r ON l.id_race = r.id_race
                    WHERE l.id_lot = @id`);
        
        if (lotResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lot non trouvé'
            });
        }
        
        const lot = lotResult.recordset[0];
        
        // Calculer l'âge du lot en semaines
        const dateEntree = new Date(lot.date_entree);
        const aujourdhui = new Date();
        const diffMs = aujourdhui - dateEntree;
        const ageEnSemaines = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
        
        // Récupérer le modèle de croissance
        const croissanceResult = await pool.request()
            .input('id_race', sql.Int, lot.id_race)
            .query(`SELECT * FROM Croissance 
                    WHERE id_race = @id_race 
                    ORDER BY semaine`);
        
        const croissance = croissanceResult.recordset;

        // Récupérer les mortalités (avant la boucle pour le calcul nourriture)
        const mortaliteResult = await pool.request()
            .input('id_lot', sql.Int, id)
            .query(`SELECT ISNULL(SUM(nombre), 0) as total_morts 
                    FROM Mortalite 
                    WHERE id_lot = @id_lot`);
        
        const totalMorts = mortaliteResult.recordset[0].total_morts;
        const nombreActuel = lot.nombre_initial - totalMorts;
        
        // Calculer le poids cumulé + nourriture + coût
        let poidsCumule = 0;
        let nourritureCumulee = 0;
        let coutNourritureCumulee = 0;
        const detail = [];
        
        for (let i = 0; i <= Math.min(ageEnSemaines, croissance.length - 1); i++) {
            if (i === 0) {
                poidsCumule = croissance[i].gain_poids; // Poids initial
            } else {
                poidsCumule += croissance[i].gain_poids;
            }
            nourritureCumulee += croissance[i].nourriture;
            
            // Calcul nourriture et coût pour la semaine (pour le lot entier)
            const nourritureLot = croissance[i].nourriture * nombreActuel;
            const coutSemaine = nourritureLot * lot.pu_sakafo_g;
            coutNourritureCumulee += coutSemaine;
            
            detail.push({
                semaine: croissance[i].semaine,
                gain_poids: croissance[i].gain_poids,
                poids_cumule: poidsCumule,
                nourriture: croissance[i].nourriture,
                nourriture_cumulee: nourritureCumulee,
                nourriture_lot: nourritureLot,
                cout_nourriture_semaine: coutSemaine,
                cout_nourriture_cumulee: coutNourritureCumulee
            });
        }
        
        const poidsTotal = poidsCumule * nombreActuel;
        const nourritureTotaleG = nourritureCumulee * nombreActuel;

        // --- Œufs : total récolté pour ce lot ---
        const oeufsResult = await pool.request()
            .input('id_oeufs', sql.Int, id)
            .query(`SELECT ISNULL(SUM(nombre), 0) AS total_oeufs FROM Oeuf WHERE id_lot = @id_oeufs`);
        const totalOeufs = oeufsResult.recordset[0].total_oeufs;

        // --- Situation financière ---
        const valeurPoulets = nombreActuel * poidsCumule * (lot.pv_g || 0);
        const valeurOeufs   = totalOeufs   * (lot.pv_oeuf || 0);
        const benefice      = valeurPoulets + valeurOeufs
                              - coutNourritureCumulee
                              - (lot.cout_achat || 0);

        const dateSituation = new Date().toISOString().split('T')[0];

        res.json({
            success: true,
            data: {
                id_lot: lot.id_lot,
                nom_race: lot.nom_race,
                date_entree: lot.date_entree,
                date_situation: dateSituation,
                age_semaines: ageEnSemaines,
                nombre_initial: lot.nombre_initial,
                nombre_actuel: nombreActuel,
                mortalites: totalMorts,
                cout_achat: lot.cout_achat || 0,
                poids_unitaire: poidsCumule,
                poids_total: poidsTotal,
                pu_sakafo_g: lot.pu_sakafo_g,
                pv_g: lot.pv_g || 0,
                pv_oeuf: lot.pv_oeuf || 0,
                nourriture_cumulee: nourritureCumulee,
                nourriture_totale_g: nourritureTotaleG,
                cout_nourriture_total: coutNourritureCumulee,
                total_oeufs: totalOeufs,
                valeur_poulets: valeurPoulets,
                valeur_oeufs: valeurOeufs,
                benefice: benefice,
                detail_croissance: detail
            }
        });
    } catch (error) {
        console.error('Erreur getPoidsActuel:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Créer un nouveau lot
const create = async (req, res) => {
    try {
        const { id_race, date_entree, nombre_initial, cout_achat } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .input('date_entree', sql.Date, date_entree)
            .input('nombre_initial', sql.Int, nombre_initial)
            .input('cout_achat', sql.Decimal(12, 2), cout_achat)
            .query(`INSERT INTO Lot (id_race, date_entree, nombre_initial, cout_achat) 
                    VALUES (@id_race, @date_entree, @nombre_initial, @cout_achat); 
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({
            success: true,
            data: {
                id_lot: result.recordset[0].id,
                id_race,
                date_entree,
                nombre_initial,
                cout_achat
            }
        });
    } catch (error) {
        console.error('Erreur create lot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Mettre à jour un lot
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_race, date_entree, nombre_initial, cout_achat } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('id_race', sql.Int, id_race)
            .input('date_entree', sql.Date, date_entree)
            .input('nombre_initial', sql.Int, nombre_initial)
            .input('cout_achat', sql.Decimal(12, 2), cout_achat)
            .query(`UPDATE Lot 
                    SET id_race = @id_race, 
                        date_entree = @date_entree, 
                        nombre_initial = @nombre_initial, 
                        cout_achat = @cout_achat
                    WHERE id_lot = @id`);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lot non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: { id_lot: id, id_race, date_entree, nombre_initial, cout_achat }
        });
    } catch (error) {
        console.error('Erreur update lot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Supprimer un lot
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Lot WHERE id_lot = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lot non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: 'Lot supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur delete lot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAll,
    getById,
    getPoidsActuel,
    create,
    update,
    delete: deleteItem
};
