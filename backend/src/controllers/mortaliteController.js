const { getConnection, sql } = require('../config/database');

// Récupérer toutes les mortalités
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT m.*, l.date_entree, r.nom_race
                    FROM Mortalite m
                    INNER JOIN Lot l ON m.id_lot = l.id_lot
                    INNER JOIN Race r ON l.id_race = r.id_race
                    ORDER BY m.date_mort DESC`);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getAll mortalités:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Récupérer les mortalités par lot
const getByLot = async (req, res) => {
    try {
        const { id_lot } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .query(`SELECT * FROM Mortalite 
                    WHERE id_lot = @id_lot 
                    ORDER BY date_mort DESC`);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getByLot mortalités:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Créer une entrée de mortalité
const create = async (req, res) => {
    try {
        const { id_lot, date_mort, nombre } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_lot', sql.Int, id_lot)
            .input('date_mort', sql.Date, date_mort)
            .input('nombre', sql.Int, nombre)
            .query(`INSERT INTO Mortalite (id_lot, date_mort, nombre) 
                    VALUES (@id_lot, @date_mort, @nombre); 
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({
            success: true,
            data: {
                id_mortalite: result.recordset[0].id,
                id_lot,
                date_mort,
                nombre
            }
        });
    } catch (error) {
        console.error('Erreur create mortalité:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Supprimer une entrée de mortalité
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Mortalite WHERE id_mortalite = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Mortalité non trouvée'
            });
        }
        
        res.json({
            success: true,
            message: 'Mortalité supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur delete mortalité:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAll,
    getByLot,
    create,
    delete: deleteItem
};
