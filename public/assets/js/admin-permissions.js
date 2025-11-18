/**
 * Módulo de Permisos para Administrador del Sistema
 * Define todos los permisos y restricciones del administrador
 */

const AdminPermissions = {
    // Permisos permitidos
    permisos: {
        // Gestión de Usuarios
        'usuarios.crear': true,
        'usuarios.editar': true,
        'usuarios.eliminar': true,
        'usuarios.listar': true,
        'usuarios.cambiar_rol': true,
        'usuarios.activar': true,
        'usuarios.desactivar': true,

        // Solicitudes de Registro
        'solicitudes.listar': true,
        'solicitudes.aprobar': true,
        'solicitudes.rechazar': true,
        'solicitudes.ver_detalle': true,

        // Catálogos
        'catalogos.crear': true,
        'catalogos.editar': true,
        'catalogos.eliminar': true,
        'catalogos.listar': true,
        'catalogos.programas': true,
        'catalogos.lineas_investigacion': true,
        'catalogos.departamentos': true,
        'catalogos.tipos_proyecto': true,

        // Configuración del Sistema
        'sistema.configurar': true,
        'sistema.ver_configuracion': true,
        'sistema.modo_mantenimiento': true,
        'sistema.backups': true,

        // Reportes y Auditoría
        'reportes.auditar': true,
        'reportes.generar': true,
        'reportes.exportar': true,
        'sistema.ver_logs': true,

        // Acceso General
        'sistema.acceso_total': true,
    },

    // Restricciones (Lo que NO puede hacer)
    restricciones: {
        'evaluaciones.participar': false,
        'evaluaciones.emitir_resolucion': false,
        'evaluaciones.calificar': false,
        'proyectos.evaluar': false,
        'proyectos.emitir_resolucion': false,
    },

    // Métodos de validación
    
    /**
     * Verifica si el administrador tiene un permiso específico
     * @param {string} permiso - Nombre del permiso a verificar
     * @returns {boolean}
     */
    tiene(permiso) {
        return this.permisos[permiso] === true;
    },

    /**
     * Verifica si el administrador puede realizar múltiples acciones
     * @param {array} permisos - Array de permisos a verificar
     * @returns {boolean}
     */
    tieneMultiples(permisos) {
        return permisos.every(permiso => this.tiene(permiso));
    },

    /**
     * Verifica si el administrador tiene alguno de los permisos
     * @param {array} permisos - Array de permisos a verificar
     * @returns {boolean}
     */
    tieneAlguno(permisos) {
        return permisos.some(permiso => this.tiene(permiso));
    },

    /**
     * Obtiene todos los permisos concedidos
     * @returns {array}
     */
    obtenerPermisos() {
        return Object.keys(this.permisos).filter(permiso => this.permisos[permiso] === true);
    },

    /**
     * Obtiene todas las restricciones
     * @returns {array}
     */
    obtenerRestricciones() {
        return Object.keys(this.restricciones).filter(restriccion => this.restricciones[restriccion] === false);
    },

    /**
     * Verifica si puede acceder a una funcionalidad específica
     * @param {string} modulo - Módulo o funcionalidad
     * @returns {boolean}
     */
    puedeAcceder(modulo) {
        const permisoModulo = `${modulo}.listar`;
        return this.tiene(permisoModulo);
    },

    /**
     * Obtiene el nivel de acceso del administrador
     * @returns {object}
     */
    obtenerNivelAcceso() {
        return {
            nivel: 'administrador',
            tieneAccesoTotal: this.tiene('sistema.acceso_total'),
            modulos: {
                usuarios: this.puedeAcceder('usuarios'),
                solicitudes: this.puedeAcceder('solicitudes'),
                catalogos: this.puedeAcceder('catalogos'),
                sistema: this.puedeAcceder('sistema'),
                reportes: this.puedeAcceder('reportes'),
            },
            restricciones: this.obtenerRestricciones()
        };
    }
};

// Exportar para Node.js/módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminPermissions;
}
