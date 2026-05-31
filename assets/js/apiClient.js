const API_URL =
    (typeof globalThis !== "undefined" && globalThis.API_BASE) ||
    "https://stylefactoryapi.onrender.com";

const IMAGEN_SERVICIO_DEFAULT =
    "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957776/cortePremium_engl79.png";

export function obtenerToken() {
    return localStorage.getItem("token");
}

export function headersAuth(conContentType) {
    const headers = { Authorization: "Bearer " + obtenerToken() };
    if (conContentType !== false) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}

export function normalizarServicioDesdeApi(dto) {
    return {
        id: dto.id,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        imagen: dto.urlImagen || IMAGEN_SERVICIO_DEFAULT,
        status: dto.estado,
        precio: dto.precio,
        tipo: dto.tipoServicio || "",
        duracionMinutos: dto.duracionMinutos ?? 60,
    };
}

export function servicioParaApi(data) {
    return {
        nombre: data.nombre,
        descripcion: data.descripcion,
        urlImagen: data.urlImagen || data.imagen || IMAGEN_SERVICIO_DEFAULT,
        estado:
            data.estado !== undefined
                ? !!data.estado
                : data.status === true || data.status === "true",
        precio: Number(data.precio),
        tipoServicio: (data.tipoServicio || data.tipo || "General").trim(),
        duracionMinutos: Number(data.duracionMinutos),
    };
}

async function fetchJson(url, options) {
    const respuesta = await fetch(url, options);
    if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(function () {
            return null;
        });
        throw new Error(
            (errorData &&
                (errorData.message || errorData.mensaje || errorData.error)) ||
                "Error en la solicitud (" + respuesta.status + ")"
        );
    }
    if (respuesta.status === 204) {
        return null;
    }
    return respuesta.json();
}

export async function listarCatalogoEmpleados() {
    const data = await fetchJson(API_URL + "/empleados/catalogo");
    return data.map(function (dto) {
        return {
            id: dto.id,
            empleadoId: dto.id,
            nombre: dto.nombre || "Estilista",
            especialidad: dto.especialidad || "",
            foto: dto.url || IMAGEN_SERVICIO_DEFAULT,
            estado: dto.estado,
        };
    });
}

export async function listarHorarios() {
    return fetchJson(API_URL + "/horarios");
}

export async function listarServicios() {
    const data = await fetchJson(API_URL + "/servicios");
    return data.map(normalizarServicioDesdeApi);
}

export async function crearServicio(payload) {
    const data = await fetchJson(API_URL + "/servicios", {
        method: "POST",
        headers: headersAuth(),
        body: JSON.stringify(servicioParaApi(payload)),
    });
    return normalizarServicioDesdeApi(data);
}

export async function actualizarServicio(id, payload) {
    const data = await fetchJson(API_URL + "/servicios/" + id, {
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify(servicioParaApi(payload)),
    });
    return normalizarServicioDesdeApi(data);
}

export async function eliminarServicio(id) {
    await fetchJson(API_URL + "/servicios/" + id, {
        method: "DELETE",
        headers: headersAuth(false),
    });
}

export async function listarReservas() {
    return fetchJson(API_URL + "/reservas", {
        headers: headersAuth(false),
    });
}

export async function eliminarReserva(id) {
    await fetchJson(API_URL + "/reservas/" + id, {
        method: "DELETE",
        headers: headersAuth(false),
    });
}

export async function actualizarEstadoReserva(id, estado) {
    return fetchJson(API_URL + "/reservas/" + id + "/estado", {
        method: "PATCH",
        headers: headersAuth(),
        body: JSON.stringify({ estado: estado }),
    });
}

export const ESTADOS_RESERVA = [
    "PENDIENTE",
    "CONFIRMADA",
    "CANCELADA",
    "COMPLETADA",
];
