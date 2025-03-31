const client = require('../connection');
const postLocation = (req, res) => {
    const { name,latitude,
  longitude,
  address } = req.body;  
    // Check if name, latitude, longitude, and address are provided
    if (!name ||!latitude ||!longitude ||!address) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }
    const postQuery = `
        INSERT INTO locations(name, latitude, longitude, address)
        VALUES($1, $2, $3, $4)
        RETURNING *`;
        client.query(postQuery, [name, latitude, longitude, address], (err, result) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: err.message });
            }
            return res.status(201).json({ status:'success', data: result.rows[0] });
        });

   
}

module.exports = {postLocation}