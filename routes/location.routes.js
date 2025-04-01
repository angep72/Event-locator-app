const Router = require('express');
const router = Router();
const {postLocation} = require('../controllers/location.controller');

router.post('/location',postLocation);
router.get('/location',(req, res) => {
    client.query(`SELECT * FROM locations`, (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.json({ status:'success', data: result.rows });
    });
})
module.exports = router;