// Dashboard Administrador - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar dashboard de administrador
  initAdminDashboard();
  
  // Cargar datos del administrador
  loadAdminData();
  
  // Cargar datos del sistema
  loadSystemData();
  
  // Configurar event listeners
  setupAdminEventListeners();

  // Navegación por hash (#...)
  handleHashNavigation();
});

function initAdminDashboard() {
  console.log('Dashboard Administrador iniciado');
  
  // Actualizar hora de último acceso
  updateLastAccessTime();
  
  // Inicializar estadísticas
  updateSystemMetrics();
}

function loadAdminData() {
  try {
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    if (user && user.nombres) {
      const userName = `${user.nombres} ${user.apellidos || ''}`.trim();
      document.getElementById('userName').textContent = userName;
    }
    
    if (user && user.rol) {
      const userRoleEl = document.getElementById('userRole');
      if (userRoleEl) userRoleEl.textContent = user.rol;
    }
    
  } catch (error) {
    console.error('Error al cargar datos del administrador:', error);
  }
}

function loadSystemData() {
  fetch('/api/admin/stats')
    .then(res => res.json())
    .then(data => {
      if (!data || !data.success || !data.stats) return;
      const s = data.stats;
      document.getElementById('pendingRequestsBadge').textContent = s.pendingApprovals ?? 0;
      document.getElementById('totalUsersBadge').textContent = s.totalUsers ?? 0;
      document.getElementById('inactiveUsersBadge').textContent = s.inactiveUsers ?? 0;
      const logsEl = document.getElementById('systemLogsBadge');
      if (logsEl) logsEl.textContent = s.systemLogs ?? 0;
      document.getElementById('pendingApprovals').textContent = s.pendingApprovals ?? 0;
      document.getElementById('activeUsers').textContent = s.activeUsers ?? 0;
      document.getElementById('inactiveUsers').textContent = s.inactiveUsers ?? 0;
      const programsEl = document.getElementById('programsCount');
      if (programsEl) programsEl.textContent = `${s.programsCount ?? 0} programas`;
      const linesEl = document.getElementById('researchLinesCount');
      if (linesEl) linesEl.textContent = `${s.researchLinesCount ?? 0} líneas`;
      const depsEl = document.getElementById('departmentsCount');
      if (depsEl) depsEl.textContent = `${s.departmentsCount ?? 0} departamentos`;
      const typesEl = document.getElementById('projectTypesCount');
      if (typesEl) typesEl.textContent = `${s.projectTypesCount ?? 0} tipos`;
      const sessionsEl = document.getElementById('activeSessions');
      if (sessionsEl) sessionsEl.textContent = s.activeSessions ?? 0;

      const notifCountEl = document.getElementById('notificationCount');
      if (notifCountEl) notifCountEl.textContent = s.unreadNotifications ?? 0;

      const totalUsersFooter = document.getElementById('totalUsersFooter');
      if (totalUsersFooter) totalUsersFooter.textContent = s.totalUsers ?? 0;

      loadPendingRequests();
      loadUsers();
      loadAlerts();
    })
    .catch(() => {});
}

function loadAlerts() {
  fetch('/api/admin/alerts')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('alertsContainer');
      if (!container) return;
      const list = (data && data.success && Array.isArray(data.alerts)) ? data.alerts : [];
      container.innerHTML = '';

      if (list.length === 0) {
        container.innerHTML = '<div class="alert-item info"><div class="alert-content"><h4>Sin alertas</h4><p>No hay alertas registradas</p></div></div>';
        return;
      }

      list.forEach(a => {
        const typeClass = (a.type || '').toLowerCase().includes('alerta') ? 'warning' :
          (a.type || '').toLowerCase().includes('recordatorio') ? 'info' :
          (a.type || '').toLowerCase().includes('evaluacion') ? 'warning' : 'info';

        const item = document.createElement('div');
        item.className = `alert-item ${typeClass}`;
        item.innerHTML = `
          <div class="alert-icon">
            <i class="fas ${typeClass === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
          </div>
          <div class="alert-content">
            <h4>${a.title || 'Notificación'}</h4>
            <p>${a.message || ''}</p>
            <span class="alert-time">${formatDateTime(a.date)}</span>
          </div>
        `;
        container.appendChild(item);
      });
    })
    .catch(() => {});
}

