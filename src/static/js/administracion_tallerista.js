const GestionTalleristas = {
    configuracion: {
        paginaActual: 1,
        itemsPorPagina: 20,
        datos: [],
        filtros: { 
            id_profesor: '', 
            id_taller: '',
            nombre_taller: '',
            profesion: '',
            nombre_completo: '',
            correo_electronico: ''
        }
    },

    mapearGenero: function(codigo) {
        if (!codigo) return 'No especificado';
        const mapa = { 'M': 'Masculino', 'F': 'Femenino', 'O': 'Otro' };
        return mapa[codigo.toUpperCase()] || 'No especificado';
    },

    inicializando: function() {
        this.cargarLista();
        this.bindEventos();
    },

    cargarLista: function() {
        const params = new URLSearchParams();
        if (this.configuracion.filtros.id_profesor) params.append('id_profesor', this.configuracion.filtros.id_profesor);
        if (this.configuracion.filtros.id_taller) params.append('id_taller', this.configuracion.filtros.id_taller);
        if (this.configuracion.filtros.nombre_taller) params.append('nombre_taller', this.configuracion.filtros.nombre_taller);
        if (this.configuracion.filtros.profesion) params.append('profesion', this.configuracion.filtros.profesion);
        if (this.configuracion.filtros.nombre_completo) params.append('nombre_completo', this.configuracion.filtros.nombre_completo);
        if (this.configuracion.filtros.correo_electronico) params.append('correo_electronico', this.configuracion.filtros.correo_electronico);
        
        document.getElementById('tablaTalleristasCuerpo').innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="bi bi-arrow-repeat me-2"></i>Cargando...</td></tr>';
        
        fetch(`/api/tallerista-lista?${params.toString()}`)
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
        const tbody = document.getElementById('tablaTalleristasCuerpo');
        
        if (datosPagina.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay talleristas registrados</td></tr>';
        } else {
            tbody.innerHTML = datosPagina.map(t => this.generarFila(t)).join('');
        }
        this.actualizarPaginacion();
        document.getElementById('infoPaginacion').innerText = `Mostrando ${inicio + 1}-${Math.min(fin, this.configuracion.datos.length)} de ${this.configuracion.datos.length} resultados`;
    },

    generarFila: function(t) {
        const nombreCompleto = `${t.NOMBRE_COMPLETO}`.trim();
        const idTallerAsignado = t.ID_TALLER || 'No tiene, o es un nuevo Profesor';
        const tallerAsignado = t.NOMBRE_TALLER || 'No tiene, o es un nuevo Profesor';
        return `
            <tr>
                <td class="ps-4 fw-semibold">${t.ID_PROFESOR}</td>
                <td>${nombreCompleto || 'Sin nombre'}</td>
                <td>${idTallerAsignado}</td>
                <td>${tallerAsignado}</td>
                <td>${t.PROFESION || '-'}</td>
                <td>${t.CORREO_ELECTRONICO || '-'}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="GestionTalleristas.verDetalles(${t.ID_PROFESOR})" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="GestionTalleristas.editar(${t.ID_PROFESOR})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="GestionTalleristas.confirmarEliminar(${t.ID_PROFESOR}, '${nombreCompleto.replace(/'/g, "\\'")}')" title="Suspender">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    actualizarPaginacion: function() {
        const totalPaginas = Math.ceil(this.configuracion.datos.length / this.configuracion.itemsPorPagina);
        let html = '';
        if (totalPaginas > 1) {
            html += `<li class="page-item ${this.configuracion.paginaActual === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionTalleristas.cambiarPagina(${this.configuracion.paginaActual - 1}); return false;">&laquo;</a>
            </li>`;
            for (let i = 1; i <= totalPaginas; i++) {
                if (i === this.configuracion.paginaActual ||
                    i === 1 ||
                    i === totalPaginas ||
                    (i >= this.configuracion.paginaActual - 2 && i <= this.configuracion.paginaActual + 2)) {
                    html += `<li class="page-item ${i === this.configuracion.paginaActual ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="GestionTalleristas.cambiarPagina(${i}); return false;">${i}</a>
                    </li>`;
                } else if (i === this.configuracion.paginaActual - 3 || i === this.configuracion.paginaActual + 3) {
                    html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
            }
            html += `<li class="page-item ${this.configuracion.paginaActual === totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="GestionTalleristas.cambiarPagina(${this.configuracion.paginaActual + 1}); return false;">&raquo;</a>
            </li>`;
        }
        document.getElementById('paginacionTalleristas').innerHTML = html;
    },

    cambiarPagina: function(pagina) {
        if (pagina < 1 || pagina > Math.ceil(this.configuracion.datos.length / this.configuracion.itemsPorPagina)) return;
        this.mostrarPagina(pagina);
    },

    aplicarFiltros: function() {
        this.configuracion.filtros.id_profesor = document.getElementById('busqueda_id_profesor').value;
        this.configuracion.filtros.id_taller = document.getElementById('busqueda_id_taller').value;
        this.configuracion.filtros.nombre_taller = document.getElementById('busqueda_nombre_taller').value;
        this.configuracion.filtros.profesion = document.getElementById('busqueda_profesion').value;
        this.configuracion.filtros.nombre_completo = document.getElementById('busqueda_nombre_completo').value;
        this.configuracion.filtros.correo_electronico = document.getElementById('busqueda_correo_electronico').value;
        this.cargarLista();
    },

    limpiarFiltros: function() {
        document.getElementById('busqueda_id_profesor').value = '';
        document.getElementById('busqueda_id_taller').value = '';
        document.getElementById('busqueda_nombre_taller').value = '';
        document.getElementById('busqueda_profesion').value = '';
        document.getElementById('busqueda_nombre_completo').value = '';
        document.getElementById('busqueda_correo_electronico').value = '';
        this.configuracion.filtros = { 
            id_profesor: '', 
            id_taller: '',
            nombre_taller: '',
            profesion: '',
            nombre_completo: '',
            correo_electronico: ''
        };
        this.cargarLista();
    },

    abrirModalNuevo: function() {
        document.getElementById('modalTitulo').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Tallerista';
        document.getElementById('formTallerista').reset();
        document.getElementById('idProfesor').value = '';
        new bootstrap.Modal(document.getElementById('modalTallerista')).show();
    },

    guardar: function() {
        const nombre = document.getElementById('nombre').value.trim().toUpperCase();
        const apellido_paterno = document.getElementById('apellidoPaterno').value.trim().toUpperCase();
        const apellido_materno = document.getElementById('apellidoMaterno').value.trim().toUpperCase();
        const genero = document.getElementById('genero').value.trim().toUpperCase();
        const telefono = document.getElementById('telefono').value.trim().toUpperCase();
        const correo = document.getElementById('correo').value.trim().toUpperCase();
        const telefono_contacto = document.getElementById('telefonoContacto').value.trim().toUpperCase();
        const nombre_contacto = document.getElementById('nombreContacto').value.trim().toUpperCase();
        const correo_contacto = document.getElementById('correoContacto').value.trim().toUpperCase();
        const profesion = document.getElementById('profesion').value.trim().toUpperCase();
        const resumen_curricular = document.getElementById('resumenCurricular').value.trim().toUpperCase();
        const indicador_actividad = parseInt(document.getElementById('indicadorActividad').value);
        const observacion = document.getElementById('observacion').value.trim().toUpperCase();
        const id_pais = parseInt(document.getElementById('idPais').value);
        const id_comuna = parseInt(document.getElementById('idComuna').value);
        const villa = document.getElementById('villa').value.trim().toUpperCase();
        const nro_dpto = document.getElementById('numeroDepartamento').value.trim().toUpperCase();
        const nro_block = document.getElementById('numeroBlock').value.trim().toUpperCase();
        const nro_calle = document.getElementById('numeroCalle').value.trim().toUpperCase();
        const calle = document.getElementById('calle').value.trim().toUpperCase();
        const bloqueado_hasta = document.getElementById('bloqueadoHasta').value.trim().toUpperCase();
        
        const data = {
            nombre_persona: nombre,
            apellido_paterno: apellido_paterno,
            apellido_materno: apellido_materno,
            genero: genero || 'O',
            telefono: telefono || '-',
            correo_electronico: correo || 'prueba@test.cl',
            telefono_contacto: telefono_contacto || '-',
            nombre_contacto: nombre_contacto || '-',
            correo_contacto: correo_contacto || '-',
            profesion: profesion || '-',
            resumen_curricular: resumen_curricular || '-',
            ind_actividad: indicador_actividad,
            observacion: observacion || '-',
            id_pais: id_pais || 0,
            id_comuna: id_comuna || 0,
            villa: villa || '-',
            nro_dpto: nro_dpto || '-',
            nro_block: nro_block || '-',
            nro_calle: nro_calle || '-',
            calle: calle || '-',
            bloqueado_hasta: bloqueado_hasta,
        }
        if (!data.nombre) {
            this.mostrarError('El nombre es obligatorio');
            return;
        }
        if (!data.correo) {
            this.mostrarError('El correo es obligatorio');
            return;
        }
        
        const url = id ? `/api/tallerista-actualizar/${id}` : '/api/tallerista-crear';
        const method = id ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                bootstrap.Modal.getInstance(document.getElementById('modalTallerista')).hide();
                this.mostrarExito(result.message || 'Operación exitosa');
                this.cargarLista();
            } else {
                this.mostrarError(result.message || 'Error al guardar');
            }
        })
        .catch(error => {
            console.error(error);
            this.mostrarError('Error de conexión');
        });
    },

    editar: function(id) {
        fetch(`/api/tallerista-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    document.getElementById('modalTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Tallerista';
                    document.getElementById('idProfesor').value = t.id_profesor;
                    document.getElementById('nombrePersona').value = t.nombre_persona;
                    document.getElementById('apellidoPaterno').value = t.apellido_paterno;
                    document.getElementById('apellidoMaterno').value = t.apellido_materno;
                    document.getElementById('fechaNacimiento').value = t.fec_nacimiento;
                    document.getElementById('edad').value = t.edad;
                    document.getElementById('genero').value = t.genero;
                    document.getElementById('telefono').value = t.telefono;
                    document.getElementById('correo').value = t.correo_electronico;
                    document.getElementById('telefonoContacto').value = t.telefono_contacto;
                    document.getElementById('nombreContacto').value = t.nombre_contacto;
                    document.getElementById('correoContacto').value = t.correo_contacto;
                    document.getElementById('profesion').value = t.profesion;
                    document.getElementById('resumenCurricular').value = t.resumen_curricular;
                    document.getElementById('indicadorActividad').value = t.ind_actividad;
                    document.getElementById('tipoUsuario').value = t.tipo_usuario;
                    document.getElementById('observacion').value = t.observacion;
                    document.getElementById('idPais').value = t.id_pais;
                    document.getElementById('idComuna').value = t.id_comuna;
                    document.getElementById('villa').value = t.villa;
                    document.getElementById('numeroDepartamento').value = t.nro_dpto;
                    document.getElementById('numeroBlock').value = t.nro_block;
                    document.getElementById('numeroCalle').value = t.nro_calle;
                    document.getElementById('calle').value = t.calle;
                    document.getElementById('fechaCreacion').value = t.fec_creacion;
                    document.getElementById('ultimoAcceso').value = t.ultimo_acceso;
                    document.getElementById('intentosFallidos').value = t.intentos_fallidos;
                    document.getElementById('bloqueadoHasta').value = t.bloqueado_hasta;
                    document.getElementById('audUsuarioIngreso').value = t.aud_usuario_ingreso;
                    document.getElementById('audFecIngreso').value = t.aud_fec_ingreso;
                    document.getElementById('audUsuarioModifica').value = t.aud_usuario_modifica;
                    document.getElementById('audFecModifica').value = t.aud_fec_modifica;
                    new bootstrap.Modal(document.getElementById('modalTallerista')).show();
                } else {
                    this.mostrarError(result.message || 'No se pudo cargar el tallerista');
                }
            })
        .catch(error => {
            console.error(error);
            this.mostrarError('Error de conexión en editar');
        });
    },
    // ESTO FALTA POR MODIFICAR la idea de esto es que se puedan ver los detalles del tallerista, pero son muchos asi que tengo que preparar esto
    verDetalles: function(id) {
        fetch(`/api/tallerista-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    console.log("Datos del tallerista:", t);
                    const generoTexto = this.mapearGenero(t.GENERO);
                    let html = `
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="fw-bold">Informacion Personal</h6>
                                <table class="table table-sm text-nowrap">
                                    <tr><th>ID Persona:</th><td>${t.id_persona || 'No registrado'}</td></tr>
                                    <tr><th>ID Profesor:</th><td>${t.id_profesor || 'No registrado'}</td></tr>
                                    <tr><th>Nombre:</th><td>${t.nombre_persona || 'No registrado'}</td></tr>
                                    <tr><th>Apellido Paterno:</th><td>${t.apellido_paterno || 'No registrado'}</td></tr>
                                    <tr><th>Apellido Materno:</th><td>${t.apellido_materno || 'No registrado'}</td></tr>
                                    <tr><th>R.U.T:</th><td>${t.rut_persona || 'No registrado'}</td></tr>
                                    <tr><th>Digito Verificador:</th><td>${t.dv_persona || 'No registrado'}</td></tr>
                                    <tr><th>Fecha de Nacimiento:</th><td>${t.fec_nacimiento || 'No registrada'}</td></tr>
                                    <tr><th>Edad:</th><td>${t.edad || 'No registrada'}</td></tr>
                                    <tr><th>Genero:</th><td>${generoTexto || 'No registrado'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Contactos</h6>
                                <table class="table table-sm">
                                    <tr><th>Telefono del Profesor:</th><td>${t.telefono || 'No registrado'}</td></tr>
                                    <tr><th>Correo del Profesor:</th><td>${t.correo_electronico || 'No registrado'}</td></tr>
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
                                    <tr><th>Fecha de Creacion:</th><td>${t.fec_creacion || 'No registrada'}</td></tr>
                                    <tr><th>Ultimo Acceso:</th><td>${t.ultimo_acceso || 'No registrado'}</td></tr>
                                    <tr><th>Intentos de Inicio de Sesion:</th><td>${t.intentos_fallidos || 'No registrado'}</td></tr>
                                    <tr><th>Bloqueado hasta:</th><td>${t.bloqueado_hasta || 'No registrado'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Resumen Profesional</h6>
                                <table class="table table-sm">
                                    <tr><th>Profesion:</th><td>${t.profesion || 'No registrado'}</td></tr>
                                    <tr><th>Resumen Curricular:</th><td>${t.resumen_curricular || 'No registrado'}</td></tr>
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
                    document.getElementById('detallesTalleristaBody').innerHTML = html;
                    window.talleristaDetallesId = id;
                    new bootstrap.Modal(document.getElementById('modalDetallesTallerista')).show();
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

    confirmarEliminar: function(id, nombre) {
        Swal.fire({
            title: '¿Suspender tallerista?',
            text: `¿Estás seguro de suspender a ${nombre}? Quedará inactivo.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, suspender',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.ejecutarEliminacion(id);
            }
        });
    },

    ejecutarEliminacion: function(id) {
        fetch(`/api/tallerista-suspender/${id}`, { method: 'PUT' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    this.mostrarExito(result.message || 'Tallerista suspendido correctamente');
                    this.cargarLista();
                } else {
                    this.mostrarError(result.message || 'Error al suspender');
                }
            })
        .catch(error => {
            console.error(error);
            this.mostrarError('Error de conexión');
        });
    },

    mostrarExito: function(mensaje) {
        Swal.fire({ icon: 'success', title: 'Éxito', text: mensaje, timer: 2000, showConfirmButton: false });
    },
    mostrarError: function(mensaje) {
        Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
    },

    bindEventos: function() {
        document.getElementById('aplicarFiltrosBtn')?.addEventListener('click', () => this.aplicarFiltros());
        document.getElementById('limpiarFiltrosBtn')?.addEventListener('click', () => this.limpiarFiltros());
        document.getElementById('busqueda_id_profesor')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_id_taller')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_nombre_taller')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); } 
        });
        document.getElementById('busqueda_profesion')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_nombre_completo')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('busqueda_correo_electronico')?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') { this.aplicarFiltros(); }
        });
        document.getElementById('formTallerista')?.addEventListener('submit', (e) => { 
            e.preventDefault(); 
            this.guardar(); 
        });
    }
};

document.addEventListener('DOMContentLoaded', () => GestionTalleristas.inicializando());
window.GestionTalleristas = GestionTalleristas;