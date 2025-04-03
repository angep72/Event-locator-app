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

const getLocation = (req, res) => {
    const { event_name, description, start_date, end_date, location_id, user_id } = req.body;

    // Check if required fields (event_name, start_date, end_date, location_id, organizer_id) are provided
    if (!event_name || !start_date || !end_date || !location_id || !user_id) {
        return res.status(400).json({ status: 'error', message: 'Event name, start date, end date, location ID, and organizer ID are required.' });
    }

    const query = `
        INSERT INTO public.events(event_name, description, start_date, end_date, location_id, user_id, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`;  // Using $1, $2, ..., $6 as placeholders for the values

    // Execute the query
    client.query(query, [event_name, description, start_date, end_date, location_id, user_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }

        // Return the newly created event data
        return res.status(201).json({ status: 'success', data: result.rows[0] });
    });
}

module.exports = {postLocation, getLocation}