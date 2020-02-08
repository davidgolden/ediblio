const { Pool, Client } = require('pg');
const pool = new Pool();
const client = new Client();
module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback)
    },
    cquery:(text, params, callback) => {
        return client.query(text, params, callback)
    },
}
