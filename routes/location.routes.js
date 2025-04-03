const Router = require('express');
const router = Router();
const {postLocation,getLocation} = require('../controllers/location.controller');

router.post('/location',postLocation);
router.get('/location',getLocation)
module.exports = router;