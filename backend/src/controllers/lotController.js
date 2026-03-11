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

// ─── Helper interne : calcule la situation complète d'UN lot ─────────────────
// Le gain de poids hebdomadaire est distribué sur 7 jours (gain/7 par jour),
// car le poids moyen varie chaque jour au sein d'une même semaine.
async function _calculerSituationLot(pool, id) {
    const lotResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT l.*, r.nom_race, r.pu_sakafo_g, r.pv_g, r.pv_oeuf
                FROM Lot l
                INNER JOIN Race r ON l.id_race = r.id_race
                WHERE l.id_lot = @id`);

    if (lotResult.recordset.length === 0) return null;
    const lot = lotResult.recordset[0];

    const dateEntree = new Date(lot.date_entree);
    const aujourdhui = new Date();
    // Calcul en jours pour interpolation journalière
    const ageEnJours       = Math.floor((aujourdhui - dateEntree) / (1000 * 60 * 60 * 24));
    const semaines_completes = Math.floor(ageEnJours / 7);
    const jours_en_cours     = ageEnJours % 7; // jours écoulés dans la semaine en cours

    const croissanceResult = await pool.request()
        .input('id_race', sql.Int, lot.id_race)
        .query(`SELECT * FROM Croissance WHERE id_race = @id_race ORDER BY semaine`);
    const croissance = croissanceResult.recordset;

    const mortaliteResult = await pool.request()
        .input('id_lot', sql.Int, id)
        .query(`SELECT ISNULL(SUM(nombre), 0) as total_morts FROM Mortalite WHERE id_lot = @id_lot`);
    const totalMorts = mortaliteResult.recordset[0].total_morts;
    const nombreActuel = lot.nombre_initial - totalMorts;

    let poidsCumule = 0;
    let nourritureCumulee = 0;
    let coutNourritureCumulee = 0;
    const detail = [];

    // ── Semaines complètes ────────────────────────────────────────────────────
    const semaineMax = Math.min(semaines_completes, croissance.length - 1);
    for (let i = 0; i <= semaineMax; i++) {
        // S0 = poids initial (pas un gain), S1+ = gain ajouté au cumul
        poidsCumule = i === 0 ? croissance[i].gain_poids : poidsCumule + croissance[i].gain_poids;
        nourritureCumulee += croissance[i].nourriture;
        const nourritureLot = croissance[i].nourriture * nombreActuel;
        const coutSemaine   = nourritureLot * lot.pu_sakafo_g;
        coutNourritureCumulee += coutSemaine;
        detail.push({
            type: 'semaine',
            semaine: croissance[i].semaine,
            gain_poids: croissance[i].gain_poids,
            poids_cumule: parseFloat(poidsCumule.toFixed(2)),
            nourriture: croissance[i].nourriture,
            nourriture_cumulee: parseFloat(nourritureCumulee.toFixed(2)),
            nourriture_lot: parseFloat(nourritureLot.toFixed(2)),
            cout_nourriture_semaine: parseFloat(coutSemaine.toFixed(2)),
            cout_nourriture_cumulee: parseFloat(coutNourritureCumulee.toFixed(2))
        });
    }

    // ── Semaine en cours : interpolation journalière (gain ÷ 7) ──────────────
    // Le poids varie chaque jour → gain_poids / 7 par jour
    // La nourriture est également proratisée : nourriture / 7 par jour
    const prochaineSemaine = semaines_completes + 1;
    if (jours_en_cours > 0 && prochaineSemaine < croissance.length) {
        const c = croissance[prochaineSemaine];
        const gainJournalier        = c.gain_poids / 7;
        const nourritureJournaliere = c.nourriture  / 7;

        for (let j = 1; j <= jours_en_cours; j++) {
            poidsCumule       += gainJournalier;
            nourritureCumulee += nourritureJournaliere;
            const nourritureLotJour = nourritureJournaliere * nombreActuel;
            const coutJour          = nourritureLotJour * lot.pu_sakafo_g;
            coutNourritureCumulee  += coutJour;
            detail.push({
                type: 'jour',
                semaine: prochaineSemaine,
                jour: j,
                gain_poids_jour:        parseFloat(gainJournalier.toFixed(4)),
                poids_cumule:           parseFloat(poidsCumule.toFixed(2)),
                nourriture_jour:        parseFloat(nourritureJournaliere.toFixed(4)),
                nourriture_cumulee:     parseFloat(nourritureCumulee.toFixed(2)),
                nourriture_lot:         parseFloat(nourritureLotJour.toFixed(2)),
                cout_nourriture_jour:   parseFloat(coutJour.toFixed(2)),
                cout_nourriture_cumulee:parseFloat(coutNourritureCumulee.toFixed(2))
            });
        }
    }

    const poidsTotal       = poidsCumule * nombreActuel;
    const nourritureTotaleG = nourritureCumulee * nombreActuel;

    const oeufsResult = await pool.request()
        .input('id_oeufs', sql.Int, id)
        .query(`SELECT ISNULL(SUM(nombre), 0) AS total_oeufs FROM Oeuf WHERE id_lot = @id_oeufs`);
    const totalOeufs = oeufsResult.recordset[0].total_oeufs;

    const valeurPoulets = nombreActuel * poidsCumule * (lot.pv_g || 0);
    const valeurOeufs   = totalOeufs   * (lot.pv_oeuf || 0);
    const benefice      = valeurPoulets + valeurOeufs - coutNourritureCumulee - (lot.cout_achat || 0);

    return {
        id_lot: lot.id_lot,
        nom_race: lot.nom_race,
        date_entree: lot.date_entree,
        date_situation: new Date().toISOString().split('T')[0],
        age_jours: ageEnJours,
        age_semaines: semaines_completes,
        jours_en_cours,
        nombre_initial: lot.nombre_initial,
        nombre_actuel: nombreActuel,
        mortalites: totalMorts,
        cout_achat: lot.cout_achat || 0,
        poids_unitaire: parseFloat(poidsCumule.toFixed(2)),
        poids_total: parseFloat(poidsTotal.toFixed(2)),
        pu_sakafo_g: lot.pu_sakafo_g,
        pv_g: lot.pv_g || 0,
        pv_oeuf: lot.pv_oeuf || 0,
        nourriture_cumulee: parseFloat(nourritureCumulee.toFixed(2)),
        nourriture_totale_g: parseFloat(nourritureTotaleG.toFixed(2)),
        cout_nourriture_total: parseFloat(coutNourritureCumulee.toFixed(2)),
        total_oeufs: totalOeufs,
        valeur_poulets: parseFloat(valeurPoulets.toFixed(2)),
        valeur_oeufs: parseFloat(valeurOeufs.toFixed(2)),
        benefice: parseFloat(benefice.toFixed(2)),
        detail_croissance: detail
    };
}

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
        
        const situation = await _calculerSituationLot(pool, id);
        if (!situation) {
            return res.status(404).json({ success: false, error: 'Lot non trouvé' });
        }
        res.json({ success: true, data: situation });
    } catch (error) {
        console.error('Erreur getPoidsActuel:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Situation financière globale de tous les lots
const getSituationGlobale = async (req, res) => {
    try {
        const pool = await getConnection();
        const lotsResult = await pool.request()
            .query(`SELECT id_lot FROM Lot ORDER BY id_lot`);
        const ids = lotsResult.recordset.map(r => r.id_lot);

        // Calcul en parallèle pour tous les lots
        const situations = await Promise.all(ids.map(id => _calculerSituationLot(pool, id)));
        const valides = situations.filter(Boolean);

        const total_benefice          = valides.reduce((s, l) => s + l.benefice, 0);
        const total_valeur_poulets    = valides.reduce((s, l) => s + l.valeur_poulets, 0);
        const total_valeur_oeufs      = valides.reduce((s, l) => s + l.valeur_oeufs, 0);
        const total_cout_nourriture   = valides.reduce((s, l) => s + l.cout_nourriture_total, 0);
        const total_cout_achat        = valides.reduce((s, l) => s + l.cout_achat, 0);
        const total_poulets_actuel    = valides.reduce((s, l) => s + l.nombre_actuel, 0);
        const total_oeufs             = valides.reduce((s, l) => s + l.total_oeufs, 0);
        const lots_en_benefice        = valides.filter(l => l.benefice >= 0).length;
        const lots_en_perte           = valides.filter(l => l.benefice < 0).length;

        const detail_lots = valides.map(l => ({
            id_lot:               l.id_lot,
            nom_race:             l.nom_race,
            date_entree:          l.date_entree,
            nombre_actuel:        l.nombre_actuel,
            mortalites:           l.mortalites,
            total_oeufs:          l.total_oeufs,
            valeur_poulets:       l.valeur_poulets,
            valeur_oeufs:         l.valeur_oeufs,
            cout_nourriture_total:l.cout_nourriture_total,
            cout_achat:           l.cout_achat,
            benefice:             l.benefice
        }));

        res.json({
            success: true,
            data: {
                date_situation: new Date().toISOString().split('T')[0],
                nombre_lots: valides.length,
                lots_en_benefice,
                lots_en_perte,
                total_poulets_actuel,
                total_oeufs,
                total_valeur_poulets,
                total_valeur_oeufs,
                total_cout_nourriture,
                total_cout_achat,
                total_benefice,
                detail_lots
            }
        });
    } catch (error) {
        console.error('Erreur getSituationGlobale:', error);
        res.status(500).json({ success: false, error: error.message });
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
    getSituationGlobale,
    create,
    update,
    delete: deleteItem
};
