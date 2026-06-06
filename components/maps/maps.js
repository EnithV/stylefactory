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

function resolverImagenMapa(ruta) {
    return typeof resolverUrlImagen === "function" ? resolverUrlImagen(ruta) : ruta;
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

    listaSedes.innerHTML = "";
    mapEl.innerHTML = "";

    mapaLeaflet = L.map(mapEl, {
        scrollWheelZoom: false
    }).setView([4.6473, -74.0662], 12);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19
    }).addTo(mapaLeaflet);

    var iconoMarca = L.icon({
        iconUrl: resolverImagenMapa("/assets/images/branding/logo-dorado.png"),
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -42]
    });

    sucursales.forEach(function (sucursal, index) {
        var marker = L.marker([sucursal.lat, sucursal.lng], { icon: iconoMarca }).addTo(mapaLeaflet);

        var popupHtml =
            '<div class="map-popup">' +
            '<img src="' + resolverImagenMapa(sucursal.img) + '" alt="' + sucursal.nombre + '">' +
            "<strong>" + sucursal.nombre + "</strong><br>" +
            '<span class="map-popup-dir">' + sucursal.direccion + "</span>" +
            "</div>";

        marker.bindPopup(popupHtml, { maxWidth: 240 });

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
            document.querySelectorAll(".sede-card").forEach(function (c) {
                c.classList.remove("activa");
            });
            card.classList.add("activa");
            mapaLeaflet.setView([sucursal.lat, sucursal.lng], 14, { animate: true });
            marker.openPopup();
        }

        marker.on("click", activarSede);
        card.addEventListener("click", activarSede);
        listaSedes.appendChild(card);
    });

    setTimeout(function () {
        mapaLeaflet.invalidateSize();
    }, 200);
}
