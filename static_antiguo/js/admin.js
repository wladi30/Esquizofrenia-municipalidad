let sidebarCollapsed = false;
document.addEventListener('DOMContentLoaded', function() {
    actualizarFechaHora();
    setInterval(actualizarFechaHora, 60000);
    
    setupSidebarToggle();
    setupLogout();
});
function setupSidebarToggle() {
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 1024) {
                closeSidebar();
            }
        });
    });
    window.addEventListener('resize', handleWindowResize);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar.classList.contains('show')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function handleWindowResize() {
    if (window.innerWidth > 1024) {
        closeSidebar();
    }
}

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
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function handleLogout(e) {
    e.preventDefault();
    
    Swal.fire({
        title: '¿Cerrar Sesion?',
        text: '¿Estas seguro de que deseas cerrar sesión?',
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

function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
    Swal.fire({
        icon: tipo,
        title: titulo,
        text: mensaje,
        confirmButtonText: 'OK'
    });
}

function confirmarAccion(titulo, mensaje, callback) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Si, continuar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            callback();
        }
    });
}
