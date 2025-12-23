const env = require('./config/env.config');
const logger = require('./src/utils/logger');
const pool = require('./src/database/pool');
const http = require('http');
const url = require('url');
const usuarioRepository = require('./src/repositories/Usuario.repository');
const authRepository = require('./src/repositories/Auth.repository');
const jwtUtil = require('./src/utils/jwt');
const bcryptUtil = require('./src/utils/bcrypt');
const crypto = require('crypto');

class SistemaInvestigacionApp {
    constructor() {
        this.server = null;
        this.setupGracefulShutdown();
    }

    async start() {
        try {
            logger.info('🚀 Iniciando Sistema de Investigación e Innovación');
            logger.info(`📊 Entorno: ${env.NODE_ENV}`);
            logger.info(`🌐 Puerto: ${env.APP_PORT}`);

            // Verificar conexión a la base de datos
            const isHealthy = await pool.healthCheck();
            if (!isHealthy) {
                throw new Error('❌ No se pudo conectar a la base de datos');
            }

            // Mostrar estadísticas del pool
            const stats = pool.getPoolStats();
            logger.info(`🏊 Pool de conexiones: ${stats.freeConnections}/${stats.totalConnections} libres`);

            // Health check periódico
            setInterval(async () => {
                try {
                    const healthy = await pool.healthCheck();
                    if (!healthy) {
                        logger.warn('⚠️ Health check fallido');
                    }
                } catch (error) {
                    logger.error('❌ Error en health check periódico:', error.message);
                }
            }, 30000);

            // Iniciar servidor HTTP
            this.startServer();

        } catch (error) {
            logger.error('❌ Error al iniciar la aplicación:', error.message);
            process.exit(1);
        }
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            logger.info(`\n📭 Recibida señal ${signal}. Cerrando aplicación...`);
            
            try {
                // Cerrar servidor HTTP
                if (this.server) {
                    this.server.close();
                }
                
                // Cerrar pool de conexiones
                await pool.close();
                
                logger.info('✅ Aplicación cerrada correctamente');
                process.exit(0);
            } catch (error) {
                logger.error('❌ Error al cerrar la aplicación:', error.message);
                process.exit(1);
            }
        };

        // Manejadores de señales
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGUSR2', () => shutdown('SIGUSR2')); // Para nodemon

