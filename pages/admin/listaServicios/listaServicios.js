/**
 * Importa las dependencias necesarias para la gestión de servicios.
 * productos: catálogo de servicios por defecto.
 * initFormulario: función que inicializa el formulario de creación/edición.
 */
import { productos } from "../../catalogoServicios/catalogoServicios.js";
import { initFormulario } from "../../../components/forms/creacionServicios/formCreacionServicios.js";

const KEY = "Lista de Servicios";
let indexAEliminar = null;

/**
 * Renderiza la tabla de servicios en el DOM.
 * Obtiene los datos de localStorage y genera las filas dinámicamente.
 */
export function renderizarTabla() {
  const servicios = JSON.parse(localStorage.getItem(KEY)) || [];
  const tbody = document.getElementById("tabla-servicios");
  if (!tbody) return;
  tbody.innerHTML = "";

  servicios.forEach((servicio, index) => {
    const estadoClase = servicio.status === true || servicio.status === "true" ? "confirmada" : "cancelada";
    const estadoTexto = servicio.status === true || servicio.status === "true" ? "Activo" : "Inactivo";
    const id = servicio.id ?? index + 1;

    const duracion = servicio.duracionMinutos ?? 60;

    const fila = `
      <tr>
        <td>#ID-${id}</td>
        <td>${servicio.nombre}</td>
        <td>
          <div class="text-truncate">${servicio.descripcion}</div>
        </td>
        <td>${duracion} min</td>
        <td>
          <span class="badge-estado ${estadoClase}">${estadoTexto}</span>
        </td>
        <td class="celda-acciones">
          <button class="btn-accion btn-editar" data-index="${index}" title="Editar">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-accion btn-eliminar" data-index="${index}" title="Eliminar">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

/**
 * Inicializa la página de lista de servicios: carga el formulario,
 * renderiza la tabla y configura los eventos de edición y eliminación.
 */
export function initListaServicios() {
  const servicios = JSON.parse(localStorage.getItem(KEY)) || [];
  if (servicios.length === 0) {
    productos.forEach((elemento) => servicios.push(elemento));
    localStorage.setItem(KEY, JSON.stringify(servicios));
  }

  /**
   * Carga el formulario de creación de servicios desde su componente HTML.
   * La ruta es relativa a la ubicación actual (pages/admin/listaServicios/).
   */
  fetch("../../../components/forms/creacionServicios/formCreacionServicios.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("form-services").innerHTML = html;
      initFormulario(renderizarTabla);
    })
    .catch((err) => console.error("Error cargando el formulario:", err));

  renderizarTabla();

  // Limpia el foco cuando se cierra el modal de eliminación
  const modalElement = document.getElementById("modalEliminar");
  if (modalElement) {
    modalElement.addEventListener("hidden.bs.modal", () => {
      if (document.activeElement) document.activeElement.blur();
      document.body.focus();
    });
  }

  // Delegación de eventos para los botones de editar y eliminar
  document.addEventListener("click", function (e) {
    const btnEliminar = e.target.closest(".btn-eliminar");
    if (btnEliminar) {
      indexAEliminar = btnEliminar.dataset.index;
      const modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
      modal.show();
      return;
    }

    const btnEditar = e.target.closest(".btn-editar");
    if (btnEditar) {
      const index = btnEditar.dataset.index;
      const lista = JSON.parse(localStorage.getItem(KEY)) || [];
      const servicio = lista[index];

      document.getElementById("nombre").value = servicio.nombre;
      document.getElementById("descripcion").value = servicio.descripcion;
      document.getElementById("precio").value = servicio.precio;
      document.getElementById("duracionMinutos").value = servicio.duracionMinutos ?? 60;
      document.getElementById("editIndex").value = index;
      document.querySelector(".btn-enviar").textContent = "Guardar Cambios";

      const modal = new bootstrap.Modal(document.getElementById("exampleModal"));
      modal.show();
    }
  });

  // Configura el botón de confirmación de eliminación
  const btnConfirmar = document.getElementById("btn-confirmar-eliminar");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", function () {
      const lista = JSON.parse(localStorage.getItem(KEY)) || [];
      lista.splice(Number(indexAEliminar), 1);
      localStorage.setItem(KEY, JSON.stringify(lista));
      const modal = bootstrap.Modal.getInstance(document.getElementById("modalEliminar"));
      modal.hide();
      renderizarTabla();
    });
  }
}