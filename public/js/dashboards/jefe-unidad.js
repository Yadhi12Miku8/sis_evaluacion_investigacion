// Dashboard Jefe de Unidad - IESTP AACD

document.addEventListener('DOMContentLoaded', function() {
  initJefeDashboard();
  loadUserIntoSidebar();
  setupJefeEventListeners();
  updateLastAccessTime();
  loadUnidadProjects();
  loadUnidadDocumentos();
  initTabs();
  loadNotificationsHistory();
  updateExpoDashboard();
  setupAdditionalEventListeners();
  updateFooterMetrics();
  setInterval(updateFooterMetrics, 30000);
});

function initJefeDashboard() {
  try {
    console.log('Dashboard Jefe de Unidad inicializado');
  } catch (e) {}
}

function loadUserIntoSidebar() {
  try {
    const stored = localStorage.getItem('user_data') || '{}';
    const user = JSON.parse(stored);
    if (user && user.nombres) {
      const name = `${user.nombres} ${user.apellidos || ''}`.trim();
      const nameEl = document.getElementById('userName');
      if (nameEl) nameEl.textContent = name;
    }
    if (user && user.rol) {
      const roleEl = document.querySelector('.user-role');
      if (roleEl) roleEl.textContent = user.rol;
    }
  } catch (e) {}
}

function setupJefeEventListeners() {
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.toggle('active');
    });
  }
  const menuItems = document.querySelectorAll('.menu .menu-item:not(.disabled)');
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (!this.hash) e.preventDefault();
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });
  const cancelEvalBtn = document.getElementById('cancelEvaluationBtn');
  const modalCloseBtn = document.querySelector('#evaluationModal .modal-close');
  [cancelEvalBtn, modalCloseBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', closeEvaluationModal);
  });
  const submitEvalBtn = document.getElementById('submitEvaluationBtn');
  if (submitEvalBtn) {
    submitEvalBtn.addEventListener('click', submitEvaluation);
  }
}

function updateLastAccessTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const el = document.getElementById('lastAccessTime');
  if (el) el.textContent = timeString;
}

