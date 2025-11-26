-- =============================================
-- SISTEMA DE GESTIÓN DE INVESTIGACIÓN E INNOVACIÓN
-- I.E.S.T.P "ANDRÉS AVELINO CÁCERES DORREGARAY"
-- =============================================

-- Crear la base de datos
CREATE DATABASE gestion_investigacion;
\c gestion_investigacion;

-- =============================================
-- TABLAS PRINCIPALES
-- =============================================

-- Tabla de USUARIOS
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(8) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_institucional VARCHAR(150) UNIQUE NOT NULL,
    programa_estudios VARCHAR(100),
    especialidad VARCHAR(100),
    telefono VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_aprobacion TIMESTAMP,
    administrador_aprobador_id INTEGER,
    foto_perfil_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    CONSTRAINT chk_estado_usuario CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO'))
);

-- Tabla de ROLES_USUARIO
CREATE TABLE roles_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    rol VARCHAR(50) NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_rol_valido CHECK (rol IN ('DOCENTE_INVESTIGADOR', 'JEFE_INVESTIGACION', 'DIRECTOR_GENERAL', 'COMITE_EDITOR', 'ADMINISTRADOR'))
);

-- Tabla de PROYECTOS
CREATE TABLE proyectos (
    id SERIAL PRIMARY KEY,
    codigo_proyecto VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    tipo_investigacion VARCHAR(50) NOT NULL,
    linea_investigacion VARCHAR(200) NOT NULL,
    objetivo_general TEXT NOT NULL,
    beneficiarios_directos TEXT,
    beneficiarios_indirectos TEXT,
    localizacion_geografica VARCHAR(300),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'BORRADOR',
    docente_principal_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_principal_id) REFERENCES usuarios(id),
    CONSTRAINT chk_tipo_investigacion CHECK (tipo_investigacion IN ('APLICADA', 'INNOVACION_TECNOLOGICA', 'INNOVACION_PEDAGOGICA')),
    CONSTRAINT chk_estado_proyecto CHECK (estado IN ('BORRADOR', 'INFO_GENERAL_REGISTRADA', 'PERFIL_PRESENTADO', 'PERFIL_APROBADO', 'EN_EJECUCION', 'INFORME_PRESENTADO', 'PROYECTO_FINALIZADO', 'ARCHIVADO')),
    CONSTRAINT chk_fechas_validas CHECK (fecha_inicio < fecha_fin)
);

-- Tabla de PROYECTO_INTEGRANTES
CREATE TABLE proyecto_integrantes (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    docente_id INTEGER NOT NULL,
    rol_integrante VARCHAR(50) DEFAULT 'COINVESTIGADOR',
    fecha_incorporacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id),
    CONSTRAINT chk_rol_integrante CHECK (rol_integrante IN ('INVESTIGADOR_PRINCIPAL', 'COINVESTIGADOR')),
    UNIQUE(proyecto_id, docente_id)
);

-- =============================================
-- TABLAS DE PROCESO DE INVESTIGACIÓN
-- =============================================

-- Tabla de PERFILES_PROYECTO
CREATE TABLE perfiles_proyecto (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    tipo_plantilla VARCHAR(50) NOT NULL,
    datos_generales JSONB,
    problematica TEXT,
    marco_teorico TEXT,
    hipotesis TEXT,
    metodologia TEXT,
    cronograma JSONB,
    presupuesto JSONB,
    referencias TEXT,
    anexos JSONB,
    estado VARCHAR(30) DEFAULT 'BORRADOR',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_envio TIMESTAMP,
    fecha_evaluacion TIMESTAMP,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT chk_estado_perfil CHECK (estado IN ('BORRADOR', 'ENVIADO', 'EVALUADO', 'CORRECCION')),
    CONSTRAINT chk_tipo_plantilla CHECK (tipo_plantilla IN ('INVESTIGACION_APLICADA', 'INNOVACION_TECNOLOGICA', 'INNOVACION_PEDAGOGICA'))
);

