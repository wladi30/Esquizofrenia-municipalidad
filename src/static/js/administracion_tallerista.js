// codigo de busqueda "GUTS" , importante "guts" , baja importancia "Guts" , medianamente importante
const currentYearV3 = new Date().getFullYear();
if (typeof data !== 'undefined' && data !== null) {
    const filteredData = data.filter(item => {
        return new Date(item.date).getFullYear() === currentYearV3;
    });
    console.log(filteredData);
} else {
    console.warn("La variable 'data' no está definida en esta página.");
}
const GestionTalleres = {
    configuracion: {
        paginaActual: 1,
        itemsPorPagina: 30,
        filtros: {
            year: '',
            estado: '',
            categoria: '',
            busqueda: '',
            busqueda_id: '',
            busqueda_lugar: '',
        },
        datos: {
            talleres: [],
            categorias: [],
            talleristas: [],
        },
    },
    inicializando: function() {
        console.log("Inicializando GestionTalleres...");
        this.cargarDatosIniciales();
        this.cargarTalleres();
        this.bindEventos();
    },
    cargarDatosIniciales: function() {
        this.cargarCategorias();
        this.cargarTalleristasSelect();
    },
    cargarCategorias: function() {
        fetch('/api/categoria')
            .then(response => response.json())
            .then(data => {
                this.configuracion.datos.categorias = data;
                const selectsModal = document.querySelectorAll('.select-categoria');
                selectsModal.forEach(select => {
                    select.innerHTML = '<option value="">Seleccione categoría...</option>';
                    data.forEach(cat => { 
                        const option = document.createElement('option');
                        option.value = cat.ID_CATEGORIA;
                        option.textContent = cat.DESCRIPCION_CATEGORIA;
                        select.appendChild(option);
                    });
                });
                const selectsFiltro = document.querySelectorAll('.select-categoria-filtro');
                selectsFiltro.forEach(select => {
                    select.innerHTML = '<option value="">Todas las categorías</option>';
                    data.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.ID_CATEGORIA;
                        option.textContent = cat.DESCRIPCION_CATEGORIA;
                        select.appendChild(option);
                    });
                });
            })
        .catch(error => {
            console.error('Error cargando categorías:', error);
            this.mostrarError('No se pudieron cargar las categorías.');
        });
    },
    cargarTalleristasSelect: function(){
        fetch('/api/tallerista-lista')
        .then(response => response.json())
        .then(result => {
            if (result.success){
                this.configuracion.datos.talleristas = result.data;
                const selectTallerista = document.getElementById('tallerista');
                selectTallerista.innerHTML = '<option value="">Aun no se que poner aqui asi que hola 23/03</option>'
                result.data.forEach(t => {
                    const option = document.createElement('option');
                    option.value = t.ID_PROFESOR;
                    option.textContent = `${t.NOMBRE_PERSONA} ${t.APELLIDO_PATERNO || ''}`.trim();
                    selectTallerista.appendChild(option);
                });
            }
            else {
                this.mostrarError('Error al cargar a los talleristas: ' + result.message);
            }
        })
        .catch(error =>{
            console.error('Error al cargar a los talleristas: ', error);
            this.mostrarError('Error al cargar a los talleristas');
        })
    },
    limpiarFiltros: function() {
    document.getElementById('filtroAnio').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('busqueda').value = '';
    document.getElementById('busqueda_id').value = '';
    document.getElementById('busqueda_lugar').value = '';
    const selectCategoriaFiltro = document.querySelector('.select-categoria-filtro');
    if (selectCategoriaFiltro) {
        selectCategoriaFiltro.value = '';
    }
    this.configuracion.filtros = { 
        year: '', 
        estado: '', 
        busqueda: '', 
        busqueda_id: '', 
        busqueda_lugar: '',
        categoria: ''
    };
    this.cargarTalleres();
},
    cargarTalleres: function(){
        const params = new URLSearchParams();
        if (this.configuracion.filtros.year) params.append('year', this.configuracion.filtros.year);
        if (this.configuracion.filtros.estado) params.append('estado', this.configuracion.filtros.estado);
        if (this.configuracion.filtros.categoria) params.append('categoria', this.configuracion.filtros.categoria);
        if (this.configuracion.filtros.busqueda) params.append('busqueda', this.configuracion.filtros.busqueda);
        if (this.configuracion.filtros.busqueda_id) params.append('busqueda_id', this.configuracion.filtros.busqueda_id);
        if (this.configuracion.filtros.busqueda_lugar) params.append('busqueda_lugar', this.configuracion.filtros.busqueda_lugar);
        document.getElementById('tablaTalleresCuerpo').innerHTML = `
            <tr><td colspan="8" class="text-center py-4 text-muted">
                <i class="bi bi-arrow-repeat me-2"></i>Cargando talleres...
            </td></tr>`;
        fetch(`/api/taller-lista?${params.toString()}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.configuracion.datos.talleres = result.data;
                    this.mostrarPagina(1);
                }
                else {
                    this.mostrarError(result.message);
                    document.getElementById('tablaTalleresCuerpo').innerHTML = `
                        <tr><td colspan="8" class="text-center py-4 text-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>Error: ${result.message}
                        </td></tr>`;
                    }
            })
            .catch(error => {
                console.error('', error);
                this.mostrarError('');
                document.getElementById('tablaTalleresCuerpo').innerHTML = `
                    <tr><td colspan="8" class="text-center py-4 text-danger">
                        <i class="bi bi-wifi-off me-2"></i>Error de conexión
                    </td></tr>`;
            });
    },
    generarFilaTaller: function(t){
        const inscritos = t.personas_inscritas;
        const maximo = t.MAXIMO_ESTUDIANTE;
        const porcentaje = maximo > 0 ? (inscritos / maximo) * 100 : 0;
        let estadoClass = '';
        switch (t.ID_ESTADO_TALLER) {
            case 1: estadoClass = 'estado 1' ; estadoTexto = 'INGRESADO'; break;
            case 2: estadoClass = 'estado 2' ; estadoTexto = 'CALENDARIZADO'; break;
            case 3: estadoClass = 'estado 3' ; estadoTexto = 'CERRADO'; break;
            case 4: estadoClass = 'estado 4' ; estadoTexto = 'DE BAJA'; break;
            default : estadoClass = 'estado 3' ; estadoTexto = 'CERRADO-DEFAULT'; break;
        }
        return `
            <tr>
                <td class="ps-4 fw-semibold">${t.ID_TALLER}</td>
                <td>
                    <div class="fw-semibold">${t.NOMBRE_TALLER || 'Sin nombre'}</div>
                    <small class="text-muted">${t.LUGAR || 'Sin lugar'}</small>
                </td>
                <td>${this.obtenerNombreCategoria(t.ID_CATEGORIA) || t.ID_CATEGORIA || '-'}</td>
                <td>${t.ID_DEPARTAMENTO ? 'Asignado' : 'Pendiente'}</td>
                <td style="min-width: 120px;">
                    <div class="d-flex justify-content-between small">
                        <span>${inscritos}/${maximo}</span>
                        <span class="text-muted">${Math.round(porcentaje)}%</span>
                    </div>
                    <div class="cupos-indicator">
                        <div class="cupos-fill" style="width: ${porcentaje}%;"></div>
                    </div>
                </td>
                <td><span class="estado-badge ${estadoClass}">${estadoTexto}</span></td>
                <td>
                    <small>${t.FEC_INICIO ? t.FEC_INICIO.substring(0,10) : '-'}</small><br>
                    <small class="text-muted">al ${t.FEC_TERMINO ? t.FEC_TERMINO.substring(0,10) : '-'}</small>
                </td>
                <td><span>${t.YEAR_PROCESO}</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="GestionTalleres.verDetalles(${t.ID_TALLER})" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="GestionTalleres.editarTaller(${t.ID_TALLER})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="GestionTalleres.confirmarEliminar(${t.ID_TALLER}, '${t.NOMBRE_TALLER?.replace(/'/g, "\\'") || ''}')" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },
    mostrarPagina: function(pagina){
        this.configuracion.paginaActual = pagina;
        const inicio = (pagina - 1) * this.configuracion.itemsPorPagina;
        const fin = inicio + this.configuracion.itemsPorPagina;
        const datosPagina = this.configuracion.datos.talleres.slice(inicio,fin);
        const  tbody = document.getElementById('tablaTalleresCuerpo');
        if (datosPagina.length ===0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No hay talleres para mostrar</td></tr>`;
        }
        else {
            tbody.innerHTML = datosPagina.map(taller => this.generarFilaTaller(taller)).join('');
        }
        this.actualizarPaginacion();
        document.getElementById('infoPaginacion').textContent = `Mostrando ${inicio + 1}-${Math.min(fin, this.configuracion.datos.talleres.length)} de ${this.configuracion.datos.talleres.length} resultados`;
    },
    obtenerNombreCategoria: function(idCategoria){
        const categoria = this.configuracion.datos.categorias.find(c => c.ID_CATEGORIA == idCategoria);
        return categoria ? categoria.DESCRIPCION_CATEGORIA : null;
    },
    actualizarPaginacion: function() {
        const totalPaginas = Math.ceil(this.configuracion.datos.talleres.length / this.configuracion.itemsPorPagina);
        let html = '';
        if (totalPaginas > 1) {
            html += `<li class="page-item ${this.configuracion.paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionTalleres.cambiarPagina(${this.configuracion.paginaActual - 1}); return false;">&laquo;</a>
            </li>`;
            for (let i = 1; i <= totalPaginas; i++) {
                if (i === this.configuracion.paginaActual ||
                    i === 1 ||
                    i === totalPaginas ||
                    (i >= this.configuracion.paginaActual - 2 && i <= this.configuracion.paginaActual + 2)) {
                    html += `<li class="page-item ${i === this.configuracion.paginaActual ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="GestionTalleres.cambiarPagina(${i}); return false;">${i}</a>
                    </li>`;
                } 
                else if (i === this.configuracion.paginaActual - 3 || i === this.configuracion.paginaActual + 3) {
                    html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }
            html += `<li class="page-item ${this.configuracion.paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionTalleres.cambiarPagina(${this.configuracion.paginaActual + 1}); return false;">&raquo;</a>
            </li>`;
        }
        document.getElementById('paginacionTalleres').innerHTML = html;
    },
    cambiarPagina: function(pagina) {
        if (pagina < 1 || pagina > Math.ceil(this.configuracion.datos.talleres.length / this.configuracion.itemsPorPagina)) return;
        this.mostrarPagina(pagina);
    },
    aplicarFiltros: function() {
        this.configuracion.filtros.year = document.getElementById('filtroAnio').value;
        this.configuracion.filtros.estado = document.getElementById('filtroEstado').value;
        this.configuracion.filtros.busqueda = document.getElementById('busqueda').value;
        this.configuracion.filtros.busqueda_id = document.getElementById('busqueda_id').value;
        this.configuracion.filtros.busqueda_lugar = document.getElementById('busqueda_lugar').value;
        const selectCategoriaFiltro = document.querySelector('.select-categoria-filtro');
        this.configuracion.filtros.categoria = selectCategoriaFiltro ? selectCategoriaFiltro.value: '';
        this.cargarTalleres();
    },
    limpiarFiltros: function() {
        document.getElementById('filtroAnio').value = '';
        document.getElementById('filtroEstado').value = '';
        document.getElementById('busqueda').value = '';
        document.getElementById('busqueda_id').value = '';
        document.getElementById('busqueda_lugar').value = '';
        const selectCategoriaFiltro = document.querySelector('.select-categoria-filtro');
        if (selectCategoriaFiltro) {selectCategoriaFiltro.value = '';}
        this.configuracion.filtros = {year: '', estado: '', busqueda: '', busqueda_id: '', busqueda_lugar: '', categoria: ''};
        this.cargarTalleres();
    },
abrirModalNuevoTaller: function() {
    document.getElementById('modalTallerTitulo').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Taller';
    document.getElementById('formTaller').reset();
    document.getElementById('tallerId').value = '';
    
    const selectCategoriaModal = document.querySelector('.select-categoria');
    if (selectCategoriaModal) {
        selectCategoriaModal.value = '';
    }
    
    const currentYear = new Date().getFullYear();
    document.getElementById('yearProceso').value = currentYear;
    document.getElementById('minEstudiantes').value;
    document.getElementById('maxEstudiantes').value;
    document.getElementById('estadoTaller').value;
    document.getElementById('edadMinima').value;
    document.getElementById('edadMaxima').value;
    document.getElementById('nroClases').value;
    document.getElementById('nroMinutos').value;
    
    new bootstrap.Modal(document.getElementById('modalTaller')).show();
},

    guardarTaller: function() {
    const id = document.getElementById('tallerId').value;
    const selectCategoriaModal = document.querySelector('.select-categoria');
    const nameTaller = document.getElementById('nombreTaller').value.trim().toUpperCase();
    const yearProceso = parseInt(document.getElementById('yearProceso').value);
    const objTaller = document.getElementById('objetivo').value.trim().toUpperCase();
    const fechaInicio = document.getElementById('fecInicio').value;
    const fechaTermino = document.getElementById('fecTermino').value;
    const numeroDeMinutos = parseInt(document.getElementById('nroMinutos').value);
    const numeroDeClasesAnuales = parseInt(document.getElementById('nroClases').value);
    const numeroHorasTotales = parseInt(document.getElementById('horasTotales').value);
    const numeroIdEstadoTaller = parseInt(document.getElementById('estadoTaller').value);
    const observacionTaller = document.getElementById('observacion').value.trim().toUpperCase();
    const lugarTaller = document.getElementById('lugar').value.trim().toUpperCase();
    const minimoEstudiante = parseInt(document.getElementById('minEstudiantes').value);
    const maximoEstudiante = parseInt(document.getElementById('maxEstudiantes').value);
    const requisitosTaller = document.getElementById('requisitos').value.trim().toUpperCase();
    const edadMinimaTaller = parseInt(document.getElementById('edadMinima').value);
    const edadMaximaTaller = parseInt(document.getElementById('edadMaxima').value);
    const materialTaller = document.getElementById('material').value.trim().toUpperCase();
    const idTipoTaller = parseInt(document.getElementById('tipoTaller').value);
    const data = {
        year_proceso: yearProceso || new Date().getFullYear(),
        id_categoria: selectCategoriaModal ? parseInt(selectCategoriaModal.value) : 0,
        nombre_taller: nameTaller,
        objetivo_taller: objTaller,
        fecha_inicio: fechaInicio || 'nop',
        fecha_termino: fechaTermino || 'nop',
        nro_minutos: numeroDeMinutos || 0,
        nro_clases_anual: numeroDeClasesAnuales || 0,
        horas_totales_v2: numeroHorasTotales || 0,
        id_estado_taller: numeroIdEstadoTaller || 2,
        observacion_v2: observacionTaller,
        lugar: lugarTaller,
        minimo_estudiante: minimoEstudiante || 0,
        maximo_estudiante: maximoEstudiante || 0,
        requisito: requisitosTaller,
        edad_minima: edadMinimaTaller || 0,
        edad_maxima: edadMaximaTaller || 0,
        material: materialTaller,
        ind_tipo_taller: idTipoTaller || 1,
    };
    const url = id ? `/api/taller-ac/${id}` : '/api/taller-crear';
    const method = id ? 'PUT' : 'POST';
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('modalTaller')).hide();
            this.mostrarExito(result.message || 'Operacion exitosa');
            this.cargarTalleres();
        } else {
            this.mostrarError(result.message || 'Error al guardar');
        }
    })
    .catch(error => {
        console.error('Error en fetch guardarTaller:', error);
        this.mostrarError('Error de conexion al guardar.');
    });
},
    editarTaller: function(id) {
        fetch(`/api/taller-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    document.getElementById('modalTallerTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Taller';
                    document.getElementById('tallerId').value = t.id_taller;
                    document.getElementById('yearProceso').value = t.year_proceso;
                    const selectCategoriaModal = document.querySelector('.select-categoria');
                    if (selectCategoriaModal) {selectCategoriaModal.value = t.id_categoria;}
                    document.getElementById('nombreTaller').value = t.nombre_taller;
                    document.getElementById('objetivo').value = t.objetivo_taller;
                    document.getElementById('fecInicio').value = t.fec_inicio;
                    document.getElementById('fecTermino').value = t.fec_termino;
                    document.getElementById('nroMinutos').value = t.nro_minutos;
                    document.getElementById('nroClases').value = t.nro_clases_anual;
                    document.getElementById('horasTotales').value = t.horas_totales;
                    document.getElementById('estadoTaller').value = t.id_estado_taller;
                    document.getElementById('fecEstado').value = t.fec_estado_taller;
                    document.getElementById('observacion').value = t.observacion;
                    document.getElementById('lugar').value = t.lugar;
                    document.getElementById('minEstudiantes').value = t.minimo_estudiante;
                    document.getElementById('maxEstudiantes').value = t.maximo_estudiante;
                    document.getElementById('requisitos').value = t.requisito;
                    document.getElementById('edadMinima').value = t.edad_minima;
                    document.getElementById('edadMaxima').value = t.edad_maxima;
                    document.getElementById('material').value = t.material;
                    document.getElementById('tipoTaller').value = t.ind_tipo_taller;
                    document.getElementById('usuarioIngreso').value = t.aud_usuario_ingreso;
                    document.getElementById('fecIngreso').value = t.aud_fec_ingreso;
                    document.getElementById('usuarioModifica').value = t.aud_usuario_modifica;
                    document.getElementById('fecModifica').value = t.aud_fec_modifica;
                    new bootstrap.Modal(document.getElementById('modalTaller')).show();
                } 
                else {
                    this.mostrarError('No se pudo cargar el taller para editar.');
                }
            })
            .catch(error => {
                console.error('Error en fetch editarTaller:', error);
                this.mostrarError('Error de conexion al cargar datos del taller.');
            });
    },
    verDetalles: function(id) {
        fetch(`/api/taller-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    const inscritos = t.personas_inscritas;
                    const maximo = t.maximo_estudiante;
                    const disponibles = maximo - inscritos;
                    let estadoBadge = '';
                    switch(t.id_estado_taller) {
                        case 1: estadoBadge = '<span class="badge bg-success">INGRESADO</span>'; break;
                        case 2: estadoBadge = '<span class="badge bg-info">CANDALERIZADO</span>'; break;
                        case 3: estadoBadge = '<span class="badge bg-secondary">CERRADO</span>'; break;
                        case 4: estadoBadge = '<span class="badge bg-danger">DE BAJA</span>'; break;
                        default: estadoBadge = '<span class="badge bg-light text-dark">DESCONOCIDO</span>';
                    }
                    let html = `
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="fw-bold">Informacion General</h6>
                                <table class="table table-sm">
                                    <tr><th>ID:</th><td>${t.id_taller}</td></tr>
                                    <tr><th>Nombre:</th><td>${t.nombre_taller}</td></tr>
                                    <tr><th>Año del Proceso:</th><td>${t.year_proceso}</td></tr>
                                    <tr><th>Categoría:</th><td>${this.obtenerNombreCategoria(t.id_categoria) || t.id_categoria}</td></tr>
                                    <tr><th>Lugar:</th><td>${t.lugar}</td></tr>
                                    <tr><th>Estado:</th><td>${estadoBadge}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Fechas y Horarios</h6>
                                <table class="table table-sm">
                                    <tr><th>Inicio:</th><td>${t.fec_inicio}</td></tr>
                                    <tr><th>TErmino:</th><td>${t.fec_termino}</td></tr>
                                    <tr><th>N° Clases:</th><td>${t.nro_clases_anual}</td></tr>
                                    <tr><th>Minutos/clase:</th><td>${t.nro_minutos}</td></tr>
                                    <tr><th>Horas Totales:</th><td>${t.horas_totales}</td></tr>
                                </table>    
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <h6 class="fw-bold">Cupos</h6>
                                <table class="table table-sm">
                                    <tr><th>Inscritos:</th><td>${inscritos}</td></tr>
                                    <tr><th>Maximo:</th><td>${maximo}</td></tr>
                                    <tr><th>Disponibles:</th><td class="${disponibles > 0 ? 'text-success' : 'text-danger'} fw-bold">${disponibles}</td></tr>
                                    <tr><th>Mínimo:</th><td>${t.minimo_estudiante}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Requisitos de Edad</h6>
                                <table class="table table-sm">
                                    <tr><th>Edad Mínima:</th><td>${t.edad_minima} años</td></tr>
                                    <tr><th>Edad Maxima:</th><td>${t.edad_maxima} años</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Informacion Adicional</h6>
                                <table class="table table-sm">
                                    <tr><th>ID del Departamento:</th><td>${t.id_departamento} (no se que quieren decir los numeros)</td></tr>
                                    <tr><th>Tipo de taller:</th><td>${t.ind_tipo_taller} (no se que quieren decir los numeros)</td></tr>
                                    <tr><th>Usuario que ingreso el taller:</th><td>${t.aud_usuario_ingreso}</td></tr>
                                    <tr><th>Fecha del ingreso:</th><td>${t.aud_fec_ingreso}</td></tr>
                                    <tr><th>Usuario que hizo la ultima modificación:</th><td>${t.aud_usuario_modifica}</td></tr>
                                    <tr><th>Fecha de la ultima modificación:</th><td>${t.aud_fec_modifica}</td></tr>
                                    <tr><th>Fecha de la ultima modificación en el estado de taller:</th><td>${t.fec_estado_taller}</td></tr>
                                </table>
                            </div>
                        </div>
                    `;
                    if (t.objetivo_taller) html += `<div class="mt-3"><h6 class="fw-bold">Objetivo:</h6><p>${t.objetivo_taller}</p></div>`;
                    if (t.material) html += `<div class="mt-2"><h6 class="fw-bold">Materiales:</h6><p>${t.material}</p></div>`;
                    if (t.requisito) html += `<div class="mt-2"><h6 class="fw-bold">Requisitos:</h6><p>${t.requisito}</p></div>`;
                    document.getElementById('detallesTallerBody').innerHTML = html;
                    window.tallerDetallesId = id;
                    new bootstrap.Modal(document.getElementById('modalDetallesTaller')).show();
                } 
                else {
                    this.mostrarError('No se pudieron cargar los detalles.');
                }
            })
            .catch(error => {
                console.error('Error en fetch verDetalles:', error);
                this.mostrarError('Error de conexion al cargar detalles.');
            });
    },
    abrirModalEditarDesdeDetalles: function() {
        bootstrap.Modal.getInstance(document.getElementById('modalDetallesTaller')).hide();
        setTimeout(() => {
            this.editarTaller(window.tallerDetallesId);
        }, 500);
    },
    confirmarEliminar: function( nombre) {
        document.getElementById('mensajeConfirmacion').innerHTML =
            `¿Esta seguro de suspender el taller <strong>${nombre}</strong>?<br>
            <small class="text-muted">Esta accion cambiara el estado a "Suspendido".</small>`;
        const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
        modal.show();
    },
    ejecutarEliminacion: function(id) {
        fetch(`/api/taller-cambiar/${id}`)
        
    },
    mostrarExito: function(mensaje) {
        Swal.fire({
            icon: 'success',
            title: 'Exito',
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
    bindEventos: function() {
        document.getElementById('aplicarFiltrosBtn')?.addEventListener('click', () => { this.aplicarFiltros(); });
        document.getElementById('limpiarFiltrosBtn')?.addEventListener('click', () => { this.limpiarFiltros(); });
        document.getElementById('busqueda')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_id')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_lugar')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('formTaller')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarTaller();
        });
        document.getElementById('btnConfirmar')?.addEventListener('click', () => { this.ejecutarEliminacion(); });
        const nuevoTallerBtn = document.querySelector('button[onclick*="abrirModalNuevoTaller"]');
        if (nuevoTallerBtn) {
            nuevoTallerBtn.onclick = () => { this.abrirModalNuevoTaller(); };
        }
    }
};
document.addEventListener('DOMContentLoaded', function() {
    GestionTalleres.inicializando();
});
window.GestionTalleres = GestionTalleres;
const name = ()=> {}