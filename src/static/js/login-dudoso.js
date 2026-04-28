// actualmente existen 2 login, este y al que renombre login-old, el login old esta mucho mejor estructurado que este pero la razon de por que utilizo este y no el otro es por que cambie mucho
// la logica de como funcionan , el anterior hacia de todo pero ahora lo segmente , las validaciones se estan ahciendo en el procedimiento almacenado, de este modo es mas seguro ademas
// el validador de dv estara en db_test para hacerlo mas facil, pero en la base de datos tambien tengo como validar el dv, al menos separarlo de numeric a char
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.querySelector('.btn-login');
    const originalText = btn.innerHTML;
    const rutInput = document.getElementById('identificador');
    const passwordInput = document.getElementById('password');
    // lo de aqui arriba es lo de siempre , 2 inputs que tomaran el identificador ya se rut o correo(no por ahora) y el 
    // input de abajo que se encargara de la contraseña, esto viene de html el login

    if (!rutInput.value.trim()) {alert('Por favor ingrese su RUT');
        rutInput.focus();
        return;
    }
    // esto hace que se tenga que ingresar un rut en el caso de que no ponga nada
    if (!validarRut(rutInput.value)) {alert('RUT invalido. Ejemplo: 12.345.678-9');
        rutInput.focus();
        return;
    }
    // esto valida que el rut cumpla con los entandares
    if (!passwordInput.value.trim()) {alert('Ingrese la contraseña');
        passwordInput.focus();
        return;
    }
    // lo mismo pero para la contraeña , con esto estoy validando que se coloque una contraseña

    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...';
    btn.disabled = true;
    // el mensajito de ingreso

    let rutLimpio = rutInput.value.replace(/[.-]/g, '');
    let rut = rutLimpio.slice(0, -1);
    let dv = rutLimpio.slice(-1);
    // impieza de rut, lo hago para poder sacarel digito verificador del rut, asi de este modo puedo saber si esta 
    // el video de aqui explica arto las matematicas para lo del rut, tambien cosas basicas para poder aplica esa logica aqui https://youtu.be/ntg5wKIQq-Q

    const data = { rut: rut, dv: dv, password: passwordInput.value };
    // almacena en el data el rut, dv y la contraseña, despues de aplicar toda la logica de arriba

    fetch('/api/login', {method: 'POST',headers: {'Content-Type': 'application/json'},body: JSON.stringify(data)})
    // este es el inicio del fetch para el login que esta en el app_principal, alli se encuntra el tema del login, logout y demas
    .then(async response => {
        const contentType = response.headers.get('content-type');
        if (!response.ok) {
            if (contentType && contentType.includes('application/json')) {const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            } 
            else {
                const text = await response.text();
                console.error('Respuesta no-JSON:', text.substring(0, 200));
                throw new Error('Error del servidor');
            }
        }
        if (contentType && contentType.includes('application/json')) {return response.json();
        } 
        else {throw new Error('Respuesta invalida del servidor');
        }
    })
    .then(data => {
        if (data.success) {window.location.href = data.redirect;
        }
        else {alert(data.message || 'Error al iniciar sesión');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    // si sale todo bien deberia tirar al redirect y poder avanzar a otras paginas, si no bueno te dara el mensaje
    })
    .catch(error => {console.error('Error detallado:', error);
        let mensajeError = 'Error de conexión: ';
        mensajeError += error.message || 'Intente nuevamente.';
        alert(mensajeError);
        btn.innerHTML = originalText;
        btn.disabled = false;
    // aqui solo es un catch erro
    });
});