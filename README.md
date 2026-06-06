# Style Factory — Frontend

Interfaz web de **Style Factory**, salón de belleza y bienestar en Bogotá. El sitio permite explorar servicios, registrarse, iniciar sesión, reservar citas con estilistas, consultar el historial personal de reservas y —con rol `ADMIN`— administrar servicios y reservas desde un panel de control.

Está construido con **HTML, CSS y JavaScript** vanilla (sin React ni Vue). Los componentes reutilizables (navbar, footer, formularios) se cargan dinámicamente con `fetch`. La autenticación y los datos de negocio se obtienen del API REST desplegado en Render.

---

## Enlaces del proyecto

| Recurso | URL |
|---------|-----|
| **Sitio publicado** | https://enithv.github.io/stylefactory/ |
| **Repositorio frontend** | https://github.com/EnithV/stylefactory |
| **API (Render)** | https://stylefactoryapi.onrender.com |
| **Repositorio backend** | https://github.com/EnithV/stylefactory-backend |
| **Swagger** | https://stylefactoryapi.onrender.com/swagger-ui/index.html |

---

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| HTML5 | Páginas y componentes |
| CSS3 | Estilos por página/componente; variables CSS de marca |
| JavaScript ES6+ | Lógica, módulos ES6 en catálogo y admin |
| Bootstrap 5.3.8 | Grid, navbar, modales, carrusel |
| Google Fonts | Montserrat, Playfair Display |
| Font Awesome 6 | Iconos |
| Formspree | Envío del formulario de contacto (externo al API) |
| Leaflet + OpenStreetMap (CARTO) | Mapa en página de contacto (sin API key) |
| JWT | Sesión vía `localStorage` + API backend |

---

## Mapa del sitio

Todas las rutas del menú usan el prefijo **`/stylefactory/`** porque GitHub Pages publica este repositorio como sitio de proyecto bajo `enithv.github.io`.

| Sección | Ruta relativa | Descripción |
|---------|---------------|-------------|
| Inicio | `/index.html` | Banner, servicios destacados, reseñas, info del salón |
| Servicios | `/pages/catalogoServicios/` | Catálogo con filtros por categoría |
| Nosotros | `/pages/aboutUs/` | Historia, valores, equipo |
| Contacto | `/pages/contact/` | Formulario Formspree + mapa |
| Login | `/pages/login/` | Formulario en iframe |
| Registro | `/pages/registro/` | Alta de clientes en iframe |
| Reservas | `/pages/reservations/` | Flujo: servicio → estilista → fecha/hora → confirmar |
| Mis reservas | `/pages/misReservas/` | Historial del cliente autenticado |
| Admin | `/pages/admin/panelDeControl/` | Panel, métricas, gestión servicios/reservas |

---

## Estructura del proyecto

```
stylefactory/
├── index.html
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── config.js                 # API_BASE, urlApp(), navbar helpers
│       ├── apiClient.js              # Módulo ES6: CRUD servicios/reservas
│       ├── formValidaciones.js       # Validaciones compartidas
│       ├── productosCatalogo.js    # Fallback local del catálogo
│       ├── reservaPendiente.js      # Progreso de reserva sin sesión
│       └── main.js                 # Home: carga de secciones
├── components/
│   ├── navbar/
│   │   └── navbar.html
│   ├── footer/
│   ├── bannerInicio/
│   ├── ServiciosDestacados/
│   ├── review/
│   ├── confirmacionServicio/       # Modal y POST /reservas
│   ├── metricas/                   # Gráficos del panel admin (datos demo)
│   ├── maps/                       # Mapa de contacto
│   └── forms/
│       ├── loginUsuario/           # iframe en pages/login
│       ├── registroUsuario/        # iframe en pages/registro
│       ├── contacto/               # iframe en pages/contact
│       ├── creacionServicios/       # iframe en admin lista servicios
│       ├── passwordToggle.js       # Mostrar/ocultar contraseña
│       └── passwordToggle.css
├── pages/
│   ├── login/
│   ├── registro/
│   ├── contact/
│   ├── catalogoServicios/
│   ├── aboutUs/
│   ├── reservations/
│   ├── misReservas/
│   └── admin/
│       ├── panelDeControl/
│       ├── listaServicios/
│       ├── listaReservas/
│       └── reservarServicios/
└── dataBase/                       # Scripts SQL de referencia (Supabase)
    ├── query_base_de_datos.sql
    ├── seed_catalogo_stylefactory.sql
    └── migracion_duracion_servicios.sql
```

