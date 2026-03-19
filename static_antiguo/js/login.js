document.addEventListener('DOMContentLoaded', function() {
    const fechaInput = document.getElementById('registerFechaNacimiento');
    if (fechaInput) {
        const hoy = new Date();
        const maxFecha = new Date(hoy.getFullYear() - 15, hoy.getMonth(), hoy.getDate());
        const minFecha = new Date(hoy.getFullYear() - 100, hoy.getMonth(), hoy.getDate());
        
        fechaInput.max = maxFecha.toISOString().split('T')[0];
        fechaInput.min = minFecha.toISOString().split('T')[0];
        fechaInput.value = maxFecha.toISOString().split('T')[0];
    }
    const rutInput = document.getElementById('registerRut');
    if (rutInput) {
        rutInput.addEventListener('input', function(e) {
            let rut = e.target.value.replace(/\D/g, '');
            if (rut.length > 8) {
                rut = rut.substring(0, 8);
            }
            let rutFormateado = '';
            if (rut.length > 0) {
                if (rut.length <= 3) {
                    rutFormateado = rut;
                } else if (rut.length <= 6) {
                    rutFormateado = rut.substring(0, rut.length - 3) + '.' + rut.substring(rut.length - 3);
                } else {
                    rutFormateado = rut.substring(0, rut.length - 6) + '.' + rut.substring(rut.length - 6, rut.length - 3) + '.' + rut.substring(rut.length - 3);
                }
            }
            e.target.value = rutFormateado;
            if (rut.length >= 7) {
                const dv = calcularDV(rut);
                const dvInput = document.getElementById('registerDv');
                dvInput.value = dv;
                dvInput.classList.add('is-valid');
                dvInput.classList.remove('is-invalid');
                rutInput.classList.add('is-valid');
                rutInput.classList.remove('is-invalid');
            } else if (rut.length > 0) {
                const dvInput = document.getElementById('registerDv');
                dvInput.value = '';
                dvInput.classList.remove('is-valid', 'is-invalid');
                rutInput.classList.remove('is-valid', 'is-invalid');
            } else {
                const dvInput = document.getElementById('registerDv');
                dvInput.value = '';
                dvInput.classList.remove('is-valid', 'is-invalid');
                rutInput.classList.remove('is-valid', 'is-invalid');
            }
        });
    }
    const tipoSelect = document.getElementById('registerTipo');
    if (tipoSelect) {
        tipoSelect.addEventListener('change', function() {
            const camposProfesor = document.getElementById('camposProfesor');
            const profesionInput = document.getElementById('registerProfesion');
            const resumenInput = document.getElementById('registerResumen');
            
            if (this.value === 'PROFESOR') {
                camposProfesor.classList.remove('d-none');
                if (profesionInput) profesionInput.required = true;
                if (resumenInput) resumenInput.required = true;
            } else {
                camposProfesor.classList.add('d-none');
                if (profesionInput) {
                    profesionInput.required = false;
                    profesionInput.value = '';
                }
                if (resumenInput) {
                    resumenInput.required = false;
                    resumenInput.value = '';
                }
            }
        });
    }
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            actualizarFortalezaContrasena(this.value);
        });
    }
    const confirmInput = document.getElementById('registerPasswordConfirm');
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            validarCoincidenciaContrasena();
        });
    }
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const identificador = document.getElementById('loginIdentificador').value.trim();
            const password = document.getElementById('loginPassword').value;
            if (!identificador || !password) {
                mostrarMensaje('loginError', 'Por favor completa todos los campos');
                return;
            }
            const boton = this.querySelector('button[type="submit"]');
            const textoOriginal = boton.innerHTML;
            boton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Verificando...';
            boton.disabled = true;
            ocultarMensaje('loginError');
            ocultarMensaje('loginSuccess');
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificador, contrasena: password })
                });
                const resultado = await response.json();
                if (resultado.success) {
                    mostrarMensaje('loginSuccess', 'Autenticacion exitosa');
                    localStorage.setItem('userData', JSON.stringify(resultado.datos));
                    setTimeout(() => {
                        if (resultado.datos.TIPO_USUARIO === 'ADMIN') {
                            window.location.href = '/estudiantes';
                        } else if (resultado.datos.TIPO_USUARIO === 'PROFESOR') {
                            window.location.href = '/profesores';
                        } else {
                            window.location.href = '/talleres';
                        }
                    }, 1000);
                } 
                else {mostrarMensaje('loginError', resultado.message);}
            } 
            catch (error) {mostrarMensaje('loginError', 'Error de conexion');} finally {boton.innerHTML = textoOriginal; boton.disabled = false;
            }
        });
    }
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            let rut = document.getElementById('registerRut').value.trim().replace(/\D/g, '');
            const dv = document.getElementById('registerDv').value.trim().toUpperCase();
            const pasaporte = document.getElementById('registerPasaporte').value.trim();
            if (!rut && !pasaporte) {
                mostrarMensaje('registerError', 'Debes ingresar RUT o Pasaporte');
                return;
            }
            if (rut && !validarRUT(rut, dv)) {
                mostrarMensaje('registerError', 'RUT invalido');
                return;
            }
            const password = document.getElementById('registerPassword').value;
            const confirm = document.getElementById('registerPasswordConfirm').value;
            if (password !== confirm) {
                mostrarMensaje('registerError', 'Las contraseñas no coinciden');
                return;
            }
            if (password.length < 6) {
                mostrarMensaje('registerError', 'La contraseña debe tener al menos 6 caracteres');
                return;
            }
            const tipoUsuario = document.getElementById('registerTipo').value;
            if (tipoUsuario === 'PROFESOR') {
                const profesion = document.getElementById('registerProfesion').value.trim();
                const resumen = document.getElementById('registerResumen').value.trim();
                if (!profesion || profesion.length < 3) {
                    mostrarMensaje('registerError', 'La profesion es requerida');
                    return;
                }
                if (!resumen || resumen.length < 10) {
                    mostrarMensaje('registerError', 'El resumen curricular es requerido');
                    return;
                }
            }
            const datos = {
                rut_persona: rut || null,
                dv_persona: dv || null,
                pasaporte: pasaporte || null,
                nombre_persona: document.getElementById('registerNombre').value.trim(),
                apellido_paterno: document.getElementById('registerApellido').value.trim().split(' ')[0] || '',
                apellido_materno: document.getElementById('registerApellido').value.trim().split(' ').slice(1).join(' ') || '',
                fec_nacimiento: document.getElementById('registerFechaNacimiento').value,
                genero: document.getElementById('registerGenero').value,
                telefono: document.getElementById('registerTelefono').value.trim(),
                correo_electronico: document.getElementById('registerEmail').value.trim().toLowerCase(),
                calle: document.getElementById('registerCalle').value.trim(),
                id_comuna: document.getElementById('registerComuna').value,
                id_pais: document.getElementById('registerPais').value,
                tipo_usuario: tipoUsuario,
                contrasena: password
            };
            if (tipoUsuario === 'PROFESOR') {
                datos.profesion = document.getElementById('registerProfesion').value.trim();
                datos.resumen_curricular = document.getElementById('registerResumen').value.trim();
            }
            const boton = this.querySelector('button[type="submit"]');
            const textoOriginal = boton.innerHTML;
            boton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Registrando...';
            boton.disabled = true;
            ocultarMensaje('registerError');
            ocultarMensaje('registerSuccess');
            try {
                console.log(datos)
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });
                const resultado = await response.json();
                if (resultado.success) {
                    mostrarMensaje('registerSuccess', 'Registro exitoso, Redirigiendo...');
                    
                    setTimeout(() => {
                        document.getElementById('login-tab').click();
                        document.getElementById('loginIdentificador').value = datos.correo_electronico;
                        registerForm.reset();
                        document.getElementById('camposProfesor').classList.add('d-none');
                        document.getElementById('passwordStrengthBar').style.width = '0%';
                        document.getElementById('passwordStrengthText').textContent = '';
                        document.getElementById('passwordMatch').textContent = '';
                    }, 2000);
                } 
                else {mostrarMensaje('registerError', resultado.message);}
            }
            catch (error) {mostrarMensaje('registerError', 'Error de conexion');
            } finally {
                boton.innerHTML = textoOriginal;
                boton.disabled = false;
            }
        });
    }
});

