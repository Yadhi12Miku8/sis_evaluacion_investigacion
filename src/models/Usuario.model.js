class Usuario {
  constructor({
    id,
    dni,
    nombres,
    apellidos,
    correo_institucional,
    telefono,
    programa_estudio_id,
    rol,
    estado,
    password,
    fecha_registro
  }) {
    this.id = id;
    this.dni = dni;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.correoInstitucional = correo_institucional;
    this.telefono = telefono;
    this.programaEstudioId = programa_estudio_id;
    this.rol = rol;
    this.estado = estado;
    this.password = password;
    this.fechaRegistro = fecha_registro;
  }

  get nombreCompleto() {
    return `${this.nombres} ${this.apellidos}`;
  }

  esActivo() {
    return this.estado === 'Activo';
  }

  getDashboardPath() {
    const dashboards = {
      'Docente Investigador': '/dashboard/docente',
      'Jefe de Unidad de Investigacion': '/dashboard/jefe-unidad',
      'Director General': '/dashboard/director',
      'Comite Editor': '/dashboard/comite-editor',
      'Administrador': '/dashboard/admin'
    };
    return dashboards[this.rol] || '/dashboard';
  }

  getRolNombre() {
    const nombres = {
      'Docente Investigador': 'Docente Investigador',
      'Jefe de Unidad de Investigacion': 'Jefe de Unidad',
      'Director General': 'Director General',
      'Comite Editor': 'Comité Editor',
      'Administrador': 'Administrador'
    };
    return nombres[this.rol] || this.rol;
  }
}

module.exports = Usuario;