        // Manejo de errores no capturados
        process.on('uncaughtException', (error) => {
            logger.error('❌ Error no capturado:', error.message);
            shutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('❌ Promise rechazada no manejada:', reason);
            shutdown('unhandledRejection');
        });
    }

    sendJson(res, status, data) {
        res.writeHead(status, { 
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end(JSON.stringify(data, null, 2));
    }

    sendHtml(res, status, html) {
        res.writeHead(status, { 
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(html);
    }

    sendError(res, status, message, details = null) {
        const errorResponse = {
            success: false,
            error: message,
            timestamp: new Date().toISOString()
        };

        if (details && env.NODE_ENV === 'development') {
            errorResponse.details = details;
        }

        this.sendJson(res, status, errorResponse);
    }

    sendSuccess(res, data = null, message = 'Operación exitosa') {
        const response = {
            success: true,
            message: message,
            timestamp: new Date().toISOString()
        };

        if (data !== null) {
            response.data = data;
        }

        this.sendJson(res, 200, response);
    }

    parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (error) {
                    reject(new Error('Cuerpo de la petición JSON inválido'));
                }
            });
            req.on('error', reject);
        });
    }

    authenticateRequest(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        return jwtUtil.verifyToken(token);
    }

    async handleLogin(req, res) {
        try {
            const body = await this.parseBody(req);
            
            if (!body.email || !body.password) {
                return this.sendError(res, 400, 'Email y contraseña son requeridos');
            }

            // Autenticar usuario
            const usuario = await authRepository.authenticate(body.email, body.password);
            
            if (!usuario) {
                return this.sendError(res, 401, 'Credenciales inválidas');
            }

            // Actualizar último login
            await authRepository.updateLastLogin(usuario.id);

            // Generar token JWT
            const token = jwtUtil.generateToken(usuario);

            // Preparar respuesta
            const userData = {
                id: usuario.id,
                dni: usuario.dni,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                correo_institucional: usuario.correo_institucional,
                telefono: usuario.telefono,
                programa_estudio_id: usuario.programa_estudio_id,
                rol: usuario.rol,
                estado: usuario.estado,
                nombre_completo: usuario.getNombreCompleto()
            };

            this.sendSuccess(res, {
                token: token,
                user: userData
            }, 'Login exitoso');

        } catch (error) {
            logger.error('Error en login:', error.message);
            this.sendError(res, 500, 'Error en el servidor', error.message);
        }
    }

    async handleVerifyToken(req, res) {
        try {
            const decoded = this.authenticateRequest(req);
            
            if (!decoded) {
                return this.sendError(res, 401, 'Token inválido o expirado');
            }

            // Verificar si el usuario aún existe
            const usuario = await usuarioRepository.findById(decoded.id);
            if (!usuario || usuario.estado !== 'Activo') {
                return this.sendError(res, 401, 'Usuario no encontrado o inactivo');
            }

            this.sendSuccess(res, {
                user: usuario.toJSON(),
                valid: true
            }, 'Token válido');

        } catch (error) {
            logger.error('Error verificando token:', error.message);
            this.sendError(res, 500, 'Error en el servidor');
        }
    }

    async handleGetUsuarios(req, res, query) {
        try {
            const options = {
                limit: query.limit ? parseInt(query.limit, 10) : 100,
                offset: query.offset ? parseInt(query.offset, 10) : 0,
                estado: query.estado || null,
                rol: query.rol || null,
                orderBy: query.orderBy || 'id',
                order: query.order || 'ASC'
            };

            const usuarios = await usuarioRepository.findAll(options);
            
            this.sendSuccess(res, {
                usuarios: usuarios.map(u => u.toJSON()),
                pagination: {
                    limit: options.limit,
                    offset: options.offset,
                    total: usuarios.length
                }
            }, 'Usuarios obtenidos exitosamente');

        } catch (error) {
            logger.error('Error obteniendo usuarios:', error.message);
            this.sendError(res, 500, 'Error al obtener usuarios');
        }
    }

    async handleGetUsuarioByDni(req, res, dni) {
        try {
            const usuario = await usuarioRepository.findByDni(dni);
            
            if (!usuario) {
                return this.sendError(res, 404, `Usuario con DNI ${dni} no encontrado`);
            }

            this.sendSuccess(res, usuario.toJSON(), 'Usuario encontrado');

        } catch (error) {
            logger.error(`Error obteniendo usuario DNI ${dni}:`, error.message);
            this.sendError(res, 500, 'Error al obtener usuario');
        }
    }

    async handleSearchUsuarios(req, res, term) {
        try {
            if (!term || term.trim().length < 2) {
                return this.sendError(res, 400, 'El término de búsqueda debe tener al menos 2 caracteres');
            }

            const usuarios = await usuarioRepository.searchByName(term);
            
            this.sendSuccess(res, {
                resultados: usuarios.map(u => u.toJSON()),
                count: usuarios.length,
                termino: term
            }, 'Búsqueda completada');

        } catch (error) {
            logger.error('Error en búsqueda:', error.message);
            this.sendError(res, 500, 'Error en la búsqueda');
        }
    }

    async handleGetStats(req, res) {
        try {
            const stats = await usuarioRepository.getStatsByRol();
            
            this.sendSuccess(res, {
                estadisticas: stats,
                timestamp: new Date().toISOString()
            }, 'Estadísticas obtenidas');

        } catch (error) {
            logger.error('Error obteniendo estadísticas:', error.message);
            this.sendError(res, 500, 'Error al obtener estadísticas');
        }
    }

    async handleHealthCheck(req, res) {
        try {
            const dbHealthy = await pool.healthCheck();
            const poolStats = pool.getPoolStats();
            
            const healthInfo = {
                status: dbHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: {
                    connected: dbHealthy,
                    poolStats: poolStats
                },
                system: {
                    node_version: process.version,
                    platform: process.platform,
                    memory: process.memoryUsage()
                }
            };

            const statusCode = dbHealthy ? 200 : 503;
            
            res.writeHead(statusCode, { 
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(healthInfo, null, 2));

        } catch (error) {
            logger.error('Error en health check:', error.message);
            this.sendError(res, 500, 'Error en health check');
        }
    }

    async handleGetUsuarioById(req, res, id) {
        try {
            const usuario = await usuarioRepository.findById(id);

            if (!usuario) {
                return this.sendError(res, 404, `Usuario con ID ${id} no encontrado`);
            }

            this.sendSuccess(res, usuario.toJSON(), 'Usuario encontrado');

        } catch (error) {
            logger.error(`Error obteniendo usuario ID ${id}:`, error.message);
            this.sendError(res, 500, 'Error al obtener usuario');
        }
    }

    async handleCreateUsuario(req, res) {
        try {
            const body = await this.parseBody(req);

            const required = ['dni', 'nombres', 'apellidos', 'correo_institucional', 'rol', 'password'];
            const missing = required.filter(k => !body || !String(body[k] || '').trim());
            if (missing.length) {
                return this.sendError(res, 400, `Campos requeridos: ${missing.join(', ')}`);
            }

            const existing = await usuarioRepository.findByEmail(body.correo_institucional);
            if (existing) {
                return this.sendError(res, 409, 'Ya existe un usuario con ese correo institucional');
            }

            const passwordHash = crypto.createHash('sha256').update(String(body.password)).digest('hex');

            const created = await usuarioRepository.create({
                dni: String(body.dni).trim(),
                nombres: String(body.nombres).trim(),
                apellidos: String(body.apellidos).trim(),
                correo_institucional: String(body.correo_institucional).trim(),
                telefono: body.telefono ? String(body.telefono).trim() : null,
                programa_estudio_id: body.programa_estudio_id || null,
                rol: String(body.rol).trim(),
                estado: body.estado ? String(body.estado).trim() : 'Activo',
                password: passwordHash
            });

            if (!created) {
                return this.sendError(res, 500, 'No se pudo crear el usuario');
            }

            this.sendSuccess(res, created.toJSON(), 'Usuario creado exitosamente');
        } catch (error) {
            logger.error('Error creando usuario:', error.message);
            this.sendError(res, 500, 'Error al crear usuario');
        }
    }

    async handleUpdateUsuario(req, res, id) {
        try {
            const body = await this.parseBody(req);
            const usuario = await usuarioRepository.findById(id);
            if (!usuario) {
                return this.sendError(res, 404, `Usuario con ID ${id} no encontrado`);
            }

            const update = {};
            const fields = ['dni', 'nombres', 'apellidos', 'correo_institucional', 'telefono', 'programa_estudio_id', 'rol', 'estado'];
            fields.forEach(k => {
                if (Object.prototype.hasOwnProperty.call(body, k)) update[k] = body[k];
            });

            if (body.password) {
                update.password = crypto.createHash('sha256').update(String(body.password)).digest('hex');
            }

            if (update.correo_institucional && String(update.correo_institucional).trim() !== String(usuario.correoInstitucional).trim()) {
                const existing = await usuarioRepository.findByEmail(String(update.correo_institucional).trim());
                if (existing && Number(existing.id) !== Number(id)) {
                    return this.sendError(res, 409, 'Ya existe un usuario con ese correo institucional');
                }
            }

            const updated = await usuarioRepository.updateById(id, update);
            this.sendSuccess(res, updated ? updated.toJSON() : null, 'Usuario actualizado');
        } catch (error) {
            logger.error('Error actualizando usuario:', error.message);
            this.sendError(res, 500, 'Error al actualizar usuario');
        }
    }

    async handleUpdateUsuarioEstado(req, res, id) {
        try {
            const body = await this.parseBody(req);
            const estado = body && body.estado ? String(body.estado).trim() : '';
            if (!estado || !['Activo', 'Inactivo', 'Pendiente'].includes(estado)) {
                return this.sendError(res, 400, 'Estado inválido (Activo, Inactivo, Pendiente)');
            }

            const usuario = await usuarioRepository.findById(id);
            if (!usuario) {
                return this.sendError(res, 404, `Usuario con ID ${id} no encontrado`);
            }

            const updated = await usuarioRepository.updateEstado(id, estado);
            this.sendSuccess(res, updated ? updated.toJSON() : null, 'Estado actualizado');
        } catch (error) {
            logger.error('Error actualizando estado:', error.message);
            this.sendError(res, 500, 'Error al actualizar estado');
        }
    }

    async handleDeleteUsuario(req, res, id) {
        try {
            const ok = await usuarioRepository.deleteById(id);
            if (!ok) {
                return this.sendError(res, 404, `Usuario con ID ${id} no encontrado`);
            }
            this.sendSuccess(res, { deleted: true, id }, 'Usuario eliminado');
        } catch (error) {
            logger.error('Error eliminando usuario:', error.message);
            this.sendError(res, 500, 'Error al eliminar usuario');
        }
    }

    getHomePage() {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Investigación e Innovación</title>
    <link rel="stylesheet" href="/css/home.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">
                <i class="fas fa-flask"></i>
                <div>
                    <h1>Sistema de Investigación</h1>
                    <p class="subtitle">Gestión de Investigación e Innovación</p>
                </div>
            </div>
        </header>
        
        <div class="content">
            <div class="card">
                <h2><i class="fas fa-rocket"></i> Sistema en Ejecución</h2>
                <p>El sistema de gestión de investigación está funcionando correctamente.</p>
                
                <div class="features">
                    <div class="feature">
                        <i class="fas fa-database"></i>
                        <h3>Base de Datos</h3>
                        <p>Conexión MySQL activa con gestión de usuarios</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-user-shield"></i>
                        <h3>Autenticación</h3>
                        <p>Sistema de login seguro con JWT</p>
                    </div>
                    <div class="feature">
                        <i class="fas fa-chart-bar"></i>
                        <h3>Estadísticas</h3>
                        <p>Reportes y análisis de datos</p>
                    </div>
                </div>
                
                <div class="buttons">
                    <a href="/api/usuarios" class="btn btn-primary" target="_blank">
                        <i class="fas fa-users"></i> Ver Usuarios API
                    </a>
                    <a href="/inicio-sesion" class="btn btn-secondary">
                        <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                    </a>
                    <a href="/api/health" class="btn btn-secondary" target="_blank">
                        <i class="fas fa-heartbeat"></i> Health Check
                    </a>
                </div>
            </div>
            
            <div class="api-info">
                <h2><i class="fas fa-code"></i> API REST Endpoints</h2>
                <div class="endpoint">
                    <strong>POST</strong> <code>/api/auth/login</code> - Autenticación
                </div>
                <div class="endpoint">
                    <strong>GET</strong> <code>/api/usuarios</code> - Listar usuarios
                </div>
                <div class="endpoint">
                    <strong>GET</strong> <code>/api/usuarios/00000001</code> - Usuario por DNI
                </div>
                <div class="endpoint">
                    <strong>GET</strong> <code>/api/usuarios/search?term=Luis</code> - Buscar por nombre
                </div>
                <div class="endpoint">
                    <strong>GET</strong> <code>/api/stats/rol</code> - Estadísticas por rol
                </div>
                <div class="endpoint">
                    <strong>GET</strong> <code>/api/health</code> - Estado del sistema
                </div>
            </div>
        </div>
        
        <footer>
            <p> 2024 Sistema de Gestión de Investigación e Innovación</p>
            <p>Servidor ejecutándose en puerto: ${env.APP_PORT}</p>
        </footer>
    </div>
    
    <script src="/js/home-inline.js"></script>
</body>
</html>`;
    }

    getLoginPage() {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema de Investigación</title>
    <link rel="stylesheet" href="/css/login.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <div class="logo">
                <i class="fas fa-flask"></i>
                <div>
                    <h1>Sistema de Investigación</h1>
                    <p>Iniciar Sesión</p>
                </div>
            </div>
        </div>
        
        <div class="login-form">
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">
                        <i class="fas fa-envelope"></i> Correo Institucional
                    </label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="ejemplo@institutocajas.edu.pe" 
                        required
                    />
                </div>
                <div class="form-group">
                    <label for="password">
                        <i class="fas fa-lock"></i> Contraseña
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="Ingrese su contraseña" 
                        required
                    />
                </div>
                <button id="submitBtn" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
                </button>
            </form>
            <div id="alert" class="alert"></div>
        </div>
        
        <script>
            class LoginManager {
                constructor() {
                    this.submitBtn = document.getElementById('submitBtn');
                    this.alert = document.getElementById('alert');
                    this.loginForm = document.getElementById('loginForm');
                    this.emailInput = document.getElementById('email');
                    this.passwordInput = document.getElementById('password');
                    
                    this.loginForm.addEventListener('submit', this.handleSubmit.bind(this));
                }
                
                async handleSubmit(event) {
                    event.preventDefault();
                    this.setLoading(true);
                    
                    try {
                        const response = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: this.emailInput.value,
                                password: this.passwordInput.value
                            })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success) {
                            // Redirigir después de 1.5 segundos
                            setTimeout(() => {
                                window.location.href = '/dashboard';
                            }, 1500);
                            
                        } else {
                            // Error de login
                            this.showAlert(data.error || 'Credenciales inválidas', 'error');
                            this.setLoading(false);
                        }
                        
                    } catch (error) {
                        // Error de conexión
                        console.error('Error:', error);
                        this.showAlert('Error de conexión con el servidor', 'error');
                        this.setLoading(false);
                    }
                }
                
                showAlert(message, type = 'info') {
                    this.alert.textContent = message;
                    this.alert.className = 'alert ' + type;
                    this.alert.style.display = 'block';
                    
                    // Ocultar alerta después de 5 segundos
                    setTimeout(() => {
                        this.alert.style.display = 'none';
                    }, 5000);
                }
                
                setLoading(isLoading) {
                    if (isLoading) {
                        this.submitBtn.textContent = 'Autenticando...';
                        this.submitBtn.disabled = true;
                    } else {
                        this.submitBtn.textContent = 'Iniciar Sesión';
                        this.submitBtn.disabled = false;
                    }
                }
            }
            
            // Inicializar cuando el DOM esté cargado
            document.addEventListener('DOMContentLoaded', () => {
                new LoginManager();
            });
        </script>
    </body>
</html>`;
    }

    getDashboardPage(user) {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema de Investigación</title>
    <link rel="stylesheet" href="/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="/js/dashboard-inline.js"></script>
</head>
<body>
    <div class="dashboard-container">
        <header>
            <div class="logo">
                <i class="fas fa-flask"></i>
                <div>
                    <h1>Sistema de Investigación</h1>
                    <p>Dashboard</p>
                </div>
            </div>
            <div class="user-info">
                <span>${user.nombre_completo}</span>
                <button id="logoutBtn" class="btn btn-secondary">
                    <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                </button>
            </div>
        </header>
        
        <div class="content">
            <div class="card">
                <h2><i class="fas fa-tachometer-alt"></i> Dashboard</h2>
                <p>Bienvenido al dashboard del sistema de gestión de investigación.</p>
                
                <div class="quick-actions">
                    <button class="action-btn" onclick="searchUsers()">
                        <i class="fas fa-search"></i>
                        <span>Buscar Usuarios</span>
                    </button>
                    <a href="/api/stats/rol" class="action-btn" target="_blank">
                        <i class="fas fa-chart-pie"></i>
                        <span>Ver Estadísticas</span>
                    </a>
                    <button class="action-btn" onclick="checkHealth()">
                        <i class="fas fa-heartbeat"></i>
                        <span>Ver Estado del Sistema</span>
                    </button>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3><i class="fas fa-cogs"></i> Configuración del Sistema</h3>
            <p>Desde aquí puedes acceder a las diferentes configuraciones del sistema según tu rol de ${user.rol}.</p>
            
            <div class="quick-actions" style="margin-top: 20px;">
                <button class="action-btn" onclick="viewProfile()">
                    <i class="fas fa-id-card"></i>
                    <span>Ver Perfil Completo</span>
                </button>
                <button class="action-btn" onclick="changePassword()">
                    <i class="fas fa-key"></i>
                    <span>Cambiar Contraseña</span>
                </button>
                <button class="action-btn" onclick="viewReports()">
                    <i class="fas fa-file-alt"></i>
                    <span>Generar Reportes</span>
                </button>
                <button class="action-btn" onclick="systemSettings()">
                    <i class="fas fa-sliders-h"></i>
                    <span>Ajustes del Sistema</span>
                </button>
            </div>
        </div>
    </div>
    
    <script>
        async function logout() {
            try {
                const token = localStorage.getItem('auth_token');
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });
                
                localStorage.removeItem('auth_token');
                window.location.href = '/inicio-sesion';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                window.location.href = '/inicio-sesion';
            }
        }
        
        function searchUsers() {
            const term = prompt('Ingresa el nombre a buscar:');
            if (term) {
                window.open('/api/usuarios/search?term=' + encodeURIComponent(term), '_blank');
            }
        }
        
        async function checkHealth() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                if (data.status === 'healthy') {
                    alert('✅ Sistema funcionando correctamente\n📊 Base de datos: Conectada');
                } else {
                    alert('⚠️ Sistema tiene problemas\n📊 Base de datos: Desconectada');
                }
            } catch (error) {
                alert('❌ Error al verificar el estado del sistema');
            }
        }
        
        function viewProfile() {
            alert('Funcionalidad en desarrollo: Ver perfil completo');
        }
        
        function changePassword() {
            alert('Funcionalidad en desarrollo: Cambiar contraseña');
        }
        
        function viewReports() {
            alert('Funcionalidad en desarrollo: Generar reportes');
        }
        
        function systemSettings() {
            alert('Funcionalidad en desarrollo: Ajustes del sistema');
        }
        
        // Verificar autenticación al cargar
        async function verifyAuth() {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    window.location.href = '/inicio-sesion';
                    return;
                }
                
                const response = await fetch('/api/auth/verify', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                
                if (!response.ok) {
                    localStorage.removeItem('auth_token');
                    window.location.href = '/inicio-sesion';
                }
            } catch (error) {
                console.error('Error verificando autenticación:', error);
                window.location.href = '/inicio-sesion';
            }
        }
        
        // Verificar autenticación periódicamente
        setInterval(verifyAuth, 300000); // Cada 5 minutos
        
        // Verificar al cargar la página
        document.addEventListener('DOMContentLoaded', verifyAuth);
        
        // Agregar evento de logout
        document.getElementById('logoutBtn').addEventListener('click', logout);
    </script>
