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

const nombresEstadoTaller = {
    1: '<span class="badge bg-info" style="font-size: 0.8rem;">INGRESADO</span>',
    2: '<span class="badge bg-success" style="font-size: 0.8rem;">CALENDARIZADO</span>',
    3: '<span class="badge bg-secondary" style="font-size: 0.8rem;">CERRADO</span>',
    4: '<span class="badge bg-danger" style="font-size: 0.8rem;">DE BAJA</span>'
};

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

    inicializando: function() {
        this.cargarLista();
        this.cargarGeneroSelect();
        this.cargarPaisSelect();
        this.cargarComunaSelect();
        this.bindEventos();
    },

    formatearRut: function (rut) {
        if (!rut) return '';
        return rut.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    copiarIdTaller: function(idTaller, elemento) {
        navigator.clipboard.writeText(idTaller.toString())
            .then(() => {
                const existente = elemento.parentElement.querySelector('.mensaje-copiado-id');
                if (existente) {
                    existente.remove();
                }
                const mensaje = document.createElement('div');
                mensaje.className = 'mensaje-copiado-id';
                mensaje.innerHTML = `
                    <i class="bi bi-check-circle-fill"></i>
                    Copiado
                `;
                elemento.parentElement.appendChild(mensaje);
                setTimeout(() => {
                    mensaje.classList.add('mostrar');
                }, 10);
                setTimeout(() => {
                    mensaje.classList.remove('mostrar');
                    setTimeout(() => {
                        mensaje.remove();
                    }, 250);
                }, 1400);
            })
        .catch(error => {
            console.error('Error al copiar ID:', error);
        });
    },

    verTodasAuditorias: function(idTallerista, nombreTallerista) {
        const overlay = document.getElementById('overlayAuditoria');
        const bodyContainer = document.getElementById('overlayAuditoriaBody');
        const tituloContainer = document.getElementById('overlayAuditoriaTitulo');
        if (!overlay) {console.error('No se encontró el elemento overlayAuditoria');return;}
        const scrollY = window.scrollY;
        const nombreSanitizado = (nombreTallerista || '').replace(/['"\\]/g, '');
        tituloContainer.innerHTML = `<i class="bi bi-file-earmark-person-fill"></i>Todas las auditorías de la persona: ${nombreSanitizado || idTallerista}`;
        bodyContainer.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Cargando auditorías...</p></div>';
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        fetch(`/api/tallerista-get/${idTallerista}`)
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
                                Datos Profesor
                            </div>
                            <div class="auditoria-item">
                                <div class="auditoria-icon auditoria-creacion">
                                    <i class="bi bi-plus-circle"></i>
                                </div>
                                <div class="auditoria-info">
                                    <div class="auditoria-accion">
                                        Creación de Profesor
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_ingreso_profesor || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_ingreso_profesor || '-'}
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
                                        Modificación de Profesor
                                    </div>
                                    <div class="auditoria-meta">
                                        <span class="auditoria-usuario">
                                            ${t.aud_usuario_modifica_profesor || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_modifica_profesor || '-'}
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
                                            ${t.aud_usuario_ingreso_gestion_profesor || '-'}
                                        </span>
                                        <span class="auditoria-fecha">
                                            ${t.aud_fec_ingreso_gestion_profesor || '-'}
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
        const rutInput = document.getElementById('rutProfesor');
        const dvInput = document.getElementById('dvProfesor');
        if (rutInput) {
            rutInput.disabled = false;
            rutInput.value = '';
        }
        if (dvInput) {
            dvInput.disabled = false;
            dvInput.value = '';
        }
        let hiddenId = document.getElementById('talleristaId');
        if (!hiddenId) {
            hiddenId = document.createElement('input');
            hiddenId.type = 'hidden';
            hiddenId.id = 'talleristaId';
            document.getElementById('formTallerista').appendChild(hiddenId);
        }
        hiddenId.value = '';
        const fecNaci = document.getElementById('fechaNacimiento');
        if (fecNaci) {
            fecNaci.disabled = false;
        }
        const generoSelect = document.getElementById('genero');
        if (generoSelect) generoSelect.value = '';
        const paisSelect = document.querySelector('.select-pais');
        if (paisSelect) {
            paisSelect.value = '';
        }
        const comunaSelect = document.querySelector('.select-comuna');
        if (comunaSelect) {
            comunaSelect.value = '';
        }
        new bootstrap.Modal(document.getElementById('modalTallerista')).show();
    },

    guardar: function() {
        const id = document.getElementById('talleristaId').value;
        const RutProfesor = parseInt(document.getElementById('rutProfesor').value);
        const DvProfesor = parseInt(document.getElementById('dvProfesor').value);
        const nombre = document.getElementById('nombrePersona').value.trim().toUpperCase();
        const apellido_paterno = document.getElementById('apellidoPaterno').value.trim().toUpperCase();
        const apellido_materno = document.getElementById('apellidoMaterno').value.trim().toUpperCase();
        const genero = parseInt(document.getElementById('genero').value) || 2;
        const telefono = document.getElementById('telefono').value.trim().toUpperCase();
        const correo = document.getElementById('correo').value.trim().toUpperCase();
        const telefono_contacto = document.getElementById('telefonoContacto').value.trim().toUpperCase();
        const nombre_contacto = document.getElementById('nombreContacto').value.trim().toUpperCase();
        const correo_contacto = document.getElementById('correoContacto').value.trim().toUpperCase();
        const profesion = document.getElementById('profesion').value.trim().toUpperCase();
        const resumen_curricular = document.getElementById('resumenCurricular').value.trim().toUpperCase();
        const observacion = document.getElementById('observacion').value.trim().toUpperCase();
        const paisSelect = document.querySelector('.select-pais');
        const comunaSelect = document.querySelector('.select-comuna');
        const villa = document.getElementById('villa').value.trim().toUpperCase();
        const nro_dpto = document.getElementById('numeroDepartamento').value.trim().toUpperCase();
        const nro_block = document.getElementById('numeroBlock').value.trim().toUpperCase();
        const nro_calle = document.getElementById('numeroCalle').value.trim().toUpperCase();
        const calle = document.getElementById('calle').value.trim().toUpperCase();
        const fechaInicio = document.getElementById('fechaNacimiento').value;

        if (!nombre) { this.mostrarError('El nombre es obligatorio'); return; }
        if (!correo) { this.mostrarError('El correo es obligatorio'); return; }

        const data = {
            rut_profesor: RutProfesor,
            dv_profesor: DvProfesor,
            nombre_persona: nombre,
            apellido_paterno: apellido_paterno,
            apellido_materno: apellido_materno,
            genero: genero,
            telefono: telefono || '-',
            correo_electronico: correo,
            telefono_contacto: telefono_contacto || '-',
            nombre_contacto: nombre_contacto || '-',
            correo_contacto: correo_contacto || '-',
            profesion: profesion || '-',
            resumen_curricular: resumen_curricular || '-',
            observacion: observacion || '-',
            id_pais: paisSelect ? parseInt(paisSelect.value): 1,
            id_comuna: comunaSelect ? parseInt(comunaSelect.value): 1,
            villa: villa || '-',
            nro_dpto: nro_dpto || '-',
            nro_block: nro_block || '-',
            nro_calle: nro_calle || '-',
            calle: calle || '-',
            fec_nacimiento: fechaInicio
        };
        const url = id ? `/api/tallerista-actualizar/${id}` : '/api/tallerista-crear';
        const method = id ? 'PUT' : 'POST';
        fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
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
            .catch(error => { console.error(error); this.mostrarError('Error de conexión'); });
    },

    editar: function(id) {
        // con esto cualquiera se vuelve ezquiso, me daba un problema de que no modificaba , reviso aqui y alla, veo el app funcionario, veo el procedimiento(mentira), todo bien todo correcto, 
        // pero seguia sin funcionar, despues me di cuenta que podria ser el db_test, encuentro errores y digo ya bien ahora debe funcionar, sigue sin hacerlo
        // reviso mas aun , hasta manoseo el css y nada, el problema? le puse la mierda right join en vez de left, salu2
        fetch(`/api/tallerista-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    document.getElementById('modalTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Tallerista';
                    let hiddenId = document.getElementById('talleristaId');
                    if (!hiddenId) {hiddenId = document.createElement('input'); hiddenId.type = 'hidden'; hiddenId.id = 'talleristaId'; document.getElementById('formTallerista').appendChild(hiddenId);} hiddenId.value = id;
                    const rutInput = document.getElementById('rutProfesor');
                    const dvInput = document.getElementById('dvProfesor');
                    if (rutInput) {rutInput.value = t.rut_persona || '';rutInput.disabled = true;}
                    if (dvInput) {dvInput.value = t.dv_persona || '';dvInput.disabled = true;}
                    document.getElementById('idProfesor').value = t.id_profesor;
                    document.getElementById('nombrePersona').value = t.nombre_persona || '';
                    document.getElementById('apellidoPaterno').value = t.apellido_paterno || '';
                    document.getElementById('apellidoMaterno').value = t.apellido_materno || '';
                    const generoSelect = document.getElementById('genero');
                    if (generoSelect && t.genero) {generoSelect.value = t.genero;}
                    document.getElementById('telefono').value = t.telefono || '';
                    document.getElementById('correo').value = t.correo_electronico || '';
                    document.getElementById('telefonoContacto').value = t.telefono_contacto || '';
                    document.getElementById('nombreContacto').value = t.nombre_contacto || '';
                    document.getElementById('correoContacto').value = t.correo_contacto || '';
                    document.getElementById('profesion').value = t.profesion || '';
                    document.getElementById('resumenCurricular').value = t.resumen_curricular || '';
                    document.getElementById('observacion').value = t.observacion || '';
                    const paisSelect = document.querySelector('.select-pais');
                    if (paisSelect && t.id_pais) {paisSelect.value = t.id_pais;}
                    const comunaSelect = document.querySelector('.select-comuna');
                    if (comunaSelect && t.id_comuna) {comunaSelect.value = t.id_comuna;}
                    document.getElementById('villa').value = t.villa || '';
                    document.getElementById('numeroDepartamento').value = t.nro_dpto || '';
                    document.getElementById('numeroBlock').value = t.nro_block || '';
                    document.getElementById('numeroCalle').value = t.nro_calle || '';
                    document.getElementById('calle').value = t.calle || '';
                    const fecNaci = document.getElementById('fechaNacimiento');
                    if (fecNaci) {fecNaci.value = t.fec_nacimiento || ''; fecNaci.disabled = true;}
                    new bootstrap.Modal(document.getElementById('modalTallerista')).show();
                } else {
                    this.mostrarError(result.message || 'No se pudo cargar el tallerista');
                }
            })
        .catch(error => { console.error(error); this.mostrarError('Error de conexión en editar'); });
    },

    mostrarTodosTalleresOverlay: function() {
        const tallerista = window.talleristaActual;
        if (!tallerista || !tallerista.talleres || tallerista.talleres.length === 0) return;
        const overlay = document.getElementById('overlayTalleres');
        const bodyContainer = document.getElementById('overlayTalleresBody');
        const scrollY = window.scrollY;
        let html = `<div class="talleres-modal-grid">`;
        tallerista.talleres.forEach(taller => {
            html += `
                <div class="taller-modal-card">
                    <div class="taller-modal-top">
                        <div class="taller-modal-main">
                            <div class="taller-modal-nombre">
                                ${taller.nombre_taller || 'Sin nombre'}
                            </div>
                            <div class="taller-modal-meta">
                                <span class="taller-chip taller-chip-id taller-id-copiable" onclick="GestionTalleristas.copiarIdTaller(${taller.id_taller}, this)" title="Copiar ID del taller" style="cursor: pointer;">
                                    <i class="bi bi-hash"></i>
                                    ${taller.id_taller || '-'}
                                </span>
                                <span class="taller-modal-chip taller-modal-chip-year">
                                    <i class="bi bi-calendar3"></i>
                                    ${taller.year_proceso || '-'}
                                </span>
                            </div>
                        </div>
                        <div class="taller-modal-estado estado-${taller.id_estado_taller}">
                            ${nombresEstadoTaller[taller.id_estado_taller] || '-'}
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        bodyContainer.innerHTML = html;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        const closeBtn = document.getElementById('closeOverlayTalleres');
        const closeOverlay = (e) => {if (e) {e.preventDefault();e.stopPropagation();}
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);};if (closeBtn) closeBtn.onclick = closeOverlay;
        overlay.onclick = (e) => {if (e.target === overlay) closeOverlay(e);};
    },

    // ESTO FALTA POR MODIFICAR la idea de esto es que se puedan ver los detalles del tallerista, pero son muchos asi que tengo que preparar esto
    verDetalles: function(id) {
        fetch(`/api/tallerista-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    window.talleristaActual = t;
                    const talleresLista = t.talleres || [];
                    const totalTalleres = talleresLista.length;
                    let talleresHtml = '';
                    if (totalTalleres > 0) {
                        const generarFilaTaller = (taller) => {
                            return `
                            <div class="taller-asignado-item">
                                <div class="taller-asignado-top">
                                    <div class="taller-asignado-main">
                                        <div class="taller-asignado-nombre">
                                            ${taller.nombre_taller || '-'}
                                        </div>
                                        <div class="taller-asignado-meta">
                                            <span class="taller-chip taller-chip-id taller-id-copiable" onclick="GestionTalleristas.copiarIdTaller(${taller.id_taller}, this)" title="Copiar ID del taller" style="cursor: pointer;">
                                                <i class="bi bi-hash"></i>
                                                ${taller.id_taller || '-'}
                                            </span>
                                            <span class="taller-chip taller-chip-year">
                                                <i class="bi bi-calendar3"></i>
                                                ${taller.year_proceso || '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="taller-estado-badge estado-${taller.id_estado_taller}">
                                        ${nombresEstadoTaller[taller.id_estado_taller] || '-'}
                                    </div>
                                </div>
                            </div>
                        `;
                        };
                        const mostrarInicial = 3;
                        const tieneMas = totalTalleres > mostrarInicial;
                        const talleresMostrar = tieneMas ? talleresLista.slice(0, mostrarInicial) : talleresLista;
                        talleresMostrar.forEach(taller => { talleresHtml += generarFilaTaller(taller); });
                        if (tieneMas) {
                            talleresHtml += `
                                <div class="taller-ver-mas-card">
                                    <div class="taller-ver-mas-icon">
                                        <i class="bi bi-grid-3x3-gap-fill"></i>
                                    </div>
                                    <div class="taller-ver-mas-content">
                                        <div class="taller-ver-mas-title">
                                            Hay más talleres asignados
                                        </div>
                                        <div class="taller-ver-mas-text">
                                            Ver todos los talleres asociados al tallerista.
                                        </div>
                                    </div>
                                    <button
                                        class="btn-ver-mas-talleres"
                                        onclick="GestionTalleristas.mostrarTodosTalleresOverlay()">
                                        <i class="bi bi-arrow-right-circle"></i>
                                        Ver todos
                                    </button>
                                </div>
                            `;
                        }
                    } else {
                        talleresHtml = `<tr><td colspan="4" class="text-center text-muted">No tiene talleres asignados</td></tr>`;
                    }
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
                                            <span>ID Profesor</span>
                                            <strong>${t.id_profesor || '-'}</strong>
                                        </div>
                                        <div class="detalle-item detalle-full">
                                            <span>Nombre Completo</span>
                                            <strong>
                                                ${(t.nombre_persona || '')}
                                                ${(t.apellido_paterno || '')}
                                                ${(t.apellido_materno || '')}
                                            </strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>R.U.T</span>
                                            <strong>
                                                ${t.rut_persona || ''}-${t.dv_persona || ''}
                                            </strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Edad</span>
                                            <strong>${t.edad || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Fecha Nacimiento</span>
                                            <strong>${t.fec_nacimiento || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Género</span>
                                            <strong>${nombresGenero[t.genero] || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>País</span>
                                            <strong>${nombresPaises[t.id_pais] || t.id_pais || '-'}</strong>
                                        </div>
                                        <div class="detalle-item">
                                            <span>Comuna</span>
                                            <strong>${nombresComunas[t.id_comuna] || t.id_comuna || '-'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div class="detalle-card">
                                    <div class="detalle-header">
                                        <i class="bi bi-telephone"></i>
                                        Contactos
                                    </div>
                                    <div class="detalle-grid">
                                        <div class="detalle-item">
                                            <span>Teléfono</span>
                                            <strong>${t.telefono || '-'}</strong>
                                        </div>
                                        <div class="detalle-item detalle-full">
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
                                        <div class="detalle-item detalle-full">
                                            <span>Correo Contacto</span>
                                            <strong>${t.correo_contacto || '-'}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="detalle-card">
                                    <div class="detalle-header">
                                        <i class="bi bi-briefcase"></i>
                                        Resumen Profesional
                                    </div>
                                    <div class="detalle-grid">
                                        <div class="detalle-item">
                                            <span>Profesión</span>
                                            <strong>${t.profesion || '-'}</strong>
                                        </div>
                                        <div class="detalle-item detalle-full">
                                            <span>Resumen Curricular</span>
                                            <strong>${t.resumen_curricular || '-'}</strong>
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
                                                Auditoría del Tallerista
                                            </div>
                                            <div class="acciones-detalle-texto">
                                                Revisa el historial completo de auditorías y modificaciones.
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn btn-auditoria btn-ver-todas-auditorias" data-id="${t.id_profesor}" data-nombre="${(t.nombre_persona || '') + ' ' + (t.apellido_paterno || '')}">
                                        <i class="bi bi-file-earmark-person-fill"></i>
                                        Ver las auditorías
                                    </button>
                                </div>
                            </div>
                            <div class="col-12">
                                <div class="detalle-card talleres-card">
                                    <div class="talleres-banner">
                                        <div class="talleres-banner-left">
                                            <div class="talleres-banner-icon">
                                                <i class="bi bi-journal-bookmark-fill"></i>
                                            </div>
                                            <div class="talleres-banner-content">
                                                <div class="talleres-banner-title">
                                                    Talleres Asignados
                                                </div>
                                                <div class="talleres-banner-subtitle">
                                                    Visualiza todos los talleres actualmente asociados al tallerista.
                                                </div>
                                            </div>
                                        </div>
                                        <div class="talleres-banner-stats">
                                            <div class="talleres-banner-total">
                                                ${totalTalleres}
                                            </div>
                                            <div class="talleres-banner-label">
                                                Talleres
                                            </div>
                                        </div>
                                    </div>
                                    <div class="talleres-divider"></div>
                                    <div class="detalle-grid-profesores talleres-grid">
                                        ${talleresHtml}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    if (t.observacion) html += `<div class="mt-3"><h6 class="titulo-detalle">Observación:</h6><p>${t.observacion}</p></div>`;
                    document.getElementById('detallesTalleristaBody').innerHTML = html;
                    const auditButton = document.querySelector('#detallesTalleristaBody .btn-ver-todas-auditorias');
                    if (auditButton) {
                        auditButton.addEventListener('click', (e) => {
                            const id = auditButton.getAttribute('data-id');
                            const nombre = auditButton.getAttribute('data-nombre');
                            this.verTodasAuditorias(id, nombre);
                        });
                    }
                    window.talleristaDetallesId = id;
                    new bootstrap.Modal(document.getElementById('modalDetallesTallerista')).show();
                } else {
                    this.mostrarError('No se pudieron cargar los detalles.');
                }
            })
        .catch(error => {
            console.error('Error en fetch verDetalles:', error);
            this.mostrarError('Error de conexión al cargar detalles.');
        });
    },

    generarFila: function(t) {
    const nombreCompleto = `${t.NOMBRE_PERSONA || ''} ${t.APELLIDO_PATERNO || ''} ${t.APELLIDO_MATERNO || ''}`.trim();
    const idTallerAsignado = t.ID_TALLER || 'No tiene, o es un nuevo Profesor';
    const tallerAsignado = t.NOMBRE_TALLER || 'No tiene, o es un nuevo Profesor';
        return `
            <tr class="fila-tallerista">
                <td class="ps-4">
                    <span class="tabla-id">
                        #${t.ID_PROFESOR || '-'}
                    </span>
                </td>
                <td>
                    <div class="tabla-info">
                        <div class="tabla-titulo">
                            ${t.NOMBRE_COMPLETO || 'Sin nombre'}
                        </div>
                    </div>
                </td>
                <td>
                    <span class="tabla-texto-suave">
                        ${idTallerAsignado || '-'}
                    </span>
                </td>
                <td>
                    <div class="tabla-titulo">
                        ${tallerAsignado || '-'}
                    </div>
                </td>
                <td>
                    <span class="tabla-profesion" title="${t.PROFESION || '-'}">
                        ${t.PROFESION || '-'}
                    </span>
                </td>
                <td>
                    <div class="tabla-texto-suave">
                        <i class="bi bi-envelope"></i>
                        ${t.CORREO_ELECTRONICO || '-'}
                    </div>
                </td>
                <td class="text-end pe-4">
                    <div class="acciones-tabla">
                        <button class="btn-tabla accion-ver" onclick="GestionTalleristas.verDetalles(${t.ID_PROFESOR})" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn-tabla accion-editar" onclick="GestionTalleristas.editar(${t.ID_PROFESOR})" title="Editar">
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
        document.getElementById('busqueda_id_profesor')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_id_taller')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_nombre_taller')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_profesion')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_nombre_completo')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('busqueda_correo_electronico')?.addEventListener('input', filtroTiempoReal);
        document.getElementById('formTallerista')?.addEventListener('submit', (e) => { 
            e.preventDefault(); 
            this.guardar(); 
        });
        document.getElementById('btnNuevoTallerista')?.addEventListener('click', () => this.abrirModalNuevo());
    }
};

document.addEventListener('DOMContentLoaded', () => GestionTalleristas.inicializando());
window.GestionTalleristas = GestionTalleristas;