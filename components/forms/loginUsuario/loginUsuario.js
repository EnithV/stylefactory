document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formLogin');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        limpiarErrores();
        ocultarMensajes();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        let isValid = true;

        if (email === '') {
            mostrarError('errorEmail', 'El correo electrónico es obligatorio');
            isValid = false;
        } else if (!validarEmail(email)) {
            mostrarError('errorEmail', 'Ingrese un correo electrónico válido');
            isValid = false;
        }

        if (password === '') {
            mostrarError('errorPassword', 'La contraseña es obligatoria');
            isValid = false;
        }

        if (!isValid) return;

        const requestBody = { correo: email, contrasena: password };

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.mensaje || errorData?.error || 'Credenciales inválidas');
            }

            const data = await response.json(); // { token, nombre, correo, rol }

            // Guardar sesión (solo para mantener el estado de la UI)
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuarioLogueado', JSON.stringify({
                nombre: data.nombre,
                correo: data.correo,
                rol: data.rol
            }));

            const mensajeBienvenida = document.getElementById('mensajeBienvenida');
            mensajeBienvenida.textContent = `¡Bienvenido/a, ${data.nombre}!`;
            mensajeBienvenida.style.display = 'block';

            setTimeout(() => {
                // Redirigir según el rol (rutas relativas desde la página principal)
                const redirect = data.rol === 'ADMIN'
                    ? '../../pages/admin/panelDeControl/panelControl.html'
                    : '../../index.html';
                window.parent.location.href = redirect;
            }, 1500);
        } catch (error) {
            console.error('Error en login:', error);
            const mensajeError = document.getElementById('mensajeError');
            mensajeError.textContent = '❌ ' + error.message;
            mensajeError.style.display = 'block';
        }
    });

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function mostrarError(elementId, mensaje) {
        const errorSpan = document.getElementById(elementId);
        errorSpan.textContent = mensaje;
        errorSpan.style.display = 'block';
    }

    function limpiarErrores() {
        document.querySelectorAll('.error').forEach(e => { e.textContent = ''; e.style.display = 'none'; });
    }

    function ocultarMensajes() {
        const mb = document.getElementById('mensajeBienvenida');
        const me = document.getElementById('mensajeError');
        if (mb) mb.style.display = 'none';
        if (me) me.style.display = 'none';
    }
});