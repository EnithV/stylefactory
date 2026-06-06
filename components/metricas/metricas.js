// Objeto principal que contiene todos los datos del dashboard organizados por período de tiempo
const datos = {
    '7d': {
        // Etiquetas del eje X del gráfico: un punto por cada día de la semana
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        ingresos: [320000, 410000, 280000, 490000, 560000, 720000, 480000],
        reservas: [8, 11, 7, 14, 17, 22, 15],

        // Valores que se muestran en las tarjetas resumen del dashboard
        metricas: {
            ingresos:   '$2.600.000',
            reservas:   '94',
            clientes:   '61',
            canceladas: '4.3%'
        },

        // Variación porcentual respecto al mismo período anterior
        deltas: {
            ingresos:   '+15.4%',
            reservas:   '+12.1%',
            clientes:   '+8.3%',
            canceladas: '-0.5%'
        },

        // Color que se aplica a cada delta
        colores: {
            ingresos:   'verde',
            reservas:   'verde',
            clientes:   'verde',
            canceladas: 'rojo'
        }
    },

    '30d': {
        // Etiquetas del eje X: una por cada semana del mes
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        ingresos: [1200000, 1540000, 1380000, 1820000],
        reservas: [32, 44, 39, 51],

        // Valores que se muestran en las tarjetas resumen del dashboard
        metricas: {
            ingresos:   '$5.940.000',
            reservas:   '166',
            clientes:   '98',
            canceladas: '3.8%'
        },

        // Variación porcentual respecto al mismo período anterior
        deltas: {
            ingresos:   '+15.4%',
            reservas:   '+12.1%',
            clientes:   '+8.3%',
            canceladas: '-0.5%'
        },

        // Color que se aplica a cada delta
        colores: {
            ingresos:   'verde',
            reservas:   'verde',
            clientes:   'verde',
            canceladas: 'verde'
        }
    },

    '90d': {
        // Etiquetas del eje X: un punto por cada mes del trimestre
        labels: ['Enero', 'Febrero', 'Marzo'],
        ingresos: [4200000, 5100000, 6800000],
        reservas: [112, 138, 184],

        // Valores que se muestran en las tarjetas resumen del dashboard
        metricas: {
            ingresos:   '$16.100.000',
            reservas:   '434',
            clientes:   '210',
            canceladas: '3.1%'
        },

        // Variación porcentual respecto al mismo período anterior
        deltas: {
            ingresos:   '+22.7%',
            reservas:   '+18.4%',
            clientes:   '+14.2%',
            canceladas: '-1.3%'
        },

        // Color que se aplica a cada delta
        colores: {
            ingresos:   'verde',
            reservas:   'verde',
            clientes:   'verde',
            canceladas: 'verde'
        }
    }
};

// Tabla de servicios
// Array con cada servicio que ofrece la peluquería y sus métricas asociadas
const servicios = [
    { nombre: 'Corte de cabello',     reservas: 142, ingresos: '$2.130.000', estado: 'activo'  },
    { nombre: 'Tinte y coloración',   reservas: 87,  ingresos: '$3.915.000', estado: 'activo'  },
    { nombre: 'Tratamiento keratina', reservas: 54,  ingresos: '$4.320.000', estado: 'pausado' }, // Sin insumos disponibles
    { nombre: 'Barba y afeitado',     reservas: 98,  ingresos: '$980.000',   estado: 'activo'  },
    { nombre: 'Peinado para eventos', reservas: 23,  ingresos: '$1.150.000', estado: 'pausado' }, // Temporada baja
];


//Grafico con chart.js

// Variable global para guardar la instancia activa del gráfico
let grafico;

