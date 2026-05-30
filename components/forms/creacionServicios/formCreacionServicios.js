import {
    crearServicio,
    actualizarServicio,
} from '../../../assets/js/apiClient.js';

const TIPOS_SERVICIO = [
    'Corte',
    'Color',
    'Tratamiento',
    'Barbería',
    'Peinado',
    'Estética',
    'General',
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

function resetFormulario() {
    document.getElementById('editId').value = '';
    document.querySelector('.btn-enviar').textContent = 'Crear Servicio';
    document.getElementById('formCreacionServicios').reset();
    const preview = document.getElementById('preview');
    if (preview) preview.style.display = 'none';
}

export function initFormulario(onServicioGuardado) {
    let imagenURL = '';

    const botonEnviar = document.querySelector('.btn-enviar');
    const inputImagen = document.getElementById('inputImagen');
    const preview = document.getElementById('preview');
    const selectTipo = document.getElementById('tipoServicio');

    if (selectTipo && selectTipo.options.length <= 1) {
        TIPOS_SERVICIO.forEach(function (tipo) {
            const opcion = document.createElement('option');
            opcion.value = tipo;
            opcion.textContent = tipo;
            selectTipo.appendChild(opcion);
        });
    }

    inputImagen.addEventListener('change', async function () {
        const archivo = this.files[0];
        if (!archivo) return;

        const formData = new FormData();
        formData.append('file', archivo);
        formData.append('upload_preset', 'servicios_app');

        try {
            const respuesta = await fetch(
                'https://api.cloudinary.com/v1_1/dxp3axcje/image/upload',
                { method: 'POST', body: formData }
            );
            const data = await respuesta.json();
            imagenURL = data.secure_url;
            preview.src = imagenURL;
            preview.style.display = 'block';
        } catch (error) {
            console.error('Error subiendo imagen:', error);
        }
    });

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
            alert('El formulario esta incorrecto');
            return;
        }

        const payload = {
            nombre,
            descripcion,
            precio,
            duracionMinutos: Number(duracionMinutos),
            tipoServicio,
            status,
            imagen: imagenURL || imagenActual || undefined,
        };

        const textoOriginal = botonEnviar.textContent;
        botonEnviar.disabled = true;
        botonEnviar.textContent = esEdicion ? 'Guardando...' : 'Creando...';

        try {
            if (esEdicion) {
                await actualizarServicio(editId, payload);
                alert('Servicio actualizado');
            } else {
                await crearServicio(payload);
                alert('Servicio agregado');
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
            if (modal) modal.hide();
            resetFormulario();
            imagenURL = '';
            if (onServicioGuardado) onServicioGuardado();
        } catch (error) {
            console.error('Error guardando servicio:', error);
            const texto =
                typeof mensajeErrorConexion === 'function'
                    ? mensajeErrorConexion(error)
                    : error.message;
            alert('No se pudo guardar el servicio: ' + texto);
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

    const preview = document.getElementById('preview');
    if (preview && servicio.imagen) {
        preview.src = servicio.imagen;
        preview.style.display = 'block';
    }

    document.querySelector('.btn-enviar').textContent = 'Guardar Cambios';
}

export function resetFormularioServicio() {
    resetFormulario();
}
