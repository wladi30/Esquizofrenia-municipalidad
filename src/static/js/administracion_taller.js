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
    console.warn("La variable 'data' no está definida en esta página.");
}
// Aqui doy inicio al js principal que se encargara de casi todo sobre administracion de talleres

// el de aca sera lo que definira a lo que se muestra en la pag de talleres, aqui hare definiciones de cuandos talleres se muestran por pagina al igual que setear cuales seran los filtros
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
            busqueda: '',
            busqueda_id: '',
            busqueda_lugar: '',
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
                    select.innerHTML = '<option value="">Seleccione categoría...</option>';
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
                    select.innerHTML = '<option value="">Todas las categorías</option>';
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
            console.error('Error cargando categorías:', error);
            this.mostrarError('No se pudieron cargar las categorías.');
        });
    },
    // cargarDepartamentos: function() {
    //     fetch('/api/departamento')
    //         .then(response => response.json())
    //         .then(data => {
    //             this.configuracion.datos.departamentos = data;
    //             const selectsModal = document.querySelectorAll('.select-departamento');
    //             selectsModal.forEach(select => {
    //                 select.innerHTML = '<option value="">Seleccione departamento...</option>';
    //                 data.forEach(cat => { 
    //                     const option = document.createElement('option');
    //                     option.value = cat.ID_DEPARTAMENTO;
    //                     option.textContent = cat.DESCRIPCION_CATEGORIA;
    //                     select.appendChild(option);
    //                 });
    //             });
    //             const selectsFiltro = document.querySelectorAll('.select-departamento-filtro');
    //             selectsFiltro.forEach(select => {
    //                 select.innerHTML = '<option value="">Todos los departamentos</option>';
    //                 data.forEach(cat => {
    //                     const option = document.createElement('option');
    //                     option.value = cat.ID_DEPARTAMENTO;
    //                     option.textContent = cat.DESCRIPCION_CATEGORIA;
    //                     select.appendChild(option);
    //                 });
    //             });
    //         })
    //     .catch(error => {
    //         console.error('Error cargando departamentos:', error);
    //         this.mostrarError('No se pudieron cargar las departamentos.');
    //     });
    // },

    // aqui va la parte d elos talleristas
    cargarTalleristasSelect: function(){
        // contruire primero las urls despues seguimos con los filtros
        fetch('/api/tallerista-lista')
        .then(response => response.json())
        .then(result => {
            if (result.success){
                this.configuracion.datos.talleristas = result.data;
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
    limpiarFiltros: function() {
    document.getElementById('filtroAnio').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('busqueda').value = '';
    document.getElementById('busqueda_id').value = '';
    document.getElementById('busqueda_lugar').value = '';
    
    // Limpiar el select de categoría filtro
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
        // aqui estoy haciendo los filtros que usare en cargar taller, year y estado seran valores mas simples de poner, year es solo el año que deberia ser automatico ademas de poder colocar los años anteriores
        // y estado seran los estados del 1 al 4 que se encuentran los talleres
        const params = new URLSearchParams();
        if (this.configuracion.filtros.year) params.append('year', this.configuracion.filtros.year);
        if (this.configuracion.filtros.estado) params.append('estado', this.configuracion.filtros.estado);
        if (this.configuracion.filtros.categoria) params.append('categoria', this.configuracion.filtros.categoria);
        if (this.configuracion.filtros.busqueda) params.append('busqueda', this.configuracion.filtros.busqueda);
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
                // ATENCION recuerda que aqui aun no existe nada, tambien los innerHTML de esta funcion aun no tienen nada valido, asi que tengo que solucionarlo
                // solo deberia poner unos cuantos iconos en los innerHTML, por lo demas debo ver que ocuure de resultado, podria ser mostrarPagina pero lo veo despues.
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
        // aqui pondre todos los estados de taller , son solo 4 por defecto pondre el estado 3(cerrado) como el predeterminado
        // ESTA WEA ESTA ENTERA MALA 'GUTS'(palabra clave), por alguna razon que desconozco completamente el estado que se muestra en pantalla es el mismo al ultimo estado que dejo habilitado
        // un ejemplo de esto, ahora mismo existen 4 case y un default, si dejo el default habiltado todos mostraran el estado 'CERRADO' por que es el texto que le puse
        // si lo desactivo y dejo solo los 4 case todos tendran el estado 'DE BAJA' , hrmano esta wea esta entera mala xd
        // 25/03/2026 11:34 am, ahora funciona salu2 solo tuve que ponerle el break; al final, no me crucifiquen salu2 salu2 y recuerd salu2
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
        this.configuracion.filtros.busqueda = document.getElementById('busqueda').value;
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
    // const fechaInicio = document.getElementById('fecInicio').value;
    // const fechaTermino = document.getElementById('fecTermino').value;
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

    // validacion nametaller
    
    const data = {
        year_proceso: yearProceso,
        id_categoria: parseInt(selectCategoriaModal ? selectCategoriaModal.value : 0),
        nombre_taller: nameTaller,
        objetivo_taller: objTaller,
        // fecha_inicio: fechaInicio,
        // fecha_termino: fechaTermino,
        nro_minutos: numeroDeMinutos,
        nro_clases_anual: numeroDeClasesAnuales,
        horas_totales_v2: numeroHorasTotales,
        id_estado_taller: numeroIdEstadoTaller,
        observacion_v2: observacionTaller,
        lugar: lugarTaller,
        minimo_estudiante: minimoEstudiante,
        maximo_estudiante: maximoEstudiante,
        requisito: requisitosTaller,
        edad_minima: edadMinimaTaller,
        edad_maxima: edadMaximaTaller,
        material: materialTaller,
        ind_tipo_taller: idTipoTaller,
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
                    // se viene un cambio muchachos
                    document.getElementById('objetivo').value = t.objetivo_taller;
                    // cambio de codigo aqui, se van a mejorar las fechas o mas bien se van a cambiar
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
    // AQUI VA LO DEL VER DETALLES , ESTO DEBERIA MOSTRAR TODO LO NECESARIO TANTO FECHA DE CREACION, TALLERISTA, NRO DE ALUMNOS, ETC
    verDetalles: function(id) {
        fetch(`/api/taller-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    const inscritos = t.personas_inscritas;
                    const maximo = t.maximo_estudiante;
                    const disponibles = maximo - inscritos;
                    // SE DETERMINA EL BADGE DEL ESTADO DEL TALLER, DIFERENTE AL DE ARRIBA POR QUE ESTO ES LO QUE TIENE QUE VER EL USUARIO, LO DE ARRIBA SON LAS IDS
                    let estadoBadge = '';
                    switch(t.id_estado_taller) {
                        case 1: estadoBadge = '<span class="badge bg-success">INGRESADO</span>'; break;
                        case 2: estadoBadge = '<span class="badge bg-info">CANDALERIZADO</span>'; break;
                        case 3: estadoBadge = '<span class="badge bg-secondary">CERRADO</span>'; break;
                        case 4: estadoBadge = '<span class="badge bg-danger">DE BAJA</span>'; break;
                        default: estadoBadge = '<span class="badge bg-light text-dark">DESCONOCIDO</span>';
                    }
                    // TAMADRE QUE ME COSTO ESTA PARTE, TENGO QUE ADMITIR QUE LA MAYORIA DE LO DE AQUI ABAJO LO HIZO CHAT GTP, NO VEIA LA FORMA (no me acordaba del ${} que existia) 
                    // CABDE DEDCIR QUE CUANDO ME AYUDO CON LO DEL HTML Y JS JUNTO A USA SOLA SCRIPT LO COPIE Y LE PEGUE ARRIBA TAMBIEN ASIQUE SI ME AHORRO COMO 20 MIN DE VIDEO GPT CHAT
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
                    window.tallerDetallesId = id; // GUARDA EL BOTON EDITAR PARA VER LOS DETALLES, PERO QUE FUNCIONE SIPO MI CHANCHO
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

    // debo dejar de utilizr la mayuscula jaja
    abrirModalEditarDesdeDetalles: function() {
        bootstrap.Modal.getInstance(document.getElementById('modalDetallesTaller')).hide();
        setTimeout(() => {
            this.editarTaller(window.tallerDetallesId);
        }, 500); // un pequeño timer para que no se cierre tan rapido
    },

    // bueno aqui la idea es que si se elimina un taller se le cambia a suspendido 
    confirmarEliminar: function(id, nombre) {
        this.configuracion.EliminacionVerdaderaDeTaller = id;
        document.getElementById('mensajeConfirmacion').innerHTML =
            `¿Esta seguro de suspender el taller <strong>${nombre}</strong>?<br>
            <small class="text-muted">Esta accion cambiara el estado a "Suspendido". Los alumnos no podran inscribirse.</small>`;
        const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
        modal.show();
    },
    ejecutarEliminacion: function() {
        const id = this.configuracion.EliminacionVerdaderaDeTaller;
        if (!id) return;
        fetch(`/api/taller-cambiar/${id}`, { method: 'PUT' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.mostrarExito(result.message || 'Taller suspendido');
                    this.cargarTalleres();
                } else {
                    this.mostrarError(result.message || 'Error al suspender');
                }
            })
            .catch(error => {
                console.error('Error en fetch eliminar:', error);
                this.mostrarError('Error de conexion al suspender.');
            })
            .finally(() => {
                bootstrap.Modal.getInstance(document.getElementById('modalConfirmacion')).hide();
                this.configuracion.EliminacionVerdaderaDeTaller = null;
            });
    },

    ejecutarEliminacionVerdadera: function() {
        const id = this.configuracion.EliminacionVerdaderaDeTaller;
        if (!id) return;
        fetch(`/api/taller-delete/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.mostrarExito(result.message || 'Taller eliminado');
                    this.cargarTalleres();
                } else {
                    this.mostrarError(result.message || 'Error al eliminar');
                }
            })
            .catch(error => {
                console.error('Error en fetch eliminar:', error);
                this.mostrarError('Error de conexion al eliminar.');
            })
            .finally(() => {
                bootstrap.Modal.getInstance(document.getElementById('modalConfirmacion')).hide();
                this.configuracion.EliminacionVerdaderaDeTaller = null;
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

    // EL BIND EVENTOS QUE CREE HACE RATO, ESTO ES CASI LO ULTIMO
    bindEventos: function() {
        // ahora esto esta definido en la parte de arriba tambien pero aqui los pongo como botones que activan dicha funcion, aun no lo pruebo ni se si esta del todo bien pero vendre aqui
        // si algo sale mal asi que pondre mi codigo "GUTS"
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