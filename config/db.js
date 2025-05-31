// db.js
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_SCHEMA,
  port: parseInt(process.env.DATABASE_PORT),
});

module.exports = db;