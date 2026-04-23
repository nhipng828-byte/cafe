const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');

router.get('/dashboard', reportsController.getDashboard);
router.get('/details', reportsController.getReportDetails);
router.get('/top-products', reportsController.getTopProducts);
router.get('/inventory', reportsController.getInventoryReport);

module.exports = router;
