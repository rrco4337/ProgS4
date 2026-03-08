const express = require('express');
const router = express.Router();

const raceController = require('../controllers/raceController');
const lotController = require('../controllers/lotController');
const croissanceController = require('../controllers/croissanceController');
const mortaliteController = require('../controllers/mortaliteController');
const oeufsController = require('../controllers/oeufsController');
const incubationController = require('../controllers/incubationController');
const venteOeufController = require('../controllers/venteOeufController');

// Routes pour les races
router.get('/races', raceController.getAll);
router.get('/races/:id', raceController.getById);
router.get('/races/:id/croissance', raceController.getCroissance);
router.post('/races', raceController.create);
router.put('/races/:id', raceController.update);
router.delete('/races/:id', raceController.delete);

// Routes pour les lots
router.get('/lots', lotController.getAll);
router.get('/lots/situation-globale', lotController.getSituationGlobale);
router.get('/lots/:id', lotController.getById);
router.get('/lots/:id/poids', lotController.getPoidsActuel);
router.post('/lots', lotController.create);
router.put('/lots/:id', lotController.update);
router.delete('/lots/:id', lotController.delete);

// Routes pour la croissance
router.get('/croissance', croissanceController.getAll);
router.get('/croissance/race/:id_race', croissanceController.getByRace);
router.post('/croissance', croissanceController.create);
router.put('/croissance/:id', croissanceController.update);
router.delete('/croissance/:id', croissanceController.delete);

// Routes pour les mortalités
router.get('/mortalites', mortaliteController.getAll);
router.get('/mortalites/lot/:id_lot', mortaliteController.getByLot);
router.post('/mortalites', mortaliteController.create);
router.delete('/mortalites/:id', mortaliteController.delete);

// Routes pour les œufs (récoltes)
router.get('/oeufs', oeufsController.getAll);
router.get('/oeufs/stock/:id_lot', oeufsController.getStockByLot);
router.get('/oeufs/lot/:id_lot', oeufsController.getByLot);
router.post('/oeufs', oeufsController.create);
router.delete('/oeufs/:id', oeufsController.delete);

// Routes pour les incubations
router.get('/incubations', incubationController.getAll);
router.post('/incubations', incubationController.create);
router.post('/incubations/:id/ecloter', incubationController.ecloter);
router.delete('/incubations/:id', incubationController.delete);

// Routes pour les ventes d'œufs
router.get('/ventes-oeufs', venteOeufController.getAll);
router.get('/ventes-oeufs/lot/:id_lot', venteOeufController.getByLot);
router.post('/ventes-oeufs', venteOeufController.create);
router.delete('/ventes-oeufs/:id', venteOeufController.delete);

module.exports = router;
