// https://youtu.be/l50gnBWHmdA
// Este video explica vien el tema de los imports y exports ademas de dar muchos ejemplos de como aplicar esto, desde dinamicos a import masivos de un js a otro, recomiendo ver dde nuevo
// estoy haciendo un import de general que trae la constante currentYearV2, esta me da el año actual el cual que lo usare como
import {currentYearV2} from "./general"
// Aqui doy inicio al js principal que se encargara de casi todo sobre administracion de talleres

// el de aca sera lo que definira a lo que se muestra en la pag de talleres, aqui hare definiciones de cuandos talleres se muestran por pagina al igual que setear cuales seran los filtros
const GestionTalleres = {
    // Van a estar aqui la configuracion y los datos junto con el estado de la app en si, esta parte se 
    configuracion: {
        paginaActual: 1,
        itemsPorPagina: 30,
        filtros: {
            // esto es suponiendo el año, se tiene que hacer de manera automatica.
            year: currentYearV2,
            estado: '',
            busqueda: ''
        },
        // aqui van a almacenar todos los datos de talleres, talleristas y las categorias de las cuales se usaran para los filtros, los otros 2 seran los que se muestren en pantalla
        datos: {
            talleres: [],
            categorias: [],
            talleristas: [],
        },
        // EliminacionVerdaderaDeTaller sera la eliminacion completa del dato de dicho taller, eliminar el taller de la base de datos
        EliminacionVerdaderaDeTaller: null
    },
    // aqui sera la funcion inicial que tendra gestion talleres, cargando datos iniciales, cargar talleres y bindeo de eventos(aun tengo que ver que pongo aqui)
    inicializando: function() {
        console.log("Inicializando GestionTalleres...");
        this.cargarDatosIniciales();
        this.cargarTalleres();
        this.bindEventos();
    },
    // aqui estan los datos que se cargaran al acceder a la pagina, estos son los talleristas y categorias, tengo planeado que desde categorias salgan los talleres de dicha categoria
    // asi de este modo sera mas facil la busqueda, aun que tambien podria poner una forma de simplemente poner el nombre del taller para encontrarlo de inmediato sin tener que
    // para por toda una sesion de busqueda de dicha cosa
    cargarDatosIniciales: function() {
        this.cargarCategorias();
        this.cargarTalleristasSelect();
    },
    // 
    cargarCategorias: function() {
        fetch('/funcionario/api/categoria')
            .then(response => response.json())
            .then(data => {
                // aqui lo pase a convertir en un array
                this.config.data.categorias = data;
                const selectCategoria = document.getElementById('categoria');
                // aqui lo que hago (ademas de ponerle un texto para mayor indicacion) le coloco un valor por default , si no tiene esto puede dar un error
                selectCategoria.innerHTML = '<option value="">Seleccione categoría...</option>';
                data.forEach(cat => {
                    // hago uso de la id categoria y descripcion de la base dedatos, podria tambien usdar las que tengo creadas en mi app de funcionario
                    const option = document.createElement('option');
                    option.value = cat.ID_CATEGORIA;
                    option.textContent = cat.DESCRIPCION_CATEGORIA;
                    selectCategoria.appendChild(option);
                });
            })
            // un catch simplemente, tal vez le podria poner un log para mas debug?
            .catch(error => {
                console.error('Error cargando categorías:', error);
                this.mostrarError('No se pudieron cargar las categorías.');
            });
    },
    // aqui va la parte d elos talleristas
    cargarTalleristasSelect: function(){
        // contruire primero las urls despues seguimos con los filtros
        fetch('funcionario/api/tallerista-lista')
        .then(response => response.json())
        .then(result => {
            if (result.succes){
                this.config.data.talleristas = result.data;
                const selectTallerista = document.getElementById('tallerista');
                // option value, la idea que esto muestre un valor default
                selectTallerista.innerHTML = '<option value="">Aun no se que poner aqui asi que hola 23/03</option>'
                result.data.forEach(t => {
                    const option = document.createElement('option');
                    option.value = t.ID_PROFESOR;
                    option.textContent = `${t.NOMBRE_PERSONA} ${t.APELLIDO_PATERNO || ''}`.trim();
                    selectTallerista.appendChild(option);
                });
            }
            // solucion simple
            else {
                this.mostrarError('Error al cargar a los talleristas: ' + result.message);
            }
        })
        .catch(error =>{
            console.error('Error al cargar a los talleristas: ', error);
            this.mostrarError('Error al cargar a los talleristas');
        })
    },
    cargarTalleres: function(){
        // aqui estoy haciendo los filtros que usare en cargar taller, year y estado seran valores mas simples de poner, year es solo el año que deberia ser automatico ademas de poder colocar los años anteriores
        // y estado seran los estados del 1 al 4 que se encuentran los talleres
        const params = new URLSearchParams();
        if (filtros.year) params.append('year', filtros.year);
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        // html que deberia mostrar el indicador de la carga de la tabla, es solo algo visual debo buscar los iconos en bt
        document.getElementById('tablaTalleresCuerpo').innerHTML = `{aqui deberia ir algo .html, debo ver que colocar}`
        fetch(`/funcionario/api/taller-lista?${params.toString()}`)
            .then(response => response.json())
            .then(result => {
                // ATENCION recuerda que aqui aun no existe nada, tambien los innerHTML de esta funcion aun no tienen nada valido, asi que tengo que solucionarlo
                // solo deberia poner unos cuantos iconos en los innerHTML, por lo demas debo ver que ocuure de resultado, podria ser mostrarPagina pero lo veo despues.
                if (result.succes) {

                }
                else {
                    this.mostrarError(result.message);
                    document.getElementById('tablaTalleresCuerpo').innerHTML =`{aqui lo mismo, deberia ir algo relacionado con errores en cargar los datos}`;
                }
            })
            .catch(error => {
                console.error('', error);
                this.mostrarError('');
                document.getElementById('tablaTalleresBody').innerHTML = `{ aqui algo relacionado con errores de conexion}`;
            });
    },
    // esto genera un html para la fila de tabla taller, esto deberia dar pie a que en la lista se muestren bien los talleres
    generarFilaTaller: function(t){
        const inscritos = t.personas_inscritas || 0;
        const maximo = t.MAXMIMO_ESTUDIANTE || 20;
        const porcentaje = maximo > 0 ? (inscritos / maximo) * 100 : 0;
        let estadoClass = '', estado = '';
        // aqui pondre todos los estados de taller , son solo 4 por defecto pondre el estado 3(cerrado) como el predeterminado
        switch (t.ID_ESTADO_TALLER) {
            case 1: estadoClass = 'estado 1' ; estadoTexto = 'INGRESADO';
            case 2: estadoClass = 'estado 2' ; estadoTexto = 'CALENDARIZADO';
            case 3: estadoClass = 'estado 3' ; estadoTexto = 'CERRADO';
            case 4: estadoClass = 'estado 4' ; estadoTexto = 'DE BAJA';
            default : estadoClass = 'estado 3' ; estadoTexto = 'CERRADO';
        }
        return `{ insertar porbablemente texto masivo de html aaaaa}`
    },
    mostrarPagina: function(pagina){
        //esto mas que nada me serivra para mostrar una pagina especifica en ela lista de los talleres
        this.config.paginaActual = pagina;
        const inicio = (pagina - 1) * this.config.itemsPorPagina;
        const fin = inicio + this.config.itemsPorPagina;
        const datosPagina = this.config.data.talleres.slice(inicio,fin);
        const  tbody = document.getElementById('tablaTalleresCuerpo');
        // tengo que cambiarlo y mejorarlo
        if (datosPagina.length ===0) {
            tbody.innerHTML = `{ Wuaa soy un innerHTML que necesita atencion en algun futuro }`
        }
        else {
            // falta terminar este
            tbody.innerHTML = datosPagina.map(taller => this.generarFilaTaller(taller)).join('');
        }
        this.actualizarPaginacion();
        // esta parte del codigo de abajo es algo que sqe de stack overflow, se supone que deberia mostrar 10~ por pagina.
        document.getElementById('inforPaginacion').textContent = `Mostrando ${inicio + 1}-${Math.min(fin, this.config.data.talleres.length)} de ${this.config.data.talleres.length} resultados`;
    },
    obtenerNombreCategoria: function(idCategoria){
        const categoria = this.config.data.categorias.find(c => c.ID_CATEGORIA == idCategoria);
        return categoria ? categoria.DESCRIPCION_CATEGORIA : null;
    },
    actualizarPaginacion: function() {
        const totalPaginas = Math.ceil(this.config.data.talleres.length / this.config.itemsPorPagina);
        let html = '';
        if (totalPaginas > 1) {
            // aqui deberia ir un boton para ir a la pag anterior
            html += ``;
            // esto mostrara el numero de paginas
            for (let i = 1; i <= totalPaginas; i++) {
                if (i === this.config.paginaActual ||
                    i === 1 ||
                    i === totalPaginas ||
                    (i >= this.config.paginaActual - 2 && i <= this.config.paginaActual + 2)) {
                    html += `<li class="page-item ${i === this.config.paginaActual ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="GestionTalleres.cambiarPagina(${i}); return false;">${i}</a>
                    </li>`;
                } 
                else if (i === this.config.paginaActual - 3 || i === this.config.paginaActual + 3) {
                    html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }
            // Botón "Siguiente"
            html += `<li class="page-item ${this.config.paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionTalleres.cambiarPagina(${this.config.paginaActual + 1}); return false;">&raquo;</a>
            </li>`;
        }

        document.getElementById('paginacionTalleres').innerHTML = html;
    },

    cambiarPagina: function(pagina) {
        if (pagina < 1 || pagina > Math.ceil(this.config.data.talleres.length / this.config.itemsPorPagina)) return;
        this.mostrarPagina(pagina);
    },

    // --- Lógica de Filtros ---
    aplicarFiltros: function() {
        this.config.filtros.year = document.getElementById('filtroAnio').value;
        this.config.filtros.estado = document.getElementById('filtroEstado').value;
        this.config.filtros.busqueda = document.getElementById('busqueda').value;
        this.cargarTalleres(); // Recarga los datos con los nuevos filtros
    },

    limpiarFiltros: function() {
        document.getElementById('filtroAnio').value = '2026';
        document.getElementById('filtroEstado').value = '';
        document.getElementById('busqueda').value = '';
        this.config.filtros = { year: '2026', estado: '', busqueda: '' };
        this.cargarTalleres();
    },

    // --- Lógica del Modal de Taller (Crear/Editar) ---
    abrirModalNuevoTaller: function() {
        // Reinicia el formulario y el título
        document.getElementById('modalTallerTitulo').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Taller';
        document.getElementById('formTaller').reset();
        document.getElementById('tallerId').value = '';

        // Valores por defecto
        document.getElementById('yearProceso').value = '2026';
        document.getElementById('minEstudiantes').value = '5';
        document.getElementById('maxEstudiantes').value = '20';
        document.getElementById('estadoTaller').value = '1';
        document.getElementById('edadMinima').value = '0';
        document.getElementById('edadMaxima').value = '99';
        document.getElementById('nroClases').value = '1';
        document.getElementById('nroMinutos').value = '90';

        // Muestra el modal usando Bootstrap
        new bootstrap.Modal(document.getElementById('modalTaller')).show();
    },

    // Guarda un taller (nuevo o actualizado)
    guardarTaller: function() {
        const id = document.getElementById('tallerId').value;
        // Recolecta los datos del formulario
        const data = {
            year_proceso: parseInt(document.getElementById('yearProceso').value),
            id_categoria: parseInt(document.getElementById('categoria').value),
            nombre_taller: document.getElementById('nombreTaller').value,
            id_departamento: parseInt(document.getElementById('departamento').value || '1'),
            objetivo_taller: document.getElementById('objetivo').value,
            fec_inicio: document.getElementById('fecInicio').value,
            fec_termino: document.getElementById('fecTermino').value,
            nro_minutos: parseInt(document.getElementById('nroMinutos').value || '90'),
            nro_clases_anual: parseInt(document.getElementById('nroClases').value || '1'),
            horas_totales: 0, // Se puede calcular después si es necesario
            id_estado_taller: parseInt(document.getElementById('estadoTaller').value),
            lugar: document.getElementById('lugar').value,
            minimo_estudiante: parseInt(document.getElementById('minEstudiantes').value),
            maximo_estudiante: parseInt(document.getElementById('maxEstudiantes').value),
            requisito: document.getElementById('requisitos').value,
            edad_minima: parseInt(document.getElementById('edadMinima').value || '0'),
            edad_maxima: parseInt(document.getElementById('edadMaxima').value || '99'),
            material: document.getElementById('material').value,
            ind_tipo_taller: 1
        };

        // Validación simple de campos obligatorios
        if (!data.nombre_taller || !data.fec_inicio || !data.fec_termino) {
            this.mostrarError('Complete los campos obligatorios (*)');
            return;
        }

        // Determina la URL y el método según si estamos editando o creando
        const url = id ?
            `/funcionario/api/taller-ac/${id}` :  // Para actualizar, usa el endpoint con PUT
            '/funcionario/api/taller-crear';       // Para crear, usa el endpoint de POST
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Cierra el modal y recarga la lista
                bootstrap.Modal.getInstance(document.getElementById('modalTaller')).hide();
                this.mostrarExito(result.message || 'Operación exitosa');
                this.cargarTalleres();
            } else {
                this.mostrarError(result.message || 'Error al guardar');
            }
        })
        .catch(error => {
            console.error('Error en fetch guardarTaller:', error);
            this.mostrarError('Error de conexión al guardar.');
        });
    },

    // Carga los datos de un taller en el formulario para editar
    editarTaller: function(id) {
        fetch(`/funcionario/api/taller-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    // Rellena el formulario con los datos del taller
                    document.getElementById('modalTallerTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Taller';
                    document.getElementById('tallerId').value = t.id_taller;
                    document.getElementById('yearProceso').value = t.year_proceso || 2026;
                    document.getElementById('nombreTaller').value = t.nombre_taller || '';
                    document.getElementById('categoria').value = t.id_categoria || '';
                    document.getElementById('objetivo').value = t.objetivo_taller || '';
                    document.getElementById('fecInicio').value = t.fec_inicio ? t.fec_inicio.substring(0,10) : '';
                    document.getElementById('fecTermino').value = t.fec_termino ? t.fec_termino.substring(0,10) : '';
                    document.getElementById('lugar').value = t.lugar || '';
                    document.getElementById('nroMinutos').value = t.nro_minutos || 90;
                    document.getElementById('nroClases').value = t.nro_clases_anual || 1;
                    document.getElementById('edadMinima').value = t.edad_minima || 0;
                    document.getElementById('edadMaxima').value = t.edad_maxima || 99;
                    document.getElementById('minEstudiantes').value = t.minimo_estudiante || 5;
                    document.getElementById('maxEstudiantes').value = t.maximo_estudiante || 20;
                    document.getElementById('material').value = t.material || '';
                    document.getElementById('requisitos').value = t.requisito || '';
                    document.getElementById('estadoTaller').value = t.id_estado_taller || 1;

                    // Muestra el modal
                    new bootstrap.Modal(document.getElementById('modalTaller')).show();
                } else {
                    this.mostrarError('No se pudo cargar el taller para editar.');
                }
            })
            .catch(error => {
                console.error('Error en fetch editarTaller:', error);
                this.mostrarError('Error de conexión al cargar datos del taller.');
            });
    },

    // --- Lógica de Detalles (Modal de solo lectura) ---
    verDetalles: function(id) {
        fetch(`/funcionario/api/taller-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    const inscritos = t.personas_inscritas || 0;
                    const maximo = t.maximo_estudiante || 20;
                    const disponibles = maximo - inscritos;

                    // Determina el badge de estado
                    let estadoBadge = '';
                    switch(t.id_estado_taller) {
                        case 1: estadoBadge = '<span class="badge bg-success">Activo</span>'; break;
                        case 2: estadoBadge = '<span class="badge bg-info">Próximamente</span>'; break;
                        case 3: estadoBadge = '<span class="badge bg-secondary">Finalizado</span>'; break;
                        case 4: estadoBadge = '<span class="badge bg-danger">Suspendido</span>'; break;
                        default: estadoBadge = '<span class="badge bg-light text-dark">Desconocido</span>';
                    }

                    // Construye el HTML del modal de detalles
                    let html = `
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="fw-bold">Información General</h6>
                                <table class="table table-sm">
                                    <tr><th>ID:</th><td>${t.id_taller}</td></tr>
                                    <tr><th>Nombre:</th><td>${t.nombre_taller}</td></tr>
                                    <tr><th>Categoría:</th><td>${this.obtenerNombreCategoria(t.id_categoria) || t.id_categoria}</td></tr>
                                    <tr><th>Lugar:</th><td>${t.lugar || '-'}</td></tr>
                                    <tr><th>Estado:</th><td>${estadoBadge}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Fechas y Horarios</h6>
                                <table class="table table-sm">
                                    <tr><th>Inicio:</th><td>${t.fec_inicio || '-'}</td></tr>
                                    <tr><th>Término:</th><td>${t.fec_termino || '-'}</td></tr>
                                    <tr><th>N° Clases:</th><td>${t.nro_clases_anual || '-'}</td></tr>
                                    <tr><th>Minutos/clase:</th><td>${t.nro_minutos || '-'}</td></tr>
                                </table>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <h6 class="fw-bold">Cupos</h6>
                                <table class="table table-sm">
                                    <tr><th>Inscritos:</th><td>${inscritos}</td></tr>
                                    <tr><th>Máximo:</th><td>${maximo}</td></tr>
                                    <tr><th>Disponibles:</th><td class="${disponibles > 0 ? 'text-success' : 'text-danger'} fw-bold">${disponibles}</td></tr>
                                    <tr><th>Mínimo:</th><td>${t.minimo_estudiante || '-'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Requisitos de Edad</h6>
                                <table class="table table-sm">
                                    <tr><th>Edad Mínima:</th><td>${t.edad_minima || 0} años</td></tr>
                                    <tr><th>Edad Máxima:</th><td>${t.edad_maxima || 99} años</td></tr>
                                </table>
                            </div>
                        </div>
                    `;

                    if (t.objetivo_taller) html += `<div class="mt-3"><h6 class="fw-bold">Objetivo:</h6><p>${t.objetivo_taller}</p></div>`;
                    if (t.material) html += `<div class="mt-2"><h6 class="fw-bold">Materiales:</h6><p>${t.material}</p></div>`;
                    if (t.requisito) html += `<div class="mt-2"><h6 class="fw-bold">Requisitos:</h6><p>${t.requisito}</p></div>`;

                    document.getElementById('detallesTallerBody').innerHTML = html;
                    window.tallerDetallesId = id; // Guarda el ID para el botón "Editar" del modal de detalles
                    new bootstrap.Modal(document.getElementById('modalDetallesTaller')).show();
                } else {
                    this.mostrarError('No se pudieron cargar los detalles.');
                }
            })
            .catch(error => {
                console.error('Error en fetch verDetalles:', error);
                this.mostrarError('Error de conexión al cargar detalles.');
            });
    },

    // Acción del botón "Editar" dentro del modal de detalles
    abrirModalEditarDesdeDetalles: function() {
        bootstrap.Modal.getInstance(document.getElementById('modalDetallesTaller')).hide();
        setTimeout(() => {
            this.editarTaller(window.tallerDetallesId);
        }, 500); // Pequeño retraso para que se cierre el primer modal
    },

    // --- Lógica de Eliminación (Lógica: Cambiar estado a "Suspendido") ---
    confirmarEliminar: function(id, nombre) {
        this.config.tallerAEliminar = id;
        document.getElementById('mensajeConfirmacion').innerHTML =
            `¿Está seguro de suspender el taller <strong>${nombre}</strong>?<br>
            <small class="text-muted">Esta acción cambiará el estado a "Suspendido". Los alumnos no podrán inscribirse.</small>`;

        const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
        modal.show();
    },

    ejecutarEliminacion: function() {
        const id = this.config.tallerAEliminar;
        if (!id) return;

        fetch(`/funcionario/api/taller-cambiar/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.mostrarExito(result.message || 'Taller suspendido');
                    this.cargarTalleres(); // Recarga la lista
                } else {
                    this.mostrarError(result.message || 'Error al suspender');
                }
            })
            .catch(error => {
                console.error('Error en fetch eliminar:', error);
                this.mostrarError('Error de conexión al suspender.');
            })
            .finally(() => {
                bootstrap.Modal.getInstance(document.getElementById('modalConfirmacion')).hide();
                this.config.tallerAEliminar = null;
            });
    },

    // --- Utilidades (Mensajes) ---
    mostrarExito: function(mensaje) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: mensaje,
            timer: 2000,
            showConfirmButton: false
        });
    },

    mostrarError: function(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje
        });
    },

    // --- Eventos de la UI ---
    bindEventos: function() {
        // Botón de filtros
        document.getElementById('aplicarFiltrosBtn')?.addEventListener('click', () => { this.aplicarFiltros(); });
        document.getElementById('limpiarFiltrosBtn')?.addEventListener('click', () => { this.limpiarFiltros(); });

        // Búsqueda con Enter
        document.getElementById('busqueda')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });

        // Formulario del modal (guardar)
        document.getElementById('formTaller')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarTaller();
        });

        // Botón de confirmación de eliminación
        document.getElementById('btnConfirmar')?.addEventListener('click', () => { this.ejecutarEliminacion(); });

        // Botón "Nuevo Taller"
        document.querySelector('button[onclick="abrirModalNuevoTaller()"]')?.addEventListener('click', () => { this.abrirModalNuevoTaller(); });
        // Nota: Como el HTML tiene onclick, también funciona. Pero para mantener la consistencia, lo vinculamos también aquí.
    }
};

// Inicialización cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    GestionTalleres.init();
});

// Exponer funciones necesarias para los onclick en el HTML (si los hay)
// Esto permite que los botones con onclick="GestionTalleres.funcion()" sigan funcionando.
window.GestionTalleres = GestionTalleres;