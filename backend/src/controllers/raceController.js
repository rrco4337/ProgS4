const { getConnection, sql } = require('../config/database');

// FONCTION 1: Recuperer toutes les races d'animaux
// Liste toutes les especes disponibles avec leurs caracteristiques
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        // Requete simple pour avoir toutes les races
        const result = await pool.request()
            .query('SELECT * FROM Race ORDER BY id_race');
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getAll races:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// FONCTION 2: Recuperer une race specifique par son numero
// Utile pour voir les details d'une seule race
const getById = async (req, res) => {
    try {
        // On recupere le numero de la race depuis l'URL
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Race WHERE id_race = @id');
        
        // Si la race n'existe pas, on renvoie une erreur
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Race non trouvée'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Erreur getById race:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// FONCTION 3: Recuperer le modele de croissance d'une race
// Montre comment les animaux de cette race grandissent semaine par semaine
const getCroissance = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        // On recupere les donnees de croissance dans l'ordre des semaines
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Croissance WHERE id_race = @id ORDER BY semaine');
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getCroissance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Créer une nouvelle race
const create = async (req, res) => {
    try {
        const {
            nom_race,
            pu_sakafo_g,
            pv_g,
            pv_oeuf,
            semaine_debut_ponte,
            duree_incubation,
            capacite_ponte,
            pv_g_femelle,
            pv_g_male
        } = req.body;
        const pvFemelle = pv_g_femelle != null ? pv_g_femelle : (pv_g != null ? pv_g : 15);
        const pvMale = pv_g_male != null ? pv_g_male : 20;
        const pool = await getConnection();
        const result = await pool.request()
            .input('nom_race', sql.VarChar, nom_race)
            .input('pu_sakafo_g', sql.Decimal(10, 2), pu_sakafo_g)
            .input('pv_g', sql.Decimal(10, 2), pvFemelle)
            .input('pv_oeuf', sql.Decimal(10, 2), pv_oeuf)
            .input('semaine_debut_ponte', sql.Int, semaine_debut_ponte)
            .input('duree_incubation', sql.Int, duree_incubation)
            .input('capacite_ponte', sql.Int, capacite_ponte || 300)
            .input('pv_g_femelle', sql.Decimal(10, 2), pvFemelle)
            .input('pv_g_male', sql.Decimal(10, 2), pvMale)
            .query(`INSERT INTO Race (nom_race, pu_sakafo_g, pv_g, pv_oeuf, semaine_debut_ponte, duree_incubation, capacite_ponte, pv_g_femelle, pv_g_male) 
                    VALUES (@nom_race, @pu_sakafo_g, @pv_g, @pv_oeuf, @semaine_debut_ponte, @duree_incubation, @capacite_ponte, @pv_g_femelle, @pv_g_male); 
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({
            success: true,
            data: {
                id_race: result.recordset[0].id,
                nom_race,
                pu_sakafo_g,
                pv_g: pvFemelle,
                pv_oeuf,
                semaine_debut_ponte,
                duree_incubation,
                capacite_ponte: capacite_ponte || 300,
                pv_g_femelle: pvFemelle,
                pv_g_male: pvMale
            }
        });
    } catch (error) {
        console.error('Erreur create race:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Mettre à jour une race
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nom_race,
            pu_sakafo_g,
            pv_g,
            pv_oeuf,
            semaine_debut_ponte,
            duree_incubation,
            capacite_ponte,
            pv_g_femelle,
            pv_g_male
        } = req.body;
        const pvFemelle = pv_g_femelle != null ? pv_g_femelle : (pv_g != null ? pv_g : 15);
        const pvMale = pv_g_male != null ? pv_g_male : 20;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nom_race', sql.VarChar, nom_race)
            .input('pu_sakafo_g', sql.Decimal(10, 2), pu_sakafo_g)
            .input('pv_g', sql.Decimal(10, 2), pvFemelle)
            .input('pv_oeuf', sql.Decimal(10, 2), pv_oeuf)
            .input('semaine_debut_ponte', sql.Int, semaine_debut_ponte)
            .input('duree_incubation', sql.Int, duree_incubation)
            .input('capacite_ponte', sql.Int, capacite_ponte || 300)
            .input('pv_g_femelle', sql.Decimal(10, 2), pvFemelle)
            .input('pv_g_male', sql.Decimal(10, 2), pvMale)
            .query(`UPDATE Race 
                    SET nom_race = @nom_race, 
                        pu_sakafo_g = @pu_sakafo_g, 
                        pv_g = @pv_g, 
                        pv_oeuf = @pv_oeuf,
                        semaine_debut_ponte = @semaine_debut_ponte,
                        duree_incubation = @duree_incubation,
                        capacite_ponte = @capacite_ponte,
                        pv_g_femelle = @pv_g_femelle,
                        pv_g_male = @pv_g_male
                    WHERE id_race = @id`);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Race non trouvée'
            });
        }
        
        res.json({
            success: true,
            data: {
                id_race: id,
                nom_race,
                pu_sakafo_g,
                pv_g: pvFemelle,
                pv_oeuf,
                semaine_debut_ponte,
                duree_incubation,
                capacite_ponte: capacite_ponte || 300,
                pv_g_femelle: pvFemelle,
                pv_g_male: pvMale
            }
        });
    } catch (error) {
        console.error('Erreur update race:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Supprimer une race
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Race WHERE id_race = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Race non trouvée'
            });
        }
        
        res.json({
            success: true,
            message: 'Race supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur delete race:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAll,
    getById,
    getCroissance,
    create,
    update,
    delete: deleteItem
};
