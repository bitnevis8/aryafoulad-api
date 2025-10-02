const express = require('express');
const router = express.Router();
const AccountingController = require('./controller');
const { authenticateUser } = require('../user/auth/middleware');

// settings
router.get('/settings', authenticateUser, AccountingController.getSettings);
router.post('/settings', authenticateUser, AccountingController.updateSettings);

// invoices
router.get('/invoices/getAll', authenticateUser, AccountingController.getAllInvoices);
router.get('/invoices/getOne/:id', authenticateUser, AccountingController.getOneInvoice);
router.post('/invoices/create', authenticateUser, AccountingController.createInvoice);
router.post('/invoices/convert/:id', authenticateUser, AccountingController.convertProformaToInvoice);
router.put('/invoices/update/:id', authenticateUser, AccountingController.updateInvoice);
router.get('/invoices/export-docx/:id', authenticateUser, AccountingController.exportDocx);
router.get('/invoices/download-word/:id', authenticateUser, AccountingController.exportDocx);
// Temporary endpoint without auth for testing
router.get('/invoices/download-word-test/:id', AccountingController.exportDocx);
// Test endpoint
router.get('/test', (req, res) => res.json({ success: true, message: 'Accounting API is working!' }));

// Services
router.get('/services/getAll', authenticateUser, AccountingController.servicesGetAll);
router.post('/services/create', authenticateUser, AccountingController.servicesCreate);
router.put('/services/update/:id', authenticateUser, AccountingController.servicesUpdate);
router.delete('/services/delete/:id', authenticateUser, AccountingController.servicesDelete);

// bank accounts
router.get('/bank-accounts', authenticateUser, AccountingController.bankAccountsGetAll);
router.get('/bank-accounts/:id', authenticateUser, AccountingController.bankAccountsGetOne);
router.post('/bank-accounts/create', authenticateUser, AccountingController.bankAccountsCreate);
router.put('/bank-accounts/update/:id', authenticateUser, AccountingController.bankAccountsUpdate);
router.delete('/bank-accounts/delete/:id', authenticateUser, AccountingController.bankAccountsDelete);

module.exports = router;


