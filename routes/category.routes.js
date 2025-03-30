const Router = require('express');
const router = Router();

const {createCategory,getCategoryEvents} = require('../controllers/category.controller');

router.post('/', createCategory);
router.get('/', getCategoryEvents);

module.exports = router;