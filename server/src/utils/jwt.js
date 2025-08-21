const jwt = require('jsonwebtoken');

function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
}

module.exports = { generateToken };


