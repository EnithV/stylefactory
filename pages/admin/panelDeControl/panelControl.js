/**
 * Importa las funciones de inicialización de los módulos de administración.
 * Las rutas de importación son relativas a la ubicación de este archivo.
 */
import { initListaServicios } from "../listaServicios/listaServicios.js";
import { initListaReservas } from "../listaReservas/listaReservas.js";

/**
 * Carga el componente del navbar de administración y configura la barra lateral.
 * La ruta del fetch es relativa a la ubicación actual (pages/admin/panelDeControl/).
 */
fetch('../../../components/navbarAdmin/navbar_Admin.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('navbarAdmin-placeholder').innerHTML = html;
        initSidebar();
    })
    .catch(err => console.error('Error cargando el navbar admin:', err));

/**
 * Inicializa la barra lateral de navegación del panel de administración.
 * Configura el botón de colapso, los enlaces de navegación y la carga
 * dinámica de contenido en el área principal.
 */
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleBtn");
  const links = document.querySelectorAll(".nav-link");
  const content = document.getElementById("content");
  const logoutBtn = document.querySelector(".logout");

  // Alterna el estado colapsado de la barra lateral
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });

  // Carga la página de métricas por defecto al iniciar el panel
  loadPage("../../../components/metricas/metricas.html");

  // Configura la navegación entre las diferentes secciones del panel
  links.forEach(link => {
    link.addEventListener("click", function () {
      if (this.classList.contains("logout")) return;
      links.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
      const page = this.getAttribute("data-page");
      loadPage(page);
    });
  });

  // Configura el botón de cierre de sesión con confirmación modal
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const modalSalir = new bootstrap.Modal(document.getElementById("modalSalir"));
      modalSalir.show();

      const btnSalirConfirmado = document.getElementById("btnSalirConfirmado");
      btnSalirConfirmado.addEventListener("click", () => {
        window.location.href = "../../../index.html";
      });
    });
  }

  /**
   * Carga una página HTML en el área de contenido principal y ejecuta
   * las inicializaciones correspondientes según la sección cargada.
   * @param {string} page - Ruta relativa al archivo HTML a cargar.
   */
  function loadPage(page) {
    fetch(page)
      .then(res => res.text())
      .then(html => {
        content.innerHTML = html;

        // Inicializa las métricas si la página cargada lo requiere
        if (page.includes("metricas")) {
          initMetricas();
        }

        // Inicializa la lista de servicios si corresponde
        if (page.includes("listaServicios")) {
          initListaServicios();
        }

        // Inicializa la lista de reservas si corresponde
        if (page.includes("listaReservas")) {
          initListaReservas();
        }
      });
  }
}