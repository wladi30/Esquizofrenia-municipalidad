const GestionInscripciones = {
    configuracion: {
        paginaActual: 1,
        itemsPorPagina: 20,
        datos: [],
        filtros: { 
            id_estudiante: '', 
            // id_taller: '',
            nombre_completo: '',
            correo_electronico: '',
            estado: '',
            nombre_taller: '',
            year_proceso: '',
            fecha_inscripcion: ''
        }
    },

    inicializando: function() {
        console.log("Inicializando GestionInscripciones...");
        this.cargarLista();
        this.cargarGeneroSelect();
        this.bindEventos();
    },

    cargarGeneroSelect: function() {
        fetch('/api/genero')
            .then(response => response.json())
            .then(data => {
                const selectGenero = document.getElementById('genero');
                if (selectGenero) {
                    selectGenero.innerHTML = '<option value="">Seleccione un Genero...</option>';
                    data.forEach(g => {
                        const option = document.createElement('option');
                        option.value = g.GENERO; // 0,1,2,3,4
                        const nombres = {
                            0: 'Masculino',
                            1: 'Femenino',
                            2: 'No Binario',
                            3: 'Otro',
                            4: 'Prefiero no Decirlo'
                        };
                        option.textContent = nombres[g.GENERO] || 'No definido';
                        selectGenero.appendChild(option);
                    });
                }
            })
        .catch(error => console.error('Error cargando generos:', error));
    },

    cargarPaisesSelect: function() {
        fetch('/api/pais')
            .then(response => response.json())
            .then(data => {
                this.configuracion.datos.paises = data;
                const selectsModal = document.querySelectorAll('.select-pais');
                selectsModal.forEach(select => {
                    select.innerHTML = '<option value="">Seleccione un Pais...</option>';
                    data.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.ID_PAIS;
                        option.textContent = cat.NOMBRE_PAIS;
                        select.appendChild(option);
                    });
                });
                const selectsFiltro = this.document.querySelectorAll('.select-pais-filtro');
                selectsFiltro.forEach(select => {
                    select.innerHTML = '<option value="">Todos los Paises</option>';
                    data.forEach(cat => {
                        const option = this.document.createElement('option');
                        option.value = cat.ID_PAIS;
                        option.textContent = cat.NOMBRE_PAIS;
                        select.appendChild(option);
                    });
                });
            })
        .catch(error => {
            console.error('Error cargando Paises:', error);
            this.mostrarError('No se puedieron cargar los Paises.');
        });
    },

    cargarComunaSelect: function() {
        fetch('/api/comuna')
            .then(response => response.json())
            .then(data => {
                this.configuracion.datos.comunas = data;
                const selectsModal = document.querySelectorAll('.select-comuna');
                selectsModal.forEach(select => {
                    select.innerHTML = '<option value="">Seleccione una Comuna...</option>';
                    data.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.ID_COMUNA;
                        option.textContent = cat.NOMBRE_COMUNA;
                        select.appendChild(option);
                    });
                });
                const selectsFiltro = document.querySelectorAll('.select-categoria-filtro');
                selectsFiltro.forEach(select => {
                    select.innerHTML = '<option value="">Todas las Comunas</option>';
                    data.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.ID_COMUNA;
                        option.textContent = cat.NOMBRE_COMUNA;
                        select.appendChild(option);
                    });
                });
            })
        .catch(error => {
            console.error('Error cargando Comunas:', error);
            this.mostrarError('No se pudieron cargas las Comunas')
        });
    },

    cargarLista: function() {
        const params = new URLSearchParams();
        if (this.configuracion.filtros.id_estudiante) params.append('id_estudiante', this.configuracion.filtros.id_estudiante);
        if (this.configuracion.filtros.nombre_completo) params.append('nombre_completo', this.configuracion.filtros.nombre_completo);
        if (this.configuracion.filtros.correo_electronico) params.append('correo_electronico', this.configuracion.filtros.correo_electronico);
        if (this.configuracion.filtros.estado) params.append('ind_estado_integrante', this.configuracion.filtros.ind_estado_integrante);
        if (this.configuracion.filtros.nombre_taller) params.append('nombre_taller', this.configuracion.filtros.nombre_taller);
        if (this.configuracion.filtros.year_proceso) params.append('year_proceso', this.configuracion.filtros.year_proceso);
        if (this.configuracion.filtros.fecha_inscripcion) params.append('fecha_inscripcion', this.configuracion.filtros.fecha_inscripcion);
        
        document.getElementById('tablaInscripcionesCuerpo').innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="bi bi-arrow-repeat me-2"></i>Cargando...</td></tr>';
        
        fetch(`/api/inscripcion-lista?${params.toString()}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.configuracion.datos = result.data;
                    this.mostrarPagina(1);
                } else {
                    this.mostrarError(result.message);
                }
            })
        .catch(error => {
            console.error(error);
            this.mostrarError('Error de conexión');
        });
    },

    mostrarPagina: function(pagina) {
        this.configuracion.paginaActual = pagina;
        const inicio = (pagina - 1) * this.configuracion.itemsPorPagina;
        const fin = inicio + this.configuracion.itemsPorPagina;
        const datosPagina = this.configuracion.datos.slice(inicio, fin);
        const tbody = document.getElementById('tablaInscripcionesCuerpo');
        
        if (datosPagina.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay Inscripciones registradas</td></tr>';
        } else {
            tbody.innerHTML = datosPagina.map(t => this.generarFila(t)).join('');
        }
        this.actualizarPaginacion();
        document.getElementById('infoPaginacion').innerText = `Mostrando ${inicio + 1}-${Math.min(fin, this.configuracion.datos.length)} de ${this.configuracion.datos.length} resultados`;
    },

    actualizarPaginacion: function() {
        const totalPaginas = Math.ceil(this.configuracion.datos.length / this.configuracion.itemsPorPagina);
        let html = '';
        if (totalPaginas > 1) {
            html += `<li class="page-item ${this.configuracion.paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionInscripciones.cambiarPagina(${this.configuracion.paginaActual - 1}); return false;">&laquo;</a>
            </li>`;
            for (let i = 1; i <= totalPaginas; i++) {
                if (i === this.configuracion.paginaActual ||
                    i === 1 ||
                    i === totalPaginas ||
                    (i >= this.configuracion.paginaActual - 2 && i <= this.configuracion.paginaActual + 2)) {
                    html += `<li class="page-item ${i === this.configuracion.paginaActual ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="GestionInscripciones.cambiarPagina(${i}); return false;">${i}</a>
                    </li>`;
                } else if (i === this.configuracion.paginaActual - 3 || i === this.configuracion.paginaActual + 3) {
                    html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }
            html += `<li class="page-item ${this.configuracion.paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionInscripciones.cambiarPagina(${this.configuracion.paginaActual + 1}); return false;">&raquo;</a>
            </li>`;
        }
        document.getElementById('paginacionInscripciones').innerHTML = html;
    },

    cambiarPagina: function(pagina) {
        if (pagina < 1 || pagina > Math.ceil(this.configuracion.datos.length / this.configuracion.itemsPorPagina)) return;
        this.mostrarPagina(pagina);
    },

    aplicarFiltros: function() {
        this.configuracion.filtros.id_estudiante = document.getElementById('busqueda_id_estudiante').value;
        this.configuracion.filtros.nombre_completo = document.getElementById('busqueda_nombre_completo').value;
        this.configuracion.filtros.correo_electronico = document.getElementById('busqueda_correo_electronico').value;
        this.configuracion.filtros.estado = document.getElementById('busqueda_ind_estado_integrante').value;
        this.configuracion.filtros.nombre_taller = document.getElementById('busqueda_nombre_taller').value;
        this.configuracion.filtros.year_proceso = document.getElementById('busqueda_year_proceso').value;
        this.configuracion.filtros.fecha_inscripcion = document.getElementById('busqueda_fecha_inscripcion').value;
        this.cargarLista();
    },

    limpiarFiltros: function() {
        document.getElementById('busqueda_id_estudiante').value = '';
        document.getElementById('busqueda_nombre_completo').value = '';
        document.getElementById('busqueda_correo_electronico').value = '';
        document.getElementById('busqueda_estado').value = '';
        document.getElementById('busqueda_nombre_taller').value = '';
        document.getElementById('busqueda_year_proceso').value = '';
        document.getElementById('busqueda_fecha_inscripcion').value = '';
        this.configuracion.filtros = { 
            id_estudiante: '',
            nombre_completo: '',
            correo_electronico: '',
            estado: '',
            nombre_taller: '',
            year_proceso: '',
            fecha_inscripcion: ''
        };
        this.cargarLista();
    },

    abrirModalNuevo: function() {
        document.getElementById('modalTitulo').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nueva Inscripcion';
        document.getElementById('formInsripcion').reset();
        const rutInput = document.getElementById('rutEstudiante');
        const dvInput = document.getElementById('dvEstudiante');
        if (rutInput) {
            rutInput.disabled = false;
            rutInput.value = '';
        }
        if (dvInput) {
            dvInput.disabled = false;
            dvInput.value = '';
        }
        let hiddenId = document.getElementById('inscripcionId');
        if (!hiddenId) {
            hiddenId = document.createElement('input');
            hiddenId.type = 'hidden';
            hiddenId.id = 'inscripcionId';
            document.getElementById('formInsripcion').appendChild(hiddenId);
        }
        hiddenId.value = '';
        const fecNaci = document.getElementById('fechaNacimiento');
        if (fecNaci) {
            fecNaci.disabled = false;
        }
        const generoSelect = document.getElementById('genero');
        if (generoSelect) generoSelect.value = '2';
        document.getElementById('idPais').value = '1';
        document.getElementById('idComuna').value = '1';
        new bootstrap.Modal(document.getElementById('modalInscripcion')).show();
    },
    guardar: function() {
        const id = document.getElementById('inscripcionId').value;
        const rutEstudiante = parseInt(document.getElementById('rutEstudiante').value);
        const dvEstudiante = parseInt(document.getElementById('dvEstudiante').value);
        const nombre = document.getElementById('nombreEstudiante').value.trim().toUpperCase();
        const apellido_paterno = document.getElementById('apellidoPaterno').value.trim().toUpperCase();
        const apellido_materno = document.getElementById('apellidoMaterno').value.trim().toUpperCase();
        const genero = parseInt(document.getElementById('genero').value) || 2;
        const telefono = document.getElementById('telefono').value.trim().toUpperCase();
        const correo = document.getElementById('correo').value.trim().toUpperCase();
        const telefono_contacto = document.getElementById('telefonoContacto').value.trim().toUpperCase();
        const nombre_contacto = document.getElementById('nombreContacto').value.trim().toUpperCase();
        const correo_contacto = document.getElementById('correoContacto').value.trim().toUpperCase();
        // const profesion = document.getElementById('profesion').value.trim().toUpperCase();
        // const resumen_curricular = document.getElementById('resumenCurricular').value.trim().toUpperCase();
        // const indicador_actividad = parseInt(document.getElementById('indicadorActividad').value) || 1;
        const observacion = document.getElementById('observacion').value.trim().toUpperCase();
        const id_pais = parseInt(document.getElementById('idPais').value) || 1;
        const id_comuna = parseInt(document.getElementById('idComuna').value) || 1;
        const villa = document.getElementById('villa').value.trim().toUpperCase();
        const nro_dpto = document.getElementById('numeroDepartamento').value.trim().toUpperCase();
        const nro_block = document.getElementById('numeroBlock').value.trim().toUpperCase();
        const nro_calle = document.getElementById('numeroCalle').value.trim().toUpperCase();
        const calle = document.getElementById('calle').value.trim().toUpperCase();
        const fechaInicio = document.getElementById('fechaNacimiento').value;

        if (!nombre) { this.mostrarError('El nombre es obligatorio'); return; }
        if (!correo) { this.mostrarError('El correo es obligatorio'); return; }

        const data = {
            rut_estudiante: rutEstudiante,
            dv_estudiante: dvEstudiante,
            nombre_estudiante: nombre,
            apellido_paterno: apellido_paterno,
            apellido_materno: apellido_materno,
            genero: genero,
            telefono: telefono || '-',
            correo_electronico: correo,
            telefono_contacto: telefono_contacto || '-',
            nombre_contacto: nombre_contacto || '-',
            correo_contacto: correo_contacto || '-',
            // profesion: profesion || '-',
            // resumen_curricular: resumen_curricular || '-',
            // ind_activo: indicador_actividad,
            observacion: observacion || '-',
            id_pais: id_pais,
            id_comuna: id_comuna,
            villa: villa || '-',
            nro_dpto: nro_dpto || '-',
            nro_block: nro_block || '-',
            nro_calle: nro_calle || '-',
            calle: calle || '-',
            fec_nacimiento: fechaInicio

        };

        const url = id ? `/api/inscripcion-actualizar/${id}` : '/api/inscripcion-crear';
        const method = id ? 'PUT' : 'POST';

        fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    bootstrap.Modal.getInstance(document.getElementById('modalInscripcion')).hide();
                    this.mostrarExito(result.message || 'Operación exitosa');
                    this.cargarLista();
                } else {
                    this.mostrarError(result.message || 'Error al guardar');
                }
            })
            .catch(error => { console.error(error); this.mostrarError('Error de conexión'); });
    },

    editar: function(id) {
        // con esto cualquiera se vuelve ezquiso, me daba un problema de que no modificaba , reviso aqui y alla, veo el app funcionario, veo el procedimiento(mentira), todo bien todo correcto, 
        // pero seguia sin funcionar, despues me di cuenta que podria ser el db_test, encuentro errores y digo ya bien ahora debe funcionar, sigue sin hacerlo
        // reviso mas aun , hasta manoseo el css y nada, el problema? le puse la mierda right join en vez de left, salu2
        fetch(`/api/inscripcion-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    console.log("Datos completos de la inscripcion:", t);
                    document.getElementById('modalTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Inscripcion';
                    let hiddenId = document.getElementById('inscripcionId');
                    if (!hiddenId) {
                        hiddenId = document.createElement('input');
                        hiddenId.type = 'hidden';
                        hiddenId.id = 'inscripcionId';
                        document.getElementById('formInsripcion').appendChild(hiddenId);
                    }
                    hiddenId.value = id;
                    const rutInput = document.getElementById('rutEstudiante');
                    const dvInput = document.getElementById('dvEstudiante');
                    if (rutInput) {
                        rutInput.value = t.rut_estudiante || '';
                        rutInput.disabled = true;
                    }
                    if (dvInput) {
                        dvInput.value = t.dv_estudiante || '';
                        dvInput.disabled = true;
                    }
                    document.getElementById('idEstudiante').value = t.id_estudiante;
                    document.getElementById('nombreEstudiante').value = t.nombre_estudiante || '';
                    document.getElementById('apellidoPaterno').value = t.apellido_paterno || '';
                    document.getElementById('apellidoMaterno').value = t.apellido_materno || '';
                    const generoSelect = document.getElementById('genero');
                    if (generoSelect && (t.genero !== undefined && t.genero !== null)) {
                        generoSelect.value = t.genero;
                    }
                    document.getElementById('telefono').value = t.telefono || '';
                    document.getElementById('correo').value = t.correo_electronico || '';
                    document.getElementById('telefonoContacto').value = t.telefono_contacto || '';
                    document.getElementById('nombreContacto').value = t.nombre_contacto || '';
                    document.getElementById('correoContacto').value = t.correo_contacto || '';
                    // document.getElementById('profesion').value = t.profesion || '';
                    // document.getElementById('resumenCurricular').value = t.resumen_curricular || '';
                    document.getElementById('observacion').value = t.observacion || '';
                    document.getElementById('idPais').value = t.id_pais || 1;
                    document.getElementById('idComuna').value = t.id_comuna || 1;
                    document.getElementById('villa').value = t.villa || '';
                    document.getElementById('numeroDepartamento').value = t.nro_dpto || '';
                    document.getElementById('numeroBlock').value = t.nro_block || '';
                    document.getElementById('numeroCalle').value = t.nro_calle || '';
                    document.getElementById('calle').value = t.calle || '';
                    document.getElementById('audUsuarioIngreso').value = t.aud_usuario_ingreso;
                    document.getElementById('audFecIngreso').value = t.aud_fec_ingreso;
                    document.getElementById('audUsuarioModifica').value = t.aud_usuario_modifica;
                    document.getElementById('audFecModifica').value = t.aud_fec_modifica;
                    const fecNaci = document.getElementById('fechaNacimiento');
                    if (fecNaci) {
                        fecNaci.value = t.fec_nacimiento || '';
                        fecNaci.disabled = true;
                    }
                    new bootstrap.Modal(document.getElementById('modalInscripcion')).show();
                } else {
                    this.mostrarError(result.message || 'No se pudo cargar el inscripcion');
                }
            })
        .catch(error => { console.error(error); this.mostrarError('Error de conexión en editar'); });
    },

    // ESTO FALTA POR MODIFICAR la idea de esto es que se puedan ver los detalles del tallerista, pero son muchos asi que tengo que preparar esto
    verDetalles: function(id) {
        fetch(`/api/inscripcion-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    console.log("Datos del inscripcion:", t);
                    // const 
                    let html = `
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="fw-bold">Informacion Personal</h6>
                                <table class="table table-sm text-nowrap">
                                    <tr><th>ID Estudiante:</th><td>${t.id_estudiante || 'No registrado'}</td></tr>
                                    <tr><th>Nombre:</th><td>${t.nombre_estudiante || 'No registrado'}</td></tr>
                                    <tr><th>Apellido Paterno:</th><td>${t.apellido_paterno || 'No registrado'}</td></tr>
                                    <tr><th>Apellido Materno:</th><td>${t.apellido_materno || 'No registrado'}</td></tr>
                                    <tr><th>R.U.T:</th><td>${t.rut_estudiante || 'No registrado'}</td></tr>
                                    <tr><th>Digito Verificador:</th><td>${t.dv_estudiante || 'No registrado'}</td></tr>
                                    <tr><th>Fecha de Nacimiento:</th><td>${t.fec_nacimiento || 'No registrada'}</td></tr>
                                    <tr><th>Edad:</th><td>${t.edad || 'No registrada'}</td></tr>
                                    <tr><th>Genero:</th><td>${t.genero || 'No registrado'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Contactos</h6>
                                <table class="table table-sm">
                                    <tr><th>Telefono de la Persona:</th><td>${t.telefono || 'No registrado'}</td></tr>
                                    <tr><th>Correo de la Persona:</th><td>${t.correo_electronico || 'No registrado'}</td></tr>
                                    <tr><th>Nombre del Contacto:</th><td>${t.nombre_contacto || 'No registrado'}</td></tr>
                                    <tr><th>Telefono del Contacto:</th><td>${t.telefono_contacto || 'No registrado'}</td></tr>
                                    <tr><th>Correo del Contacto:</th><td>${t.correo_contacto || 'No registrado'}</td></tr>
                                </table>    
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <h6 class="fw-bold">Informacion General</h6>
                                <table class="table table-sm">
                                    <tr><th>Indicador de Actividad:</th><td>${t.ind_activo || 'No registrado'}</td></tr>
                                    <tr><th>Tipo de Usuario:</th><td>${t.tipo_usuario || 'No registrado'}</td></tr>
                                    <tr><th>Observacion:</th><td>${t.observacion || 'No registrado'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Informacion del Taller</h6>
                                <table class="table table-sm">
                                    <tr><th>ID del Taller:</th><td>${t.id_taller || 'No existe'}</td></tr>
                                    <tr><th>Nombre del Taller:</th><td>${t.nombre_taller || 'No existe'}</td></tr>
                                    <tr><th>Año del Proceso:</th><td>${t.year_proceso || 'No existe'}</td></tr>
                                    <tr><th>Nombre del Taller:</th><td>${t.nombre_taller || 'No existe'}</td></tr>
                                    <tr><th>Año del Proceso:</th><td>${t.year_proceso || 'No existe'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Informacion Adicional</h6>
                                <table class="table table-sm">
                                    <tr><th>Usuario que ingreso al profesor:</th><td>${t.aud_usuario_ingreso || 'No registrado'}</td></tr>
                                    <tr><th>Fecha del ingreso:</th><td>${t.aud_fec_ingreso || 'No registrado'}</td></tr>
                                    <tr><th>Usuario que hizo la ultima modificación:</th><td>${t.aud_usuario_modifica || 'No registrado'}</td></tr>
                                    <tr><th>Fecha de la ultima modificación:</th><td>${t.aud_fec_modifica || 'No registrado'}</td></tr>
                                </table>
                            </div>
                        </div>
                    `;
                    document.getElementById('detallesEstudianteBody').innerHTML = html;
                    window.estudianteDetallesId = id;
                    new bootstrap.Modal(document.getElementById('modalDetallesEstudiante')).show();
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

    // debo usar small para poner mas cosas en pantalla
    generarFila: function(t) {
    const nombreCompleto = `${t.NOMBRE_ESTUDIANTE || ''} ${t.APELLIDO_PATERNO || ''} ${t.APELLIDO_MATERNO || ''}`.trim();
    const idTallerAsignado = t.ID_TALLER || '...';
    const tallerAsignado = t.NOMBRE_TALLER || 'No tiene, o es un nuevo Integrante';
    const correoElectronico = t.CORREO_ELECTRONICO || 'No tiene o no esta Registrado';
        return `
            <tr>
                <td class="ps-4 fw-semibold">${t.ID_ESTUDIANTE}</td>
                <td>${t.NOMBRE_COMPLETO || 'Sin nombre'}</td>
                <td>
                    <small>${tallerAsignado}</small><br>
                    <small class="text-muted">ID Taller: ${idTallerAsignado}</small>
                </td>
                <td>${t.YEAR_PROCESO}</td>
                <td>${t.AUD_FEC_INGRESO}</td>
                <td>${correoElectronico}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="GestionInscripciones.verDetalles(${t.id_estudiante})" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="GestionInscripciones.editar(${t.id_estudiante})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `;
    },
    // <button class="btn btn-sm btn-outline-danger" onclick="GestionInscripciones.confirmarEliminar(${t.ID_PROFESOR}, '${nombreCompleto.replace(/'/g, "\\'")}')" title="Suspender">
    //     <i class="bi bi-trash"></i>
    // </button>

    confirmarEliminar: function(id, nombre) {
        Swal.fire({
            title: '¿Suspender tallerista?',
            text: `¿Estas seguro de suspender a ${nombre}? Quedara inactivo.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, suspender',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.ejecutarEliminacion(id);
            }
        });
    },

    // ejecutarEliminacion: function(id) {
    //     fetch(`/api/tallerista-suspender/${id}`, { method: 'PUT' })
    //         .then(response => response.json())
    //         .then(result => {
    //             if (result.success) {
    //                 this.mostrarExito(result.message || 'Tallerista suspendido correctamente');
    //                 this.cargarLista();
    //             } else {
    //                 this.mostrarError(result.message || 'Error al suspender');
    //             }
    //         })
    //     .catch(error => {
    //         console.error(error);
    //         this.mostrarError('Error de conexión');
    //     });
    // },

    mostrarExito: function(mensaje) {
        Swal.fire({ icon: 'success', title: 'exito', text: mensaje, timer: 2000, showConfirmButton: false });
    },
    mostrarError: function(mensaje) {
        Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
    },

    bindEventos: function() {
        document.getElementById('aplicarFiltrosBtn')?.addEventListener('click', () => this.aplicarFiltros());
        document.getElementById('limpiarFiltrosBtn')?.addEventListener('click', () => this.limpiarFiltros());
        document.getElementById('busqueda_id_estudiante')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_id_taller')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_nombre_completo')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_correo_electronico')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_ind_estado_integrante')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_nombre_taller')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); } 
        });
        document.getElementById('busqueda_year_proceso')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_fecha_inscripcion')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('formInsripcion')?.addEventListener('submit', (e) => { 
            e.preventDefault(); 
            this.guardar(); 
        });
        document.getElementById('btnNuevaInscripcion')?.addEventListener('click', () => this.abrirModalNuevo());
    }
};

document.addEventListener('DOMContentLoaded', () => GestionInscripciones.inicializando());
window.GestionInscripciones = GestionInscripciones;