async function loadUnidadProjects() {
  try {
    const token = localStorage.getItem('auth_token') || '';
    const resp = await fetch('/api/unidad/proyectos', {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const data = await resp.json();
    const proyectos = Array.isArray(data.proyectos) ? data.proyectos : [];
    const tbody = document.getElementById('projectsTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      proyectos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.titulo}</td>
          <td>${(p.nombres || '')} ${(p.apellidos || '')}</td>
          <td>${p.tipo || '-'}</td>
          <td><div class="progress-bar"><div class="progress" style="width:${getProgressFromEstado(p.estado)}%"></div></div></td>
          <td>${mapStatusText(String(p.estado || ''))}</td>
          <td>${formatDate(p.fecha_inicio)}</td>
          <td>
            <button class="btn-action view" data-proyecto="${p.id}">
              <i class="fas fa-eye"></i> Ver
            </button>
            <button class="btn-action approve" data-proyecto="${p.id}" data-tipo="Perfil">
              <i class="fas fa-check"></i> Evaluar Perfil
            </button>
            <button class="btn-action comment" data-proyecto="${p.id}" data-tipo="Informe Final">
              <i class="fas fa-clipboard-check"></i> Eval. Informe
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      const totalBadge = document.getElementById('totalProjectsBadge');
      if (totalBadge) totalBadge.textContent = String(proyectos.length);
    }
    updateProjectCounters(proyectos);
    wireProjectTableActions();
  } catch (e) {
    console.warn('Error al cargar proyectos de unidad', e);
  }
}

async function loadUnidadDocumentos() {
  try {
    const token = localStorage.getItem('auth_token') || '';
    const resp = await fetch('/api/unidad/documentos', {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
  const data = await resp.json();
  const documentos = Array.isArray(data.documentos) ? data.documentos : [];
  const profiles = documentos.filter(d => String(d.tipo_documento || '').toLowerCase().includes('perfil') && String(d.estado || '').toLowerCase().includes('revision'));
  const reports = documentos.filter(d => String(d.tipo_documento || '').toLowerCase().includes('informe') && String(d.estado || '').toLowerCase().includes('revision'));
  const articles = documentos.filter(d => String(d.tipo_documento || '').toLowerCase().includes('art') && String(d.estado || '').toLowerCase().includes('revision'));
    const profilesBadge = document.getElementById('pendingProfilesBadge');
    const reportsBadge = document.getElementById('pendingReportsBadge');
    const articlesBadge = document.getElementById('pendingArticlesBadge');
    if (profilesBadge) profilesBadge.textContent = String(profiles.length);
    if (reportsBadge) reportsBadge.textContent = String(reports.length);
    if (articlesBadge) articlesBadge.textContent = String(articles.length);
    renderEvaluationList('profilesList', profiles, 'Perfil');
    renderEvaluationList('reportsList', reports, 'Informe Final');
    wireEvaluationActions();
  } catch (e) {
    console.warn('Error al cargar documentos de unidad', e);
  }
}

function renderEvaluationList(containerId, docs, tipoLabel) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  docs.forEach(d => {
    const div = document.createElement('div');
    div.className = 'evaluation-item';
    div.innerHTML = `
      <div class="evaluation-header">
        <h3>${d.titulo || tipoLabel} · ${tipoLabel}</h3>
        <span class="evaluation-status ${String(d.estado || '').toLowerCase().includes('aprob') ? 'approved' : 'pending'}">${d.estado || 'Pendiente'}</span>
      </div>
      <div class="evaluation-details">
        <div class="detail-item"><i class="fas fa-user"></i><span>${(d.nombres || '')} ${(d.apellidos || '')}</span></div>
        <div class="detail-item"><i class="fas fa-calendar"></i><span>${formatDate(d.fecha_subida)}</span></div>
      </div>
      <div class="evaluation-actions">
        <button class="btn-action approve" data-proyecto="${d.proyecto_id}" data-tipo="${tipoLabel}" data-titulo="${d.titulo || ''}" data-investigador="${(d.nombres || '')} ${(d.apellidos || '')}" data-ruta="${d.ruta_archivo || ''}">
          <i class="fas fa-check"></i> Aprobar
        </button>
        <button class="btn-action reject" data-proyecto="${d.proyecto_id}" data-tipo="${tipoLabel}" data-titulo="${d.titulo || ''}" data-investigador="${(d.nombres || '')} ${(d.apellidos || '')}" data-ruta="${d.ruta_archivo || ''}">
          <i class="fas fa-times"></i> Rechazar
        </button>
        <button class="btn-action view" data-proyecto="${d.proyecto_id}" data-ruta="${d.ruta_archivo || ''}">
          <i class="fas fa-eye"></i> Ver Detalles
        </button>
        <button class="btn-action comment" data-proyecto="${d.proyecto_id}" data-tipo="${tipoLabel}" data-titulo="${d.titulo || ''}" data-investigador="${(d.nombres || '')} ${(d.apellidos || '')}" data-ruta="${d.ruta_archivo || ''}">
          <i class="fas fa-comment"></i> Observar
        </button>
      </div>
    `;
    container.appendChild(div);
  });
}

function wireEvaluationActions() {
  const approveBtns = document.querySelectorAll('.evaluation-actions .approve');
  const rejectBtns = document.querySelectorAll('.evaluation-actions .reject');
  const commentBtns = document.querySelectorAll('.evaluation-actions .comment');
  approveBtns.forEach(btn => btn.addEventListener('click', function() {
    const pid = Number(this.dataset.proyecto);
    const tipo = this.dataset.tipo || 'Perfil';
    openEvaluationModal(pid, tipo, 'Aprobado', { titulo: this.dataset.titulo || '', investigador: this.dataset.investigador || '', ruta: this.dataset.ruta || '' });
  }));
  rejectBtns.forEach(btn => btn.addEventListener('click', function() {
    const pid = Number(this.dataset.proyecto);
    const tipo = this.dataset.tipo || 'Perfil';
    openEvaluationModal(pid, tipo, 'Desaprobado', { titulo: this.dataset.titulo || '', investigador: this.dataset.investigador || '', ruta: this.dataset.ruta || '' });
  }));
  commentBtns.forEach(btn => btn.addEventListener('click', function() {
    const pid = Number(this.dataset.proyecto);
    const tipo = this.dataset.tipo || 'Perfil';
    openEvaluationModal(pid, tipo, 'Regular', { titulo: this.dataset.titulo || '', investigador: this.dataset.investigador || '', ruta: this.dataset.ruta || '' });
  }));
}

function wireProjectTableActions() {
  const table = document.getElementById('projectsTableBody');
  if (!table) return;
  table.querySelectorAll('.btn-action.approve').forEach(btn => {
    btn.addEventListener('click', function() {
      const pid = Number(this.dataset.proyecto);
      const tipo = this.dataset.tipo || 'Perfil';
      openEvaluationModal(pid, tipo, 'Aprobado');
    });
  });
  table.querySelectorAll('.btn-action.comment').forEach(btn => {
    btn.addEventListener('click', function() {
      const pid = Number(this.dataset.proyecto);
      const tipo = this.dataset.tipo || 'Informe Final';
      openEvaluationModal(pid, tipo, 'Observado');
    });
  });
}

function openEvaluationModal(proyectoId, tipo, condicionPreseleccionada, details) {
  const modal = document.getElementById('evaluationModal');
  const body = modal ? modal.querySelector('.modal-body') : null;
  if (!modal || !body) return;
  modal.dataset.proyectoId = String(proyectoId);
  modal.dataset.tipo = String(tipo || 'Perfil');
  const condicion = condicionPreseleccionada || 'Aprobado';
  body.innerHTML = `
    <div class="evaluation-form">
      <div class="form-row">
        <div class="form-group">
          <label>Tipo de Evaluación</label>
          <input type="text" id="evalTipo" value="${tipo}" readonly>
        </div>
        <div class="form-group">
          <label>Condición</label>
          <select id="evalCondicion">
            <option ${condicion === 'Aprobado' ? 'selected' : ''}>Aprobado</option>
            <option ${condicion === 'Regular' ? 'selected' : ''}>Regular</option>
            <option ${condicion === 'Desaprobado' ? 'selected' : ''}>Desaprobado</option>
          </select>
        </div>
        <div class="form-group">
          <label>Puntaje Total</label>
          <input type="number" id="evalPuntaje" min="0" max="100" step="1" placeholder="0 - 100">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Proyecto</label>
          <input type="text" id="evalProyectoTitulo" value="${details && details.titulo ? details.titulo : ''}" readonly>
        </div>
        <div class="form-group">
          <label>Investigador</label>
          <input type="text" id="evalInvestigador" value="${details && details.investigador ? details.investigador : ''}" readonly>
        </div>
      </div>
      <div class="form-group">
        <label>Documento</label>
        <a id="evalDocumentoLink" href="${details && details.ruta ? details.ruta : '#'}" target="_blank" class="btn-secondary" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;border:1px solid #e2e8f0;">Ver archivo</a>
      </div>
      <div class="form-group">
        <label>Observaciones</label>
        <textarea id="evalObservaciones" rows="4" placeholder="Ingrese observaciones o correcciones..."></textarea>
      </div>
      <div class="form-group">
        <label>Criterios (opcional)</label>
        <div class="criteria-list" id="criteriaList">
          ${renderCriteriaItem('Pertinencia', 0)}
          ${renderCriteriaItem('Metodología', 0)}
          ${renderCriteriaItem('Impacto', 0)}
          ${renderCriteriaItem('Viabilidad', 0)}
        </div>
      </div>
    </div>
  `;
  modal.style.display = 'block';
}

function renderCriteriaItem(nombre, puntaje) {
  return `
    <div class="criteria-item">
      <input type="text" class="criteria-name" value="${nombre}">
      <input type="number" class="criteria-score" min="0" max="25" step="1" value="${puntaje}">
    </div>
  `;
}

function closeEvaluationModal() {
  const modal = document.getElementById('evaluationModal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.dataset.proyectoId = '';
  modal.dataset.tipo = '';
  const body = modal.querySelector('.modal-body');
  if (body) body.innerHTML = '';
}

function collectCriteria() {
  const list = document.getElementById('criteriaList');
  if (!list) return [];
  const items = Array.from(list.querySelectorAll('.criteria-item'));
  return items.map(it => ({
    criterio: (it.querySelector('.criteria-name') && it.querySelector('.criteria-name').value) || '',
    puntaje: Number((it.querySelector('.criteria-score') && it.querySelector('.criteria-score').value) || 0)
  }));
}

function submitEvaluation() {
  const modal = document.getElementById('evaluationModal');
  if (!modal) return;
  const proyectoId = Number(modal.dataset.proyectoId || 0);
  const tipo = modal.dataset.tipo || 'Perfil';
  const condicion = document.getElementById('evalCondicion') ? document.getElementById('evalCondicion').value : 'Aprobado';
  const puntaje = Number(document.getElementById('evalPuntaje') ? document.getElementById('evalPuntaje').value : 0);
  const observaciones = document.getElementById('evalObservaciones') ? document.getElementById('evalObservaciones').value : '';
  const criteria = collectCriteria();
  const criteriaText = criteria.map(c => `${c.criterio}:${c.puntaje}`).join(',').slice(0, 50);
  if (!proyectoId) {
    alert('Proyecto inválido');
    return;
  }
  const payload = {
    proyecto_id: proyectoId,
    tipo: tipo,
    tabla_evaluacion: criteriaText || null,
    puntaje_total: puntaje || null,
    condicion: condicion,
    observaciones: observaciones || null
  };
  const token = localStorage.getItem('auth_token') || '';
  fetch('/api/evaluaciones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(res => {
    if (res && res.success) {
      alert('Evaluación registrada exitosamente');
      closeEvaluationModal();
      loadUnidadDocumentos();
    } else {
      alert(res && res.message ? res.message : 'Error al registrar evaluación');
    }
  })
  .catch(() => {
    alert('Error de red al registrar evaluación');
  });
}

function updateProjectCounters(proyectos) {
  const active = proyectos.filter(p => String(p.estado || '').toLowerCase().includes('ejec')).length;
  const completed = proyectos.filter(p => String(p.estado || '').toLowerCase().includes('compl') || String(p.estado || '').toLowerCase().includes('final')).length;
  const delayed = proyectos.filter(p => String(p.estado || '').toLowerCase().includes('atras')).length;
  const elActive = document.getElementById('activeProjects');
  const elCompleted = document.getElementById('projectsCompleted');
  const elDelayed = document.getElementById('projectsDelayed');
  if (elActive) elActive.textContent = String(active);
  if (elCompleted) elCompleted.textContent = String(completed);
  if (elDelayed) elDelayed.textContent = String(delayed);
  const footerTotal = document.getElementById('totalSupervisedProjects');
  if (footerTotal) footerTotal.textContent = String(proyectos.length);
}

function getProgressFromEstado(estado) {
  const s = String(estado || '').toLowerCase();
  if (s.includes('ejec')) return 50;
  if (s.includes('pend')) return 10;
  if (s.includes('final')) return 100;
  if (s.includes('compl')) return 100;
  return 40;
}

function mapStatusText(estado) {
  const s = String(estado || '').toLowerCase();
  if (s.includes('ejec')) return 'En ejecución';
  if (s.includes('pend')) return 'Pendiente';
  if (s.includes('final') || s.includes('compl')) return 'Completado';
  if (s.includes('eval')) return 'Evaluado';
  return 'En ejecución';
}

function formatDate(dt) {
  if (!dt) return '-';
  try {
    const d = new Date(dt);
    return d.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) {
    return String(dt).slice(0, 10);
  }
}

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Actualizar botones activos
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Mostrar pane correspondiente
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `${tabId}-pane`) {
          pane.classList.add('active');
        }
      });
    });
  });
}