-- Tabla de EVALUACIONES_PERFIL
CREATE TABLE evaluaciones_perfil (
    id SERIAL PRIMARY KEY,
    perfil_id INTEGER NOT NULL,
    evaluador_id INTEGER NOT NULL,
    tipo_tabla VARCHAR(10) NOT NULL,
    criterios_evaluados JSONB NOT NULL,
    puntaje_total INTEGER NOT NULL,
    calificacion VARCHAR(20) NOT NULL,
    resultado VARCHAR(20) NOT NULL,
    observaciones_generales TEXT,
    observaciones_especificas JSONB,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (perfil_id) REFERENCES perfiles_proyecto(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id) REFERENCES usuarios(id),
    CONSTRAINT chk_tipo_tabla CHECK (tipo_tabla IN ('ANEXO_01', 'ANEXO_02', 'ANEXO_03')),
    CONSTRAINT chk_calificacion CHECK (calificacion IN ('BUENO', 'REGULAR', 'MALO')),
    CONSTRAINT chk_resultado CHECK (resultado IN ('APROBADO', 'DESAPROBADO'))
);

-- Tabla de AVANCES_PERIODICOS
CREATE TABLE avances_periodicos (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    numero_avance INTEGER NOT NULL,
    fecha_limite DATE NOT NULL,
    contenido TEXT,
    evidencias JSONB,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_presentacion TIMESTAMP,
    fecha_evaluacion TIMESTAMP,
    docente_presentador_id INTEGER NOT NULL,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_presentador_id) REFERENCES usuarios(id),
    CONSTRAINT chk_estado_avance CHECK (estado IN ('PENDIENTE', 'PRESENTADO', 'EVALUADO', 'OBSERVADO')),
    CONSTRAINT chk_numero_avance CHECK (numero_avance BETWEEN 1 AND 6),
    UNIQUE(proyecto_id, numero_avance)
);

-- Tabla de OBSERVACIONES_AVANCE
CREATE TABLE observaciones_avance (
    id SERIAL PRIMARY KEY,
    avance_id INTEGER NOT NULL,
    evaluador_id INTEGER NOT NULL,
    observacion TEXT NOT NULL,
    fecha_observacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_resolucion TIMESTAMP,
    FOREIGN KEY (avance_id) REFERENCES avances_periodicos(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id) REFERENCES usuarios(id),
    CONSTRAINT chk_estado_observacion CHECK (estado IN ('PENDIENTE', 'RESUELTO', 'DESESTIMADO'))
);

-- =============================================
-- TABLAS DE INFORMES Y ARTÍCULOS
-- =============================================

-- Tabla de INFORMES_FINALES
CREATE TABLE informes_finales (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    contenido_principal TEXT,
    producto_desarrollado JSONB,
    compromiso_etico BOOLEAN DEFAULT false,
    declaracion_originalidad BOOLEAN DEFAULT false,
    anexos JSONB,
    estado VARCHAR(30) DEFAULT 'BORRADOR',
    fecha_presentacion TIMESTAMP,
    fecha_evaluacion TIMESTAMP,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT chk_estado_informe CHECK (estado IN ('BORRADOR', 'PRESENTADO', 'EVALUADO', 'CORRECCION'))
);

-- Tabla de EVALUACIONES_INFORME
CREATE TABLE evaluaciones_informe (
    id SERIAL PRIMARY KEY,
    informe_id INTEGER NOT NULL,
    evaluador_id INTEGER NOT NULL,
    tipo_tabla VARCHAR(10) NOT NULL,
    criterios_evaluados JSONB NOT NULL,
    puntaje_total INTEGER NOT NULL,
    calificacion VARCHAR(20) NOT NULL,
    resultado VARCHAR(20) NOT NULL,
    observaciones TEXT,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (informe_id) REFERENCES informes_finales(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluador_id) REFERENCES usuarios(id),
    CONSTRAINT chk_tipo_tabla_informe CHECK (tipo_tabla IN ('ANEXO_04', 'ANEXO_05', 'ANEXO_06')),
    CONSTRAINT chk_resultado_informe CHECK (resultado IN ('APROBADO', 'REQUIERE_CORRECCIONES'))
);

-- Tabla de ARTICULOS_CIENTIFICOS
CREATE TABLE articulos_cientificos (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    autores JSONB NOT NULL,
    resumen_es TEXT,
    resumen_en TEXT,
    palabras_clave JSONB,
    introduccion TEXT,
    metodologia TEXT,
    resultados TEXT,
    discusion TEXT,
    conclusiones TEXT,
    referencias TEXT,
    estado VARCHAR(30) DEFAULT 'BORRADOR',
    fecha_presentacion TIMESTAMP,
    fecha_publicacion TIMESTAMP,
    doi VARCHAR(100),
    version INTEGER DEFAULT 1,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT chk_estado_articulo CHECK (estado IN ('BORRADOR', 'PRESENTADO', 'EN_REVISION', 'APROBADO', 'PUBLICADO', 'CORRECCION'))
);

