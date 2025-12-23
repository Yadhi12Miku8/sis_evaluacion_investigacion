-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 15:59:51
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_investigacion_innovacion`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `articulos_cientificos`
--

CREATE TABLE `articulos_cientificos` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) DEFAULT NULL,
  `titulo` varchar(300) DEFAULT NULL,
  `autores` text DEFAULT NULL,
  `resumen_es` text DEFAULT NULL,
  `resumen_en` text DEFAULT NULL,
  `palabras_clave` text DEFAULT NULL,
  `archivo_pdf` varchar(500) DEFAULT NULL,
  `estado` enum('En revision','Aprobado','Publicado') DEFAULT 'En revision',
  `fecha_presentacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_publicacion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos_proyecto`
--

CREATE TABLE `documentos_proyecto` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) DEFAULT NULL,
  `tipo_documento` enum('Informacion General','Perfil','Avance 2','Avance 3','Avance 4','Avance 5','Avance 6','Informe Final','Articulo Cientifico','Compromiso Etico','Otro') NOT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `ruta_archivo` varchar(500) DEFAULT NULL,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp(),
  `subido_por` int(11) DEFAULT NULL,
  `estado` enum('En revision','Aprobado','Rechazado') DEFAULT 'En revision'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evaluaciones`
--

CREATE TABLE `evaluaciones` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) DEFAULT NULL,
  `evaluador_id` int(11) DEFAULT NULL,
  `tipo` enum('Perfil','Informe Final','Articulo Cientifico') NOT NULL,
  `tabla_evaluacion` varchar(50) DEFAULT NULL,
  `puntaje_total` int(11) DEFAULT NULL,
  `condicion` enum('Aprobado','Regular','Desaprobado') DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_evaluacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `exposiciones`
--

CREATE TABLE `exposiciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `lugar` varchar(300) DEFAULT NULL,
  `estado` enum('Activa','Finalizada') DEFAULT 'Activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos`
--

CREATE TABLE `gastos` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) DEFAULT NULL,
  `concepto` varchar(255) DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `comprobante` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones_exposicion`
--

CREATE TABLE `inscripciones_exposicion` (
  `id` int(11) NOT NULL,
  `exposicion_id` int(11) DEFAULT NULL,
  `proyecto_id` int(11) DEFAULT NULL,
  `fecha_inscripcion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `integrantes_proyecto`
--

CREATE TABLE `integrantes_proyecto` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `rol` enum('Investigador Principal','Co-investigador') DEFAULT 'Co-investigador',
  `fecha_incorporacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `integrantes_proyecto`
--

INSERT INTO `integrantes_proyecto` (`id`, `proyecto_id`, `usuario_id`, `rol`, `fecha_incorporacion`) VALUES
(1, 1, 100, 'Investigador Principal', '2025-12-02 15:32:58'),
(2, 1, 200, 'Co-investigador', '2025-12-02 15:32:58'),
(3, 1, 201, 'Co-investigador', '2025-12-02 15:32:58'),
(4, 1, 202, 'Co-investigador', '2025-12-02 15:32:58'),
(5, 2, 101, 'Investigador Principal', '2025-12-02 15:32:58'),
(6, 3, 102, 'Investigador Principal', '2025-12-02 15:32:58'),
(7, 3, 203, 'Co-investigador', '2025-12-02 15:32:58'),
(8, 4, 103, 'Investigador Principal', '2025-12-02 15:32:58'),
(9, 5, 104, 'Co-investigador', '2025-12-02 15:32:59'),
(10, 5, 204, 'Investigador Principal', '2025-12-02 15:32:59'),
(11, 6, 105, 'Investigador Principal', '2025-12-02 15:32:59'),
(12, 7, 106, 'Co-investigador', '2025-12-02 15:32:59'),
(13, 7, 205, 'Investigador Principal', '2025-12-02 15:32:59'),
(14, 8, 107, 'Investigador Principal', '2025-12-02 15:32:59'),
(15, 9, 108, 'Investigador Principal', '2025-12-02 15:32:59'),
(16, 9, 206, 'Co-investigador', '2025-12-02 15:32:59'),
(17, 9, 207, 'Co-investigador', '2025-12-02 15:32:59'),
(18, 10, 109, 'Co-investigador', '2025-12-02 15:32:59'),
(19, 10, 208, 'Investigador Principal', '2025-12-02 15:32:59'),
(20, 11, 110, 'Investigador Principal', '2025-12-02 15:32:59'),
(21, 12, 111, 'Co-investigador', '2025-12-02 15:32:59'),
(22, 12, 209, 'Investigador Principal', '2025-12-02 15:32:59'),
(23, 12, 210, 'Co-investigador', '2025-12-02 15:32:59'),
(24, 13, 112, 'Co-investigador', '2025-12-02 15:32:59'),
(25, 13, 211, 'Investigador Principal', '2025-12-02 15:32:59'),
(26, 13, 212, 'Co-investigador', '2025-12-02 15:32:59'),
(27, 13, 213, 'Co-investigador', '2025-12-02 15:32:59'),
(28, 14, 113, 'Co-investigador', '2025-12-02 15:32:59'),
(29, 14, 214, 'Investigador Principal', '2025-12-02 15:32:59'),
(30, 14, 215, 'Co-investigador', '2025-12-02 15:32:59'),
(31, 15, 114, 'Investigador Principal', '2025-12-02 15:32:59'),
(32, 16, 115, 'Co-investigador', '2025-12-02 15:32:59'),
(33, 16, 216, 'Investigador Principal', '2025-12-02 15:32:59'),
(34, 17, 116, 'Co-investigador', '2025-12-02 15:32:59'),
(35, 17, 217, 'Investigador Principal', '2025-12-02 15:32:59'),
(36, 17, 218, 'Co-investigador', '2025-12-02 15:32:59'),
(37, 18, 117, 'Co-investigador', '2025-12-02 15:32:59'),
(38, 18, 219, 'Investigador Principal', '2025-12-02 15:32:59'),
(39, 19, 118, 'Co-investigador', '2025-12-02 15:32:59'),
(40, 19, 220, 'Investigador Principal', '2025-12-02 15:32:59'),
(41, 20, 119, 'Co-investigador', '2025-12-02 15:32:59'),
(42, 20, 221, 'Investigador Principal', '2025-12-02 15:32:59'),
(43, 21, 120, 'Co-investigador', '2025-12-02 15:32:59'),
(44, 21, 222, 'Investigador Principal', '2025-12-02 15:32:59'),
(45, 22, 121, 'Investigador Principal', '2025-12-02 15:32:59'),
(46, 22, 223, 'Co-investigador', '2025-12-02 15:32:59'),
(47, 23, 122, 'Investigador Principal', '2025-12-02 15:32:59'),
(48, 24, 123, 'Co-investigador', '2025-12-02 15:32:59'),
(49, 24, 224, 'Investigador Principal', '2025-12-02 15:32:59'),
(50, 25, 124, 'Investigador Principal', '2025-12-02 15:32:59'),
(51, 25, 225, 'Co-investigador', '2025-12-02 15:32:59'),
(52, 26, 125, 'Investigador Principal', '2025-12-02 15:32:59'),
(53, 26, 226, 'Co-investigador', '2025-12-02 15:32:59'),
(54, 26, 227, 'Co-investigador', '2025-12-02 15:32:59'),
(55, 26, 228, 'Co-investigador', '2025-12-02 15:32:59'),
(56, 27, 126, 'Investigador Principal', '2025-12-02 15:32:59'),
(57, 27, 229, 'Co-investigador', '2025-12-02 15:32:59'),
(58, 27, 230, 'Co-investigador', '2025-12-02 15:32:59'),
(59, 28, 127, 'Investigador Principal', '2025-12-02 15:32:59'),
(60, 28, 231, 'Co-investigador', '2025-12-02 15:32:59'),
(61, 29, 128, 'Investigador Principal', '2025-12-02 15:32:59'),
(62, 29, 232, 'Co-investigador', '2025-12-02 15:32:59'),
(63, 29, 233, 'Co-investigador', '2025-12-02 15:32:59'),
(64, 30, 129, 'Co-investigador', '2025-12-02 15:33:00'),
(65, 30, 234, 'Investigador Principal', '2025-12-02 15:33:00'),
(66, 30, 235, 'Co-investigador', '2025-12-02 15:33:00'),
(67, 31, 130, 'Co-investigador', '2025-12-02 15:33:00'),
(68, 31, 236, 'Investigador Principal', '2025-12-02 15:33:00'),
(69, 33, 131, 'Investigador Principal', '2025-12-02 15:33:00'),
(70, 34, 132, 'Investigador Principal', '2025-12-02 15:33:00'),
(71, 34, 237, 'Co-investigador', '2025-12-02 15:33:00'),
(72, 35, 133, 'Co-investigador', '2025-12-02 15:33:00'),
(73, 35, 238, 'Investigador Principal', '2025-12-02 15:33:00'),
(74, 35, 239, 'Co-investigador', '2025-12-02 15:33:00'),
(75, 36, 134, 'Investigador Principal', '2025-12-02 15:33:00'),
(76, 37, 135, 'Investigador Principal', '2025-12-02 15:33:00'),
(77, 38, 136, 'Investigador Principal', '2025-12-02 15:33:00'),
(78, 38, 240, 'Co-investigador', '2025-12-02 15:33:00'),
(79, 39, 137, 'Investigador Principal', '2025-12-02 15:33:00'),
(80, 39, 241, 'Co-investigador', '2025-12-02 15:33:00'),
(81, 40, 138, 'Investigador Principal', '2025-12-02 15:33:00'),
(82, 41, 139, 'Investigador Principal', '2025-12-02 15:33:00'),
(83, 41, 242, 'Co-investigador', '2025-12-02 15:33:00'),
(84, 41, 243, 'Co-investigador', '2025-12-02 15:33:00'),
(85, 42, 140, 'Co-investigador', '2025-12-02 15:33:00'),
(86, 42, 244, 'Investigador Principal', '2025-12-02 15:33:00'),
(87, 42, 245, 'Co-investigador', '2025-12-02 15:33:00'),
(88, 42, 246, 'Co-investigador', '2025-12-02 15:33:00'),
(89, 43, 141, 'Co-investigador', '2025-12-02 15:33:00'),
(90, 43, 247, 'Investigador Principal', '2025-12-02 15:33:00'),
(91, 44, 142, 'Co-investigador', '2025-12-02 15:33:00'),
(92, 44, 248, 'Investigador Principal', '2025-12-02 15:33:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lineas_investigacion`
--

