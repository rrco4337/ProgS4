const { getConnection, sql } = require('../config/database');

// Récupérer toutes les races
const getAll = async (req, res) => {
    try {
        const pool = await getConnection();
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

// Récupérer une race par ID
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Race WHERE id_race = @id');
        
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

// Récupérer le modèle de croissance d'une race
const getCroissance = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
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
        const { nom_race, pu_sakafo_g, pv_g, pv_oeuf, semaine_debut_ponte, duree_incubation } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('nom_race', sql.VarChar, nom_race)
            .input('pu_sakafo_g', sql.Decimal(10, 2), pu_sakafo_g)
            .input('pv_g', sql.Decimal(10, 2), pv_g)
            .input('pv_oeuf', sql.Decimal(10, 2), pv_oeuf)
            .input('semaine_debut_ponte', sql.Int, semaine_debut_ponte)
            .input('duree_incubation', sql.Int, duree_incubation)
            .query(`INSERT INTO Race (nom_race, pu_sakafo_g, pv_g, pv_oeuf, semaine_debut_ponte, duree_incubation) 
                    VALUES (@nom_race, @pu_sakafo_g, @pv_g, @pv_oeuf, @semaine_debut_ponte, @duree_incubation); 
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({
            success: true,
            data: {
                id_race: result.recordset[0].id,
                nom_race,
                pu_sakafo_g,
                pv_g,
                pv_oeuf,
                semaine_debut_ponte,
                duree_incubation
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
        const { nom_race, pu_sakafo_g, pv_g, pv_oeuf, semaine_debut_ponte, duree_incubation } = req.body;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('nom_race', sql.VarChar, nom_race)
            .input('pu_sakafo_g', sql.Decimal(10, 2), pu_sakafo_g)
            .input('pv_g', sql.Decimal(10, 2), pv_g)
            .input('pv_oeuf', sql.Decimal(10, 2), pv_oeuf)
            .input('semaine_debut_ponte', sql.Int, semaine_debut_ponte)
            .input('duree_incubation', sql.Int, duree_incubation)
            .query(`UPDATE Race 
                    SET nom_race = @nom_race, 
                        pu_sakafo_g = @pu_sakafo_g, 
                        pv_g = @pv_g, 
                        pv_oeuf = @pv_oeuf,
                        semaine_debut_ponte = @semaine_debut_ponte,
                        duree_incubation = @duree_incubation
                    WHERE id_race = @id`);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Race non trouvée'
            });
        }
        
        res.json({
            success: true,
            data: { id_race: id, nom_race, pu_sakafo_g, pv_g, pv_oeuf, semaine_debut_ponte, duree_incubation }
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
