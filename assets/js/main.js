/**
 * Actualiza la interfaz del navbar según el estado de sesión del usuario.
 * Muestra el nombre del usuario logueado y oculta los botones de acceso.
 */
function actualizarNavbar() {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const userInfo = document.getElementById('user-info');
    const accesoBotones = document.getElementById('acceso-botones');
    const userNameSpan = document.getElementById('userName');
    const adminLink = document.getElementById('admin-link');
    
    if (usuarioLogueado) {
        const usuario = JSON.parse(usuarioLogueado);
        if (userNameSpan) {
            userNameSpan.textContent = typeof saludoNavbar === 'function'
                ? saludoNavbar(usuario.nombre)
                : 'Hola, ' + usuario.nombre;
        }
        if (userInfo) userInfo.style.display = 'block';
        if (accesoBotones) accesoBotones.style.display = 'none';
        
        // Mostrar enlace de administrador solo si el rol es admin
        if (adminLink) {
            var rol = (usuario.rol || '').toUpperCase();
            adminLink.style.display = rol === 'ADMIN' ? 'block' : 'none';
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
 * Cierra la sesión del usuario eliminando los datos de sesión actual.
 * Redirige a la página de inicio.
 */
function cerrarSesion() {
    limpiarSesionLocal();
    actualizarNavbar();
    window.location.href = typeof urlApp === 'function' ? urlApp('/index.html') : 'index.html';
}

/**
 * Carga el navbar desde su componente HTML y configura los eventos de sesión.
 * La ruta es relativa a la ubicación del index.html en la raíz.
 */
fetch('components/navbar/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
        if (typeof inicializarNavbarCargado === 'function') {
            inicializarNavbarCargado();
        } else {
            if (typeof aplicarRutasImagenes === 'function') {
                aplicarRutasImagenes(document.getElementById('header'));
            }
            actualizarNavbar();
            const btnCerrarSesion = document.getElementById('btnCerrarSesion');
            if (btnCerrarSesion) {
                btnCerrarSesion.addEventListener('click', cerrarSesion);
            }
            if (typeof marcarEnlaceNavbarActivo === 'function') {
                marcarEnlaceNavbarActivo();
            }
        }
    })
    .catch(err => console.error('Error cargando el navbar:', err));

/**
 * Carga el banner de inicio desde su componente HTML.
 * Ruta relativa desde la raíz del proyecto.
 */
fetch('components/bannerInicio/bannerInicio.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('bannerInicio-placeholder').innerHTML = html;
    })
    .catch(err => console.error('Error cargando el banner en index:', err));

/**
 * Carga la sección de información del index desde su componente HTML.
 */
fetch('components/infoIndex/infoIndex.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('infoIndex-placeholder').innerHTML = html;
        if (typeof aplicarRutasImagenes === 'function') {
            aplicarRutasImagenes(document.getElementById('infoIndex-placeholder'));
        }
    })
    .catch(err => console.error('Error cargando la información del index:', err));

/**
 * Carga la sección de servicios destacados desde su componente HTML.
 * La ruta ha sido corregida a relativa para evitar errores 404 en GitHub Pages.
 */
fetch('components/ServiciosDestacados/ServiciosDestacados.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('serviceDes-placeholder').innerHTML = html;
        if (typeof aplicarRutasImagenes === 'function') {
            aplicarRutasImagenes(document.getElementById('serviceDes-placeholder'));
        }
    })
    .catch(err => console.error('Error cargando servicios destacados:', err));

/**
 * Carga la sección de reseñas desde su componente HTML.
 * También inyecta dinámicamente su hoja de estilos correspondiente.
 */
fetch('components/review/review.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('review-placeholder').innerHTML = html;
        if (typeof aplicarRutasImagenes === 'function') {
            aplicarRutasImagenes(document.getElementById('review-placeholder'));
        }

        // Inyecta la hoja de estilos de las reseñas
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'components/review/review.css';
        document.head.appendChild(link);

        // Inicializa el slider de reseñas después de un breve retraso
        setTimeout(() => {
            if (typeof initialReview === 'function') {
                initialReview();
            }
        }, 100);
    })
    .catch(err => console.error('Error cargando los comentarios:', err));

/**
 * Carga el footer desde su componente HTML.
 */
fetch('components/footer/footer.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('footer-placeholder').innerHTML = html;
        if (typeof aplicarRutasImagenes === 'function') {
            aplicarRutasImagenes(document.getElementById('footer-placeholder'));
        }
    })
    .catch(err => console.error('Error cargando el footer:', err));