function loadNotificationsHistory() {
  const historyList = document.getElementById('notificationsHistory');
  if (!historyList) return;
  historyList.innerHTML = '';
  try {
    const stored = localStorage.getItem('user_data') || '{}';
    const user = JSON.parse(stored);
    if (!user || !user.usuario_id) return;
    fetch(`/api/notificaciones/${user.usuario_id}`)
      .then(r => r.json())
      .then(data => {
        const rows = data && data.success && Array.isArray(data.notificaciones) ? data.notificaciones : [];
        rows.forEach(n => {
          const type = String(n.tipo || '').toLowerCase().includes('eval') ? 'approval' : 'reminder';
          const item = document.createElement('div');
          item.className = 'history-item';
          item.innerHTML = `
            <div class="history-icon">
              <i class="fas fa-${getNotificationIcon(type)}"></i>
            </div>
            <div class="history-content">
              <p><strong>${n.titulo || 'Notificación'}</strong> - ${n.mensaje || ''}</p>
              <small>${new Date(n.fecha_envio).toLocaleString('es-PE')}</small>
            </div>
          `;
          historyList.appendChild(item);
        });
      })
      .catch(() => {});
  } catch (_) {}
}

function getNotificationIcon(type) {
  const icons = {
    'deadline': 'clock',
    'observation': 'comment',
    'approval': 'check-circle',
    'event': 'calendar',
    'reminder': 'bell'
  };
  return icons[type] || 'bell';
}

