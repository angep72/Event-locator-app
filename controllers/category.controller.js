const client = require("../connection");

const createCategory =  (req, res) => {
    const { category_name } = req.body;  

    // Check if category_name is provided
    if (!category_name) {
        return res.status(400).json({ status: 'error', message: 'Category name is required.' });
    }

    const postQuery = `
        INSERT INTO event_categories(category_name)
        VALUES($1)
        RETURNING *`;  

    client.query(postQuery, [category_name], (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }

        
        return res.status(201).json({ status: 'success', data: result.rows[0] });
    });
}

const getCategoryEvents = (req, res) => {
    client.query(`SELECT * FROM event_categories`, (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.json({ status:'success', data: result.rows });
    });
}

module.exports = {createCategory,getCategoryEvents}