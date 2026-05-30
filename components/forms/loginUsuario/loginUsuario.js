(function () {
    var API_LOGIN =
        typeof API_BASE !== 'undefined'
            ? API_BASE
            : 'https://stylefactoryapi.onrender.com';

    function validarEmailLogin(email) {
        if (typeof FormValidaciones !== 'undefined') {
            return FormValidaciones.validarEmail(email);
        }
        var valor = (email || '').trim();
        if (valor === '') {
            return { valido: false, mensaje: 'El correo electrónico es obligatorio' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
            return { valido: false, mensaje: 'Ingrese un correo electrónico válido' };
        }
        return { valido: true };
    }

    function mostrarError(elementId, mensaje) {
        var errorSpan = document.getElementById(elementId);
        if (errorSpan) {
            errorSpan.textContent = mensaje;
            errorSpan.style.display = 'block';
        }
    }

    function limpiarErrores() {
        document.querySelectorAll('.error').forEach(function (e) {
            e.textContent = '';
            e.style.display = 'none';
        });
    }

    function ocultarMensajes() {
        var mb = document.getElementById('mensajeBienvenida');
        var me = document.getElementById('mensajeError');
        if (mb) mb.style.display = 'none';
        if (me) me.style.display = 'none';
    }

    function obtenerUrlRedireccion() {
        if (typeof urlApp === "function") {
            return urlApp("/index.html");
        }
        return "../../index.html";
    }

    function initLoginForm() {
        var form = document.getElementById('formLogin');
        if (!form || form.dataset.loginInicializado === 'true') return;
        form.dataset.loginInicializado = 'true';

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            limpiarErrores();
            ocultarMensajes();

            var email = document.getElementById('email').value.trim();
            var password = document.getElementById('password').value;
            var boton = form.querySelector('.btn-login');
            var textoBoton = boton ? boton.textContent : '';
            var isValid = true;

            var resultadoEmail = validarEmailLogin(email);
            if (!resultadoEmail.valido) {
                mostrarError('errorEmail', resultadoEmail.mensaje);
                isValid = false;
            }

            if (password === '') {
                mostrarError('errorPassword', 'La contraseña es obligatoria');
                isValid = false;
            }

            if (!isValid) return;

            if (boton) {
                boton.disabled = true;
                boton.textContent = 'Iniciando sesión...';
            }

            var requestBody = { correo: email, contrasena: password };

            fetch(API_LOGIN + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })
                .then(function (response) {
                    if (!response.ok) {
                        return response.json().catch(function () {
                            return null;
                        }).then(function (errorData) {
                            throw new Error(
                                (errorData && (errorData.mensaje || errorData.error)) ||
                                    'Credenciales inválidas'
                            );
                        });
                    }
                    return response.json();
                })
                .then(function (data) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem(
                        'usuarioLogueado',
                        JSON.stringify({
                            id: data.id,
                            nombre: data.nombre,
                            correo: data.correo,
                            rol: data.rol
                        })
                    );

                    var mensajeBienvenida = document.getElementById('mensajeBienvenida');
                    if (mensajeBienvenida) {
                        var nombreCorto = (data.nombre || '').trim().split(/\s+/)[0] || data.nombre;
                        mensajeBienvenida.textContent = '¡Bienvenido/a, ' + nombreCorto + '!';
                        mensajeBienvenida.style.display = 'block';
                    }

                    setTimeout(function () {
                        var url;
                        if (typeof ReservaPendiente !== 'undefined' && ReservaPendiente.debeRetomar()) {
                            url = ReservaPendiente.urlPaginaReservas();
                        } else {
                            url = obtenerUrlRedireccion();
                        }
                        if (window.parent && window.parent !== window) {
                            window.parent.location.href = url;
                        } else {
                            window.location.href = url;
                        }
                    }, 1500);
                })
                .catch(function (error) {
                    console.error('Error en login:', error);
                    var mensajeError = document.getElementById('mensajeError');
                    if (mensajeError) {
                        var texto =
                            typeof mensajeErrorConexion === 'function'
                                ? mensajeErrorConexion(error)
                                : error.message || 'No se pudo iniciar sesión';
                        mensajeError.textContent = '❌ ' + texto;
                        mensajeError.style.display = 'block';
                    }
                })
                .finally(function () {
                    if (boton) {
                        boton.disabled = false;
                        boton.textContent = textoBoton;
                    }
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoginForm);
    } else {
        initLoginForm();
    }
})();