---

## Configuración (`assets/js/config.js`)

```javascript
const API_BASE = "https://stylefactoryapi.onrender.com";
const FRONTEND_BASE_URL = "https://enithv.github.io/stylefactory";
const GITHUB_PAGES_BASE_PATH = "/stylefactory";
```

### Funciones globales

| Función | Propósito |
|---------|-----------|
| `obtenerBaseAplicacion()` | Detecta `/stylefactory` en GitHub Pages o raíz en local |
| `urlApp('/pages/login/login.html')` | Arma rutas absolutas para redirecciones desde iframes |
| `saludoNavbar(nombre)` | Primer nombre en el navbar |
| `marcarEnlaceNavbarActivo()` | Resalta la página actual en el menú |
| `actualizarEnlacesNavbarSesion()` | Muestra «Mis reservas» y «Administrador» si hay sesión |
| `mensajeErrorConexion(error)` | Texto claro ante NetworkError o cold start de Render |

### Desarrollo contra API local

Cambiar temporalmente:

```javascript
const API_BASE = "http://localhost:8081";
```

El backend debe tener CORS habilitado para `http://localhost:*` (ya configurado en `CorsConfig.java`).

---

## Sesión y almacenamiento local

### Claves en `localStorage`

| Clave | Contenido | Cuándo se escribe |
|-------|-----------|-------------------|
| `token` | JWT del API | Login exitoso |
| `usuarioLogueado` | `{ id, nombre, correo, rol }` | Login exitoso |
| `servicioSeleccionado` | Objeto servicio del catálogo | Usuario elige «Reservar» |
| `Lista de Servicios` | (legacy) cache opcional de servicios | Fallback admin antiguo |

### Claves en `sessionStorage` (`reservaPendiente.js`)

| Clave | Propósito |
|-------|-----------|
| `reservaPendienteDatos` | Progreso de reserva si el usuario no tenía sesión |
| `retomarReserva` | Flag para volver al flujo tras login/registro |

El token **no** se persiste en Supabase; vive en el navegador hasta expiración (24 h) o cierre de sesión.

---

## Autenticación

### Login

1. Formulario en `components/forms/loginUsuario/` dentro de un **iframe** en `pages/login/`.
2. `POST {API_BASE}/auth/login` con `{ correo, contrasena }`.
3. Guarda `token` y `usuarioLogueado`.
4. Muestra aviso de bienvenida (estilo editorial, ~1,5 s).
5. Redirección según rol y contexto:

| Condición | Destino |
|-----------|---------|
| Hay reserva pendiente en `sessionStorage` | `/pages/reservations/?retomar=1` |
| Rol `ADMIN` | `/pages/admin/panelDeControl/panelControl.html` |
| Cliente | `/index.html` |

### Registro

1. Validación en cliente (`formValidaciones.js`).
2. `POST /auth/register` con rol `CLIENTE`.
3. Mensaje de éxito → redirect a `/pages/login/login.html?registro=exito`.
4. La página login muestra aviso «Cuenta registrada» sobre el iframe.

### Navbar con sesión

- Sin sesión: botón «Iniciar sesión».
- Con sesión: «Hola, {primer nombre}» + «Cerrar sesión».
- Enlaces condicionales: **Mis reservas** (cualquier usuario logueado), **Administrador** (solo `ADMIN`).

```mermaid
sequenceDiagram
    participant U as Usuario
    participant IF as iframe login
    participant API as API Render
    participant LS as localStorage
    participant NAV as Navbar

    U->>IF: correo + contraseña
    IF->>API: POST /auth/login
    API-->>IF: token, id, nombre, rol
    IF->>LS: token + usuarioLogueado
    IF->>U: Aviso bienvenida
    IF->>U: Redirect (home o admin)
    U->>NAV: actualizarNavbar()
    NAV->>NAV: Mis reservas / Admin según rol
```

---

## Validaciones de formularios

Centralizadas en `assets/js/formValidaciones.js`:

| Campo | Reglas |
|-------|--------|
| Nombre | Solo letras, espacios, apóstrofes; sin números; aviso en tiempo real |
| Correo | Obligatorio; formato válido |
| Teléfono | Solo dígitos y separadores (`+`, `-`, espacios); longitud 7–15 dígitos |
| Contraseña | Mín. 8 caracteres; mayúscula, minúscula, número y símbolo |
| Confirmación | Debe coincidir con contraseña |
| Mensaje (contacto) | Mín. 10 caracteres |

