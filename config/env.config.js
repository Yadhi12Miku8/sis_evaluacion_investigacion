const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const env = {
    // Base de datos
    DB_HOST: process.env.DB_HOST || '127.0.0.1',
    DB_PORT: parseInt(process.env.DB_PORT) || 3306,
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'sistema_investigacion_innovacion',
    
    // Pool de conexiones
    DB_CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    DB_QUEUE_LIMIT: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
    
    // Aplicación
    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_PORT: parseInt(process.env.APP_PORT) || 3000
};

// Validar variables requeridas
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
requiredVars.forEach(varName => {
    if (!env[varName]) {
        throw new Error(`❌ La variable de entorno ${varName} es requerida`);
    }
});

module.exports = env;