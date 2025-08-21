const Finance = require('../models/Finance');
const MilkRecord = require('../models/MilkRecord');
const Cow = require('../models/Cow');
const MilkPrice = require('../models/MilkPrice');
const { startOfDay, endOfDay, startOfMonth } = require('../utils/date');
const { recalculateSalesForDate } = require('./milkController');

// Helper: get effective price for a specific date
async function getEffectivePrice(farmerId, date) {
  const d = startOfDay(date);
  const price = await MilkPrice.findOne({ farmerId, effectiveFrom: { $lte: d } })
    .sort({ effectiveFrom: -1 })
    .lean();
  
  console.log(`Getting effective price for farmer ${farmerId} on ${d.toISOString()}, found: ${price?.pricePerLiter ?? 'none'}`);
  return price?.pricePerLiter ?? 0;
}

// Update or create milk price
async function setMilkPrice(req, res) {
  try {
    const { pricePerLiter, effectiveFrom } = req.body;
    if (pricePerLiter === undefined) {
      return res.status(400).json({ message: 'pricePerLiter is required' });
    }
    
    const eff = effectiveFrom ? startOfDay(new Date(effectiveFrom)) : startOfDay(new Date());
    
    // Check if price already exists for this date
    const existingPrice = await MilkPrice.findOne({ farmerId: req.user.id, effectiveFrom: eff });
    
    const doc = await MilkPrice.findOneAndUpdate(
      { farmerId: req.user.id, effectiveFrom: eff },
      { $set: { pricePerLiter: Number(pricePerLiter) } },
      { upsert: true, new: true }
    );
    
    // If this is the first price for this farmer, also set a default price for past dates
    if (!existingPrice) {
      const hasAnyPrice = await MilkPrice.findOne({ farmerId: req.user.id });
      if (!hasAnyPrice) {
        // Set a default price for past dates (1 year back) so historical milk records can be calculated
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        await MilkPrice.create({
          farmerId: req.user.id,
          pricePerLiter: Number(pricePerLiter),
          effectiveFrom: startOfDay(oneYearAgo)
        });
        console.log(`Set default historical price for farmer ${req.user.id} at ₹${pricePerLiter} from ${oneYearAgo.toISOString()}`);
      }
    }
    
    return res.status(201).json({
      ...doc.toObject(),
      message: existingPrice ? 'Price updated successfully' : 'New price set successfully'
    });
  } catch (err) {
    console.error('Error in setMilkPrice:', err);
    return res.status(500).json({ message: 'Failed to set milk price' });
  }
}

