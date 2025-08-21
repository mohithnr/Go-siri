const MilkRecord = require('../models/MilkRecord');
const Cow = require('../models/Cow');
const Finance = require('../models/Finance');
const MilkPrice = require('../models/MilkPrice');
const { startOfDay, endOfDay } = require('../utils/date');

// Helper: get effective price for a specific date
async function getEffectivePrice(farmerId, date) {
  const d = startOfDay(date);
  const price = await MilkPrice.findOne({ farmerId, effectiveFrom: { $lte: d } })
    .sort({ effectiveFrom: -1 })
    .lean();
  return price?.pricePerLiter ?? 0;
}

// Helper: recalculate sales for a specific date
async function recalculateSalesForDate(farmerId, date) {
  const dayStart = startOfDay(date);
  
  // Get all cow IDs for this farmer
  const cowIds = await Cow.find({ farmerId }).distinct('_id');
  if (cowIds.length === 0) return;

  // Get total milk collected for this date
  const agg = await MilkRecord.aggregate([
    { $match: { cowId: { $in: cowIds }, date: dayStart } },
    { $group: { _id: null, totalLiters: { $sum: '$totalMilk' } } },
    { $project: { _id: 0, totalLiters: 1 } },
  ]);
  
  const totalLiters = agg[0]?.totalLiters || 0;
  
  // Get effective price for this date
  const pricePerLiter = await getEffectivePrice(farmerId, date);
  
  // Calculate sales amount
  const milkIncome = Number(totalLiters) * Number(pricePerLiter);
  
  // Update finance record
  const summary = await Finance.findOneAndUpdate(
    { farmerId, date: dayStart },
    { $set: { milkIncome } },
    { upsert: true, new: true }
  );
  
  // Update profit/loss
  summary.profitLoss = (summary.milkIncome || 0) - (summary.expense || 0);
  await summary.save();
  
  return { totalLiters, pricePerLiter, milkIncome };
}

async function addMilk(req, res) {
  try {
    const { cowId, date, morningMilk = 0, eveningMilk = 0 } = req.body;
    if (!cowId) return res.status(400).json({ message: 'cowId is required' });

    const cow = await Cow.findOne({ _id: cowId, farmerId: req.user.id });
    if (!cow) return res.status(404).json({ message: 'Cow not found' });

    const d = date ? new Date(date) : new Date();
    const dayStart = startOfDay(d);
    const totalMilk = Number(morningMilk) + Number(eveningMilk);

    // Update or create milk record
    const record = await MilkRecord.findOneAndUpdate(
      { cowId, date: dayStart },
      { $set: { morningMilk: Number(morningMilk), eveningMilk: Number(eveningMilk), totalMilk } },
      { new: true, upsert: true }
    );

    // Automatically recalculate sales for this date
    const salesData = await recalculateSalesForDate(req.user.id, d);
    
    return res.status(201).json({
      record,
      salesCalculated: {
        date: dayStart.toISOString().split('T')[0],
        totalLiters: salesData.totalLiters,
        pricePerLiter: salesData.pricePerLiter,
        milkIncome: salesData.milkIncome
      }
    });
  } catch (err) {
    console.error('Error in addMilk:', err);
    return res.status(500).json({ message: 'Failed to add milk record' });
  }
}

async function listMilk(req, res) {
  try {
    const { cowId } = req.params;
    const cow = await Cow.findOne({ _id: cowId, farmerId: req.user.id });
    if (!cow) return res.status(404).json({ message: 'Cow not found' });
    
    const records = await MilkRecord.find({ cowId }).sort({ date: -1 });
    return res.json(records);
  } catch (err) {
    console.error('Error in listMilk:', err);
    return res.status(500).json({ message: 'Failed to list milk records' });
  }
}

// Aggregate per-day milk totals across all cows for the current farmer
async function milkSummary(req, res) {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    const to = req.query.to ? new Date(req.query.to) : new Date();
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const cowIds = await Cow.find({ farmerId: req.user.id }).distinct('_id');
    if (cowIds.length === 0) return res.json([]);

    const rows = await MilkRecord.aggregate([
      { $match: { cowId: { $in: cowIds }, date: { $gte: from, $lte: to } } },
      { $group: { 
        _id: { $dateToString: { date: '$date', format: '%Y-%m-%d' } }, 
        liters: { $sum: '$totalMilk' },
        date: { $first: '$date' }
      } },
      { $project: { _id: 0, date: '$_id', liters: 1, fullDate: '$date' } },
      { $sort: { date: 1 } },
    ]);

    // Add price information for each day
    const enrichedRows = await Promise.all(rows.map(async (row) => {
      const pricePerLiter = await getEffectivePrice(req.user.id, row.fullDate);
      return {
        ...row,
        pricePerLiter,
        income: row.liters * pricePerLiter
      };
    }));

    return res.json(enrichedRows);
  } catch (err) {
    console.error('Error in milkSummary:', err);
    return res.status(500).json({ message: 'Failed to load milk summary' });
  }
}

// Delete milk record and recalculate sales for that date
async function deleteMilk(req, res) {
  try {
    const { recordId } = req.params;
    
    const record = await MilkRecord.findById(recordId).populate('cowId');
    if (!record || String(record.cowId.farmerId) !== String(req.user.id)) {
      return res.status(404).json({ message: 'Milk record not found' });
    }
    
    const recordDate = record.date;
    await MilkRecord.findByIdAndDelete(recordId);
    
    // Recalculate sales for this date after deletion
    await recalculateSalesForDate(req.user.id, recordDate);
    
    return res.json({ message: 'Milk record deleted and sales recalculated' });
  } catch (err) {
    console.error('Error in deleteMilk:', err);
    return res.status(500).json({ message: 'Failed to delete milk record' });
  }
}

module.exports = { 
  addMilk, 
  listMilk, 
  milkSummary, 
  deleteMilk,
  recalculateSalesForDate // Export helper function for use in other controllers
};