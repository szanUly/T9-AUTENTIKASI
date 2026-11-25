const router = require('express').Router();
const c = require('../controllers/order.controller');
const validate = require('../middleware/validate');
const v = require('../validators/order.validator');
const { butuhLogin } = require('../middleware/auth');

router.get('/', c.list);
router.post('/', butuhLogin, validate(v.createOrder), c.create);

module.exports = router;