const { getConnection, sql } = require('../config/database');

// FONCTION 1: Recuperer tous les lots avec leurs infos de race
// Cette fonction affiche la liste complete de tous les groupes d'animaux
const getAll = async (req, res) => {
    try {
        // On se connecte a la base de donnees
        const pool = await getConnection();
        // On fait une requete pour recuperer tous les lots avec les infos de leur race
        // On joint la table Lot avec la table Race pour avoir toutes les infos
        const result = await pool.request()
            .query(`SELECT l.*, r.nom_race, r.pu_sakafo_g, r.pv_g, r.pv_oeuf
                    FROM Lot l
                    INNER JOIN Race r ON l.id_race = r.id_race
                    ORDER BY l.date_entree DESC`);
        
        // On renvoie les donnees au client sous forme JSON
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Erreur getAll lots:', error);
        // Si erreur, on renvoie un message d'erreur au client
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// FONCTION 2: Recuperer un lot specifique par son numero
// Utile pour voir les details d'un seul groupe d'animaux
const getById = async (req, res) => {
    try {
        // On recupere le numero du lot demande dans l'URL
        const { id } = req.params;
        const pool = await getConnection();
        // On cherche le lot avec ce numero specifique
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT l.*, r.nom_race, r.pu_sakafo_g, r.pv_g, r.pv_oeuf
                    FROM Lot l
                    INNER JOIN Race r ON l.id_race = r.id_race
                    WHERE l.id_lot = @id`);
        
        // Si on ne trouve pas le lot, on renvoie une erreur 404
        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lot non trouvé'
            });
        }
        
        // Si trouve, on renvoie les infos du lot
        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Erreur getById lot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// FONCTION HELPER: Calculer la situation complete d'un lot
// Cette fonction fait tous les calculs pour connaitre l'etat financier d'un groupe
async function _calculerSituationLot(pool, id, dateSituation = null) {
    // ETAPE 1: Recuperer les infos de base du lot
    const lotResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT l.*, r.nom_race, r.pu_sakafo_g, r.pv_g, r.pv_oeuf
                FROM Lot l
                INNER JOIN Race r ON l.id_race = r.id_race
                WHERE l.id_lot = @id`);

    // Si le lot n'existe pas, on arrete ici
    if (lotResult.recordset.length === 0) return null;
    const lot = lotResult.recordset[0];

    // ETAPE 2: Calculer l'age du lot en semaines
    const dateEntree = new Date(lot.date_entree);
    // Utiliser la date fournie ou aujourd'hui
    const dateCalcul = dateSituation ? new Date(dateSituation) : new Date();
    // IMPORTANT: Normaliser les deux dates en UTC pur (annee, mois, jour)
    // pour eviter les decalages de fuseau horaire entre SQL Server et JavaScript
    const dateEntreeUTC = Date.UTC(dateEntree.getFullYear(), dateEntree.getMonth(), dateEntree.getDate());
    const dateCalculUTC = Date.UTC(dateCalcul.getFullYear(), dateCalcul.getMonth(), dateCalcul.getDate());
    const diffJours = Math.round((dateCalculUTC - dateEntreeUTC) / (1000 * 60 * 60 * 24));
    // On divise par 7 pour avoir les semaines, minimum 0
    const ageEnSemaines = Math.max(0, Math.floor(diffJours / 7));
    // Nombre de jours ecoules dans la semaine en cours (0 = debut de semaine)
    const joursRestants = Math.max(0, diffJours - ageEnSemaines * 7);
    // Fraction de la semaine en cours (0.0 a 0.857)
    const fractionSemaine = joursRestants / 7;

    // ETAPE 3: Recuperer les donnees de croissance pour cette race
    // Ces donnees disent combien les animaux grossissent chaque semaine
    const croissanceResult = await pool.request()
        .input('id_race', sql.Int, lot.id_race)
        .query(`SELECT * FROM Croissance WHERE id_race = @id_race ORDER BY semaine`);
    const croissance = croissanceResult.recordset;

    // ETAPE 4: Calculer combien d'animaux sont morts JUSQU'A la date de situation
    // On ne compte que les mortalites dont la date_mort <= date de calcul
    // Exemple: si on regarde la situation au 31 janvier, les morts du 1er fevrier ne comptent pas
    const mortaliteResult = await pool.request()
        .input('id_lot', sql.Int, id)
        .input('dateMort', sql.Date, dateCalcul)
        .query(`SELECT ISNULL(SUM(nombre), 0) as total_morts FROM Mortalite WHERE id_lot = @id_lot AND date_mort <= @dateMort`);
    const totalMorts = mortaliteResult.recordset[0].total_morts;
    // Le nombre actuel = nombre initial - les morts (a cette date)
    const nombreActuel = lot.nombre_initial - totalMorts;

    // ETAPE 4B: Calculer les pertes d'oeufs issues de l'incubation d'origine
    // Elles ne sont pas des mortalites animales. Elles deviennent une perte financiere
    // a partir de la date d'eclosion de l'incubation qui a genere le lot.
    let perteOeufs = 0;
    let valeurPerteOeufs = 0;
    if (lot.id_incubation) {
        const perteOeufsResult = await pool.request()
            .input('id_incubation', sql.Int, lot.id_incubation)
            .input('dateSituation', sql.Date, dateCalcul)
            .query(`SELECT
                        ISNULL(oeufs_pourris, 0) AS oeufs_pourris,
                        CASE
                            WHEN COALESCE(date_eclosion_reelle, date_eclosion_prevue) <= @dateSituation THEN 1
                            ELSE 0
                        END AS perte_active
                    FROM Incubation
                    WHERE id_incubation = @id_incubation`);

        if (perteOeufsResult.recordset.length && perteOeufsResult.recordset[0].perte_active === 1) {
            perteOeufs = perteOeufsResult.recordset[0].oeufs_pourris || 0;
            valeurPerteOeufs = perteOeufs * (lot.pv_oeuf || 0);
        }
    }

    // ETAPE 5: Variables pour calculer les totaux au fil des semaines
    let poidsCumule = 0;          // Poids total accumule
    let nourritureCumulee = 0;    // Nourriture totale donnee
    let coutNourritureCumulee = 0; // Cout total de la nourriture
    const detail = [];            // Tableau pour stocker le detail semaine par semaine

    // ETAPE 6: Boucle pour calculer TOUTES les semaines (S0 a S25)
    // On parcourt toutes les semaines de croissance, pas seulement jusqu'a l'age actuel
    for (let i = 0; i <= croissance.length - 1; i++) {
        // Calcul du poids: si premiere semaine, on prend le gain direct, sinon on ajoute
        poidsCumule = i === 0 ? croissance[i].gain_poids : poidsCumule + croissance[i].gain_poids;
        // On ajoute la nourriture de cette semaine
        nourritureCumulee += croissance[i].nourriture;

        // Determiner si cette semaine est passee, en cours, ou future
        const estFutur = i > ageEnSemaines;

        // Nourriture pour tout le lot = nourriture par animal x nombre d'animaux
        const nourritureLot = croissance[i].nourriture * nombreActuel;
        // Cout de la nourriture cette semaine = quantite x prix au gramme
        const coutSemaine = nourritureLot * lot.pu_sakafo_g;

        // INTERPOLATION AU JOUR: on calcule le cout au prorata des jours ecoules
        // Semaines passees = cout complet, semaine en cours = fraction, futures = 0
        if (i < ageEnSemaines) {
            coutNourritureCumulee += coutSemaine;
        } else if (i === ageEnSemaines) {
            coutNourritureCumulee += coutSemaine * fractionSemaine;
        }

        // On sauvegarde tous ces calculs pour cette semaine
        detail.push({
            semaine: croissance[i].semaine,
            gain_poids: croissance[i].gain_poids,
            poids_cumule: poidsCumule,
            nourriture: croissance[i].nourriture,
            nourriture_cumulee: nourritureCumulee,
            nourriture_lot: nourritureLot,
            cout_nourriture_semaine: coutSemaine,
            cout_nourriture_cumulee: coutNourritureCumulee,
            est_futur: estFutur
        });
    }

    // ETAPE 7: Calculs des totaux finaux AVEC INTERPOLATION AU JOUR
    // Au lieu de prendre le poids d'un palier de semaine, on interpole entre
    // la semaine precedente et la semaine actuelle selon les jours ecoules
    const semaineActuelleIndex = Math.min(ageEnSemaines, croissance.length - 1);
    let poidsActuel;
    if (ageEnSemaines === 0 || semaineActuelleIndex === 0) {
        // Semaine 0 = poids initial a l'achat, pas d'interpolation possible
        poidsActuel = detail[0] ? detail[0].poids_cumule : 0;
    } else {
        // Interpoler lineairement entre le poids de fin de semaine precedente
        // et le poids de fin de semaine actuelle, selon la fraction de jours
        const poidsPrecedent = detail[semaineActuelleIndex - 1].poids_cumule;
        const poidsSemaine = detail[semaineActuelleIndex].poids_cumule;
        poidsActuel = Math.round(poidsPrecedent + (poidsSemaine - poidsPrecedent) * fractionSemaine);
    }
    // Poids total du lot = poids par animal x nombre d'animaux vivants
    const poidsTotal = poidsActuel * nombreActuel;

    // Nourriture interpolee au jour (meme logique que le poids)
    let nourritureActuelle;
    if (semaineActuelleIndex === 0) {
        nourritureActuelle = detail[0] ? detail[0].nourriture * fractionSemaine : 0;
    } else {
        const nourriturePrev = detail[semaineActuelleIndex - 1].nourriture_cumulee;
        const nourritureSem = detail[semaineActuelleIndex] ? detail[semaineActuelleIndex].nourriture : 0;
        nourritureActuelle = nourriturePrev + nourritureSem * fractionSemaine;
    }
    const nourritureTotaleG = nourritureActuelle * nombreActuel;

    // ETAPE 8: Recuperer le nombre d'oeufs pondus par ce lot jusqu'à cette date
    const oeufsResult = await pool.request()
        .input('id_oeufs', sql.Int, id)
        .input('dateRecolte', sql.Date, dateCalcul)
        .query(`SELECT ISNULL(SUM(nombre), 0) AS total_oeufs 
                FROM Oeuf 
                WHERE id_lot = @id_oeufs AND date_recolte <= @dateRecolte`);
    const totalOeufs = oeufsResult.recordset[0].total_oeufs;

    // ETAPE 9: Calculs financiers - TRES IMPORTANT pour connaitre si on gagne ou perd
    // Valeur des poulets = nombre x poids actuel x prix par gramme
    const valeurPoulets = nombreActuel * poidsActuel * (lot.pv_g || 0);
    // Valeur des oeufs = nombre d'oeufs x prix par oeuf
    const valeurOeufs   = totalOeufs   * (lot.pv_oeuf || 0);
    // Benefice = ce qu'on peut vendre - ce qu'on a depense
    const benefice      = valeurPoulets + valeurOeufs - valeurPerteOeufs - coutNourritureCumulee - (lot.cout_achat || 0);

    // ETAPE 10: On renvoie toutes les informations calculees dans un objet
    return {
        id_lot: lot.id_lot,                    // Numero du lot
        nom_race: lot.nom_race,                // Nom de la race
        date_entree: lot.date_entree,          // Quand les animaux sont arrives
        date_situation: dateCalcul.toISOString().split('T')[0], // Date du calcul
        age_semaines: ageEnSemaines,           // Age en semaines entieres
        age_jours: diffJours,                  // Age total en jours
        jours_dans_semaine: joursRestants,     // Jours ecoules dans la semaine en cours
        nombre_initial: lot.nombre_initial,     // Combien il y avait au debut
        nombre_actuel: nombreActuel,           // Combien il en reste
        mortalites: totalMorts,                // Combien sont morts
        cout_achat: lot.cout_achat || 0,       // Ce qu'on a paye pour les acheter
        poids_unitaire: poidsActuel,           // Poids moyen d'un animal
        poids_total: poidsTotal,               // Poids total du lot
        pu_sakafo_g: lot.pu_sakafo_g,         // Prix de la nourriture par gramme
        pv_g: lot.pv_g || 0,                  // Prix de vente par gramme d'animal
        pv_oeuf: lot.pv_oeuf || 0,            // Prix de vente d'un oeuf
        nourriture_cumulee: nourritureCumulee, // Nourriture par animal
        nourriture_totale_g: nourritureTotaleG, // Nourriture pour tout le lot
        cout_nourriture_total: coutNourritureCumulee, // Cout total nourriture
        total_oeufs: totalOeufs,              // Nombre total d'oeufs pondus
        perte_oeufs: perteOeufs,              // Oeufs pourris a l'eclosion
        valeur_perte_oeufs: valeurPerteOeufs, // Valorisation financiere de la perte d'oeufs
        valeur_poulets: valeurPoulets,        // Valeur de vente des poulets
        valeur_oeufs: valeurOeufs,            // Valeur de vente des oeufs
        benefice,                             // Benefice ou perte
        nb_femelles: lot.nb_femelles ?? null, // Nb femelles (si lot issu d'incubation avec sexage)
        nb_males: lot.nb_males ?? null,       // Nb mâles
        detail_croissance: detail             // Detail semaine par semaine
    };
}

// FONCTION 3: Calculer le poids et la situation actuelle d'un lot
// Cette fonction utilise la fonction helper pour faire tous les calculs
const getPoidsActuel = async (req, res) => {
    try {
        // On recupere le numero du lot demande et la date de situation optionnelle
        const { id } = req.params;
        const { dateSituation } = req.query;
        const pool = await getConnection();
        
        // On verifie d'abord que le lot existe
        const lotResult = await pool.request()
            .input('id', sql.Int, id)
            .query(`SELECT l.*, r.nom_race, r.pu_sakafo_g, r.pv_g, r.pv_oeuf
                    FROM Lot l
                    INNER JOIN Race r ON l.id_race = r.id_race
                    WHERE l.id_lot = @id`);
        
        // Si le lot n'existe pas, erreur 404
        if (lotResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lot non trouvé'
            });
        }
        
        // On utilise la fonction helper pour calculer toute la situation
        const situation = await _calculerSituationLot(pool, id, dateSituation);
        if (!situation) {
            return res.status(404).json({ success: false, error: 'Lot non trouvé' });
        }
        // On renvoie toutes les informations calculees
        res.json({ success: true, data: situation });
    } catch (error) {
        console.error('Erreur getPoidsActuel:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// FONCTION 4: Situation financiere globale de TOUS les lots
// Cette fonction donne un resume de tous les groupes d'animaux
const getSituationGlobale = async (req, res) => {
    try {
        const { dateSituation } = req.query;
        const pool = await getConnection();
        // On recupere les numeros de tous les lots
        const lotsResult = await pool.request()
            .query(`SELECT id_lot FROM Lot ORDER BY id_lot`);
        const ids = lotsResult.recordset.map(r => r.id_lot);

        // ASTUCE: On calcule tous les lots en meme temps pour aller plus vite
        const situations = await Promise.all(ids.map(id => _calculerSituationLot(pool, id, dateSituation)));
        const valides = situations.filter(Boolean);

        const total_benefice          = valides.reduce((s, l) => s + l.benefice, 0);
        const total_valeur_poulets    = valides.reduce((s, l) => s + l.valeur_poulets, 0);
        const total_valeur_oeufs      = valides.reduce((s, l) => s + l.valeur_oeufs, 0);
        const total_cout_nourriture   = valides.reduce((s, l) => s + l.cout_nourriture_total, 0);
        const total_cout_achat        = valides.reduce((s, l) => s + l.cout_achat, 0);
        const total_poulets_actuel    = valides.reduce((s, l) => s + l.nombre_actuel, 0);
        const total_oeufs             = valides.reduce((s, l) => s + l.total_oeufs, 0);
        const lots_en_benefice        = valides.filter(l => l.benefice >= 0).length;
        const lots_en_perte           = valides.filter(l => l.benefice < 0).length;

        const detail_lots = valides.map(l => ({
            id_lot:               l.id_lot,
            nom_race:             l.nom_race,
            date_entree:          l.date_entree,
            nombre_actuel:        l.nombre_actuel,
            mortalites:           l.mortalites,
            total_oeufs:          l.total_oeufs,
            perte_oeufs:           l.perte_oeufs,
            valeur_perte_oeufs:    l.valeur_perte_oeufs,
            valeur_poulets:       l.valeur_poulets,
            valeur_oeufs:         l.valeur_oeufs,
            cout_nourriture_total:l.cout_nourriture_total,
            cout_achat:           l.cout_achat,
            benefice:             l.benefice
        }));

        const dateCalcul = dateSituation ? new Date(dateSituation) : new Date();
        res.json({
            success: true,
            data: {
                date_situation: dateCalcul.toISOString().split('T')[0],
                nombre_lots: valides.length,
                lots_en_benefice,
                lots_en_perte,
                total_poulets_actuel,
                total_oeufs,
                total_valeur_poulets,
                total_valeur_oeufs,
                total_cout_nourriture,
                total_cout_achat,
                total_benefice,
                detail_lots
            }
        });
    } catch (error) {
        console.error('Erreur getSituationGlobale:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Créer un nouveau lot
const create = async (req, res) => {
    try {
        const { id_race, date_entree, nombre_initial, cout_achat, nb_femelles, nb_males } = req.body;
        const nombreInitialVal = parseInt(nombre_initial, 10);
        const nbFemellesVal = nb_femelles != null ? parseInt(nb_femelles, 10) : nombreInitialVal;
        const nbMalesVal = nb_males != null ? parseInt(nb_males, 10) : 0;

        if (nbFemellesVal < 0 || nbMalesVal < 0) {
            return res.status(400).json({
                success: false,
                error: 'Le nombre de femelles et de mâles doit être positif'
            });
        }

        if (nbFemellesVal + nbMalesVal !== nombreInitialVal) {
            return res.status(400).json({
                success: false,
                error: 'La somme femelles + mâles doit être égale au nombre initial'
            });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('id_race', sql.Int, id_race)
            .input('date_entree', sql.Date, date_entree)
            .input('nombre_initial', sql.Int, nombreInitialVal)
            .input('cout_achat', sql.Decimal(12, 2), cout_achat)
            .input('nb_femelles', sql.Int, nbFemellesVal)
            .input('nb_males', sql.Int, nbMalesVal)
            .query(`INSERT INTO Lot (id_race, date_entree, nombre_initial, cout_achat, nb_femelles, nb_males) 
                    VALUES (@id_race, @date_entree, @nombre_initial, @cout_achat, @nb_femelles, @nb_males); 
                    SELECT SCOPE_IDENTITY() AS id`);
        
        res.status(201).json({
            success: true,
            data: {
                id_lot: result.recordset[0].id,
                id_race,
                date_entree,
                nombre_initial: nombreInitialVal,
                cout_achat,
                nb_femelles: nbFemellesVal,
                nb_males: nbMalesVal
            }
        });
    } catch (error) {
        console.error('Erreur create lot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Mettre à jour un lot
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_race, date_entree, nombre_initial, cout_achat, nb_femelles, nb_males } = req.body;
        const nombreInitialVal = parseInt(nombre_initial, 10);
        const nbFemellesVal = nb_femelles != null ? parseInt(nb_femelles, 10) : nombreInitialVal;
        const nbMalesVal = nb_males != null ? parseInt(nb_males, 10) : 0;

        if (nbFemellesVal < 0 || nbMalesVal < 0) {
            return res.status(400).json({
                success: false,
                error: 'Le nombre de femelles et de mâles doit être positif'
            });
        }

        if (nbFemellesVal + nbMalesVal !== nombreInitialVal) {
            return res.status(400).json({
                success: false,
                error: 'La somme femelles + mâles doit être égale au nombre initial'
            });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('id_race', sql.Int, id_race)
            .input('date_entree', sql.Date, date_entree)
            .input('nombre_initial', sql.Int, nombreInitialVal)
            .input('cout_achat', sql.Decimal(12, 2), cout_achat)
            .input('nb_femelles', sql.Int, nbFemellesVal)
            .input('nb_males', sql.Int, nbMalesVal)
            .query(`UPDATE Lot 
                    SET id_race = @id_race, 
                        date_entree = @date_entree, 
                        nombre_initial = @nombre_initial, 
                        cout_achat = @cout_achat,
                        nb_femelles = @nb_femelles,
                        nb_males = @nb_males
                    WHERE id_lot = @id`);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lot non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: {
                id_lot: id,
                id_race,
                date_entree,
                nombre_initial: nombreInitialVal,
                cout_achat,
                nb_femelles: nbFemellesVal,
                nb_males: nbMalesVal
            }
        });
    } catch (error) {
        console.error('Erreur update lot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Supprimer un lot
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Lot WHERE id_lot = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                error: 'Lot non trouvé'
            });
        }
        
        res.json({
            success: true,
            message: 'Lot supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur delete lot:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// FONCTION 6: Calculer le poids d'une poule selon la race et une periode
// Arguments: id_race, date_debut (date d'entree), date_fin (date de calcul)
// Retourne: le poids cumule en grammes a cette date
const getPoidPoule = async (req, res) => {
    try {
        const { id_race, date_debut, date_fin } = req.query;

        if (!id_race || !date_debut || !date_fin) {
            return res.status(400).json({
                success: false,
                error: 'Parametres manquants: id_race, date_debut et date_fin sont obligatoires'
            });
        }

        const pool = await getConnection();

        // Verifier que la race existe
        const raceResult = await pool.request()
            .input('id_race', sql.Int, id_race)
            .query(`SELECT * FROM Race WHERE id_race = @id_race`);

        if (raceResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Race non trouvée'
            });
        }
        const race = raceResult.recordset[0];

        const debut = new Date(date_debut);
        const fin = new Date(date_fin);
        const ageEnSemaines = Math.floor((fin - debut) / (1000 * 60 * 60 * 24 * 7));

        if (ageEnSemaines < 0) {
            return res.status(400).json({
                success: false,
                error: 'La date de fin doit être après la date de début'
            });
        }

        const croissanceResult = await pool.request()
            .input('id_race2', sql.Int, id_race)
            .query(`SELECT * FROM Croissance WHERE id_race = @id_race2 ORDER BY semaine`);
        const croissance = croissanceResult.recordset;

        let poidsCumule = 0;
        const semaineMax = Math.min(ageEnSemaines, croissance.length - 1);

        for (let i = 0; i <= semaineMax; i++) {
            poidsCumule += croissance[i].gain_poids;
        }

        res.json({
            success: true,
            data: {
                id_race: parseInt(id_race),
                nom_race: race.nom_race,
                date_debut: date_debut,
                date_fin: date_fin,
                age_semaines: ageEnSemaines,
                semaine_utilisee: semaineMax,
                poids_g: poidsCumule
            }
        });
    } catch (error) {
        console.error('Erreur getPoidPoule:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    getAll,
    getById,
    getPoidsActuel,
    getSituationGlobale,
    getPoidPoule,
    create,
    update,
    delete: deleteItem
};