// Construye el gráfico de líneas para el rango de tiempo indicado
function construirGrafico(rango) {

    // Obtiene el bloque de datos correspondiente al rango recibido
    const d = datosActivos[rango] || datos[rango];
    // Si ya existe un gráfico previo, lo destruye antes de crear uno nuevo
    if (grafico) grafico.destroy();

    // Crea una nueva instancia del gráfico apuntando al elemento del HTML
    grafico = new Chart(document.getElementById('grafico-principal'), {
        // Tipo de gráfico: líneas
        type: 'line',

        data: {
            // Etiquetas del eje X según el rango seleccionado
            labels: d.labels,

            datasets: [
                {
                    label: 'Ingresos',               // Nombre de esta serie para el tooltip
                    data: d.ingresos,                // Array de valores de ingresos del rango
                    borderColor: '#522676',
                    backgroundColor: 'rgba(90, 37, 235, 0.08)',
                    fill: true,                      // Activa el área rellena bajo la línea
                    tension: 0.3,
                    yAxisID: 'y'                     // Asocia esta serie al eje Y izquierdo
                },
                {
                    label: 'Reservas',               // Nombre de esta serie para el tooltip
                    data: d.reservas,                // Array de valores de reservas del rango
                    borderColor: '#AE8D3E',
                    borderDash: [5, 4],              // Línea discontinua: 5px trazo, 4px espacio
                    fill: false,                     // Sin relleno bajo esta línea
                    tension: 0.3,
                    yAxisID: 'y2'                    // Asocia esta serie al eje Y derecho
                }
            ]
        },

        options: {
            responsive: true,           // El gráfico se adapta al tamaño de su contenedor
            maintainAspectRatio: false, // Permite definir altura personalizada sin distorsionar

            plugins: {
                legend: { display: false } // Oculta la leyenda automática de Chart.js
            },

            scales: {
                // Eje Y izquierdo: muestra los ingresos formateados como moneda colombiana
                y: {
                    position: 'left',
                    ticks: {
                        // Transforma el número puro en formato "$1.200.000"
                        callback: v => '$' + v.toLocaleString('es-CO')
                    }
                },
                // Eje Y derecho: muestra el número de reservas sin formato especial
                y2: {
                    position: 'right',
                    grid: { display: false } // Oculta las líneas de cuadrícula del eje derecho para no saturar el gráfico
                }
            }
        }
    });
}


// Cambio del grafico con el rango
// Recibe el rango seleccionado y el elemento que fue clickeado
function cambiarRango(rango, boton) {

    // Recorre todos los botones de filtro y quita la clase activo de cada uno
    document.querySelectorAll('.filtros button').forEach(b => b.classList.remove('activo'));

    // Agrega la clase activo únicamente al botón que fue clickeado
    boton.classList.add('activo');

    // Obtiene el bloque de datos del nuevo rango seleccionado
    const d = datosActivos[rango] || datos[rango];

    // Itera sobre las 4 claves de métricas para actualizar cada tarjeta del dashboard
    ['ingresos', 'reservas', 'clientes', 'canceladas'].forEach(k => {

        // Actualiza el valor principal de la tarjeta
        document.getElementById('m-' + k).textContent = d.metricas[k];
        // Selecciona el elemento que muestra la variación porcentual (ej: "+12.1%")
        const delta = document.getElementById('d-' + k);
        // Actualiza el texto del delta con el porcentaje del nuevo rango
        delta.textContent = d.deltas[k];
        // Reemplaza la clase CSS del delta para cambiar su color ('verde' o 'rojo')
        delta.className = d.colores[k];
    });

    // Destruye el gráfico actual y construye uno nuevo con los datos del rango elegido
    construirGrafico(rango);
}

let datosActivos = datos;
let serviciosActivos = servicios;

function formatearMoneda(valor) {
    return '$' + Math.round(valor || 0).toLocaleString('es-CO');
}

function diasDesdeHoy(fechaStr) {
    var hoy = new Date();
    hoy.setHours(12, 0, 0, 0);
    var f = new Date(fechaStr + 'T12:00:00');
    return Math.floor((hoy - f) / (1000 * 60 * 60 * 24));
}

function reservaActiva(r) {
    return (r.estado || '').toUpperCase() !== 'CANCELADA';
}

function ingresoReserva(r) {
    return reservaActiva(r) ? Number(r.precioServicio || 0) : 0;
}

