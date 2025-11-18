/**
 * Lógica del Dashboard para Administrador del Sistema
 * Maneja la interactividad y presentación del UI
 */

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    // Configurar navegación
    setupNavigation();
    
    // Cargar datos iniciales
    loadUsuarios();
    loadSolicitudes();
    loadConfiguracion();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Mostrar usuario actual
    displayUserInfo();
}

// ==================== NAVEGACIÓN ====================

function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover activo de todos los items
            menuItems.forEach(m => m.classList.remove('active'));
            
            // Agregar activo al item clickeado
            this.classList.add('active');
            
            // Ocultar todas las secciones
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(s => s.classList.remove('active'));
            
            // Mostrar la sección correspondiente
            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

// ==================== GESTIÓN DE USUARIOS ====================

async function loadUsuarios() {
    try {
        const usuarios = await adminController.obtenerUsuarios();
        displayUsuariosTable(usuarios);
    } catch (error) {
        showError('Error al cargar usuarios: ' + error.message);
    }
}

function displayUsuariosTable(usuarios) {
    const tbody = document.getElementById('usuariosBody');
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td>${usuario.rol}</td>
            <td><span class="badge badge-${usuario.estado}">${usuario.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editarUsuario(${usuario.id})">Editar</button>
                <button class="btn btn-sm btn-warning" onclick="cambiarEstadoUsuario(${usuario.id}, '${usuario.estado}')">
                    ${usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editarUsuario(usuarioId) {
    const usuario = adminController.usuarios.find(u => u.id === usuarioId);
    if (!usuario) return;
    
    document.getElementById('usuarioNombre').value = usuario.nombre;
    document.getElementById('usuarioEmail').value = usuario.email;
    document.getElementById('usuarioRol').value = usuario.rol;
    document.getElementById('usuarioActivo').checked = usuario.estado === 'activo';
    
    // Mostrar modal
    openModal('usuarioModal');
    
    // Configurar para edición
    document.getElementById('usuarioForm').dataset.usuarioId = usuarioId;
}

async function cambiarEstadoUsuario(usuarioId, estadoActual) {
    try {
        const nuevoEstado = estadoActual === 'activo' ? 'desactivar' : 'activar';
        
        if (nuevoEstado === 'activar') {
            await adminController.activarUsuario(usuarioId);
            showSuccess('Usuario activado correctamente');
        } else {
            await adminController.desactivarUsuario(usuarioId);
            showSuccess('Usuario desactivado correctamente');
        }
        
        loadUsuarios();
    } catch (error) {
        showError('Error al cambiar estado: ' + error.message);
    }
}

async function eliminarUsuario(usuarioId) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
        return;
    }
    
    try {
        await adminController.eliminarUsuario(usuarioId);
        showSuccess('Usuario eliminado correctamente');
        loadUsuarios();
    } catch (error) {
        showError('Error al eliminar usuario: ' + error.message);
    }
}

// ==================== GESTIÓN DE SOLICITUDES ====================

async function loadSolicitudes(estado = null) {
    try {
        const solicitudes = await adminController.obtenerSolicitudes(estado);
        displaySolicitudesTable(solicitudes);
    } catch (error) {
        showError('Error al cargar solicitudes: ' + error.message);
    }
}

function displaySolicitudesTable(solicitudes) {
    const tbody = document.getElementById('solicitudesBody');
    tbody.innerHTML = '';
    
    solicitudes.forEach(solicitud => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${solicitud.id}</td>
            <td>${solicitud.nombre}</td>
            <td>${solicitud.email}</td>
            <td>${solicitud.rol_solicitado}</td>
            <td>${formatDate(solicitud.fecha_solicitud)}</td>
            <td><span class="badge badge-${solicitud.estado}">${solicitud.estado}</span></td>
            <td>
                ${solicitud.estado === 'pendiente' ? `
                    <button class="btn btn-sm btn-success" onclick="aprobarSolicitud(${solicitud.id})">Aprobar</button>
                    <button class="btn btn-sm btn-danger" onclick="rechazarSolicitud(${solicitud.id})">Rechazar</button>
                ` : ''}
                <button class="btn btn-sm btn-info" onclick="verDetalleSolicitud(${solicitud.id})">Ver</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function aprobarSolicitud(solicitudId) {
    const rolAsignado = prompt('Ingrese el rol a asignar:', 'docente');
    if (!rolAsignado) return;
    
    try {
        await adminController.aprobarSolicitud(solicitudId, rolAsignado);
        showSuccess('Solicitud aprobada correctamente');
        loadSolicitudes();
    } catch (error) {
        showError('Error al aprobar solicitud: ' + error.message);
    }
}

async function rechazarSolicitud(solicitudId) {
    const motivo = prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;
    
    try {
        await adminController.rechazarSolicitud(solicitudId, motivo);
        showSuccess('Solicitud rechazada correctamente');
        loadSolicitudes();
    } catch (error) {
        showError('Error al rechazar solicitud: ' + error.message);
    }
}

// ==================== GESTIÓN DE CATÁLOGOS ====================

document.addEventListener('DOMContentLoaded', function() {
    const botonesGestionar = document.querySelectorAll('[data-catalog]');
    botonesGestionar.forEach(btn => {
        btn.addEventListener('click', function() {
            const catalog = this.getAttribute('data-catalog');
            loadCatalogo(catalog);
        });
    });
});

async function loadCatalogo(tipoCatalogo) {
    try {
        const elementos = await adminController.obtenerCatalogo(tipoCatalogo);
        showCatalogoModal(tipoCatalogo, elementos);
    } catch (error) {
        showError('Error al cargar catálogo: ' + error.message);
    }
}

// ==================== CONFIGURACIÓN ====================

async function loadConfiguracion() {
    try {
        const config = await adminController.obtenerConfiguracion();
        document.getElementById('nombreInstitucion').value = config.nombre_institucion || '';
        document.getElementById('emailSistema').value = config.email_sistema || '';
        document.getElementById('periodoAcademico').value = config.periodo_academico || '';
        document.getElementById('mantenimiento').checked = config.modo_mantenimiento || false;
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
}

// ==================== REPORTES ====================

async function generarReporte() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        showError('Por favor seleccione ambas fechas');
        return;
    }
    
    try {
        const reportes = await adminController.obtenerReporteAuditoria(fechaInicio, fechaFin);
        displayReporteAuditoria(reportes);
    } catch (error) {
        showError('Error al generar reporte: ' + error.message);
    }
}

function displayReporteAuditoria(reportes) {
    const tbody = document.getElementById('auditBody');
    tbody.innerHTML = '';
    
    reportes.forEach(reporte => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(reporte.timestamp)}</td>
            <td>${reporte.usuario}</td>
            <td>${reporte.accion}</td>
            <td>${reporte.descripcion}</td>
            <td><span class="badge badge-${reporte.resultado}">${reporte.resultado}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // Formulario de usuario
    const usuarioForm = document.getElementById('usuarioForm');
    if (usuarioForm) {
        usuarioForm.addEventListener('submit', handleGuardarUsuario);
    }
    
    // Botón agregar usuario
    const btnAgregar = document.getElementById('btnAgregarUsuario');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            document.getElementById('usuarioForm').reset();
            delete document.getElementById('usuarioForm').dataset.usuarioId;
            openModal('usuarioModal');
        });
    }
    
    // Formulario de configuración
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', handleGuardarConfiguracion);
    }
    
    // Botón generar reporte
    const btnReporte = document.getElementById('btnGenerarReporte');
    if (btnReporte) {
        btnReporte.addEventListener('click', generarReporte);
    }
    
    // Filtro de solicitudes
    const filterEstado = document.getElementById('filterEstado');
    if (filterEstado) {
        filterEstado.addEventListener('change', function() {
            loadSolicitudes(this.value || null);
        });
    }
    
    // Cerrar sesión
    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', logout);
    }
}

