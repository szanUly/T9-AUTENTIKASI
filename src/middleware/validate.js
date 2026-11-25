const AppError = require('../utils/AppError');

// source: 'body' | 'params' | 'query'
module.exports = (schema, source = 'body') => (req, res, next) => {
  const input = req[source] ?? {};
  const { error, value } = schema.validate(input, { abortEarly: false });
  if (error) {
    const pesan = error.details.map((d) => d.message).join('; ');
    return next(new AppError(source === 'body' ? 422 : 400, pesan, 'VALIDATION_ERROR'));
  }
  req.validated = req.validated || {};
  req.validated[source] = value;
  if (source === 'body') req.body = value;
  next();
};