function calcularMetricasDesdeApi(reservas) {
    var diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    function resumenPeriodo(dias, etiquetas, agrupador) {
        var enPeriodo = reservas.filter(function (r) {
            return r.fecha && diasDesdeHoy(r.fecha) >= 0 && diasDesdeHoy(r.fecha) < dias;
        });
        var activas = enPeriodo.filter(reservaActiva);
        var ingresosSerie = etiquetas.map(function (_, idx) {
            return agrupador(activas, idx).reduce(function (sum, r) {
                return sum + ingresoReserva(r);
            }, 0);
        });
        var reservasSerie = etiquetas.map(function (_, idx) {
            return agrupador(activas, idx).length;
        });
        var totalIngresos = activas.reduce(function (s, r) { return s + ingresoReserva(r); }, 0);
        var totalReservas = activas.length;
        var clientes = {};
        activas.forEach(function (r) {
            var clave = r.usuarioId || r.nombreUsuario || 'anon';
            clientes[clave] = true;
        });
        var canceladas = enPeriodo.filter(function (r) {
            return (r.estado || '').toUpperCase() === 'CANCELADA';
        }).length;
        var pctCancel = enPeriodo.length
            ? ((canceladas / enPeriodo.length) * 100).toFixed(1) + '%'
            : '0%';

        return {
            labels: etiquetas,
            ingresos: ingresosSerie,
            reservas: reservasSerie,
            metricas: {
                ingresos: formatearMoneda(totalIngresos),
                reservas: String(totalReservas),
                clientes: String(Object.keys(clientes).length),
                canceladas: pctCancel,
            },
            deltas: {
                ingresos: '—',
                reservas: '—',
                clientes: '—',
                canceladas: '—',
            },
            colores: {
                ingresos: 'verde',
                reservas: 'verde',
                clientes: 'verde',
                canceladas: canceladas > 0 ? 'rojo' : 'verde',
            },
        };
    }

    var etiquetas7d = [];
    var agrupadores7d = [];
    for (var i = 6; i >= 0; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);
        etiquetas7d.push(diasSemana[d.getDay()]);
        agrupadores7d.push(d.toISOString().slice(0, 10));
    }

    return {
        '7d': resumenPeriodo(7, etiquetas7d, function (lista, idx) {
            var fechaObjetivo = agrupadores7d[idx];
            return lista.filter(function (r) { return r.fecha === fechaObjetivo; });
        }),
        '30d': resumenPeriodo(30, ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'], function (lista, idx) {
            return lista.filter(function (r) {
                var dias = diasDesdeHoy(r.fecha);
                return dias >= idx * 7 && dias < (idx + 1) * 7;
            });
        }),
        '90d': resumenPeriodo(90, ['Mes 1', 'Mes 2', 'Mes 3'], function (lista, idx) {
            return lista.filter(function (r) {
                var dias = diasDesdeHoy(r.fecha);
                return dias >= idx * 30 && dias < (idx + 1) * 30;
            });
        }),
    };
}

function calcularTablaServicios(reservas, catalogo) {
    var conteo = {};
    reservas.forEach(function (r) {
        if (!reservaActiva(r)) return;
        var id = r.servicioId || r.nombreServicio;
        if (!conteo[id]) {
            conteo[id] = { reservas: 0, ingresos: 0, nombre: r.nombreServicio || 'Servicio' };
        }
        conteo[id].reservas += 1;
        conteo[id].ingresos += ingresoReserva(r);
    });

    return (catalogo || []).map(function (s) {
        var key = s.id;
        var stats = conteo[key] || conteo[s.nombre] || { reservas: 0, ingresos: 0, nombre: s.nombre };
        return {
            nombre: s.nombre || stats.nombre,
            reservas: stats.reservas,
            ingresos: formatearMoneda(stats.ingresos),
            estado: s.status === false || s.estado === false ? 'pausado' : 'activo',
        };
    }).sort(function (a, b) { return b.reservas - a.reservas; });
}

function renderTablaServicios(lista) {
    var tbody = document.getElementById('tabla-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    (lista || serviciosActivos).forEach(function (s) {
        var etiqueta = s.estado === 'activo' ? 'Activo'
            : s.estado === 'pausado' ? 'Pausado'
            : 'Eliminado';
        tbody.innerHTML += `
        <tr>
            <td>${s.nombre}</td>
            <td>${s.reservas}</td>
            <td>${s.ingresos}</td>
            <td><span class="badge ${s.estado}">${etiqueta}</span></td>
        </tr>`;
    });
}

async function initMetricas() {
    try {
        var api = await import('../../assets/js/apiClient.js');
        var reservas = await api.listarReservas();
        var catalogo = await api.listarServicios();
        datosActivos = calcularMetricasDesdeApi(reservas);
        serviciosActivos = calcularTablaServicios(reservas, catalogo);
        Object.keys(datosActivos).forEach(function (k) { datos[k] = datosActivos[k]; });
    } catch (e) {
        console.warn('Métricas desde API no disponibles:', e);
        datosActivos = datos;
        serviciosActivos = servicios;
    }

    renderTablaServicios(serviciosActivos);

    var rangoInicial = '7d';
    var d = datosActivos[rangoInicial];
    ['ingresos', 'reservas', 'clientes', 'canceladas'].forEach(function (k) {
        var m = document.getElementById('m-' + k);
        var delta = document.getElementById('d-' + k);
        if (m) m.textContent = d.metricas[k];
        if (delta) {
            delta.textContent = d.deltas[k];
            delta.className = d.colores[k];
        }
    });

    construirGrafico(rangoInicial);
}