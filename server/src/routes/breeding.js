const router = require('express').Router();
const auth = require('../middleware/auth');
const { addBreeding, addCalving, reminders, getBreedingHistory } = require('../controllers/breedingController');

router.post('/add', auth, addBreeding);
router.post('/calving', auth, addCalving);
router.get('/reminders', auth, reminders);
router.get('/history', auth, getBreedingHistory);

module.exports = router;


