cargarLayoutPublico({
    navbarPath: '../../components/navbar/navbar.html',
    footerPath: '../../components/footer/footer.html',
});

/**
 * Carga el componente del mapa (Leaflet).
 * Inyecta dinámicamente el CSS correspondiente e inicializa el mapa.
 */
fetch('../../components/maps/maps.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('map-placeholder').innerHTML = html;

        // Carga el CSS del mapa dinámicamente
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '../../components/maps/maps.css';
        document.head.appendChild(link);

        function esperarMapaListo(intentos) {
            if (typeof inicializacionMap === 'function' && typeof L !== 'undefined' && document.getElementById('map')) {
                inicializacionMap();
                return;
            }
            if ((intentos || 0) < 40) {
                setTimeout(function () { esperarMapaListo((intentos || 0) + 1); }, 100);
            } else if (typeof mostrarErrorMapa === 'function') {
                mostrarErrorMapa('No se pudo inicializar el mapa. Recarga la página o revisa tu conexión.');
            }
        }
        esperarMapaListo(0);
    })
    .catch(err => console.error('Error cargando el mapa:', err));

/**
 * Carga el formulario de contacto dentro del contenedor correspondiente.
 */
fetch('../../components/forms/contacto/formContacto.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('form-contacto').innerHTML = html;
        if (typeof initFormContacto === 'function') {
            initFormContacto();
        }
    })
    .catch(err => console.error('Error cargando el formulario de contacto:', err));

document.addEventListener('DOMContentLoaded', function () {
    if (typeof aplicarRutasImagenes === 'function') {
        aplicarRutasImagenes(document);
    }
});