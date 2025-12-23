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

function getSelectedRequestIds() {
  const checkboxes = Array.from(document.querySelectorAll('.request-checkbox:checked'));
  return checkboxes.map(cb => Number(cb.dataset.id)).filter(Boolean);
}

function openCatalogModal(type) {
  const modal = document.getElementById('catalogModal');
  if (!modal) return;
  const titleEl = document.getElementById('catalogModalTitle');
  const bodyEl = document.getElementById('catalogModalBody');
  if (!bodyEl) return;

  const titleMap = {
    programas: 'Programas Académicos',
    lineas: 'Líneas de Investigación',
    departamentos: 'Departamentos',
    'tipos-proyecto': 'Tipos de Proyecto'
  };

  if (titleEl) {
    titleEl.innerHTML = `<i class="fas fa-folder-open"></i> ${titleMap[type] || 'Catálogo'}`;
  }

  bodyEl.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><span>Cargando...</span></div>';
  modal.classList.add('active');

  const endpointMap = {
    programas: '/api/catalogos/programas',
    lineas: '/api/catalogos/lineas',
    departamentos: '/api/catalogos/departamentos',
    'tipos-proyecto': '/api/catalogos/tipos-proyecto'
  };

  const url = endpointMap[type];
  if (!url) {
    bodyEl.textContent = 'Catálogo no disponible';
    return;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const list = data && data.success && Array.isArray(data.data) ? data.data : [];
      bodyEl.innerHTML = '';

      if (list.length === 0) {
        bodyEl.innerHTML = '<p>No hay registros.</p>';
        return;
      }

      const table = document.createElement('table');
      table.className = 'admin-table';

      const thead = document.createElement('thead');
      const trh = document.createElement('tr');

      const cols = type === 'programas'
        ? ['ID', 'Nombre', 'Estado']
        : type === 'lineas'
          ? ['ID', 'Programa', 'Nombre', 'Estado']
          : type === 'departamentos'
            ? ['ID', 'Nombre', 'Estado', 'Usuarios']
            : ['Tipo'];

      cols.forEach(c => {
        const th = document.createElement('th');
        th.textContent = c;
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      list.forEach(item => {
        const tr = document.createElement('tr');
        const cells = type === 'programas'
          ? [item.id, item.nombre, item.estado]
          : type === 'lineas'
            ? [item.id, item.programa || '-', item.nombre, item.estado]
            : type === 'departamentos'
              ? [item.id, item.nombre, item.estado, item.usuarios]
              : [item.tipo];

        cells.forEach(v => {
          const td = document.createElement('td');
          td.textContent = v == null ? '' : String(v);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      const wrapper = document.createElement('div');
      wrapper.className = 'admin-table-container';
      wrapper.appendChild(table);
      bodyEl.appendChild(wrapper);
    })
    .catch(() => {
      bodyEl.textContent = 'Error cargando el catálogo.';
    });
}

function closeCatalogModal() {
  const modal = document.getElementById('catalogModal');
  if (!modal) return;
  modal.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', function() {
  const closeCatalogBtn = document.getElementById('closeCatalogBtn');
  if (closeCatalogBtn) closeCatalogBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeCatalogModal();
  });

  const catalogModalClose = document.getElementById('catalogModalClose');
  if (catalogModalClose) catalogModalClose.addEventListener('click', function(e) {
    e.preventDefault();
    closeCatalogModal();
  });

  const modal = document.getElementById('catalogModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeCatalogModal();
    });
  }
});

function setAllRequestCheckboxes(checked) {
  const checkboxes = Array.from(document.querySelectorAll('.request-checkbox'));
  checkboxes.forEach(cb => {
    cb.checked = !!checked;
  });
  const selectAll = document.getElementById('selectAll');
  if (selectAll) selectAll.checked = !!checked;
}

