import { productos } from '../../assets/js/productosCatalogo.js';

/**
 * Actualiza la interfaz del navbar según el estado de sesión del usuario.
 * Muestra el nombre del usuario logueado y oculta el botón de acceder.
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
 * Cierra la sesión del usuario y redirige al inicio.
 */
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    actualizarNavbar();
    window.location.href = '../../index.html';
}

/**
 * Inicializa la carga del navbar, footer y catálogo cuando el contenedor
 * de tarjetas está presente en el DOM.
 * Las rutas de fetch son relativas a la ubicación actual (pages/catalogoServicios/).
 */
if (document.getElementById('cards-container')) {
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

    fetch('../../components/footer/footer.html')
        .then(res => res.text())
        .then(html => { document.getElementById('footer-placeholder').innerHTML = html; })
        .catch(err => console.error('Error cargando el footer:', err));

    document.addEventListener('DOMContentLoaded', renderizarCatalogo);
}

let btnReservar;

/**
 * Renderiza el catálogo de servicios en el contenedor con id 'cards-container'.
 * Filtra solo los servicios activos y genera las tarjetas dinámicamente.
 */
function renderizarCatalogo() {
    const container = document.getElementById('cards-container');
    if (!container) {
        console.error("No se encontró el contenedor 'cards-container'");
        return;
    }

    const lista = JSON.parse(localStorage.getItem("Lista de Servicios")) || productos;
    const productosActivos = lista.filter(producto => producto.status === true || producto.status === "true");

    const html = productosActivos.map(producto => {
        const precioFormateado = Number(producto.precio).toLocaleString('es-CO');
        return `
            <div class="card-servicio">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="card-imagen">
                <div class="card-contenido">
                    <h3 class="card-titulo">${producto.nombre}</h3>
                    <p class="card-descripcion">${producto.descripcion}</p>
                    <div class="card-precio">$${precioFormateado}</div>
                    <button class="btn-reservar" data-id="${producto.id}">RESERVAR</button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;

    // Configura el botón de reservar para cada servicio
    document.querySelectorAll('.btn-reservar').forEach(boton => {
        boton.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-id'));
            const listaActual = JSON.parse(localStorage.getItem("Lista de Servicios")) || productos;
            const productoSeleccionado = listaActual.find(p => p.id === id);

            // Guarda el servicio seleccionado para usarlo en la página de reserva
            localStorage.setItem('servicioSeleccionado', JSON.stringify(productoSeleccionado));

            // Redirige a la página de reservas (ruta relativa a la ubicación actual)
            window.location.href = '../reservations/reservations.html';
        });
    });
}

export { productos, btnReservar };