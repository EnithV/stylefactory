/**
 * Actualiza la interfaz del navbar según el estado de sesión del usuario.
 * Si hay un usuario logueado (almacenado en localStorage), muestra su nombre
 * y oculta los botones de acceso. Si el rol es ADMIN, muestra el enlace
 * al panel de administración.
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
 * Cierra la sesión del usuario eliminando sus datos de localStorage
 * y redirige a la página de inicio.
 * La ruta es relativa a la ubicación actual (pages/login/).
 */
function cerrarSesion() {
    limpiarSesionLocal();
    actualizarNavbar();
    window.location.href = typeof urlApp === 'function' ? urlApp('/index.html') : '../../index.html';
}

/**
 * Carga el componente navbar desde su archivo HTML y configura los eventos
 * de sesión. Utiliza una ruta relativa para garantizar la portabilidad
 * entre el entorno local y GitHub Pages.
 */
fetch('../../components/navbar/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
        actualizarNavbar();
        if (typeof marcarEnlaceNavbarActivo === 'function') {
            marcarEnlaceNavbarActivo();
        }
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener('click', cerrarSesion);
        }
    })
    .catch(err => console.error('Error cargando el navbar:', err));

/**
 * Carga el componente footer desde su archivo HTML.
 * Ruta relativa a la ubicación actual.
 */
fetch('../../components/footer/footer.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;
    })
    .catch(err => console.error('Error cargando el footer:', err));

/**
 * Muestra aviso en la página de login tras un registro exitoso.
 */
(function mostrarAvisoRegistroExitoso() {
    var params = new URLSearchParams(window.location.search);
    var columnaFormulario = document.querySelector('.content-body .col-md-6:last-child');
    if (!columnaFormulario) return;

    if (params.get('retorno') === 'reserva') {
        if (document.getElementById('aviso-retomar-reserva')) return;
        var avisoReserva = document.createElement('div');
        avisoReserva.id = 'aviso-retomar-reserva';
        avisoReserva.className = 'aviso-registro-exito';
        avisoReserva.setAttribute('role', 'status');
        avisoReserva.innerHTML =
            '<span class="aviso-registro-exito-icon" aria-hidden="true"></span>' +
            '<span class="aviso-registro-exito-texto">Inicia sesión para continuar con tu reserva. Tu selección sigue <strong>guardada</strong>.</span>';
        columnaFormulario.insertBefore(avisoReserva, columnaFormulario.firstChild);
    }

    if (params.get('registro') !== 'exito') return;
    if (document.getElementById('aviso-registro-exito')) return;

    var aviso = document.createElement('div');
    aviso.id = 'aviso-registro-exito';
    aviso.className = 'aviso-registro-exito';
    aviso.setAttribute('role', 'status');
    aviso.innerHTML =
        '<span class="aviso-registro-exito-icon" aria-hidden="true"></span>' +
        '<span class="aviso-registro-exito-texto">¡Cuenta <strong>registrada</strong>! Ya puede iniciar sesión con su correo y contraseña.</span>';
    columnaFormulario.insertBefore(aviso, columnaFormulario.firstChild);
})();