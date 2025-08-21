const mongoose = require('mongoose');

const MilkRecordSchema = new mongoose.Schema(
  {
    cowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cow', required: true, index: true },
    date: { type: Date, required: true, index: true },
    morningMilk: { type: Number, default: 0 },
    eveningMilk: { type: Number, default: 0 },
    totalMilk: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MilkRecordSchema.index({ cowId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MilkRecord', MilkRecordSchema);


