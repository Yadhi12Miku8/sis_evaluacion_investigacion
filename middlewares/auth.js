const jwt = require('jsonwebtoken');

module.exports = function (rolesPermitidos = []) {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(403).json({ message: 'Token requerido' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (rolesPermitidos.length && !rolesPermitidos.includes(decoded.rol)) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};