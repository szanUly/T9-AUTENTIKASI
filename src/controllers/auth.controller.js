const authService = require('../services/auth.service');

exports.register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json(data);
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json(data);
  } catch (e) { next(e); }
};

exports.saya = (req, res) => {
  res.status(200).json({ id: req.user.id });
};