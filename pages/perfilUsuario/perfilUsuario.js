/**
 * Hub de perfil: datos del usuario, estadísticas y reservas (GET /reservas/mis-reservas).
 */
(function () {
    var _usuarioIdActual = null;
    var _reservasActuales = [];

    function apiBase() {
        return window.API_BASE || 'https://stylefactoryapi.onrender.com';
    }

    function obtenerToken() {
        return localStorage.getItem('token');
    }

    function obtenerSesionLocal() {
        var raw = localStorage.getItem('usuarioLogueado');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function guardarSesionLocal(usuario) {
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
    }

    function authHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + obtenerToken(),
            Accept: 'application/json',
        };
    }

    function ruta(relativa) {
        return typeof urlApp === 'function' ? urlApp(relativa) : relativasFallback(relativa);
    }

    function relativasFallback(relativa) {
        if (relativa.indexOf('/pages/catalogoServicios') === 0) {
            return '../catalogoServicios/catalogoServicios.html';
        }
        if (relativa.indexOf('/pages/login') === 0) {
            return '../login/login.html';
        }
        return '../../index.html';
    }

    function setTexto(id, valor) {
        var el = document.getElementById(id);
        if (el) el.textContent = valor;
    }

    function etiquetaRol(rol) {
        return (rol || '').toUpperCase() === 'ADMIN' ? 'Administrador' : 'Cliente';
    }

    function mostrarPantallaNoSesion() {
        var container = document.querySelector('.profile-page .container-custom');
        if (!container) return;
        container.innerHTML =
            '<div class="text-center py-5">' +
            '<h2 class="mb-3" style="font-family:\'Cormorant Garamond\',serif;color:#522676;">Sesión no iniciada</h2>' +
            '<p style="color:#7c6f8e;max-width:400px;margin:0 auto 2rem;">Inicia sesión para ver tu perfil y tus reservas.</p>' +
            '<a href="' + ruta('/pages/login/login.html') + '" class="btn btn-primary">Iniciar sesión</a>' +
            '</div>';
    }

    function mostrarErrorPerfil(mensaje) {
        var container = document.querySelector('.profile-page .container-custom');
        if (!container) return;
        container.innerHTML =
            '<div class="text-center py-5">' +
            '<h2 class="mb-3" style="font-family:\'Cormorant Garamond\',serif;color:#522676;">No se pudo cargar el perfil</h2>' +
            '<p style="color:#7c6f8e;max-width:420px;margin:0 auto 2rem;">' + mensaje + '</p>' +
            '<a href="' + ruta('/index.html') + '" class="btn btn-outline-secondary">Volver al inicio</a>' +
            '</div>';
    }

    function animarContador(el, target, duration) {
        if (!el || target === 0) {
            if (el) el.textContent = '0';
            return;
        }
        duration = duration || 1200;
        var start = performance.now();
        function tick(now) {
            var progress = Math.min((now - start) / duration, 1);
            el.textContent = String(Math.round((1 - Math.pow(1 - progress, 3)) * target));
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function getEstadoMeta(estado) {
        var key = (estado || 'PENDIENTE').toString().toLowerCase();
        var map = {
            pendiente: { label: 'Pendiente', color: '#d97706', bg: 'rgba(217,119,6,0.1)', icon: 'fa-clock' },
            confirmada: { label: 'Confirmada', color: '#059669', bg: 'rgba(5,150,105,0.1)', icon: 'fa-circle-check' },
            completada: { label: 'Completada', color: '#522676', bg: 'rgba(82,34,118,0.1)', icon: 'fa-circle-check' },
            cancelada: { label: 'Cancelada', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', icon: 'fa-circle-xmark' },
        };
        return map[key] || { label: estado || 'Sin estado', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: 'fa-circle-question' };
    }

    function pintarPerfil(usuario) {
        var nombre = usuario.nombre || 'Usuario';
        var correo = usuario.correo || '—';
        var telefono = (usuario.telefono || '').trim() || 'Sin teléfono registrado';
        var rol = etiquetaRol(usuario.rol);
        var avatarUrl =
            usuario.avatar ||
            'https://ui-avatars.com/api/?name=' + encodeURIComponent(nombre) + '&background=522676&color=ffffff&size=256';

        var avatarEl = document.getElementById('profileAvatar');
        if (avatarEl) avatarEl.src = avatarUrl;

        setTexto('profileName', nombre);
        setTexto('profileNameDetail', nombre);
        setTexto('profileEmail', correo);
        setTexto('profilePhone', telefono);
        setTexto('profileRoleDetail', rol);

        var roleEl = document.getElementById('profileRole');
        if (roleEl) {
            roleEl.innerHTML = '<i class="fa-solid fa-circle-check fa-xs"></i> ' + rol;
        }
    }

    function crearMetaSpan(iconClass, texto) {
        var s = document.createElement('span');
        var i = document.createElement('i');
        i.className = iconClass;
        s.appendChild(i);
        s.appendChild(document.createTextNode(' ' + texto));
        return s;
    }

    function crearElementoReserva(r, idx) {
        var nombreServicio = r.nombreServicio || 'Servicio';
        var profesional = r.nombreEmpleado || '';
        var fecha = r.fecha ? formatearFechaPerfil(r.fecha) : '—';
        var hora = r.hora ? String(r.hora).substring(0, 5) : '';
        var estado = getEstadoMeta(r.estado);

        var item = document.createElement('div');
        item.className = 'reserva-item';
        item.style.animationDelay = idx * 0.06 + 's';

        var icono = document.createElement('div');
        icono.className = 'reserva-icono';
        var iconoI = document.createElement('i');
        iconoI.className = 'fa-solid fa-cut';
        icono.appendChild(iconoI);

        var body = document.createElement('div');
        body.className = 'reserva-body';

        var top = document.createElement('div');
        top.className = 'reserva-top';
        var spanServicio = document.createElement('span');
        spanServicio.className = 'reserva-servicio';
        spanServicio.textContent = nombreServicio;
        top.appendChild(spanServicio);

        var meta = document.createElement('div');
        meta.className = 'reserva-meta';
        meta.appendChild(crearMetaSpan('fa-solid fa-calendar fa-xs', fecha));
        if (hora) meta.appendChild(crearMetaSpan('fa-solid fa-clock fa-xs', hora));
        if (profesional) meta.appendChild(crearMetaSpan('fa-solid fa-user fa-xs', profesional));

        body.appendChild(top);
        body.appendChild(meta);

        var acciones = document.createElement('div');
        acciones.className = 'reserva-acciones';
        var spanEstado = document.createElement('span');
        spanEstado.className = 'reserva-estado';
        spanEstado.style.color = estado.color;
        spanEstado.style.background = estado.bg;
        var estadoI = document.createElement('i');
        estadoI.className = 'fa-solid ' + estado.icon + ' fa-xs';
        spanEstado.appendChild(estadoI);
        spanEstado.appendChild(document.createTextNode(' ' + estado.label));
        acciones.appendChild(spanEstado);

        item.appendChild(icono);
        item.appendChild(body);
        item.appendChild(acciones);
        return item;
    }

    function formatearFechaPerfil(fechaIso) {
        if (!fechaIso) return '—';
        var partes = String(fechaIso).split('-');
        if (partes.length !== 3) return fechaIso;
        var dateObj = new Date(partes[0] + '-' + partes[1] + '-' + partes[2]);
        if (isNaN(dateObj)) return fechaIso;
        return dateObj.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function renderReservas(reservas) {
        var lista = document.getElementById('reservasList');
        var badge = document.getElementById('reservasBadge');
        if (!lista) return;

        if (badge) badge.textContent = reservas.length;
        lista.replaceChildren();

        if (!reservas.length) {
            lista.innerHTML =
                '<div class="reservas-empty">' +
                '<div class="reservas-empty-icon"><i class="fa-solid fa-calendar-xmark"></i></div>' +
                '<p class="reservas-empty-title">Sin reservas aún</p>' +
                '<p class="reservas-empty-sub">Cuando agendes una cita aparecerá aquí.</p>' +
                '<a href="' + ruta('/pages/catalogoServicios/catalogoServicios.html') + '" class="btn btn-primary" style="margin-top:1rem;">Ver catálogo</a>' +
                '</div>';
            return;
        }

        var ordenadas = reservas.slice().sort(function (a, b) {
            var fa = (a.fecha || '') + (a.hora || '');
            var fb = (b.fecha || '') + (b.hora || '');
            return fb.localeCompare(fa);
        });

        var frag = document.createDocumentFragment();
        ordenadas.forEach(function (r, idx) {
            frag.appendChild(crearElementoReserva(r, idx));
        });
        lista.appendChild(frag);
    }

    function renderStats(totalReservas, reservas) {
        var reservasCount = document.getElementById('reservasCount');
        var statsGrid = document.querySelector('.stats-grid');

        if (statsGrid && reservasCount) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animarContador(reservasCount, totalReservas);
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.3 });
            observer.observe(statsGrid);
        } else if (reservasCount) {
            reservasCount.textContent = String(totalReservas);
        }

        var profEl = document.getElementById('profesionalFavorito');
        if (profEl) {
            var conteo = {};
            reservas.forEach(function (r) {
                var nombre = r.nombreEmpleado || '';
                if (nombre) conteo[nombre] = (conteo[nombre] || 0) + 1;
            });
            var favorito = Object.entries(conteo).sort(function (a, b) {
                return b[1] - a[1];
            })[0];
            profEl.textContent = favorito ? favorito[0] : '—';
        }

        var fechaEl = document.getElementById('proximaCitaFecha');
        var horaEl = document.getElementById('proximaCitaHora');
        if (!fechaEl) return;

        var hoy = new Date().toISOString().split('T')[0];
        var proxima = reservas
            .map(function (r) {
                return { fechaStr: r.fecha || '', hora: (r.hora || '00:00').substring(0, 5), estado: (r.estado || '').toUpperCase() };
            })
            .filter(function (r) {
                return r.fechaStr >= hoy && r.estado.indexOf('CANCEL') === -1;
            })
            .sort(function (a, b) {
                return a.fechaStr.localeCompare(b.fechaStr) || a.hora.localeCompare(b.hora);
            })[0];

        if (proxima) {
            fechaEl.textContent = formatearFechaPerfil(proxima.fechaStr);
            if (horaEl) horaEl.textContent = proxima.hora;
        } else {
            fechaEl.textContent = 'Sin citas';
            if (horaEl) horaEl.textContent = '';
        }
    }

    async function fetchUsuarioPorId(id, token) {
        var res = await fetch(apiBase() + '/usuarios/' + id, {
            headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
        });
        if (!res.ok) return null;
        return res.json();
    }

    async function fetchMisReservas(token) {
        var res = await fetch(apiBase() + '/reservas/mis-reservas', {
            headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' },
        });
        if (res.status === 401) throw new Error('SESSION_EXPIRED');
        if (!res.ok) return [];
        var data = await res.json();
        return Array.isArray(data) ? data : [];
    }

    async function actualizarUsuarioEnAPI(id, datos, token) {
        var res = await fetch(apiBase() + '/usuarios/' + id, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(datos),
        });
        if (!res.ok) {
            var body = await res.text().catch(function () { return ''; });
            throw new Error(body || 'Error ' + res.status);
        }
        return res.json().catch(function () { return null; });
    }

    function actualizarNavbar() {
        var sesion = obtenerSesionLocal();
        var userInfo = document.getElementById('user-info');
        var accesoBotones = document.getElementById('acceso-botones');
        var userNameEl = document.getElementById('userName');
        var userNameLink = document.getElementById('userNameLink');

        if (sesion) {
            var saludo = typeof saludoNavbar === 'function' ? saludoNavbar(sesion.nombre) : 'Hola, ' + sesion.nombre;
            if (userNameEl) userNameEl.textContent = saludo;
            if (userNameLink) {
                userNameLink.href = ruta('/pages/perfilUsuario/perfilUsuario.html');
                userNameLink.setAttribute('aria-current', 'page');
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
        if (typeof marcarEnlaceNavbarActivo === 'function') {
            marcarEnlaceNavbarActivo();
        }
    }

    function cerrarSesion() {
        limpiarSesionLocal();
        window.location.href = ruta('/index.html');
    }

    function aplicarEnlacesInternos() {
        ['linkReservar', 'linkCatalogo'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.href = ruta('/pages/catalogoServicios/catalogoServicios.html');
        });
    }

    async function renderPerfilUsuario() {
        var token = obtenerToken();
        var sesion = obtenerSesionLocal();

        if (!token || !sesion) {
            mostrarPantallaNoSesion();
            return;
        }

        _usuarioIdActual = sesion.id || null;
        pintarPerfil(sesion);

        try {
            if (_usuarioIdActual) {
                var usuarioApi = await fetchUsuarioPorId(_usuarioIdActual, token);
                if (usuarioApi) {
                    sesion = {
                        id: usuarioApi.id,
                        nombre: usuarioApi.nombre,
                        correo: usuarioApi.correo,
                        telefono: usuarioApi.telefono,
                        rol: usuarioApi.rol,
                    };
                    guardarSesionLocal(sesion);
                    _usuarioIdActual = sesion.id;
                    pintarPerfil(sesion);
                }
            }

            var reservas = await fetchMisReservas(token);
            _reservasActuales = reservas;
            renderStats(reservas.length, reservas);
            renderReservas(reservas);
        } catch (err) {
            if (err.message === 'SESSION_EXPIRED') {
                limpiarSesionLocal();
                mostrarPantallaNoSesion();
                return;
            }
            console.error(err);
            mostrarErrorPerfil(
                typeof mensajeErrorConexion === 'function'
                    ? mensajeErrorConexion(err)
                    : 'Hubo un problema al comunicarse con el servidor.'
            );
        }
    }

    function initModalEditarPerfil() {
        var modalEl = document.getElementById('modalEditarPerfil');
        if (!modalEl) return;

        modalEl.addEventListener('show.bs.modal', function () {
            var usuario = obtenerSesionLocal() || {};
            document.getElementById('editNombre').value = usuario.nombre || '';
            document.getElementById('editCorreo').value = usuario.correo || '';
            document.getElementById('editTelefono').value = usuario.telefono || '';
            document.getElementById('editMensajeExito').classList.add('d-none');
            document.getElementById('formEditarPerfil').classList.remove('was-validated');
        });

        document.getElementById('btnGuardarPerfil').addEventListener('click', async function () {
            var form = document.getElementById('formEditarPerfil');
            form.classList.add('was-validated');
            if (!form.checkValidity()) return;

            var nombre = document.getElementById('editNombre').value.trim();
            var correo = document.getElementById('editCorreo').value.trim();
            var telefono = document.getElementById('editTelefono').value.trim();
            var btn = document.getElementById('btnGuardarPerfil');
            var sesion = obtenerSesionLocal() || {};

            btn.disabled = true;
            btn.textContent = 'Guardando...';

            try {
                var id = _usuarioIdActual || sesion.id;
                var token = obtenerToken();
                if (!id || !token) throw new Error('Sesión inválida');

                var actualizadoApi = await actualizarUsuarioEnAPI(
                    id,
                    {
                        nombre: nombre,
                        correo: correo,
                        telefono: telefono || sesion.telefono || '0000000000',
                        rol: (sesion.rol || 'CLIENTE').toUpperCase(),
                    },
                    token
                );

                var merged = Object.assign({}, sesion, actualizadoApi || { nombre: nombre, correo: correo, telefono: telefono });
                guardarSesionLocal(merged);
                pintarPerfil(merged);
                actualizarNavbar();

                var msgEl = document.getElementById('editMensajeExito');
                msgEl.className = 'alert alert-success py-2';
                msgEl.textContent = 'Datos actualizados correctamente.';
                msgEl.classList.remove('d-none');

                setTimeout(function () {
                    bootstrap.Modal.getInstance(modalEl).hide();
                }, 1500);
            } catch (err) {
                var texto = (err.message || '').toLowerCase();
                if (texto.indexOf('correo') !== -1) {
                    document.getElementById('editCorreo').classList.add('is-invalid');
                }
                if (typeof sfAlert === 'function') {
                    await sfAlert(err.message || 'No se pudo guardar el perfil.', 'error');
                }
            } finally {
                btn.disabled = false;
                btn.textContent = 'Guardar cambios';
            }
        });
    }

    function cargarLayout() {
        fetch('../../components/navbar/navbar.html')
            .then(function (res) { return res.text(); })
            .then(function (html) {
                document.getElementById('header').innerHTML = html;
                if (typeof aplicarRutasImagenes === 'function') {
                    aplicarRutasImagenes(document.getElementById('header'));
                }
                actualizarNavbar();
                var btn = document.getElementById('btnCerrarSesion');
                if (btn) btn.addEventListener('click', cerrarSesion);
            })
            .catch(function (err) { console.error('Navbar:', err); });

        fetch('../../components/footer/footer.html')
            .then(function (res) { return res.text(); })
            .then(function (html) {
                document.getElementById('footer-placeholder').innerHTML = html;
            })
            .catch(function (err) { console.error('Footer:', err); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        aplicarEnlacesInternos();
        cargarLayout();
        renderPerfilUsuario();
        initModalEditarPerfil();

        if (window.location.hash === '#reservas') {
            setTimeout(function () {
                var seccion = document.getElementById('seccion-reservas');
                if (seccion) seccion.scrollIntoView({ behavior: 'smooth' });
            }, 600);
        }
    });
})();
