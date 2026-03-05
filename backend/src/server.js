const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { getConnection, closeConnection } = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Route de test
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Le serveur fonctionne correctement',
        timestamp: new Date().toISOString()
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée',
        path: req.path 
    });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Erreur:', err.stack);
    res.status(500).json({ 
        error: 'Erreur serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

// Démarrage du serveur
const startServer = async () => {
    try {
        // Test de connexion à la base de données
        await getConnection();
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`📡 API: http://localhost:${PORT}/api\n`);
        });
    } catch (error) {
        console.error('❌ Impossible de démarrer le serveur:', error.message);
        process.exit(1);
    }
};

// Gestion de l'arrêt gracieux
process.on('SIGINT', async () => {
    console.log('\n⚠️  Arrêt du serveur...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⚠️  Arrêt du serveur...');
    await closeConnection();
    process.exit(0);
});

startServer();
