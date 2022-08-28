const express = require('express');
const animalController = require('../controllers/animalController');

const router = express.Router({ mergeParams: true });

router.route('/').get(animalController.getOne);

router.route('/:nr').get(animalController.getMultiple);

module.exports = router;
