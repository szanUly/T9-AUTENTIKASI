const router = require('express').Router();
const c = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const v = require('../validators/product.validator');
const { butuhLogin } = require('../middleware/auth');

router.get('/', validate(v.listQuery, 'query'), c.list);
router.get('/:id', validate(v.idParam, 'params'), c.getById);
router.post('/', butuhLogin, validate(v.createProduct), c.create);
router.put('/:id', butuhLogin, validate(v.idParam, 'params'), validate(v.updateProduct), c.update);
router.delete('/:id', butuhLogin, validate(v.idParam, 'params'), c.remove);

module.exports = router;