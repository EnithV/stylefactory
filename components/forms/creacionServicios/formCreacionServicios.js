import {
    crearServicio,
    actualizarServicio,
} from '../../../assets/js/apiClient.js';
import {
    assetUrl,
    IMAGEN_SERVICIO_DEFAULT,
    normalizarUrlImagen,
} from '../../../assets/js/imageAssets.js';

const TIPOS_SERVICIO = [
    'Corte',
    'Color',
    'Tratamiento',
    'Barbería',
    'Peinado',
    'Estética',
    'General',
];

const PRESET_ARCHIVOS = [
    'corte-premium.png',
    'tinte-coloracion.png',
    'keratina.png',
    'barba-afeitado.png',
    'peinado-eventos.png',
    'mechas-reflejos.png',
    'tratamiento-capilar.png',
    'cepillado-brasileno.png',
    'maquillaje-profesional.png',
    'limpieza-facial.png',
];

function validar(valor) {
    return valor.trim() !== '';
}

function mostrarError(errorId, mensaje) {
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) errorSpan.textContent = mensaje;
}

function limpiarError(errorId) {
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) errorSpan.textContent = '';
}

function validarFormulario(nombre, descripcion, precio, duracionMinutos, tipoServicio) {
    let esValido = true;

    if (!validar(nombre)) {
        mostrarError('errorNombre', 'El nombre es obligatorio');
        esValido = false;
    } else limpiarError('errorNombre');

    if (!validar(descripcion)) {
        mostrarError('errorDescripcion', 'La descripcion es obligatoria');
        esValido = false;
    } else limpiarError('errorDescripcion');

    if (isNaN(Number(precio)) || Number(precio) <= 0) {
        mostrarError('errorPrecio', 'Introduzca un precio valido');
        esValido = false;
    } else limpiarError('errorPrecio');

    const duracion = Number(duracionMinutos);
    if (isNaN(duracion) || duracion < 15 || duracion > 480) {
        mostrarError('errorDuracion', 'La duración debe estar entre 15 y 480 minutos');
        esValido = false;
    } else limpiarError('errorDuracion');

    if (!validar(tipoServicio)) {
        mostrarError('errorTipo', 'Seleccione un tipo de servicio');
        esValido = false;
    } else limpiarError('errorTipo');

    return esValido;
}

function mostrarPreview(url) {
    const preview = document.getElementById('preview');
    if (!preview || !url) return;
    preview.src = url;
    preview.style.display = 'block';
}

function resolverImagenSeleccionada() {
    const urlManual = document.getElementById('imagenURL')?.value.trim() || '';
    const preset = document.getElementById('imagenPreset')?.value || '';

    if (urlManual) return normalizarUrlImagen(urlManual);
    if (preset) return assetUrl('servicios/' + preset);
    return IMAGEN_SERVICIO_DEFAULT;
}

function sincronizarPresetDesdeUrl(url) {
    const select = document.getElementById('imagenPreset');
    const inputUrl = document.getElementById('imagenURL');
    if (!select || !inputUrl) return;

    const normalizada = normalizarUrlImagen(url || '');
    const coincidencia = PRESET_ARCHIVOS.find(function (archivo) {
        return normalizada.indexOf(archivo) !== -1;
    });

    select.value = coincidencia || '';
    inputUrl.value = coincidencia ? '' : normalizada;
}

function resetFormulario() {
    document.getElementById('editId').value = '';
    document.querySelector('.btn-enviar').textContent = 'Crear Servicio';
    document.getElementById('formCreacionServicios').reset();
    const preset = document.getElementById('imagenPreset');
    const urlInput = document.getElementById('imagenURL');
    if (preset) preset.value = '';
    if (urlInput) urlInput.value = '';
    const preview = document.getElementById('preview');
    if (preview) {
        preview.removeAttribute('src');
        preview.style.display = 'none';
    }
}

async function notificar(mensaje, tipo) {
    if (typeof window.sfAlert === 'function') {
        await window.sfAlert(mensaje, tipo || 'info');
        return;
    }
    alert(mensaje);
}

