const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');

router.get('/', staffController.getAll);
router.post('/', staffController.create);
router.put('/:id', staffController.update);
router.delete('/:id', staffController.delete);

module.exports = router;
