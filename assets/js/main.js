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
}

/**
 * Cierra la sesión del usuario eliminando los datos de sesión actual.
 * Redirige a la página de inicio.
 */
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    actualizarNavbar();
    window.location.href = 'index.html';
}

/**
 * Carga el navbar desde su componente HTML y configura los eventos de sesión.
 * La ruta es relativa a la ubicación del index.html en la raíz.
 */
fetch('components/navbar/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
        actualizarNavbar();
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener('click', cerrarSesion);
        }

        // Resalta el enlace activo en el navbar según la página actual
        const enlaces = document.querySelectorAll('.nav-link');
        let rutaActual = window.location.pathname.split("/").pop();
        if (rutaActual === "" || rutaActual === "/") {
            rutaActual = "index.html";
        }
        enlaces.forEach(enlace => {
            let rutaEnlace = enlace.getAttribute('href').split("/").pop();
            if (rutaEnlace === rutaActual) {
                enlace.classList.add('active');
            } else {
                enlace.classList.remove('active');
            }
        });
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
    })
    .catch(err => console.error('Error cargando el footer:', err));