async function handleGuardarUsuario(e) {
    e.preventDefault();
    
    const usuarioId = document.getElementById('usuarioForm').dataset.usuarioId;
    const datos = {
        nombre: document.getElementById('usuarioNombre').value,
        email: document.getElementById('usuarioEmail').value,
        rol: document.getElementById('usuarioRol').value,
        estado: document.getElementById('usuarioActivo').checked ? 'activo' : 'inactivo'
    };
    
    try {
        if (usuarioId) {
            await adminController.editarUsuario(parseInt(usuarioId), datos);
            showSuccess('Usuario actualizado correctamente');
        } else {
            await adminController.crearUsuario(datos);
            showSuccess('Usuario creado correctamente');
        }
        closeModal('usuarioModal');
        loadUsuarios();
    } catch (error) {
        showError('Error al guardar usuario: ' + error.message);
    }
}

async function handleGuardarConfiguracion(e) {
    e.preventDefault();
    
    const config = {
        nombre_institucion: document.getElementById('nombreInstitucion').value,
        email_sistema: document.getElementById('emailSistema').value,
        periodo_academico: document.getElementById('periodoAcademico').value,
        modo_mantenimiento: document.getElementById('mantenimiento').checked
    };
    
    try {
        await adminController.actualizarConfiguracion(config);
        showSuccess('Configuración guardada correctamente');
    } catch (error) {
        showError('Error al guardar configuración: ' + error.message);
    }
}

// ==================== FUNCIONES AUXILIARES ====================

function displayUserInfo() {
    const userName = localStorage.getItem('userName') || 'Administrador';
    document.getElementById('userName').textContent = userName;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cerrar modal al hacer click en X
document.addEventListener('DOMContentLoaded', function() {
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
});

// Cerrar modal al hacer click fuera
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-PE', options);
}

function formatDateTime(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-PE', options);
}

function showSuccess(message) {
    alert('✓ ' + message);
}

function showError(message) {
    alert('✗ ' + message);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/login.html';
}