// Recalculate sales for a date range using effective prices and actual milk data
async function recalcSales(req, res) {
  try {
    const { from, to } = req.body;
    const start = from ? startOfDay(new Date(from)) : startOfDay(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));
    const end = to ? endOfDay(new Date(to)) : endOfDay(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000));

    // Get all cow ids for farmer
    const cowIds = await Cow.find({ farmerId: req.user.id }).distinct('_id');
    if (cowIds.length === 0) {
      return res.json({ updatedDays: 0, message: 'No cows found for this farmer' });
    }

    // Get all dates that have milk records in the range - improved date handling
    const milkDates = await MilkRecord.aggregate([
      { $match: { cowId: { $in: cowIds }, date: { $gte: start, $lte: end } } },
      { 
        $addFields: { 
          dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
        } 
      },
      { $group: { _id: '$dateStr', date: { $first: '$date' } } },
      { $sort: { date: 1 } }
    ]);

    console.log(`Found ${milkDates.length} dates with milk records in range ${start.toISOString()} to ${end.toISOString()}`);
    console.log('Cow IDs:', cowIds);
    console.log('Milk dates found:', milkDates.map(d => d.date.toISOString()));

    let updatedDays = 0;
    
    // Recalculate sales for each date that has milk records
    for (const dateGroup of milkDates) {
      const date = dateGroup.date;
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      // Get total milk for this date - improved date matching
      const milkAgg = await MilkRecord.aggregate([
        { $match: { 
          cowId: { $in: cowIds }, 
          date: { 
            $gte: dayStart, 
            $lte: dayEnd 
          } 
        } },
        { $group: { _id: null, totalLiters: { $sum: '$totalMilk' } } }
      ]);
      
      const totalLiters = milkAgg[0]?.totalLiters || 0;
      
      // Get effective price for this date
      const pricePerLiter = await getEffectivePrice(req.user.id, date);
      const milkIncome = Number(totalLiters) * Number(pricePerLiter);
      
      console.log(`Date: ${date.toISOString()}, DayStart: ${dayStart.toISOString()}, DayEnd: ${dayEnd.toISOString()}, Milk: ${totalLiters}L, Price: ₹${pricePerLiter}, Income: ₹${milkIncome}`);
      
      // Update finance record
      const summary = await Finance.findOneAndUpdate(
        { farmerId: req.user.id, date: dayStart },
        { $set: { milkIncome } },
        { upsert: true, new: true }
      );
      
      // Update profit/loss
      summary.profitLoss = (summary.milkIncome || 0) - (summary.expense || 0);
      await summary.save();
      
      updatedDays += 1;
    }

    // Also process any dates in the range that might not have milk records yet
    // This ensures Finance records exist for all dates in the range
    const currentDate = new Date(start);
    const endDate = new Date(end);
    
    while (currentDate <= endDate) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);
      
      // Check if we already processed this date
      const alreadyProcessed = milkDates.some(d => 
        startOfDay(d.date).getTime() === dayStart.getTime()
      );
      
      if (!alreadyProcessed) {
        // Get total milk for this date
        const milkAgg = await MilkRecord.aggregate([
          { $match: { 
            cowId: { $in: cowIds }, 
            date: { 
              $gte: dayStart, 
              $lte: dayEnd 
            } 
          } },
          { $group: { _id: null, totalLiters: { $sum: '$totalMilk' } } }
        ]);
        
        const totalLiters = milkAgg[0]?.totalLiters || 0;
        
        // Get effective price for this date
        const pricePerLiter = await getEffectivePrice(req.user.id, currentDate);
        const milkIncome = Number(totalLiters) * Number(pricePerLiter);
        
        console.log(`Additional date: ${currentDate.toISOString()}, Milk: ${totalLiters}L, Price: ₹${pricePerLiter}, Income: ₹${milkIncome}`);
        
        // Update finance record
        const summary = await Finance.findOneAndUpdate(
          { farmerId: req.user.id, date: dayStart },
          { $set: { milkIncome } },
          { upsert: true, new: true }
        );
        
        // Update profit/loss
        summary.profitLoss = (summary.milkIncome || 0) - (summary.expense || 0);
        await summary.save();
        
        updatedDays += 1;
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return res.json({ 
      updatedDays,
      message: `Sales recalculated for ${updatedDays} day(s)`,
      dateRange: {
        from: start.toISOString().split('T')[0],
        to: end.toISOString().split('T')[0]
      }
    });
  } catch (err) {
    console.error('Error in recalcSales:', err);
    return res.status(500).json({ message: 'Failed to recalculate sales' });
  }
}

// Add expense (unchanged)
async function addExpense(req, res) {
  try {
    const { date, amount, note } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    const d = date ? new Date(date) : new Date();
    const dayStart = startOfDay(d);
    
    const summary = await Finance.findOneAndUpdate(
      { farmerId: req.user.id, date: dayStart },
      { $inc: { expense: Number(amount) } },
      { upsert: true, new: true }
    );
    
    // Update profit/loss
    summary.profitLoss = (summary.milkIncome || 0) - (summary.expense || 0);
    await summary.save();
    
    return res.status(201).json({ 
      ...summary.toObject(), 
      note,
      message: 'Expense added successfully'
    });
  } catch (err) {
    console.error('Error in addExpense:', err);
    return res.status(500).json({ message: 'Failed to add expense' });
  }
}

