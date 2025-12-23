// Dashboard Docente Investigador IESTP AACD

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar dashboard
  initDashboard();
  
  // Cargar datos del usuario
  loadUserData();
  
  // Cargar datos del dashboard
  loadDashboardData();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Simular datos iniciales
  simulateInitialData();
});

function initDashboard() {
  console.log('Dashboard Docente Investigador IESTP AACD inicializado');
  
  // Configurar tema
  const theme = localStorage.getItem('docenteTheme') || 'light';
  document.body.classList.toggle('dark-theme', theme === 'dark');
  
  // Actualizar icono del tema
  updateThemeIcon();
  
  // Actualizar última actualización
  updateLastUpdate();
}

function loadUserData() {
  try {
    // Obtener datos del usuario del localStorage o simular
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    if (!user || !user.nombres) {
      // Datos de ejemplo para demostración
      user.nombres = 'Juan Carlos';
      user.apellidos = 'Pérez Rodríguez';
      user.rol = 'Docente Investigador';
      user.email = 'jperez@iestp-aacd.edu.pe';
      user.especialidad = 'Ingeniería de Sistemas';
      user.codigo = 'DOC-2024-001';
    }
    
    // Actualizar interfaz con datos del usuario
    updateUserInterface(user);
    
    // Guardar datos en localStorage para persistencia
    localStorage.setItem('user_data', JSON.stringify(user));
    
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
  }
}

function updateUserInterface(user) {
  // Actualizar nombre en sidebar
  const userName = `${user.nombres} ${user.apellidos || ''}`.trim();
  document.getElementById('userName').textContent = userName;
  
  // Actualizar nombre en banner de bienvenida
  document.getElementById('welcomeUserName').textContent = user.nombres;
  
  // Actualizar rol
  if (user.rol) {
    document.getElementById('userRole').textContent = user.rol;
  }
  
  // Configurar enlace a proyectos del usuario
  const link = document.getElementById('linkMisProyectos');
  if (user.usuario_id && link) {
    link.href = `/api/proyectos/${user.usuario_id}`;
    link.target = '_blank';
  }
}

function loadDashboardData() {
  // Simular carga de datos del dashboard
  setTimeout(() => {
    // Contadores principales
    updateCounters();
    
    // Cargar proyectos del usuario
    loadUserProjects();
    
    // Cargar tareas pendientes
    loadPendingTasks();
    
    // Cargar notificaciones
    loadNotifications();
    
    // Cargar eventos próximos
    loadUpcomingEvents();
    
    // Cargar producción científica
    loadScientificProduction();
    
  }, 1500);
}

function updateCounters() {
  // Actualizar contadores en la interfaz
  const counters = {
    'myProjectsCount': 4,
    'activeProjectsCount': 2,
    'pendingProjectsCount': 1,
    'completedProjectsCount': 1,
    'evaluatedProjectsCount': 0,
    'pendingAdvances': 3,
    'finalReportsDue': 1,
    'articlesCount': 5,
    'upcomingEvents': 2,
    'notificationCount': 3,
    'headerNotificationCount': 3
  };
  
  Object.keys(counters).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = counters[id];
    }
  });
}

function loadUserProjects() {
  const projects = [
    {
      id: 1,
      title: "Desarrollo de Sistema IoT para Monitoreo Agrícola",
      status: "active",
      progress: 75,
      line: "Tecnología e Innovación",
      lastUpdate: "15/11/2024",
      nextDeadline: "30/11/2024"
    },
    {
      id: 2,
      title: "Implementación de Plataforma E-learning Accesible",
      status: "active",
      progress: 60,
      line: "Educación",
      lastUpdate: "10/11/2024",
      nextDeadline: "25/11/2024"
    },
    {
      id: 3,
      title: "Estudio de Impacto de Redes Sociales en Estudiantes",
      status: "pending",
      progress: 20,
      line: "Ciencias Sociales",
      lastUpdate: "05/11/2024",
      nextDeadline: "20/11/2024"
    },
    {
      id: 4,
      title: "Aplicación Móvil para Gestión de Salud Mental",
      status: "completed",
      progress: 100,
      line: "Salud y Bienestar",
      lastUpdate: "30/10/2024",
      nextDeadline: "Completado"
    }
  ];
  
  const container = document.getElementById('recentProjectsList');
  if (!container) return;
  
  // Limpiar skeleton
  container.innerHTML = '';
  
  // Agregar proyectos a la lista
  projects.forEach(project => {
    const projectItem = createProjectElement(project);
    container.appendChild(projectItem);
  });
}

