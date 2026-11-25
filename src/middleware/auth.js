const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const butuhLogin = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token diperlukan', 'TOKEN_DIPERLUKAN'));
  }
  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // bukan jwt.decode
    req.user = { id: payload.id };
    next();
  } catch (e) {
    next(new AppError(401, 'Token tidak valid atau sudah kedaluwarsa', 'TOKEN_TIDAK_VALID'));
  }
};

module.exports = { butuhLogin };