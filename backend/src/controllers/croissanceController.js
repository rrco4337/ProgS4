const { getConnection, sql } = require('../config/database');

// Récupérer toutes les données de croissance
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT c.*, r.nom_race
                    FROM Croissance c
                    INNER JOIN Race r ON c.id_race = r.id_race
                    ORDER BY c.id_race, c.semaine`);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getAll croissance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Récupérer la croissance par race
const getByRace = async (req, res) => {
    try {
        const { id_race } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .query(`SELECT c.*, r.nom_race
                    FROM Croissance c
                    INNER JOIN Race r ON c.id_race = r.id_race
                    WHERE c.id_race = @id_race
                    ORDER BY c.semaine`);
        
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getByRace:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Créer une entrée de croissance
const create = async (req, res) => {
    try {
        const { id_race, semaine, gain_poids, nourriture } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .input('semaine', sql.Int, semaine)
            .input('gain_poids', sql.Int, gain_poids)
            .input('nourriture', sql.Int, nourriture)
            .query(`INSERT INTO Croissance (id_race, semaine, gain_poids, nourriture) 
                    VALUES (@id_race, @semaine, @gain_poids, @nourriture); 
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({
            success: true,
            data: {
                id_croissance: result.recordset[0].id,
                id_race,
                semaine,
                gain_poids,
                nourriture
            }
        });
    } catch (error) {
        console.error('Erreur create croissance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Mettre à jour une entrée de croissance
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_race, semaine, gain_poids, nourriture } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('id_race', sql.Int, id_race)
            .input('semaine', sql.Int, semaine)
            .input('gain_poids', sql.Int, gain_poids)
            .input('nourriture', sql.Int, nourriture)
            .query(`UPDATE Croissance 
                    SET id_race = @id_race, 
                        semaine = @semaine, 
                        gain_poids = @gain_poids, 
                        nourriture = @nourriture
                    WHERE id_croissance = @id`);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Donnée de croissance non trouvée'
            });
        }
        
        res.json({
            success: true,
            data: { id_croissance: id, id_race, semaine, gain_poids, nourriture }
        });
    } catch (error) {
        console.error('Erreur update croissance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Supprimer une entrée de croissance
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Croissance WHERE id_croissance = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Donnée de croissance non trouvée'
            });
        }
        
        res.json({
            success: true,
            message: 'Donnée de croissance supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur delete croissance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAll,
    getByRace,
    create,
    update,
    delete: deleteItem
};
