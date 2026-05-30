// Backend API desplegado en Render
const API_BASE = "https://stylefactoryapi.onrender.com";

/**
 * Frontend en GitHub Pages (repositorio EnithV/stylefactory).
 * Ruta base del sitio: /stylefactory/ en el dominio de GitHub Pages.
 */
const FRONTEND_BASE_URL = "https://enithv.github.io/stylefactory";
const GITHUB_PAGES_BASE_PATH = "/stylefactory";

/**
 * Prefijo del sitio según la URL actual (p. ej. /stylefactory en GitHub Pages, "" en local).
 */
function obtenerBaseAplicacion() {
    var ventana = window;
    try {
        if (window.parent && window.parent !== window) {
            ventana = window.parent;
        }
    } catch (e) {
        /* mismo origen esperado */
    }
    var path = ventana.location.pathname || "";
    var pagesIdx = path.indexOf("/pages/");
    if (pagesIdx >= 0) {
        return pagesIdx > 0 ? path.substring(0, pagesIdx) : "";
    }
    var componentsIdx = path.indexOf("/components/");
    if (componentsIdx > 0) {
        return path.substring(0, componentsIdx);
    }
    if (path.indexOf("github.io") !== -1 && GITHUB_PAGES_BASE_PATH) {
        return GITHUB_PAGES_BASE_PATH;
    }
    return "";
}

/**
 * Arma una ruta absoluta dentro del sitio: base + /pages/...
 */
function urlApp(rutaDesdeRaiz) {
    var base = obtenerBaseAplicacion();
    var ruta = rutaDesdeRaiz.charAt(0) === "/" ? rutaDesdeRaiz : "/" + rutaDesdeRaiz;
    return base + ruta;
}

/**
 * Saludo corto para el navbar (solo primer nombre, evita romper el layout).
 */
function saludoNavbar(nombre) {
    var limpio = (nombre || '').trim();
    if (!limpio) return 'Hola';
    return 'Hola, ' + limpio.split(/\s+/)[0];
}

/**
 * Normaliza el identificador de una página (sin .html, minúsculas).
 */
function normalizarSlugPagina(valor) {
    var slug = (valor || '').split('?')[0].split('#')[0].replace(/\/$/, '');
    slug = slug.split('/').filter(Boolean).pop() || 'index';
    if (slug.toLowerCase() === 'stylefactory') {
        slug = 'index';
    }
    return slug.replace(/\.html$/i, '').toLowerCase();
}

/**
 * Indica si un href del navbar corresponde a la URL actual.
 */
function enlaceNavbarEsPaginaActual(href) {
    if (!href) return false;

    var slugActual = normalizarSlugPagina(window.location.pathname);
    var slugEnlace = normalizarSlugPagina(href);
    if (slugActual === slugEnlace) {
        return true;
    }

    var pathActual = (window.location.pathname || '').toLowerCase().replace(/\/$/, '');
    var pathEnlace = href.split('?')[0].split('#')[0].toLowerCase().replace(/\.html$/, '');
    return pathActual === pathEnlace || pathActual.indexOf(pathEnlace) !== -1;
}

/**
 * Resalta el enlace del navbar que corresponde a la página actual.
 */
function marcarEnlaceNavbarActivo() {
    document.querySelectorAll('.navbar-nav .nav-link').forEach(function (enlace) {
        var esActivo = enlaceNavbarEsPaginaActual(enlace.getAttribute('href'));
        enlace.classList.toggle('active', esActivo);
        if (esActivo) {
            enlace.setAttribute('aria-current', 'page');
        } else {
            enlace.removeAttribute('aria-current');
        }
    });
}

/**
 * Muestra u oculta enlaces del navbar según la sesión (Mis reservas, Admin).
 */
function actualizarEnlacesNavbarSesion() {
    var misReservas = document.getElementById('mis-reservas-link');
    var adminLink = document.getElementById('admin-link');
    var raw = localStorage.getItem('usuarioLogueado');

    if (!raw) {
        if (misReservas) misReservas.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        return;
    }

    try {
        var usuario = JSON.parse(raw);
        if (misReservas) misReservas.style.display = '';
        if (adminLink) {
            adminLink.style.display =
                (usuario.rol || '').toUpperCase() === 'ADMIN' ? '' : 'none';
        }
    } catch (e) {
        if (misReservas) misReservas.style.display = 'none';
    }
}

/**
 * Ejecuta la lógica común tras inyectar el HTML del navbar.
 */
function inicializarNavbarCargado() {
    if (typeof actualizarNavbar === 'function') {
        actualizarNavbar();
    } else {
        actualizarEnlacesNavbarSesion();
    }
    marcarEnlaceNavbarActivo();
    var btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion && typeof cerrarSesion === 'function') {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
}

/**
 * Mensaje claro cuando fetch falla por red o CORS (p. ej. "NetworkError", "Failed to fetch").
 */
function mensajeErrorConexion(error) {
    if (!error) {
        return "No se pudo conectar con el servidor. Intente más tarde.";
    }
    var texto = (error.message || "").toLowerCase();
    if (
        error.name === "TypeError" ||
        texto.indexOf("networkerror") !== -1 ||
        texto.indexOf("failed to fetch") !== -1 ||
        texto.indexOf("network request failed") !== -1
    ) {
        return (
            "No se pudo conectar con el servidor. Use el sitio publicado en " +
            FRONTEND_BASE_URL +
            " o Live Server (http://localhost). Si el problema continúa, " +
            "el backend en Render puede estar iniciando o falta actualizar CORS en el API."
        );
    }
    return error.message || "No se pudo conectar con el servidor. Intente más tarde.";
}
