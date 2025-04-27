const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA,
    port: parseInt(process.env.DATABASE_PORT)
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected!');
});

module.exports = db;
