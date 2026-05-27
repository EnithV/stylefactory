document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formRegistro');
    const passwordInput = document.getElementById('password');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validarRequisitosPassword);
    }

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        limpiarErrores();

        const nombre = document.getElementById('nombreCompleto').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        let isValid = true;

        if (nombre === '' || nombre.length < 3) {
            mostrarError('errorNombre', 'El nombre es obligatorio (mín. 3 caracteres)');
            isValid = false;
        }
        if (!validarEmail(email)) {
            mostrarError('errorEmail', 'Ingrese un correo electrónico válido');
            isValid = false;
        }
        if (!validarTelefono(telefono)) {
            mostrarError('errorTelefono', 'Ingrese un número de teléfono válido (mín. 7 dígitos)');
            isValid = false;
        }
        if (!validarRequisitosPassword()) {
            mostrarError('errorPassword', 'La contraseña no cumple los requisitos');
            isValid = false;
        }
        if (password !== confirmPassword) {
            mostrarError('errorConfirmPassword', 'Las contraseñas no coinciden');
            isValid = false;
        }

        if (!isValid) return;

        const requestBody = {
            nombre: nombre,
            correo: email,
            telefono: telefono,
            contrasena: password,
            rol: 'CLIENTE'
        };

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.mensaje || errorData?.error || 'Error en el registro');
            }

            document.getElementById('mensajeExito').style.display = 'block';
            setTimeout(() => {
                window.parent.location.href = '../../pages/login/login.html';
            }, 3000);
        } catch (error) {
            console.error('Error en registro:', error);
            mostrarError('errorGeneral', '❌ ' + error.message);
        }
    });

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function validarTelefono(telefono) {
        const digitos = telefono.replace(/\D/g, '');
        return digitos.length >= 7;
    }

    function mostrarError(elementId, mensaje) {
        const errorSpan = document.getElementById(elementId);
        if (errorSpan) {
            errorSpan.textContent = mensaje;
            errorSpan.style.display = 'block';
        }
    }

    function limpiarErrores() {
        document.querySelectorAll('.error').forEach(e => { e.textContent = ''; e.style.display = 'none'; });
    }

    function validarRequisitosPassword() {
        const password = document.getElementById('password').value;
        const requisitos = [
            { id: 'req-longitud', valido: password.length >= 8 },
            { id: 'req-mayuscula', valido: /[A-Z]/.test(password) },
            { id: 'req-minuscula', valido: /[a-z]/.test(password) },
            { id: 'req-numero', valido: /[0-9]/.test(password) },
            { id: 'req-especial', valido: /[@#$%*!?\-_]/.test(password) }
        ];
        let todosCumplidos = true;
        requisitos.forEach(req => {
            const elem = document.getElementById(req.id);
            if (elem) {
                elem.innerHTML = (req.valido ? '✓' : '✗') + ' ' + elem.textContent.replace(/^[✓✗]\s*/, '');
                elem.className = 'requisito ' + (req.valido ? 'valid' : 'invalid');
            }
            if (!req.valido) todosCumplidos = false;
        });
        return todosCumplidos;
    }
});