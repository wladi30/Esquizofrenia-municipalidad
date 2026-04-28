// Al principio del archivo, despues de la clase, agrega:
console.log('DEBUG - estudiante.js cargado');

class EstudianteApp {
    constructor() {
        console.log('DEBUG - Constructor de EstudianteApp');
        this.talleres = [];
        this.tallerSeleccionado = null;
        this.filtros = {
            busqueda: '',
            categoria: '',
            año: new Date().getFullYear(),
            estado: ''
        };
        
        this.init();
    }

    init() {
        console.log('DEBUG - Iniciando app');
        this.cargarDatosIniciales();
        this.configurarEventos();
    }

    async cargarDatosIniciales() {
        console.log('DEBUG - Cargando datos iniciales');
        try {
            const sessionResp = await fetch('/debug-session');
            const sessionData = await sessionResp.json();
            console.log('DEBUG - Session data:', sessionData);
            
            if (!sessionData.user_id) {
                window.location.href = '/login';
                return;
            }
            await this.cargarTalleres();
            await this.cargarCategorias(); // Asegurar que se ejecuta
            this.actualizarUISegunPagina();
            
        } catch (error) {
            console.error('Error en inicializacion:', error);
            this.mostrarMensaje('Error al cargar la aplicacion', 'error');
        }
    }

    async cargarCategorias() {
        console.log('DEBUG - Ejecutando cargarCategorias');
        try {
            const response = await fetch('/api/categorias');
            console.log('DEBUG - Response status:', response.status);
            
            const data = await response.json();
            console.log('DEBUG - Datos de categorias:', data);
            
            // Verificar la estructura de la respuesta
            if (data.success && Array.isArray(data.categorias)) {
                const categoriaSelect = document.getElementById('categoria');
                if (categoriaSelect) {
                    console.log('DEBUG - Select de categorias encontrado');
                    
                    // Limpiar y llenar el select
                    let opciones = '<option value="">TODAS LAS CATEGORiAS</option>';
                    data.categorias.forEach(c => {
                        // Asegurar que los nombres de propiedades coinciden
                        const id = c.ID_CATEGORIA || c.id_categoria;
                        const desc = c.DESCRIPCION_CATEGORIA || c.descripcion_categoria;
                        opciones += `<option value="${id}">${desc}</option>`;
                        console.log(`DEBUG - Agregando opción: ${id} - ${desc}`);
                    });
                    
                    categoriaSelect.innerHTML = opciones;
                    console.log('DEBUG - Select actualizado con', data.categorias.length, 'opciones');
                } else {
                    console.error('DEBUG - No se encontró el elemento select#categoria en el DOM');
                }
            } else {
                console.error('DEBUG - La respuesta no tiene el formato esperado:', data);
            }
        } catch (error) {
            console.error('ERROR EN CARGAR CATEGORIAS:', error);
        }
    }

    async cargarTalleres() {
        console.log('DEBUG - Cargando talleres...');
        try {
            this.mostrarCargando(true);
            const response = await fetch('/api/talleres/list', {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('DEBUG - Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('DEBUG - Datos de talleres recibidos:', data);
            
            if (data.success) {
                this.talleres = data.data || [];
                console.log('DEBUG - Talleres procesados:', this.talleres.length);
                this.aplicarFiltros();
            } else {
                throw new Error(data.message || 'Error al cargar talleres');
            }
            
        } catch (error) {
            console.error('Error cargando talleres:', error);
            this.mostrarMensaje('Error al cargar talleres: ' + error.message, 'error');
        } finally {
            this.mostrarCargando(false);
        }
    }

    // El resto de los metodos permanecen igual...
}

// Asegurar que la app se inicializa
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG - DOM completamente cargado');
    app = new EstudianteApp();
    window.app = app;
});