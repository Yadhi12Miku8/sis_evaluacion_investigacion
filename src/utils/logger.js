const env = require('../../config/env.config');

class Logger {
    constructor() {
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };

        this.currentLevel = this.levels[env.NODE_ENV === 'development' ? 'debug' : 'info'];
    }

    /**
     * Registra un mensaje de error
     * @param {string} message - Mensaje principal
     * @param {any} data - Datos adicionales
     */
    error(message, data = null) {
        if (this.currentLevel >= this.levels.error) {
            console.error(`[❌ ERROR] ${new Date().toISOString()} - ${message}`);
            if (data) {
                console.error('Detalles:', data);
            }
        }
    }

    /**
     * Registra un mensaje de advertencia
     * @param {string} message - Mensaje principal
     * @param {any} data - Datos adicionales
     */
    warn(message, data = null) {
        if (this.currentLevel >= this.levels.warn) {
            console.warn(`[⚠️ WARN] ${new Date().toISOString()} - ${message}`);
            if (data) {
                console.warn('Detalles:', data);
            }
        }
    }

    /**
     * Registra un mensaje informativo
     * @param {string} message - Mensaje principal
     * @param {any} data - Datos adicionales
     */
    info(message, data = null) {
        if (this.currentLevel >= this.levels.info) {
            console.log(`[ℹ️ INFO] ${new Date().toISOString()} - ${message}`);
            if (data) {
                console.log('Detalles:', data);
            }
        }
    }

    /**
     * Registra un mensaje de depuración
     * @param {string} message - Mensaje principal
     * @param {any} data - Datos adicionales
     */
    debug(message, data = null) {
        if (this.currentLevel >= this.levels.debug) {
            console.debug(`[🔍 DEBUG] ${new Date().toISOString()} - ${message}`);
            if (data) {
                console.debug('Detalles:', data);
            }
        }
    }

    /**
     * Registra una consulta SQL
     * @param {string} sql - Consulta SQL
     * @param {Array} params - Parámetros
     * @param {number} duration - Duración en ms
     */
    sql(sql, params, duration) {
        if (this.currentLevel >= this.levels.debug) {
            console.debug(`[🗃️ SQL] ${new Date().toISOString()} - ${duration}ms`);
            console.debug('Consulta:', sql);
            if (params && params.length > 0) {
                console.debug('Parámetros:', params);
            }
        }
    }
}

module.exports = new Logger();