const mongoose = require('mongoose');

const CowSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    name: { type: String, required: true, trim: true },
    tag: { type: String, trim: true },
    breed: { type: String },
    age: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cow', CowSchema);


