const express = require('express');
const controller = require('../controllers/moviesController');

const router = express.Router();

router.get('/genres', controller.genres);
router.get('/:id', controller.details);
router.get('/', controller.discover);

module.exports = router;
