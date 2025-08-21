const router = require('express').Router();
const auth = require('../middleware/auth');
const { addCow, listCows } = require('../controllers/cowController');

router.post('/add', auth, addCow);
router.get('/list', auth, listCows);

module.exports = router;


