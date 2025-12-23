async function logoutInline() {
    try {
        const token = localStorage.getItem('auth_token');
        await fetch('/api/auth/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
    } catch (err) {
        console.error('Error al cerrar sesión:', err);
    }
    localStorage.removeItem('auth_token');
    window.location.href = '/inicio-sesion';
}

function searchUsersInline() {
    const term = prompt('Ingresa el nombre a buscar:');
    if (term) window.open(`/api/usuarios/search?term=${encodeURIComponent(term)}`, '_blank');
}

async function checkHealthInline() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        if (data.status === 'healthy') alert('✅ Sistema funcionando correctamente\n📊 Base de datos: Conectada');
        else alert('⚠️ Sistema tiene problemas\n📊 Base de datos: Desconectada');
    } catch (e) { alert('❌ Error al verificar el estado del sistema'); }
}

function viewProfileInline(){ alert('Funcionalidad en desarrollo: Ver perfil completo'); }
function changePasswordInline(){ alert('Funcionalidad en desarrollo: Cambiar contraseña'); }
function viewReportsInline(){ alert('Funcionalidad en desarrollo: Generar reportes'); }
function systemSettingsInline(){ alert('Funcionalidad en desarrollo: Ajustes del sistema'); }

async function verifyAuthInline() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) { window.location.href = '/inicio-sesion'; return; }
        const response = await fetch('/api/auth/verify', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) { localStorage.removeItem('auth_token'); window.location.href = '/inicio-sesion'; }
    } catch (error) { console.error('Error verificando autenticación:', error); window.location.href = '/inicio-sesion'; }
}

setInterval(verifyAuthInline, 300000);
document.addEventListener('DOMContentLoaded', verifyAuthInline);
