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
 * Resalta el enlace del navbar que corresponde a la página actual.
 */
function marcarEnlaceNavbarActivo() {
    var enlaces = document.querySelectorAll('.navbar-nav .nav-link');
    var rutaActual = window.location.pathname.split('/').pop() || '';
    if (rutaActual === '' || rutaActual === '/') {
        rutaActual = 'index.html';
    }

    enlaces.forEach(function (enlace) {
        var href = enlace.getAttribute('href');
        if (!href) return;
        var rutaEnlace = href.split('/').pop().split('?')[0];
        if (rutaEnlace === rutaActual) {
            enlace.classList.add('active');
        } else {
            enlace.classList.remove('active');
        }
    });
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
