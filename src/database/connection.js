const mysql = require('mysql2/promise');
const config = require('../../config/database.config.js');

class Database {
    constructor() {
        if (!config) {
            throw new Error('Database config is not defined');
        }
        this.pool = mysql.createPool(config);
    }

    async getConnection() {
        return await this.pool.getConnection();
    }

    async query(sql, values) {
        const connection = await this.getConnection();
        try {
            const [results] = await connection.query(sql, values);
            return results;
        } finally {
            connection.release();
        }
    }

    async close() {
        return await this.pool.end();
    }
}

module.exports = new Database();