function formatDateTime(dateValue) {
  try {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function loadPendingRequests() {
  fetch('/api/admin/pending-requests')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('requestsTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';
      const list = (data && data.success && Array.isArray(data.requests)) ? data.requests : [];
      list.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="checkbox" class="request-checkbox" data-id="${request.id}"></td>
          <td>${request.name}</td>
          <td>${request.email}</td>
          <td><span class="role-badge">${request.role}</span></td>
          <td>${request.date}</td>
          <td><span class="status-badge pending">${request.status}</span></td>
          <td>
            <div class="action-buttons">
              <button class="btn-action approve" data-id="${request.id}">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn-action reject" data-id="${request.id}">
                <i class="fas fa-times"></i>
              </button>
              <button class="btn-action view" data-id="${request.id}">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(() => {});
}

function handleHashNavigation() {
  window.addEventListener('hashchange', applyHashNavigation);
  applyHashNavigation();
}

function applyHashNavigation() {
  const hash = (window.location.hash || '#inicio').replace('#', '');
  const sections = Array.from(document.querySelectorAll('main.content > section'));
  const menuItems = Array.from(document.querySelectorAll('.menu-item:not(.disabled)'));

  menuItems.forEach(item => {
    const href = item.getAttribute('href') || '';
    const isActive = href === `#${hash}`;
    item.classList.toggle('active', isActive);
  });

  if (hash === 'inicio') {
    sections.forEach(sec => {
      sec.style.display = '';
    });
    return;
  }

  const target = document.getElementById(hash);
  if (!target) {
    sections.forEach(sec => {
      sec.style.display = '';
    });
    return;
  }

  sections.forEach(sec => {
    sec.style.display = sec === target ? '' : 'none';
  });
}

async function approveRequestById(requestId) {
  const res = await fetch(`/api/admin/requests/${requestId}/approve`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!data || !data.success) throw new Error(data && data.message ? data.message : 'No se pudo aprobar');
}

async function rejectRequestById(requestId) {
  const res = await fetch(`/api/admin/requests/${requestId}/reject`, { method: 'POST' });
  const data = await res.json().catch(() => ({}));
  if (!data || !data.success) throw new Error(data && data.message ? data.message : 'No se pudo rechazar');
}

function loadUsers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.rol) params.set('rol', filters.rol);
  if (filters.estado) params.set('estado', filters.estado);
  if (filters.q) params.set('q', filters.q);

  const url = `/api/usuarios${params.toString() ? `?${params.toString()}` : ''}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('usersGrid');
      if (!container) return;
      container.innerHTML = '';
      const list = (data && data.success && Array.isArray(data.usuarios)) ? data.usuarios : [];
      list.forEach(u => {
        const user = {
          id: u.id,
          name: `${u.nombres} ${u.apellidos}`,
          email: u.correo_institucional,
          role: u.rol,
          status: u.estado === 'Activo' ? 'active' : 'inactive'
        };
        const userCard = createUserCard(user);
        container.appendChild(userCard);
      });
    })
    .catch(() => {});
}

function createUserCard(user) {
  const card = document.createElement('div');
  card.className = 'user-card';
  card.innerHTML = `
    <div class="user-avatar">
      <i class="fas fa-user"></i>
    </div>
    <div class="user-details">
      <div class="user-name">${user.name}</div>
      <div class="user-email">${user.email}</div>
      <div>
        <span class="user-role">${user.role}</span>
        <span class="user-status ${user.status}">${user.status === 'active' ? 'Activo' : 
          user.status === 'inactive' ? 'Inactivo' : 'Pendiente'}</span>
      </div>
    </div>
    <div class="user-actions">
      <button class="btn-icon small" onclick="editUser(${user.id})">
        <i class="fas fa-edit"></i>
      </button>
    </div>
  `;
  return card;
}

function updateLastAccessTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-PE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  document.getElementById('lastAccessTime').textContent = timeString;
}

function updateSystemMetrics() {
  const uptime = '99.8%';
  const dbUsage = '65%';
  const uptimeEl = document.getElementById('systemUptime');
  if (uptimeEl) uptimeEl.textContent = uptime;
  const uptimeFooterEl = document.getElementById('systemUptimeFooter');
  if (uptimeFooterEl) uptimeFooterEl.textContent = uptime;
  const dbUsageFooterEl = document.getElementById('dbUsageFooter');
  if (dbUsageFooterEl) dbUsageFooterEl.textContent = dbUsage;
}

function setupAdminEventListeners() {
  // Menú toggle para móviles
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      document.querySelector('.sidebar').classList.toggle('active');
    });
  }
  
  // Cerrar menú al hacer clic en enlace (móviles)
  const menuItems = document.querySelectorAll('.menu-item:not(.disabled)');
  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      if (window.innerWidth <= 992) {
        document.querySelector('.sidebar').classList.remove('active');
      }
    });
  });
  
  // Botón de notificaciones
  const notificationsBtn = document.getElementById('notificationsBtn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', function() {
      alert('Panel de notificaciones del sistema');
    });
  }
  
  // Botón de estado del sistema
  const systemStatusBtn = document.getElementById('systemStatusBtn');
  if (systemStatusBtn) {
    systemStatusBtn.addEventListener('click', function() {
      alert('Estado del sistema:\n\n• Servidor: Operativo\n• Base de datos: Conectada\n• Memoria: 45% utilizada\n• CPU: 30% utilizada');
    });
  }
  
  // Botón de cerrar sesión
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        // Simular cierre de sesión
        window.location.href = '/login';
      }
    });
  }
  
  // Botón "Aprobar todas"
  const approveAllBtn = document.getElementById('approveAllBtn');
  if (approveAllBtn) {
    approveAllBtn.addEventListener('click', function() {
      const modal = document.getElementById('approveModal');
      if (modal) {
        modal.classList.add('active');
      }
    });
  }
  
  // Botón "Agregar usuario"
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', function() {
      alert('Redirigiendo al formulario de nuevo usuario...');
    });
  }
  
  // Botón "Exportar usuarios"
  const exportUsersBtn = document.getElementById('exportUsersBtn');
  if (exportUsersBtn) {
    exportUsersBtn.addEventListener('click', function() {
      alert('Exportando lista de usuarios a Excel...');
    });
  }
  
  // Botón "Gestionar catálogos"
  const manageCatalogsBtn = document.getElementById('manageCatalogsBtn');
  if (manageCatalogsBtn) {
    manageCatalogsBtn.addEventListener('click', function() {
      alert('Redirigiendo a la gestión de catálogos...');
    });
  }
  
  // Botón "Marcar alertas como leídas"
  const markAlertsBtn = document.getElementById('markAllAlertsReadBtn');
  if (markAlertsBtn) {
    markAlertsBtn.addEventListener('click', function() {
      fetch('/api/admin/alerts/mark-all-read', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (!data || !data.success) throw new Error((data && data.message) || 'No se pudo marcar como leídas');
          loadSystemData();
        })
        .catch(err => {
          alert(err && err.message ? err.message : 'Error');
        });
    });
  }
  
  // Aplicar filtros
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      const role = document.getElementById('filterRole').value;
      const status = document.getElementById('filterStatus').value;

      const rolMap = {
        admin: 'Administrador',
        docente: 'Docente Investigador',
        evaluador: 'Comite Editor',
        director: 'Director General'
      };

      const estadoMap = {
        active: 'Activo',
        inactive: 'Inactivo'
      };

      const filters = {};
      if (role && role !== 'all') filters.rol = rolMap[role] || role;
      if (status && status !== 'all' && status !== 'pending') filters.estado = estadoMap[status] || status;

      loadUsers(filters);
    });
  }

  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    let t;
    searchInput.addEventListener('input', function() {
      clearTimeout(t);
      const q = (searchInput.value || '').trim();
      t = setTimeout(() => {
        loadUsers(q ? { q } : {});
      }, 300);
    });
  }
  
  // Botones del modal
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      document.getElementById('approveModal').classList.remove('active');
    });
  }
  
  const cancelApproveBtn = document.getElementById('cancelApproveBtn');
  if (cancelApproveBtn) {
    cancelApproveBtn.addEventListener('click', function() {
      document.getElementById('approveModal').classList.remove('active');
    });
  }
  
  const confirmApproveBtn = document.getElementById('confirmApproveBtn');
  if (confirmApproveBtn) {
    confirmApproveBtn.addEventListener('click', function() {
      const checkboxes = Array.from(document.querySelectorAll('.request-checkbox:checked'));
      const ids = checkboxes.map(cb => Number(cb.dataset.id)).filter(Boolean);
      if (ids.length === 0) {
        alert('Seleccione al menos una solicitud');
        return;
      }

      fetch('/api/admin/requests/approve-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
        .then(res => res.json())
        .then(data => {
          if (!data || !data.success) throw new Error((data && data.message) || 'No se pudo aprobar');
          document.getElementById('approveModal').classList.remove('active');
          loadSystemData();
        })
        .catch(err => {
          alert(err && err.message ? err.message : 'Error al aprobar');
        });
    });
  }

  const requestsTbody = document.getElementById('requestsTableBody');
  if (requestsTbody) {
    requestsTbody.addEventListener('click', async function(e) {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (!id) return;

      try {
        if (btn.classList.contains('approve')) {
          await approveRequestById(id);
          loadSystemData();
        } else if (btn.classList.contains('reject')) {
          if (!confirm('¿Está seguro de que desea rechazar esta solicitud?')) return;
          await rejectRequestById(id);
          loadSystemData();
        } else if (btn.classList.contains('view')) {
          alert(`Solicitud ID: ${id}`);
        }
      } catch (err) {
        alert(err && err.message ? err.message : 'Ocurrió un error');
      }
    });
  }
  
  // Select all checkbox
  const selectAll = document.getElementById('selectAll');
  if (selectAll) {
    selectAll.addEventListener('change', function() {
      const checkboxes = document.querySelectorAll('.request-checkbox');
      checkboxes.forEach(cb => {
        cb.checked = this.checked;
      });
    });
  }
}

// Funciones globales
window.editUser = function(userId) {
  alert(`Editando usuario ID: ${userId}`);
};

// Actualizar hora cada minuto
setInterval(updateLastAccessTime, 60000);