-- Tabla de REVISIONES_ARTICULO
CREATE TABLE revisiones_articulo (
    id SERIAL PRIMARY KEY,
    articulo_id INTEGER NOT NULL,
    revisor_id INTEGER NOT NULL,
    decision VARCHAR(30) NOT NULL,
    criterios_calidad JSONB,
    observaciones TEXT,
    justificacion TEXT,
    fecha_revision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (articulo_id) REFERENCES articulos_cientificos(id) ON DELETE CASCADE,
    FOREIGN KEY (revisor_id) REFERENCES usuarios(id),
    CONSTRAINT chk_decision CHECK (decision IN ('APROBADO', 'CORRECCIONES_MENORES', 'CORRECCIONES_MAYORES'))
);

-- =============================================
-- TABLAS DE RESOLUCIONES Y GESTIÓN ADMINISTRATIVA
-- =============================================

-- Tabla de RESOLUCIONES_DIRECTORALES
CREATE TABLE resoluciones_directorales (
    id SERIAL PRIMARY KEY,
    numero_rd VARCHAR(100) UNIQUE NOT NULL,
    proyecto_id INTEGER NOT NULL,
    tipo_rd VARCHAR(50) NOT NULL,
    contenido TEXT NOT NULL,
    director_general_id INTEGER NOT NULL,
    fecha_emision DATE NOT NULL,
    firma_digital VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'BORRADOR',
    archivo_url VARCHAR(500),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (director_general_id) REFERENCES usuarios(id),
    CONSTRAINT chk_tipo_rd CHECK (tipo_rd IN ('APROBACION', 'CULMINACION', 'FELICITACION')),
    CONSTRAINT chk_estado_rd CHECK (estado IN ('BORRADOR', 'EMITIDA', 'ANULADA'))
);

-- Tabla de SOLICITUDES_RD
CREATE TABLE solicitudes_rd (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    tipo_solicitud VARCHAR(50) NOT NULL,
    solicitante_id INTEGER NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_atencion TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id),
    CONSTRAINT chk_tipo_solicitud CHECK (tipo_solicitud IN ('APROBACION', 'CULMINACION')),
    CONSTRAINT chk_estado_solicitud CHECK (estado IN ('PENDIENTE', 'ATENDIDA', 'RECHAZADA'))
);

-- =============================================
-- TABLAS DE PRESUPUESTO Y FINANZAS
-- =============================================

-- Tabla de PRESUPUESTOS_PROYECTO
CREATE TABLE presupuestos_proyecto (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    presupuesto_total DECIMAL(12,2) NOT NULL,
    fuente_financiamiento VARCHAR(100),
    moneda VARCHAR(10) DEFAULT 'PEN',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT chk_presupuesto_positivo CHECK (presupuesto_total >= 0)
);

-- Tabla de RUBROS_PRESUPUESTO
CREATE TABLE rubros_presupuesto (
    id SERIAL PRIMARY KEY,
    presupuesto_id INTEGER NOT NULL,
    nombre_rubro VARCHAR(200) NOT NULL,
    tipo_costo VARCHAR(20) NOT NULL,
    monto_presupuestado DECIMAL(12,2) NOT NULL,
    monto_ejecutado DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (presupuesto_id) REFERENCES presupuestos_proyecto(id) ON DELETE CASCADE,
    CONSTRAINT chk_tipo_costo CHECK (tipo_costo IN ('DIRECTO', 'INDIRECTO')),
    CONSTRAINT chk_montos_positivos CHECK (monto_presupuestado >= 0 AND monto_ejecutado >= 0)
);