</body>
</html>`;
    }

    async handleDashboard(req, res) {
        try {
            const decoded = this.authenticateRequest(req);
            
            if (!decoded) {
                // Redirigir al login si no está autenticado
                res.writeHead(302, { 'Location': '/inicio-sesion' });
                res.end();
                return;
            }

            // Verificar si el usuario existe
            const usuario = await usuarioRepository.findById(decoded.id);
            if (!usuario || usuario.estado !== 'Activo') {
                res.writeHead(302, { 'Location': '/inicio-sesion' });
                res.end();
                return;
            }

            // Mostrar dashboard
            const dashboardHtml = this.getDashboardPage({
                ...usuario.toJSON(),
                nombre_completo: usuario.getNombreCompleto()
            });
            
            this.sendHtml(res, 200, dashboardHtml);

        } catch (error) {
            logger.error('Error en dashboard:', error.message);
            res.writeHead(302, { 'Location': '/login' });
            res.end();
        }
    }

    async handleLogout(req, res) {
        try {
            // Simplemente redirigir al login
            // En una implementación real, invalidaríamos el token
            this.sendSuccess(res, null, 'Sesión cerrada exitosamente');
            
        } catch (error) {
            logger.error('Error en logout:', error.message);
            this.sendError(res, 500, 'Error al cerrar sesión');
        }
    }

    startServer() {
        this.server = http.createServer(async (req, res) => {
            const parsed = url.parse(req.url, true);
            const path = parsed.pathname;
            const method = req.method;
            
            // Configurar CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            // Manejar preflight requests
            if (method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }
            
            logger.info(`${method} ${path}`);
            
            try {
                // Rutas principales
                if (path === '/' && method === 'GET') {
                    return this.sendHtml(res, 200, this.getHomePage());
                }
                
                if (path === '/inicio-sesion' && method === 'GET') {
                    return this.sendHtml(res, 200, this.getLoginPage());
                }
                
                if (path === '/dashboard' && method === 'GET') {
                    return await this.handleDashboard(req, res);
                }
                
                // API Routes
                if (path === '/api/auth/login' && method === 'POST') {
                    return await this.handleLogin(req, res);
                }
                
                if (path === '/api/auth/verify' && method === 'GET') {
                    return await this.handleVerifyToken(req, res);
                }
                
                if (path === '/api/auth/logout' && method === 'POST') {
                    return await this.handleLogout(req, res);
                }
                
                if (path === '/api/usuarios' && method === 'GET') {
                    return await this.handleGetUsuarios(req, res, parsed.query);
                }
                
                if (path === '/api/usuarios' && method === 'POST') {
                    return await this.handleCreateUsuario(req, res);
                }
                
                if (path.startsWith('/api/usuarios/id/') && method === 'GET') {
                    const id = Number(path.split('/')[4]);
                    if (Number.isFinite(id) && id > 0) {
                        return await this.handleGetUsuarioById(req, res, id);
                    }
                }
                
                if (path.startsWith('/api/usuarios/id/') && method === 'PUT') {
                    const id = Number(path.split('/')[4]);
                    if (Number.isFinite(id) && id > 0) {
                        return await this.handleUpdateUsuario(req, res, id);
                    }
                }
                
                if (path.startsWith('/api/usuarios/id/') && path.endsWith('/estado') && method === 'PATCH') {
                    const parts = path.split('/');
                    const id = Number(parts[4]);
                    if (Number.isFinite(id) && id > 0) {
                        return await this.handleUpdateUsuarioEstado(req, res, id);
                    }
                }
                
                if (path.startsWith('/api/usuarios/id/') && method === 'DELETE') {
                    const id = Number(path.split('/')[4]);
                    if (Number.isFinite(id) && id > 0) {
                        return await this.handleDeleteUsuario(req, res, id);
                    }
                }
                
                if (path.startsWith('/api/usuarios/') && method === 'GET') {
                    const dni = decodeURIComponent(path.split('/')[3]);
                    if (dni) {
                        return await this.handleGetUsuarioByDni(req, res, dni);
                    }
                }
                
                if (path === '/api/usuarios/search' && method === 'GET') {
                    const { term = '' } = parsed.query;
                    if (term) {
                        return await this.handleSearchUsuarios(req, res, term);
                    } else {
                        return this.sendError(res, 400, 'Parámetro "term" requerido para búsqueda');
                    }
                }
                
                if (path === '/api/stats/rol' && method === 'GET') {
                    return await this.handleGetStats(req, res);
                }
                
                if (path === '/api/health' && method === 'GET') {
                    return await this.handleHealthCheck(req, res);
                }
                
                // Ruta no encontrada
                return this.sendError(res, 404, 'Ruta no encontrada');
                
            } catch (error) {
                logger.error(`❌ Error en ${path}:`, error.message);
                this.sendError(res, 500, 'Error interno del servidor', error.message);
            }
        });
        
        this.server.listen(env.APP_PORT, () => {
            logger.info(`🌐 Servidor HTTP escuchando en http://localhost:${env.APP_PORT}`);
            logger.info(`🏠 Página principal: http://localhost:${env.APP_PORT}`);
            logger.info(`🔐 Login: http://localhost:${env.APP_PORT}/inicio-sesion`);
            logger.info(`📊 Dashboard: http://localhost:${env.APP_PORT}/dashboard`);
            logger.info(`🔧 API REST disponible en /api/*`);
        });
        
        this.server.on('error', (error) => {
            logger.error('❌ Error del servidor:', error.message);
            process.exit(1);
        });
    }
}

// Iniciar la aplicación
const app = new SistemaInvestigacionApp();
app.start();

// Exportar para testing
module.exports = app;