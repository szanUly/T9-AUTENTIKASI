const Joi = require('joi');

const kredensial = Joi.object({
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(8).max(72).required(),
});

module.exports = { register: kredensial, login: kredensial };