function createProjectElement(project) {
  const div = document.createElement('div');
  div.className = 'project-item';
  div.innerHTML = `
    <div class="project-avatar">
      <i class="fas fa-flask"></i>
    </div>
    <div class="project-info">
      <div class="project-title">${project.title}</div>
      <div class="project-meta">
        <span>Línea: ${project.line}</span>
        <span>Progreso: ${project.progress}%</span>
        <span class="project-status ${project.status}">
          ${getStatusText(project.status)}
        </span>
      </div>
    </div>
    <div class="project-actions">
      <button class="btn-icon small" onclick="viewProject(${project.id})">
        <i class="fas fa-eye"></i>
      </button>
    </div>
  `;
  
  return div;
}

function getStatusText(status) {
  const statusMap = {
    'active': 'En ejecución',
    'pending': 'Pendiente',
    'completed': 'Completado',
    'evaluated': 'Evaluado'
  };
  
  return statusMap[status] || status;
}

function loadPendingTasks() {
  const tasks = {
    documentation: [
      { id: 1, title: "Actualizar marco teórico", project: "IoT Agrícola", dueDate: "20/11/2024" },
      { id: 2, title: "Revisar metodología", project: "Plataforma E-learning", dueDate: "18/11/2024" },
      { id: 3, title: "Preparar presentación", project: "Impacto Redes Sociales", dueDate: "15/11/2024" }
    ],
    deadlines: [
      { id: 4, title: "Entrega informe de avance", date: "25/11/2024", type: "avance" },
      { id: 5, title: "Inscripción exposición anual", date: "30/11/2024", type: "evento" },
      { id: 6, title: "Registro de gastos", date: "28/11/2024", type: "finanzas" }
    ],
    advances: [
      { id: 7, title: "Reportar avances proyecto IoT", progress: 75, lastReport: "01/11/2024" },
      { id: 8, title: "Actualizar estado E-learning", progress: 60, lastReport: "05/11/2024" }
    ]
  };
  
  // Cargar tareas de documentación
  const docContainer = document.getElementById('documentationTasks');
  if (docContainer) {
    tasks.documentation.forEach(task => {
      const taskElement = createDocumentationTask(task);
      docContainer.appendChild(taskElement);
    });
  }
  
  // Cargar fechas límite
  const deadlineContainer = document.getElementById('deadlineTasks');
  if (deadlineContainer) {
    tasks.deadlines.forEach(task => {
      const taskElement = createDeadlineTask(task);
      deadlineContainer.appendChild(taskElement);
    });
  }
  
  // Cargar avances pendientes
  const progressContainer = document.getElementById('progressTasks');
  if (progressContainer) {
    tasks.advances.forEach(task => {
      const taskElement = createProgressTask(task);
      progressContainer.appendChild(taskElement);
    });
  }
}

function createDocumentationTask(task) {
  const div = document.createElement('div');
  div.className = 'task-item';
  div.innerHTML = `
    <div class="task-checkbox" onclick="toggleTask(this)"></div>
    <div class="task-content">
      <div class="task-title">${task.title}</div>
      <div class="task-desc">Proyecto: ${task.project}</div>
    </div>
    <div class="task-date">${task.dueDate}</div>
  `;
  return div;
}

function createDeadlineTask(task) {
  const div = document.createElement('div');
  div.className = 'task-item';
  const icon = task.type === 'avance' ? 'fa-chart-line' : 
                task.type === 'evento' ? 'fa-calendar' : 'fa-coins';
  div.innerHTML = `
    <div class="task-checkbox" onclick="toggleTask(this)"></div>
    <div class="task-content">
      <div class="task-title">${task.title}</div>
      <div class="task-desc"><i class="fas ${icon}"></i> ${task.type}</div>
    </div>
    <div class="task-date warning">${task.date}</div>
  `;
  return div;
}

