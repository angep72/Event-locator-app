const {Client} = require('pg');
const client = new Client({
    
    host: 'localhost',
    user: 'postgres', 
    database: 'postgres',
    password: 'test123',
    port: 5432,
});

module.exports = client;
