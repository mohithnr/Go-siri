const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    date: { type: Date, required: true, index: true },
    milkIncome: { type: Number, default: 0 },
    expense: { type: Number, default: 0 },
    profitLoss: { type: Number, default: 0 },
  },
  { timestamps: true }
);

FinanceSchema.index({ farmerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Finance', FinanceSchema);