function buildSelectedUsersList(ids) {
  const container = document.getElementById('selectedUsersList');
  if (!container) return;
  container.innerHTML = '';

  const byId = new Map();
  Array.from(document.querySelectorAll('.request-checkbox')).forEach(cb => {
    const id = Number(cb.dataset.id);
    const row = cb.closest('tr');
    const nameCell = row ? row.querySelector('td:nth-child(2)') : null;
    const emailCell = row ? row.querySelector('td:nth-child(3)') : null;
    byId.set(id, {
      name: nameCell ? nameCell.textContent.trim() : `ID ${id}`,
      email: emailCell ? emailCell.textContent.trim() : ''
    });
  });

  ids.forEach(id => {
    const u = byId.get(id) || { name: `ID ${id}`, email: '' };
    const item = document.createElement('div');
    item.className = 'selected-user-item';
    item.textContent = u.email ? `${u.name} (${u.email})` : u.name;
    container.appendChild(item);
  });
}

function openApproveModal(ids) {
  const modal = document.getElementById('approveModal');
  if (!modal) return;

  const finalIds = Array.isArray(ids) ? ids : [];
  buildSelectedUsersList(finalIds);
  modal.classList.add('active');
}

function closeApproveModal() {
  const modal = document.getElementById('approveModal');
  if (!modal) return;
  modal.classList.remove('active');
}

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
      const payload = data && data.success ? (data.data || data) : {};
      const list = Array.isArray(payload.usuarios) ? payload.usuarios : [];
      list.forEach(u => {
        const user = {
          id: u.id,
          name: `${u.nombres} ${u.apellidos}`,
          email: u.correo_institucional,
          role: u.rol,
          estadoRaw: u.estado,
          status: u.estado === 'Activo' ? 'active' : (u.estado === 'Inactivo' ? 'inactive' : 'pending')
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
    <div class="user-card-top">
      <div class="user-meta">
        <div class="user-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="user-identity">
          <div class="user-name" title="${user.name}">${user.name}</div>
          <div class="user-email" title="${user.email}">${user.email}</div>
        </div>
      </div>
      <div class="user-actions">
        <button class="btn-icon small" onclick="editUser(${user.id})" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon small" onclick="toggleUserEstado(${user.id}, '${user.estadoRaw}')" title="Activar/Inactivar">
          <i class="fas fa-power-off"></i>
        </button>
        <button class="btn-icon small" onclick="deleteUser(${user.id})" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="user-card-bottom">
      <span class="user-role">${user.role}</span>
      <span class="user-status ${user.status}">${user.status === 'active' ? 'Activo' : 
        user.status === 'inactive' ? 'Inactivo' : 'Pendiente'}</span>
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
      // Si no hay ninguna marcada, seleccionar todas
      const ids = getSelectedRequestIds();
      if (ids.length === 0) {
        setAllRequestCheckboxes(true);
      }
      const finalIds = getSelectedRequestIds();
      if (finalIds.length === 0) {
        alert('No hay solicitudes para aprobar');
        return;
      }
      openApproveModal(finalIds);
    });
  }
  
  // Botón "Agregar usuario"
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', function() {
      openUserModal();
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
      openCatalogModal('programas');
    });
  }

  const catalogsSection = document.getElementById('catalogos');
  if (catalogsSection) {
    catalogsSection.addEventListener('click', function(e) {
      const btn = e.target.closest('button.btn-catalog');
      if (!btn) return;
      const type = btn.dataset.catalog || '';
      if (!type) return;
      openCatalogModal(type);
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
  const approveModal = document.getElementById('approveModal');
  if (approveModal) {
    // Cerrar con X
    const modalClose = approveModal.querySelector('.modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', function(e) {
        e.preventDefault();
        closeApproveModal();
      });
    }

    // Cerrar al hacer click fuera
    approveModal.addEventListener('click', function(e) {
      if (e.target === approveModal) {
        closeApproveModal();
      }
    });
  }
  
  const cancelApproveBtn = document.getElementById('cancelApproveBtn');
  if (cancelApproveBtn) {
    cancelApproveBtn.addEventListener('click', function() {
      closeApproveModal();
    });
  }
  
  const confirmApproveBtn = document.getElementById('confirmApproveBtn');
  if (confirmApproveBtn) {
    confirmApproveBtn.addEventListener('click', function() {
      const ids = getSelectedRequestIds();
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
          closeApproveModal();
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
  openUserModal(userId);
};

window.deleteUser = async function(userId) {
  if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;
  try {
    const url = `/api/usuarios/id/${userId}`;
    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data || !data.success) {
      const msg = (data && (data.error || data.message)) || (res.status === 404 ? 'Ruta no encontrada' : 'No se pudo eliminar');
      throw new Error(`${msg} (${res.status}) -> ${url}`);
    }
    loadUsers();
  } catch (err) {
    alert(err && err.message ? err.message : 'Error al eliminar');
  }
};

window.toggleUserEstado = async function(userId, currentEstado) {
  try {
    const nextEstado = currentEstado === 'Activo' ? 'Inactivo' : 'Activo';
    const url = `/api/usuarios/id/${userId}/estado`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nextEstado })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data || !data.success) {
      const msg = (data && (data.error || data.message)) || (res.status === 404 ? 'Ruta no encontrada' : 'No se pudo actualizar');
      throw new Error(`${msg} (${res.status}) -> ${url}`);
    }
    loadUsers();
  } catch (err) {
    alert(err && err.message ? err.message : 'Error al actualizar estado');
  }
};

