const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const DEFAULT_EMP_IMG = 'https://enithv.github.io/stylefactory/assets/images/empleados/sty1.png';

let estado = {
    modo: 'crear',
    paso: 1,
    empleadoId: null,
    usuarioId: null,
    imagenURL: '',
    horariosPendientes: {},
};

let empleadosActuales = [];
let mapaNombres = {};
let _eliminando = { empleadoId: null, usuarioId: null };

function apiBase() {
    return window.API_BASE || 'https://stylefactoryapi.onrender.com';
}

function getToken() {
    return localStorage.getItem('token') || '';
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + getToken(),
        Accept: 'application/json',
    };
}

function resolverImagen(url) {
    if (!url) return DEFAULT_EMP_IMG;
    if (typeof resolverUrlImagen === 'function') return resolverUrlImagen(url);
    return url;
}

function imagenDesdePreset() {
    var preset = document.getElementById('empImagenPreset')?.value || '';
    var urlManual = document.getElementById('empImagenURL')?.value.trim() || '';
    if (urlManual) return urlManual;
    if (preset) {
        return typeof urlAsset === 'function'
            ? urlAsset('empleados/' + preset)
            : DEFAULT_EMP_IMG.replace('sty1.png', preset);
    }
    return DEFAULT_EMP_IMG;
}

export async function initEmpleados() {
    generarCheckboxesHoras();
    initFechaMinima();
    initPresetImagen();
    try {
        await cargarMapaNombres();
        await cargarEmpleados();
    } catch (err) {
        console.error('Error cargando empleados:', err);
        var tbody = document.getElementById('tabla-empleados');
        if (tbody) {
            tbody.innerHTML =
                '<tr><td colspan="5" class="text-center py-3 text-danger">Error al cargar empleados.</td></tr>';
        }
    }
    initBtnNuevoEmpleado();
    initModalReset();
    initModalEliminar();
}

async function cargarMapaNombres() {
    mapaNombres = {};
    try {
        var resCat = await fetch(apiBase() + '/empleados/catalogo');
        if (resCat.ok) {
            var catalogo = await resCat.json();
            catalogo.forEach(function (e) {
                mapaNombres[e.id] = e.nombre;
            });
        }
    } catch (e) { /* noop */ }

    try {
        var resUsu = await fetch(apiBase() + '/usuarios', { headers: authHeaders() });
        if (resUsu.ok) {
            var usuarios = await resUsu.json();
            usuarios.forEach(function (u) {
                mapaNombres['u' + u.id] = u.nombre;
            });
        }
    } catch (e) { /* noop */ }
}

function nombreEmpleado(emp) {
    return (
        mapaNombres[emp.id] ||
        mapaNombres['u' + (emp.usuario_id || emp.usuarioId)] ||
        emp.nombre ||
        'Sin nombre'
    );
}

async function cargarEmpleados() {
    var tbody = document.getElementById('tabla-empleados');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3 text-muted">Cargando...</td></tr>';

    try {
        var res = await fetch(apiBase() + '/empleados', { headers: authHeaders() });
        if (!res.ok) throw new Error('GET /empleados → ' + res.status);
        var data = await res.json();
        var lista = Array.isArray(data) ? data : [];

        empleadosActuales = lista
            .filter(function (e) { return e.estado !== false; })
            .map(function (e) {
                return {
                    id: e.id,
                    usuarioId: e.usuario_id || e.usuarioId,
                    nombre: nombreEmpleado(e),
                    especialidad: e.especialidad || '',
                    urlImagen: resolverImagen(e.url || e.urlImagen),
                };
            });

        renderTablaEmpleados(empleadosActuales);
    } catch (err) {
        console.error(err);
        tbody.innerHTML =
            '<tr><td colspan="5" class="text-center py-3 text-danger">No se pudieron cargar los empleados.</td></tr>';
    }
}