function updateExpoDashboard() {
  // Simulación de datos de exposición
  const expoData = {
    registered: 15,
    pending: 3,
    approved: 12,
    daysLeft: 45
  };
  
  document.getElementById('expoRegistered').textContent = expoData.registered;
  document.getElementById('expoPending').textContent = expoData.pending;
  document.getElementById('expoApproved').textContent = expoData.approved;
  document.getElementById('expoDaysLeft').textContent = expoData.daysLeft;
  
  // Cargar proyectos recientes de exposición
  loadExpoProjects();
}

function loadExpoProjects() {
  const expoProjects = [
    {
      id: 1,
      name: "Desarrollo de Sistema IoT para Monitoreo Agrícola",
      researcher: "Lourdes Lidia",
      status: "approved"
    },
    {
      id: 2,
      name: "Implementación de Plataforma E-learning Accesible",
      researcher: "Carlos Rodríguez",
      status: "approved"
    },
    {
      id: 3,
      name: "Estudio de Impacto de Redes Sociales",
      researcher: "Ana Martínez",
      status: "pending"
    }
  ];
  
  const expoList = document.getElementById('expoProjectsList');
  if (!expoList) return;
  
  expoProjects.forEach(project => {
    const item = document.createElement('div');
    item.className = 'expo-list-item';
    item.innerHTML = `
      <div class="expo-item-header">
        <strong>${project.name}</strong>
        <span class="expo-status ${project.status}">
          ${project.status === 'approved' ? 'Aprobado' : 'Pendiente'}
        </span>
      </div>
      <div class="expo-item-researcher">
        <i class="fas fa-user"></i> ${project.researcher}
      </div>
    `;
    expoList.appendChild(item);
  });
}