export function initFormulario(onServicioGuardado) {
    const botonEnviar = document.querySelector('.btn-enviar');
    const selectTipo = document.getElementById('tipoServicio');
    const selectPreset = document.getElementById('imagenPreset');
    const inputUrl = document.getElementById('imagenURL');

    if (selectTipo && selectTipo.options.length <= 1) {
        TIPOS_SERVICIO.forEach(function (tipo) {
            const opcion = document.createElement('option');
            opcion.value = tipo;
            opcion.textContent = tipo;
            selectTipo.appendChild(opcion);
        });
    }

    function actualizarVistaImagen() {
        mostrarPreview(resolverImagenSeleccionada());
    }

    if (selectPreset) {
        selectPreset.addEventListener('change', function () {
            if (this.value && inputUrl) inputUrl.value = '';
            actualizarVistaImagen();
        });
    }

    if (inputUrl) {
        inputUrl.addEventListener('input', actualizarVistaImagen);
    }

    botonEnviar.addEventListener('click', async function (event) {
        event.preventDefault();

        const nombre = document.querySelector('#nombre').value;
        const descripcion = document.querySelector('#descripcion').value;
        const precio = document.querySelector('#precio').value;
        const duracionMinutos = document.querySelector('#duracionMinutos').value;
        const tipoServicio = document.querySelector('#tipoServicio').value;
        const statusEl = document.querySelector('input[name="status"]:checked');
        const status = statusEl ? statusEl.value : 'true';
        const editId = document.getElementById('editId').value;
        const esEdicion = editId !== '';
        const imagenActual = document.getElementById('imagenActual').value;

        const esValido = validarFormulario(
            nombre,
            descripcion,
            precio,
            duracionMinutos,
            tipoServicio
        );

        if (!esValido) {
            await notificar('El formulario está incorrecto. Revisa los campos marcados.', 'warning');
            return;
        }

        const imagenFinal = resolverImagenSeleccionada() || imagenActual || IMAGEN_SERVICIO_DEFAULT;

        const payload = {
            nombre,
            descripcion,
            precio,
            duracionMinutos: Number(duracionMinutos),
            tipoServicio,
            status,
            imagen: imagenFinal,
            urlImagen: imagenFinal,
        };

        const textoOriginal = botonEnviar.textContent;
        botonEnviar.disabled = true;
        botonEnviar.textContent = esEdicion ? 'Guardando...' : 'Creando...';

        try {
            if (esEdicion) {
                await actualizarServicio(editId, payload);
                await notificar('Servicio actualizado correctamente.', 'success');
            } else {
                await crearServicio(payload);
                await notificar('Servicio agregado correctamente.', 'success');
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
            if (modal) modal.hide();
            resetFormulario();
            if (onServicioGuardado) onServicioGuardado();
        } catch (error) {
            console.error('Error guardando servicio:', error);
            const texto =
                typeof mensajeErrorConexion === 'function'
                    ? mensajeErrorConexion(error)
                    : error.message;
            await notificar('No se pudo guardar el servicio: ' + texto, 'error');
        } finally {
            botonEnviar.disabled = false;
            botonEnviar.textContent = textoOriginal;
        }
    });
}

export function prepararEdicionServicio(servicio) {
    document.getElementById('nombre').value = servicio.nombre || '';
    document.getElementById('descripcion').value = servicio.descripcion || '';
    document.getElementById('precio').value = servicio.precio || '';
    document.getElementById('duracionMinutos').value = servicio.duracionMinutos ?? 60;
    document.getElementById('tipoServicio').value = servicio.tipo || 'General';
    document.getElementById('editId').value = servicio.id;
    document.getElementById('imagenActual').value = servicio.imagen || '';

    const activo = servicio.status === true || servicio.status === 'true';
    const radioActivo = document.getElementById('activo');
    const radioInactivo = document.getElementById('inactivo');
    if (radioActivo) radioActivo.checked = activo;
    if (radioInactivo) radioInactivo.checked = !activo;

    sincronizarPresetDesdeUrl(servicio.imagen || '');
    mostrarPreview(normalizarUrlImagen(servicio.imagen || IMAGEN_SERVICIO_DEFAULT));

    document.querySelector('.btn-enviar').textContent = 'Guardar Cambios';
}

export function resetFormularioServicio() {
    resetFormulario();
}
