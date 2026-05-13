// codigo de busqueda "GUTS" , importante "guts" , baja importancia "Guts" , medianamente importante
// https://youtu.be/l50gnBWHmdA
// Este video explica vien el tema de los imports y exports ademas de dar muchos ejemplos de como aplicar esto, desde dinamicos a import masivos de un js a otro, recomiendo ver dde nuevo
// estoy haciendo un import de general que trae la constante '', esta me da el año actual el cual que lo usare como
const currentYearV3 = new Date().getFullYear();
if (typeof data !== 'undefined' && data !== null) {
    const filteredData = data.filter(item => {
        return new Date(item.date).getFullYear() === currentYearV3;
    });
    console.log(filteredData);
} else {
    // esto lo hice para que no mandara un error cada vez que se accede a una nueba pagina, el general,js se le tira un llamado desde base.html el cual lo tienen con extendes todos
    // asi que puede ser algo molesto ver que el error sale todo el rato
    console.warn("La variable 'data' no esta definida en esta pagina.");
}
// Aqui doy inicio al js principal que se encargara de casi todo sobre administracion de talleres

// el de aca sera lo que definira a lo que se muestra en la pag de talleres, aqui hare definiciones de cuandos talleres se muestran por pagina al igual que setear cuales seran los filtros

// el 'Ingresado' quiere decir que esta registrado, 'calendarizado' quiere decir que ya tiene horarios, dias las horas inicio/termino, etc, 'cerrado' es cuando el taller ya termino.
// mientras que 'de baja' quiere decir que ya no se hara mas ese taller.

const nombresGenero = {
    0: 'Masculino',
    1: 'Femenino',
    2: 'No Binario',
    3: 'Otro',
    4: 'Prefiero no Decirlo'
};