Login y registro usan **`novalidate`** para mostrar errores en español (evita tooltips nativos ocultos dentro del iframe).

**Contraseña visible:** `components/forms/passwordToggle.js` + estilos en `passwordToggle.css`.

---

## Integración con el backend

### Cliente API (`assets/js/apiClient.js`)

Módulo ES6 importado con `type="module"` en catálogo y páginas admin.

| Función | Endpoint | Método |
|---------|----------|--------|
| `listarServicios()` | `/servicios` | GET (público) |
| `crearServicio(payload)` | `/servicios` | POST |
| `actualizarServicio(id, payload)` | `/servicios/{id}` | PUT |
| `eliminarServicio(id)` | `/servicios/{id}` | DELETE |
| `listarReservas()` | `/reservas` | GET |
| `eliminarReserva(id)` | `/reservas/{id}` | DELETE |
| `actualizarEstadoReserva(id, estado)` | `/reservas/{id}/estado` | PATCH |

Estados de reserva: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA`.

Todas las peticiones autenticadas envían:

```http
Authorization: Bearer {token}
Content-Type: application/json
```

### Catálogo de servicios

`pages/catalogoServicios/catalogoServicios.js`:

1. Intenta `GET /servicios` (público, sin token).
2. Si falla, usa fallback de `productosCatalogo.js` o `localStorage`.
3. Filtros por categoría (`tipo` / `tipoServicio`).
4. Al reservar, guarda `servicioSeleccionado` y redirige a `/pages/reservations/`.

### Flujo de reserva

`pages/reservations/reservations.js` + `components/confirmacionServicio/confirmacionServicio.js`:

1. Muestra servicio desde `localStorage`.
2. Carrusel de **6 estilistas** (datos UI con `empleadoId` 1–6 alineados al seed SQL).
3. Calendario y slots con reglas en zona **America/Bogota**:
   - Atención 9:00 a.m. – 8:00 p.m.
   - Último inicio de cita: 6:00 p.m.
   - Duración según `duracionMinutos` del servicio.
4. Si no hay sesión: guarda progreso en `sessionStorage` y pide login/registro.
5. Confirmación: `POST /reservas` con `estado: "CONFIRMADA"`.
6. Modal de éxito y redirección.

> **Nota:** La disponibilidad horaria en pantalla es **simulada** en el frontend. El API valida las reglas reales al crear la reserva. La integración con `GET /horarios` y `GET /empleados/catalogo` está prevista como mejora futura.

### Mis reservas

`pages/misReservas/misReservas.js`:

- Requiere sesión (`token` + `usuarioLogueado`).
- `GET /reservas/mis-reservas` con Bearer token.
- Tabla: servicio, estilista, fecha, hora, estado.
- Ante 401: limpia sesión y redirige a login.

### Panel de administración

| Página | Integración API |
|--------|-----------------|
| `panelDeControl` | Verifica token y rol ADMIN; carga métricas (datos demo en `metricas.js`) |
| `listaServicios` | CRUD vía `apiClient.js`; formulario en iframe `creacionServicios` |
| `listaReservas` | `GET /reservas`, `DELETE`, selector de estado con `PATCH …/estado` |
| `reservarServicios` | Vista auxiliar (sin integración API completa) |

El panel exige JWT válido. Si el token expiró, las peticiones devuelven 401/403 → volver a iniciar sesión.

---

## Páginas con iframes

Login, registro, contacto y formularios admin embeben HTML en `<iframe>` para reutilizar componentes aislados.

Implicaciones:

- Las redirecciones post-login usan `window.parent.location.href` y `urlApp()`.
- Los estilos del iframe son independientes; cache bust `?v=2` en CSS cuando se actualizan.
- `ResizeObserver` en registro notifica altura al padre para evitar scroll cortado.

---

## Contacto y mapa

- **Formulario:** Formspree (`formContacto.html` → `https://formspree.io/f/…`). No pasa por el API de Style Factory.
- **Mapa:** Google Maps en `pages/contact/contact.html` + `components/maps/`. Requiere API key con referrer autorizado para `enithv.github.io` y facturación activa en Google Cloud si aplica.

---

## Desarrollo local

### Requisitos

- Navegador reciente (Chrome, Firefox, Edge).
- Servidor HTTP estático (**Live Server**, `npx serve .`, etc.).

> **No abras los `.html` con doble clic (`file://`).** El API, los módulos ES6 y las peticiones `fetch` a componentes fallan o se bloquean por CORS.

