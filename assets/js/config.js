// URL base del backend desplegado en Render
const API_BASE = "https://stylefactoryapi.onrender.com";

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
            "No se pudo conectar con el servidor. Abra el sitio con un servidor local " +
            "(Live Server, http://localhost), no como archivo. Si el problema continúa, " +
            "el backend en Render puede estar iniciando o debe actualizarse la configuración CORS."
        );
    }
    return error.message || "No se pudo conectar con el servidor. Intente más tarde.";
}