function setupAdditionalEventListeners() {
  // Botón de nueva solicitud RD
  const newRDRequestBtn = document.getElementById('newRDRequestBtn');
  if (newRDRequestBtn) {
    newRDRequestBtn.addEventListener('click', function() {
      alert('Redirigiendo al formulario de solicitud de RD...');
    });
  }
  
  // Botón de gestión de exposición
  const manageExpoBtn = document.getElementById('manageExpoBtn');
  if (manageExpoBtn) {
    manageExpoBtn.addEventListener('click', function() {
      alert('Redirigiendo a la gestión de exposición anual...');
    });
  }
  
  // Botón de nuevo mensaje/notificación
  const newNotificationBtn = document.getElementById('newNotificationBtn');
  if (newNotificationBtn) {
    newNotificationBtn.addEventListener('click', function() {
      document.getElementById('notificationMessage').focus();
    });
  }
  
  // Botón de enviar notificación
  const sendNotificationBtn = document.getElementById('sendNotificationBtn');
  if (sendNotificationBtn) {
    sendNotificationBtn.addEventListener('click', function() {
      const message = document.getElementById('notificationMessage').value;
      const type = document.getElementById('notificationType').value;
      const recipients = document.getElementById('notificationRecipients').value;
      
      if (!message.trim()) {
        alert('Por favor escriba un mensaje para la notificación');
        return;
      }
      
      alert(`Notificación enviada a ${recipients}\nTipo: ${type}\n\nMensaje: ${message}`);
      
      // Limpiar formulario
      document.getElementById('notificationMessage').value = '';
    });
  }
  
  // Botón de exportar proyectos
  const exportProjectsBtn = document.getElementById('exportProjectsBtn');
  if (exportProjectsBtn) {
    exportProjectsBtn.addEventListener('click', function() {
      alert('Exportando lista de proyectos a Excel...');
    });
  }
  
  // Botón de aprobar múltiples
  const bulkApproveBtn = document.getElementById('bulkApproveBtn');
  if (bulkApproveBtn) {
    bulkApproveBtn.addEventListener('click', function() {
      if (confirm('¿Aprobar todas las evaluaciones seleccionadas?')) {
        alert('Evaluaciones aprobadas exitosamente');
      }
    });
  }
}