-- Tabla de GASTOS_PROYECTO
CREATE TABLE gastos_proyecto (
    id SERIAL PRIMARY KEY,
    proyecto_id INTEGER NOT NULL,
    rubro_id INTEGER NOT NULL,
    fecha_gasto DATE NOT NULL,
    concepto VARCHAR(300) NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    tipo_comprobante VARCHAR(50),
    numero_comprobante VARCHAR(100),
    proveedor VARCHAR(200),
    comprobante_url VARCHAR(500),
    registrado_por INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'REGISTRADO',
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (rubro_id) REFERENCES rubros_presupuesto(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
    CONSTRAINT chk_monto_gasto_positivo CHECK (monto > 0),
    CONSTRAINT chk_estado_gasto CHECK (estado IN ('REGISTRADO', 'VALIDADO', 'RECHAZADO'))
);

-- =============================================
-- TABLAS DE EXPOSICIONES Y EVENTOS
-- =============================================

-- Tabla de EXPOSICIONES_ANUALES
CREATE TABLE exposiciones_anuales (
    id SERIAL PRIMARY KEY,
    año INTEGER NOT NULL,
    nombre_evento VARCHAR(200) NOT NULL,
    fecha_evento DATE,
    lugar VARCHAR(200),
    estado VARCHAR(20) DEFAULT 'PLANIFICADA',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_estado_exposicion CHECK (estado IN ('PLANIFICADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA')),
    UNIQUE(año)
);

-- Tabla de INSCRIPCIONES_EXPOSICION
CREATE TABLE inscripciones_exposicion (
    id SERIAL PRIMARY KEY,
    exposicion_id INTEGER NOT NULL,
    proyecto_id INTEGER NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    titulo_presentacion VARCHAR(500),
    resumen_ejecutivo TEXT,
    requerimientos_tecnicos TEXT,
    estado VARCHAR(20) DEFAULT 'INSCRITO',
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exposicion_id) REFERENCES exposiciones_anuales(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    CONSTRAINT chk_categoria CHECK (categoria IN ('INVESTIGACION_APLICADA', 'INNOVACION_TECNOLOGICA', 'INNOVACION_PEDAGOGICA')),
    CONSTRAINT chk_estado_inscripcion CHECK (estado IN ('INSCRITO', 'CONFIRMADO', 'PARTICIPANDO', 'FINALIZADO', 'GANADOR', 'DESCALIFICADO')),
    UNIQUE(exposicion_id, proyecto_id)
);

-- Tabla de CALIFICACIONES_EXPOSICION
CREATE TABLE calificaciones_exposicion (
    id SERIAL PRIMARY KEY,
    inscripcion_id INTEGER NOT NULL,
    jurado_id INTEGER NOT NULL,
    criterios_calificacion JSONB NOT NULL,
    puntaje_total DECIMAL(5,2) NOT NULL,
    observaciones TEXT,
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones_exposicion(id) ON DELETE CASCADE,
    FOREIGN KEY (jurado_id) REFERENCES usuarios(id),
    CONSTRAINT chk_puntaje_total CHECK (puntaje_total >= 0 AND puntaje_total <= 100)
);

-- =============================================
-- TABLAS DE NOTIFICACIONES Y AUDITORÍA
-- =============================================

-- Tabla de NOTIFICACIONES
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_destino_id INTEGER NOT NULL,
    tipo_notificacion VARCHAR(100) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    enlace_accion VARCHAR(500),
    leida BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP,
    fecha_envio_correo TIMESTAMP,
    estado_envio_correo VARCHAR(20) DEFAULT 'PENDIENTE',
    FOREIGN KEY (usuario_destino_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT chk_estado_envio CHECK (estado_envio_correo IN ('PENDIENTE', 'ENVIADO', 'ERROR'))
);

-- Tabla de AUDITORIA_SISTEMA
CREATE TABLE auditoria_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =============================================
-- TABLAS CATÁLOGO
-- =============================================

-- Tabla de CATALOGOS
CREATE TABLE catalogos (
    id SERIAL PRIMARY KEY,
    tipo_catalogo VARCHAR(100) NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    valor VARCHAR(200) NOT NULL,
    descripcion TEXT,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tipo_catalogo, codigo)
);

-- =============================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =============================================

-- Índices para la tabla USUARIOS
CREATE INDEX idx_usuarios_correo ON usuarios(correo_institucional);
CREATE INDEX idx_usuarios_dni ON usuarios(dni);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);
CREATE INDEX idx_usuarios_programa ON usuarios(programa_estudios);

-- Índices para la tabla ROLES_USUARIO
CREATE INDEX idx_roles_usuario_id ON roles_usuario(usuario_id);
CREATE INDEX idx_roles_activo ON roles_usuario(activo);

-- Índices para la tabla PROYECTOS
CREATE INDEX idx_proyectos_codigo ON proyectos(codigo_proyecto);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_proyectos_docente ON proyectos(docente_principal_id);
CREATE INDEX idx_proyectos_tipo ON proyectos(tipo_investigacion);
CREATE INDEX idx_proyectos_fecha_inicio ON proyectos(fecha_inicio);

-- Índices para la tabla PROYECTO_INTEGRANTES
CREATE INDEX idx_integrantes_proyecto ON proyecto_integrantes(proyecto_id);
CREATE INDEX idx_integrantes_docente ON proyecto_integrantes(docente_id);

