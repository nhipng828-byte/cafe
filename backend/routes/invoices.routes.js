const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoices.controller');

router.get('/', invoicesController.getAll);
router.get('/:id/details', invoicesController.getDetails);

module.exports = router;
