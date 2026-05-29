# Style Factory — Frontend

Sitio web de **Style Factory**, salón de belleza y bienestar. Los clientes pueden conocer servicios, registrarse, iniciar sesión y gestionar reservas. El panel de administración concentra el trabajo del equipo del salón.

El proyecto es **HTML, CSS y JavaScript** puro, sin frameworks de interfaz. Los componentes se cargan por secciones (`fetch` + plantillas) y la autenticación se resuelve contra una API REST desplegada por separado.

**Sitio en producción:** [https://enithv.github.io/stylefactory/](https://enithv.github.io/stylefactory/)

**API (backend):** [https://stylefactoryapi.onrender.com](https://stylefactoryapi.onrender.com) — repositorio [stylefactory-backend](https://github.com/EnithV/stylefactory-backend)

---

## Contenido del sitio

| Sección | Ruta | Descripción |
|---------|------|-------------|
| Inicio | `/index.html` | Banner, servicios destacados, reseñas |
| Catálogo | `/pages/catalogoServicios/` | Listado de servicios |
| Nosotros | `/pages/aboutUs/` | Información del salón |
| Contacto | `/pages/contact/` | Formulario (Formspree) y mapa |
| Login | `/pages/login/` | Acceso de clientes y administradores |
| Registro | `/pages/registro/` | Alta de nuevos clientes |
| Reservas | `/pages/reservations/` | Flujo de reserva (usuario logueado) |
| Admin | `/pages/admin/` | Panel, servicios y reservas |

---

## Stack técnico

- **HTML5** y **CSS3** (Bootstrap 5.3.8 como base responsive)
- **JavaScript** (ES6+, sin bundler)
- **Font Awesome** e iconos de Google Fonts (Montserrat, Playfair Display)
- **Google Maps** en la página de contacto
- **Formspree** para el envío del formulario de contacto
- **JWT** vía API para login y registro

---

## Estructura del repositorio

```
stylefactory/
├── index.html                 # Página principal
├── assets/
│   ├── css/                   # Estilos globales
│   └── js/
│       ├── config.js          # URL del API y utilidades de conexión
│       ├── formValidaciones.js # Reglas compartidas de formularios
│       └── main.js            # Navbar, sesión y carga de secciones en home
├── components/                # Piezas reutilizables (HTML + CSS + JS)
│   ├── navbar/
│   ├── footer/
│   ├── forms/                 # Login, registro, contacto, reserva, etc.
│   ├── bannerInicio/
│   ├── ServiciosDestacados/
│   └── ...
└── pages/                     # Vistas completas por módulo
    ├── login/
    ├── registro/
    ├── contact/
    ├── catalogoServicios/
    ├── reservations/
    └── admin/
```

Las rutas del menú usan el prefijo **`/stylefactory/`** porque GitHub Pages publica este repositorio como sitio de proyecto bajo `enithv.github.io`.

---

## Cómo funciona la sesión

1. El usuario envía correo y contraseña desde el formulario de login (cargado en un `iframe` dentro de `pages/login/`).
2. El frontend hace `POST` a `{API_BASE}/auth/login`.
3. Si la respuesta es correcta, se guardan en `localStorage`:
   - `token` — JWT para peticiones futuras al API
   - `usuarioLogueado` — objeto con `nombre`, `correo` y `rol`
4. Se redirige al inicio (cliente) o al panel de control (rol `ADMIN`).
5. Cada página que incluye el navbar ejecuta `actualizarNavbar()` y muestra **«Hola, {nombre}»** cuando hay sesión activa.

El registro sigue el mismo criterio: validación en el cliente, envío a `POST /auth/register` y redirección al login con mensaje de cuenta creada.

---

## Validaciones en formularios

La lógica común vive en `assets/js/formValidaciones.js`:

- **Nombre:** solo letras; aviso en tiempo real si se escribe un número o símbolo no permitido.
- **Correo:** formato válido y campo obligatorio donde aplica.
- **Teléfono:** solo dígitos y separadores habituales (`+`, guiones, espacios); rechazo inmediato de letras.
- **Contraseña (registro):** requisitos de longitud, mayúsculas, números y carácter especial; confirmación debe coincidir.
- **Mostrar/ocultar contraseña:** componente `passwordToggle.js` en login y registro.

Los formularios de login y registro usan `novalidate` para controlar los mensajes en español sin depender del tooltip nativo del navegador dentro del iframe.

---

## Requisitos para desarrollo local

- Navegador actualizado (Chrome, Firefox o Edge).
- Un servidor estático local. **No abras los HTML con doble clic** (`file://`); las peticiones al API y la carga de componentes fallan o se bloquean por CORS.

Opciones habituales:

- Extensión **Live Server** en VS Code
- `npx serve .` en la raíz del proyecto
- Cualquier servidor que sirva la carpeta por `http://localhost`

---

## Puesta en marcha local

```bash
git clone https://github.com/EnithV/stylefactory.git
cd stylefactory
```

Abre la carpeta con Live Server (o equivalente). La URL será similar a:

`http://127.0.0.1:5500/stylefactory/index.html`

El archivo `assets/js/config.js` define la base del API:

```javascript
const API_BASE = "https://stylefactoryapi.onrender.com";
const FRONTEND_BASE_URL = "https://enithv.github.io/stylefactory";
```

Para apuntar a un backend en tu máquina, cambia `API_BASE` (por ejemplo `http://localhost:8081`) y asegúrate de que el backend permita tu origen en CORS.

---

## Despliegue en GitHub Pages

1. Repositorio: **EnithV/stylefactory**, rama `main`.
2. En GitHub: **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**, carpeta **`/ (root)`**.
4. Tras unos minutos el sitio queda en [https://enithv.github.io/stylefactory/](https://enithv.github.io/stylefactory/).

Cada `push` a `main` actualiza la versión publicada.

---

## Integración con el backend

| Acción | Endpoint | Notas |
|--------|----------|--------|
| Registro | `POST /auth/register` | Cuerpo JSON: `nombre`, `correo`, `telefono`, `contrasena`, `rol` |
| Login | `POST /auth/login` | Devuelve `token`, `nombre`, `correo`, `rol` |
| Resto de recursos | `/servicios`, `/reservas`, etc. | Requieren cabecera `Authorization: Bearer {token}` |

En el plan gratuito de Render el API puede tardar hasta un minuto en responder la primera vez tras estar inactivo.

Si ves **NetworkError** o **No se pudo conectar con el servidor**:

- Confirma que entras por `http://localhost` o por GitHub Pages, no por `file://`.
- Revisa que el servicio en Render esté activo.
- El backend debe tener CORS habilitado para `https://enithv.github.io` y para tu puerto local.

---

## Módulos que aún usan almacenamiento local

Algunas pantallas de administración y catálogo guardan datos en `localStorage` como apoyo mientras se completa la integración total con el API (listas de servicios, reservas de prueba, servicio seleccionado para reservar). La sesión de usuario (`token` y `usuarioLogueado`) sí depende del backend tras un login correcto.

---

## Créditos y contacto

Proyecto académico / Generation Colombia — **Style Factory**.

Para incidencias del frontend, abre un issue en este repositorio. Para el API, usa el repositorio del backend.
