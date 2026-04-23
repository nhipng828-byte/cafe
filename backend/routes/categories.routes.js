const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');

router.get('/', categoriesController.getAll);
router.post('/', categoriesController.create);
router.put('/:id', categoriesController.update);
router.put('/:id/restore', categoriesController.restore);
router.delete('/:id', categoriesController.delete);

module.exports = router;
