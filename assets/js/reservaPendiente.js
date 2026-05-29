/**
 * Guarda y restaura el progreso de una reserva cuando el usuario aún no tiene sesión.
 */
var ReservaPendiente = (function () {
    var CLAVE_DATOS = 'reservaPendienteDatos';
    var CLAVE_RETOMAR = 'retomarReserva';

    function guardar(datos) {
        sessionStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
        sessionStorage.setItem(CLAVE_RETOMAR, 'true');
    }

    function obtener() {
        var raw = sessionStorage.getItem(CLAVE_DATOS);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function debeRetomar() {
        return sessionStorage.getItem(CLAVE_RETOMAR) === 'true' && obtener() !== null;
    }

    function marcarRetomado() {
        sessionStorage.removeItem(CLAVE_RETOMAR);
    }

    function limpiar() {
        sessionStorage.removeItem(CLAVE_DATOS);
        sessionStorage.removeItem(CLAVE_RETOMAR);
    }

    function urlRegistroConRetorno() {
        return typeof urlApp === 'function'
            ? urlApp('/pages/registro/registro.html?retorno=reserva')
            : '../../pages/registro/registro.html?retorno=reserva';
    }

    function urlLoginConRetorno() {
        return typeof urlApp === 'function'
            ? urlApp('/pages/login/login.html?retorno=reserva')
            : '../../pages/login/login.html?retorno=reserva';
    }

    function urlPaginaReservas() {
        return typeof urlApp === 'function'
            ? urlApp('/pages/reservations/reservations.html?retomar=1')
            : '../reservations/reservations.html?retomar=1';
    }

    function obtenerSesionActiva() {
        var token = localStorage.getItem('token');
        var raw = localStorage.getItem('usuarioLogueado');
        if (!token || !raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function normalizarHora(hora) {
        if (!hora) return null;
        if (hora.length === 5) return hora + ':00';
        return hora;
    }

    return {
        guardar: guardar,
        obtener: obtener,
        debeRetomar: debeRetomar,
        marcarRetomado: marcarRetomado,
        limpiar: limpiar,
        urlRegistroConRetorno: urlRegistroConRetorno,
        urlLoginConRetorno: urlLoginConRetorno,
        urlPaginaReservas: urlPaginaReservas,
        obtenerSesionActiva: obtenerSesionActiva,
        normalizarHora: normalizarHora
    };
})();
