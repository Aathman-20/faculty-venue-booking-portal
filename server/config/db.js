const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'venue_booking_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectMySQL = async () => {
    const connection = await pool.getConnection();
    console.log('[MYSQL] Connected successfully');
    connection.release();
};

module.exports = { pool, connectMySQL };
