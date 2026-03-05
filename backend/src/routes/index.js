const express = require('express');
const router = express.Router();

const exampleController = require('../controllers/exampleController');

// Routes d'exemple
router.get('/example', exampleController.getAll);
router.get('/example/:id', exampleController.getById);
router.post('/example', exampleController.create);
router.put('/example/:id', exampleController.update);
router.delete('/example/:id', exampleController.delete);

module.exports = router;
