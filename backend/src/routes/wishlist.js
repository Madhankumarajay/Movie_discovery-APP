const express = require('express');
const deviceId = require('../middleware/deviceId');
const controller = require('../controllers/wishlistController');

const router = express.Router();

router.use(deviceId);
router.get('/', controller.list);
router.post('/', controller.add);
router.delete('/:movieId', controller.remove);

module.exports = router;