function renderTablaEmpleados(empleados) {
    var tbody = document.getElementById('tabla-empleados');
    if (!tbody) return;

    if (!empleados.length) {
        tbody.innerHTML =
            '<tr><td colspan="5" class="text-center py-4 text-muted">No hay empleados registrados.</td></tr>';
        return;
    }

    tbody.innerHTML = empleados
        .map(function (emp, i) {
            var foto = emp.urlImagen
                ? '<img src="' + emp.urlImagen + '" class="emp-avatar" alt="' + emp.nombre + '">'
                : '<div class="emp-avatar-placeholder"><i class="fa-regular fa-circle-user"></i></div>';
            return (
                '<tr>' +
                '<td>#ID-' + (emp.id || i + 1) + '</td>' +
                '<td>' + emp.nombre + '</td>' +
                '<td>' + (emp.especialidad || '—') + '</td>' +
                '<td>' + foto + '</td>' +
                '<td class="celda-acciones">' +
                '<button class="btn-accion btn-ver-horario" data-id="' + emp.id + '" data-nombre="' + emp.nombre + '" title="Gestionar horarios"><i class="fa-regular fa-calendar"></i></button>' +
                '<button class="btn-accion btn-eliminar-emp" data-id="' + emp.id + '" data-index="' + i + '" title="Eliminar"><i class="fa-solid fa-trash"></i></button>' +
                '</td></tr>'
            );
        })
        .join('');

    tbody.querySelectorAll('.btn-ver-horario').forEach(function (btn) {
        btn.addEventListener('click', function () {
            abrirModoHorarios(btn.dataset.id, btn.dataset.nombre);
        });
    });
    tbody.querySelectorAll('.btn-eliminar-emp').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var emp = empleadosActuales[+btn.dataset.index];
            _eliminando = {
                empleadoId: emp?.id || btn.dataset.id,
                usuarioId: emp?.usuarioId || null,
            };
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarEmp')).show();
        });
    });
}

function initBtnNuevoEmpleado() {
    document.getElementById('btnNuevoEmpleado')?.addEventListener('click', abrirModoCrear);
}

function initPresetImagen() {
    document.getElementById('empImagenPreset')?.addEventListener('change', function () {
        var url = imagenDesdePreset();
        aplicarImagenPreview(url);
        document.getElementById('empImagenURL').value = url;
    });
    document.getElementById('empImagenURL')?.addEventListener('input', function () {
        var url = this.value.trim();
        if (url) aplicarImagenPreview(resolverImagen(url));
    });
    document.getElementById('empUsuarioId')?.addEventListener('change', function () {
        var texto = this.selectedOptions[0]?.text || '';
        var nombre = texto.split('—')[0]?.trim() || '';
        document.getElementById('empNombre').value = nombre;
    });
}

async function abrirModoCrear() {
    resetEstado();
    resetFormularioDatos();
    mostrarCampoUsuario(true);
    await cargarSelectUsuarios();
    mostrarPaso(1);
    new bootstrap.Modal(document.getElementById('modalEmpleado')).show();
}

function mostrarCampoUsuario(visible) {
    var campo = document.getElementById('campoUsuarioId');
    if (campo) campo.style.display = visible ? 'block' : 'none';
}

async function cargarSelectUsuarios() {
    var select = document.getElementById('empUsuarioId');
    if (!select) return;
    select.innerHTML = '<option value="">Cargando usuarios...</option>';

    try {
        var res = await fetch(apiBase() + '/usuarios', { headers: authHeaders() });
        if (!res.ok) throw new Error('GET /usuarios → ' + res.status);
        var usuarios = await res.json();
        if (!usuarios.length) {
            select.innerHTML = '<option value="">No hay usuarios disponibles</option>';
            return;
        }
        select.innerHTML =
            '<option value="">— Selecciona un usuario —</option>' +
            usuarios
                .map(function (u) {
                    return '<option value="' + u.id + '">' + u.nombre + ' — ' + u.correo + '</option>';
                })
                .join('');
    } catch (err) {
        select.innerHTML = '<option value="">Error al cargar usuarios</option>';
    }
}

async function abrirModoHorarios(empleadoId, nombre) {
    resetEstado();
    estado.modo = 'horarios';
    estado.empleadoId = empleadoId;
    document.getElementById('tituloModalEmp').textContent = 'Horarios de ' + nombre;

    var emp = empleadosActuales.find(function (e) {
        return String(e.id) === String(empleadoId);
    });
    actualizarCabeceraPaso2(emp?.nombre || nombre, emp?.especialidad || '', emp?.urlImagen || '');
    mostrarPaso(2);
    await cargarHorariosExistentes(empleadoId);
    new bootstrap.Modal(document.getElementById('modalEmpleado')).show();
}

