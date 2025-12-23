const mysql = require('mysql2/promise');
const config = require('../../config/database.config');
const logger = require('../utils/logger');

class DatabasePool {
    constructor() {
        this.pool = null;
        this.config = {
            ...config,
            waitForConnections: true,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        };
        
        this.initializePool();
    }

    /**
     * Inicializa el pool de conexiones
     */
    initializePool() {
        if (!this.pool) {
            this.pool = mysql.createPool(this.config);
            
            // Eventos del pool
            this.pool.on('connection', (connection) => {
                logger.debug('🔗 Nueva conexión establecida:', connection.threadId);
            });

            this.pool.on('acquire', (connection) => {
                logger.debug('📥 Conexión adquirida:', connection.threadId);
            });

            this.pool.on('release', (connection) => {
                logger.debug('📤 Conexión liberada:', connection.threadId);
            });

            logger.info(`🏊 Pool de conexiones inicializado (límite: ${this.config.connectionLimit})`);
        }
    }

    /**
     * Obtiene una conexión del pool
     * @returns {Promise<mysql.PoolConnection>} Conexión del pool
     */
    async getConnection() {
        try {
            const connection = await this.pool.getConnection();
            return connection;
        } catch (error) {
            logger.error('❌ Error al obtener conexión del pool:', error.message);
            throw error;
        }
    }

    /**
     * Ejecuta una consulta usando el pool
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros para la consulta
     * @returns {Promise<any>} Resultado de la consulta
     */
    async query(sql, params = []) {
        let connection;
        try {
            connection = await this.getConnection();
            const [rows] = await connection.execute(sql, params);
            return rows;
        } catch (error) {
            logger.error('❌ Error en consulta SQL:', {
                sql: sql.substring(0, 100) + '...',
                params: params,
                error: error.message
            });
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    /**
     * Ejecuta una consulta con transacción
     * @param {Function} callback - Función que contiene las consultas de la transacción
     * @returns {Promise<any>} Resultado de la transacción
     */
    async transaction(callback) {
        let connection;
        try {
            connection = await this.getConnection();
            await connection.beginTransaction();
            
            const result = await callback(connection);
            
            await connection.commit();
            logger.info('✅ Transacción completada exitosamente');
            return result;
        } catch (error) {
            if (connection) {
                await connection.rollback();
                logger.warn('↩️ Transacción revertida debido a error');
            }
            logger.error('❌ Error en transacción:', error.message);
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    /**
     * Cierra el pool de conexiones
     * @returns {Promise<void>}
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            logger.info('🔌 Pool de conexiones cerrado');
        }
    }

    /**
     * Obtiene estadísticas del pool
     * @returns {Object} Estadísticas del pool
     */
    getPoolStats() {
        if (!this.pool) {
            return { error: 'Pool no inicializado' };
        }

        const free = Array.isArray(this.pool._freeConnections) ? this.pool._freeConnections.length : 0;
        const all = Array.isArray(this.pool._allConnections) ? this.pool._allConnections.length : 0;
        const queue = Array.isArray(this.pool._connectionQueue) ? this.pool._connectionQueue.length : 0;

        return {
            totalConnections: free + all,
            freeConnections: free,
            allConnections: all,
            connectionLimit: this.config.connectionLimit,
            queueSize: queue
        };
    }

    /**
     * Verifica el estado del pool
     * @returns {Promise<boolean>} True si el pool está funcionando
     */
    async healthCheck() {
        try {
            const [result] = await this.query('SELECT 1 as health_check');
            return result.health_check === 1;
        } catch (error) {
            logger.error('❌ Health check fallido:', error.message);
            return false;
        }
    }
}

// Patrón Singleton
module.exports = new DatabasePool();
