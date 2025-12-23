const request = require('supertest');
const app = require('../server');
const pool = require('../src/database/pool');

describe('Sistema de Autenticación', () => {
    beforeAll(async () => {
        // Verificar conexión a la base de datos
        const isHealthy = await pool.healthCheck();
        if (!isHealthy) {
            throw new Error('No se pudo conectar a la base de datos');
        }
    });

    afterAll(async () => {
        // Cerrar pool de conexiones
        await pool.close();
    });

    describe('POST /api/auth/login', () => {
        it('debe autenticar usuario con credenciales válidas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'lcardenasp@institutocajas.edu.pe',
                    password: '00000001',
                    rememberMe: false
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe('lcardenasp@institutocajas.edu.pe');
        });

        it('debe rechazar login con credenciales inválidas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'usuario@inexistente.com',
                    password: 'contrasena_incorrecta'
                })
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBeDefined();
        });

        it('debe validar email requerido', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'algunapassword'
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('debe validar email válido', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'email-invalido',
                    password: 'algunapassword'
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toContainEqual(
                expect.objectContaining({
                    field: 'email'
                })
            );
        });
    });

    describe('GET /api/auth/verify', () => {
        let authToken;

        beforeAll(async () => {
            // Obtener token de autenticación
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'lcardenasp@institutocajas.edu.pe',
                    password: '00000001'
                });

            authToken = response.body.token;
        });

        it('debe verificar token válido', async () => {
            const response = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
        });

        it('debe rechazar token inválido', async () => {
            const response = await request(app)
                .get('/api/auth/verify')
                .set('Authorization', 'Bearer token_invalido')
                .expect('Content-Type', /json/)
                .expect(403);

            expect(response.body.success).toBe(false);
        });

        it('debe requerir token', async () => {
            const response = await request(app)
                .get('/api/auth/verify')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/logout', () => {
        let authToken;

        beforeAll(async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'lcardenasp@institutocajas.edu.pe',
                    password: '00000001'
                });

            authToken = response.body.token;
        });

        it('debe cerrar sesión exitosamente', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('Rutas protegidas por rol', () => {
        let adminToken;
        let investigadorToken;

        beforeAll(async () => {
            // Token de administrador (buscar usuario con rol Administrador)
            const adminResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'lcardenasp@institutocajas.edu.pe',
                    password: '00000001'
                });
            adminToken = adminResponse.body.token;

            // Token de investigador
            const invResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'lrodrigom@institutocajas.edu.pe',
                    password: '00000002'
                });
            investigadorToken = invResponse.body.token;
        });

        it('debe permitir acceso a ruta de admin con rol apropiado', async () => {
            const response = await request(app)
                .get('/api/admin/dashboard')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.message).toBeDefined();
        });

        it('debe denegar acceso a ruta de admin sin rol apropiado', async () => {
            const response = await request(app)
                .get('/api/admin/dashboard')
                .set('Authorization', `Bearer ${investigadorToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });
});