// Get financial summary (enhanced)
async function getSummary(req, res) {
  try {
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());

    // Today's finance data
    const [todayFinance] = await Finance.find({ 
      farmerId: req.user.id, 
      date: { $gte: today, $lte: endOfDay(today) } 
    });

    // Today's milk collected (all cows of this farmer)
    const cowIds = await Cow.find({ farmerId: req.user.id }).distinct('_id');
    let todayMilkLiters = 0;
    let todayPrice = 0;
    
    if (cowIds.length > 0) {
      const litersAgg = await MilkRecord.aggregate([
        { $match: { cowId: { $in: cowIds }, date: { $gte: today, $lte: endOfDay(today) } } },
        { $group: { _id: null, liters: { $sum: '$totalMilk' } } },
        { $project: { _id: 0, liters: 1 } },
      ]);
      todayMilkLiters = litersAgg[0]?.liters || 0;
      todayPrice = await getEffectivePrice(req.user.id, today);
    }

    // Month's finance data
    const monthFinance = await Finance.aggregate([
      { 
        $match: { 
          farmerId: require('mongoose').Types.ObjectId.createFromHexString(String(req.user.id)), 
          date: { $gte: monthStart } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          income: { $sum: '$milkIncome' }, 
          expense: { $sum: '$expense' } 
        } 
      },
      { 
        $project: { 
          _id: 0, 
          income: 1, 
          expense: 1, 
          profitLoss: { $subtract: ['$income', '$expense'] } 
        } 
      },
    ]);

    // Month's milk collected (all cows of this farmer)
    let monthMilkLiters = 0;
    if (cowIds.length > 0) {
      const monthLitersAgg = await MilkRecord.aggregate([
        { $match: { cowId: { $in: cowIds }, date: { $gte: monthStart } } },
        { $group: { _id: null, liters: { $sum: '$totalMilk' } } },
        { $project: { _id: 0, liters: 1 } },
      ]);
      monthMilkLiters = monthLitersAgg[0]?.liters || 0;
    }

    // Upcoming calving reminders: next 14 days
    const fourteenDaysFromNow = endOfDay(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
    const reminders = await require('../models/Breeding')
      .find({ expectedCalvingDate: { $gte: today, $lte: fourteenDaysFromNow } })
      .populate({ path: 'cowId', select: 'name tag farmerId' });

    const ownReminders = reminders.filter((r) => String(r.cowId?.farmerId) === String(req.user.id));

    // Current milk price
    const currentPrice = await MilkPrice.findOne({ 
      farmerId: req.user.id, 
      effectiveFrom: { $lte: today } 
    })
    .sort({ effectiveFrom: -1 })
    .lean();

    return res.json({
      today: {
        milkCollected: todayMilkLiters,
        currentPrice: currentPrice?.pricePerLiter || 0,
        milkIncome: todayFinance?.milkIncome || 0,
        expense: todayFinance?.expense || 0,
        profitLoss: todayFinance?.profitLoss || 0,
        autoCalculated: todayMilkLiters > 0 && (currentPrice?.pricePerLiter || 0) > 0
      },
      month: {
        ...(monthFinance[0] || { income: 0, expense: 0, profitLoss: 0 }),
        milkCollected: monthMilkLiters
      },
      reminders: ownReminders.map((r) => ({
        cowId: r.cowId._id,
        cowName: r.cowId.name,
        expectedCalvingDate: r.expectedCalvingDate,
      })),
      priceInfo: {
        current: currentPrice?.pricePerLiter || 0,
        effectiveFrom: currentPrice?.effectiveFrom || null
      }
    });
  } catch (err) {
    console.error('Error in getSummary:', err);
    return res.status(500).json({ message: 'Failed to load summary' });
  }
}

// Get financial history (unchanged)
async function getHistory(req, res) {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(from) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    const end = to ? new Date(to) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const rows = await Finance.find({ 
      farmerId: req.user.id, 
      date: { $gte: start, $lte: end } 
    })
    .sort({ date: 1 })
    .lean();
    
    return res.json(rows);
  } catch (err) {
    console.error('Error in getHistory:', err);
    return res.status(500).json({ message: 'Failed to load history' });
  }
}

// Get current milk prices
async function getMilkPrices(req, res) {
  try {
    const prices = await MilkPrice.find({ farmerId: req.user.id })
      .sort({ effectiveFrom: -1 })
      .limit(10)
      .lean();
      
    const currentPrice = await MilkPrice.findOne({ 
      farmerId: req.user.id, 
      effectiveFrom: { $lte: startOfDay(new Date()) } 
    })
    .sort({ effectiveFrom: -1 })
    .lean();
    
    return res.json({
      current: currentPrice,
      history: prices
    });
  } catch (err) {
    console.error('Error in getMilkPrices:', err);
    return res.status(500).json({ message: 'Failed to load milk prices' });
  }
}

// Debug function to check milk records
async function debugMilkRecords(req, res) {
  try {
    const { from, to } = req.query;
    const start = from ? startOfDay(new Date(from)) : startOfDay(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000));
    const end = to ? endOfDay(new Date(to)) : endOfDay(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000));
    
    const cowIds = await Cow.find({ farmerId: req.user.id }).distinct('_id');
    console.log('Debug: Cow IDs for farmer:', cowIds);
    
    const milkRecords = await MilkRecord.find({ 
      cowId: { $in: cowIds }, 
      date: { $gte: start, $lte: end } 
    }).lean();
    
    console.log('Debug: Milk records found:', milkRecords.length);
    console.log('Debug: Sample records:', milkRecords.slice(0, 3));
    
    return res.json({
      cowIds: cowIds,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      milkRecordsCount: milkRecords.length,
      sampleRecords: milkRecords.slice(0, 5)
    });
  } catch (err) {
    console.error('Error in debugMilkRecords:', err);
    return res.status(500).json({ message: 'Failed to debug milk records' });
  }
}

module.exports = { 
  addExpense, 
  getSummary, 
  getHistory, 
  setMilkPrice, 
  recalcSales,
  getMilkPrices,
  debugMilkRecords
};