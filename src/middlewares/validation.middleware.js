const { body, validationResult } = require('express-validator');
const { AuthCredentials } = require('../models/Auth.model');
const authRepository = require('../repositories/Auth.repository');
const logger = require('../utils/logger');

class ValidationMiddleware {
    /**
     * Valida el formulario de login
     * @returns {Array} Array de middlewares de validación
     */
    validateLogin() {
        return [
            // Sanitizar y validar email
            body('email')
                .trim()
                .toLowerCase()
                .notEmpty().withMessage('El correo electrónico es requerido')
                .isEmail().withMessage('Ingresa un correo electrónico válido')
                .custom(async (email) => {
                    const exists = await authRepository.emailExists(email);
                    if (!exists) {
                        throw new Error('Correo electrónico no registrado');
                    }
                    return true;
                }),
            
            // Validar contraseña
            body('password')
                .trim()
                .notEmpty().withMessage('La contraseña es requerida')
                .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
            
            // Validar rememberMe
            body('rememberMe')
                .optional()
                .isBoolean().withMessage('Remember me debe ser verdadero o falso'),
            
            // Manejar errores de validación
            this.handleValidationErrors
        ];
    }

    /**
     * Maneja los errores de validación
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {Function} next - Next function
     */
    async handleValidationErrors(req, res, next) {
        try {
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                const formattedErrors = errors.array().map(error => ({
                    field: error.path,
                    message: error.msg
                }));

                logger.warn(`Errores de validación en ${req.path}:`, formattedErrors);
                
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: formattedErrors
                });
            }

            // Sanitizar los datos
            const credentials = new AuthCredentials({
                email: req.body.email,
                password: req.body.password,
                rememberMe: req.body.rememberMe === 'true'
            }).sanitize();

            req.credentials = credentials;
            next();
        } catch (error) {
            logger.error('Error en middleware de validación:', error.message);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    /**
     * Valida el cambio de contraseña
     * @returns {Array} Array de middlewares de validación
     */
    validateChangePassword() {
        return [
            body('currentPassword')
                .trim()
                .notEmpty().withMessage('La contraseña actual es requerida'),
            
            body('newPassword')
                .trim()
                .notEmpty().withMessage('La nueva contraseña es requerida')
                .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
                .custom((password, { req }) => {
                    if (password === req.body.currentPassword) {
                        throw new Error('La nueva contraseña debe ser diferente a la actual');
                    }
                    return true;
                }),
            
            body('confirmPassword')
                .trim()
                .notEmpty().withMessage('Confirma tu nueva contraseña')
                .custom((confirmPassword, { req }) => {
                    if (confirmPassword !== req.body.newPassword) {
                        throw new Error('Las contraseñas no coinciden');
                    }
                    return true;
                }),
            
            this.handleValidationErrors
        ];
    }

    /**
     * Valida la recuperación de contraseña
     * @returns {Array} Array de middlewares de validación
     */
    validatePasswordReset() {
        return [
            body('email')
                .trim()
                .toLowerCase()
                .notEmpty().withMessage('El correo electrónico es requerido')
                .isEmail().withMessage('Ingresa un correo electrónico válido'),
            
            this.handleValidationErrors
        ];
    }

    /**
     * Valida el registro de usuario
     * @returns {Array} Array de middlewares de validación
     */
    validateRegister() {
        return [
            body('dni')
                .trim()
                .notEmpty().withMessage('El DNI es requerido')
                .isLength({ min: 8, max: 20 }).withMessage('El DNI debe tener entre 8 y 20 caracteres'),
            
            body('nombres')
                .trim()
                .notEmpty().withMessage('Los nombres son requeridos')
                .isLength({ min: 2, max: 100 }).withMessage('Los nombres deben tener entre 2 y 100 caracteres'),
            
            body('apellidos')
                .trim()
                .notEmpty().withMessage('Los apellidos son requeridos')
                .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),
            
            body('correo_institucional')
                .trim()
                .toLowerCase()
                .notEmpty().withMessage('El correo institucional es requerido')
                .isEmail().withMessage('Ingresa un correo institucional válido')
                .custom(async (email) => {
                    const exists = await authRepository.emailExists(email);
                    if (exists) {
                        throw new Error('Este correo ya está registrado');
                    }
                    return true;
                }),
            
            body('rol')
                .trim()
                .notEmpty().withMessage('El rol es requerido')
                .isIn([
                    'Docente Investigador',
                    'Jefe de Unidad de Investigacion',
                    'Director General',
                    'Comite Editor',
                    'Administrador'
                ]).withMessage('Rol no válido'),
            
            this.handleValidationErrors
        ];
    }
}

module.exports = new ValidationMiddleware();