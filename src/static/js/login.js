// en esta version del login quiero hacer parecido a lo que tenia hace tiempo atras, quiero limpiar el rut y juntarlo con el
//digito verificador ademas de añadir un catch error que antes no tenia en mis primeros avances, por que prefiero hacerlo de nuevo y no copiarlo?
//prefiero usar lo anterior como una guia mas que llegar y copiar, siempre se puede hacer mas compacto el codigo asi que al hacerlo de nuevo puedo
//mejorarlo ademas de poder añadir cosas nuevas de lo que voy aprendiendo
function formatearRut(rut) {
    let valor = rut.replace(/[.-]/g, '');
    if (!valor) return '';
    // lo de arriba limpia el rut y retorna vacio si esta vacio
    let dv = valor.slice(-1).toUpperCase();
    if (!/^[0-9K]$/.test(dv)) dv = '';
    // con esto se verifica que el ultimo numero sea apto para el verificador o tambien verifica si es K
    let cuerpo = valor.slice(0,-1);
    // aqui le digo que el cuerpo es todo menos el ultimo caracter, esto para el caso que alguien tenga 7 digitos de rut y no 8
    if (!cuerpo) return dv;
    if (!/^\d+$/.test(cuerpo)) return valor;
    // muestra los caracteres invalidos y si no existe el cuerpo solo muestra el dv si es valido
    if (cuerpo.length > 8) cuerpo = cuerpo.slice(0, 8);
    // limite de 8 digitos en el cuerpoo
    let cuerpoFormateado = '';
    for (let i = cuerpo.length; i > 0; i -= 3) {
        if (i < 3) cuerpoFormateado = cuerpo.slice(0, i) + cuerpoFormateado;
        else cuerpoFormateado = '.' + cuerpo.slice(i - 3, i) + cuerpoFormateado;
    }
    //se supone que sto deberia poner puntos cada 3 digitos, la idea es que no tenga problemas con los estes de 7 digitos
    cuerpoFormateado = cuerpoFormateado.replace(/^\./, '');
    return dv ? cuerpoFormateado + '-' + dv : cuerpoFormateado;
    //elimina el punto inicial si ya existe y retorna el rut+guion+dv para que se le muestre asi al usuario
}

document.getElementById('identificador').addEventListener('input', function(e) {
    let valor = e.target.value;
    //aplica el formato de manera mediante el rut
    let cursorPos = e.target.selectionStart;
    let longitudAnterior = valor.length;
    //guarda la posicion del cursor, para que? nose la vrd pero vi en un post de stackoverflow que era buena practica esto
    valor = valor.replace(/[^0-9kK]/g, '');
    valor = valor.replace(/k/g, 'K');
    if (valor.length > 9) valor = valor.slice(0, 9);
    //si existe mas de 9 digitos en el valor total lo corta(truncar para los lolos)
    let valorFormateado = formatearRut(valor);
    e.target.value = valorFormateado;
    let nuevaLongitud = valorFormateado.length;
    let diferencia = nuevaLongitud - longitudAnterior;
    if (cursorPos + diferencia <= nuevaLongitud) {
        e.target.setSelectionRange(cursorPos + diferencia, cursorPos + diferencia);
    }
    //todo esto deberia pocisionar la cuestion del cursor como buena practica que es segun un tipo de stack overflow que se llama Mike Berrow
});

