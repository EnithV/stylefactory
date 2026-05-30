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
 * Catálogo de servicios por defecto. Se utiliza como respaldo si no hay
 * datos en localStorage. Cada producto tiene id, nombre, descripción,
 * precio, imagen y status (activo/inactivo).
 */
const productos = [
    { id: 1, nombre: "Corte de Cabello Premium", descripcion: "Corte moderno con técnicas personalizadas según tu tipo de cabello.", precio: 45000, duracionMinutos: 45, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957776/cortePremium_engl79.png", status: true },
    { id: 2, nombre: "Tinte y Coloración", descripcion: "Coloración de alta calidad con marcas premium. Resultados duraderos.", precio: 120000, duracionMinutos: 120, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957782/tinteColoracion_xlsf5v.png", status: true },
    { id: 3, nombre: "Tratamiento de Keratina", descripcion: "Alisado profundo que elimina el frizz y deja el cabello sedoso.", precio: 180000, duracionMinutos: 150, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957777/keratina_bjqvof.png", status: true },
    { id: 4, nombre: "Barba y Afeitado", descripcion: "Servicio completo de perfilado de barba y afeitado clásico.", precio: 35000, duracionMinutos: 30, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957775/barbaAfeitado_fcacso.png", status: true },
    { id: 5, nombre: "Peinado para Eventos", descripcion: "Peinados profesionales para bodas, graduaciones y eventos especiales.", precio: 80000, duracionMinutos: 90, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957782/peinadoEventos_bk9cyr.png", status: true },
    { id: 6, nombre: "Mechas y Reflejos", descripcion: "Técnicas de mechas californianas, babylights y reflejos.", precio: 150000, duracionMinutos: 120, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957780/mechasReflejos_p5hod7.png", status: true },
    { id: 7, nombre: "Tratamiento Capilar", descripcion: "Hidratación y nutrición profunda para cabello maltratado.", precio: 65000, duracionMinutos: 60, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957783/tratamientoCapilar_mqkb13.png", status: true },
    { id: 8, nombre: "Cepillado Brasileño", descripcion: "Alisado progresivo que reduce el volumen y da brillo.", precio: 160000, duracionMinutos: 150, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957775/cepilladoBrasile%C3%B1o_ela99r.png", status: true },
    { id: 9, nombre: "Maquillaje Profesional", descripcion: "Maquillaje para ocasiones especiales con productos de alta calidad.", precio: 90000, duracionMinutos: 60, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957779/maquillajeProfesional_h9vo1k.png", status: true },
    { id: 10, nombre: "Limpieza Facial", descripcion: "Tratamiento facial profundo para eliminar impurezas y revitalizar.", precio: 70000, duracionMinutos: 45, imagen: "https://res.cloudinary.com/diq2bkb49/image/upload/v1776957778/limpiezaFacial_fmvrnn.png", status: true }
];

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

document.addEventListener('DOMContentLoaded', renderizarCatalogo);

export { productos, btnReservar };