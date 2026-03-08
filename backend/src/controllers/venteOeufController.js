const { getConnection, sql } = require('../config/database');

// Récupérer toutes les ventes d'oeufs
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT v.*, r.nom_race
                    FROM VenteOeuf v
                    INNER JOIN Lot l ON v.id_lot = l.id_lot
                    INNER JOIN Race r ON l.id_race = r.id_race
                    ORDER BY v.date_vente DESC`);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Erreur getAll ventes oeufs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Ventes par lot
const getByLot = async (req, res) => {
    try {
        const { id_lot } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .query(`SELECT * FROM VenteOeuf WHERE id_lot = @id_lot ORDER BY date_vente DESC`);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Erreur getByLot ventes oeufs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Enregistrer une vente d'oeufs
const create = async (req, res) => {
    try {
        const { id_lot, date_vente, nombre_oeufs, prix_unitaire } = req.body;

        if (!id_lot || !date_vente || !nombre_oeufs || !prix_unitaire) {
            return res.status(400).json({
                success: false,
                error: 'Champs id_lot, date_vente, nombre_oeufs et prix_unitaire requis'
            });
        }

        const pool = await getConnection();

        // Vérifier le stock disponible pour ce lot
        const stockResult = await pool.request()
            .input('id_lot_s', sql.Int, id_lot)
            .query(`
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

        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .input('date_vente', sql.Date, date_vente)
            .input('nombre_oeufs', sql.Int, nombre_oeufs)
            .input('prix_unitaire', sql.Decimal(10, 2), prix_unitaire)
            .query(`INSERT INTO VenteOeuf (id_lot, date_vente, nombre_oeufs, prix_unitaire)
                    VALUES (@id_lot, @date_vente, @nombre_oeufs, @prix_unitaire);
                    SELECT SCOPE_IDENTITY() AS id`);

        const revenu = nombre_oeufs * prix_unitaire;

        res.status(201).json({
            success: true,
            data: {
                id_vente: result.recordset[0].id,
                id_lot,
                date_vente,
                nombre_oeufs,
                prix_unitaire,
                revenu_total: revenu
            }
        });
    } catch (error) {
        console.error('Erreur create vente oeuf:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Supprimer une vente
const deleteVente = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM VenteOeuf WHERE id_vente = @id`);
        res.json({ success: true, message: 'Vente supprimée' });
    } catch (error) {
        console.error('Erreur delete vente oeuf:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getAll, getByLot, create, delete: deleteVente };
