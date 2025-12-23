const AuthRepository = require('../repositories/Auth.repository');
const UsuarioRepository = require('../repositories/Usuario.repository');
const Usuario = require('../models/Usuario.model');
const { generarToken, verifyToken, verificarToken } = require('../utils/jwt');
const crypto = require('crypto');

class AuthController {
    async login(req, res) {
        try {
            // Aceptar tanto 'email' como 'correo'
            const { correo, email, password } = req.body;
            const correoFinal = correo || email;

            if (!correoFinal || !password) {
                return res.status(400).json({ success: false, message: 'Correo y contraseña requeridos' });
            }

            const authResult = await AuthRepository.authenticate(correoFinal, password);

            if (!authResult || !authResult.success || !authResult.usuario) {
                return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos' });
            }

            const usuarioRow = authResult.usuario;

            if (usuarioRow.estado !== 'Activo') {
                return res.status(401).json({ success: false, message: 'Usuario inactivo' });
            }

            const usuario = new Usuario(usuarioRow);
            const token = generarToken(usuarioRow);

            const redirectTo = usuario.getDashboardPath();

            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                redirectTo,
                token,
                usuario: {
                    usuario_id: usuario.id,
                    nombres: usuario.nombres,
                    apellidos: usuario.apellidos,
                    correo: usuario.correoInstitucional,
                    rol: usuario.rol
                }
            });

        } catch (err) {
            console.error('Error en AuthController.login:', err);
            res.status(500).json({ success: false, message: 'Error en servidor' });
        }
    }

    async verify(req, res) {
        try {
            const authHeader = req.headers.authorization || '';
            if (!authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ success: false, message: 'Token requerido' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = verificarToken ? verificarToken(token) : null;

            if (!decoded) {
                return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
            }

            const usuario = await UsuarioRepository.findById(decoded.id);
            if (!usuario || !usuario.esActivo()) {
                return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
            }

            res.json({ success: true, message: 'Token válido', usuario: {
                id: usuario.id,
                nombre: usuario.nombreCompleto,
                rol: usuario.rol,
                correo: usuario.correoInstitucional,
                redirectTo: usuario.getDashboardPath()
            }});

        } catch (error) {
            console.error('Error en AuthController.verify:', error);
            res.status(500).json({ success: false, message: 'Error en servidor' });
        }
    }

    async logout(req, res) {
        // En implementación sin estado, sólo responder éxito
        try {
            res.json({ success: true, message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            console.error('Error en AuthController.logout:', error);
            res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
        }
    }
}

module.exports = new AuthController();
