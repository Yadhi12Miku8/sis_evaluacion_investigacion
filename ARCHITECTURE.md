# Arquitectura del sistema — Diagrama

A continuación tienes un diagrama en Mermaid que representa la arquitectura del proyecto `sistema-investigacion` y una breve explicación de cada componente.

```mermaid
flowchart LR
  Browser[Usuario / Navegador]
  Browser -->|GET /, /dashboard/...| Server[server.js / Express]
  Server --> App[src/app.js]
  Server --> Static[/public (css, js, images)]
  Static --> Browser

  App --> Routes[/src/routes/*]
  Routes --> Controllers[/src/controllers/*]
  Controllers --> Repositories[/src/repositories/*]
  Repositories --> DBPool[/src/database/pool.js]
  DBPool --> MySQL[(MySQL DB)]

  Controllers --> Views[/src/views/*.html]
  Views --> Browser

  Controllers --> Utils[/src/utils/*]
  Utils -->|jwt| JWTUtil[jwt.js]
  Utils -->|bcrypt| BcryptUtil[bcrypt.js]
  Utils -->|logger| Logger[logger.js]

  App --> Middlewares[/src/middlewares/*]
  Middlewares --> AuthMiddleware[auth.middleware.js]
  Middlewares --> Validation[validation.middleware.js]

  subgraph AuthFlow[Autenticación]
    Browser -->|POST /api/auth/login| AuthRoute[/src/routes/auth.routes.js]
    AuthRoute --> AuthController[Auth.controller.js]
    AuthController --> AuthRepository[Auth.repository.js]
    AuthRepository --> DBPool
    AuthController -->|hash compare| BcryptUtil
    AuthController -->|sign token| JWTUtil
    AuthController --> Browser
    Browser -->|use token| AuthMiddleware
  end

  subgraph Tests
    Tests[tests/*] --> Controllers
    Tests --> Repositories
  end

  style Server fill:#f9f,stroke:#333,stroke-width:1px
  style App fill:#efe,stroke:#333
  style DBPool fill:#fee,stroke:#333
  style MySQL fill:#ffd,stroke:#333
```

**Explicación rápida de los nodos y su responsabilidad**

- `server.js`: punto de entrada. Inicializa Express, middlewares globales, conexión a `public/` y registra rutas.
- `src/app.js`: (si existe) centraliza la creación de `app` y composición de middlewares/rutas (recomendado).
- `public/`: ficheros estáticos servidos (CSS, JS, imágenes). Debe exponerse mediante `express.static`.
- `src/routes/*`: definición de endpoints (p. ej. `auth.routes.js`, `dashboard.routes.js`). Delegan a controladores.
- `src/controllers/*`: orquestan la lógica de negocio por ruta, llaman a repositorios y utils, devuelven vistas o JSON.
- `src/repositories/*`: consultas a BD (SQL) o abstracciones sobre el acceso a datos.
- `src/database/pool.js`: configuración del pool MySQL (reusar conexiones).
- `src/utils/*`: utilidades como `jwt.js` (firma/verificación), `bcrypt.js` (hashing), `logger.js`.
- `src/middlewares/*`: validaciones y protección de rutas (p. ej. `auth.middleware.js` valida el token JWT y roles).
- `src/views/*.html`: plantillas estáticas (dashboard por rol, login), servidas por rutas específicas.
- `tests/*`: pruebas unitarias y de integración (ejecutan controladores y repositorios).

**Puntos críticos / recomendaciones**

- Unificar la creación del `app` en `src/app.js` y dejar `server.js` solo para arrancar (separación de responsabilidades).
- Asegurar que las rutas en los HTML usen rutas absolutas (`/css/...`, `/js/...`) para evitar 404 cuando se accede desde subrutas.
- Reemplazar SHA256 por `bcrypt` para passwords (más seguro) y provisionar un plan para rehashear contraseñas existentes.
- Añadir middlewares de seguridad: `helmet`, `cors` con configuración estricta en producción, `rate-limit` en login.
- Añadir manejo centralizado de logs con `logger.js` y rotación (winston o pino).
- Considerar refresh tokens o mecanismo de revocación si necesitas invalidar JWTs.

---

Si quieres, genero también una versión en PNG/SVG del diagrama (con herramientas externas) o un archivo `architecture.drawio`/`diagram.mmd` para editar. ¿Qué prefieres que haga ahora?