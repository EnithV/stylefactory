// Backend API desplegado en Render
const API_BASE = "https://stylefactoryapi.onrender.com";
if (typeof window !== "undefined") {
    window.API_BASE = API_BASE;
}

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
    if (GITHUB_PAGES_BASE_PATH && path.indexOf(GITHUB_PAGES_BASE_PATH) === 0) {
        return GITHUB_PAGES_BASE_PATH;
    }
    if (ventana.location.hostname.indexOf("github.io") !== -1 && GITHUB_PAGES_BASE_PATH) {
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
 * Ruta absoluta de una imagen bajo assets/images (compatible con GitHub Pages).
 */
function urlAsset(rutaRelativa) {
    var ruta = rutaRelativa || "";
    if (ruta.indexOf("/assets/images/") !== 0) {
        ruta = "/assets/images/" + ruta.replace(/^\/+/, "");
    }
    return urlApp(ruta);
}

/**
 * Corrige src de imágenes locales tras inyectar componentes HTML.
 */
function aplicarRutasImagenes(root) {
    var scope = root || document;
    scope.querySelectorAll('img[src^="/assets/images/"]').forEach(function (img) {
        img.src = urlApp(img.getAttribute("src"));
    });
}

/** Migra URLs de Cloudinary o rutas locales a la URL pública del sitio. */
function resolverUrlImagen(url) {
    if (!url) {
        return urlAsset("servicios/corte-premium.png");
    }
    if (url.indexOf("http") === 0 && url.indexOf("cloudinary.com") === -1) {
        return url;
    }
    var legacy = {
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336588/Sty1_wj2bmn.png": "empleados/sty1.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336622/Sty2_z1upkm.png": "empleados/sty2.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336764/Sty3_hk8sdy.png": "empleados/sty3.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336831/Sty4_yhgjef.png": "empleados/sty4.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1777336977/Sty5_wnafrw.png": "empleados/sty5.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1777337017/Sty6_vgztvb.png": "empleados/sty6.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957776/cortePremium_engl79.png": "servicios/corte-premium.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957782/tinteColoracion_xlsf5v.png": "servicios/tinte-coloracion.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957777/keratina_bjqvof.png": "servicios/keratina.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957775/barbaAfeitado_fcacso.png": "servicios/barba-afeitado.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957782/peinadoEventos_bk9cyr.png": "servicios/peinado-eventos.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957780/mechasReflejos_p5hod7.png": "servicios/mechas-reflejos.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957783/tratamientoCapilar_mqkb13.png": "servicios/tratamiento-capilar.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957775/cepilladoBrasile%C3%B1o_ela99r.png": "servicios/cepillado-brasileno.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957779/maquillajeProfesional_h9vo1k.png": "servicios/maquillaje-profesional.png",
        "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957778/limpiezaFacial_fmvrnn.png": "servicios/limpieza-facial.png"
    };
    if (legacy[url]) {
        return urlAsset(legacy[url]);
    }
    if (url.indexOf("/assets/images/") === 0) {
        return urlApp(url);
    }
    return url;
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
function configurarEnlacesPerfilNavbar() {
    var perfil = urlApp('/pages/perfilUsuario/perfilUsuario.html');
    var perfilReservas = perfil + '#reservas';
    var linkPerfil = document.getElementById('userNameLink');
    var linkReservas = document.querySelector('#mis-reservas-link a');

    if (linkPerfil) linkPerfil.href = perfil;
    if (linkReservas) linkReservas.href = perfilReservas;
}

function inicializarNavbarCargado() {
    if (typeof actualizarNavbar === 'function') {
        actualizarNavbar();
    } else {
        actualizarEnlacesNavbarSesion();
    }
    configurarEnlacesPerfilNavbar();
    if (typeof aplicarRutasImagenes === 'function') {
        aplicarRutasImagenes(document.getElementById('header'));
    }
    marcarEnlaceNavbarActivo();
    var btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion && typeof cerrarSesion === 'function') {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
}

/**
 * GET público al API (sin JWT): catálogo de empleados, horarios, servicios.
 */
async function fetchApiPublic(ruta) {
    var respuesta = await fetch(API_BASE + ruta, {
        headers: { Accept: 'application/json' },
    });
    if (!respuesta.ok) {
        throw new Error('Error en la solicitud (' + respuesta.status + ')');
    }
    return respuesta.json();
}

/**
 * Elimina token y datos de usuario del almacenamiento local (cierre de sesión).
 */
function limpiarSesionLocal() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('token');
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
