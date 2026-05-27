document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formLogin');
    
    form.addEventListener('submit', function(event) {
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
        
        if (isValid) {
            const requestBody = {
                correo: email,
                contrasena: password
            };

            fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.mensaje || 'Credenciales inválidas');
                }
                return response.json();
            })
            .then(data => {
                // La respuesta incluye: token, nombre, rol, correo
                const token = data.token;
                const nombre = data.nombre;
                const rol = data.rol;

                // Guardar sesión
                localStorage.setItem('token', token);
                localStorage.setItem('usuarioLogueado', JSON.stringify({
                    email: data.correo,
                    nombre: nombre,
                    rol: rol,
                    fechaLogin: new Date().toISOString()
                }));

                const mensajeBienvenida = document.getElementById('mensajeBienvenida');
                mensajeBienvenida.textContent = `¡Bienvenido/a, ${nombre}!`;
                mensajeBienvenida.style.display = 'block';

                setTimeout(() => {
                    if (rol === 'ADMIN') {
                        window.location.href = '/pages/admin/panelDeControl/panelControl.html';
                    } else {
                        window.location.href = '/index.html';
                    }
                }, 2000);
            })
            .catch(error => {
                console.error('Error en login:', error);
                const mensajeError = document.getElementById('mensajeError');
                mensajeError.textContent = '❌ ' + error.message;
                mensajeError.style.display = 'block';
            });
        }
    });
    
    // =========================================================
    // Funciones auxiliares (localStorage ya no se usa para credenciales)
    // =========================================================
    
    /*
    function verificarCredenciales(email, password) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        return usuarios.find(usuario => usuario.email === email && usuario.password === password);
    }
    */
    
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
        const errores = document.querySelectorAll('.error');
        errores.forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
    }
    
    function ocultarMensajes() {
        const mensajeBienvenida = document.getElementById('mensajeBienvenida');
        const mensajeError = document.getElementById('mensajeError');
        if (mensajeBienvenida) mensajeBienvenida.style.display = 'none';
        if (mensajeError) mensajeError.style.display = 'none';
    }
});