-- Índices para la tabla PERFILES_PROYECTO
CREATE INDEX idx_perfiles_proyecto ON perfiles_proyecto(proyecto_id);
CREATE INDEX idx_perfiles_estado ON perfiles_proyecto(estado);

-- Índices para la tabla AVANCES_PERIODICOS
CREATE INDEX idx_avances_proyecto ON avances_periodicos(proyecto_id);
CREATE INDEX idx_avances_fecha_limite ON avances_periodicos(fecha_limite);
CREATE INDEX idx_avances_estado ON avances_periodicos(estado);

-- Índices para la tabla INFORMES_FINALES
CREATE INDEX idx_informes_proyecto ON informes_finales(proyecto_id);

-- Índices para la tabla ARTICULOS_CIENTIFICOS
CREATE INDEX idx_articulos_proyecto ON articulos_cientificos(proyecto_id);
CREATE INDEX idx_articulos_estado ON articulos_cientificos(estado);

-- Índices para la tabla RESOLUCIONES_DIRECTORALES
CREATE INDEX idx_rd_proyecto ON resoluciones_directorales(proyecto_id);
CREATE INDEX idx_rd_tipo ON resoluciones_directorales(tipo_rd);
CREATE INDEX idx_rd_numero ON resoluciones_directorales(numero_rd);

-- Índices para la tabla NOTIFICACIONES
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_destino_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha ON notificaciones(fecha_creacion);

-- Índices para la tabla AUDITORIA_SISTEMA
CREATE INDEX idx_auditoria_usuario ON auditoria_sistema(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_sistema(fecha_accion);
CREATE INDEX idx_auditoria_modulo ON auditoria_sistema(modulo);

-- Índices para la tabla GASTOS_PROYECTO
CREATE INDEX idx_gastos_proyecto ON gastos_proyecto(proyecto_id);
CREATE INDEX idx_gastos_fecha ON gastos_proyecto(fecha_gasto);

-- =============================================
-- DATOS INICIALES (CATÁLOGOS)
-- =============================================

-- Insertar tipos de investigación
INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, orden) VALUES
('TIPO_INVESTIGACION', 'APLICADA', 'Investigación Aplicada', 'Aplicación de conocimiento tecnológico o pedagógico para desarrollo de productos, servicios y/o procesos', 1),
('TIPO_INVESTIGACION', 'INNOVACION_TECNOLOGICA', 'Innovación Tecnológica', 'Introducir nuevos productos o servicios en el mercado', 2),
('TIPO_INVESTIGACION', 'INNOVACION_PEDAGOGICA', 'Innovación Pedagógica-Institucional', 'Innovaciones relacionadas con la gestión pedagógica e institucional', 3);

-- Insertar estados de proyecto
INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, orden) VALUES
('ESTADO_PROYECTO', 'BORRADOR', 'Borrador', 'Proyecto en fase de edición', 1),
('ESTADO_PROYECTO', 'INFO_GENERAL_REGISTRADA', 'Información General Registrada', 'Información básica del proyecto registrada', 2),
('ESTADO_PROYECTO', 'PERFIL_PRESENTADO', 'Perfil Presentado', 'Perfil del proyecto enviado para evaluación', 3),
('ESTADO_PROYECTO', 'PERFIL_APROBADO', 'Perfil Aprobado', 'Perfil del proyecto aprobado', 4),
('ESTADO_PROYECTO', 'EN_EJECUCION', 'En Ejecución', 'Proyecto en fase de ejecución', 5),
('ESTADO_PROYECTO', 'INFORME_PRESENTADO', 'Informe Final Presentado', 'Informe final presentado para evaluación', 6),
('ESTADO_PROYECTO', 'PROYECTO_FINALIZADO', 'Proyecto Finalizado', 'Proyecto completado y aprobado', 7);

-- Insertar roles del sistema
INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, orden) VALUES
('ROL_USUARIO', 'DOCENTE_INVESTIGADOR', 'Docente Investigador', 'Puede crear y gestionar proyectos de investigación', 1),
('ROL_USUARIO', 'JEFE_INVESTIGACION', 'Jefe de Unidad de Investigación', 'Puede evaluar proyectos y supervisar avances', 2),
('ROL_USUARIO', 'DIRECTOR_GENERAL', 'Director General', 'Puede emitir resoluciones directorales', 3),
('ROL_USUARIO', 'COMITE_EDITOR', 'Comité Editor', 'Puede revisar y aprobar artículos científicos', 4),
('ROL_USUARIO', 'ADMINISTRADOR', 'Administrador del Sistema', 'Gestiona usuarios y configuración del sistema', 5);