function createProgressTask(task) {
  const div = document.createElement('div');
  div.className = 'task-item';
  div.innerHTML = `
    <div class="task-checkbox" onclick="toggleTask(this)"></div>
    <div class="task-content">
      <div class="task-title">${task.title}</div>
      <div class="task-desc">
        <div class="progress-bar" style="margin-top: 5px;">
          <div class="progress" style="width: ${task.progress}%"></div>
        </div>
      </div>
    </div>
    <div class="task-date">Último: ${task.lastReport}</div>
  `;
  return div;
}

function loadNotifications() {
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Recordatorio: Exposición Anual',
      message: 'La inscripción para la exposición anual de proyectos está abierta hasta el 30 de noviembre.',
      time: 'Hace 2 horas',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Avance pendiente de registro',
      message: 'Tienes avances pendientes de registro en el proyecto "IoT Agrícola".',
      time: 'Hace 1 día',
      read: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Artículo aprobado',
      message: 'Tu artículo "Innovación en Educación Tecnológica" ha sido aprobado para publicación.',
      time: 'Hace 3 días',
      read: true
    }
  ];
  
  const container = document.getElementById('notificationsContainer');
  if (!container) return;
  
  // Mantener solo la notificación de bienvenida
  const welcomeNotification = container.querySelector('.notification-item');
  container.innerHTML = '';
  container.appendChild(welcomeNotification);
  
  // Agregar notificaciones
  notifications.filter(n => !n.read).forEach(notification => {
    const notificationElement = createNotificationElement(notification);
    container.appendChild(notificationElement);
  });
}

function createNotificationElement(notification) {
  const div = document.createElement('div');
  div.className = 'notification-item';
  div.innerHTML = `
    <div class="notification-icon ${notification.type}">
      <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
    </div>
    <div class="notification-content">
      <p><strong>${notification.title}</strong> - ${notification.message}</p>
      <small>${notification.time}</small>
    </div>
    <button class="notification-close" onclick="markNotificationAsRead(${notification.id})">
      <i class="fas fa-times"></i>
    </button>
  `;
  return div;
}

function getNotificationIcon(type) {
  const icons = {
    'info': 'info-circle',
    'warning': 'exclamation-triangle',
    'success': 'check-circle',
    'danger': 'exclamation-circle'
  };
  return icons[type] || 'bell';
}

function loadUpcomingEvents() {
  const events = [
    {
      id: 1,
      day: '25',
      month: 'NOV',
      title: 'Entrega de Avances',
      type: 'Académico',
      time: '23:59 hrs'
    },
    {
      id: 2,
      day: '30',
      month: 'NOV',
      title: 'Inscripción Exposición',
      type: 'Evento',
      time: 'Todo el día'
    },
    {
      id: 3,
      day: '05',
      month: 'DIC',
      title: 'Reunión de Investigadores',
      type: 'Reunión',
      time: '10:00 hrs'
    }
  ];
  
  const container = document.getElementById('upcomingEventsList');
  if (!container) return;
  
  events.forEach(event => {
    const eventElement = createEventElement(event);
    container.appendChild(eventElement);
  });
}

function createEventElement(event) {
  const div = document.createElement('div');
  div.className = 'event-item';
  div.innerHTML = `
    <div class="event-date">
      <span class="event-day">${event.day}</span>
      <span class="event-month">${event.month}</span>
    </div>
    <div class="event-content">
      <h5>${event.title}</h5>
      <div class="event-type">${event.type} • ${event.time}</div>
    </div>
  `;
  return div;
}

function loadScientificProduction() {
  // Actualizar círculos de estadísticas
  document.getElementById('articlesCountCircle').querySelector('span').textContent = '5';
  document.getElementById('projectsCountCircle').querySelector('span').textContent = '4';
  document.getElementById('citationsCountCircle').querySelector('span').textContent = '12';
  document.getElementById('participationCountCircle').querySelector('span').textContent = '8';
  
  // Cargar publicaciones recientes
  const publications = [
    {
      id: 1,
      title: 'IoT aplicado a la agricultura de precisión',
      journal: 'Revista de Tecnología Agrícola',
      year: 2024,
      status: 'Publicado'
    },
    {
      id: 2,
      title: 'Plataformas E-learning accesibles para educación inclusiva',
      journal: 'Journal of Educational Technology',
      year: 2023,
      status: 'Publicado'
    },
    {
      id: 3,
      title: 'Impacto de redes sociales en el rendimiento académico',
      journal: 'Revista de Ciencias Sociales',
      year: 2024,
      status: 'En revisión'
    }
  ];
  
  const container = document.getElementById('recentPublications');
  if (!container) return;
  
  publications.forEach(pub => {
    const pubElement = createPublicationElement(pub);
    container.appendChild(pubElement);
  });
}

