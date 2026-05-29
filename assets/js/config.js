// Backend API desplegado en Render
const API_BASE = "https://stylefactoryapi.onrender.com";

/**
 * Frontend en GitHub Pages (repositorio EnithV/stylefactory).
 * Ruta base del sitio: /stylefactory/ en el dominio de GitHub Pages.
 */
const FRONTEND_BASE_URL = "https://enithv.github.io/stylefactory";
const GITHUB_PAGES_BASE_PATH = "/stylefactory";

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