function mostrarPaso(num) {
    estado.paso = num;
    document.getElementById('paso1').style.display = num === 1 ? 'block' : 'none';
    document.getElementById('paso2').style.display = num === 2 ? 'block' : 'none';
    document.getElementById('indPaso1').classList.toggle('activo', num === 1);
    document.getElementById('indPaso2').classList.toggle('activo', num === 2);
    renderFooter();
    if (num === 2) {
        rebindBtnAnadir();
        if (estado.modo === 'crear') renderHorariosPendientes();
    }
}

function renderFooter() {
    var footer = document.getElementById('empModalFooter');
    if (!footer) return;

    if (estado.paso === 1) {
        footer.innerHTML =
            '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>' +
            '<button type="button" class="btn btn-emp-primary" id="btnSiguiente">Siguiente: Horarios <i class="fa-solid fa-arrow-right ms-1"></i></button>';
        document.getElementById('btnSiguiente').addEventListener('click', validarYSeguir);
        return;
    }

    if (estado.modo === 'crear') {
        footer.innerHTML =
            '<button type="button" class="btn btn-secondary" id="btnAtras"><i class="fa-solid fa-arrow-left me-1"></i> Atrás</button>' +
            '<button type="button" class="btn btn-emp-primary" id="btnCrearEmpleado"><i class="fa-solid fa-user-plus me-1"></i> Crear empleado</button>';
        document.getElementById('btnAtras').addEventListener('click', function () { mostrarPaso(1); });
        document.getElementById('btnCrearEmpleado').addEventListener('click', crearEmpleadoConHorarios);
    } else {
        footer.innerHTML = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>';
    }
}

function aplicarImagenPreview(url) {
    if (!url) return;
    estado.imagenURL = url;
    document.getElementById('empPreview').src = url;
    document.getElementById('empPreview').style.display = 'block';
    document.getElementById('empAvatarIcon').style.display = 'none';
}

function initModalReset() {
    document.getElementById('modalEmpleado')?.addEventListener('hidden.bs.modal', function () {
        resetEstado();
        resetFormularioDatos();
    });
}

function validarFormularioDatos() {
    var especialidad = document.getElementById('empEspecialidad').value.trim();
    var usuarioId = document.getElementById('empUsuarioId')?.value || '';
    document.getElementById('errEmpEspecialidad').textContent = especialidad ? '' : 'La especialidad es obligatoria.';
    if (estado.modo === 'crear') {
        document.getElementById('errEmpUsuarioId').textContent = usuarioId ? '' : 'Selecciona un usuario.';
        return !!(especialidad && usuarioId);
    }
    return !!especialidad;
}

function validarYSeguir() {
    if (!validarFormularioDatos()) return;
    estado.imagenURL = imagenDesdePreset();
    actualizarCabeceraPaso2(
        document.getElementById('empNombre').value.trim() || 'Nuevo empleado',
        document.getElementById('empEspecialidad').value.trim(),
        estado.imagenURL
    );
    mostrarPaso(2);
}

function generarCheckboxesHoras() {
    var contenedor = document.getElementById('horasCheckboxes');
    if (!contenedor) return;
    contenedor.innerHTML = HORAS.map(function (h) {
        return '<label class="hora-checkbox"><input type="checkbox" class="hora-input" value="' + h + '"> ' + h + '</label>';
    }).join('');
}

function initFechaMinima() {
    var input = document.getElementById('horarioFecha');
    if (input) input.min = new Date().toISOString().split('T')[0];
}

function actualizarCabeceraPaso2(nombre, especialidad, urlImagen) {
    document.getElementById('paso2Nombre').textContent = nombre;
    document.getElementById('paso2Especialidad').textContent = especialidad;
    var avatar = document.getElementById('paso2Avatar');
    var ph = document.getElementById('paso2AvatarPh');
    if (urlImagen) {
        avatar.src = urlImagen;
        avatar.style.display = 'inline-block';
        ph.style.display = 'none';
    } else {
        avatar.style.display = 'none';
        ph.style.display = 'flex';
    }
}

function rebindBtnAnadir() {
    var btn = document.getElementById('btnAnadirFecha');
    if (!btn) return;
    var nuevo = btn.cloneNode(true);
    btn.replaceWith(nuevo);
    nuevo.addEventListener('click', estado.modo === 'crear' ? anadirFechaPendiente : anadirFechaAPI);
}

