class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = document.getElementById('btnText');
        this.spinner = document.getElementById('spinner');
        this.alertMessage = document.getElementById('alertMessage');
        this.modal = document.getElementById('passwordModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.forgotPasswordLink = document.getElementById('forgotPassword');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDemoCredentials();
        this.checkRememberedUser();
    }

    setupEventListeners() {
        // Toggle password visibility
        if (this.togglePasswordBtn) {
            this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        }
        
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        // Modal
        if (this.forgotPasswordLink) {
            this.forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal();
            });
        }
        
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.hideModal());
        }
        
        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideModal();
                }
            });
        }
        
        // Real-time validation
        if (this.emailInput) {
            this.emailInput.addEventListener('input', () => this.validateEmail());
            this.emailInput.addEventListener('blur', () => this.validateEmail());
        }
        
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', () => this.validatePassword());
            this.passwordInput.addEventListener('blur', () => this.validatePassword());
        }
        
        // Enter key to submit
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.submitBtn.disabled) {
                this.form.dispatchEvent(new Event('submit'));
            }
        });
    }

    setupDemoCredentials() {
        // Mostrar información de demo
        console.log('🔐 Credenciales de demo:');
        console.log('📧 Email: lcardenasp@institutocajas.edu.pe');
        console.log('🔑 Contraseña: 00000001 (DNI)');
        
        // También puedes mostrarlo en la consola de manera más visible
        console.log('%c🔐 CREDENCIALES DE DEMO', 'color: #667eea; font-size: 16px; font-weight: bold;');
        console.log('%c📧 Email: lcardenasp@institutocajas.edu.pe', 'color: #764ba2;');
        console.log('%c🔑 Contraseña: 00000001', 'color: #764ba2;');
    }

    checkRememberedUser() {
        // Verificar si hay un usuario recordado
        const rememberedEmail = localStorage.getItem('remembered_email');
        if (rememberedEmail && this.emailInput) {
            this.emailInput.value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    }

    togglePasswordVisibility() {
        if (!this.passwordInput) return;
        
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        
        const icon = this.togglePasswordBtn.querySelector('i');
        if (icon) {
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            // Agregar animación sutil
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 200);
        }
    }

    validateEmail() {
        if (!this.emailInput) return false;
        
        const email = this.emailInput.value.trim();
        const emailError = document.getElementById('emailError');
        
        if (!email) {
            this.showError('emailError', 'El correo electrónico es requerido');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('emailError', 'Ingresa un correo electrónico válido');
            return false;
        }
        
        // Validar dominio institucional si es requerido
        if (email && !email.endsWith('@institutocajas.edu.pe')) {
            this.showError('emailError', 'Debes usar tu correo institucional @institutocajas.edu.pe');
            return false;
        }
        
        this.clearError('emailError');
        return true;
    }

    validatePassword() {
        if (!this.passwordInput) return false;
        
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('passwordError', 'La contraseña es requerida');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('passwordError', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        this.clearError('passwordError');
        return true;
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validar campos
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            this.showAlert('Por favor, corrige los errores en el formulario', 'error');
            return;
        }
        
        // Preparar datos
        const formData = {
            email: this.emailInput.value.trim(),
            password: this.passwordInput.value,
            rememberMe: document.getElementById('rememberMe').checked
        };
        
        // Guardar email si "Recordar sesión" está marcado
        if (formData.rememberMe) {
            localStorage.setItem('remembered_email', formData.email);
            localStorage.setItem('remember_session', 'true');
        } else {
            localStorage.removeItem('remembered_email');
            localStorage.removeItem('remember_session');
        }
        
        // Mostrar loading
        this.setLoading(true);
        
        try {
            // Enviar petición de login real
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Login exitoso
                this.showAlert(data.message || '¡Inicio de sesión exitoso!', 'success');
                
                // Guardar token si es necesario
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                
                // Guardar información del usuario
                if (data.usuario) {
                    localStorage.setItem('user_data', JSON.stringify(data.usuario));
                }
                
                // Redirigir después de 1.5 segundos
                setTimeout(() => {
                    window.location.href = data.redirectTo || '/dashboard';
                }, 1500);
                
            } else {
                // Error de login
                this.showAlert(data.message || 'Error en el inicio de sesión', 'error');
                this.setLoading(false);
                
                // Mostrar error específico si existe
                if (data.errors) {
                    data.errors.forEach(error => {
                        if (error.field === 'email') {
                            this.showError('emailError', error.message);
                        } else if (error.field === 'password') {
                            this.showError('passwordError', error.message);
                        }
                    });
                }
            }
            
        } catch (error) {
            // Error de conexión
            console.error('Error en la petición:', error);
            
            // Mostrar mensaje de error amigable
            this.showAlert('Error de conexión. Verifica tu internet e intenta nuevamente.', 'error');
            this.setLoading(false);
            
            // Mostrar demo como opción
            setTimeout(() => {
                this.showAlert('Puedes usar las credenciales de demo para probar', 'info');
            }, 1000);
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
            
            // Resaltar input con animación
            const input = element.closest('.form-group').querySelector('input');
            if (input) {
                input.style.borderColor = '#e63946';
                input.style.boxShadow = '0 0 0 3px rgba(230, 57, 70, 0.1)';
                
                // Animación de shake
                input.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    input.style.animation = '';
                }, 500);
            }
        }
    }

    clearError(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
            
            // Restaurar borde del input
            const input = element.closest('.form-group').querySelector('input');
            if (input) {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            }
        }
    }

    showAlert(message, type = 'info') {
        if (!this.alertMessage) return;
        
        this.alertMessage.textContent = message;
        this.alertMessage.className = `alert ${type}`;
        this.alertMessage.classList.remove('hidden');
        
        // Animación de entrada
        this.alertMessage.style.animation = 'fadeInUp 0.3s ease';
        
        // Ocultar alerta después de 5 segundos
        setTimeout(() => {
            this.alertMessage.style.animation = 'fadeOutDown 0.3s ease';
            setTimeout(() => {
                this.alertMessage.classList.add('hidden');
                this.alertMessage.style.animation = '';
            }, 300);
        }, 5000);
    }

    setLoading(isLoading) {
        if (!this.btnText || !this.spinner || !this.submitBtn) return;
        
        if (isLoading) {
            this.btnText.textContent = 'Autenticando...';
            this.spinner.classList.remove('hidden');
            this.submitBtn.disabled = true;
            this.submitBtn.style.opacity = '0.8';
            this.submitBtn.style.cursor = 'not-allowed';
        } else {
            this.btnText.textContent = 'Iniciar Sesión';
            this.spinner.classList.add('hidden');
            this.submitBtn.disabled = false;
            this.submitBtn.style.opacity = '1';
            this.submitBtn.style.cursor = 'pointer';
        }
    }

    showModal() {
        if (!this.modal) return;
        
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Animación de entrada
        this.modal.style.animation = 'fadeIn 0.3s ease';
    }

    hideModal() {
        if (!this.modal) return;
        
        this.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Método para verificar autenticación
    async checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        if (!token) return { success: false };

        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            return { success: false };
        }
    }

    // Método para cerrar sesión
    async logout() {
        try {
            const token = localStorage.getItem('auth_token');
            
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            
            // Limpiar localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('user_email');
            
            // Redirigir al login
            window.location.href = '/inicio-sesion';
            
        } catch (error) {
            console.error('Error cerrando sesión:', error);
            
            // Aún así limpiar y redirigir
            localStorage.clear();
            window.location.href = '/inicio-sesion';
        }
    }

    // Método para recuperar contraseña
    async requestPasswordReset(email) {
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error solicitando recuperación:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const loginManager = new LoginManager();
    
    loginManager.checkAuthStatus().then(data => {
        const remembered = localStorage.getItem('remember_session') === 'true';
        if (remembered && data && data.success) {
            const redirectTo = data.usuario && data.usuario.redirectTo ? data.usuario.redirectTo : '/dashboard';
            window.location.href = redirectTo;
        }
    });
    
    // Hacer loginManager disponible globalmente
    window.loginManager = loginManager;
    
    // Añadir estilos CSS para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOutDown {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(10px);
            }
        }
        
        .input-error {
            border-color: #e63946 !important;
            box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1) !important;
        }
    `;
    document.head.appendChild(style);
});

// Exportar la clase para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginManager;
}
