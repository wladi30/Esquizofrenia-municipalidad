document.addEventListener('DOMContentLoaded', () => {
    const yearActual = new Date().getFullYear();
    const selectsYear = document.querySelectorAll(
        '.filtro-year-proceso'
    );
    selectsYear.forEach(select => {
        select.innerHTML = `
            <option value="">
                Todos los años
            </option>
        `;
        for(let year = yearActual; year >= 2018; year--){
            select.innerHTML += `
                <option value="${year}">
                    ${year}
                </option>
            `;
        }
    });
});

const nombresGenero = {
    0: 'Masculino',
    1: 'Femenino',
    2: 'No Binario',
    3: 'Otro',
    4: 'Prefiero no Decirlo'
};

const nombresPaises = {
    1: 'Chile'
};

const nombresComunas = {
    1: 'Quilicura'
};

const GestionInscripciones = {
    configuracion: {
        paginaActual: 1,
        itemsPorPagina: 20,
        datos: [],
        filtros: { 
            id_estudiante: '', 
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
        this.cargarPaisSelect();
        this.cargarComunaSelect();
        this.bindEventos();
    },

    verTodasAuditorias: function(idEstudiante, nombreInscripcion) {
        const overlay = document.getElementById('overlayAuditoria');
        const bodyContainer = document.getElementById('overlayAuditoriaBody');
        const tituloContainer = document.getElementById('overlayAuditoriaTitulo');
        if (!overlay) {console.error('No se encontró el elemento overlayAuditoria');return;}
        const scrollY = window.scrollY;
        const nombreSanitizado = (nombreInscripcion || '').replace(/['"\\]/g, '');
        tituloContainer.innerHTML = `<i class="bi bi-file-earmark-person-fill"></i>Todas las auditorías de la persona: ${nombreSanitizado || idEstudiante}`;
        bodyContainer.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Cargando auditorías...</p></div>';
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        fetch(`/api/inscripcion-get/${idEstudiante}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    let html = `
                    <div class="detalle-grid-auditoria">
                        <div class="auditoria-seccion">
                            <div class="auditoria-seccion-titulo">
                                <i class="bi bi-person-vcard"></i>
                                Datos Persona
                            </div>
                            <div class="auditoria-item">
                                <div class="auditoria-icon auditoria-creacion">
                                    <i class="bi bi-plus-circle"></i>
                                </div>
                                <div class="auditoria-info">
                                    <div class="auditoria-accion">
                                        Creación de Persona
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_ingreso_persona || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_ingreso_persona || '-'}
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
                                        Modificación de Persona
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_modifica_persona || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_modifica_persona || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="auditoria-seccion">
                            <div class="auditoria-seccion-titulo">
                                <i class="bi bi-person-workspace"></i>
                                Datos Integrante
                            </div>
                            <div class="auditoria-item">
                                <div class="auditoria-icon auditoria-creacion">
                                    <i class="bi bi-plus-circle"></i>
                                </div>
                                <div class="auditoria-info">
                                    <div class="auditoria-accion">
                                        Creación del Integrante
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_ingreso_integrante_estudiante || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_ingreso_integrante_estudiante || '-'}
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
                                        Modificación del Integrante
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_modifica_integrante_estudiante || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_modifica_integrante_estudiante || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="auditoria-seccion">
                            <div class="auditoria-seccion-titulo">
                                <i class="bi bi-diagram-3"></i>
                                Datos Estudiante
                            </div>
                            <div class="auditoria-item">
                                <div class="auditoria-icon auditoria-creacion">
                                    <i class="bi bi-plus-circle"></i>
                                </div>
                                <div class="auditoria-info">
                                    <div class="auditoria-accion">
                                        Creación del Estudiante
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_ingreso_estudiante || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_ingreso_estudiante || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
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

    cargarPaisSelect: function() {
        fetch('/api/pais')
            .then(response => response.json())
            .then(data => {
                this.configuracion.datos.paises = data;
                const selectsPaises = document.querySelectorAll('.select-pais');
                selectsPaises.forEach(select => {
                    select.innerHTML = '<option value="">Seleccione un Pais...</option>';
                    data.forEach(cat => {
                        const option = document.createElement('option');
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
                const selectsComunas = document.querySelectorAll('.select-comuna');
                selectsComunas.forEach(select => {
                    select.innerHTML = '<option value="">Seleccione una Comuna...</option>';
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
        document.getElementById('busqueda_ind_estado_integrante').value = '';
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
        document.getElementById('formInscripcion').reset();
        const rutInput = document.getElementById('rutPersona');
        const dvInput = document.getElementById('dvPersona');
        const pasaporteInput = document.getElementById('pasaporte');
        if (rutInput) {
            rutInput.disabled = false;
            rutInput.value = '';
        }
        if (dvInput) {
            dvInput.disabled = false;
            dvInput.value = '';
        }
        if (pasaporteInput) {
            pasaporteInput.disabled = false;
            pasaporteInput.value = '';
        }
        let hiddenId = document.getElementById('inscripcionId');
        if (!hiddenId) {
            hiddenId = document.createElement('input');
            hiddenId.type = 'hidden';
            hiddenId.id = 'inscripcionId';
            document.getElementById('formInscripcion').appendChild(hiddenId);
        }
        hiddenId.value = '';
        const fecNaci = document.getElementById('fechaNacimiento');
        if (fecNaci) {
            fecNaci.disabled = false;
        }
        const generoSelect = document.getElementById('genero');
        if (generoSelect) generoSelect.value = '';
        document.getElementById('idPais').value = '1';
        document.getElementById('idComuna').value = '1';
        new bootstrap.Modal(document.getElementById('modalInscripcion')).show();
    },

    guardar: function() {
        const id = document.getElementById('inscripcionId').value;
        const rutPersona = parseInt(document.getElementById('rutPersona').value);
        const dvPersona = parseInt(document.getElementById('dvPersona').value);
        const pasaporte = document.getElementById('pasaporte').value;
        const nombre = document.getElementById('nombrePersona').value.trim().toUpperCase();
        const apellido_paterno = document.getElementById('apellidoPaterno').value.trim().toUpperCase();
        const apellido_materno = document.getElementById('apellidoMaterno').value.trim().toUpperCase();
        const genero = parseInt(document.getElementById('genero').value) || 2;
        const pronomEstudiante = document.getElementById('pronomEstudiante').value;
        const telefono = document.getElementById('telefonoPersona').value.trim().toUpperCase();
        const correo = document.getElementById('correoPersona').value.trim().toUpperCase();
        const telefono_contacto = document.getElementById('telefonoContacto').value.trim().toUpperCase();
        const nombre_contacto = document.getElementById('nombreContacto').value.trim().toUpperCase();
        const correo_contacto = document.getElementById('correoContacto').value.trim().toUpperCase();
        const observacion = document.getElementById('observacion').value.trim().toUpperCase();
        const id_pais = parseInt(document.getElementById('idPais').value) || 1;
        const id_comuna = parseInt(document.getElementById('idComuna').value) || 1;
        const villa = document.getElementById('villa').value.trim().toUpperCase();
        const nro_dpto = document.getElementById('numeroDepartamento').value.trim().toUpperCase();
        const nro_block = document.getElementById('numeroBlock').value.trim().toUpperCase();
        const nro_calle = document.getElementById('numeroCalle').value.trim().toUpperCase();
        const calle = document.getElementById('calle').value.trim().toUpperCase();
        const fechaInicio = document.getElementById('fechaNacimiento').value;
        const fechaInscripcion = document.getElementById('fechaInscripcion').value;
        const fechaRetiro = document.getElementById('fechaRetiro').value;
        const fechaReincorporacion = document.getElementById('fechaReincorporacion').value;

        if (!nombre) { this.mostrarError('El nombre es obligatorio'); return; }
        if (!correo) { this.mostrarError('El correo es obligatorio'); return; }

        const data = {
            rut_persona: rutPersona,
            dv_persona: dvPersona,
            nombre_persona: nombre,
            pasaporte: pasaporte,
            apellido_paterno: apellido_paterno,
            apellido_materno: apellido_materno,
            pronom_estudiante: pronomEstudiante,
            genero: genero,
            telefono: telefono || '-',
            correo_electronico: correo,
            telefono_contacto: telefono_contacto || '-',
            nombre_contacto: nombre_contacto || '-',
            correo_contacto: correo_contacto || '-',
            observacion: observacion || '-',
            id_pais: id_pais,
            id_comuna: id_comuna,
            villa: villa || '-',
            nro_dpto: nro_dpto || '-',
            nro_block: nro_block || '-',
            nro_calle: nro_calle || '-',
            calle: calle || '-',
            fec_nacimiento: fechaInicio,
            fec_inscripcion: fechaInscripcion,
            fec_retiro: fechaRetiro,
            fec_reincorporacion: fechaReincorporacion
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

    editarEstudiante: function(id) {
        fetch(`/api/inscripcion-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    document.getElementById('modalTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Inscripcion';
                    let hiddenId = document.getElementById('inscripcionId');
                    if (!hiddenId) {hiddenId = document.createElement('input'); hiddenId.type = 'hidden'; hiddenId.id = 'inscripcionId'; document.getElementById('formInscripcion').appendChild(hiddenId);} hiddenId.value = id;
                    const rutInput = document.getElementById('rutPersona');
                    const dvInput = document.getElementById('dvPersona');
                    const pasaporteInput = document.getElementById('pasaporte');
                    if (rutInput) {rutInput.value = t.rut_persona || '';rutInput.disabled = true;}
                    if (dvInput) {dvInput.value = t.dv_persona || '';dvInput.disabled = true;}
                    if (pasaporteInput) {pasaporteInput.value = t.pasaporte || '';pasaporteInput.disabled = true;}
                    document.getElementById('nombrePersona').value = t.nombre_persona || '';
                    document.getElementById('apellidoPaterno').value = t.apellido_paterno || '';
                    document.getElementById('apellidoMaterno').value = t.apellido_materno || '';
                    const generoSelect = document.getElementById('genero');
                    if (generoSelect && t.genero) {generoSelect.value = t.genero;}
                    document.getElementById('telefonoPersona').value = t.telefono;
                    document.getElementById('correoPersona').value = t.correo_electronico || '';
                    document.getElementById('telefonoContacto').value = t.telefono_contacto || '';
                    document.getElementById('nombreContacto').value = t.nombre_contacto || '';
                    document.getElementById('correoContacto').value = t.correo_contacto || '';
                    document.getElementById('observacion').value = t.observacion || '';
                    document.getElementById('idPais').value = t.id_pais || 1;
                    document.getElementById('idComuna').value = t.id_comuna || 1;
                    document.getElementById('villa').value = t.villa || '';
                    document.getElementById('numeroDepartamento').value = t.nro_dpto || '';
                    document.getElementById('numeroBlock').value = t.nro_block || '';
                    document.getElementById('numeroCalle').value = t.nro_calle || '';
                    document.getElementById('calle').value = t.calle || '';
                    const fecNaci = document.getElementById('fechaNacimiento');
                    if (fecNaci) {fecNaci.value = t.fec_nacimiento || ''; fecNaci.disabled = true;}
                    new bootstrap.Modal(document.getElementById('modalInscripcion')).show();
                } else {
                    this.mostrarError(result.message || 'No se pudo cargar el inscripcion');
                }
            })
        .catch(error => { console.error(error); this.mostrarError('Error de conexión en editar'); });
    },

    iniciarValidacionDocumento: function(){
        const rutInput = document.getElementById('rutPersona');
        const dvInput = document.getElementById('dvPersona');
        const pasaporteInput = document.getElementById('pasaporte');
        const actualizarValidacionDocumento = () => {
            const tieneRut = rutInput.value.trim() !== '';
            const tieneDv = dvInput.value.trim() !== '';
            const tienePasaporte = pasaporteInput.value.trim() !== '';
            // PASAPORTE -> desactiva RUT/DV
            if(tienePasaporte){rutInput.required = false; dvInput.required = false;}
            else{rutInput.required = true; dvInput.required = true;}
            // RUT/DV -> desactiva PASAPORTE
            if(tieneRut || tieneDv){pasaporteInput.required = false;}
            else{pasaporteInput.required = true;}
        };
        rutInput.addEventListener('input',actualizarValidacionDocumento);
        dvInput.addEventListener('input',actualizarValidacionDocumento);
        pasaporteInput.addEventListener('input',actualizarValidacionDocumento);
        actualizarValidacionDocumento();
    },

    verDetalles: function(id){
        fetch(`/api/inscripcion-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if(result.success){
                    const t = result.data;
                    const nombreCompleto = `${t.nombre_persona || ''} ${t.apellido_paterno || ''} ${t.apellido_materno || ''}`.replace(/\s+/g, ' ').trim();
                    const fechaTexto = (fecha) => {if(!fecha) return '-';
                        return new Date(fecha).toLocaleDateString('es-CL',{day: '2-digit', month: 'long', year: 'numeric'});
                    };
                    let html = `
                        <div class="row g-3">
                            <div class="col-lg-6">
                                <div class="detalle-card">
                                    <div class="detalle-header">
                                        <i class="bi bi-person-vcard"></i>
                                        Información Personal
                                    </div>
                                    <div class="detalle-grid">
                                        <div class="detalle-item">
                                            <span>ID Persona</span>
                                            <strong>${t.id_persona || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>ID Estudiante</span>
                                            <strong>${t.id_estudiante || '-'}</strong>
                                        </div>
                                        <div class="detalle-item detalle-full">
                                            <span>Nombre Completo</span>
                                            <strong>${nombreCompleto || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>R.U.T</span>
                                            <strong>
                                                ${t.rut_persona || '-'}-${t.dv_persona || ''}
                                            </strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Pasaporte</span>
                                            <strong>${t.pasaporte || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Edad</span>
                                            <strong>${t.edad || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Fecha Nacimiento</span>
                                            <strong>${fechaTexto(t.fec_nacimiento)}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Género</span>
                                            <strong>${nombresGenero[t.genero] || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Pronombre</span>
                                            <strong>${t.pronom_estudiante || '-'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="detalle-card">
                                    <div class="detalle-header">
                                        <i class="bi bi-geo-alt"></i>
                                        Dirección
                                    </div>
                                    <div class="detalle-grid">
                                        <div class="detalle-item">
                                            <span>País</span>
                                            <strong>${nombresPaises[t.id_pais] || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Comuna</span>
                                            <strong>${nombresComunas[t.id_comuna] || '-'}</strong>
                                        </div>
                                        <div class="detalle-item detalle-full">
                                            <span>Villa</span>
                                            <strong>${t.villa || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Calle</span>
                                            <strong>${t.calle || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>N° Calle</span>
                                            <strong>${t.nro_calle || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Block</span>
                                            <strong>${t.nro_block || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Departamento</span>
                                            <strong>${t.nro_dpto || '-'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-12">
                                <div class="detalle-card">
                                    <div class="detalle-header">
                                        <i class="bi bi-telephone-plus"></i>
                                        Contactos
                                    </div>
                                    <div class="detalle-grid">
                                        <div class="detalle-item">
                                            <span>Teléfono</span>
                                            <strong>${t.telefono || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Correo</span>
                                            <strong>${t.correo_electronico || '-'}</strong>
                                        </div>
                                        <div class="detalle-item detalle-full">
                                            <span>Nombre Contacto</span>
                                            <strong>${t.nombre_contacto || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Teléfono Contacto</span>
                                            <strong>${t.telefono_contacto || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Correo Contacto</span>
                                            <strong>${t.correo_contacto || '-'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="detalle-card">
                                    <div class="detalle-header">
                                        <i class="bi bi-calendar-check"></i>
                                        Información de Inscripción
                                    </div>
                                    <div class="detalle-grid">
                                        <div class="detalle-item">
                                            <span>Fecha Inscripción</span>
                                            <strong>${fechaTexto(t.fec_inscripcion)}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Fecha Retiro</span>
                                            <strong>${fechaTexto(t.fec_retiro)}</strong>
                                        </div>
                                        <div class="detalle-item detalle-full">
                                            <span>Fecha Reincorporación</span>
                                            <strong>${fechaTexto(t.fec_reincorporacion)}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="detalle-card">
                                    <div class="detalle-header">
                                        <i class="bi bi-journal-bookmark"></i>
                                        Información del Taller
                                    </div>
                                    <div class="detalle-grid">
                                        <div class="detalle-item">
                                            <span>ID Taller</span>
                                            <strong>${t.id_taller || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Año Proceso</span>
                                            <strong>${t.year_proceso || '-'}</strong>
                                        </div>
                                        <div class="detalle-item detalle-full">
                                            <span>Nombre Taller</span>
                                            <strong>${t.nombre_taller || '-'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="acciones-detalle-card">
                                    <div class="acciones-detalle-info">
                                        <div class="acciones-detalle-icono">
                                            <i class="bi bi-shield-check"></i>
                                        </div>
                                        <div>
                                            <div class="acciones-detalle-titulo">
                                                Auditoría de Inscripción
                                            </div>
                                            <div class="acciones-detalle-texto">
                                                Revisa el historial completo de ingresos y modificaciones.
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn btn-auditoria btn-ver-todas-auditorias" data-id="${t.id_estudiante}" data-nombre="${(t.nombre_persona || '') + ' ' + (t.apellido_paterno || '')}">
                                        <i class="bi bi-file-earmark-person-fill"></i>
                                        Ver auditoría
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    if (t.observacion) html += `<div class="mt-3"><h6 class="titulo-detalle">Observación:</h6><p>${t.observacion}</p></div>`;
                    document.getElementById('detallesInscripcionBody').innerHTML = html;
                    const auditButton = document.querySelector('#detallesInscripcionBody .btn-ver-todas-auditorias');
                    if (auditButton) {
                        auditButton.addEventListener('click', (e) => {
                            const id = auditButton.getAttribute('data-id');
                            const nombre = auditButton.getAttribute('data-nombre');
                            this.verTodasAuditorias(id, nombre);
                        });
                    }
                    window.estudianteDetallesId = id;
                    new bootstrap.Modal(document.getElementById('modalDetallesInscripcion')).show();
                }
                else{
                    this.mostrarError(
                        'No se pudieron cargar los detalles.'
                    );
                }
            })
        .catch(error => {
            console.error(
                'Error en fetch verDetalles:',
                error
            );
            this.mostrarError(
                'Error de conexión al cargar detalles.'
            );
        });
    },

    generarFila: function(t) {
        const nombreCompleto = t.NOMBRE_COMPLETO || `${t.NOMBRE_ESTUDIANTE || ''} ${t.APELLIDO_PATERNO || ''} ${t.APELLIDO_MATERNO || ''}`.trim() || 'Sin nombre';
        const idTallerAsignado = t.ID_TALLER || '---';
        const tallerAsignado = t.NOMBRE_TALLER || 'No tiene taller asignado';
        const correoElectronico = t.CORREO_ELECTRONICO || 'No registrado';
        let estadoTexto = '';
        let estadoClass = '';
        switch(t.IND_ESTADO_INTEGRANTE) {
            case 1: estadoTexto = '<span class="badge bg-info" style="font-size: 0.8rem;">INSCRITO</span>'; estadoClass = 'estado 1'; break;
            case 2: estadoTexto = '<span class="badge bg-success" style="font-size: 0.8rem;">RETIRADO</span>'; estadoClass = 'estado 2'; break;
            case 3: estadoTexto = '<span class="badge bg-secondary" style="font-size: 0.8rem;">LISTA DE ESPERA</span>'; estadoClass = 'estado 3'; break;
            default: estadoTexto = '<span class="badge bg-danger" style="font-size: 0.8rem;">NO REGISTRADO</span>'; estadoClass = 'estado 4'; break;
        }
        const fechaInscripcion = t.FEC_INSCRIPCION ? new Date(t.FEC_INSCRIPCION).toLocaleDateString('es-CL',{day: '2-digit', month: '2-digit', year: 'numeric'}) : 'No registrada';
        return `
            <tr class="fila-integrante">
                <td class="ps-4">
                    <span class="tabla-id">
                        #${t.ID_ESTUDIANTE || '-'}
                    </span>
                </td>
                <td>
                    <div class="tabla-info">
                        <div class="tabla-titulo">
                            ${nombreCompleto}
                        </div>
                        <div class="tabla-subtitulo">
                            <i class="bi bi-person"></i>
                            Integrante registrado
                        </div>
                    </div>
                </td>
                <td>
                    <div class="tabla-info">
                        <div class="tabla-titulo-secundario">
                            ${tallerAsignado}
                        </div>
                        <div class="tabla-subtitulo">
                            ID Taller:
                            ${idTallerAsignado}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="estado-badge ${estadoClass}">
                        ${estadoTexto}
                    </div>
                </td>
                <td>
                    <span class="tabla-year">
                        ${t.YEAR_PROCESO || '-'}
                    </span>
                </td>
                <td>
                    <div class="tabla-fechas">
                        <span>
                            ${fechaInscripcion}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="tabla-correo" title="${correoElectronico}">
                        <i class="bi bi-envelope"></i>
                        ${correoElectronico}
                    </div>
                </td>
                <td class="text-end pe-4">
                    <div class="acciones-tabla">
                        <button class="btn-tabla accion-ver" onclick="GestionInscripciones.verDetalles(${t.ID_ESTUDIANTE})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn-tabla accion-editar" onclick="GestionInscripciones.editarEstudiante(${t.ID_ESTUDIANTE})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

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

    mostrarExito: function(mensaje) {
        Swal.fire({ icon: 'success', title: 'exito', text: mensaje, timer: 2000, showConfirmButton: false });
    },
    mostrarError: function(mensaje) {
        Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
    },

    debounce: function(func, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    },

    bindEventos: function() {
        const filtroTiempoReal = this.debounce(() => {
            this.aplicarFiltros();
        }, 200);
        document.getElementById('aplicarFiltrosBtn')?.addEventListener('click', () => this.aplicarFiltros());
        document.getElementById('limpiarFiltrosBtn')?.addEventListener('click', () => this.limpiarFiltros());
        document.getElementById('busqueda_id_estudiante')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_id_taller')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_nombre_completo')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_correo_electronico')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_ind_estado_integrante')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_nombre_taller')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_year_proceso')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_fecha_inscripcion')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('formInscripcion')?.addEventListener('submit', (e) => { 
            e.preventDefault(); 
            this.guardar(); 
        });
        document.getElementById('btnNuevaInscripcion')?.addEventListener('click', () => this.abrirModalNuevo());
    }
};

document.addEventListener('DOMContentLoaded', () => GestionInscripciones.inicializando());
window.GestionInscripciones = GestionInscripciones;