function updateFooterMetrics() {
  // Actualizar métricas del footer
  const proyectos = document.querySelectorAll('#projectsTableBody tr').length;
  const investigadores = new Set(Array.from(document.querySelectorAll('#projectsTableBody td:nth-child(2)')).map(td => td.textContent.trim())).size;
  
  document.getElementById('totalSupervisedProjects').textContent = proyectos;
  document.getElementById('totalResearchers').textContent = investigadores;
  
  // Calcular tasa de aprobación aproximada
  const aprobados = document.querySelectorAll('.evaluation-status.approved').length;
  const totalEvaluaciones = document.querySelectorAll('.evaluation-status').length;
  const tasa = totalEvaluaciones > 0 ? Math.round((aprobados / totalEvaluaciones) * 100) : 0;
  document.getElementById('approvalRate').textContent = `${tasa}%`;
}

// Agregar estas llamadas en el DOMContentLoaded:
document.addEventListener('DOMContentLoaded', function() {
  initJefeDashboard();
  loadUserIntoSidebar();
  setupJefeEventListeners();
  updateLastAccessTime();
  loadUnidadProjects();
  loadUnidadDocumentos();
  
  // Nuevas funciones agregadas:
  initTabs();
  loadNotificationsHistory();
  updateExpoDashboard();
  setupAdditionalEventListeners();
  updateFooterMetrics();
  
  // Actualizar cada 30 segundos
  setInterval(updateFooterMetrics, 30000);
});

// Funciones auxiliares para manejar acciones en la tabla
window.viewProject = function(projectId) {
  alert(`Viendo detalles del proyecto ${projectId}`);
};

window.monitorProject = function(projectId) {
  alert(`Monitoreando avances del proyecto ${projectId}`);
};

// Funciones para manejar evaluaciones
window.approveEvaluation = function(evaluationId) {
  if (confirm('¿Está seguro de aprobar esta evaluación?')) {
    alert(`Evaluación ${evaluationId} aprobada exitosamente`);
    
    // Actualizar contador
    const current = parseInt(document.getElementById('pendingEvaluations')?.textContent || '0');
    document.getElementById('pendingEvaluations').textContent = Math.max(0, current - 1);
  }
};

window.rejectEvaluation = function(evaluationId) {
  const reason = prompt('Ingrese el motivo del rechazo:');
  if (reason) {
    alert(`Evaluación ${evaluationId} rechazada\nMotivo: ${reason}`);
    
    // Actualizar contador
    const current = parseInt(document.getElementById('pendingEvaluations')?.textContent || '0');
    document.getElementById('pendingEvaluations').textContent = Math.max(0, current - 1);
  }
};

window.addObservation = function(evaluationId) {
  const observation = prompt('Agregue su observación:');
  if (observation) {
    alert(`Observación agregada a evaluación ${evaluationId}\n\n${observation}`);
  }
};

window.openEvaluationModal = openEvaluationModal;
