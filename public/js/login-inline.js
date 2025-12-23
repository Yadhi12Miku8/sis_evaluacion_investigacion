class LoginManagerInline {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.submitBtn = document.getElementById('submitBtn');
        this.alert = document.getElementById('alert');
        this.init();
    }

    init() {
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('demoBtn')?.addEventListener('click', () => {
            this.emailInput.value = 'lcardenasp@institutocajas.edu.pe';
            this.passwordInput.value = '00000001';
        });
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        const icon = this.togglePasswordBtn.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.emailInput.value || !this.passwordInput.value) {
            this.showAlert('Por favor, completa todos los campos', 'error');
            return;
        }
        const formData = {
            email: this.emailInput.value.trim(),
            password: this.passwordInput.value,
            rememberMe: document.getElementById('rememberMe').checked
        };
        this.setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok && data.success) {
                this.showAlert('Login exitoso. Redirigiendo...', 'success');
                if (data.token) localStorage.setItem('auth_token', data.token);
                setTimeout(() => {
                    window.location.href = data.redirectTo || '/dashboard';
                }, 1200);
            } else {
                this.showAlert(data.message || data.error || 'Credenciales inválidas', 'error');
                this.setLoading(false);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showAlert('Error de conexión con el servidor', 'error');
            this.setLoading(false);
        }
    }

    showAlert(message, type = 'info') {
        this.alert.textContent = message;
        this.alert.className = `alert ${type}`;
        this.alert.style.display = 'block';
        setTimeout(() => { this.alert.style.display = 'none'; }, 5000);
    }

    setLoading(isLoading) {
        if (isLoading) { this.submitBtn.textContent = 'Autenticando...'; this.submitBtn.disabled = true; }
        else { this.submitBtn.textContent = 'Iniciar Sesión'; this.submitBtn.disabled = false; }
    }
}

document.addEventListener('DOMContentLoaded', () => { new LoginManagerInline(); });
