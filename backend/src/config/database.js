const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

const getConnection = async () => {
    try {
        if (pool) {
            return pool;
        }
        pool = await sql.connect(config);
        console.log('✅ Connexion à SQL Server réussie');
        return pool;
    } catch (error) {
        console.error('❌ Erreur de connexion à SQL Server:', error.message);
        throw error;
    }
};

const closeConnection = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Connexion à SQL Server fermée');
        }
    } catch (error) {
        console.error('Erreur lors de la fermeture de la connexion:', error.message);
    }
};

module.exports = {
    sql,
    getConnection,
    closeConnection
};
