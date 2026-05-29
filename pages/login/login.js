/**
 * Actualiza la interfaz del navbar según el estado de sesión del usuario.
 * Si hay un usuario logueado (almacenado en localStorage), muestra su nombre
 * y oculta los botones de acceso. Si el rol es "admin", muestra el enlace
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
        if (userNameSpan) userNameSpan.textContent = `Hola, ${usuario.nombre}`;
        if (userInfo) userInfo.style.display = 'block';
        if (accesoBotones) accesoBotones.style.display = 'none';
        
        if (adminLink) {
            adminLink.style.display = usuario.rol === 'admin' ? 'block' : 'none';
        }
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (accesoBotones) accesoBotones.style.display = 'block';
        if (adminLink) adminLink.style.display = 'none';
    }
}

/**
 * Cierra la sesión del usuario eliminando sus datos de localStorage
 * y redirige a la página de inicio.
 * La ruta es relativa a la ubicación actual (pages/login/).
 */
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    actualizarNavbar();
    window.location.href = '../../index.html';
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
    if (params.get('registro') !== 'exito') return;

    var columnaFormulario = document.querySelector('.content-body .col-md-6:last-child');
    if (!columnaFormulario || document.getElementById('aviso-registro-exito')) return;

    var aviso = document.createElement('div');
    aviso.id = 'aviso-registro-exito';
    aviso.className = 'aviso-registro-exito';
    aviso.setAttribute('role', 'status');
    aviso.textContent =
        '¡Cuenta registrada! Ya puede iniciar sesión con su correo y contraseña.';
    columnaFormulario.insertBefore(aviso, columnaFormulario.firstChild);
})();