function validarFormatoRut(rutCompleto) {
    // esta funcion la voy a usar para validar el formato del rut
    let rutLimpio = rutCompleto.replace(/[.-]/g, '');
    // limpio el rut, le quito los puntos y guion para la base de datos
    if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
    //verifico que el rut tenga entre 8 a 9 caracteres en total contando el digito verificador
    let dv = rutLimpio.slice(-1).toUpperCase();
    return /^[0-9K]$/.test(dv);
    // extraigo el cuerpo y digito verificador, debo revisar la base por que no se si acepta la K como valor.
    // if (!/^\d+$/.test(cuerpo)) return false;
    // if (!/^[0-9K]$/.test(dv)) return false;
    // // aqui valido si es numero o una K
    // let suma = 0;
    // let multiplo = 2;
    // // y por aqui intento calcular el numero del digito verificador, lo vi en stack overflow y decidi añadirlo, nada especial la vrd es solo curiosidad(lo estuve probando esta asqueroso xd)
    // for (let i = cuerpo.length - 1; i >= 0; i--) {
    //     suma += parseInt(cuerpo.charAt(i)) * multiplo;
    //     multiplo = multiplo === 7 ? 2 : multiplo + 1;
    // }
    // //calcula la suma para el algoritmo, mas matematicaaasssss
    // let resto = suma % 11;
    // let dvEsperado = 11 - resto;
    // if (dvEsperado === 11) dvEsperado = '0';
    // else if (dvEsperado === 10) dvEsperado = 'K';
    // else dvEsperado = dvEsperado.toString();
    // return dv === dvEsperado;
}
// aqui un document para mandar el envio del formulario
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.querySelector('.btn-login');
    const originalText = btn.innerHTML;
    const rutInput = document.getElementById('identificador');
    const passwordInput = document.getElementById('password');
    // aqui valido el rut antes de enviarlo a la base de datos todo sanitizado my sangre
    let rutFormateado = rutInput.value.trim();
    if (!rutFormateado) {
        Swal.fire('Error', 'Por favor ingrese su RUT', 'error');
        rutInput.focus();
        return;
    }
    //mensaje de alerta que pide ingresar el rut
    if (!validarFormatoRut(rutFormateado)) {
        Swal.fire('Error', 'RUT invalido. Ejemplo: 12.345.678-9', 'error');
        rutInput.focus();
        return;
    }
    if (!passwordInput.value.trim()) {
        Swal.fire('Error', 'Ingrese la contraseña', 'error');
        passwordInput.focus();
        return;
    }
    //aqui le estoy requiriendo al usuario que ingrese alguna contraseña
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...';
    btn.disabled = true;
    //innerHTML siempre me da problemas, no se por que. Es autoexplicativo , spinner y desactiva el boton
    let rutLimpio = rutFormateado.replace(/[.-]/g, '');
    let rutNumero = parseInt(rutLimpio.slice(0, -1), 10); //espero esto se entienda, aqui basicamente estoy separando el cuerpo del digito ya sea 7 u 8
    let dv = rutLimpio.slice(-1); // aqui solo seteo el dv
    // const data = { rut: rut, dv: dv, password: passwordInput.value };
    // aqui hago un envio del rut y el dv por separado
    // try {
    //     const response = await fetch('/api/login', {method: 'POST',headers: { 'Content-Type': 'application/json' },body: JSON.stringify(data)
    //     });
    try {
        // console.log('Enviando sus datos:', { rut: rut, dv: dv, password: '******'}); // HOLAAAAA esto es para debug y ver si todo llega bien
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rut: rutNumero, dv: dv, password: passwordInput.value })
    });
    //yico yico fetch mi amigo que no siempre me sirve pero siempre esta
    // .then(response => {
    //     if (!response.ok) {
    //         return response.json().then(err => { throw err;});
    //     }
    //     return response.json();
    // }) // this may be converted to my bolas no va a pasar, en el mejor de lo casos
        const result = await response.json();
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Bienvenido',
                text: 'Iniciando sesion...',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = result.redirect || '/dashboard';
            });
        } else {
            // login cago
            Swal.fire('Error', result.message || 'Credenciales incorrectas', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
        
    } 
    catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
    // lptm que sueño colegaaaaaaaAAAAAA
});

// document.getElementById('togglePassword')?.addEventListener('click', function() {
//     const password = document.getElementById('password');
//     const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
//     password.setAttribute('type', type);
//     const icon = this.querySelector('i');
//     icon.classList.toggle('bi-eye');
//     icon.classList.toggle('bi-eye-slash');
// });
// revisando no se por que me daba 2 ojitos para la cotraseña, veo y me doy cuenta que tengo lo mismo en el login xd, bueno lo dejo por que me parece gracioso, por ahora
// window.location.href = '/api/taller-ac/<int:id_taller>';
// window.location.href = 'funcionario/administracion_taller.html';
// window.location.href = `/dashboard/settings`;
// window.location.href = `/dashboard/settings`;