### Pasos

```bash
git clone https://github.com/EnithV/stylefactory.git
cd stylefactory
```

Abrir la carpeta con Live Server. URL típica:

```
http://127.0.0.1:5500/stylefactory/index.html
```

Si Live Server sirve desde la raíz del repo sin subcarpeta, `obtenerBaseAplicacion()` devuelve `""` y las rutas relativas funcionan igual.

---

## Despliegue (GitHub Pages)

1. Repositorio **EnithV/stylefactory**, rama **`main`**.
2. **Settings → Pages → Build and deployment → Deploy from branch**.
3. Branch: `main`, carpeta **`/ (root)`**.
4. Sitio: https://enithv.github.io/stylefactory/

Cada `push` a `main` actualiza la versión en línea en **1–2 minutos**.

### Prefijo `/stylefactory`

Los enlaces del navbar usan rutas absolutas `/stylefactory/...` para funcionar en GitHub Pages. No cambiar a rutas relativas sin actualizar `config.js` y el navbar.

---

## Base de datos (scripts de referencia)

La carpeta `dataBase/` contiene SQL para **Supabase**, no se ejecuta desde el frontend:

| Archivo | Contenido |
|---------|-----------|
| `query_base_de_datos.sql` | DDL tablas usuarios, servicios, empleados, reservas, horarios |
| `seed_catalogo_stylefactory.sql` | 6 estilistas + 10 servicios (IDs alineados con `reservations.js`) |
| `migracion_duracion_servicios.sql` | Columna `duracion_minutos` |

Ejecutar en Supabase SQL Editor cuando se configure el backend en Render.

---

## Solución de problemas

| Síntoma | Causa probable | Qué hacer |
|---------|----------------|-----------|
| NetworkError al login | Cold start Render o `file://` | Usar GitHub Pages o Live Server; esperar ~1 min |
| 403 en panel admin | Token expirado o ausente | Cerrar sesión y volver a login |
| Catálogo vacío | API caído | Revisar Render; entra fallback local |
| Mapa en blanco | API key Maps restringida | Configurar referrer en Google Cloud |
| Redirect roto tras login | Rutas sin `urlApp()` | Verificar `config.js` y prefijo `/stylefactory` |
| Reserva rechazada por API | Horario inválido vs reglas backend | Elegir slot antes de 6 p.m. que quepa con duración |

---

## Estado del proyecto

| Funcionalidad | Estado |
|---------------|--------|
| Home, nosotros, contacto | Operativo |
| Login / registro + validaciones + toggle contraseña | Operativo |
| Catálogo con API + fallback + filtros | Operativo |
| Flujo de reserva + confirmación API | Operativo |
| Mis reservas (cliente) | Operativo |
| Panel admin servicios (CRUD API) | Operativo |
| Panel admin reservas (listar, borrar, PATCH estado) | Operativo |
| Redirect login por rol (ADMIN → panel) | Operativo |
| Retomar reserva tras login/registro | Operativo |
| Despliegue GitHub Pages | Operativo |
| Métricas del dashboard admin | Datos de demostración |
| Disponibilidad real de estilistas/horarios en UI | Pendiente (mock en calendario) |
| Mensaje de éxito registro (estilo editorial) | Pendiente de unificar con login |

### Mejoras futuras sugeridas

- Conectar calendario de reservas a `GET /empleados/catalogo` y `GET /horarios`.
- Métricas reales desde agregaciones del API.
- Unificar estilo de avisos de éxito en registro (como login).
- Cerrar sesión consistente (`token` + `usuarioLogueado`) en todas las páginas.
- Restringir API key de Google Maps por dominio y evitar exponerla en repos públicos.

---

## Relación con el backend

Este frontend es el cliente oficial del API documentado en [stylefactory-backend](https://github.com/EnithV/stylefactory-backend). La integración principal ocurre en:

- Autenticación (`/auth/*`)
- Catálogo (`GET /servicios`)
- Reservas (`POST /reservas`, `GET /reservas/mis-reservas`)
- Administración (`/servicios`, `/reservas`, `PATCH /reservas/{id}/estado`)

Para probar endpoints manualmente: [Swagger UI](https://stylefactoryapi.onrender.com/swagger-ui/index.html).

---

*Style Factory — Cortes que inspiran.*  
Proyecto **Generation Colombia**. API REST: [EnithV/stylefactory-backend](https://github.com/EnithV/stylefactory-backend).
