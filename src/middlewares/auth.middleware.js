const JWT = require('../utils/jwt');
const UsuarioRepository = require('../repositories/Usuario.repository');

const authMiddleware = {
  // Middleware para verificar token
  verifyToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Acceso no autorizado. Token requerido.'
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = JWT.verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }

      // Verificar usuario en base de datos
      const usuario = await UsuarioRepository.findById(decoded.id);
      
      if (!usuario || !usuario.esActivo()) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo'
        });
      }

      // Adjuntar usuario a la request
      req.user = {
        id: usuario.id,
        email: usuario.correoInstitucional,
        nombre: usuario.nombreCompleto,
        rol: usuario.rol,
        programaEstudioId: usuario.programaEstudioId
      };

      next();
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Middleware para verificar roles
  checkRole: (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!roles.includes(req.user.rol)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
      }

      next();
    };
  }
};

module.exports = authMiddleware;