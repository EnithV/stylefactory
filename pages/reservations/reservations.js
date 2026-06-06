/**
 * Actualiza la interfaz del navbar según el estado de sesión del usuario.
 */
function actualizarNavbar() {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');
    const userInfo = document.getElementById('user-info');
    const accesoBotones = document.getElementById('acceso-botones');
    const userNameSpan = document.getElementById('userName');
    const adminLink = document.getElementById('admin-link');
    
    if (usuarioLogueado) {
        const usuario = JSON.parse(usuarioLogueado);
        if (userNameSpan) userNameSpan.textContent = typeof saludoNavbar === 'function' ? saludoNavbar(usuario.nombre) : 'Hola, ' + usuario.nombre;
        if (userInfo) userInfo.style.display = 'block';
        if (accesoBotones) accesoBotones.style.display = 'none';
        
        if (adminLink) {
            adminLink.style.display = (usuario.rol || '').toUpperCase() === 'ADMIN' ? 'block' : 'none';
        }
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (accesoBotones) accesoBotones.style.display = 'block';
        if (adminLink) adminLink.style.display = 'none';
    }
    if (typeof actualizarEnlacesNavbarSesion === 'function') {
        actualizarEnlacesNavbarSesion();
    }
}

/**
 * Cierra la sesión del usuario y redirige al inicio.
 */
function cerrarSesion() {
    limpiarSesionLocal();
    actualizarNavbar();
    window.location.href = typeof urlApp === 'function' ? urlApp('/index.html') : '../../index.html';
}

/**
 * Carga los componentes comunes (navbar y footer) mediante fetch.
 * Las rutas son relativas a la ubicación actual (pages/reservations/).
 */
fetch("../../components/navbar/navbar.html")
  .then((res) => res.text())
  .then((html) => { 
      document.getElementById("header").innerHTML = html;
      if (typeof inicializarNavbarCargado === 'function') {
          inicializarNavbarCargado();
      } else {
          actualizarNavbar();
          if (typeof marcarEnlaceNavbarActivo === 'function') {
              marcarEnlaceNavbarActivo();
          }
          const btnCerrarSesion = document.getElementById('btnCerrarSesion');
          if (btnCerrarSesion) {
              btnCerrarSesion.addEventListener('click', cerrarSesion);
          }
      }
  })
  .catch((err) => console.error("Error cargando el navbar:", err));

fetch("../../components/footer/footer.html")
  .then((res) => res.text())
  .then((html) => { document.getElementById("footer-placeholder").innerHTML = html; })
  .catch((err) => console.error("Error cargando el footer:", err));

/**
 * Renderiza la información del servicio seleccionado en la página de reserva.
 * Obtiene los datos del servicio desde localStorage.
 */
