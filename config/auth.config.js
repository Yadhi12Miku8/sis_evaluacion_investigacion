const env = require('./env.config');

module.exports = {
    // Configuración de JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'sistema_investigacion_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        algorithm: 'HS256'
    },
    
    // Configuración de sesiones
    session: {
        secret: process.env.SESSION_SECRET || 'session_secret_key',
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 24 horas
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        },
        resave: false,
        saveUninitialized: false
    },
    
    // Configuración de bcrypt
    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
    },
    
    // Roles y permisos
    roles: {
        'Docente Investigador': 1,
        'Jefe de Unidad de Investigacion': 2,
        'Director General': 3,
        'Comite Editor': 4,
        'Administrador': 5
    },
    
    // Rutas protegidas por rol
    protectedRoutes: {
        '/admin': ['Administrador', 'Director General'],
        '/unidad-investigacion': ['Jefe de Unidad de Investigacion', 'Administrador'],
        '/comite-editor': ['Comite Editor', 'Administrador'],
        '/dashboard': ['Docente Investigador', 'Jefe de Unidad de Investigacion', 'Director General', 'Comite Editor', 'Administrador']
    }
};