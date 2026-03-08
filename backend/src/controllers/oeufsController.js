const { getConnection, sql } = require('../config/database');

// Récupérer toutes les récoltes d'oeufs
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT o.*, l.date_entree, r.nom_race
                    FROM Oeuf o
                    INNER JOIN Lot l ON o.id_lot = l.id_lot
                    INNER JOIN Race r ON l.id_race = r.id_race
                    ORDER BY o.date_recolte DESC`);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Erreur getAll oeufs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Récoltes par lot
const getByLot = async (req, res) => {
    try {
        const { id_lot } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .query(`SELECT * FROM Oeuf WHERE id_lot = @id_lot ORDER BY date_recolte DESC`);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Erreur getByLot oeufs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Enregistrer une récolte
const create = async (req, res) => {
    try {
        const { id_lot, date_recolte, nombre } = req.body;

        if (!id_lot || !date_recolte || !nombre) {
            return res.status(400).json({ success: false, error: 'Champs id_lot, date_recolte et nombre requis' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .input('date_recolte', sql.Date, date_recolte)
            .input('nombre', sql.Int, nombre)
            .query(`INSERT INTO Oeuf (id_lot, date_recolte, nombre)
                    VALUES (@id_lot, @date_recolte, @nombre);
                    SELECT SCOPE_IDENTITY() AS id`);

        res.status(201).json({
            success: true,
            data: {
                id_oeuf: result.recordset[0].id,
                id_lot,
                date_recolte,
                nombre
            }
        });
    } catch (error) {
        console.error('Erreur create oeuf:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Stock disponible par lot
// stock = total récolté - total incubé (en cours ou éclose) - total vendu
const getStockByLot = async (req, res) => {
    try {
        const { id_lot } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .query(`
                SELECT
                    COALESCE((SELECT SUM(o.nombre)        FROM Oeuf o WHERE o.id_lot = @id_lot), 0) AS total_recolte,
                    COALESCE((SELECT SUM(i.nombre_oeufs)  FROM Incubation i INNER JOIN Oeuf o2 ON i.id_oeuf = o2.id_oeuf WHERE o2.id_lot = @id_lot), 0) AS total_incube,
                    COALESCE((SELECT SUM(v.nombre_oeufs)  FROM VenteOeuf v WHERE v.id_lot = @id_lot), 0) AS total_vendu
            `);
        const row = result.recordset[0];
        const stock_disponible = row.total_recolte - row.total_incube - row.total_vendu;
        res.json({
            success: true,
            data: {
                id_lot: parseInt(id_lot),
                total_recolte: row.total_recolte,
                total_incube: row.total_incube,
                total_vendu: row.total_vendu,
                stock_disponible
            }
        });
    } catch (error) {
        console.error('Erreur getStockByLot:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Supprimer une récolte
const deleteOeuf = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM Oeuf WHERE id_oeuf = @id`);
        res.json({ success: true, message: 'Récolte supprimée' });
    } catch (error) {
        console.error('Erreur delete oeuf:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getAll, getByLot, getStockByLot, create, delete: deleteOeuf };
