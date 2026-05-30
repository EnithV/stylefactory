/**
 * Panel de administración: layout embebido en HTML + carga dinámica de secciones.
 */
(function () {
    function iniciarPanel() {
        if (!verificarSesionAdmin()) return;
        initSidebar();
    }

    function verificarSesionAdmin() {
        if (!localStorage.getItem('token')) {
            redirigirLogin();
            return false;
        }
        var raw = localStorage.getItem('usuarioLogueado');
        if (!raw) {
            redirigirLogin();
            return false;
        }
        try {
            var usuario = JSON.parse(raw);
            var rol = (usuario.rol || '').toUpperCase();
            if (rol !== 'ADMIN') {
                redirigirLogin();
                return false;
            }
        } catch (e) {
            redirigirLogin();
            return false;
        }
        return true;
    }

    function redirigirLogin() {
        var destino = typeof urlApp === 'function'
            ? urlApp('/pages/login/login.html')
            : '../../../pages/login/login.html';
        window.location.href = destino;
    }

    function initSidebar() {
        var sidebar = document.getElementById('sidebar');
        var toggleBtn = document.getElementById('toggleBtn');
        var links = document.querySelectorAll('.nav-link');
        var content = document.getElementById('content');
        var logoutBtn = document.querySelector('.logout');

        if (!sidebar || !toggleBtn || !content) {
            console.error('Panel admin: no se encontró la estructura del layout.');
            return;
        }

        toggleBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });

        loadPage('../../../components/metricas/metricas.html');

        links.forEach(function (link) {
            link.addEventListener('click', function (event) {
                if (this.classList.contains('logout')) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                links.forEach(function (l) { l.classList.remove('active'); });
                this.classList.add('active');
                loadPage(this.getAttribute('data-page'));
            });
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                var modalSalir = new bootstrap.Modal(document.getElementById('modalSalir'));
                modalSalir.show();

                var btnSalirConfirmado = document.getElementById('btnSalirConfirmado');
                btnSalirConfirmado.addEventListener('click', function () {
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuarioLogueado');
                    var destino = typeof urlApp === 'function'
                        ? urlApp('/index.html')
                        : '../../../index.html';
                    window.location.href = destino;
                });
            });
        }
    }

    function loadPage(page) {
        var content = document.getElementById('content');
        if (!content || !page) return;

        fetch(page)
            .then(function (res) {
                if (!res.ok) throw new Error('No se pudo cargar ' + page);
                return res.text();
            })
            .then(function (html) {
                content.innerHTML = html;

                if (page.indexOf('metricas') !== -1) {
                    if (typeof initMetricas === 'function') {
                        initMetricas();
                    }
                    return;
                }

                if (page.indexOf('listaServicios') !== -1) {
                    return import('../listaServicios/listaServicios.js').then(function (mod) {
                        mod.initListaServicios();
                    });
                }

                if (page.indexOf('listaReservas') !== -1) {
                    return import('../listaReservas/listaReservas.js').then(function (mod) {
                        mod.initListaReservas();
                    });
                }
            })
            .catch(function (err) {
                console.error('Error cargando sección del panel:', err);
                content.innerHTML =
                    '<p style="padding:2rem;font-family:sans-serif;">No se pudo cargar esta sección. Recarga la página.</p>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarPanel);
    } else {
        iniciarPanel();
    }
})();
