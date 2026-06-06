// Creación del array de sucursales
const sucursales = [
    {
        nombre: "Style Factory - Sede Principal",
        img: "/assets/images/sucursales/style1.png",
        direccion: "Calle 123 #45-67, Bogotá",
        lat: 4.6097,
        lng: -74.0817
    },
    {
        nombre: "Style Factory - Chapinero",
        img: "/assets/images/sucursales/style2.png",
        direccion: "Carrera 13 #54-32, Bogotá",
        lat: 4.6473,
        lng: -74.0662
    },
    {
        nombre: "Style Factory - Usaquén",
        img: "/assets/images/sucursales/style3.png",
        direccion: "Calle 119 #6-21, Bogotá",
        lat: 4.6941,
        lng: -74.0291
    }
];

// Inicialización de los estilos del mapa
const estilosMapa = [
    { elementType: "geometry", stylers: [{ color: "#2a133d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#e2dada" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#111" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#080606" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0a0a" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] }
]

// Esta función renderiza el mapa y sus marcadores
function resolverImagenMapa(ruta) {
    return typeof resolverUrlImagen === "function" ? resolverUrlImagen(ruta) : ruta;
}

function inicializacionMap() {
    // Limpia el contenido previo de la lista lateral para evitar duplicados
    document.getElementById('sedes-list').innerHTML = '';

    // Crea la instancia del mapa en el contenedor HTML con el id map
    const map = new google.maps.Map(document.getElementById("map"), {
        // Posición inicial del mapa
        zoom: 12.3,
        // Coodenadas centrales del mapa
        center: { lat: 4.6473, lng: -74.0662 },
        // Estilos de cada elemento del mapa
        styles: estilosMapa
    });

    // Crea un objeto unico para mostrar la información
    const ventanaInformacion = new google.maps.InfoWindow();
    // Captura el contenedor donde se insertaran las tarjetas de la sedes
    const listaSedes = document.getElementById("sedes-list")
    // Array para almacenar las referencias de los marcadores
    const markers = []

    // Itera sobre el array de sucursales para crear sus elementos en el mapa y la lista
    sucursales.forEach((sucursal, index) => {
        // Crea un nuevo marcador fisico en el mapa
        const marker = new google.maps.Marker({
            // asigna a ese nuevo marcador la posición y en cual mapa los debe poner
            position: { lat: sucursal.lat, lng: sucursal.lng },
            map,
            // Crea el tooltip que aparece sobre el marcador
            title: sucursal.nombre,
            // Asigna el estilo que va a tener ese marcador
            icon: {
                url: resolverImagenMapa("/assets/images/branding/logo-dorado.png"),
                scaledSize: new google.maps.Size(100, 100),
                anchor: new google.maps.Point(60, 60)
            }
        });

        // Guarda los marcadores en el array
        markers.push(marker)

        // Función interna para manejar la apertura de detalles
        function abrirVentana() {
            // Verifica si el dispositivo es un movil
            const esMobile = window.innerWidth <= 768
            
            // Quita la clase activa de todas las tarjetas de la lista
            document.querySelectorAll(".sede-card").forEach(c => c.classList.remove("activa"));
            // Añade la clase activa solo a la tarjeta correspondiente a este marcador
            document.getElementById(`sede-${index}`).classList.add("activa");

            // Define el contenido HTML que va dentro de la ventana
            ventanaInformacion.setContent(`
                <div style="font-family:'Montserrat',sans-serif; padding:8px; color:#111; width:220px">
                    ${!esMobile ? `
                    <div style="width:100%; height:130px; overflow:hidden; border-radius:6px; margin-bottom:8px;
                    background:#f0f0f0; display:flex; align-items:center; justify-content:center;">
                        <img src="${resolverImagenMapa(sucursal.img)}" alt="${sucursal.nombre}"
                        style="max-width:100%; max-height:130px; object-fit:contain;">
                    </div>` : ''}
                    <strong style="color:#522676">${sucursal.nombre}</strong><br>
                    <span style="font-size:13px">${sucursal.direccion}</span>
                </div>
            `);
            // Muestra el globo sobre el mapa vinculado al marcador
            ventanaInformacion.open(map, marker);
            // Centra el mapa en la posicion del marcador clickeado
            map.panTo(marker.getPosition());
        }

        // Asigna el evento al clic al marcador del mapa
        marker.addListener("click", abrirVentana);

        // Creación dinamica de la tarjeta lateral en la interfaz
        const card = document.createElement("div")
        card.className = 'sede-card' // Asigna una clase CSS
        card.id = `sede-${index}` // Asigna un ID baso en su indice
        card.innerHTML = `
            <img class="sede-card-img" src="${resolverImagenMapa(sucursal.img)}" alt="${sucursal.nombre}">
            <div class="sede-card-info">
                <h4>${sucursal.nombre}</h4>
                <p>${sucursal.direccion}</p>
            </div>
        `;

        // Abre la ventana en el mapa al hacer clic en la tarjeta lateral
        card.addEventListener("click", abrirVentana)
        // Agrega la tarjeta al contador de la lista en el DOM
        listaSedes.appendChild(card)
    });
}

// Escucha cuando toda la ventana ha terminado de cargar
window.addEventListener('load', () => {
    // Verifica que la libreria de Google maps esta disponible y el div del mapa exista
    if (typeof google !== 'undefined' && document.getElementById('map')) {
    inicializacionMap(); // Llama la función principal
    }
});