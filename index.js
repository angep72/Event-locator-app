const client = require('./connection');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.json()); // For parsing application/json
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//"-----------------------------users endpoints-----------------------------"

app.get("/users",(req,res)=>{
    client.query(`SELECT * FROM users`,(err,result)=>{
        if(err) throw err;
        res.send(result.rows);
    })
})

//route to get single user and use user_id
    app.get("/users/:id",(req,res)=>{
        client.query(`SELECT * FROM users WHERE user_id=${req.params.id}`,(err,result)=>{
            if(err) throw err;
            res.send(result.rows);
        })
    })

//update a user 
    app.put("/users/:id", (req, res) => {
        const user = req.body;
        const updateQuery = `UPDATE users SET username=$1, email=$2, first_name=$3, last_name=$4, date_of_birth=$5, location=$6 WHERE user_id=$7 RETURNING *`;
        
        client.query(updateQuery, [user.username, user.email, user.first_name, user.last_name, user.date_of_birth, user.location, req.params.id], (err, result) => {
            if (err) {
                return res.status(500).json({ status: 'error', message: err.message });
            }
            return res.json({ status:'success', data: result.rows[0] });
        });
    });

app.post("/register-user", (req, res) => {
    console.log('Request Body:', req.body); // Check what is in the body
    
    // Check if password is in the body
    if (!req.body.password_hash) {
        return res.status(400).json({ status: 'error', message: 'Password is required' });
    }
    
    // Hash the password before storing it in the database
    const hashedPassword = bcrypt.hashSync(req.body.password_hash, 10);
    
    const user = req.body;
    const postQuery = `INSERT INTO users(username, email, password_hash, first_name, last_name, date_of_birth, location)
                       VALUES($1, $2, $3, $4, $5, $6, $7)
                       RETURNING *`;
                       
    client.query(postQuery, [user.username, user.email, hashedPassword, user.first_name, user.last_name, user.date_of_birth, user.location], (err, result) => {
        if (err) {
            // If there's an error, return a 500 status with error message
            return res.status(500).json({ status: 'error', message: err.message });
        }
        // Return the inserted user data and status 201 (Created)
        return res.status(201).json({ status: 'success', data: result.rows[0] });
    });
});

app.post("/auth/login", (req, res) => {
    //use jwt token
    const { email, password_hash } = req.body;
    const userQuery = `SELECT * FROM users WHERE email=$1`;
    client.query(userQuery, [email], (err, result) => {
        if (err) {
            return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        }
        // Check if password matches
        const user = result.rows[0];
        if (!user || !bcrypt.compareSync(password_hash, user.password_hash)) {
            return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
        return res.json({ status:'success', token });
    });
})

//-----------------------------category endpoints-----------------------------
app.post("/event-category", (req, res) => {
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
});

app.get("/event-category", (req, res) => {
    client.query(`SELECT * FROM event_categories`, (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.json({ status:'success', data: result.rows });
    });
})

//------------ location endpoints -----------

app.post("/location", (req, res) => {
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

   
});


app.get("/location", (req, res) => {
    client.query(`SELECT * FROM locations`, (err, result) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.json({ status:'success', data: result.rows });
    });
})

//---------events endpoints-------------

app.post("/create-event", (req, res) => {
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
});


app.put('/update-event/:id', (req, res) => {
    const { event_name, description, start_date, end_date, location_id, user_id } = req.body;
    const eventId = parseInt(req.params.id);
    // Check if required fields are provided
    if (!event_name ||!description || !start_date || !end_date || !location_id || !user_id) {
        return res.status(400).json({ status: 'error', message: 'Event ID, event name, start date, end date, location ID, and organizer ID are required.' });
    }
    const query = `
        UPDATE public.events
        SET event_name = $1, description = $2, start_date = $3, end_date = $4, location_id = $5, user_id = $6, updated_at = CURRENT_TIMESTAMP
        WHERE event_id = $7
        RETURNING *`;
        client.query(query, [event_name, description, start_date, end_date, location_id, user_id, eventId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 'error', message: err.message });
            }
            // Return the updated event data
            return res.json({ status:'success', data: result.rows[0] });
        });

})

app.delete('/delete-events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const query = `
        DELETE FROM public.events
        WHERE event_id = $1
        RETURNING *`;
        client.query(query, [eventId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 'error', message: err.message });
            }
            // Return the deleted event data
            return res.json({ status:'success', data: result.rows[0] });
        });
    
})


app.get("/event/:event_id", (req, res)=>{
    const eventId = parseInt(req.params.event_id);
    const query = `SELECT * FROM events WHERE event_id = $1`;
    client.query(query, [eventId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Event not found' });
        }
        return res.json({ status:'success', data: result.rows[0] });
    });

})


app.get("/event-all",(req, res)=>{
    const query = `SELECT * FROM events`;
    client.query(query, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.json({ status:'success', data: result.rows });
    });
 
})


//-----------------------------Event Mapping --------------------------------
app.post("/event-mapping",(req, res)=>{
    const { event_id, category_id } = req.body;

    if(!event_id ||!category_id){
        return res.status(400).json({ status: 'error', message: 'Event ID and Category ID are required.' });
    }
    const query = `INSERT INTO event_category_mapping(event_id, category_id) VALUES($1, $2) RETURNING *`;
    client.query(query, [event_id, category_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.status(201).json({ status:'success', data: result.rows[0] });
    });

})

app.get("/event-mapping", (req, res) => {
    const query = `SELECT * FROM event_category_mapping`;
    client.query(query, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.json({ status:'success', data: result.rows });
    });
})

//-----------------------------user preference endpoints-------------------------------------------

app.post("/user-preference", (req, res) => {
    const { user_id, category_id, preferred_location_id,preferred_radius } = req.body;
    if(!user_id ||!category_id ||!preferred_location_id ||!preferred_radius){
        return res.status(400).json({ status: 'error', message: 'User ID, Category ID, Preferred Location ID, and Preferred Radius are required.' });
    }
    const query = `INSERT INTO user_preferences(user_id, category_id, preferred_location_id, preferred_radius) VALUES($1, $2, $3, $4) RETURNING *`;
    client.query(query, [user_id, category_id, preferred_location_id, preferred_radius], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.status(201).json({ status:'success', data: result.rows[0] });
    });


})

app.get('/user/:user_id/preferences',(req,res)=>{
    const userId = parseInt(req.params.user_id);
    const query = `SELECT * FROM user_preferences WHERE user_id = $1`;
    client.query(query, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'User preferences not found' });
        }
        return res.json({ status:'success', data: result.rows });
    });
})

app.get('/user-preferences',(req,res)=>{
    const query = `SELECT * FROM user_preferences`;
    client.query(query, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.json({ status:'success', data: result.rows });
    });

})

//------eventphotos-------------------- 

app.post('/event_images',(req,res)=>{
    const { event_id, image_url } = req.body;
    if(!event_id ||!image_url){
        return res.status(400).json({ status: 'error', message: 'Event ID and Image URL are required.' });
    }
    const query = `INSERT INTO event_images(event_id, image_url) VALUES($1, $2) RETURNING *`;
    client.query(query, [event_id, image_url], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.status(201).json({ status:'success', data: result.rows[0] });
    });


})



app.get('/event/:event_id/images',(req,res)=>{})

app.get('/event-images',(req,res)=>{})

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})
client.connect();