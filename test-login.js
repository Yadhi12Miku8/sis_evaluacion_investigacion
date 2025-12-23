const crypto = require('crypto');
const mysql = require('mysql2/promise');

// Credenciales para probar
const testEmail = 'lcardenasp@institutocajas.edu.pe';
const testPassword = 'Lourdes123';

// Hash SHA256 de la contraseña
const passwordHash = crypto.createHash('sha256').update(testPassword).digest('hex');

console.log('=== TEST DE LOGIN ===');
console.log(`Email: ${testEmail}`);
console.log(`Contraseña: ${testPassword}`);
console.log(`SHA256 Hash: ${passwordHash}`);
console.log('');

// Conectar a la BD y verificar
(async () => {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sistema_investigacion_innovacion'
        });

        const conn = await pool.getConnection();
        
        // Buscar el usuario
        const [usuarios] = await conn.query(
            'SELECT id, correo_institucional, nombres, apellidos, rol, estado, password FROM usuarios WHERE correo_institucional = ?',
            [testEmail]
        );

        conn.release();

        if (usuarios.length === 0) {
            console.log('❌ Usuario NO encontrado en la base de datos');
            process.exit(1);
        }

        const usuario = usuarios[0];
        console.log('✅ Usuario encontrado:');
        console.log(`   ID: ${usuario.id}`);
        console.log(`   Nombre: ${usuario.nombres} ${usuario.apellidos}`);
        console.log(`   Email: ${usuario.correo_institucional}`);
        console.log(`   Rol: ${usuario.rol}`);
        console.log(`   Estado: ${usuario.estado}`);
        console.log(`   Password en BD (primeros 20 chars): ${usuario.password.substring(0, 20)}...`);
        console.log('');

        // Verificar estado
        if (usuario.estado !== 'Activo') {
            console.log(`❌ Usuario NO está activo. Estado: ${usuario.estado}`);
            process.exit(1);
        }
        console.log('✅ Usuario activo');

        // Verificar contraseña
        console.log('');
        console.log('Comparando contraseñas:');
        console.log(`   Hash calculado:  ${passwordHash}`);
        console.log(`   Hash en BD:      ${usuario.password}`);
        
        if (passwordHash === usuario.password) {
            console.log('✅ Contraseña es CORRECTA');
        } else {
            console.log('❌ Contraseña es INCORRECTA');
            process.exit(1);
        }

        // Mostrar redirección esperada
        console.log('');
        console.log('=== RESULTADO ESPERADO ===');
        const dashboards = {
            'Docente Investigador': '/dashboard/docente',
            'Jefe de Unidad de Investigacion': '/dashboard/jefe-unidad',
            'Director General': '/dashboard/director',
            'Comite Editor': '/dashboard/comite-editor',
            'Administrador': '/dashboard/admin'
        };
        
        const dashboardUrl = dashboards[usuario.rol] || '/dashboard';
        console.log(`El usuario debería ser redirigido a: ${dashboardUrl}`);
        console.log('');
        console.log('✅ TODO ESTÁ CONFIGURADO CORRECTAMENTE');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
