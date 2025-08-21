const mongoose = require('mongoose');

const MilkPriceSchema = new mongoose.Schema(
	{
		farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
		pricePerLiter: { type: Number, required: true },
		effectiveFrom: { type: Date, required: true, index: true },
	},
	{ timestamps: true }
);

MilkPriceSchema.index({ farmerId: 1, effectiveFrom: 1 }, { unique: true });

module.exports = mongoose.model('MilkPrice', MilkPriceSchema);


