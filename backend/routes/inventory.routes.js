const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

router.get('/materials', inventoryController.getMaterials);
router.post('/import', inventoryController.importStock);
router.post('/export', inventoryController.exportStock);
router.get('/imports', inventoryController.getImports);
router.get('/imports/:maPN/details', inventoryController.getImportDetail);
router.get('/exports', inventoryController.getExports);
router.get('/exports/:maPX/details', inventoryController.getExportDetail);
router.put('/imports/:maPN/cancel', inventoryController.cancelImport);
router.put('/exports/:maPX/cancel', inventoryController.cancelExport);
router.get('/suppliers', inventoryController.getSuppliers);
router.post('/suppliers', inventoryController.createSupplier);
router.put('/suppliers/:maNCC', inventoryController.updateSupplier);

router.post('/materials', inventoryController.createMaterial);
router.put('/materials/:maNVL', inventoryController.updateMaterial);

module.exports = router;
