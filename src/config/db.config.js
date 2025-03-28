const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE_DB,
    waitForConnections: true,
    charset: 'utf8mb4',
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000,
});

module.exports = db;
