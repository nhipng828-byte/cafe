const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');

router.get('/', productsController.getAll);
router.post('/', productsController.create);
router.put('/:id', productsController.update);
router.delete('/:id', productsController.hide);
router.put('/:id/restore', productsController.restore);
router.get('/:id/recipe', productsController.getRecipe);
router.post('/:id/recipe', productsController.updateRecipe);

module.exports = router;
