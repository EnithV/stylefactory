import {
    listarServicios,
    eliminarServicio,
} from '../../../assets/js/apiClient.js';
import {
    initFormulario,
    prepararEdicionServicio,
    resetFormularioServicio,
} from '../../../components/forms/creacionServicios/formCreacionServicios.js';

let serviciosCache = [];
let idAEliminar = null;

function mostrarCargandoTabla() {
    const tbody = document.getElementById('tabla-servicios');
    if (tbody) {
        tbody.innerHTML =
            '<tr><td colspan="6" class="text-center">Cargando servicios...</td></tr>';
    }
}

function mostrarErrorTabla(mensaje) {
    const tbody = document.getElementById('tabla-servicios');
    if (tbody) {
        tbody.innerHTML =
            '<tr><td colspan="6" class="text-center">' + mensaje + '</td></tr>';
    }
}

export function renderizarTabla() {
    const tbody = document.getElementById('tabla-servicios');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (serviciosCache.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="6" class="text-center">No hay servicios registrados</td></tr>';
        return;
    }

    serviciosCache.forEach(function (servicio) {
        const estadoClase =
            servicio.status === true || servicio.status === 'true'
                ? 'confirmada'
                : 'cancelada';
        const estadoTexto =
            servicio.status === true || servicio.status === 'true'
                ? 'Activo'
                : 'Inactivo';
        const duracion = servicio.duracionMinutos ?? 60;

        tbody.innerHTML +=
            '<tr>' +
            '<td>#ID-' + servicio.id + '</td>' +
            '<td>' + servicio.nombre + '</td>' +
            '<td><div class="text-truncate">' + servicio.descripcion + '</div></td>' +
            '<td>' + duracion + ' min</td>' +
            '<td><span class="badge-estado ' + estadoClase + '">' + estadoTexto + '</span></td>' +
            '<td class="celda-acciones">' +
            '<button class="btn-accion btn-editar" data-id="' + servicio.id + '" title="Editar">' +
            '<i class="fa-solid fa-pen"></i></button>' +
            '<button class="btn-accion btn-eliminar" data-id="' + servicio.id + '" title="Eliminar">' +
            '<i class="fa-solid fa-trash"></i></button>' +
            '</td>' +
            '</tr>';
    });
}

async function cargarServicios() {
    mostrarCargandoTabla();
    try {
        serviciosCache = await listarServicios();
        renderizarTabla();
    } catch (error) {
        console.error('Error cargando servicios:', error);
        const texto =
            typeof mensajeErrorConexion === 'function'
                ? mensajeErrorConexion(error)
                : error.message;
        mostrarErrorTabla('No se pudieron cargar los servicios: ' + texto);
    }
}

export function initListaServicios() {
    fetch('../../../components/forms/creacionServicios/formCreacionServicios.html')
        .then(function (res) { return res.text(); })
        .then(function (html) {
            document.getElementById('form-services').innerHTML = html;
            initFormulario(cargarServicios);

            const btnAgregar = document.querySelector('.btn-agregar-servicio');
            if (btnAgregar) {
                btnAgregar.addEventListener('click', resetFormularioServicio);
            }
        })
        .catch(function (err) { console.error('Error cargando el formulario:', err); });

    cargarServicios();

    const modalElement = document.getElementById('modalEliminar');
    if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', function () {
            if (document.activeElement) document.activeElement.blur();
            document.body.focus();
        });
    }

    document.addEventListener('click', function (e) {
        const btnEliminar = e.target.closest('.btn-eliminar');
        if (btnEliminar) {
            idAEliminar = btnEliminar.dataset.id;
            const modal = new bootstrap.Modal(document.getElementById('modalEliminar'));
            modal.show();
            return;
        }

        const btnEditar = e.target.closest('.btn-editar');
        if (btnEditar) {
            const id = Number(btnEditar.dataset.id);
            const servicio = serviciosCache.find(function (s) { return s.id === id; });
            if (!servicio) return;

            prepararEdicionServicio(servicio);
            const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
            modal.show();
        }
    });

    const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async function () {
            if (!idAEliminar) return;

            btnConfirmar.disabled = true;
            try {
                await eliminarServicio(idAEliminar);
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminar'));
                modal.hide();
                idAEliminar = null;
                await cargarServicios();
            } catch (error) {
                console.error('Error eliminando servicio:', error);
                const texto =
                    typeof mensajeErrorConexion === 'function'
                        ? mensajeErrorConexion(error)
                        : error.message;
                alert('No se pudo eliminar el servicio: ' + texto);
            } finally {
                btnConfirmar.disabled = false;
            }
        });
    }
}
