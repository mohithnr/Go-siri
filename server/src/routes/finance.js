const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const financeController = require('../controllers/financeController');

router.use(auth);

// Your existing routes - keep exactly as they were
// router.post('/sales/add', financeController.addSale);
router.post('/expenses/add', financeController.addExpense);
router.get('/summary', financeController.getSummary);
router.get('/history', financeController.getHistory);
router.post('/price/set', financeController.setMilkPrice);
router.post('/sales/recalc', financeController.recalcSales);
router.get('/prices', financeController.getMilkPrices);
router.post('/price', financeController.setMilkPrice);
router.post('/recalc', financeController.recalcSales);
router.get('/debug', financeController.debugMilkRecords);


module.exports = router;