CREATE TABLE `lineas_investigacion` (
  `id` int(11) NOT NULL,
  `programa_estudio_id` int(11) DEFAULT NULL,
  `nombre` varchar(200) NOT NULL,
  `es_otra_linea` tinyint(1) DEFAULT 0,
  `otra_linea_investigacion` varchar(200) DEFAULT NULL,
  `estado` enum('Activa','Inactiva') DEFAULT 'Activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lineas_investigacion`
--

INSERT INTO `lineas_investigacion` (`id`, `programa_estudio_id`, `nombre`, `es_otra_linea`, `otra_linea_investigacion`, `estado`) VALUES
(1, 10, 'Gestión Pedagógica e institucional', 0, NULL, 'Activa'),
(2, 12, 'Gestión de recursos humanos y financiera', 0, NULL, 'Activa'),
(3, 3, 'Sistema de Control de Procesos, Redes y Comunicaciones Industriales', 0, NULL, 'Activa'),
(4, 11, 'Sistemas de Automatización y Potencia', 0, NULL, 'Activa'),
(5, 10, 'Gestión Pedagógica (EMPLEABILIDAD)', 0, NULL, 'Activa'),
(6, 1, 'Mantenimiento de los sistemas eléctricos y electrónicos automotrices', 0, NULL, 'Activa'),
(7, 6, 'Procesos de mecanizado y matricería', 0, NULL, 'Activa'),
(8, 3, 'IV modulo', 1, 'IV modulo', 'Activa'),
(9, 2, 'Módulo Asistencia Administrativa', 0, NULL, 'Activa'),
(10, 4, 'Integración de aplicaciones web y móviles', 0, NULL, 'Activa'),
(11, 8, 'Modulo I Programa de Estudios Electricidad Industrial U.D. Circuitos Eléctricos', 0, NULL, 'Activa'),
(12, 5, 'Procesamiento de Minerales', 0, NULL, 'Activa'),
(13, 8, 'MÓDULO II: Suministro y mantenimiento eléctrico de edificaciones y máquinas eléctricas', 0, NULL, 'Activa'),
(14, 10, 'Aplicada', 1, 'Aplicada', 'Activa'),
(15, 4, 'Integración de aplicaciones web y móviles', 0, NULL, 'Activa'),
(16, 6, 'Procesos de Mecanizado de Piezas y Matricería', 0, NULL, 'Activa'),
(17, 2, 'III Módulo', 0, NULL, 'Activa'),
(18, 10, 'Gestión institucional', 0, NULL, 'Activa'),
(19, 1, 'Mecatrónica Automotriz : Mantenimiento y Reparación del Motor de Combustión Interna', 0, NULL, 'Activa'),
(20, 4, 'Diseño y Programación web', 0, NULL, 'Activa'),
(21, 1, 'MANTENIMIENTO DE LOS SISTEMAS DE SUSPENSION, DIRECCION Y FRENOS AUTOMOTRICES', 0, NULL, 'Activa'),
(22, 3, 'Instalación, operación y mantenimiento de sistemas eléctricos y electrónicos', 0, NULL, 'Activa'),
(23, 3, 'Instalación y Mantenimiento de Sistemas Eléctricos y Electrónicos', 0, NULL, 'Activa'),
(24, 4, 'Planes de estudio: Integración de aplicaciones web y móviles', 0, NULL, 'Activa'),
(25, 1, 'Mantenimiento de los Motores de Combustión Interna con Gestión Electrónica', 0, NULL, 'Activa'),
(26, 9, 'Modulo III – \"Análisis químico en procesos Industriales\"', 0, NULL, 'Activa'),
(27, 5, 'Procesamiento de minerales', 0, NULL, 'Activa'),
(28, 10, 'Investigación de innovación Pedagógica', 0, NULL, 'Activa'),
(29, 8, 'Sistemas De Suministro De Energía Eléctrica y mantenimiento de transformadores. MODULO II', 0, NULL, 'Activa'),
(30, 9, 'Módulo II: TOMA DE MUESTRAS PARA LOS PROCESOS ANALÍTICOS', 0, NULL, 'Activa'),
(31, 10, 'Gestión institucional', 0, NULL, 'Activa'),
(32, 5, 'PROCESAMIENTO DE MINERALES', 0, NULL, 'Activa'),
(33, 11, 'Sistemas de Potencia y Automatización', 0, NULL, 'Activa'),
(34, 4, 'Desarrollo de Aplicaciones', 0, NULL, 'Activa'),
(35, 8, 'INSTALACION Y MANTENIMIENTO DE SISTEMAS ELECTRICOS', 0, NULL, 'Activa'),
(36, 6, 'fabricación y automatización industrial', 0, NULL, 'Activa'),
(37, 6, 'Diseño Mecánico', 0, NULL, 'Activa'),
(38, 2, 'Oportunidades y planes de negocio TAQ', 0, NULL, 'Activa'),
(39, 9, 'TECNOLOGIA DE ANALISIS QUIMICO', 0, NULL, 'Activa'),
(40, 7, 'Mantenimiento Productivo Total de Maquinaria Pesada', 0, NULL, 'Activa'),
(41, 7, 'Mantenimiento Productivo Total de Maquinaria Pesada', 0, NULL, 'Activa'),
(42, 2, 'Asistencia Administrativa', 0, NULL, 'Activa'),
(43, 9, 'Análisis Químico en Procesos Industriales', 0, NULL, 'Activa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `titulo` varchar(200) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `tipo` enum('Alerta','Recordatorio','Sistema','Evaluacion') DEFAULT 'Sistema',
  `leido` tinyint(1) DEFAULT 0,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `presupuestos`
--

CREATE TABLE `presupuestos` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) DEFAULT NULL,
  `monto_total` decimal(10,2) DEFAULT NULL,
  `fuente_financiamiento` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas_estudio`
--

CREATE TABLE `programas_estudio` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programas_estudio`
--

INSERT INTO `programas_estudio` (`id`, `nombre`, `estado`) VALUES
(1, 'Mecatrónica Automotriz', 'Activo'),
(2, 'Asistencia Administrativa', 'Activo'),
(3, 'Electrónica Industrial', 'Activo'),
(4, 'Diseño y Programación Web', 'Activo'),
(5, 'Metalurgia', 'Activo'),
(6, 'Mecánica de Producción Industrial', 'Activo'),
(7, 'Mantenimiento de Maquinaria Pesada', 'Activo'),
(8, 'Electricidad Industrial', 'Activo'),
(9, 'Tecnología de Análisis Químico', 'Activo'),
(10, 'Gestión Pedagógica', 'Activo'),
(11, 'Sistemas de Automatización', 'Activo'),
(12, 'Gestión de Recursos Humanos', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

CREATE TABLE `proyectos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `titulo` varchar(300) NOT NULL,
  `tipo` enum('Investigacion Aplicada','Innovacion Tecnologica','Innovacion Pedagogica') NOT NULL,
  `linea_investigacion_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `objetivo_general` text DEFAULT NULL,
  `beneficiarios` text DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('Registrado','Perfil Presentado','Perfil Aprobado','En Ejecucion','Informe Final Presentado','Finalizado Aprobado') DEFAULT 'Registrado',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyectos`
--

INSERT INTO `proyectos` (`id`, `codigo`, `titulo`, `tipo`, `linea_investigacion_id`, `usuario_id`, `objetivo_general`, `beneficiarios`, `fecha_inicio`, `fecha_fin`, `estado`, `fecha_registro`) VALUES
(1, 'PROY-2025-001', 'SISTEMA DE CABLEADO ESTRUCTURADO PARA LA ENSEÑANZA DE TIC EN EL IESTP \"ANDRÉS AVELINO CÁCERES DORREGARAY\"', 'Investigacion Aplicada', 1, 100, 'Desarrollar e implementar un sistema de cableado estructurado para la enseñanza de TIC en los programas de estudios de Mecatrónica Automotriz, Metalurgia, Electricidad Industrial, Mantenimiento de Maquinaria Pesada y Mecánica de Producción Industrial del IESTP \"Andrés Avelino Cáceres Dorregaray\" de San Agustín de Cajas.', 'Directos: estudiantes del I-II semestre de los programas de estudios de Mecatrónica Automotriz, Electricidad Industrial, Metalurgia, Mantenimiento de Maquinaria Pesada y Mecánica de Producción Industrial. Indirectos: los estudiantes y docentes de otros programas de estudios del IESTP', '2025-05-02', '2025-12-26', 'En Ejecucion', '2025-12-02 15:32:58'),
(2, 'PROY-2025-002', 'Habilidades blandas y rendimiento académico en estudiantes del Programa de estudios de Asistencia Administrativa del IESTP \"Andrés A. Cáceres Dorregaray\"', 'Investigacion Aplicada', 2, 101, 'Determinar la relación entre las habilidades blandas y el rendimiento académico en estudiantes del Programa de estudios de Asistencia Administrativa del IESTP \"Andrés A. Cáceres Dorregaray\"', 'Estudiantes y docentes del Programa de estudios de Asistencia Administrativa del IESTP \"Andrés A. Cáceres Dorregaray\", asimismo empresas e instituciones donde laborarán nuestros egresados.', '2025-05-01', '2025-12-26', 'En Ejecucion', '2025-12-02 15:32:58'),
(3, 'PROY-2025-003', 'Propuesta de Diseño de Restructuración de la Red de Datos con Cableado Estructurado y Optimización de los equipos del Aula', 'Investigacion Aplicada', 3, 102, 'Desarrollar una propuesta de diseño de restructuración de la red de datos con cableado estructurado y la optimización de los equipos, en el Aula 08 del Programa de Estudio de \"Electrónica Industrial\"', 'Docentes y estudiantes del programa de estudio de Electrónica Industrial de la institución', '2025-05-12', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(4, 'PROY-2025-004', 'El GRAFCET aplicado a la programación de microcontroladores con Micropython. Guía didáctica con problemas resueltos', 'Innovacion Pedagogica', 4, 103, 'Desarrollar una guía que explique cómo se puede aplicar el GRAFCET a la programación de microcontroladores con Micropython, que proponga soluciones a problemas prácticos de aplicación mediante el modelamiento de procesos secuenciales discretos con dicha herramienta gráfica', 'Estudiantes del III y IV semestre y docentes del Programa de Estudios de Electrónica Industrial del I.E.S.T.P. \"A.A.C.D\"', '2025-05-05', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(5, 'PROY-2025-005', 'TECNOESTRÉS Y RENDIMIENTO ACADÉMICO EN ESTUDIANTES DEL IESTP ANDRÉS AVELINO CÁCERES DORREGARAY DE SAN AGUSTÍN DE CAJAS - HUANCAYO', 'Investigacion Aplicada', 5, 104, 'Determinar la influencia del tecnoestrés en el rendimiento académico de estudiantes del IESTP Andrés Avelino Cáceres Dorregaray de San Agustín para aplicar estrategias de afrontamiento', 'Los beneficiarios directos serán los estudiantes del IESTP Andrés Avelino Cáceres Dorregaray de San Agustín de Cajas Huancayo', '2025-04-14', '2025-12-26', 'En Ejecucion', '2025-12-02 15:32:58'),
(6, 'PROY-2025-006', '\"Implementación con módulo probador de bobinas transistorizados\"', 'Innovacion Tecnologica', 6, 105, 'Implementar con modulo probador de bobinas transistorizados, para facilitar el aprendizaje de los estudiantes del Programa de estudios de Meca trónica Automotriz del IESTP \"AACD\"', 'Estudiantes del programa de estudios Mecatrónica Automotriz = 200 estudiantes, Docentes del programa de estudios de Mecatrónica Automotriz = 10 docentes', '2025-04-01', '2025-12-30', 'En Ejecucion', '2025-12-02 15:32:58'),
(7, 'PROY-2025-007', 'Diseño y fabricación de una centradora de ejes para los tornos del programa de Estudios de Mecánica de Producción Industria', 'Innovacion Tecnologica', 7, 106, 'Diseñar y fabricar una centradora de ejes para los tornos del programa de Estudios de Mecánica de Producción Industrial', 'Plana Docente y Alumnos del Programa de Estudios de Mecánica de Producción industrial', '2025-04-14', '2025-12-26', 'En Ejecucion', '2025-12-02 15:32:58'),
(8, 'PROY-2025-008', '\"Sistema alarma de emergencia con App de prevención de desastres para la IESTP Andrés A. Cáceres Dorregaray cajas\"', 'Investigacion Aplicada', 8, 107, 'Diseñar un sistema de alarma de emergencia para la institución de cajas con APP, toda la plana docente podrá activar mediante aplicativo en caso de una emergencia', 'Los beneficiarios toda la Instituto Superior Publico Andrés Avelino Cáceres Dorregaray como los alumnos que desean utilizar dichos módulos del Programa de Estudios de Electrónica Industrial', '2025-05-05', '2025-12-26', 'En Ejecucion', '2025-12-02 15:32:58'),
(9, 'PROY-2025-009', 'Gestión de Recursos Humanos en Empresas Informáticas del Distrito de Huancayo', 'Innovacion Tecnologica', 9, 108, 'Proponer un manual de Gestión de Recursos Humanos para la optimización del desempeño laboral de las empresas informáticas en el distrito de Huancayo', '130 alumnos de Programa de Asistencia Administrativa', '2025-04-01', '2025-12-12', 'En Ejecucion', '2025-12-02 15:32:58'),
(10, 'PROY-2025-010', 'SISTEMA DE SEGURIDAD DE LA INFORMACIÓN PARA OPTIMIZAR LOS SERVIDORES WEB EN EL P.E. DE DISEÑO Y PROGRAMACIÓN WEB DEL IESTP \"ANDRÉS AVELINO CÁCERES DORREGARAY\" - 2025', 'Investigacion Aplicada', 10, 109, 'Evaluar en qué medida un sistema seguridad de información optimiza los servidores web en el programa de estudios de Diseño y Programación Web del IESTP \"Andrés Avelino Cáceres Dorregaray\" - 2025', 'Beneficiarios directos: Estudiantes del programa, quienes utilizarán los servidores web. Docentes y equipos académicos al contar con un eficiente, seguro y funcional servidor web. Comunidad educativa en general', '2025-05-10', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(11, 'PROY-2025-011', '\"GUÍA DE PRÁCTICA DE LA UNIDAD DIDÁCTICA DE CIRCUITOS ELÉCTRICOS\"', 'Innovacion Pedagogica', 11, 110, 'Innovar y utiliza los dispositivos de electricidad, en la comprensión de Circuitos Eléctricos desarrollando una guía de practica de circuitos eléctricos que requiere el estudiante', 'Estudiantes del Programa de Estudios de Electricidad Industrial del primer semestre de ambos turnos y otros estudiantes de otros programas que estudien circuitos eléctricos', '2025-04-14', '2025-12-12', 'En Ejecucion', '2025-12-02 15:32:58'),
(12, 'PROY-2025-012', '\"Evaluación de cinética de lixiviación de minerales de cobre en columna mediante distintas concentraciones de riego de ácido sulfúrico\"', 'Investigacion Aplicada', 12, 111, 'Evaluar la cinética de lixiviación de minerales de cobre en columna mediante distintas tasas de riego de ácido sulfúrico para mejorar su recuperación de cobre', 'Directos: Todos los alumnos del PE de Metalurgia, así como sus docentes. Indirectos: Todo personal involucrado en el mundo minero metalúrgico', '2025-04-14', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(13, 'PROY-2025-013', '\"Evaluación del Rendimiento de Sistemas de Conversión Eléctrica Vehicular con Baterías LiFePO₄ - 72V\"', 'Innovacion Tecnologica', 13, 112, 'Evaluar el rendimiento energético y operativo de un sistema de conversión eléctrica vehicular utilizando baterías de fosfato de hierro y litio (LiFePO₄) a 72V, con el fin de determinar su viabilidad técnica en aplicaciones de movilidad eléctrica', 'Docentes y alumnos del programa de estudios de Electricidad Industrial y Mecatrónica Automotriz', '2025-05-11', '2025-12-31', 'En Ejecucion', '2025-12-02 15:32:58'),
(14, 'PROY-2025-014', 'APLICACIÓN DEL GENERADOR DE TEXTO IA \"MAGIC WRITE\" PARA LA EDICIÓN DE TEXTOS EN LOS ESTUDIANTES DE LOS PROGRAMAS DE ESTUDIOS DE ASISTENCIA ADMINISTRATIVA, ELECTRÓNICA INDUSTRIAL Y MANTENIMIENTO DE MAQUINARIA PESADA DEL IESTP\"ANDRÉS A. CÁCERES DORREGARAY\" – 2025', 'Investigacion Aplicada', 14, 113, 'Analizar el impacto de la aplicación del asistente de escritura IA\"Magic Write\" en el diseño, edición de textos: blogs, artículos educativos en los estudiantes de los programas de estudio de Asistencia Administrativa, Electrónica Industrial y Mantenimiento de Maquinaria Pesada del IESTP \"Andrés A. Cáceres D.\" – 2025', 'Estudiantes del III – IV semestre, turno Diurno del Programa de Estudios de Asistencia Administrativa. Estudiantes del I- II semestre turno Diurno de Electrónica Industrial. Estudiantes del I- II semestre turno Diurno de Mantenimiento de Maquinaria Pesada', '2025-04-01', '2025-12-19', 'En Ejecucion', '2025-12-02 15:32:58'),
(15, 'PROY-2025-015', 'Creación de contenidos digitales desarrolladas con herramientas web e Inteligencia Artificial para el marketing mediante redes sociales para el IESTP \"Andrés Avelino Cáceres Dorregaray\"', 'Innovacion Tecnologica', 15, 114, 'Publicar contenidos digitales creados con herramientas web e inteligencia artificial a través de las redes sociales como estrategia del marketing digital aplicado en el IESTP \"Andrés Avelino Cáceres Dorregaray\" de la provincia de Huancayo', 'Comunidad educativa del IESTP \"Andrés Avelino Cáceres D\"', '2025-05-12', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(16, 'PROY-2025-016', 'Diseño y Construcción de una Matriz Progresiva para la Fabricación de Arandelas Cónicas', 'Innovacion Tecnologica', 16, 115, 'Diseñar y construir una matriz progresiva para la producción en serie de arandelas para tornillos de cabeza cónica que se utilizan en la industria de los muebles de melamina', 'Directos: Fabricantes de muebles de melamina, vendedores y clientes de estos muebles. Indirectos: Docentes, personal administrativo y de servicios, estudiantes de los diferentes programas de estudios del Instituto', '2025-05-10', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(17, 'PROY-2025-017', 'Los Estilos de Aprendizaje y su relación con la creatividad en estudiantes de Asistencia Administrativa del IESTP \"AACD\"', 'Investigacion Aplicada', 17, 116, 'Determinar la relación que existe entre los estilos de aprendizaje y la creatividad en estudiantes del II y VI semestre del Programa de Estudios de Asistencia Administrativa', 'DIRECTOS: Estudiantes del II y VI semestre del Programa de Estudios de Asistencia Administrativa. INDIRECTOS: Estudiantes del Programa de Asistencia Administrativa', '2025-04-14', '2025-12-19', 'En Ejecucion', '2025-12-02 15:32:58'),
(18, 'PROY-2025-018', 'Factores que inciden en la deserción estudiantil en el Programa de Diseño y Programación Web del IESTP \"Andrés Avelino Cáceres Dorregaray\" – 2025', 'Investigacion Aplicada', 18, 117, 'Identificar y analizar los factores que influyen en la deserción de los estudiantes del Programa de Estudios de Diseño y Programación Web del IESTP \"Andrés Avelino Cáceres Dorregaray\" – Huancayo, durante el periodo académico 2025, con el propósito de proponer estrategias efectivas que promuevan su permanencia, continuidad y culminación exitosa', 'Estudiantes del programa, quienes accederán a estrategias orientadas a mejorar su permanencia y rendimiento académico. Docentes y equipos académicos, al contar con insumos relevantes para ajustar metodologías, tutorías y estrategias de acompañamiento. El IESTP \"Andrés Avelino Cáceres Dorregaray\", al fortalecer sus indicadores de retención, eficiencia académica y calidad institucional', '2025-04-07', '2025-12-26', 'En Ejecucion', '2025-12-02 15:32:58'),
(19, 'PROY-2025-019', 'INSTALACIÓN Y PUESTA EN FUNCIONAMIENTO DEL SISTEMA ELECTRÓNICO DEL MOTOR YARIS 1NZ', 'Innovacion Tecnologica', 19, 118, '\"Instalar y Probar el Funcionamiento del Sistema Electrónico del Motor Yaris 1NZ\" para mejorar el aprendizaje de los estudiantes del Programa de estudios de Mecatrónica Automotriz del IESTP \"AACD\"', 'Beneficiarios Directos: Estudiantes del programa de estudios Mecatrónica Automotriz = 200 estudiantes, Docentes del programa de estudios de Mecatrónica Automotriz = 10 docentes. Beneficiarios Indirectos: Estudiantes del programa de estudios de electrónica Industrial = 30 estudiantes, Docentes del Programa de estudios de electrónica industrial = 6 docentes', '2025-04-21', '2025-12-12', 'En Ejecucion', '2025-12-02 15:32:58'),
(20, 'PROY-2025-020', 'Desarrollo del sistema SICOLE para la comprensión lectora en estudiantes de la Institución Educativa Bellavista 30240 San Agustín – 2025', 'Investigacion Aplicada', 20, 119, 'Desarrollar el sistema SICOLE para mejorar la comprensión lectora en estudiantes de la Institución Educativa Bellavista 30240 San Agustín – 2025', 'Los principales beneficiarios del proyecto son los estudiantes de la Institución Educativa Bellavista 30240 San Agustín, quienes fortalecerán sus habilidades de comprensión lectora a través del uso del sistema SICOLE. De manera indirecta, también se beneficiarán los docentes, al contar con una herramienta de comprensión lectora', '2025-05-21', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(21, 'PROY-2025-021', 'MODULO HORNO PARA RENOVAR ZAPATAS DE FRENO DE VEHICULOS AUTOMOTRICES\"', 'Innovacion Tecnologica', 21, 120, 'Realizar el Proyecto \"IMPLEMENTACIÓN: MODULO HORNO PARA RENOVAR ZAPATAS DE FRENO DE VEHICULOS\" para para mejorar el aprendizaje de los estudiantes del Programa de estudios de Mecatrónica Automotriz del IESTP \"AACD\"', 'Beneficiarios Directos: Estudiantes del programa de estudios Mecatrónica Automotriz, Docentes del programa de estudios de Mecatrónica Automotriz', '2025-04-14', '2025-12-12', 'En Ejecucion', '2025-12-02 15:32:58'),
(22, 'PROY-2025-022', '\"Mantenimiento de las fuentes de alimentación del laboratorio del Programa de Estudios de Electrónica Industrial\"', 'Innovacion Tecnologica', 22, 121, 'Realizar el mantenimiento de las fuentes de alimentación del laboratorio de electrónica para que todas las fuentes de alimentación estén en perfecto estado de funcionabilidad para el desarrollo de las practicas de laboratorio', 'El mantenimiento de las fuentes de alimentación del laboratorio de electrónica va ha beneficiar a todos los alumnos del Instituto para que desarrollen sus practicas de laboratorio', '2025-05-05', '2025-12-12', 'En Ejecucion', '2025-12-02 15:32:58'),
(23, 'PROY-2025-023', 'Desarrollo de un Manual de Laboratorio Virtual DCACLAB para Fortalecer las Competencias en Circuitos Eléctricos y Electrónicos del Programa de estudios de Electrónica Industrial', 'Innovacion Pedagogica', 23, 122, 'Desarrollar un Manual didáctico para el uso del Laboratorio Virtual DCACLAB para Fortalecer las Competencias en Circuitos Eléctricos y Electrónicos del Programa de Estudios de Electrónica Industrial', 'Estudiantes y docentes', '2025-05-30', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(24, 'PROY-2025-024', 'CajasVial – registro e identificación de averías', 'Investigacion Aplicada', 24, 123, 'Desarrollar una aplicación web interactiva que permita a los ciudadanos del distrito de San Agustín de Cajas registrar y visualizar avenidas averiadas o inaccesibles, facilitando la comunicación entre la comunidad y las autoridades locales para la gestión eficiente de mejoras viales', 'Directos: Los ciudadanos del distrito de San Agustín de Cajas. La Municipalidad Distrital de San Agustín de Cajas y sus autoridades locales. Los estudiantes y docentes del Instituto de Educación Superior Tecnológico Público \"Andrés Avelino Cáceres\"', '2025-05-10', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(25, 'PROY-2025-025', 'PROBADOR DEL OBTURADOR ELECTRONICO DEL VEHÍCULO AUTOMOTRIZ', 'Innovacion Tecnologica', 25, 124, 'Construir un banco didáctico de un sistema de aceleración electrónica que permite realizar mediciones de sus magnitudes eléctricas para su diagnóstico y simule el funcionamiento real dentro de un vehículo', '120 alumnos de la especialidad de Mecatrónica Automotriz', '2025-04-01', '2025-12-29', 'En Ejecucion', '2025-12-02 15:32:58'),
(26, 'PROY-2025-026', '\"Tratamiento de aguas residuales a nivel piloto provenientes del camal los andes en el distrito de Huancán\"', 'Investigacion Aplicada', 26, 125, 'Determinar el porcentaje de remoción de contaminantes orgánicos con un tratamiento anaerobio a nivel laboratorio de dichas aguas residuales', 'Pobladores del distrito de Huancán', '2025-05-19', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(27, 'PROY-2025-027', '\"Diseño y dimensionamiento del circuito de bombeo de pulpas del área de procesamiento de minerales del programa de estudios acreditado de Metalurgia\"', 'Investigacion Aplicada', 27, 126, 'Diseñar, dimensionar e interpretar las características y capacidades de las bombas requeridas en el circuito de bombeo de pulpas del área de procesamiento de minerales del Programa de Estudios Acreditado de Metalurgia', 'Todos los estudiantes del P.E. de Metalurgia, así como sus docentes', '2025-05-05', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(28, 'PROY-2025-028', 'Tutoría virtual para desarrollar habilidades blandas en estudiantes de primer semestre del IESTP \"Andrés Avelino Cáceres Dorregaray\"', 'Innovacion Pedagogica', 28, 127, 'Implementar una tutoría virtual como estrategia pedagógica para desarrollar habilidades blandas en los estudiantes del primer semestre del IESTP \"Andrés Avelino Cáceres Dorregaray\"', '300 estudiantes del primer semestre del IESTP\" AACD\"', '2025-04-14', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(29, 'PROY-2025-029', '\"IMPLEMENTACIÓN DE PATIO DE MANIOBRAS PARA SITEMAS DE DISTRIBUCIÓN DE MEDIA TENSION EN EL \"IESTP\" \"ANDRÉS AVELINO CÁCERES DORREGARAY\"', 'Innovacion Pedagogica', 29, 128, 'Diseñar e implementar módulos de prácticas para las unidades de Sistemas de Suministro de Energía Eléctrica y Mantenimiento de Transformadores, que fortalezcan las competencias técnicas de los estudiantes del programa de Electricidad Industrial del IESTP \"Andrés Avelino Cáceres Dorregaray\"', 'Todos los integrantes del IESTP \"Andrés Avelino Cáceres Dorregaray\"', '2025-05-09', '2025-12-26', 'En Ejecucion', '2025-12-02 15:32:58'),
(30, 'PROY-2025-030', '\"IDENTIFICACIÓN DE METALES PESADOS PRESENTES EN LIXIVIADOS CARACTERIZADOS PRODUCIDOS POR RESIDUOS SÓLIDOS EN EL DISTRITO DE SAN JERONIMO DE TUNAN-2025\"', 'Investigacion Aplicada', 30, 129, 'Evaluar metales pesados presentes en lixiviados caracterizados, producidos por residuos sólidos en el distrito de \"San Jerónimo de Tunan\"-2025', 'El presente trabajo de investigación tiene como finalidad identificar los metales pesados presentes en los lixiviados producidos por los residuos sólidos del distrito de San Jerónimo de Túnan beneficiando alrededor de 11 000 habitantes de la zona urbana', '2025-05-19', '2025-12-05', 'En Ejecucion', '2025-12-02 15:32:58'),
(31, 'PROY-2025-031', 'Modelo de educación híbrida en el programa de estudios de Asistencia Administrativa del IESTP. \"Andrés Avelino Cáceres Dorregaray\"', 'Innovacion Pedagogica', 31, 130, 'Proponer un modelo de educación híbrida en el programa de estudios de Asistencia Administrativa del IESTP. Andrés Avelino Cáceres Dorregaray de San Agustín de Cajas – Huancayo', 'Estudiantes del programa de estudios de Asistencia Administrativa del IESTP. \"Andrés Avelino Cáceres Dorregaray\"', '2025-05-16', '2025-12-19', 'En Ejecucion', '2025-12-02 15:32:58'),
(33, 'PROY-2025-033', 'Aplicación de la Neurociencia para la conformación de equipos de trabajo exitosos para una planta de procesamiento de minerales', 'Investigacion Aplicada', 32, 131, 'Determinar el perfil de neurociencia de dominancia cerebral de Ned Herrmann de para conformar equipos de trabajo eficientes para la planta de procesamiento de minerales de Huari-ISTPAACD en el año 2025', 'ESTUDIANTES', '2025-04-07', '2025-12-17', 'En Ejecucion', '2025-12-02 15:32:58'),
(34, 'PROY-2025-034', 'Diseño e implementación de un sistema de seguridad mediante cámaras IP controlado con voz y aplicativo android', 'Investigacion Aplicada', 33, 132, 'Implementar un sistema de seguridad mediante cámaras IP controlado con voz y aplicativo android', 'Los docentes y alumnos del programa de estudios de Electrónica Industrial', '2025-04-21', '2025-10-31', 'En Ejecucion', '2025-12-02 15:32:58'),
(35, 'PROY-2025-035', 'SISTEMA DE CONTROL DE EXPERIENCIAS FORMATIVAS EN SITUACIONES REALES DE TRABAJO DEL IESTP \"ANDRÉS AVELINO CÁCERES DORREGARAY\" - CAJAS, 2025', 'Innovacion Tecnologica', 34, 133, 'Analizar, diseñar, implementar y probar el Sistema de control de Experiencias Formativas en Situaciones Reales de Trabajo en el Programa de Estudios de Diseño y Programación Web, del IESTP Andrés Avelino Cáceres Dorregaray, para brindar reportes exactos y oportunos, optimizando el registro, seguimiento y atención a los usuarios', 'Estudiantes y docentes del IESTP \"AACD\"', '2025-05-05', '2025-12-05', 'En Ejecucion', '2025-12-02 15:32:58'),
(36, 'PROY-2025-036', 'EXPLORACION DE LA INFLUENCIA DE LA ELECTRICIDAD EN LA VIDA Y LA SALUD HUMANA', 'Innovacion Pedagogica', 35, 134, 'FACILITAR LA PARTICIPACION DE LOS ESTUDIANTES DE ELECTRICIDAD INDUSTRIAL EN EVENTOS DE CIENCIAS CON LA CONSTRUCCION DE MODELOS DE EXPLORACION DE LA INFLUENCIA DE LA ELECTRICIDAD EN LA VIDA Y SALUD HUMANA', '150 ESTUDIANTES DE ELECTRICIDAD INDUSTRIAL Y PUBLICO EN GENERAL', '2025-04-01', '2025-12-20', 'En Ejecucion', '2025-12-02 15:32:58'),
(37, 'PROY-2025-037', 'INTELIGENCIA EMOCIONAL Y RENDIMIENTO ACADÉMICO EN ESTUDIANTES DEL PROGRAMA DE ESTUDIOS DE MECÁNICA DE PRODUCCIÓN INDUSTRIAL DEL INSTITUTO SUPERIOR TECNOLÓGICO ANDRÉS AVELINO CÁCERES DORREGARAY DE SAN AGUSTIN DE CAJAS – HUANCAYO', 'Investigacion Aplicada', 36, 135, 'Establecer la relación que existe entre la Inteligencia emocional y rendimiento académico en estudiantes del Programa de Estudios de Mecánica de Producción Industrial del Instituto Superior Tecnológico Andrés Avelino Cáceres Dorregaray de San Agustín de Cajas – Huancayo', 'Plana Docente y Alumnos del Programa de Estudios de Mecánica de Producción industrial', '2025-04-14', '2025-12-20', 'En Ejecucion', '2025-12-02 15:32:58'),
(38, 'PROY-2025-038', 'Fabricación de una prensa metálica adaptado para soportar platinas y taladrar para el programa de estudios de Mecánica de Producción Industrial', 'Innovacion Tecnologica', 37, 136, 'Lograr la fabricación de una prensa metálica adaptado para soportar platinas y taladrar para el programa de estudios de Mecánica de Producción Industrial', 'Directos: Plana Docente y Alumnos del Programa de Estudios de Mecánica de Producción industrial. Indirectos: Plana docente de otros programas de estudio, Alumnos de Mecatrónica Automotriz, Mantenimiento de maquinaria pesada y otros programas de estudio y personal interesado', '2025-04-01', '2025-12-19', 'En Ejecucion', '2025-12-02 15:32:58'),
(39, 'PROY-2025-039', 'Influencia del uso de la inteligencia Artificial ( chat GPT) en los estudiantes de Asistencia Administrativa y Tecnología de Análisis Químico Del Instituto De Educación Superior Tecnológico Público \" Andrés A. Cáceres D\"', 'Investigacion Aplicada', 38, 137, 'Analizar como el uso del chatGPT influye en los procesos de aprendizaje, desarrollo de sus habilidades cognitivas y rendimiento académico de los estudiantes con el fin de identificar sus beneficios, desafíos, y posibles implicancias pedagógicas', 'Estudiantes del programa TAQ, Estudiantes del programa AA', '2025-05-12', '2025-12-19', 'En Ejecucion', '2025-12-02 15:32:58'),
(40, 'PROY-2025-040', '\"EFICACIA DEL METODO DE LA ENSENANZA PROGRAMADA EN EL PROCESO APRENDIZAJE DEL MICROSOFF EXCEL Y MINITAB APLICADO EN CONTROL DE CALIDAD EN RESULTADOS ANALITICO EN EL INSTITUTO SUPERIOR TECNOLOGICO PUBLICO AACD\"', 'Innovacion Pedagogica', 39, 138, 'Elaborar y evaluar un proyecto de investigación, que contribuya en el desarrollo país. OBJETIVOS ESPECIFICOS: a. Conceptualizar y señalar el orden de los componentes del proyecto de investigación. b. Elaborar el planteamiento del estudio del proyecto de investigación tecnológica. c. Redactar y evaluar el proyecto de investigación tecnológica', 'DOCENTES, ESTUDIANTES, PUBLICO EN GENERAL Y PATENTES', '2025-05-06', '2025-12-20', 'En Ejecucion', '2025-12-02 15:32:58'),
(41, 'PROY-2025-041', 'Análisis del Referente Productivo de la Actividad Económica a la que se Vincula Mantenimiento de Maquinaria Pesada', 'Investigacion Aplicada', 40, 139, 'Proponer el referente productivo vinculada al programa de estudios de mantenimiento con su respectiva estructura del programa de estudios de mantenimiento de maquinaria pesada, donde se proponen las unidades de competencia y los indicadores de logro', 'Directos: Institutos de Educación Superior Tecnológica que ofertan el programa de estudios de Mantenimiento de maquinaria pesada. Indirectos: Institutos de Educación Superior Tecnológica que desean crear el programa de estudios de Mantenimiento de maquinaria pesada', '2025-04-21', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(42, 'PROY-2025-042', 'Diseño del plan de estudios del programa de estudios de mantenimiento de maquinaria pesada adecuada al CNOF', 'Investigacion Aplicada', 41, 140, 'Implementar el plan de estudio del programa de estudio de mantenimiento de maquinaria pesada adecuado al Catalogo Nacional de Oferta Formativa', 'Estudiantes del Programa de estudios de mantenimiento de maquinaria pesada y personas inmersas en las empresas del sector productivo, de la región Junín y a nivel nacional', '2025-04-21', '2025-11-28', 'En Ejecucion', '2025-12-02 15:32:58'),
(43, 'PROY-2025-043', 'uso de las redes sociales y el programa Excel en el aprendizaje de las alumnas del Programa de Asistencia Administrativa', 'Investigacion Aplicada', 42, 141, 'Conocer y determinar el grado de incidencia que tiene las Redes Sociales y el Programa Excel en el aprendizaje de las alumnas de Asistencia Administrativa. Determinar en qué medida las empresas e instituciones utilizan las Redes sociales y el uso del Programa Excel en el desarrollo de sus labores diarias', 'Las alumnas del Programa de Asitencia administrativa', '2025-04-01', '2025-12-31', 'En Ejecucion', '2025-12-02 15:32:58'),
(44, 'PROY-2025-044', '\"IMPACTO DEL USO DE AGUAS RESIDUALES DOMESTICAS EN EL SUELO DE LOS CULTIVOS DEL DISTRITO DE CHILCA - HUANCAYO\"', 'Investigacion Aplicada', 43, 142, 'Evaluar el impacto del uso de aguas residuales domésticas como afecta las propiedades químicas, físicas y biológicas del suelo en cultivos del distrito de Chilca, así como los posibles riesgos para la salud y el ambiente', 'POBLADORES DE LAS RIVERAS DE DISTRITO DE CHILCA- AUQUIMARCA', '2025-05-22', '2025-12-26', 'En Ejecucion', '2025-12-02 15:32:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resoluciones`
--

CREATE TABLE `resoluciones` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) DEFAULT NULL,
  `tipo` enum('Aprobacion','Culminacion','Felicitacion') NOT NULL,
  `numero` varchar(50) DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `documento_pdf` varchar(500) DEFAULT NULL,
  `emitida_por` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `correo_institucional` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `programa_estudio_id` int(11) DEFAULT NULL,
  `rol` enum('Docente Investigador','Jefe de Unidad de Investigacion','Director General','Comite Editor','Administrador') NOT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `password` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `dni`, `nombres`, `apellidos`, `correo_institucional`, `telefono`, `programa_estudio_id`, `rol`, `estado`, `fecha_registro`, `password`) VALUES
