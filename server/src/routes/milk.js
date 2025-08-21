const router = require('express').Router();
const auth = require('../middleware/auth');
const { addMilk, listMilk, milkSummary } = require('../controllers/milkController');

router.post('/add', auth, addMilk);
router.get('/list/:cowId', auth, listMilk);
router.get('/summary', auth, milkSummary);

module.exports = router;


