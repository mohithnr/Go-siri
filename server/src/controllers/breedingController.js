const Breeding = require('../models/Breeding');
const Cow = require('../models/Cow');
const { addDays } = require('../utils/date');

async function addBreeding(req, res) {
  try {
    console.log('Breeding controller - Request body:', req.body);
    console.log('Breeding controller - User ID:', req.user.id);
    
    const { cowId, inseminationDate } = req.body;
    if (!cowId || !inseminationDate) {
      console.log('Breeding controller - Missing required fields:', { cowId, inseminationDate });
      return res.status(400).json({ message: 'cowId and inseminationDate are required' });
    }

    const cow = await Cow.findOne({ _id: cowId, farmerId: req.user.id });
    console.log('Breeding controller - Found cow:', cow);
    
    if (!cow) {
      console.log('Breeding controller - Cow not found for farmer:', req.user.id);
      return res.status(404).json({ message: 'Cow not found' });
    }

    const insemination = new Date(inseminationDate);
    const expectedCalvingDate = addDays(insemination, 280);
    
    console.log('Breeding controller - Calculated dates:', { insemination, expectedCalvingDate });

    const breeding = await Breeding.create({ cowId, inseminationDate: insemination, expectedCalvingDate });
    console.log('Breeding controller - Created breeding record:', breeding);
    
    return res.status(201).json(breeding);
  } catch (err) {
    console.error('Breeding controller - Error:', err);
    return res.status(500).json({ message: 'Failed to add breeding record' });
  }
}

async function addCalving(req, res) {
  try {
    const { cowId, breedingId, actualCalvingDate, calfCount } = req.body;
    const cow = await Cow.findOne({ _id: cowId, farmerId: req.user.id });
    if (!cow) return res.status(404).json({ message: 'Cow not found' });

    const breeding = await Breeding.findOne({ _id: breedingId, cowId });
    if (!breeding) return res.status(404).json({ message: 'Breeding record not found' });

    breeding.actualCalvingDate = actualCalvingDate ? new Date(actualCalvingDate) : new Date();
    if (typeof calfCount !== 'undefined') breeding.calfCount = Number(calfCount);
    await breeding.save();
    return res.json(breeding);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add calving record' });
  }
}

async function reminders(req, res) {
  try {
    console.log('Reminders controller - User ID:', req.user.id);
    
    const upcoming = await Breeding.find({
      expectedCalvingDate: { $gte: new Date(), $lte: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
    })
      .populate({ path: 'cowId', select: 'name tag farmerId' })
      .sort({ expectedCalvingDate: 1 });
      
    console.log('Reminders controller - All upcoming:', upcoming);
    
    const own = upcoming.filter((b) => String(b.cowId?.farmerId) === String(req.user.id));
    console.log('Reminders controller - Own reminders:', own);
    
    return res.json(
      own.map((b) => ({
        id: b._id,
        cowId: b.cowId._id,
        cowName: b.cowId.name,
        expectedCalvingDate: b.expectedCalvingDate,
      }))
    );
  } catch (err) {
    console.error('Reminders controller - Error:', err);
    return res.status(500).json({ message: 'Failed to load reminders' });
  }
}

module.exports = { addBreeding, addCalving, reminders };


