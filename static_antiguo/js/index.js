document.addEventListener('DOMContentLoaded', function() {
    cargarEstadisticas();
});
async function cargarEstadisticas() {
    try {
        document.getElementById('totalEstudiantes').textContent = '0';
        document.getElementById('totalProfesores').textContent = '0';
        document.getElementById('totalTalleres').textContent = '0';
        document.getElementById('totalEspera').textContent = '0';
    }
    catch (error) {
        console.error('Error cargando estadisticas:', error);
    }
}