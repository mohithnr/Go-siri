const Cow = require('../models/Cow');

async function addCow(req, res) {
  try {
    const { name, tag, breed, age } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const cow = await Cow.create({ farmerId: req.user.id, name, tag, breed, age });
    return res.status(201).json(cow);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add cow' });
  }
}

async function listCows(req, res) {
  try {
    const cows = await Cow.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    return res.json(cows);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list cows' });
  }
}

module.exports = { addCow, listCows };