function calcularDV(rut) {
    let suma = 0;
    let multiplicador = 2;
    for (let i = rut.length - 1; i >= 0; i--) {
        suma += parseInt(rut.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = suma % 11;
    const dv = 11 - resto;
    if (dv === 11) return '0';
    if (dv === 10) return 'K';
    return dv.toString();
}
function validarRUT(rut, dv) {
    if (!rut || !dv) return false;
    const rutLimpio = rut.toString().replace(/\D/g, '');
    if (rutLimpio.length < 7) return false;
    const dvCalculado = calcularDV(rutLimpio);
    return dvCalculado === dv.toUpperCase();
}
function actualizarFortalezaContrasena(password) {
    const barra = document.getElementById('passwordStrengthBar');
    const texto = document.getElementById('passwordStrengthText');
    if (!barra || !texto) return;
    let fortaleza = 0;
    let mensaje = '';
    let color = '';
    if (password.length >= 8) fortaleza++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) fortaleza++;
    if (/\d/.test(password)) fortaleza++;
    if (/[^A-Za-z0-9]/.test(password)) fortaleza++;
    const porcentaje = fortaleza * 25;
    switch(fortaleza) {
        case 0:
        case 1:
            color = 'danger';
            mensaje = 'Debil';
            break;
        case 2:
            color = 'warning';
            mensaje = 'Moderada';
            break;
        case 3:
        case 4:
            color = 'success';
            mensaje = 'Fuerte';
            break;
    }
    barra.style.width = porcentaje + '%';
    barra.className = 'progress-bar bg-' + color;
    texto.textContent = 'Seguridad: ' + mensaje;
}
function validarCoincidenciaContrasena() {
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerPasswordConfirm').value;
    const mensaje = document.getElementById('passwordMatch');
    if (!mensaje) return;
    if (confirm.length === 0) {
        mensaje.textContent = '';
        mensaje.className = 'text-muted';
    } else if (password === confirm) {
        mensaje.textContent = 'Las contraseñas coinciden';
        mensaje.className = 'text-success';
    } else {
        mensaje.textContent = 'Las contraseñas no coinciden';
        mensaje.className = 'text-danger';
    }
}
function mostrarMensaje(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = texto;
        elemento.classList.remove('d-none');
    }
}
function ocultarMensaje(id) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.classList.add('d-none');
    }
}