cargarLayoutPublico({
    navbarPath: 'components/navbar/navbar.html',
});

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