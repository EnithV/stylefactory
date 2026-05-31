function actualizarNavbar() {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const userInfo = document.getElementById('user-info');
    const accesoBotones = document.getElementById('acceso-botones');
    const userNameSpan = document.getElementById('userName');

    if (usuarioLogueado) {
        const usuario = JSON.parse(usuarioLogueado);
        if (userNameSpan) {
            userNameSpan.textContent =
                typeof saludoNavbar === 'function'
                    ? saludoNavbar(usuario.nombre)
                    : 'Hola, ' + usuario.nombre;
        }
        if (userInfo) userInfo.style.display = 'block';
        if (accesoBotones) accesoBotones.style.display = 'none';
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (accesoBotones) accesoBotones.style.display = 'block';
    }

    if (typeof actualizarEnlacesNavbarSesion === 'function') {
        actualizarEnlacesNavbarSesion();
    }
}

function cerrarSesion() {
    limpiarSesionLocal();
    actualizarNavbar();
    window.location.href =
        typeof urlApp === 'function' ? urlApp('/index.html') : '../../index.html';
}

function requiereSesion() {
    var token = localStorage.getItem('token');
    var raw = localStorage.getItem('usuarioLogueado');

    if (!token || !raw) {
        var destino =
            typeof urlApp === 'function'
                ? urlApp('/pages/login/login.html')
                : '../login/login.html';
        window.location.href = destino;
        return false;
    }
    return true;
}

function formatearFecha(fechaIso) {
    if (!fechaIso) return '—';
    var partes = fechaIso.split('-');
    if (partes.length !== 3) return fechaIso;
    return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function formatearHora(hora) {
    if (!hora) return '—';
    return hora.substring(0, 5);
}

function claseEstadoReserva(estado) {
    var valor = (estado || 'PENDIENTE').toLowerCase();
    if (valor.indexOf('cancel') !== -1) return 'cancelada';
    if (valor.indexOf('complet') !== -1) return 'confirmada';
    if (valor.indexOf('confirm') !== -1) return 'confirmada';
    return 'pendiente';
}

function etiquetaEstado(estado) {
    var valor = (estado || 'PENDIENTE').toUpperCase();
    if (valor.indexOf('CANCEL') !== -1) return 'Cancelada';
    if (valor === 'COMPLETADA') return 'Completada';
    if (valor.indexOf('CONFIRM') !== -1) return 'Confirmada';
    return 'Pendiente';
}

function mostrarEstado(id, visible) {
    var el = document.getElementById(id);
    if (el) el.style.display = visible ? 'block' : 'none';
}

async function cargarMisReservas() {
    if (!requiereSesion()) return;

    var sesion =
        typeof ReservaPendiente !== 'undefined'
            ? ReservaPendiente.obtenerSesionActiva()
            : JSON.parse(localStorage.getItem('usuarioLogueado'));

    var subtitulo = document.getElementById('mis-reservas-subtitulo');
    if (subtitulo && sesion && sesion.nombre) {
        subtitulo.textContent =
            'Hola, ' +
            sesion.nombre.split(/\s+/)[0] +
            '. Aquí puedes consultar tus citas agendadas.';
    }

    mostrarEstado('mis-reservas-carga', true);
    mostrarEstado('mis-reservas-error', false);
    mostrarEstado('mis-reservas-vacio', false);
    mostrarEstado('mis-reservas-contenedor', false);

    try {
        var respuesta = await fetch(API_BASE + '/reservas/mis-reservas', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token'),
                Accept: 'application/json'
            }
        });

        if (respuesta.status === 401) {
            limpiarSesionLocal();
            requiereSesion();
            return;
        }

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar tus reservas.');
        }

        var reservas = await respuesta.json();
        mostrarEstado('mis-reservas-carga', false);

        if (!Array.isArray(reservas) || reservas.length === 0) {
            mostrarEstado('mis-reservas-vacio', true);
            return;
        }

        var tbody = document.getElementById('mis-reservas-tbody');
        tbody.innerHTML = reservas
            .map(function (r) {
                var clase = claseEstadoReserva(r.estado);
                return (
                    '<tr>' +
                    '<td>' +
                    (r.nombreServicio || '—') +
                    '</td>' +
                    '<td>' +
                    (r.nombreEmpleado || '—') +
                    '</td>' +
                    '<td>' +
                    formatearFecha(r.fecha) +
                    '</td>' +
                    '<td>' +
                    formatearHora(r.hora) +
                    '</td>' +
                    '<td><span class="badge-estado-reserva ' +
                    clase +
                    '">' +
                    etiquetaEstado(r.estado) +
                    '</span></td>' +
                    '</tr>'
                );
            })
            .join('');

        mostrarEstado('mis-reservas-contenedor', true);
    } catch (error) {
        mostrarEstado('mis-reservas-carga', false);
        var errorEl = document.getElementById('mis-reservas-error');
        if (errorEl) {
            errorEl.textContent =
                typeof mensajeErrorConexion === 'function'
                    ? mensajeErrorConexion(error)
                    : error.message || 'Error al cargar reservas.';
            errorEl.style.display = 'block';
        }
    }
}

fetch('../../components/navbar/navbar.html')
    .then(function (res) {
        return res.text();
    })
    .then(function (html) {
        document.getElementById('header').innerHTML = html;
        if (typeof inicializarNavbarCargado === 'function') {
            inicializarNavbarCargado();
        } else {
            actualizarNavbar();
            if (typeof marcarEnlaceNavbarActivo === 'function') {
                marcarEnlaceNavbarActivo();
            }
        }
        var btnCerrar = document.getElementById('btnCerrarSesion');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', cerrarSesion);
        }
    })
    .catch(function (err) {
        console.error('Error cargando el navbar:', err);
    });

fetch('../../components/footer/footer.html')
    .then(function (res) {
        return res.text();
    })
    .then(function (html) {
        document.getElementById('footer-placeholder').innerHTML = html;
    })
    .catch(function (err) {
        console.error('Error cargando el footer:', err);
    });

document.addEventListener('DOMContentLoaded', cargarMisReservas);
