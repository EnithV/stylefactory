cargarLayoutPublico({
    navbarPath: '../../components/navbar/navbar.html',
    footerPath: '../../components/footer/footer.html',
});

/**
 * Muestra aviso en la página de login tras un registro exitoso.
 */
(function mostrarAvisoRegistroExitoso() {
    var params = new URLSearchParams(window.location.search);
    var columnaFormulario = document.querySelector('.content-body .col-md-6:last-child');
    if (!columnaFormulario) return;

    if (params.get('retorno') === 'reserva') {
        if (document.getElementById('aviso-retomar-reserva')) return;
        var avisoReserva = document.createElement('div');
        avisoReserva.id = 'aviso-retomar-reserva';
        avisoReserva.className = 'aviso-registro-exito';
        avisoReserva.setAttribute('role', 'status');
        avisoReserva.innerHTML =
            '<span class="aviso-registro-exito-icon" aria-hidden="true"></span>' +
            '<span class="aviso-registro-exito-texto">Inicia sesión para continuar con tu reserva. Tu selección sigue <strong>guardada</strong>.</span>';
        columnaFormulario.insertBefore(avisoReserva, columnaFormulario.firstChild);
    }

    if (params.get('registro') !== 'exito') return;
    if (document.getElementById('aviso-registro-exito')) return;

    var aviso = document.createElement('div');
    aviso.id = 'aviso-registro-exito';
    aviso.className = 'aviso-registro-exito';
    aviso.setAttribute('role', 'status');
    aviso.innerHTML =
        '<span class="aviso-registro-exito-icon" aria-hidden="true"></span>' +
        '<span class="aviso-registro-exito-texto">¡Cuenta <strong>registrada</strong>! Ya puede iniciar sesión con su correo y contraseña.</span>';
    columnaFormulario.insertBefore(aviso, columnaFormulario.firstChild);
})();