const Breeding = require('../models/Breeding');
const Cow = require('../models/Cow');
const { addDays } = require('../utils/date');

// Migration function to handle existing records without farmerId
async function migrateBreedingRecords() {
  try {
    const recordsWithoutFarmerId = await Breeding.find({ farmerId: { $exists: false } });
    console.log(`Found ${recordsWithoutFarmerId.length} breeding records without farmerId`);
    
    for (const record of recordsWithoutFarmerId) {
      // Find the cow to get the farmerId
      const cow = await Cow.findById(record.cowId);
      if (cow && cow.farmerId) {
        record.farmerId = cow.farmerId;
        await record.save();
        console.log(`Migrated breeding record ${record._id} for farmer ${cow.farmerId}`);
      } else {
        console.log(`Could not find cow or farmer for breeding record ${record._id}`);
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

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

    const breeding = await Breeding.create({ 
      farmerId: req.user.id,
      cowId, 
      inseminationDate: insemination, 
      expectedCalvingDate 
    });
    console.log('Breeding controller - Created breeding record:', breeding);
    
    return res.status(201).json(breeding);
  } catch (err) {
    console.error('Breeding controller - Error:', err);
    return res.status(500).json({ message: 'Failed to add breeding record' });
  }
}

async function addCalving(req, res) {
  try {
    console.log('Add calving - Request body:', req.body);
    console.log('Add calving - User ID:', req.user.id);
    
    const { breedingId, actualCalvingDate, calfCount } = req.body;
    
    if (!breedingId) {
      console.log('Add calving - Missing breedingId');
      return res.status(400).json({ message: 'breedingId is required' });
    }
    
    // Find the breeding record first to get the cowId
    const breeding = await Breeding.findOne({ _id: breedingId, farmerId: req.user.id });
    console.log('Add calving - Found breeding record:', breeding);
    
    if (!breeding) {
      console.log('Add calving - Breeding record not found for user:', req.user.id);
      return res.status(404).json({ message: 'Breeding record not found' });
    }

    // Verify the cow belongs to this farmer
    const cow = await Cow.findOne({ _id: breeding.cowId, farmerId: req.user.id });
    console.log('Add calving - Found cow:', cow);
    
    if (!cow) {
      console.log('Add calving - Cow not found for user:', req.user.id);
      return res.status(404).json({ message: 'Cow not found' });
    }

    breeding.actualCalvingDate = actualCalvingDate ? new Date(actualCalvingDate) : new Date();
    if (typeof calfCount !== 'undefined') breeding.calfCount = Number(calfCount);
    
    console.log('Add calving - Updating breeding record with:', {
      actualCalvingDate: breeding.actualCalvingDate,
      calfCount: breeding.calfCount
    });
    
    await breeding.save();
    console.log('Add calving - Breeding record updated successfully');
    
    return res.json(breeding);
  } catch (err) {
    console.error('Add calving error:', err);
    return res.status(500).json({ message: 'Failed to add calving record' });
  }
}

async function reminders(req, res) {
  try {
    console.log('Reminders controller - User ID:', req.user.id);
    
    // Run migration first to handle existing records
    await migrateBreedingRecords();
    
    // Filter by farmerId first, then by expected calving date
    const upcoming = await Breeding.find({
      farmerId: req.user.id,
      expectedCalvingDate: { $gte: new Date(), $lte: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
    })
      .populate({ path: 'cowId', select: 'name tag' })
      .sort({ expectedCalvingDate: 1 });
      
    console.log('Reminders controller - Own reminders:', upcoming);
    
    return res.json(
      upcoming.map((b) => ({
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

async function getBreedingHistory(req, res) {
  try {
    console.log('Breeding history controller - User ID:', req.user.id);
    
    // Run migration first to handle existing records
    await migrateBreedingRecords();
    
    const breedingRecords = await Breeding.find({
      farmerId: req.user.id,
    })
      .populate({ path: 'cowId', select: 'name tag' })
      .sort({ inseminationDate: -1 });
      
    console.log('Breeding history controller - Records found:', breedingRecords.length);
    
    return res.json(
      breedingRecords.map((b) => ({
        id: b._id,
        cowId: b.cowId._id,
        cowName: b.cowId.name,
        inseminationDate: b.inseminationDate,
        expectedCalvingDate: b.expectedCalvingDate,
        actualCalvingDate: b.actualCalvingDate,
        calfCount: b.calfCount,
        status: b.actualCalvingDate ? 'Completed' : 'Pending'
      }))
    );
  } catch (err) {
    console.error('Breeding history controller - Error:', err);
    return res.status(500).json({ message: 'Failed to load breeding history' });
  }
}

module.exports = { addBreeding, addCalving, reminders, getBreedingHistory };


