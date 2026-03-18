const { getConnection, sql } = require('../config/database');
const cron = require('node-cron');

class AutoIncubationService {
    constructor() {
        this.cronJob = null;
        this.isRunning = false;
    }

    // Fonction pour traiter automatiquement les éclosions dues
    async processAutoEclosions() {
        if (this.isRunning) {
            console.log('Traitement d\'éclosions automatiques déjà en cours, ignoré...');
            return { success: true, message: 'Traitement déjà en cours' };
        }

        this.isRunning = true;
        console.log('🥚 Début du traitement automatique des éclosions...');
        
        try {
            const pool = await getConnection();
            const today = new Date().toISOString().split('T')[0];

            // Récupérer toutes les incubations en cours qui ont atteint leur date d'éclosion
            const incubationsResult = await pool.request()
                .input('today', sql.Date, today)
                .query(`
                    SELECT i.*, o.id_lot, l.id_race, r.nom_race
                    FROM Incubation i
                    INNER JOIN Oeuf o ON i.id_oeuf = o.id_oeuf
                    INNER JOIN Lot l ON o.id_lot = l.id_lot
                    INNER JOIN Race r ON l.id_race = r.id_race
                    WHERE i.statut = 'en_cours' 
                    AND i.date_eclosion_prevue <= @today
                    ORDER BY i.date_eclosion_prevue ASC
                `);

            const incubationsATraiter = incubationsResult.recordset;
            
            if (incubationsATraiter.length === 0) {
                console.log('✅ Aucune incubation à traiter');
                return { 
                    success: true, 
                    message: 'Aucune incubation à traiter',
                    processed: 0 
                };
            }

            console.log(`📋 ${incubationsATraiter.length} incubation(s) à traiter automatiquement`);
            
            const results = [];
            
            for (const incubation of incubationsATraiter) {
                try {
                    console.log(`🐣 Traitement incubation #${incubation.id_incubation} (${incubation.nombre_oeufs} œufs, race: ${incubation.nom_race})`);
                    
                    // Créer le nouveau lot de poussins
                    const lotResult = await pool.request()
                        .input('id_race', sql.Int, incubation.id_race)
                        .input('date_entree', sql.Date, today)
                        .input('nombre_initial', sql.Int, incubation.nombre_oeufs)
                        .input('cout_achat', sql.Decimal(12, 2), 0)
                        .input('id_incubation', sql.Int, incubation.id_incubation) // pour référencer l'origine
                        .query(`
                            INSERT INTO Lot (id_race, date_entree, nombre_initial, cout_achat, id_incubation)
                            VALUES (@id_race, @date_entree, @nombre_initial, @cout_achat, @id_incubation);
                            SELECT SCOPE_IDENTITY() AS id
                        `);

                    const idLotResultat = lotResult.recordset[0].id;

                    // Mettre à jour l'incubation
                    await pool.request()
                        .input('id_incubation', sql.Int, incubation.id_incubation)
                        .input('id_lot_resultat', sql.Int, idLotResultat)
                        .input('today', sql.Date, today)
                        .query(`
                            UPDATE Incubation
                            SET statut = 'eclot_auto', 
                                id_lot_resultat = @id_lot_resultat,
                                date_eclosion_reelle = @today
                            WHERE id_incubation = @id_incubation
                        `);

                    results.push({
                        id_incubation: incubation.id_incubation,
                        id_lot_resultat: idLotResultat,
                        nombre_poussins: incubation.nombre_oeufs,
                        race: incubation.nom_race,
                        status: 'success'
                    });

                    console.log(`✅ Éclosion automatique réussie: Lot #${idLotResultat} avec ${incubation.nombre_oeufs} poussins (${incubation.nom_race})`);
                    
                } catch (error) {
                    console.error(`❌ Erreur lors de l'éclosion automatique de l'incubation #${incubation.id_incubation}:`, error);
                    results.push({
                        id_incubation: incubation.id_incubation,
                        error: error.message,
                        status: 'error'
                    });
                }
            }

            const successful = results.filter(r => r.status === 'success').length;
            const failed = results.filter(r => r.status === 'error').length;
            
            console.log(`🎯 Traitement terminé: ${successful} éclosions réussies, ${failed} échec(s)`);
            
            return {
                success: true,
                message: `Traitement automatique terminé: ${successful} éclosions réussies, ${failed} échec(s)`,
                processed: successful,
                failed: failed,
                results: results
            };

        } catch (error) {
            console.error('❌ Erreur globale lors du traitement automatique des éclosions:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            this.isRunning = false;
        }
    }

    // Démarrer le cron job (toutes les 6 heures à 6h, 12h, 18h, 0h)
    startCronJob() {
        if (this.cronJob) {
            console.log('⏰ Cron job d\'éclosion automatique déjà démarré');
            return;
        }

        // Cron à 6h, 12h, 18h et minuit tous les jours
        this.cronJob = cron.schedule('0 0,6,12,18 * * *', async () => {
            console.log('⏰ Déclenchement automatique du traitement des éclosions');
            await this.processAutoEclosions();
        }, {
            scheduled: true,
            timezone: "Europe/Paris"
        });

        console.log('🕐 Cron job d\'éclosion automatique démarré (4 fois par jour: 0h, 6h, 12h, 18h)');
    }

    // Arrêter le cron job
    stopCronJob() {
        if (this.cronJob) {
            this.cronJob.destroy();
            this.cronJob = null;
            console.log('⏹️ Cron job d\'éclosion automatique arrêté');
        }
    }

    // Obtenir le statut du service
    getStatus() {
        return {
            cronJobActive: !!this.cronJob,
            isProcessing: this.isRunning,
            nextRuns: this.cronJob ? [
                '00:00', '06:00', '12:00', '18:00'
            ] : []
        };
    }
}

// Instance singleton
const autoIncubationService = new AutoIncubationService();

module.exports = {
    autoIncubationService,
    AutoIncubationService
};