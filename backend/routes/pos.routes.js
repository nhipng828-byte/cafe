const express = require('express');
const router = express.Router();
const posController = require('../controllers/pos.controller');

router.get('/tables', posController.getTables);
router.post('/checkout', posController.checkout);
router.post('/tables', posController.createTable);
router.put('/tables/:id', posController.updateTable);
router.put('/tables/:id/visibility', posController.toggleTableVisibility);

module.exports = router;