(100, '00000001', 'Lourdes Lidia', 'Cardenas Perez', 'lcardenasp@institutocajas.edu.pe', NULL, 1, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '4ece0e29731a6ab5c775d5cca9a3f01f3fba85d6b062c983294f3e5bccbc46b2'),
(101, '00000002', 'Lucia', 'Rodrigo Moscoso', 'lrodrigom@institutocajas.edu.pe', NULL, 2, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'b2113d265f943335fc313a7e47082ad24290ddf8341086561a2d65ce6a07683d'),
(102, '00000003', 'Luis David', 'Puente Yalopoma', 'lpuentey@institutocajas.edu.pe', NULL, 3, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '4127e092b7986e47ad06a7e14519329e66c4f423173712a9ce090d95fe7a9b79'),
(103, '00000004', 'Juan Luis', 'Merlo Galvez', 'jmerlog@institutocajas.edu.pe', NULL, 3, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '2313996fe92c52b22b67e4afb86dac1c859a33924eb103252e92b073e636166e'),
(104, '00000005', 'Ceferino Edwin', 'Carhuachi Ramos', 'ecarhuachir@institutocajas.edu.pe', NULL, 10, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '500ed63ff3c4b241cb46f3b6d1c2567694dd928fac482c8c560bb856591a8268'),
(105, '00000006', 'Fabian Vitaliano', 'Ruiz Yachachi', 'fruizy@institutocajas.edu.pe', NULL, 1, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '7a4fafb6f43a10d303e17f8ce3f13ab8f3dc2fb4c4208cf27021bfa870f0900a'),
(106, '00000007', 'Ronald Gabriel', 'Sandoval Lopez', 'rsandovall@institutocajas.edu.pe', NULL, 6, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '1504a1ba604ce52aede21d65601c3d05b28755e0c2e483bd9f2a9b233d0c9e54'),
(107, '00000008', 'Omar', 'Castro Porras', 'ocastrop@institutocajas.edu.pe', NULL, 3, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'd5b89381ed222f76f731d344aa02d041214c29104f5abb9050ca7e2133e4181e'),
(108, '00000009', 'Luz Agnes', 'Baldeon Berrocal', 'lbaldeonb@institutocajas.edu.pe', NULL, 2, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '2d895e2b5c7f7d9da77c83d6396f20900af19c57ca3a50ab92899d040a66d3a0'),
(109, '00000010', 'Kevin Rolando', 'Mateo Condor', 'kmateoc@institutocajas.edu.pe', NULL, 4, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '1e6b6355163996baeb9a53a9523d3e8e764513d034c943a0648cf9e2b6209655'),
(110, '00000011', 'Luis Jose', 'Ponce Meza', 'lponcem@institutocajas.edu.pe', NULL, 8, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '7637a4d92206607cd8fe5e82dccaf63cd56f1869d5f17e327937801b92cc91ae'),
(111, '00000012', 'Jisenia Paola', 'Ricaldi Ore', 'jricaldio@institutocajas.edu.pe', NULL, 5, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '35b9a4578cad92e16159cd22b4e5ef7566e5ed1170cc5be569d2642f1b01dd85'),
(112, '00000013', 'Romario Ruben', 'Macha Damian', 'rmachad@institutocajas.edu.pe', NULL, 8, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '3c95f66337cbb4dc64dc41d5e5033d3ca666702635c593c273e86bda9922ebe7'),
(113, '00000014', 'Vilma Esther', 'Gave Quintana', 'vgaveq@institutocajas.edu.pe', NULL, 2, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'e9ca151c172966cfb0b42a9f5acfb9d1ab812c3f18e917a43e5c609906ebc7a9'),
(114, '00000015', 'Hercules Hernan', 'Huaman Paucar', 'hhuamanp@institutocajas.edu.pe', NULL, 4, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '512df9b29dd0ac37015af9c8538746de85e6c5c7664673f7598e6f8f0dc808ac'),
(115, '00000016', 'Arturo Pedro', 'Vilchez Mallqui', 'avilchezm@institutocajas.edu.pe', NULL, 6, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '4ae07bc5fe8af8f68d3a07d0f41c6a176a9bb01dde19660cc04467864ab31d8f'),
(116, '00000017', 'Lizbeth', 'Serrano Pizarro', 'lserranop@institutocajas.edu.pe', NULL, 2, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'd1cc04df37cf52bdd1206b343f656e2f048d473f275fe7e80b388895dd5fbe4e'),
(117, '00000018', 'Edgard Michael', 'Montes Shepherd', 'emontess@institutocajas.edu.pe', NULL, 4, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'f10b0751d45218dccab738fa6425bff18ea8ad6b612f6bf1cd8c217cfe5fba18'),
(118, '00000019', 'Miguel Angel', 'Mendoza Limache', 'mmendozal@institutocajas.edu.pe', NULL, 1, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '3464ae7f4f493d08d225889565278ef164adec8906a87af9b7b8e7290a8e26af'),
(119, '00000020', 'Mesias William', 'Perez Zanabria', 'mperezz@institutocajas.edu.pe', NULL, 4, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'f609470642585f6e497d4910b1a53d11fcca5e9ceef27ff487ce42feceda10a2'),
(120, '00000021', 'Pedro Antonio', 'Vitor Rivera', 'pvitorr@institutocajas.edu.pe', NULL, 1, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'cefdf4148cc0bdd9b6b4e6f125a65088e5340d9cf15d58000015b254bcf5168d'),
(121, '00000022', 'Roberto Jesus', 'Velasco Castro', 'rvelascoc@institutocajas.edu.pe', NULL, 3, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'bbf2aa47e5c922e2c70a8fe379fde3709e04222601b89cd8e4f9dce3c77290b4'),
(122, '00000023', 'Jose Sabino', 'Soriano Vera', 'jsorianov@institutocajas.edu.pe', NULL, 3, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '1617705dcb7a9033bd06e93ff08bd6ec9d1c75b41534fe0b4a5a098f6caed0e6'),
(123, '00000024', 'Marco', 'Villasana Lopez', 'mvillasanal@institutocajas.edu.pe', NULL, 4, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '1318df54ce3de5f83ffb8033bc5e9d7e2eb869e68ae9364e3adcd92806114f16'),
(124, '00000025', 'Juan Arturo', 'Ochoa Torres', 'jochoat@institutocajas.edu.pe', NULL, 1, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'c15c4f9fc49d95b045e2987389db119e15ea771ce0124a18f67886b8583cbdcb'),
(125, '00000026', 'Rosalinda Gaby', 'Canchucaja Valdivieso', 'rcanchucajav@institutocajas.edu.pe', NULL, 9, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '2e249a5b7ff17c09e7fd3ee1f4969bdf85f866768300d9664bab717e93d7ec4f'),
(126, '00000027', 'Elvis', 'Parraga Olivera', 'eparragao@institutocajas.edu.pe', NULL, 5, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'c9587c59f5e875ce4fc575e22c6abd4d045438cb577263e9f96d5af1cf6c06e1'),
(127, '00000028', 'Lily Martha', 'Branes Espinoza', 'lbranese@institutocajas.edu.pe', NULL, 10, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'beb2fd4c9c0d9a47dd7426ad937309642ea7451ce1bad545a5df896f9a1cb24a'),
(128, '00000029', 'Enrique', 'Acuna Ospinal', 'eacunao@institutocajas.edu.pe', NULL, 8, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '2606c9a35e4dfb76d20f23090d9a59c52048a4a073d092c5a87d26c0baf9651e'),
(129, '00000030', 'Anthony Rodrigo', 'Zamudio Martel', 'azamudiom@institutocajas.edu.pe', NULL, 9, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'f71b1a78b0f513d4017e50ca7bb52431f6b965dcbbcd090ba6a28afe43f14c28'),
(130, '00000031', 'Rocio', 'Castillo Quispe', 'rcastilloq@institutocajas.edu.pe', NULL, 2, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'ace841ff297bb77525506bac63fa760c180d27b9b69317621f9ef79ebed7cd2e'),
(131, '00000032', 'Heber Eliseo', 'Egoavil Victoria', 'hegoavilv@institutocajas.edu.pe', NULL, 5, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '55557bd58e9353cde3a23e482682498548116cb816a69b92ad51b860087078e6'),
(132, '00000033', 'Christian Edwin', 'Cunyas Alcantara', 'ccunyasa@institutocajas.edu.pe', NULL, 11, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'de4c77dae87817476d4145c6528a332cae2733bb748fccab4effc80abd95d82e'),
(133, '00000034', 'Dafni Geydi', 'Limas Luna', 'dlimasl@institutocajas.edu.pe', NULL, 4, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'aa1bb2d181114d13fbcf37f051addb8da0e65df320d8bf0588b59b171dc9740a'),
(134, '00000035', 'Luis Alberto', 'Segura Meza', 'lseguram@institutocajas.edu.pe', NULL, 8, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'ef148631e496a63d3989f34338c27cf5a3fefa62778cbb6704e700500b6d5e7d'),
(135, '00000036', 'Alberto Evaristo', 'Coz Romani', 'acozr@institutocajas.edu.pe', NULL, 6, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'abe368d18e6ba4e76b027a0d06c8ea0e88281da869889fa74dfe08823ae1fb65'),
(136, '00000037', 'Yver Jony', 'Flores Sarmiento', 'yfloress@institutocajas.edu.pe', NULL, 6, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '249a97cf5ca67b90e3480339a6bc00d360cfe88c62b7c8e269f2413ffd3db3de'),
(137, '00000038', 'Esther', 'Barahona Terreros', 'ebarahonat@institutocajas.edu.pe', NULL, 2, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '3c357e16874b656ab358741a78641ed690c626848534486c1e86e4f831a2705c'),
(138, '00000039', 'Adolfo', 'Bravo Galvez', 'abravog@institutocajas.edu.pe', NULL, 9, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '25324bf68a6b96d448ddf877b78493ec9a06da1fa453cc1ad31ce2c89e29bc04'),
(139, '00000040', 'Franklin Cristian', 'Aldana Luna', 'faldanal@institutocajas.edu.pe', NULL, 7, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'fc643a63822f483ed312c62a215a88049f4253e51cdfb12e337c0e8d7902103d'),
(140, '00000041', 'Christian Ramon', 'Ricse Pecho', 'cricsep@institutocajas.edu.pe', NULL, 7, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', 'fd56d71e340b52c5a2f81f7be3d9d04eb447ebe8b9a2adc1ce2678b8b4f6740a'),
(141, '00000042', 'Carlos Geovany', 'Perez Capcha', 'cperezc@institutocajas.edu.pe', NULL, 2, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '470ea79e04621c2e126e3a0a560bb1d94878809e7b7df20aa04f1662ecddf102'),
(142, '00000043', 'Celia', 'Quincho Rojas', 'cquinchor@institutocajas.edu.pe', NULL, 9, 'Docente Investigador', 'Activo', '2025-12-02 15:32:58', '046b52b243f685c24bf9b9d05ac8d8b3803d214c9acdf0cd0523b6384bdf0c45');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `articulos_cientificos`
--
ALTER TABLE `articulos_cientificos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `documentos_proyecto`
--
ALTER TABLE `documentos_proyecto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`),
  ADD KEY `subido_por` (`subido_por`);

--
-- Indices de la tabla `evaluaciones`
--
ALTER TABLE `evaluaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`),
  ADD KEY `evaluador_id` (`evaluador_id`);

--
-- Indices de la tabla `exposiciones`
--
ALTER TABLE `exposiciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `inscripciones_exposicion`
--
ALTER TABLE `inscripciones_exposicion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exposicion_id` (`exposicion_id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `integrantes_proyecto`
--
ALTER TABLE `integrantes_proyecto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `lineas_investigacion`
--
ALTER TABLE `lineas_investigacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `programa_estudio_id` (`programa_estudio_id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `presupuestos`
--
ALTER TABLE `presupuestos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `programas_estudio`
--
ALTER TABLE `programas_estudio`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `linea_investigacion_id` (`linea_investigacion_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `resoluciones`
--
ALTER TABLE `resoluciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `proyecto_id` (`proyecto_id`),
  ADD KEY `emitida_por` (`emitida_por`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `correo_institucional` (`correo_institucional`),
  ADD KEY `programa_estudio_id` (`programa_estudio_id`),
  ADD KEY `idx_password` (`password`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `articulos_cientificos`
--
ALTER TABLE `articulos_cientificos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `documentos_proyecto`
--
ALTER TABLE `documentos_proyecto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `evaluaciones`
--
ALTER TABLE `evaluaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `exposiciones`
--
ALTER TABLE `exposiciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `gastos`
--
ALTER TABLE `gastos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inscripciones_exposicion`
--
ALTER TABLE `inscripciones_exposicion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `integrantes_proyecto`
--
ALTER TABLE `integrantes_proyecto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT de la tabla `lineas_investigacion`
--
ALTER TABLE `lineas_investigacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `presupuestos`
--
ALTER TABLE `presupuestos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `programas_estudio`
--
ALTER TABLE `programas_estudio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `resoluciones`
--
ALTER TABLE `resoluciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=249;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `articulos_cientificos`
--
ALTER TABLE `articulos_cientificos`
  ADD CONSTRAINT `articulos_cientificos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`);

--
-- Filtros para la tabla `documentos_proyecto`
--
ALTER TABLE `documentos_proyecto`
  ADD CONSTRAINT `documentos_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`),
  ADD CONSTRAINT `documentos_proyecto_ibfk_2` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `evaluaciones`
--
ALTER TABLE `evaluaciones`
  ADD CONSTRAINT `evaluaciones_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`),
  ADD CONSTRAINT `evaluaciones_ibfk_2` FOREIGN KEY (`evaluador_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`);

--
-- Filtros para la tabla `inscripciones_exposicion`
--
ALTER TABLE `inscripciones_exposicion`
  ADD CONSTRAINT `inscripciones_exposicion_ibfk_1` FOREIGN KEY (`exposicion_id`) REFERENCES `exposiciones` (`id`),
  ADD CONSTRAINT `inscripciones_exposicion_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`);

--
-- Filtros para la tabla `integrantes_proyecto`
--
ALTER TABLE `integrantes_proyecto`
  ADD CONSTRAINT `integrantes_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`),
  ADD CONSTRAINT `integrantes_proyecto_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `lineas_investigacion`
--
ALTER TABLE `lineas_investigacion`
  ADD CONSTRAINT `lineas_investigacion_ibfk_1` FOREIGN KEY (`programa_estudio_id`) REFERENCES `programas_estudio` (`id`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `presupuestos`
--
ALTER TABLE `presupuestos`
  ADD CONSTRAINT `presupuestos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`);

--
-- Filtros para la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD CONSTRAINT `proyectos_ibfk_1` FOREIGN KEY (`linea_investigacion_id`) REFERENCES `lineas_investigacion` (`id`),
  ADD CONSTRAINT `proyectos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `resoluciones`
--
ALTER TABLE `resoluciones`
  ADD CONSTRAINT `resoluciones_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`),
  ADD CONSTRAINT `resoluciones_ibfk_2` FOREIGN KEY (`emitida_por`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`programa_estudio_id`) REFERENCES `programas_estudio` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
