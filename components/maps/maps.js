// Sedes mostradas en contacto (coordenadas de referencia en Bogotá)
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

let mapaLeaflet = null;
const markersPorSede = [];

function resolverImagenMapa(ruta) {
    return typeof resolverUrlImagen === "function" ? resolverUrlImagen(ruta) : ruta;
}

function nombreCortoSede(nombre) {
    var partes = (nombre || "").split(" - ");
    return partes.length > 1 ? partes[partes.length - 1].trim() : nombre;
}

function crearIconoTarjeta(sucursal) {
    var titulo = nombreCortoSede(sucursal.nombre);
    var html =
        '<div class="map-marker-card" title="' + sucursal.direccion + '">' +
        '<img class="map-marker-card-img" src="' + resolverImagenMapa(sucursal.img) + '" alt="' + titulo + '">' +
        '<div class="map-marker-card-info">' +
        "<h4>" + titulo + "</h4>" +
        "</div>" +
        "</div>";

    return L.divIcon({
        html: html,
        className: "map-marker-leaflet",
        iconSize: [196, 80],
        iconAnchor: [98, 80]
    });
}

function mostrarErrorMapa(mensaje) {
    var contenedor = document.getElementById("map");
    if (!contenedor) return;
    contenedor.innerHTML =
        '<div class="map-fallback-msg">' +
        '<p><strong>No se pudo cargar el mapa interactivo.</strong></p>' +
        '<p>' + mensaje + "</p>" +
        "</div>";
}

function marcarSedeActiva(index) {
    document.querySelectorAll(".sede-card").forEach(function (c, i) {
        c.classList.toggle("activa", i === index);
    });
    document.querySelectorAll(".map-marker-card").forEach(function (m, i) {
        m.classList.toggle("activa", i === index);
    });
    markersPorSede.forEach(function (marker, i) {
        if (marker) {
            marker.setZIndexOffset(i === index ? 2000 : i === 0 ? 1000 : 0);
        }
    });
}

function inicializacionMap() {
    var mapEl = document.getElementById("map");
    var listaSedes = document.getElementById("sedes-list");

    if (!mapEl || !listaSedes) {
        return;
    }

    if (typeof L === "undefined") {
        mostrarErrorMapa("El visor de mapas no está disponible. Revisa tu conexión e intenta de nuevo.");
        return;
    }

    if (mapaLeaflet) {
        mapaLeaflet.remove();
        mapaLeaflet = null;
    }

    markersPorSede.length = 0;
    listaSedes.innerHTML = "";
    mapEl.innerHTML = "";

    mapaLeaflet = L.map(mapEl, {
        scrollWheelZoom: false
    }).setView([4.6473, -74.0662], 12);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19
    }).addTo(mapaLeaflet);

    sucursales.forEach(function (sucursal, index) {
        var marker = L.marker([sucursal.lat, sucursal.lng], {
            icon: crearIconoTarjeta(sucursal),
            zIndexOffset: index === 0 ? 1000 : 0
        }).addTo(mapaLeaflet);

        markersPorSede[index] = marker;

        var card = document.createElement("div");
        card.className = "sede-card";
        card.id = "sede-" + index;
        card.innerHTML =
            '<img class="sede-card-img" src="' + resolverImagenMapa(sucursal.img) + '" alt="' + sucursal.nombre + '">' +
            '<div class="sede-card-info">' +
            "<h4>" + sucursal.nombre + "</h4>" +
            "<p>" + sucursal.direccion + "</p>" +
            "</div>";

        function activarSede() {
            marcarSedeActiva(index);
            mapaLeaflet.setView([sucursal.lat, sucursal.lng], 14, { animate: true });
        }

        marker.on("click", activarSede);
        card.addEventListener("click", activarSede);
        listaSedes.appendChild(card);
    });

    setTimeout(function () {
        mapaLeaflet.invalidateSize();
        marcarSedeActiva(0);
    }, 200);
}
