const express = require('express');
const router = express.Router();

const raceController = require('../controllers/raceController');
const lotController = require('../controllers/lotController');
const croissanceController = require('../controllers/croissanceController');
const mortaliteController = require('../controllers/mortaliteController');

// Routes pour les races
router.get('/races', raceController.getAll);
router.get('/races/:id', raceController.getById);
router.get('/races/:id/croissance', raceController.getCroissance);
router.post('/races', raceController.create);
router.put('/races/:id', raceController.update);
router.delete('/races/:id', raceController.delete);

// Routes pour les lots
router.get('/lots', lotController.getAll);
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

module.exports = router;