function anadirFechaPendiente() {
    var fecha = document.getElementById('horarioFecha').value;
    var horas = Array.from(document.querySelectorAll('.hora-input:checked')).map(function (cb) { return cb.value; });
    if (!fecha) { sfAlert('Selecciona una fecha.', 'warning'); return; }
    if (!horas.length) { sfAlert('Selecciona al menos una hora.', 'warning'); return; }
    var prev = estado.horariosPendientes[fecha] || [];
    estado.horariosPendientes[fecha] = Array.from(new Set(prev.concat(horas))).sort();
    document.getElementById('horarioFecha').value = '';
    document.querySelectorAll('.hora-input').forEach(function (cb) { cb.checked = false; });
    renderHorariosPendientes();
}

function renderHorariosPendientes() {
    var lista = document.getElementById('listaHorarios');
    var entradas = Object.entries(estado.horariosPendientes).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    if (!entradas.length) {
        lista.innerHTML = '<div class="horarios-vacio"><i class="fa-regular fa-calendar-xmark fa-2x mb-2"></i><p class="mb-0 small">Aún no has agregado horarios.</p></div>';
        return;
    }
    lista.innerHTML = entradas
        .map(function (entry) {
            var fecha = entry[0];
            var horas = entry[1];
            var partes = fecha.split('-');
            var slots = horas
                .map(function (h) {
                    return '<span class="hora-badge">' + h + '<button class="btn-quitar-hora" data-fecha="' + fecha + '" data-hora="' + h + '"><i class="fa-solid fa-xmark"></i></button></span>';
                })
                .join('');
            return '<div class="horario-fecha-grupo"><span class="fecha-label">' + partes[2] + '/' + partes[1] + '/' + partes[0] + '</span><div class="slots-wrap">' + slots + '</div></div>';
        })
        .join('');

    lista.querySelectorAll('.btn-quitar-hora').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var fecha = btn.dataset.fecha;
            var hora = btn.dataset.hora;
            estado.horariosPendientes[fecha] = estado.horariosPendientes[fecha].filter(function (h) { return h !== hora; });
            if (!estado.horariosPendientes[fecha].length) delete estado.horariosPendientes[fecha];
            renderHorariosPendientes();
        });
    });
}

async function cargarHorariosExistentes(empleadoId) {
    var lista = document.getElementById('listaHorarios');
    if (!lista) return;
    lista.innerHTML = '<p class="text-muted small">Cargando...</p>';
    try {
        var res = await fetch(apiBase() + '/horarios', { headers: authHeaders() });
        if (!res.ok) throw new Error(String(res.status));
        var data = await res.json();
        var fechas = {};
        (Array.isArray(data) ? data : [])
            .filter(function (h) { return String(h.empleadoId) === String(empleadoId); })
            .forEach(function (h) {
                var raw = h.fechaHora || '';
                if (!raw) return;
                var partes = String(raw).split('T');
                var fecha = partes[0];
                var hora = (partes[1] || '').substring(0, 5);
                if (!fechas[fecha]) fechas[fecha] = [];
                fechas[fecha].push(hora);
            });
        renderHorariosExistentes(fechas);
    } catch (err) {
        lista.innerHTML = '<p class="text-danger small">No se pudieron cargar los horarios.</p>';
    }
}

function renderHorariosExistentes(fechas) {
    var lista = document.getElementById('listaHorarios');
    var entradas = Object.entries(fechas).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    if (!entradas.length) {
        lista.innerHTML = '<div class="horarios-vacio"><i class="fa-regular fa-calendar-xmark fa-2x mb-2"></i><p class="mb-0 small">Sin horarios asignados aún.</p></div>';
        return;
    }
    lista.innerHTML = entradas
        .map(function (entry) {
            var fecha = entry[0];
            var horas = entry[1];
            var partes = fecha.split('-');
            var slots = horas.map(function (h) { return '<span class="hora-badge">' + h + '</span>'; }).join('');
            return '<div class="horario-fecha-grupo"><span class="fecha-label">' + partes[2] + '/' + partes[1] + '/' + partes[0] + '</span><div class="slots-wrap">' + slots + '</div></div>';
        })
        .join('');
}

