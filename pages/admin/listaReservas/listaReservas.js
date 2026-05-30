import { listarReservas, eliminarReserva } from '../../../assets/js/apiClient.js';

let reservasCache = [];
let idAEliminar = null;

function formatearFecha(fecha) {
    if (!fecha) return '—';
    const partes = String(fecha).split('-');
    if (partes.length === 3) {
        return partes[2] + '/' + partes[1] + '/' + partes[0];
    }
    return fecha;
}

function formatearHora(hora) {
    if (!hora) return '—';
    return String(hora).substring(0, 5);
}

function claseEstado(estado) {
    const valor = (estado || '').toUpperCase();
    if (valor === 'CONFIRMADA' || valor === 'PENDIENTE') return 'confirmada';
    if (valor === 'CANCELADA') return 'cancelada';
    return 'pendiente';
}

function etiquetaEstado(estado) {
    const valor = (estado || '').toUpperCase();
    if (valor === 'PENDIENTE') return 'Pendiente';
    if (valor === 'CONFIRMADA') return 'Confirmada';
    if (valor === 'CANCELADA') return 'Cancelada';
    return estado || '—';
}

function mostrarCargandoTabla() {
    const tbody = document.getElementById('tabla-reservas');
    if (tbody) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="text-center">Cargando reservas...</td></tr>';
    }
}

function mostrarErrorTabla(mensaje) {
    const tbody = document.getElementById('tabla-reservas');
    if (tbody) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="text-center">' + mensaje + '</td></tr>';
    }
}

export function renderizarTablaReservas() {
    const tbody = document.getElementById('tabla-reservas');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (reservasCache.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="text-center">No hay reservas registradas</td></tr>';
        return;
    }

    reservasCache.forEach(function (reserva) {
        const estadoClase = claseEstado(reserva.estado);
        tbody.innerHTML +=
            '<tr>' +
            '<td>#ID-' + String(reserva.id).padStart(2, '0') + '</td>' +
            '<td>' + (reserva.nombreUsuario || '—').toUpperCase() + '</td>' +
            '<td>' + (reserva.nombreEmpleado || '—') + '</td>' +
            '<td>' + (reserva.nombreServicio || '—') + '</td>' +
            '<td>' + formatearFecha(reserva.fecha) + '</td>' +
            '<td>' + formatearHora(reserva.hora) + '</td>' +
            '<td><span class="badge-estado ' + estadoClase + '">' + etiquetaEstado(reserva.estado) + '</span></td>' +
            '<td class="celda-acciones">' +
            '<button class="btn-accion btn-eliminar-reserva" data-id="' + reserva.id + '" title="Eliminar">' +
            '<i class="fa-solid fa-trash"></i></button>' +
            '</td>' +
            '</tr>';
    });
}

async function cargarReservas() {
    mostrarCargandoTabla();
    try {
        reservasCache = await listarReservas();
        renderizarTablaReservas();
    } catch (error) {
        console.error('Error cargando reservas:', error);
        const texto =
            typeof mensajeErrorConexion === 'function'
                ? mensajeErrorConexion(error)
                : error.message;
        mostrarErrorTabla('No se pudieron cargar las reservas: ' + texto);
    }
}

export function initListaReservas() {
    cargarReservas();

    document.addEventListener('click', function (e) {
        const btnEliminar = e.target.closest('.btn-eliminar-reserva');
        if (!btnEliminar) return;
        idAEliminar = btnEliminar.dataset.id;
        const modal = new bootstrap.Modal(document.getElementById('modalEliminarReserva'));
        modal.show();
    });

    const btnConfirmar = document.getElementById('btn-confirmar-eliminar-reserva');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async function () {
            if (!idAEliminar) return;

            btnConfirmar.disabled = true;
            try {
                await eliminarReserva(idAEliminar);
                const modal = bootstrap.Modal.getInstance(
                    document.getElementById('modalEliminarReserva')
                );
                modal.hide();
                idAEliminar = null;
                await cargarReservas();
            } catch (error) {
                console.error('Error eliminando reserva:', error);
                const texto =
                    typeof mensajeErrorConexion === 'function'
                        ? mensajeErrorConexion(error)
                        : error.message;
                alert('No se pudo eliminar la reserva: ' + texto);
            } finally {
                btnConfirmar.disabled = false;
            }
        });
    }
}
