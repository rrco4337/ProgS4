const { getConnection, sql } = require('../config/database');

// Récupérer toutes les incubations
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT i.*, o.id_lot, o.date_recolte, o.nombre AS nombre_oeufs_recolte,
                           r.nom_race, r.duree_incubation
                    FROM Incubation i
                    INNER JOIN Oeuf o ON i.id_oeuf = o.id_oeuf
                    INNER JOIN Lot l ON o.id_lot = l.id_lot
                    INNER JOIN Race r ON l.id_race = r.id_race
                    ORDER BY i.date_debut DESC`);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Erreur getAll incubations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Démarrer une incubation
const create = async (req, res) => {
    try {
        const { id_oeuf, date_debut, nombre_oeufs } = req.body;

        if (!id_oeuf || !date_debut || !nombre_oeufs) {
            return res.status(400).json({ success: false, error: 'Champs id_oeuf, date_debut et nombre_oeufs requis' });
        }

        const pool = await getConnection();

        // Vérifier le stock disponible pour le lot de cet œuf
        const stockResult = await pool.request()
            .input('id_oeuf_s', sql.Int, id_oeuf)
            .query(`
                DECLARE @id_lot_s INT;
                SELECT @id_lot_s = id_lot FROM Oeuf WHERE id_oeuf = @id_oeuf_s;
                SELECT
                    COALESCE((SELECT SUM(o.nombre)       FROM Oeuf o WHERE o.id_lot = @id_lot_s), 0)
                  - COALESCE((SELECT SUM(i.nombre_oeufs) FROM Incubation i INNER JOIN Oeuf o2 ON i.id_oeuf = o2.id_oeuf WHERE o2.id_lot = @id_lot_s), 0)
                  - COALESCE((SELECT SUM(v.nombre_oeufs) FROM VenteOeuf v WHERE v.id_lot = @id_lot_s), 0)
                  AS stock_disponible
            `);

        const stockDispo = stockResult.recordset[0].stock_disponible;
        if (nombre_oeufs > stockDispo) {
            return res.status(400).json({
                success: false,
                error: `Stock insuffisant. Stock disponible : ${stockDispo} œuf(s), quantité demandée : ${nombre_oeufs}.`
            });
        }

        // Récupérer la durée d'incubation depuis la race
        const raceResult = await pool.request()
            .input('id_oeuf', sql.Int, id_oeuf)
            .query(`SELECT r.duree_incubation
                    FROM Race r
                    INNER JOIN Lot l ON l.id_race = r.id_race
                    INNER JOIN Oeuf o ON o.id_lot = l.id_lot
                    WHERE o.id_oeuf = @id_oeuf`);

        const duree = raceResult.recordset[0]?.duree_incubation ?? 21;

        const result = await pool.request()
            .input('id_oeuf', sql.Int, id_oeuf)
            .input('date_debut', sql.Date, date_debut)
            .input('nombre_oeufs', sql.Int, nombre_oeufs)
            .input('duree', sql.Int, duree)
            .query(`INSERT INTO Incubation (id_oeuf, date_debut, nombre_oeufs, date_eclosion_prevue, statut)
                    VALUES (@id_oeuf, @date_debut, @nombre_oeufs, DATEADD(day, @duree, @date_debut), 'en_cours');
                    SELECT SCOPE_IDENTITY() AS id`);

        // Calculer la date d'éclosion prévue pour la réponse
        const dateDebut = new Date(date_debut);
        dateDebut.setDate(dateDebut.getDate() + duree);
        const dateEclosionPrevue = dateDebut.toISOString().split('T')[0];

        res.status(201).json({
            success: true,
            data: {
                id_incubation: result.recordset[0].id,
                id_oeuf,
                date_debut,
                nombre_oeufs,
                date_eclosion_prevue: dateEclosionPrevue,
                statut: 'en_cours'
            }
        });
    } catch (error) {
        console.error('Erreur create incubation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Confirmer l'éclosion → crée un nouveau lot de poussins
const ecloter = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        // Récupérer les infos de l'incubation
        const incResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT i.*, o.id_lot, l.id_race
                    FROM Incubation i
                    INNER JOIN Oeuf o ON i.id_oeuf = o.id_oeuf
                    INNER JOIN Lot l ON o.id_lot = l.id_lot
                    WHERE i.id_incubation = @id AND i.statut = 'en_cours'`);

        if (!incResult.recordset.length) {
            return res.status(404).json({ success: false, error: 'Incubation non trouvée ou déjà éclose' });
        }

        const inc = incResult.recordset[0];
        const today = new Date().toISOString().split('T')[0];

        // Créer le nouveau lot de poussins
        const lotResult = await pool.request()
            .input('id_race', sql.Int, inc.id_race)
            .input('date_entree', sql.Date, today)
            .input('nombre_initial', sql.Int, inc.nombre_oeufs)
            .input('cout_achat', sql.Decimal(12, 2), 0)
            .query(`INSERT INTO Lot (id_race, date_entree, nombre_initial, cout_achat)
                    VALUES (@id_race, @date_entree, @nombre_initial, @cout_achat);
                    SELECT SCOPE_IDENTITY() AS id`);

        const idLotResultat = lotResult.recordset[0].id;

        // Mettre à jour l'incubation
        await pool.request()
            .input('id', sql.Int, id)
            .input('id_lot_resultat', sql.Int, idLotResultat)
            .query(`UPDATE Incubation
                    SET statut = 'eclot', id_lot_resultat = @id_lot_resultat
                    WHERE id_incubation = @id`);

        res.json({
            success: true,
            message: `Éclosion confirmée ! Nouveau lot #${idLotResultat} créé avec ${inc.nombre_oeufs} poussins.`,
            data: { id_lot_resultat: idLotResultat, nombre_poussins: inc.nombre_oeufs }
        });
    } catch (error) {
        console.error('Erreur ecloter incubation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Supprimer une incubation
const deleteIncubation = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM Incubation WHERE id_incubation = @id`);
        res.json({ success: true, message: 'Incubation supprimée' });
    } catch (error) {
        console.error('Erreur delete incubation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getAll, create, ecloter, delete: deleteIncubation };
