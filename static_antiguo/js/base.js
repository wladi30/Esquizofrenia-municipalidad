document.addEventListener('DOMContentLoaded', function() {
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 60000);
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

function actualizarFechaHora() {
    const fechaHoraElement = document.getElementById('fechaHora');
    if (fechaHoraElement) {
        const ahora = new Date();
        const opciones = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        fechaHoraElement.textContent = ahora.toLocaleDateString('es-ES', opciones);
    }
    actualizarFechaOffcanvas();
}

function actualizarFechaOffcanvas() {
    const fechaMovil = document.getElementById('fechaMovil');
    if (fechaMovil) {
        const ahora = new Date();
        const opciones = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        fechaMovil.textContent = ahora.toLocaleDateString('es-ES', opciones);
    }
}

function handleLogout(e) {
    e.preventDefault();
    Swal.fire({
        title: '¿Cerrar Sesion?',
        text: '¿Estas seguro de que deseas cerrar sesion?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Si, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const logoutUrl = document.getElementById('logoutBtn')?.getAttribute('href') || '/logout';
            window.location.href = logoutUrl;
        }
    });
}

function validarFormulario(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let valido = true;
    inputs.forEach(input => {
        if (!input.ariaValueMax.trim()) {
            input.classList.add('is-invalid');
            valido =  false;
        }
        else {
            input.classList.remove('is-invalid');
        }
    });
    return valido;
}

function limpiarFormulario(formId) {
    const form = document.getElementById(formId);
    form.reset();
    form.querySelectorAll('is-invalid', 'is-valid').forEach(el => {
        el.classList.remove('is-invalid', 'is-valid');
    });
}

function formatearFecha(fechaString) {
    if (!fechaString) return 'no especificado';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

async function fechaData(url, options ={}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Error HTTP: ${response.status}');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error en fetchData:', error);
        throw error;
    }
}

function mostrarError(mensaje) {
    console.error('Error:', mensaje);
    alert(mensaje);
}