-- Insertar programas de estudios (ejemplo)
INSERT INTO catalogos (tipo_catalogo, codigo, valor, descripcion, orden) VALUES
('PROGRAMA_ESTUDIOS', 'DS', 'Desarrollo de Sistemas', 'Programa de Desarrollo de Sistemas de Información', 1),
('PROGRAMA_ESTUDIOS', 'ADM', 'Administración', 'Programa de Administración de Empresas', 2),
('PROGRAMA_ESTUDIOS', 'CONTA', 'Contabilidad', 'Programa de Contabilidad', 3);

-- =============================================
-- VISTAS ÚTILES
-- =============================================

-- Vista para dashboard del Jefe de Investigación
CREATE VIEW vista_dashboard_jefe AS
SELECT 
    p.estado,
    p.tipo_investigacion,
    COUNT(*) as cantidad,
    AVG(CASE WHEN ep.puntaje_total IS NOT NULL THEN ep.puntaje_total END) as promedio_puntaje
FROM proyectos p
LEFT JOIN perfiles_proyecto pp ON p.id = pp.proyecto_id
LEFT JOIN evaluaciones_perfil ep ON pp.id = ep.perfil_id
GROUP BY p.estado, p.tipo_investigacion;

-- Vista para reporte de avances
CREATE VIEW vista_avances_proyectos AS
SELECT 
    p.codigo_proyecto,
    p.titulo,
    p.estado,
    COUNT(ap.id) as avances_presentados,
    COUNT(ap.id) FILTER (WHERE ap.estado = 'PENDIENTE') as avances_pendientes,
    MAX(ap.fecha_limite) as proxima_fecha_limite
FROM proyectos p
LEFT JOIN avances_periodicos ap ON p.id = ap.proyecto_id
GROUP BY p.id, p.codigo_proyecto, p.titulo, p.estado;

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar fecha de actualización
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha en proyectos
CREATE TRIGGER trigger_actualizar_proyecto
    BEFORE UPDATE ON proyectos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Función para generar código de proyecto automáticamente
CREATE OR REPLACE FUNCTION generar_codigo_proyecto()
RETURNS TRIGGER AS $$
DECLARE
    año INTEGER;
    consecutivo INTEGER;
    codigo VARCHAR(20);
BEGIN
    año := EXTRACT(YEAR FROM CURRENT_DATE);
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo_proyecto FROM 'PROY-(\d+)-') AS INTEGER)), 0) + 1
    INTO consecutivo
    FROM proyectos
    WHERE codigo_proyecto LIKE 'PROY-' || año || '-%';
    
    codigo := 'PROY-' || año || '-' || LPAD(consecutivo::TEXT, 3, '0');
    NEW.codigo_proyecto := codigo;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código de proyecto
CREATE TRIGGER trigger_generar_codigo_proyecto
    BEFORE INSERT ON proyectos
    FOR EACH ROW
    WHEN (NEW.codigo_proyecto IS NULL)
    EXECUTE FUNCTION generar_codigo_proyecto();

-- =============================================
-- COMENTARIOS EN TABLAS
-- =============================================

COMMENT ON TABLE usuarios IS 'Tabla maestra de usuarios del sistema de investigación';
COMMENT ON TABLE proyectos IS 'Tabla principal de proyectos de investigación e innovación';
COMMENT ON TABLE perfiles_proyecto IS 'Perfiles detallados de proyectos según tipo de investigación';
COMMENT ON TABLE avances_periodicos IS 'Registro de avances mensuales de proyectos en ejecución';
COMMENT ON TABLE informes_finales IS 'Informes finales de proyectos completados';
COMMENT ON TABLE articulos_cientificos IS 'Artículos científicos derivados de proyectos de investigación';
COMMENT ON TABLE resoluciones_directorales IS 'Resoluciones directorales emitidas para proyectos';

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

-- Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE 'Base de datos creada exitosamente con todas las tablas, índices y datos iniciales.';
    RAISE NOTICE 'Total de tablas creadas: 22';
    RAISE NOTICE 'Total de índices creados: 25';
    RAISE NOTICE 'Total de registros en catálogos: %', (SELECT COUNT(*) FROM catalogos);
END $$;