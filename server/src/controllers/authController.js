const bcrypt = require('bcryptjs');
const Farmer = require('../models/Farmer');
const { generateToken } = require('../utils/jwt');

async function register(req, res) {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone and password are required' });
    }

    const existing = await Farmer.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: 'Phone already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const farmer = await Farmer.create({ name, phone, password: hash });
    const token = generateToken(farmer._id);
    return res.status(201).json({ token, user: { id: farmer._id, name: farmer.name, phone: farmer.phone } });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { phone, password } = req.body;
    const farmer = await Farmer.findOne({ phone });
    if (!farmer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, farmer.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(farmer._id);
    return res.json({ token, user: { id: farmer._id, name: farmer.name, phone: farmer.phone } });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
}

module.exports = { register, login };


