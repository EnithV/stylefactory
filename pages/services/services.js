/**
 * Importa la función para renderizar los servicios desde el módulo del catálogo.
 * La ruta de importación es relativa a la ubicación de este archivo (pages/services/).
 */
import { renderizarServicios } from '../catalogoServicios/catalogoServicios.js';

/**
 * Carga el componente navbar desde su archivo HTML.
 * Ruta relativa a pages/services/.
 */
fetch('../../components/navbar/navbar.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
        if (typeof inicializarNavbarCargado === 'function') {
            inicializarNavbarCargado();
        }
    })
    .catch(err => console.error('Error cargando el navbar:', err));

/**
 * Carga el componente footer desde su archivo HTML.
 */
fetch('../../components/footer/footer.html')
    .then(res => res.text())
    .then(html => { document.getElementById('footer-placeholder').innerHTML = html; })
    .catch(err => console.error('Error cargando el footer:', err));

// Renderiza los servicios cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarServicios);
} else {
    renderizarServicios();
}