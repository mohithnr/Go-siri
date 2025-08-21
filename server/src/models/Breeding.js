const mongoose = require('mongoose');

const BreedingSchema = new mongoose.Schema(
  {
    cowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cow', required: true, index: true },
    inseminationDate: { type: Date, required: true },
    expectedCalvingDate: { type: Date, required: true, index: true },
    actualCalvingDate: { type: Date },
    calfCount: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Breeding', BreedingSchema);