function openUserModal(userId) {
  const modal = document.getElementById('userModal');
  if (!modal) return;
  resetUserForm();
  if (userId) {
    document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Editar Usuario';
    loadUserIntoForm(userId);
  } else {
    document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Agregar Usuario';
  }
  modal.classList.add('active');
}

function closeUserModal() {
  const modal = document.getElementById('userModal');
  if (!modal) return;
  modal.classList.remove('active');
}

function resetUserForm() {
  const form = document.getElementById('userForm');
  if (form) form.reset();
  const idEl = document.getElementById('userId');
  if (idEl) idEl.value = '';
}

async function loadUserIntoForm(userId) {
  try {
    const url = `/api/usuarios/id/${userId}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    const u = data && data.success ? (data.data || null) : null;
    if (!res.ok || !u) {
      const msg = (data && (data.error || data.message)) || (res.status === 404 ? 'Ruta no encontrada' : 'No se pudo cargar');
      throw new Error(`${msg} (${res.status}) -> ${url}`);
    }

    document.getElementById('userId').value = u.id;
    document.getElementById('userDni').value = u.dni || '';
    document.getElementById('userNombres').value = u.nombres || '';
    document.getElementById('userApellidos').value = u.apellidos || '';
    document.getElementById('userEmail').value = u.correo_institucional || '';
    document.getElementById('userTelefono').value = u.telefono || '';
    document.getElementById('userRol').value = u.rol || 'Docente Investigador';
    document.getElementById('userEstado').value = u.estado || 'Activo';
  } catch (err) {
    alert(err && err.message ? err.message : 'Error al cargar usuario');
    closeUserModal();
  }
}

async function saveUserFromModal() {
  try {
    const id = (document.getElementById('userId').value || '').trim();
    const payload = {
      dni: document.getElementById('userDni').value.trim(),
      nombres: document.getElementById('userNombres').value.trim(),
      apellidos: document.getElementById('userApellidos').value.trim(),
      correo_institucional: document.getElementById('userEmail').value.trim(),
      telefono: (document.getElementById('userTelefono').value || '').trim() || null,
      rol: document.getElementById('userRol').value,
      estado: document.getElementById('userEstado').value
    };

    const password = (document.getElementById('userPassword').value || '').trim();
    if (!id && !password) {
      alert('La contraseña es requerida al crear un usuario');
      return;
    }
    if (password) payload.password = password;

    const url = id ? `/api/usuarios/id/${id}` : '/api/usuarios';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data || !data.success) {
      const msg = (data && (data.error || data.message)) || (res.status === 404 ? 'Ruta no encontrada' : 'No se pudo guardar');
      throw new Error(`${msg} (${res.status}) -> ${method} ${url}`);
    }

    closeUserModal();
    loadUsers();
  } catch (err) {
    alert(err && err.message ? err.message : 'Error al guardar');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const cancelUserBtn = document.getElementById('cancelUserBtn');
  if (cancelUserBtn) cancelUserBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeUserModal();
  });

  const userModalClose = document.getElementById('userModalClose');
  if (userModalClose) userModalClose.addEventListener('click', function(e) {
    e.preventDefault();
    closeUserModal();
  });

  const saveUserBtn = document.getElementById('saveUserBtn');
  if (saveUserBtn) saveUserBtn.addEventListener('click', function(e) {
    e.preventDefault();
    saveUserFromModal();
  });
});

// Actualizar hora cada minuto
setInterval(updateLastAccessTime, 60000);