async function anadirFechaAPI() {
    var fecha = document.getElementById('horarioFecha').value;
    var horas = Array.from(document.querySelectorAll('.hora-input:checked')).map(function (cb) { return cb.value; });
    if (!fecha) { sfAlert('Selecciona una fecha.', 'warning'); return; }
    if (!horas.length) { sfAlert('Selecciona al menos una hora.', 'warning'); return; }

    var btn = document.getElementById('btnAnadirFecha');
    btn.disabled = true;
    var errores = 0;
    for (var i = 0; i < horas.length; i++) {
        try {
            var res = await fetch(apiBase() + '/horarios', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ empleadoId: Number(estado.empleadoId), fechaHora: fecha + 'T' + horas[i] + ':00' }),
            });
            if (!res.ok) errores++;
        } catch (e) {
            errores++;
        }
    }
    if (errores) sfAlert(errores + ' hora(s) no pudieron guardarse.', 'warning');
    document.getElementById('horarioFecha').value = '';
    document.querySelectorAll('.hora-input').forEach(function (cb) { cb.checked = false; });
    await cargarHorariosExistentes(estado.empleadoId);
    btn.disabled = false;
}

async function crearEmpleadoConHorarios() {
    var especialidad = document.getElementById('empEspecialidad').value.trim();
    var usuarioId = Number(document.getElementById('empUsuarioId').value);
    var btn = document.getElementById('btnCrearEmpleado');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i>Creando...';

    try {
        var urlImagen = imagenDesdePreset() || DEFAULT_EMP_IMG;
        var resEmp = await fetch(apiBase() + '/empleados', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                especialidad: especialidad,
                estado: true,
                usuario_id: usuarioId,
                url: urlImagen,
            }),
        });
        if (!resEmp.ok) {
            var err = await resEmp.json().catch(function () { return {}; });
            throw new Error(err.message || 'Error al crear empleado (' + resEmp.status + ')');
        }
        var empCreado = await resEmp.json();
        var nuevoId = empCreado.id;

        var pendientes = Object.entries(estado.horariosPendientes);
        for (var i = 0; i < pendientes.length; i++) {
            var fecha = pendientes[i][0];
            var horas = pendientes[i][1];
            for (var j = 0; j < horas.length; j++) {
                await fetch(apiBase() + '/horarios', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ empleadoId: Number(nuevoId), fechaHora: fecha + 'T' + horas[j] + ':00' }),
                });
            }
        }

        bootstrap.Modal.getInstance(document.getElementById('modalEmpleado')).hide();
        await cargarMapaNombres();
        await cargarEmpleados();
        sfAlert('Empleado creado correctamente.', 'success');
    } catch (err) {
        sfAlert(err.message || 'Error al crear el empleado.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-user-plus me-1"></i> Crear empleado';
    }
}

function initModalEliminar() {
    document.getElementById('btnConfirmarEliminarEmp')?.addEventListener('click', async function () {
        var empleadoId = _eliminando.empleadoId;
        if (!empleadoId) {
            sfAlert('No se pudo identificar el empleado.', 'error');
            return;
        }
        var btn = document.getElementById('btnConfirmarEliminarEmp');
        btn.disabled = true;
        btn.textContent = 'Eliminando...';
        try {
            var res = await fetch(apiBase() + '/empleados/' + empleadoId, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Error ' + res.status + ' al eliminar empleado');
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEliminarEmp')).hide();
            await cargarEmpleados();
            sfAlert('Empleado eliminado correctamente.', 'success');
        } catch (err) {
            sfAlert(err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Eliminar';
            _eliminando = { empleadoId: null, usuarioId: null };
        }
    });
}

function resetEstado() {
    estado = { modo: 'crear', paso: 1, empleadoId: null, usuarioId: null, imagenURL: '', horariosPendientes: {} };
}

function resetFormularioDatos() {
    ['empEditId', 'empEspecialidad', 'empImagenURL', 'empUsuarioId', 'empNombre'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    var preset = document.getElementById('empImagenPreset');
    if (preset) preset.value = '';
    document.getElementById('empPreview').style.display = 'none';
    document.getElementById('empAvatarIcon').style.display = '';
    document.getElementById('tituloModalEmp').textContent = 'Nuevo Empleado';
    document.getElementById('errEmpEspecialidad').textContent = '';
    document.getElementById('errEmpUsuarioId').textContent = '';
}