const GestionTalleres = {
    // Van a estar aqui la configuracion y los datos junto con el estado de la app en si, esta parte se 
    configuracion: {
        paginaActual: 1,
        itemsPorPagina: 30,
        filtros: {
            // esto es suponiendo el año, se tiene que hacer de manera automatica.
            year: '',
            estado: '',
            categoria: '',
            busqueda_id: '',
            busqueda_lugar: '',
            busqueda_nombre: '',
        },
        // aqui van a almacenar todos los datos de talleres, talleristas y las categorias de las cuales se usaran para los filtros, los otros 2 seran los que se muestren en pantalla
        datos: {
            talleres: [],
            categorias: [],
            talleristas: [],
        },
        // EliminacionVerdaderaDeTaller sera la eliminacion completa del dato de dicho taller, eliminar el taller de la base de datos
        // EliminacionVerdaderaDeTaller: null
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
        // this.CargarDepartamentos();
        this.cargarTalleristasSelect();
    },

    cargarCategorias: function() {
        fetch('/api/categoria')
            .then(response => response.json())
            .then(data => {
                // aqui lo pase a convertir en un array
                this.configuracion.datos.categorias = data;
                // cambio de getelementbyid hacia queryselectorall, vere como resulta
                const selectsModal = document.querySelectorAll('.select-categoria');
                // aqui lo que hago (ademas de ponerle un texto para mayor indicacion) le coloco un valor por default , si no tiene esto puede dar un error
                selectsModal.forEach(select => {
                    select.innerHTML = '<option value="">Seleccione categoria...</option>';
                    data.forEach(cat => { 
                        // hago uso de la id categoria y descripcion de la base dedatos, podria tambien usdar las que tengo creadas en mi app de funcionario
                        const option = document.createElement('option');
                        option.value = cat.ID_CATEGORIA;
                        option.textContent = cat.DESCRIPCION_CATEGORIA;
                        select.appendChild(option);
                    });
                });
                const selectsFiltro = document.querySelectorAll('.select-categoria-filtro');
                selectsFiltro.forEach(select => {
                    select.innerHTML = '<option value="">Todas las categorias</option>';
                    data.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.ID_CATEGORIA;
                        option.textContent = cat.DESCRIPCION_CATEGORIA;
                        select.appendChild(option);
                    });
                });
            })
        // un catch simplemente, tal vez le podria poner un log para mas debug?
        .catch(error => {
            console.error('Error cargando categorias:', error);
            this.mostrarError('No se pudieron cargar las categorias.');
        });
    },

    cargarTalleristasSelect: function() {
        fetch('/api/tallerista-lista')
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.configuracion.datos.talleristas = result.data;
                    const contenedor = document.getElementById('tallerista');
                    contenedor.innerHTML = '';
                    result.data.forEach(t => {
                        const div = document.createElement('div');
                        div.className = 'form-check mb-1';
                        div.innerHTML = `
                            <input class="form-check-input check-tallerista" type="checkbox" 
                                value="${t.ID_PROFESOR}" id="t_check_${t.ID_PROFESOR}">
                            <label class="form-check-label small" for="t_check_${t.ID_PROFESOR}" style="cursor:pointer">
                                ID: ${t.ID_PROFESOR}, ${t.NOMBRE_COMPLETO || 'Sin nombre'}
                            </label>`;
                        contenedor.appendChild(div);
                    });
                    const buscador = document.getElementById('buscarTallerista');
                    if (buscador) {
                        buscador.addEventListener('input', function(e) {
                            const filtro = e.target.value.toLowerCase();
                            const items = contenedor.querySelectorAll('.form-check');
                            items.forEach(item => {
                                const checkbox = item.querySelector('.check-tallerista');
                                const texto = item.textContent.toLowerCase();
                                if (texto.includes(filtro) || checkbox.checked) {
                                    item.style.display = 'block';
                                } else {
                                    item.style.display = 'none';
                                }
                            });
                        });
                    }
                } 
                else {
                    this.mostrarError('Error al cargar a los talleristas: ' + result.message);
                }
            })
        .catch(error => {
            console.error('Error al cargar a los talleristas: ', error);
            this.mostrarError('Error al cargar a los talleristas');
        });
    },

    verTodasAuditorias: function(idTaller, nombreTaller) {
        const overlay = document.getElementById('overlayAuditoria');
        const bodyContainer = document.getElementById('overlayAuditoriaBody');
        const tituloContainer = document.getElementById('overlayAuditoriaTitulo');
        if (!overlay) {console.error('No se encontró el elemento overlayAuditoria');return;}
        const scrollY = window.scrollY;
        const nombreSanitizado = (nombreTaller || '').replace(/['"\\]/g, '');
        tituloContainer.innerHTML = `<i class="bi bi-clock-history me-2"></i>Auditoría Completa - Taller: ${nombreSanitizado || idTaller}`;
        bodyContainer.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Cargando auditorías...</p></div>';
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        fetch(`/api/taller-get/${idTaller}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    let html = `
                    <div class="detalle-grid-auditoria">
                        <div class="auditoria-seccion">
                            <div class="auditoria-seccion-titulo">
                                <i class="bi bi-journal-text"></i>
                                Datos Taller
                            </div>
                            <div class="auditoria-item">
                                <div class="auditoria-icon auditoria-creacion">
                                    <i class="bi bi-plus-circle"></i>
                                </div>
                                <div class="auditoria-info">
                                    <div class="auditoria-accion">
                                        Creación de Taller
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_ingreso_taller || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_ingreso_taller || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="auditoria-item">
                                <div class="auditoria-icon auditoria-modificacion">
                                    <i class="bi bi-pencil-square"></i>
                                </div>
                                <div class="auditoria-info">
                                    <div class="auditoria-accion">
                                        Modificación de Taller
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_modifica_taller || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_modifica_taller || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="auditoria-seccion">
                            <div class="auditoria-seccion-titulo">
                                <i class="bi bi-diagram-3"></i>
                                Datos Gestión
                            </div>
                            <div class="auditoria-item">
                                <div class="auditoria-icon auditoria-creacion">
                                    <i class="bi bi-plus-circle"></i>
                                </div>
                                <div class="auditoria-info">
                                    <div class="auditoria-accion">
                                        Creación de Gestión
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_ingreso_gestion || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_ingreso_gestion || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    bodyContainer.innerHTML = html;
                } else {
                    bodyContainer.innerHTML = `<div class="alert alert-danger">Error al cargar las auditorías</div>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                bodyContainer.innerHTML = `<div class="alert alert-danger">Error de conexión al cargar las auditorías</div>`;
            });
        const closeBtn = document.getElementById('closeOverlayAuditoria');
        const closeBtn2 = document.getElementById('btnCerrarAuditoria');
        const closeOverlay = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            window.scrollTo(0, scrollY);
        };
        if (closeBtn) closeBtn.onclick = closeOverlay;
        if (closeBtn2) closeBtn2.onclick = closeOverlay;
        overlay.onclick = (e) => {
            if (e.target === overlay) closeOverlay(e);
        };
    },

    limpiarFiltros: function() {
        document.getElementById('filtroAnio').value = '';
        document.getElementById('filtroEstado').value = '';
        document.getElementById('busqueda_id').value = '';
        document.getElementById('busqueda_lugar').value = '';
        document.getElementById('busqueda_nombre').value = '';
        const selectCategoriaFiltro = document.querySelector('.select-categoria-filtro');
        if (selectCategoriaFiltro) {
            selectCategoriaFiltro.value = '';
        }
        
        this.configuracion.filtros = { 
            year: '', 
            estado: '', 
            categoria: '',
            busqueda_id: '', 
            busqueda_lugar: '',
            busqueda_nombre: ''
        };
        this.cargarTalleres();
    },
    
    cargarTalleres: function(){
        // aqui estoy haciendo los filtros que usare en cargar taller, year y estado seran valores mas simples de poner, year es solo el año que deberia ser automatico ademas de poder colocar los años anteriores
        // y estado seran los estados del 1 al 4 que se encuentran los talleres
        const params = new URLSearchParams();
        if (this.configuracion.filtros.year) params.append('year', this.configuracion.filtros.year);
        if (this.configuracion.filtros.estado) params.append('estado', this.configuracion.filtros.estado);
        if (this.configuracion.filtros.categoria) params.append('categoria', this.configuracion.filtros.categoria);
        if (this.configuracion.filtros.busqueda_nombre) params.append('busqueda_nombre', this.configuracion.filtros.busqueda_nombre);
        if (this.configuracion.filtros.busqueda_id) params.append('busqueda_id', this.configuracion.filtros.busqueda_id);
        if (this.configuracion.filtros.busqueda_lugar) params.append('busqueda_lugar', this.configuracion.filtros.busqueda_lugar);
        // html que deberia mostrar el indicador de la carga de la tabla, es solo algo visual debo buscar los iconos en bt
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
    // esto genera un html para la fila de tabla taller, esto deberia dar pie a que en la lista se muestren bien los talleres
    generarFilaTaller: function(t){
        const inscritos = t.personas_inscritas;
        const maximo = t.MAXIMO_ESTUDIANTE;
        const porcentaje = maximo > 0 ? (inscritos / maximo) * 100 : 0;
        let estadoClass = '';
        switch (t.ID_ESTADO_TALLER) {
            case 1: estadoClass = 'estado 1' ; estadoTexto = '<span class="badge bg-info" style="font-size: 0.8rem;">INGRESADO</span>'; break;
            case 2: estadoClass = 'estado 2' ; estadoTexto = '<span class="badge bg-success" style="font-size: 0.8rem;">CALENDARIZADO</span>'; break;
            case 3: estadoClass = 'estado 3' ; estadoTexto = '<span class="badge bg-secondary" style="font-size: 0.8rem;">CERRADO</span>'; break;
            case 4: estadoClass = 'estado 4' ; estadoTexto = '<span class="badge bg-danger" style="font-size: 0.8rem;">DE BAJA</span>'; break;
            default : estadoClass = 'estado 3' ; estadoTexto = 'CERRADO-DEFAULT'; break;
        };
        const formatearFecha = (fecha) => {
            if (!fecha) return '-';
            return new Date(fecha).toLocaleDateString(
                'es-CL',{day: '2-digit', month: 'long', year: 'numeric'}
            );
        };
        return `
        <tr class="fila-taller">
            <td class="ps-4">
                <span class="tabla-id">
                    #${t.ID_TALLER}
                </span>
            </td>
            <td>
                <div class="tabla-info">
                    <div class="tabla-titulo">
                        ${t.NOMBRE_TALLER || 'Sin nombre'}
                    </div>
                    <div class="tabla-subtitulo">
                        <i class="bi bi-geo-alt"></i>
                        ${t.LUGAR || 'Sin lugar'}
                    </div>
                </div>
            </td>
            <td>
                <span class="tabla-texto-suave">
                    ${this.obtenerNombreCategoria(t.ID_CATEGORIA) || t.ID_CATEGORIA || '-'}
                </span>
            </td>
            <td>
                <span class="estado-simple ${t.OBSERVACION && t.OBSERVACION.trim() !== '' && t.OBSERVACION !== '-' ? 'estado-asignado' : 'estado-pendiente'}">${t.OBSERVACION && t.OBSERVACION.trim() !== '' && t.OBSERVACION !== '-' ? 'ASIGNADA' : 'PENDIENTE'}</span>
            </td>
            <td style="min-width: 140px;">
                <div class="cupos-top">
                    <span>
                        ${inscritos}/${maximo}
                    </span>
                    <span class="cupos-porcentaje">
                        ${Math.round(porcentaje)}%
                    </span>
                </div>
                <div class="cupos-indicator">
                    <div class="cupos-fill" style="width:${porcentaje}%;">
                    </div>
                </div>
            </td>
            <td>
                <div class="estado-badge ${estadoClass}">
                    ${estadoTexto}
                </div>
            </td>
            <td>

                <div class="tabla-fechas">
                    <span> Del ${new Date(t.FEC_INICIO).toLocaleDateString('es-CL', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                    <small> Al ${new Date(t.FEC_TERMINO).toLocaleDateString('es-CL', {day: '2-digit', month: '2-digit', year: 'numeric'})}</small>
                </div>
            </td>
            <td>
                <span class="tabla-year">
                    ${t.YEAR_PROCESO || '-'}
                </span>
            </td>
            <td class="text-end pe-4">
                <div class="acciones-tabla">
                    <button class="btn-tabla accion-ver" onclick="GestionTalleres.verDetalles(${t.ID_TALLER})" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn-tabla accion-editar" onclick="GestionTalleres.editarTaller(${t.ID_TALLER})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn-tabla accion-eliminar" onclick="GestionTalleres.confirmarEliminar(${t.ID_TALLER},'${t.NOMBRE_TALLER?.replace(/'/g, "\\'") || ''}')" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    },
    mostrarPagina: function(pagina){
        //esto mas que nada me serivra para mostrar una pagina especifica en ela lista de los talleres
        this.configuracion.paginaActual = pagina;
        const inicio = (pagina - 1) * this.configuracion.itemsPorPagina;
        const fin = inicio + this.configuracion.itemsPorPagina;
        const datosPagina = this.configuracion.datos.talleres.slice(inicio,fin);
        const  tbody = document.getElementById('tablaTalleresCuerpo');
        // tengo que cambiarlo y mejorarlo
        if (datosPagina.length ===0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No hay talleres para mostrar</td></tr>`;
        }
        else {
            // falta terminar este
            tbody.innerHTML = datosPagina.map(taller => this.generarFilaTaller(taller)).join('');
        }
        this.actualizarPaginacion();
        // esta parte del codigo de abajo es algo que sqe de stack overflow, se supone que deberia mostrar 10~ por pagina.
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
            // aqui deberia ir un boton para ir a la pag anterior
            html += `<li class="page-item ${this.configuracion.paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionTalleres.cambiarPagina(${this.configuracion.paginaActual - 1}); return false;">&laquo;</a>
            </li>`;
            // esto m
            // esto mostrara el numero de paginas
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
            // esto deberia mostrar el boton siguiente
            html += `<li class="page-item ${this.configuracion.paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionTalleres.cambiarPagina(${this.configuracion.paginaActual + 1}); return false;">&raquo;</a>
            </li>`;
        }
        document.getElementById('paginacionTalleres').innerHTML = html;
    },
    // cambiar pagina, matematicas wuaa
    cambiarPagina: function(pagina) {
        if (pagina < 1 || pagina > Math.ceil(this.configuracion.datos.talleres.length / this.configuracion.itemsPorPagina)) return;
        this.mostrarPagina(pagina);
    },
    // esto es el filtro que esta mas arriba, aqui se esta aplciando
    aplicarFiltros: function() {
        this.configuracion.filtros.year = document.getElementById('filtroAnio').value;
        this.configuracion.filtros.estado = document.getElementById('filtroEstado').value;
        // this.configuracion.filtros.categoria = document.getElementById('categoria').value;
        this.configuracion.filtros.busqueda_nombre = document.getElementById('busqueda_nombre').value;
        this.configuracion.filtros.busqueda_id = document.getElementById('busqueda_id').value;
        this.configuracion.filtros.busqueda_lugar = document.getElementById('busqueda_lugar').value;
        // this.cargarTalleres(); // aqui se cargan los datos en la funcion cargarTalleres()
        const selectCategoriaFiltro = document.querySelector('.select-categoria-filtro');
        this.configuracion.filtros.categoria = selectCategoriaFiltro ? selectCategoriaFiltro.value: '';
        this.cargarTalleres();
    },
    // wea mala xd
    // vamos a arreglar esto, cualquier cosa su rollback y a los pastos
    limpiarFiltros: function() {
        document.getElementById('filtroAnio').value = '';
        document.getElementById('filtroEstado').value = '';
        // document.getElementById('categoria').value = '';
        document.getElementById('busqueda_nombre').value = '';
        document.getElementById('busqueda_id').value = '';
        document.getElementById('busqueda_lugar').value = '';
        const selectCategoriaFiltro = document.querySelector('.select-categoria-filtro');
        if (selectCategoriaFiltro) {selectCategoriaFiltro.value = '';}
        this.configuracion.filtros = {year: '', estado: '', busqueda_nombre: '', busqueda_id: '', busqueda_lugar: '', categoria: ''};
        this.cargarTalleres();
    },

    abrirModalNuevoTaller: function() {
        document.getElementById('modalTallerTitulo').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Taller';
        document.getElementById('formTaller').reset();
        document.getElementById('tallerId').value = '';
        
        const selectCategoriaModal = document.querySelector('.select-categoria');
        if (selectCategoriaModal) {selectCategoriaModal.value = '';}
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
        const checks = document.querySelectorAll('#tallerista .check-tallerista:checked');
        const idsArray = Array.from(checks).map(cb => cb.value);
        const idsString = idsArray.join(',');
        console.log('IDs para enviar:', idsString);
        if (idsArray.length ===0) {this.mostrarError('Debe seleccionar un tallerista obligatoriamente');}
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
        id_profesor: idsString,
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

    // carga los datos de un taller en el formulario para editar
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
                    if (t.id_profesor) {const idsParaMarcar = t.id_profesor.toString().split(',');idsParaMarcar.forEach(id => {const checkbox = document.querySelector(`#t_check_${id.trim()}`);
                        if (checkbox) checkbox.checked = true;});}
                    document.getElementById('usuarioIngreso').value = t.aud_usuario_ingreso_taller;
                    document.getElementById('fecIngreso').value = t.aud_fec_ingreso_taller;
                    document.getElementById('usuarioModifica').value = t.aud_usuario_modifica_taller;
                    document.getElementById('fecModifica').value = t.aud_fec_modifica_taller;
                    new bootstrap.Modal(document.getElementById('modalTaller')).show();
                } 
                else {this.mostrarError('No se pudo cargar el taller para editar.');}
            })
        .catch(error => {
            console.error('Error en fetch editarTaller:', error);
            this.mostrarError('Error de conexion al cargar datos del taller.');
        });
    },

    mostrarTodosProfesores: function(idTaller) {
        const taller = window.tallerActual;
        if (!taller || !taller.profesores) return;
        const overlay = document.getElementById('overlayProfesores');
        const bodyContainer = document.getElementById('overlayProfesoresBody');
        let html = `
            <div class="profesores-modal-grid">
        `;
        taller.profesores.forEach(prof => {
            const nombreCompleto = `${prof.nombre_persona || ''} ${prof.apellido_paterno || ''} ${prof.apellido_materno || ''}`.trim();
            html += `
            <div class="profesor-modal-card">
                <div class="profesor-modal-header">
                    <div class="profesor-modal-avatar">
                        ${nombreCompleto ? nombreCompleto.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div class="profesor-modal-main">
                        <div class="profesor-modal-top">
                            <div class="profesor-modal-nombre">
                                ${nombreCompleto || '-'}
                            </div>
                            <div class="profesor-modal-id">
                                #${prof.id_profesor || 'S.A'}
                            </div>
                        </div>
                        <div class="profesor-modal-profesion">
                            <i class="bi bi-briefcase-fill"></i>
                            ${prof.profesion || 'Sin profesión registrada'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        });
        html += `</div>`;
        bodyContainer.innerHTML = html;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        const closeBtn = document.getElementById('closeOverlayProfesores');
        const closeOverlay = () => {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        };
        closeBtn.onclick = closeOverlay;
        overlay.onclick = (e) => {
            if (e.target === overlay) closeOverlay();
        };
    },

    verDetalles: function(id) {
        fetch(`/api/taller-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    window.tallerActual = t;
                    const inscritos = t.personas_inscritas;
                    const maximo = t.maximo_estudiante;
                    const disponibles = maximo - inscritos;
                    let estadoBadge = '';
                    switch(t.id_estado_taller) {
                        case 1: estadoBadge = '<mark class="badge bg-info" style="font-size: 0.8rem;">INGRESADO</mark>'; break;
                        case 2: estadoBadge = '<mark class="badge bg-success" style="font-size: 0.8rem;">CALENDARIZADO</mark>'; break;
                        case 3: estadoBadge = '<mark class="badge bg-secondary" style="font-size: 0.8rem;">CERRADO</mark>'; break;
                        case 4: estadoBadge = '<mark class="badge bg-danger" style="font-size: 0.8rem;">DE BAJA</mark>'; break;
                        default: estadoBadge = '<mark class="badge bg-light text-dark" style="font-size: 0.8rem;">DESCONOCIDO</mark>';
                    }
                    let profesoresHtml = '';
                    const profesoresLista = t.profesores || [];
                    const totalProfes = profesoresLista.length;
                    if (totalProfes > 0) {
                        const mostrarInicial = 2;
                        const tieneMas = totalProfes > mostrarInicial;
                        const profesMostrar = tieneMas ? profesoresLista.slice(0, mostrarInicial) : profesoresLista;
                        profesMostrar.forEach(prof => {
                            const nombreCompleto = `${prof.nombre_persona || ''} ${prof.apellido_paterno || ''} ${prof.apellido_materno || ''}`.trim();
                            profesoresHtml += `
                            <div class="profesor-item">
                                <div class="profesor-header">
                                    <div class="profesor-avatar">
                                        ${nombreCompleto ? nombreCompleto.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div class="profesor-main">
                                        <div class="profesor-top">
                                            <div class="profesor-nombre">
                                                ${nombreCompleto || '-'}
                                            </div>
                                            <div class="profesor-id">
                                                #${prof.id_profesor || 'S.A'}
                                            </div>
                                        </div>
                                        <div class="profesor-profesion">
                                            <i class="bi bi-briefcase-fill"></i>
                                            ${prof.profesion || 'Sin profesión registrada'}
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                        });
                        if (tieneMas) {
                            profesoresHtml += `
                            <div class="text-center mt-3">
                                <button
                                    class="btn btn-outline-primary"
                                    onclick="GestionTalleres.mostrarTodosProfesores()">
                                    Ver los ${totalProfes} Talleristas completos
                                </button>
                            </div>
                        `;
                        }
                    } else {profesoresHtml = `<div class="sin-profesores"><i class="bi bi-person-x"></i><span>No hay profesores asignados</span></div>`;}
                    let html = `
                    <div class="row g-3">
                        <div class="col-lg-6">
                            <div class="detalle-card">
                                <div class="detalle-header">
                                    <i class="bi bi-info-circle"></i>
                                    Información General
                                </div>
                                <div class="detalle-grid">
                                    <div class="detalle-item">
                                        <span>ID</span>
                                        <strong>${t.id_taller}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Estado</span>
                                        ${estadoBadge}
                                    </div>
                                    <div class="detalle-item detalle-full">
                                        <span>Nombre</span>
                                        <strong>${t.nombre_taller}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Categoría</span>
                                        <strong>${this.obtenerNombreCategoria(t.id_categoria)}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Lugar</span>
                                        <strong>${t.lugar}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="detalle-card">
                                <div class="detalle-header">
                                    <i class="bi bi-info-circle"></i>
                                    Fechas y Horarios
                                </div>
                                <div class="detalle-grid">
                                    <div class="detalle-item">
                                        <span>Inicio</span>
                                        <strong>${t.fec_inicio}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Termino</span>
                                        <strong>${t.fec_termino}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>N° Clases</span>
                                        <strong>${t.nro_clases_anual}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Minutos/clase</span>
                                        <strong>${t.nro_minutos}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Horas Totales</span>
                                        <strong>${t.horas_totales}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="detalle-card">
                                <div class="detalle-header">
                                    <i class="bi bi-info-circle"></i>
                                    Cupos
                                </div>
                                <div class="detalle-grid">
                                    <div class="detalle-item">
                                        <span>Inscritos</span>
                                        <strong>${inscritos}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Máximo</span>
                                        <strong>${maximo}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Disponibles</span>
                                        <strong class="${disponibles > 0 ? 'text-success' : 'text-danger'} fw-bold">${disponibles}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Mínimo</span>
                                        <strong>${t.minimo_estudiante}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="detalle-card">
                                <div class="detalle-header">
                                    <i class="bi bi-info-circle"></i>
                                    Requisitos de Edad
                                </div>
                                <div class="detalle-grid">
                                    <div class="detalle-item">
                                        <span>Edad Mínima</span>
                                        <strong>${t.edad_minima} años</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Edad Máxima</span>
                                        <strong>${t.edad_maxima} años</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="detalle-card">
                                <div class="detalle-header">
                                    <i class="bi bi-info-circle"></i>
                                    Información Adicional
                                </div>
                                <div class="detalle-grid">
                                    <div class="detalle-item">
                                        <span>ID Departamento</span>
                                        <strong>${t.id_departamento}</strong>
                                    </div>
                                    <div class="detalle-item">
                                        <span>Tipo taller</span>
                                        <strong>${t.ind_tipo_taller}</strong>
                                    </div>
                                    <div class="detalle-item detalle-full">
                                        <span>Fecha del ultimo cambio de estado del Taller</span>
                                        <strong>${t.fec_estado_taller}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="detalle-card">
                                <div class="detalle-header">
                                    <i class="bi bi-person-workspace"></i>
                                    Talleristas (${totalProfes})
                                </div>
                                <div class="detalle-grid-profesores">
                                    ${profesoresHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="acciones-detalle-card">
                                <div class="acciones-detalle-info">
                                    <div class="acciones-detalle-icono">
                                        <i class="bi bi-shield-check"></i>
                                    </div>
                                    <div>
                                        <div class="acciones-detalle-titulo">
                                            Auditoría del Taller
                                        </div>
                                        <div class="acciones-detalle-texto">
                                            Revisa el historial completo de creación y modificaciones del taller.
                                        </div>
                                    </div>
                                </div>
                                <button
                                    class="btn btn-auditoria btn-ver-todas-auditorias"
                                    data-id="${t.id_taller}"
                                    data-nombre="${(t.nombre_taller || '-')}">
                                    <i class="bi bi-file-earmark-person-fill"></i>
                                    Ver las auditorías
                                </button>
                            </div>
                        </div>
                    </div>`;
                    if (t.observacion) html += `<div class="mt-3"><h6 class="titulo-detalle">Observación:</h6><p>${t.observacion}</p></div>`;
                    if (t.objetivo_taller) html += `<div class="mt-3"><h6 class="titulo-detalle">Objetivo:</h6><p>${t.objetivo_taller}</p></div>`;
                    if (t.material) html += `<div class="mt-2"><h6 class="titulo-detalle">Materiales:</h6><p>${t.material}</p></div>`;
                    if (t.requisito) html += `<div class="mt-2"><h6 class="titulo-detalle">Requisitos:</h6><p>${t.requisito}</p></div>`;
                    document.getElementById('detallesTallerBody').innerHTML = html;
                    const auditButton = document.querySelector('#detallesTallerBody .btn-ver-todas-auditorias');
                    if (auditButton) {auditButton.addEventListener('click', (e) => {
                            const id = auditButton.getAttribute('data-id');
                            const nombre = auditButton.getAttribute('data-nombre');
                            this.verTodasAuditorias(id,nombre);
                        });
                    }
                    window.tallerDetallesId = id;
                    new bootstrap.Modal(document.getElementById('modalDetallesTaller')).show();
                }
                else {this.mostrarError('No se pudieron cargar los detalles.');}
            })
        .catch(error => {
            console.error('Error en fetch verDetalles:', error);
            this.mostrarError('Error de conexión al cargar detalles.');
        });
    },

    // debo dejar de utilizr la mayuscula jaja
    abrirModalEditarDesdeDetalles: function() {
        bootstrap.Modal.getInstance(document.getElementById('modalDetallesTaller')).hide();
        setTimeout(() => {
            this.editarTaller(window.tallerDetallesId);
        }, 500); // un pequeño timer para que no se cierre tan rapido
    },

    confirmarEliminar: function(id, nombre) {
        const self = this;
        Swal.fire({
            title: '¿Suspender taller?',
            text: `¿Estas seguro de suspender el taller "${nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, suspender',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {self.ejecutarEliminacion(id);}
        });
    },

    ejecutarEliminacion: function(id) {
        fetch(`/api/taller-cambiar/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(result => {
            // if (id_estado_taller===4) {
            //     this.mostrarError(result.message || 'Error al suspender, el taller ya esta "De Baja"');}
            if (result.success) {
                this.mostrarExito(result.message || 'Taller suspendido correctamente');
                this.cargarTalleres();}
            else {
                this.mostrarError(result.message || 'Error al suspender');}
        })
        .catch(error => {
            console.error('Error:', error);
            this.mostrarError('Error de conexión');
        });
    },

    // AQUI VAN LAS UTILIDADES UQE SON LOS MENSAJE, CABE DECIR QUE ESTO ES DE MI CODIGO ANTIGUO ASI QUE TAL VEZ FALLE, POR MIENTRAS AQUI ESTAN
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

    debounce: function(func, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    },

    // EL BIND EVENTOS QUE CREE HACE RATO, ESTO ES CASI LO ULTIMO
    bindEventos: function() {
        const filtroTiempoReal = this.debounce(() => {
            this.aplicarFiltros();
        }, 200);
        // ahora esto esta definido en la parte de arriba tambien pero aqui los pongo como botones que activan dicha funcion, aun no lo pruebo ni se si esta del todo bien pero vendre aqui
        // si algo sale mal asi que pondre mi codigo "GUTS"
        document.getElementById('aplicarFiltrosBtn')?.addEventListener('click', () => { this.aplicarFiltros(); });
        document.getElementById('limpiarFiltrosBtn')?.addEventListener('click', () => { this.limpiarFiltros(); });
        document.getElementById('busqueda_nombre')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_id')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_lugar')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('formTaller')?.addEventListener('submit', (e) => {e.preventDefault();this.guardarTaller();});
        document.getElementById('filtroAnio')?.addEventListener('change', filtroTiempoReal);
        document.getElementById('filtroEstado')?.addEventListener('change', filtroTiempoReal);
        document.querySelector('.select-categoria-filtro')?.addEventListener('change', filtroTiempoReal);
        // boton de confirmacion de eliminacion
        document.getElementById('btnConfirmar')?.addEventListener('click', () => { this.ejecutarEliminacion(); });
        // boton nuevo taller
        const nuevoTallerBtn = document.querySelector('button[onclick*="abrirModalNuevoTaller"]');
        if (nuevoTallerBtn) {
            // este ejemplo me la dio la ia, se reemplaza el onclick para que se utilice la refenria correcta
            nuevoTallerBtn.onclick = () => { this.abrirModalNuevoTaller(); };
        }
        // como el HTML tiene onclick, tambiEn funciona. pero para mantener la consistencia, lo vinculamos tambiEn aqui.
    }
};
// inicializacion cuando el DOM estE completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    GestionTalleres.inicializando();
});
// dxponer funciones necesarias para los onclick en el HTML (si los hay)
// dsto permite que los botones con onclick="GestionTalleres.funcion()" sigan funcionando.
window.GestionTalleres = GestionTalleres;
const name = ()=> {}