function createPublicationElement(publication) {
  const div = document.createElement('div');
  div.className = 'publication-item';
  div.innerHTML = `
    <div class="publication-icon">
      <i class="fas fa-newspaper"></i>
    </div>
    <div class="publication-content">
      <h5>${publication.title}</h5>
      <div class="publication-meta">
        <span>${publication.journal}</span>
        <span>${publication.year}</span>
        <span class="publication-status">${publication.status}</span>
      </div>
    </div>
  `;
  return div;
}

function setupEventListeners() {
  // Alternar sidebar en móviles
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      document.querySelector('.sidebar').classList.toggle('active');
    });
  }
  
  // Alternar tema claro/oscuro
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Botón de ayuda
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', function() {
      alert('Para ayuda, contacte al soporte técnico: soporte@iestp-aacd.edu.pe\nTeléfono: (01) 123-4567');
    });
  }
  
  // Botón de notificaciones
  const notificationsBtn = document.getElementById('notificationsBtn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', function() {
      // Marcar todas como leídas
      markAllNotificationsAsRead();
    });
  }
  
  // Botones de nuevo proyecto
  const newProjectBtns = document.querySelectorAll('#newProjectBtn, #newProjectBtnHeader');
  newProjectBtns.forEach(btn => {
    btn.addEventListener('click', showNewProjectModal);
  });
  
  // Botones de acción rápida
  const quickActionBtns = {
    'quickRegisterAdvance': 'Registrar Avance',
    'quickRegisterExpense': 'Registrar Gasto',
    'quickNewArticle': 'Nuevo Artículo',
    'quickExpoRegistration': 'Inscripción Exposición',
    'quickProfileUpdate': 'Actualizar Perfil',
    'quickHelp': 'Soporte Técnico'
  };
  
  Object.keys(quickActionBtns).forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function() {
        showQuickAction(quickActionBtns[id]);
      });
    }
  });
  
  // Menú activo
  const menuItems = document.querySelectorAll('.menu-item:not(.disabled):not(.logout)');
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (!this.href || this.href === '#') {
        e.preventDefault();
      }
      
      // Actualizar elemento activo
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      
      // Actualizar breadcrumb
      const pageName = this.querySelector('span').textContent;
      document.getElementById('currentPage').textContent = pageName;
      
      // Cerrar sidebar en móviles
      if (window.innerWidth < 992) {
        document.querySelector('.sidebar').classList.remove('active');
      }
    });
  });
  
  // Cerrar sesión
  const logoutBtns = document.querySelectorAll('.logout');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        // Limpiar datos de sesión
        localStorage.removeItem('user_data');
        // Redirigir a página de inicio de sesión
        window.location.href = '/login';
      }
    });
  });
  
  // Modal de nuevo proyecto
  const modalCloseBtns = document.querySelectorAll('.modal-close, #cancelProjectBtn');
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      document.getElementById('newProjectModal').classList.remove('active');
    });
  });
  
  // Guardar proyecto
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  if (saveProjectBtn) {
    saveProjectBtn.addEventListener('click', saveNewProject);
  }
  
  // Marcar todas las notificaciones como leídas
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('docenteTheme', isDark ? 'dark' : 'light');
  updateThemeIcon();
}

function updateThemeIcon() {
  const themeIcon = document.querySelector('#themeToggle i');
  if (themeIcon) {
    const isDark = document.body.classList.contains('dark-theme');
    themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }
}

function updateLastUpdate() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('lastAccess').textContent = timeString;
}

function showNewProjectModal() {
  const modal = document.getElementById('newProjectModal');
  modal.classList.add('active');
}

