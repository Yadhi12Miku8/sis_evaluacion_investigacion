const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_2025';

function generarToken(usuario) {
    return jwt.sign(
        {
            id: usuario.id,
            correo: usuario.correo_institucional,
            rol: usuario.rol
        },
        SECRET_KEY,
        { expiresIn: '8h' }
    );
}

function verificarToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
}

// Alias compatible con diferentes nombres usados en el proyecto
function verifyToken(token) {
    return verificarToken(token);
}

module.exports = { generarToken, verificarToken, verifyToken };