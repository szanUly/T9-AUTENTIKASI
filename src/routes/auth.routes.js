const router = require('express').Router();
const c = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const v = require('../validators/auth.validator');
const { butuhLogin } = require('../middleware/auth');

router.post('/register', validate(v.register), c.register);
router.post('/login', validate(v.login), c.login);
router.get('/saya', butuhLogin, c.saya);

module.exports = router;