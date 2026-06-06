let reservaActual = {
  servicio: { nombre: "CORTE BÁSICO", precio: 50000 },
  profesional: { nombre: "ANDREA RIVERA" },
  fecha: "ABR 25",
  hora: "2:00 PM",
};

let elementos = {};

document.addEventListener("DOMContentLoaded", () => {
  elementos = {
    confServicio: document.getElementById("confServicio"),
    confProfesional: document.getElementById("confProfesional"),
    confFechaHora: document.getElementById("confFechaHora"),
    confTotal: document.getElementById("confTotal"),
    btnConfirmar: document.getElementById("btnConfirmarReserva"),
  };

  renderizar();

  if (elementos.btnConfirmar) {
    elementos.btnConfirmar.addEventListener("click", () => {
      confirmarReserva();
    });
  }
});

function calcularTotal() {
  return reservaActual.servicio.precio;
}

function renderizar() {
  if (!elementos.confServicio) return;
  elementos.confServicio.textContent = reservaActual.servicio.nombre;
  elementos.confProfesional.textContent = reservaActual.profesional.nombre;
  elementos.confFechaHora.textContent = `${reservaActual.fecha} / ${reservaActual.hora}`;
  elementos.confTotal.textContent = formatearPrecio(calcularTotal());
}

function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
}

function actualizarServicio(nombre, precio) {
  reservaActual.servicio = { nombre: nombre.toUpperCase(), precio };
  renderizar();
}

function actualizarProfesional(nombre) {
  reservaActual.profesional = { nombre: nombre.toUpperCase() };
  renderizar();
}

function actualizarFechaHora(fecha, hora) {
  reservaActual.fecha = fecha;
  reservaActual.hora = hora;
  renderizar();
}

function obtenerDatosReservaDesdePagina() {
  var servicio = JSON.parse(localStorage.getItem("servicioSeleccionado") || "null");
  var estadoPagina = window.estadoReserva || null;

  if (!servicio || !estadoPagina || !estadoPagina.estilista || !estadoPagina.fecha || !estadoPagina.hora) {
    return null;
  }

  return {
    servicio: servicio,
    estilista: estadoPagina.estilista,
    fecha: estadoPagina.fecha,
    hora: estadoPagina.hora,
    anio: estadoPagina.anio,
    mes: estadoPagina.mes,
  };
}

function mostrarModalSesionRequerida() {
  var modalEl = document.getElementById("modalSesionReserva");
  if (!modalEl || typeof bootstrap === "undefined") {
    var irRegistro = confirm(
      "Para completar la reserva necesitas una cuenta. Tu selección se guardará.\n\n¿Ir a registrarte?"
    );
    if (irRegistro) {
      window.location.href = ReservaPendiente.urlRegistroConRetorno();
    }
    return;
  }
  var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function guardarProgresoYPedirSesion() {
  var datos = obtenerDatosReservaDesdePagina();
  if (!datos) {
    alert("Completa la selección de estilista, fecha y hora antes de confirmar.");
    return;
  }
  ReservaPendiente.guardar(datos);
  mostrarModalSesionRequerida();
}

async function confirmarReserva() {
  var sesion = ReservaPendiente.obtenerSesionActiva();
  if (!sesion || !localStorage.getItem("token")) {
    guardarProgresoYPedirSesion();
    return;
  }

  var datos = obtenerDatosReservaDesdePagina();
  if (!datos) {
    alert("Completa la selección de estilista, fecha y hora antes de confirmar.");
    return;
  }

  var usuarioId = sesion.id;
  if (!usuarioId) {
    alert("No se encontró el identificador de usuario. Cierre sesión e ingrese de nuevo.");
    return;
  }

  var empleadoId = datos.estilista.empleadoId || datos.estilista.id;
  var servicioId = datos.servicio.id;
  var boton = elementos.btnConfirmar;
  var textoOriginal = boton ? boton.textContent : "";

  if (boton) {
    boton.disabled = true;
    boton.textContent = "CONFIRMANDO...";
  }

  var cuerpo = {
    fecha: datos.fecha,
    hora: ReservaPendiente.normalizarHora(datos.hora),
    estado: "CONFIRMADA",
    usuarioId: usuarioId,
    empleadoId: empleadoId,
    servicioId: servicioId,
  };

  try {
    var respuesta = await fetch(API_BASE + "/reservas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(cuerpo),
    });

    if (!respuesta.ok) {
      var errorData = await respuesta.json().catch(function () {
        return null;
      });
      var mensaje =
        (errorData && (errorData.message || errorData.error || errorData.mensaje)) ||
        "No se pudo registrar la reserva en el servidor.";
      throw new Error(mensaje);
    }

    var reservaCreada = await respuesta.json();
    ReservaPendiente.limpiar();
    localStorage.removeItem("servicioSeleccionado");

    var nombreServicio =
      reservaCreada.nombreServicio || datos.servicio.nombre.toUpperCase();
    var nombreProfesional =
      reservaCreada.nombreEmpleado || datos.estilista.nombre.toUpperCase();

    var mensaje =
      '<strong style="color:#28a745;">RESERVA CONFIRMADA</strong><br><br>' +
      nombreServicio +
      "<br>" +
      nombreProfesional +
      "<br>" +
      reservaActual.fecha +
      " / " +
      reservaActual.hora +
      "<br>" +
      formatearPrecio(datos.servicio.precio);

    document.getElementById("mensajeConfirmacion").innerHTML = mensaje;

    var modalConfirmacion = new bootstrap.Modal(
      document.getElementById("modalConfirmacionReserva")
    );
    modalConfirmacion.show();

    document
      .getElementById("modalConfirmacionReserva")
      .addEventListener(
        "hidden.bs.modal",
        function handler() {
          document
            .getElementById("modalConfirmacionReserva")
            .removeEventListener("hidden.bs.modal", handler);
          window.location.href =
            typeof urlApp === "function"
              ? urlApp("/pages/perfilUsuario/perfilUsuario.html#reservas")
              : "../perfilUsuario/perfilUsuario.html#reservas";
        },
        { once: true }
      );
  } catch (error) {
    console.error("Error al confirmar reserva:", error);
    var texto =
      typeof mensajeErrorConexion === "function"
        ? mensajeErrorConexion(error)
        : error.message;
    alert("❌ " + texto);
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  }
}

window.ConfirmacionServicio = {
  actualizarServicio,
  actualizarProfesional,
  actualizarFechaHora,
  confirmarReserva,
};
