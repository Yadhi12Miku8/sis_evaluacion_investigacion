class AuthCredentials {
    constructor({ email = '', password = '', rememberMe = false } = {}) {
        this.email = email;
        this.password = password;
        this.rememberMe = rememberMe;
    }

    /**
     * Valida las credenciales de login
     * @returns {Array} Lista de errores de validación
     */
    validateLogin() {
        const errors = [];

        if (!this.email || this.email.trim().length === 0) {
            errors.push('El correo electrónico es requerido');
        } else if (!this.isValidEmail(this.email)) {
            errors.push('El correo electrónico no es válido');
        }

        if (!this.password || this.password.trim().length === 0) {
            errors.push('La contraseña es requerida');
        } else if (this.password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        return errors;
    }

    /**
     * Valida un email
     * @param {string} email - Email a validar
     * @returns {boolean} True si el email es válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Sanitiza los datos del formulario
     * @returns {AuthCredentials} Instancia sanitaria
     */
    sanitize() {
        return new AuthCredentials({
            email: this.email.trim().toLowerCase(),
            password: this.password.trim(),
            rememberMe: Boolean(this.rememberMe)
        });
    }

    /**
     * Convierte el modelo a un objeto plano
     * @returns {Object} Objeto plano con las credenciales
     */
    toJSON() {
        return {
            email: this.email,
            rememberMe: this.rememberMe
        };
    }
}

class AuthResponse {
    constructor({ success = false, message = '', token = null, user = null, redirectTo = '/' } = {}) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.user = user;
        this.redirectTo = redirectTo;
        this.timestamp = new Date().toISOString();
    }

    /**
     * Crea una respuesta de éxito
     * @param {Object} data - Datos de la respuesta
     * @returns {AuthResponse} Respuesta de éxito
     */
    static success(data) {
        return new AuthResponse({
            success: true,
            message: data.message || 'Operación exitosa',
            token: data.token,
            user: data.user,
            redirectTo: data.redirectTo || '/dashboard'
        });
    }

    /**
     * Crea una respuesta de error
     * @param {string} message - Mensaje de error
     * @param {number} statusCode - Código de estado HTTP
     * @returns {AuthResponse} Respuesta de error
     */
    static error(message, statusCode = 400) {
        return new AuthResponse({
            success: false,
            message: message,
            statusCode: statusCode
        });
    }

    /**
     * Convierte la respuesta a JSON
     * @returns {Object} Respuesta en formato JSON
     */
    toJSON() {
        return {
            success: this.success,
            message: this.message,
            token: this.token,
            user: this.user,
            redirectTo: this.redirectTo,
            timestamp: this.timestamp
        };
    }
}

module.exports = { AuthCredentials, AuthResponse };