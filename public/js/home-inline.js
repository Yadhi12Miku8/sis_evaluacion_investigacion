// Home page script: check system status
async function checkSystemStatus() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        if (data.status === 'healthy') {
            console.log('✅ Sistema funcionando correctamente');
            console.log('📊 Base de datos:', data.database.connected ? 'Conectada' : 'Desconectada');
        }
    } catch (error) {
        console.warn('⚠️ No se pudo verificar el estado del sistema');
    }
}

document.addEventListener('DOMContentLoaded', checkSystemStatus);
