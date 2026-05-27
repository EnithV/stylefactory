/**
 * Valida los requisitos de la contraseña en tiempo real.
 * Verifica longitud, mayúsculas, minúsculas, números y caracteres especiales.
 * Actualiza la interfaz visual de requisitos a medida que el usuario escribe.
 */
function validarRequisitosPassword() {
    const password = document.getElementById('password').value;
    
    const reqLongitud = document.getElementById('req-longitud');
    const reqMayuscula = document.getElementById('req-mayuscula');
    const reqMinuscula = document.getElementById('req-minuscula');
    const reqNumero = document.getElementById('req-numero');
    const reqEspecial = document.getElementById('req-especial');
    
    const longitudValida = password.length >= 8;
    const mayusculaValida = /[A-Z]/.test(password);
    const minusculaValida = /[a-z]/.test(password);
    const numeroValida = /[0-9]/.test(password);
    const especialValida = /[@#$%*!?\-_]/.test(password);
    
    if (reqLongitud) {
        reqLongitud.innerHTML = (longitudValida ? '✓' : '✗') + ' Mínimo 8 caracteres';
        reqLongitud.className = 'requisito ' + (longitudValida ? 'valid' : 'invalid');
    }
    if (reqMayuscula) {
        reqMayuscula.innerHTML = (mayusculaValida ? '✓' : '✗') + ' Al menos una letra mayúscula';
        reqMayuscula.className = 'requisito ' + (mayusculaValida ? 'valid' : 'invalid');
    }
    if (reqMinuscula) {
        reqMinuscula.innerHTML = (minusculaValida ? '✓' : '✗') + ' Al menos una letra minúscula';
        reqMinuscula.className = 'requisito ' + (minusculaValida ? 'valid' : 'invalid');
    }
    if (reqNumero) {
        reqNumero.innerHTML = (numeroValida ? '✓' : '✗') + ' Al menos un número';
        reqNumero.className = 'requisito ' + (numeroValida ? 'valid' : 'invalid');
    }
    if (reqEspecial) {
        reqEspecial.innerHTML = (especialValida ? '✓' : '✗') + ' Al menos un carácter especial (@, #, $, %, *, !, ?, -, _)';
        reqEspecial.className = 'requisito ' + (especialValida ? 'valid' : 'invalid');
    }
    
    return longitudValida && mayusculaValida && minusculaValida && numeroValida && especialValida;
}

/**
 * Inicializa el formulario de registro y configura los eventos.
 */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formRegistro');
    const passwordInput = document.getElementById('password');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validarRequisitosPassword);
    }
    
    // mostrarUsuariosEnConsola();  // Ya no se utiliza (datos en backend)
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        limpiarErrores();
        
        const nombre = document.getElementById('nombreCompleto').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        let isValid = true;
        
        if (nombre === '') {
            mostrarError('errorNombre', 'El nombre completo es obligatorio');
            isValid = false;
        } else if (nombre.length < 3) {
            mostrarError('errorNombre', 'El nombre debe tener al menos 3 caracteres');
            isValid = false;
        }
        
        if (email === '') {
            mostrarError('errorEmail', 'El correo electrónico es obligatorio');
            isValid = false;
        } else if (!validarEmail(email)) {
            mostrarError('errorEmail', 'Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)');
            isValid = false;
        }
        // La verificación de duplicados ahora se realiza en el backend
        // (se elimina emailExiste porque se basa en localStorage)
        
        if (telefono === '') {
            mostrarError('errorTelefono', 'El número de teléfono es obligatorio');
            isValid = false;
        } else if (!validarTelefono(telefono)) {
            mostrarError('errorTelefono', 'Ingrese un número de teléfono válido (mínimo 7 dígitos)');
            isValid = false;
        }
        
        if (password === '') {
            mostrarError('errorPassword', 'La contraseña es obligatoria');
            isValid = false;
        } else if (password.length < 8) {
            mostrarError('errorPassword', 'La contraseña debe tener al menos 8 caracteres');
            isValid = false;
        } else if (!validarRequisitosPassword()) {
            mostrarError('errorPassword', 'La contraseña no cumple con todos los requisitos');
            isValid = false;
        }
        
        if (confirmPassword === '') {
            mostrarError('errorConfirmPassword', 'Debe confirmar su contraseña');
            isValid = false;
        } else if (password !== confirmPassword) {
            mostrarError('errorConfirmPassword', 'Las contraseñas no coinciden');
            isValid = false;
        }
        
        if (isValid) {
            // Construir el cuerpo de la petición según el DTO RegisterRequestDTO
            const requestBody = {
                nombre: nombre,
                correo: email,
                telefono: telefono,
                contrasena: password
            };

            fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message || 'Error en el registro');
                }
                return response.json();
            })
            .then(data => {
                const mensajeExito = document.getElementById('mensajeExito');
                mensajeExito.style.display = 'block';
                setTimeout(() => {
                    window.location.href = '/pages/login/login.html';
                }, 3000);
            })
            .catch(error => {
                console.error('Error en registro:', error);
                alert('No se pudo completar el registro. ' + error.message);
            });
        }
    });
    
    // =========================================================
    // Funciones auxiliares (localStorage ya no se usa, se comentan)
    // =========================================================
    
    /*
    function guardarUsuario(usuario) {
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        usuarios.push(usuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    function emailExiste(email) {
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        return usuarios.some(usuario => usuario.email === email);
    }
    
    function mostrarUsuariosEnConsola() {
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        if (usuarios.length === 0) {
            console.log('No hay usuarios registrados aún');
        } else {
            console.log(`Usuarios registrados (${usuarios.length}):`);
            usuarios.forEach((usuario, index) => {
                console.log(`${index + 1}. ${usuario.nombreCompleto} - ${usuario.email}`);
            });
        }
    }
    
    function resetearEtiquetas() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
            input.dispatchEvent(new Event('input'));
        });
    }
    */
    
    /**
     * Valida el formato de un correo electrónico.
     * @param {string} email - Correo a validar.
     * @returns {boolean} True si el formato es válido.
     */
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    /**
     * Valida que el teléfono contenga al menos 7 dígitos numéricos.
     * @param {string} telefono - Teléfono a validar.
     * @returns {boolean} True si es válido.
     */
    function validarTelefono(telefono) {
        const digitos = telefono.replace(/\D/g, '');
        return digitos.length >= 7;
    }
    
    /**
     * Muestra un mensaje de error en el elemento indicado.
     * @param {string} elementId - ID del elemento HTML.
     * @param {string} mensaje - Texto del error.
     */
    function mostrarError(elementId, mensaje) {
        const errorSpan = document.getElementById(elementId);
        errorSpan.textContent = mensaje;
        errorSpan.style.display = 'block';
    }
    
    /**
     * Limpia todos los mensajes de error del formulario.
     */
    function limpiarErrores() {
        const errores = document.querySelectorAll('.error');
        errores.forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
    }
});