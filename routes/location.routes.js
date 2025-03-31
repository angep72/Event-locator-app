const Router = require('express');
const router = Router();
const {postLocation} = require('../controllers/location.controller');

router.post('/location',postLocation);
module.exports = router;