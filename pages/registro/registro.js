/**
 * Actualiza el navbar según el estado de sesión almacenado en localStorage.
 * Muestra el nombre del usuario y oculta los botones de acceso si hay sesión activa.
 */
function actualizarNavbar() {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const userInfo = document.getElementById('user-info');
    const accesoBotones = document.getElementById('acceso-botones');
    const userNameSpan = document.getElementById('userName');
    const adminLink = document.getElementById('admin-link');
    
    if (usuarioLogueado) {
        const usuario = JSON.parse(usuarioLogueado);
        if (userNameSpan) userNameSpan.textContent = typeof saludoNavbar === 'function' ? saludoNavbar(usuario.nombre) : 'Hola, ' + usuario.nombre;
        if (userInfo) userInfo.style.display = 'block';
        if (accesoBotones) accesoBotones.style.display = 'none';
        
        if (adminLink) {
            adminLink.style.display = (usuario.rol || '').toUpperCase() === 'ADMIN' ? 'block' : 'none';
        }
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (accesoBotones) accesoBotones.style.display = 'block';
        if (adminLink) adminLink.style.display = 'none';
    }
    if (typeof actualizarEnlacesNavbarSesion === 'function') {
        actualizarEnlacesNavbarSesion();
    }
}

/**
 * Cierra la sesión del usuario y redirige al inicio.
 * Ruta relativa desde la ubicación actual (pages/registro/).
 */
function cerrarSesion() {
    limpiarSesionLocal();
    actualizarNavbar();
    window.location.href = typeof urlApp === 'function' ? urlApp('/index.html') : '../../index.html';
}

/**
 * Carga el componente navbar y configura los eventos de sesión.
 * La ruta es relativa a la ubicación de esta página.
 */
fetch('../../components/navbar/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
        if (typeof inicializarNavbarCargado === 'function') {
            inicializarNavbarCargado();
        } else {
            actualizarNavbar();
            if (typeof marcarEnlaceNavbarActivo === 'function') {
                marcarEnlaceNavbarActivo();
            }
            const btnCerrarSesion = document.getElementById('btnCerrarSesion');
            if (btnCerrarSesion) {
                btnCerrarSesion.addEventListener('click', cerrarSesion);
            }
        }
    })
    .catch(err => console.error('Error cargando el navbar:', err));

/**
 * Carga el componente footer desde su archivo HTML.
 */
fetch('../../components/footer/footer.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;
    })
    .catch(err => console.error('Error cargando el footer:', err));

(function mostrarAvisoRetomarReserva() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('retorno') !== 'reserva') return;

    var columnaFormulario = document.querySelector('.content-body .col-md-6:last-child');
    if (!columnaFormulario || document.getElementById('aviso-retomar-reserva-registro')) return;

    var aviso = document.createElement('div');
    aviso.id = 'aviso-retomar-reserva-registro';
    aviso.className = 'aviso-registro-exito';
    aviso.setAttribute('role', 'status');
    aviso.textContent =
        'Crea tu cuenta para continuar con tu reserva. Tu selección sigue guardada.';
    columnaFormulario.insertBefore(aviso, columnaFormulario.firstChild);
})();