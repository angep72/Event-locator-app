const client = require('./connection');
const express = require('express');
const app = express();
app.use(express.json()); // For parsing application/json
const redis = require('redis');
const geolib = require('geolib');
const usersRouter = require('./routes/users.routes');
const categoryRouter = require('./routes/category.routes');

//"-----------------------------users endpoints-----------------------------"

app.use("/users", usersRouter);
//-----------------------------category endpoints-----------------------------
app.use("/event-category",categoryRouter);

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

//get list of events with filters
app.get("/event-filters", (req, res)=>{
    const { location_id, start_date, end_date } = req.query;
    let query = `SELECT * FROM events WHERE location_id = $1`;
    if(start_date && end_date){
        query += ` AND start_date >= $2 AND end_date <= $3`;
    }
    client.query(query, [location_id, start_date, end_date], (err, result) => {
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

//GET /users/1/preferences

app.get('/users/:user_id/preferences',(req,res)=>{
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



app.get('/event/:event_id/images',(req,res)=>{
    const eventId = parseInt(req.params.event_id);
    const query = `SELECT * FROM event_images WHERE event_id = $1`;
    client.query(query, [eventId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Event images not found' });
        }
        return res.json({ status:'success', data: result.rows });
    });

})

app.get('/event-images',(req,res)=>{
    const query = `SELECT * FROM event_images`;
    client.query(query, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 'error', message: err.message });
        }
        return res.json({ status:'success', data: result.rows });
    });
 
})



//-------------notification endpoints --------------------

const redisClient = redis.createClient();  // Connect to Redis

app.post('/notifications/send', async (req, res) => {
    const { event_id, event_name, event_category, event_lat, event_lon, event_start_time } = req.body;
  
    try {
      const users = await client.query(`
        SELECT u.user_id, up.category_id, up.preferred_location_id, up.preferred_radius, l.latitude, l.longitude 
        FROM users u
        JOIN user_preferences up ON u.user_id = up.user_id
        JOIN locations l ON up.preferred_location_id = l.location_id
        WHERE up.category_id = $1`,
        [event_category]
      );
  
      if (users.rows.length === 0) {
        return res.status(200).json({ message: 'No users found with matching preferences.' });
      }
  
      // Step 2: Publish Notifications to Redis (Filtering by Location and Radius)
      users.rows.forEach(user => {
        // Check if the event is within the user's preferred radius
        const userLocation = { latitude: user.latitude, longitude: user.longitude };
        const eventLocation = { latitude: event_lat, longitude: event_lon };
  
        const distance = geolib.getDistance(userLocation, eventLocation);  // Distance in meters
  
        // If the event is within the preferred radius (converted to meters)
        if (distance <= user.preferred_radius * 1000) {  // radius is in kilometers, so convert to meters
          const message = JSON.stringify({
            user_id: user.user_id,
            message: `New event: ${event_name} is coming soon!`,
            event_id: event_id,
            event_start_time: event_start_time,
            event_category: event_category,
          });
  
          // Publish to Redis channel for the user
          redisClient.publish(`user:${user.user_id}:notifications`, message);
        }
      });
  
      return res.status(200).json({ message: 'Notifications queued successfully for users.' });
  
    } catch (error) {
      console.error('Error sending notifications:', error);
      return res.status(500).json({ error: 'Failed to send notifications' });
    }
  });
  



    ///GET /users/{user_id}/notifications - Get notifications for a user
    app.get('/users/:user_id/notifications', async (req, res) => {
      const userId = parseInt(req.params.user_id);
  
      try {
        // Get notifications for the user
        const result = await client.query(
          `SELECT notification_id, user_id, message, notification_type, event_id, seen, created_at 
           FROM notifications 
           WHERE user_id = $1`,
          [userId]
        );
  
        // Get the notifications data
        const notifications = result.rows;
        res.json({ notifications });
      } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
      }
    });


app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})
client.connect();