function saveNewProject() {
  const form = document.getElementById('newProjectForm');
  if (!form.checkValidity()) {
    alert('Por favor complete todos los campos requeridos.');
    return;
  }
  
  const projectData = {
    title: document.getElementById('projectTitle').value,
    line: document.getElementById('projectLine').value,
    duration: document.getElementById('projectDuration').value,
    description: document.getElementById('projectDescription').value,
    objectives: document.getElementById('projectObjectives').value,
    confidential: document.getElementById('projectConfidential').checked,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  // Simular guardado
  console.log('Proyecto guardado:', projectData);
  
  // Cerrar modal
  document.getElementById('newProjectModal').classList.remove('active');
  
  // Mostrar confirmación
  alert('Proyecto creado exitosamente. Será revisado por el comité correspondiente.');
  
  // Limpiar formulario
  form.reset();
  
  // Actualizar contador de proyectos
  const currentCount = parseInt(document.getElementById('myProjectsCount').textContent);
  document.getElementById('myProjectsCount').textContent = currentCount + 1;
  document.getElementById('pendingProjectsCount').textContent = parseInt(document.getElementById('pendingProjectsCount').textContent) + 1;
}

function showQuickAction(action) {
  switch(action) {
    case 'Registrar Avance':
      alert('Redirigiendo al formulario de registro de avances...');
      // window.location.href = '#registrar-avances';
      break;
    case 'Registrar Gasto':
      alert('Redirigiendo al formulario de registro de gastos...');
      // window.location.href = '#registrar-gasto';
      break;
    case 'Nuevo Artículo':
      alert('Redirigiendo al formulario de nuevo artículo...');
      // window.location.href = '#nuevo-articulo';
      break;
    case 'Inscripción Exposición':
      alert('Redirigiendo al formulario de inscripción...');
      // window.location.href = '#inscripcion-exposicion';
      break;
    case 'Actualizar Perfil':
      alert('Redirigiendo a la edición de perfil...');
      // window.location.href = '#perfil';
      break;
    case 'Soporte Técnico':
      alert('Para soporte técnico:\nEmail: soporte@iestp-aacd.edu.pe\nTeléfono: (01) 123-4567\nHorario: L-V 8:00-17:00');
      break;
  }
}

function toggleTask(checkbox) {
  checkbox.classList.toggle('checked');
  checkbox.innerHTML = checkbox.classList.contains('checked') ? '✓' : '';
  
  // Actualizar contador de tareas pendientes
  updateTaskCounters();
}

function updateTaskCounters() {
  const totalTasks = document.querySelectorAll('.task-checkbox:not(.checked)').length;
  console.log(`Tareas pendientes: ${totalTasks}`);
}

function markNotificationAsRead(id) {
  // Simular marcado como leído
  const notificationCount = parseInt(document.getElementById('notificationCount').textContent);
  const headerCount = parseInt(document.getElementById('headerNotificationCount').textContent);
  
  if (notificationCount > 0) {
    document.getElementById('notificationCount').textContent = notificationCount - 1;
    document.getElementById('headerNotificationCount').textContent = headerCount - 1;
  }
  
  // Eliminar notificación del DOM
  const notification = document.querySelector(`[data-notification-id="${id}"]`);
  if (notification) {
    notification.remove();
  }
}

function markAllNotificationsAsRead() {
  // Resetear contadores
  document.getElementById('notificationCount').textContent = '0';
  document.getElementById('headerNotificationCount').textContent = '0';
  
  // Eliminar todas las notificaciones (excepto la de bienvenida)
  const container = document.getElementById('notificationsContainer');
  if (container) {
    const welcomeNotification = container.querySelector('.notification-item:first-child');
    container.innerHTML = '';
    container.appendChild(welcomeNotification);
  }
  
  alert('Todas las notificaciones han sido marcadas como leídas.');
}

function viewProject(projectId) {
  alert(`Redirigiendo al proyecto ${projectId}...\n\nRecuerda que solo puedes ver y editar tus propios proyectos.\nNo tienes permisos para evaluar proyectos o modificar documentos ya evaluados.`);
  // window.location.href = `/proyecto/${projectId}`;
}

function simulateInitialData() {
  // Simular actualizaciones periódicas
  setInterval(() => {
    updateLastUpdate();
    
    // Simular nueva notificación ocasionalmente
    if (Math.random() > 0.8) {
      const currentCount = parseInt(document.getElementById('notificationCount').textContent);
      document.getElementById('notificationCount').textContent = currentCount + 1;
      document.getElementById('headerNotificationCount').textContent = currentCount + 1;
    }
  }, 60000); // Cada minuto
}

// Funciones globales para uso desde HTML
window.toggleTask = toggleTask;
window.markNotificationAsRead = markNotificationAsRead;
window.viewProject = viewProject;