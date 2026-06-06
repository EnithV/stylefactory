cargarLayoutPublico({
    navbarPath: '../../components/navbar/navbar.html',
    footerPath: '../../components/footer/footer.html',
});

(function mostrarAvisoRetomarReserva() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('retorno') !== 'reserva') return;

    var columnaFormulario = document.querySelector('.content-body .col-md-6:last-child');
    if (!columnaFormulario || document.getElementById('aviso-retomar-reserva-registro')) return;

    var aviso = document.createElement('div');
    aviso.id = 'aviso-retomar-reserva-registro';
    aviso.className = 'aviso-registro-exito';
    aviso.setAttribute('role', 'status');
    aviso.textContent =
        'Crea tu cuenta para continuar con tu reserva. Tu selección sigue guardada.';
    columnaFormulario.insertBefore(aviso, columnaFormulario.firstChild);
})();