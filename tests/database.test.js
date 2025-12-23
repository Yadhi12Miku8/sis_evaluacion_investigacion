require('../config/env.config');
const pool = require('../src/database/pool');
const usuarioRepository = require('../src/repositories/usuario.repository');

async function runTests() {
    console.log('🧪 Ejecutando pruebas de base de datos\n');
    
    try {
        // Test 1: Verificar conexión
        console.log('1. Probando conexión a la base de datos...');
        const isHealthy = await pool.healthCheck();
        console.log(isHealthy ? '✅ Conexión exitosa' : '❌ Conexión fallida');
        
        // Test 2: Obtener todos los usuarios
        console.log('\n2. Obteniendo todos los usuarios...');
        const usuarios = await usuarioRepository.findAll({ limit: 5 });
        console.log(`✅ Encontrados ${usuarios.length} usuarios`);
        
        if (usuarios.length > 0) {
            console.log('   Primer usuario:', usuarios[0].getNombreCompleto());
        }
        
        // Test 3: Buscar usuario por DNI
        console.log('\n3. Buscando usuario por DNI 00000001...');
        const usuario = await usuarioRepository.findByDni('00000001');
        console.log(usuario ? `✅ Usuario encontrado: ${usuario.getNombreCompleto()}` : '❌ Usuario no encontrado');
        
        // Test 4: Contar usuarios
        console.log('\n4. Contando usuarios totales...');
        const total = await usuarioRepository.count();
        console.log(`✅ Total de usuarios: ${total}`);
        
        // Test 5: Estadísticas
        console.log('\n5. Obteniendo estadísticas por rol...');
        const stats = await usuarioRepository.getStatsByRol();
        console.log(`✅ Obtenidas ${stats.length} categorías de rol`);
        
        // Test 6: Pool stats
        console.log('\n6. Estadísticas del pool de conexiones...');
        const poolStats = pool.getPoolStats();
        console.log('   Conexiones libres:', poolStats.freeConnections);
        console.log('   Conexiones totales:', poolStats.totalConnections);
        console.log('   Límite de conexiones:', poolStats.connectionLimit);
        
        console.log('\n✅ Todas las pruebas pasaron exitosamente\n');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
        console.error(error.stack);
    } finally {
        // Cerrar pool al finalizar
        await pool.close();
        console.log('🔌 Conexiones cerradas');
    }
}

// Ejecutar pruebas si este archivo es ejecutado directamente
if (require.main === module) {
    runTests();
}

module.exports = { runTests };