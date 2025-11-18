/**
 * Controlador para Administrador del Sistema
 * Maneja todas las operaciones de administración
 */

class AdminController {
    constructor() {
        this.baseURL = '/api/admin';
        this.usuarios = [];
        this.solicitudes = [];
        this.auditLog = [];
    }

    // ==================== GESTIÓN DE USUARIOS ====================

    /**
     * Obtiene la lista de todos los usuarios del sistema
     * @returns {Promise<array>}
     */
    async obtenerUsuarios() {
        try {
            const response = await fetch(`${this.baseURL}/usuarios`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            
            this.usuarios = await response.json();
            return this.usuarios;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return [];
        }
    }

    /**
     * Crea un nuevo usuario en el sistema
     * @param {object} datosUsuario - Datos del usuario a crear
     * @returns {Promise<object>}
     */
    async crearUsuario(datosUsuario) {
        if (!AdminPermissions.tiene('usuarios.crear')) {
            throw new Error('No tiene permisos para crear usuarios');
        }

        try {
            const response = await fetch(`${this.baseURL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(datosUsuario)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const nuevoUsuario = await response.json();
            this.registrarAuditoria('crear_usuario', `Creado usuario: ${datosUsuario.email}`, 'exitoso');
            return nuevoUsuario;
        } catch (error) {
            console.error('Error al crear usuario:', error);
            this.registrarAuditoria('crear_usuario', `Error al crear usuario: ${datosUsuario.email}`, 'error');
            throw error;
        }
    }

    /**
     * Edita un usuario existente
     * @param {number} usuarioId - ID del usuario
     * @param {object} datosActualizados - Datos a actualizar
     * @returns {Promise<object>}
     */
    async editarUsuario(usuarioId, datosActualizados) {
        if (!AdminPermissions.tiene('usuarios.editar')) {
            throw new Error('No tiene permisos para editar usuarios');
        }

        try {
            const response = await fetch(`${this.baseURL}/usuarios/${usuarioId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const usuarioActualizado = await response.json();
            this.registrarAuditoria('editar_usuario', `Editado usuario ID: ${usuarioId}`, 'exitoso');
            return usuarioActualizado;
        } catch (error) {
            console.error('Error al editar usuario:', error);
            this.registrarAuditoria('editar_usuario', `Error al editar usuario ID: ${usuarioId}`, 'error');
            throw error;
        }
    }

    /**
     * Cambia el rol de un usuario
     * @param {number} usuarioId - ID del usuario
     * @param {string} nuevoRol - Nuevo rol a asignar
     * @returns {Promise<object>}
     */
    async cambiarRolUsuario(usuarioId, nuevoRol) {
        if (!AdminPermissions.tiene('usuarios.cambiar_rol')) {
            throw new Error('No tiene permisos para cambiar roles');
        }

        return this.editarUsuario(usuarioId, { rol: nuevoRol });
    }

    /**
     * Activa un usuario
     * @param {number} usuarioId - ID del usuario
     * @returns {Promise<object>}
     */
    async activarUsuario(usuarioId) {
        if (!AdminPermissions.tiene('usuarios.activar')) {
            throw new Error('No tiene permisos para activar usuarios');
        }

        return this.editarUsuario(usuarioId, { estado: 'activo' });
    }

    /**
     * Desactiva un usuario
     * @param {number} usuarioId - ID del usuario
     * @returns {Promise<object>}
     */
    async desactivarUsuario(usuarioId) {
        if (!AdminPermissions.tiene('usuarios.desactivar')) {
            throw new Error('No tiene permisos para desactivar usuarios');
        }

        return this.editarUsuario(usuarioId, { estado: 'inactivo' });
    }

    /**
     * Elimina un usuario del sistema
     * @param {number} usuarioId - ID del usuario
     * @returns {Promise<boolean>}
     */
    async eliminarUsuario(usuarioId) {
        if (!AdminPermissions.tiene('usuarios.eliminar')) {
            throw new Error('No tiene permisos para eliminar usuarios');
        }

        try {
            const response = await fetch(`${this.baseURL}/usuarios/${usuarioId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            this.registrarAuditoria('eliminar_usuario', `Eliminado usuario ID: ${usuarioId}`, 'exitoso');
            return true;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            this.registrarAuditoria('eliminar_usuario', `Error al eliminar usuario ID: ${usuarioId}`, 'error');
            throw error;
        }
    }

    // ==================== GESTIÓN DE SOLICITUDES ====================

    /**
     * Obtiene las solicitudes de registro pendientes
     * @param {string} estado - Estado a filtrar (opcional)
     * @returns {Promise<array>}
     */
    async obtenerSolicitudes(estado = null) {
        if (!AdminPermissions.tiene('solicitudes.listar')) {
            throw new Error('No tiene permisos para ver solicitudes');
        }

        try {
            let url = `${this.baseURL}/solicitudes`;
            if (estado) {
                url += `?estado=${estado}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            this.solicitudes = await response.json();
            return this.solicitudes;
        } catch (error) {
            console.error('Error al obtener solicitudes:', error);
            return [];
        }
    }

    /**
     * Aprueba una solicitud de registro
     * @param {number} solicitudId - ID de la solicitud
     * @param {string} rolAsignado - Rol a asignar al usuario
     * @returns {Promise<object>}
     */
    async aprobarSolicitud(solicitudId, rolAsignado) {
        if (!AdminPermissions.tiene('solicitudes.aprobar')) {
            throw new Error('No tiene permisos para aprobar solicitudes');
        }

        try {
            const response = await fetch(`${this.baseURL}/solicitudes/${solicitudId}/aprobar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ rol: rolAsignado })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const resultado = await response.json();
            this.registrarAuditoria('aprobar_solicitud', `Aprobada solicitud ID: ${solicitudId}`, 'exitoso');
            return resultado;
        } catch (error) {
            console.error('Error al aprobar solicitud:', error);
            this.registrarAuditoria('aprobar_solicitud', `Error al aprobar solicitud ID: ${solicitudId}`, 'error');
            throw error;
        }
    }

    /**
     * Rechaza una solicitud de registro
     * @param {number} solicitudId - ID de la solicitud
     * @param {string} motivo - Motivo del rechazo
     * @returns {Promise<object>}
     */
    async rechazarSolicitud(solicitudId, motivo) {
        if (!AdminPermissions.tiene('solicitudes.rechazar')) {
            throw new Error('No tiene permisos para rechazar solicitudes');
        }

        try {
            const response = await fetch(`${this.baseURL}/solicitudes/${solicitudId}/rechazar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ motivo })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const resultado = await response.json();
            this.registrarAuditoria('rechazar_solicitud', `Rechazada solicitud ID: ${solicitudId}`, 'exitoso');
            return resultado;
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            this.registrarAuditoria('rechazar_solicitud', `Error al rechazar solicitud ID: ${solicitudId}`, 'error');
            throw error;
        }
    }

    // ==================== GESTIÓN DE CATÁLOGOS ====================

    /**
     * Obtiene un catálogo específico
     * @param {string} tipoCatalogo - Tipo de catálogo (programas, lineas, etc)
     * @returns {Promise<array>}
     */
    async obtenerCatalogo(tipoCatalogo) {
        if (!AdminPermissions.tiene('catalogos.listar')) {
            throw new Error('No tiene permisos para ver catálogos');
        }

        try {
            const response = await fetch(`${this.baseURL}/catalogos/${tipoCatalogo}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error al obtener catálogo ${tipoCatalogo}:`, error);
            return [];
        }
    }

    /**
     * Crea un nuevo elemento en un catálogo
     * @param {string} tipoCatalogo - Tipo de catálogo
     * @param {object} datos - Datos del elemento
     * @returns {Promise<object>}
     */
    async crearElementoCatalogo(tipoCatalogo, datos) {
        if (!AdminPermissions.tiene('catalogos.crear')) {
            throw new Error('No tiene permisos para crear elementos en catálogos');
        }

        try {
            const response = await fetch(`${this.baseURL}/catalogos/${tipoCatalogo}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            this.registrarAuditoria('crear_catalogo', `Creado elemento en ${tipoCatalogo}`, 'exitoso');
            return await response.json();
        } catch (error) {
            console.error('Error al crear elemento de catálogo:', error);
            throw error;
        }
    }

    // ==================== AUDITORÍA Y REPORTES ====================

    /**
     * Registra una acción en el log de auditoría
     * @param {string} accion - Tipo de acción
     * @param {string} descripcion - Descripción detallada
     * @param {string} resultado - Resultado (exitoso, error)
     */
    registrarAuditoria(accion, descripcion, resultado = 'exitoso') {
        const registro = {
            timestamp: new Date().toISOString(),
            usuario: localStorage.getItem('userName') || 'Desconocido',
            accion: accion,
            descripcion: descripcion,
            resultado: resultado
        };

        this.auditLog.push(registro);

        // Enviar al servidor
        this.enviarAuditoriaAlServidor(registro);
    }

    /**
     * Envía un registro de auditoría al servidor
     * @param {object} registro - Registro de auditoría
     */
    async enviarAuditoriaAlServidor(registro) {
        try {
            await fetch(`${this.baseURL}/auditoria`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(registro)
            });
        } catch (error) {
            console.error('Error al registrar auditoría:', error);
        }
    }

    /**
     * Obtiene el log de auditoría filtrado por fechas
     * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise<array>}
     */
    async obtenerReporteAuditoria(fechaInicio, fechaFin) {
        if (!AdminPermissions.tiene('reportes.auditar')) {
            throw new Error('No tiene permisos para ver reportes');
        }

        try {
            const response = await fetch(
                `${this.baseURL}/auditoria?inicio=${fechaInicio}&fin=${fechaFin}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener reporte de auditoría:', error);
            return [];
        }
    }

    /**
     * Obtiene la configuración del sistema
     * @returns {Promise<object>}
     */
    async obtenerConfiguracion() {
        if (!AdminPermissions.tiene('sistema.ver_configuracion')) {
            throw new Error('No tiene permisos para ver configuración');
        }

        try {
            const response = await fetch(`${this.baseURL}/configuracion`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener configuración:', error);
            return {};
        }
    }

    /**
     * Actualiza la configuración del sistema
     * @param {object} nuevaConfiguracion - Nuevos valores de configuración
     * @returns {Promise<object>}
     */
    async actualizarConfiguracion(nuevaConfiguracion) {
        if (!AdminPermissions.tiene('sistema.configurar')) {
            throw new Error('No tiene permisos para configurar el sistema');
        }

        try {
            const response = await fetch(`${this.baseURL}/configuracion`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(nuevaConfiguracion)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            this.registrarAuditoria('actualizar_configuracion', 'Actualizada configuración del sistema', 'exitoso');
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            throw error;
        }
    }
}

// Instancia global del controlador
const adminController = new AdminController();

// Exportar para Node.js/módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminController;
}
