const { getConnection, sql } = require('../config/database');

// Récupérer tous les éléments
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query('SELECT * FROM Examples'); // Remplacez par votre table
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getAll:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Récupérer un élément par ID
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Examples WHERE id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Élément non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Erreur getById:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Créer un nouvel élément
const create = async (req, res) => {
    try {
        const { name, description } = req.body; // Adaptez selon vos champs
        const pool = await getConnection();
        const result = await pool.request()
            .input('name', sql.VarChar, name)
            .input('description', sql.VarChar, description)
            .query('INSERT INTO Examples (name, description) VALUES (@name, @description); SELECT SCOPE_IDENTITY() AS id');
        
        res.status(201).json({
            success: true,
            data: {
                id: result.recordset[0].id,
                name,
                description
            }
        });
    } catch (error) {
        console.error('Erreur create:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Mettre à jour un élément
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.VarChar, name)
            .input('description', sql.VarChar, description)
            .query('UPDATE Examples SET name = @name, description = @description WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Élément non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: { id, name, description }
        });
    } catch (error) {
        console.error('Erreur update:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Supprimer un élément
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Examples WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Élément non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: 'Élément supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur delete:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteItem
};