function renderizarReservas() {
  const container = document.getElementById('reservas_container');
  if (!container) return;

  const servicio = JSON.parse(localStorage.getItem('servicioSeleccionado'));

  if (!servicio) {
    container.innerHTML = "<p class='text-muted text-center'>No hay ningún servicio seleccionado aún.</p>";
    return;
  }

  const precioFormateado = Number(servicio.precio).toLocaleString('es-CO');
  const duracionMin = servicio.duracionMinutos ?? 60;

  container.innerHTML = `
    <div class="contenido_reserva">
      <div class="texto col">
        <div class="texto-header">
          <h1>${servicio.nombre}</h1>
          <a href="../catalogoServicios/catalogoServicios.html" class="btn-cambiar-servicio">
            ← Cambiar servicio
          </a>
        </div>
        <p>${servicio.descripcion}</p>
        <p class="text-muted" style="font-size:14px;margin-top:8px;">Duración estimada: ${duracionMin} min</p>
      </div>
      <div class="contenedor_imagen">
        <img src="${typeof resolverUrlImagen === 'function' ? resolverUrlImagen(servicio.imagen) : servicio.imagen}" alt="${servicio.nombre}">
      </div>
    </div>
    <div class="contenedor_precio">
      <h1 class="col">${servicio.nombre}</h1>
      <h1 class="precio col">$${precioFormateado}</h1>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  renderizarReservas();

  var btnRegistro = document.getElementById("btnIrRegistroReserva");
  var btnLogin = document.getElementById("btnIrLoginReserva");
  if (btnRegistro && typeof ReservaPendiente !== "undefined") {
    btnRegistro.href = ReservaPendiente.urlRegistroConRetorno();
  }
  if (btnLogin && typeof ReservaPendiente !== "undefined") {
    btnLogin.href = ReservaPendiente.urlLoginConRetorno();
  }

  cargarDatosReserva().then(function () {
    setTimeout(restaurarReservaPendiente, 100);
  });
});

/** Estilistas activos (API) y horarios agrupados por empleado/fecha. */
let estilistas = [];
let horariosPorEmpleado = {};

/** Respaldo local si el API no responde (mismos IDs y fotos que el seed de Supabase). */
const ESTILISTAS_FALLBACK = [
  { id: 1, empleadoId: 1, nombre: "Ana García", especialidad: "Colorimetría", foto: "/assets/images/empleados/sty1.png" },
  { id: 2, empleadoId: 2, nombre: "Laura Martínez", especialidad: "Cortes y peinados", foto: "/assets/images/empleados/sty2.png" },
  { id: 3, empleadoId: 3, nombre: "Camila Rodríguez", especialidad: "Tratamientos capilares", foto: "/assets/images/empleados/sty3.png" },
  { id: 4, empleadoId: 4, nombre: "Valentina López", especialidad: "Alisados y keratina", foto: "/assets/images/empleados/sty4.png" },
  { id: 5, empleadoId: 5, nombre: "Daniel Herrera", especialidad: "Corte caballero y barba", foto: "/assets/images/empleados/sty5.png" },
  { id: 6, empleadoId: 6, nombre: "Santiago Ruiz", especialidad: "Barbería clásica y perfilado de barba", foto: "/assets/images/empleados/sty6.png" },
];

const IMAGEN_ESTILISTA_DEFAULT =
  "/assets/images/empleados/sty1.png";

/** Horario de atención en salón (reglas de negocio del calendario). */
const HORA_APERTURA_ATENCION = 9;
const HORA_CIERRE_ATENCION = 20;
const HORA_ULTIMO_INICIO_CITA = 18;

function normalizarEstilistaDesdeApi(dto) {
  return {
    id: dto.id,
    empleadoId: dto.id,
    nombre: dto.nombre || "Estilista",
    especialidad: dto.especialidad || "",
    foto: resolverUrlImagen(dto.url || IMAGEN_ESTILISTA_DEFAULT),
  };
}

function agruparHorariosPorEmpleado(listaHorarios) {
  var mapa = {};
  if (!Array.isArray(listaHorarios)) return mapa;

  listaHorarios.forEach(function (h) {
    var empleadoId = h.empleadoId;
    var fechaHora = h.fechaHora;
    if (!empleadoId || !fechaHora) return;

    var partes = String(fechaHora).split("T");
    if (partes.length < 2) return;

    var fecha = partes[0];
    var hora = partes[1].substring(0, 5);

    if (!mapa[empleadoId]) mapa[empleadoId] = {};
    if (!mapa[empleadoId][fecha]) mapa[empleadoId][fecha] = [];
    if (mapa[empleadoId][fecha].indexOf(hora) === -1) {
      mapa[empleadoId][fecha].push(hora);
    }
  });

  Object.keys(mapa).forEach(function (empId) {
    Object.keys(mapa[empId]).forEach(function (fecha) {
      mapa[empId][fecha].sort();
    });
  });

  return mapa;
}

function generarSlotsBaseDia() {
  var slots = [];
  for (var h = HORA_APERTURA_ATENCION; h <= HORA_ULTIMO_INICIO_CITA; h++) {
    slots.push(String(h).padStart(2, "0") + ":00");
  }
  return slots;
}

function mostrarEstadoEstilistas(mensaje, esError) {
  var el = document.getElementById("estilistasEstado");
  if (!el) return;
  el.textContent = mensaje;
  el.style.display = mensaje ? "block" : "none";
  if (esError) {
    el.classList.add("text-danger");
  } else {
    el.classList.remove("text-danger");
  }
}

function renderCarouselEstilistas() {
  var carouselInner = document.getElementById("carouselInner");
  if (!carouselInner) return;

  carouselInner.innerHTML = "";

  if (!estilistas.length) {
    mostrarEstadoEstilistas("No hay estilistas disponibles en este momento.", true);
    return;
  }

  mostrarEstadoEstilistas("", false);

  var cantCards = 4;
  for (var i = 0; i < estilistas.length; i += cantCards) {
    var grupo = estilistas.slice(i, i + cantCards);
    var item = document.createElement("div");
    item.className = "carousel-item " + (i === 0 ? "active" : "");

    var row = '<div class="row">';
    grupo.forEach(function (est) {
      row +=
        '<div class="col-md-3">' +
        '<div class="card card-estilista" id="card-estilista-' + est.id + '" onclick="seleccionarEstilista(' + est.id + ')">' +
        '<img src="' + resolverUrlImagen(est.foto) + '" class="card-img-top" alt="' + est.nombre + '">' +
        '<div class="card-body text-center">' +
        "<h5>" + est.nombre + "</h5>" +
        '<p class="text-purple">' + est.especialidad + "</p>" +
        "</div></div></div>";
    });
    row += "</div>";
    item.innerHTML = row;
    carouselInner.appendChild(item);
  }
}

async function cargarDatosReserva() {
  mostrarEstadoEstilistas("Cargando estilistas...", false);
  var usoFallback = false;

  try {
    var catalogo = await fetchApiPublic("/empleados/catalogo");
    estilistas = catalogo
      .filter(function (e) {
        return e.estado !== false;
      })
      .map(normalizarEstilistaDesdeApi);

    try {
      var horarios = await fetchApiPublic("/horarios");
      horariosPorEmpleado = agruparHorariosPorEmpleado(horarios);
    } catch (errHorarios) {
      console.warn("Horarios no disponibles; se usan franjas estándar del salón.", errHorarios);
      horariosPorEmpleado = {};
    }
  } catch (err) {
    console.error("Error cargando catálogo de estilistas:", err);
    estilistas = ESTILISTAS_FALLBACK.slice();
    horariosPorEmpleado = {};
    usoFallback = true;
  }

  renderCarouselEstilistas();

  if (usoFallback) {
    mostrarEstadoEstilistas(
      "No se pudo conectar con el servidor. Mostrando estilistas en modo local.",
      true
    );
  }
}

/**
 * Estado global de la selección de reserva (calendario inicia en mes actual, Colombia).
 */
const ZONA_COLOMBIA = "America/Bogota";

const partesColombiaInicial = obtenerPartesFechaColombia();
const estado = {
  estilista: null,
  fecha: null,
  hora: null,
  anio: partesColombiaInicial.anio,
  mes: partesColombiaInicial.mes,
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS_SEM = ["D", "L", "M", "M", "J", "V", "S"];

function obtenerPartesFechaColombia(fecha) {
  const referencia = fecha || new Date();
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_COLOMBIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(referencia);

  const valor = (tipo) => parseInt(partes.find((p) => p.type === tipo).value, 10);
  return {
    anio: valor("year"),
    mes: valor("month") - 1,
    dia: valor("day"),
    hora: valor("hour"),
    minuto: valor("minute"),
  };
}

function cadenaDesdePartes(partes) {
  const mm = String(partes.mes + 1).padStart(2, "0");
  const dd = String(partes.dia).padStart(2, "0");
  return `${partes.anio}-${mm}-${dd}`;
}

function obtenerHoyCadena() {
  return cadenaDesdePartes(obtenerPartesFechaColombia());
}

function esHoyEnColombia(fechaStr) {
  return fechaStr === obtenerHoyCadena();
}

function esFechaPasada(fechaStr) {
  return fechaStr < obtenerHoyCadena();
}

/** Solo se bloquean fechas pasadas; el cliente puede reservar a cualquier hora del día para hoy o días futuros. */
function fechaReservable(fechaStr) {
  return !esFechaPasada(fechaStr);
}

function puedeIrMesAnterior() {
  const p = obtenerPartesFechaColombia();
  return estado.anio > p.anio || (estado.anio === p.anio && estado.mes > p.mes);
}

function parseHoraAMinutos(hora) {
  const partes = hora.split(":");
  return parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
}

function obtenerDuracionServicioMinutos() {
  try {
    const servicio = JSON.parse(localStorage.getItem("servicioSeleccionado") || "null");
    const duracion = servicio && servicio.duracionMinutos;
    return typeof duracion === "number" && duracion > 0 ? duracion : 60;
  } catch (e) {
    return 60;
  }
}

/** El servicio debe finalizar a más tardar a las 8 p.m. */
function slotCabeEnHorarioAtencion(hora, duracionMinutos) {
  return parseHoraAMinutos(hora) + duracionMinutos <= HORA_CIERRE_ATENCION * 60;
}

/** Citas solo entre 9 a.m. y 6 p.m. de inicio (regla de negocio, todos los días). */
function slotPermitidoInicio(hora) {
  const minutos = parseHoraAMinutos(hora);
  return minutos >= HORA_APERTURA_ATENCION * 60 && minutos <= HORA_ULTIMO_INICIO_CITA * 60;
}

function filtrarHorasFuturas(fechaStr, horas) {
  if (!esHoyEnColombia(fechaStr)) return horas;
  const p = obtenerPartesFechaColombia();
  const minutosActuales = p.hora * 60 + p.minuto;
  return horas.filter(function (hora) {
    return parseHoraAMinutos(hora) > minutosActuales;
  });
}

function filtrarHorasPorReglasNegocio(fechaStr, horas) {
  const duracion = obtenerDuracionServicioMinutos();
  let filtradas = horas.filter(function (hora) {
    return slotPermitidoInicio(hora) && slotCabeEnHorarioAtencion(hora, duracion);
  });
  if (esHoyEnColombia(fechaStr)) {
    filtradas = filtrarHorasFuturas(fechaStr, filtradas);
  }
  return filtradas;
}

function obtenerHorasReservables(fechaStr) {
  if (!estado.estilista || !fechaReservable(fechaStr)) return [];

  var empId = estado.estilista.empleadoId;
  var horas = [];
  var porEmpleado = horariosPorEmpleado[empId];

  if (porEmpleado && porEmpleado[fechaStr] && porEmpleado[fechaStr].length) {
    horas = porEmpleado[fechaStr].slice();
  } else {
    horas = generarSlotsBaseDia();
  }

  return filtrarHorasPorReglasNegocio(fechaStr, horas);
}

function fechaTieneHorariosReservables(fechaStr) {
  return obtenerHorasReservables(fechaStr).length > 0;
}

/**
 * Maneja la selección de un estilista y carga su disponibilidad.
 */
function seleccionarEstilista(id) {
  const estilista = estilistas.find((e) => e.id === id);
  if (!estilista) return;
  document.getElementById("seccionCalendario").style.display = "block";
  document.getElementById("seccionCalendario").scrollIntoView({ behavior: "smooth" });
  initFechaHora(estilista);
}

/**
 * Inicializa el estado de fecha y hora para el estilista seleccionado.
 */
function initFechaHora(estilista) {
  estado.estilista = estilista;
  estado.fecha = null;
  estado.hora = null;

  const confirmWrapper = document.getElementById("confirmacionServicioWrapper");
  if (confirmWrapper) confirmWrapper.style.display = "none";

  document.getElementById("horasFechaLabel").textContent = "Selecciona un día disponible";
  document.getElementById("horasGrid").innerHTML = `<p class="text-muted" style="font-size:13px;">Los horarios aparecerán al elegir una fecha.</p>`;

  renderCalendario();
}

/**
 * Renderiza el calendario con los días disponibles del estilista.
 */
function renderCalendario() {
  document.getElementById("calMonthLabel").textContent = `${MESES[estado.mes]} ${estado.anio}`;

  const btnPrev = document.getElementById("prevMonth");
  if (btnPrev) {
    btnPrev.disabled = !puedeIrMesAnterior();
    btnPrev.style.opacity = btnPrev.disabled ? "0.35" : "1";
    btnPrev.style.cursor = btnPrev.disabled ? "not-allowed" : "pointer";
  }

  const primerDia = new Date(estado.anio, estado.mes, 1).getDay();
  const diasDelMes = new Date(estado.anio, estado.mes + 1, 0).getDate();

  let html = DIAS_SEM.map((d) => `<div class="cal-nombre-dia">${d}</div>`).join("");

  for (let i = 0; i < primerDia; i++) html += `<div class="cal-dia"></div>`;

  for (let d = 1; d <= diasDelMes; d++) {
    const mm = String(estado.mes + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const fechaStr = `${estado.anio}-${mm}-${dd}`;
    const estaDisponible = fechaTieneHorariosReservables(fechaStr);
    const estaSeleccionado = estado.fecha === fechaStr;

    let clases = "cal-dia";
    if (estaDisponible) clases += " disponible";
    if (estaSeleccionado) clases += " seleccionado";

    const click = estaDisponible ? `onclick="seleccionarFecha('${fechaStr}')"` : "";
    html += `<div class="${clases}" ${click}>${d}</div>`;
  }

  document.getElementById("calGrid").innerHTML = html;
}

/**
 * Maneja la selección de una fecha en el calendario.
 */
function seleccionarFecha(fechaStr) {
  if (!fechaReservable(fechaStr) || !fechaTieneHorariosReservables(fechaStr)) return;

  estado.fecha = fechaStr;
  estado.hora = null;
  renderCalendario();

  const [anio, mes, dia] = fechaStr.split("-");
  document.getElementById("horasFechaLabel").textContent = `${parseInt(dia)} de ${MESES[parseInt(mes) - 1]} de ${anio}`;
  renderHoras(fechaStr);
}

/**
 * Renderiza los horarios disponibles para la fecha seleccionada.
 */
function renderHoras(fechaStr) {
  const contenedor = document.getElementById("horasGrid");
  const horas = obtenerHorasReservables(fechaStr);

  if (horas.length === 0) {
    const duracion = obtenerDuracionServicioMinutos();
    contenedor.innerHTML =
      `<p class="text-muted" style="font-size:13px;">No hay horarios disponibles para este servicio (${duracion} min). ` +
      `Las citas se agendan de 9:00 a.m. a 6:00 p.m. (último inicio) y el servicio debe terminar antes de las 8:00 p.m.</p>`;
    return;
  }

  contenedor.innerHTML = horas.map((hora) => `
    <button class="btn-hora${estado.hora === hora ? " seleccionado" : ""}" onclick="seleccionarHora('${hora}')">
      ${hora}
    </button>`
  ).join("");
}

/**
 * Maneja la selección de un horario y actualiza el componente de confirmación.
 */
function seleccionarHora(hora) {
  estado.hora = hora;
  renderHoras(estado.fecha);

  if (window.ConfirmacionServicio) {
    const servicio = JSON.parse(localStorage.getItem('servicioSeleccionado'));
    const nombreServicio = servicio?.nombre ?? "Servicio";
    const precioServicio = servicio?.precio ?? 0;

    window.ConfirmacionServicio.actualizarServicio(nombreServicio, precioServicio);
    window.ConfirmacionServicio.actualizarProfesional(estado.estilista.nombre);

    const [anio, mes, dia] = estado.fecha.split("-");
    const fechaLegible = `${dia}/${mes}/${anio}`;
    window.ConfirmacionServicio.actualizarFechaHora(fechaLegible, estado.hora);
  }

  const confirmWrapper = document.getElementById("confirmacionServicioWrapper");
  if (confirmWrapper) confirmWrapper.style.display = "block";

  document.dispatchEvent(new CustomEvent("fechaHoraSeleccionada", {
    detail: { estilista: estado.estilista, fecha: estado.fecha, hora: estado.hora }
  }));
}

/**
 * Navegación del calendario: mes anterior.
 */
document.getElementById("prevMonth").addEventListener("click", () => {
  if (!puedeIrMesAnterior()) return;
  estado.mes--;
  if (estado.mes < 0) { estado.mes = 11; estado.anio--; }
  estado.fecha = null;
  estado.hora = null;
  renderCalendario();
  document.getElementById("horasFechaLabel").textContent = "Selecciona un día disponible";
  document.getElementById("horasGrid").innerHTML = `<p class="text-muted" style="font-size:13px;">Los horarios aparecerán al elegir una fecha.</p>`;
});

/**
 * Navegación del calendario: mes siguiente.
 */
document.getElementById("nextMonth").addEventListener("click", () => {
  estado.mes++;
  if (estado.mes > 11) { estado.mes = 0; estado.anio++; }
  estado.fecha = null;
  estado.hora = null;
  renderCalendario();
  document.getElementById("horasFechaLabel").textContent = "Selecciona un día disponible";
  document.getElementById("horasGrid").innerHTML = `<p class="text-muted" style="font-size:13px;">Los horarios aparecerán al elegir una fecha.</p>`;
});

window.estadoReserva = estado;

/**
 * Restaura estilista, fecha y hora tras registro o login (reserva pendiente).
 */
function restaurarReservaPendiente() {
  if (typeof ReservaPendiente === "undefined") return;
  if (!estilistas.length) return;

  var params = new URLSearchParams(window.location.search);
  if (params.get("retomar") !== "1" && !ReservaPendiente.debeRetomar()) return;

  var pendiente = ReservaPendiente.obtener();
  if (!pendiente) return;

  if (pendiente.servicio) {
    localStorage.setItem("servicioSeleccionado", JSON.stringify(pendiente.servicio));
    renderizarReservas();
  }

  if (typeof pendiente.anio === "number") estado.anio = pendiente.anio;
  if (typeof pendiente.mes === "number") estado.mes = pendiente.mes;

  var estilista =
    estilistas.find(function (e) {
      return (
        e.empleadoId === pendiente.estilista.empleadoId ||
        e.id === pendiente.estilista.id
      );
    }) || pendiente.estilista;

  document.getElementById("seccionCalendario").style.display = "block";
  initFechaHora(estilista);

  if (pendiente.fecha && fechaTieneHorariosReservables(pendiente.fecha)) {
    seleccionarFecha(pendiente.fecha);
  }
  if (pendiente.hora && estado.fecha && obtenerHorasReservables(estado.fecha).includes(pendiente.hora)) {
    seleccionarHora(pendiente.hora);
  }

  ReservaPendiente.marcarRetomado();

  var aviso = document.getElementById("aviso-reserva-retomada");
  if (aviso) {
    aviso.style.display = "block";
    aviso.textContent =
      "Continúa donde lo dejaste. Revisa tu selección y confirma la reserva.";
  }

  document.getElementById("seccionCalendario").scrollIntoView({ behavior: "smooth" });
}