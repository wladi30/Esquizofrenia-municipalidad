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
    1: '<span class="badge bg-info">INGRESADO</span>',
    2: '<span class="badge bg-success">CALENDARIZADO</span>',
    3: '<span class="badge bg-secondary">CERRADO</span>',
    4: '<span class="badge bg-danger">DE BAJA</span>'
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
                    console.log("Datos completos del tallerista:", t);
                    document.getElementById('modalTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Tallerista';
                    let hiddenId = document.getElementById('talleristaId');
                    if (!hiddenId) {
                        hiddenId = document.createElement('input');
                        hiddenId.type = 'hidden';
                        hiddenId.id = 'talleristaId';
                        document.getElementById('formTallerista').appendChild(hiddenId);
                    }
                    hiddenId.value = id;
                    const rutInput = document.getElementById('rutProfesor');
                    const dvInput = document.getElementById('dvProfesor');
                    if (rutInput) {
                        rutInput.value = t.rut_persona || '';
                        rutInput.disabled = true;
                    }
                    if (dvInput) {
                        dvInput.value = t.dv_persona || '';
                        dvInput.disabled = true;
                    }
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
                    document.getElementById('audUsuarioIngreso').value = t.aud_usuario_ingreso;
                    document.getElementById('audFecIngreso').value = t.aud_fec_ingreso;
                    document.getElementById('audUsuarioModifica').value = t.aud_usuario_modifica;
                    document.getElementById('audFecModifica').value = t.aud_fec_modifica;
                    const fecNaci = document.getElementById('fechaNacimiento');
                    if (fecNaci) {
                        fecNaci.value = t.fec_nacimiento || '';
                        fecNaci.disabled = true;
                    }
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
        let html = `
            <div class="table-responsive">
                <table class="table table-sm table-striped">
                    <thead class="table-dark">
                        <tr>
                            <th>ID Taller</th>
                            <th>Nombre del Taller</th>
                            <th>Año Proceso</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>`;
        tallerista.talleres.forEach(taller => {
            html += `
                <tr>
                    <td>${taller.id_taller}</td>
                    <td>${taller.nombre_taller || 'Sin nombre'}</td>
                    <td>${taller.year_proceso || '-'}</td>
                    <td>${nombresEstadoTaller[taller.id_estado_taller] || '-'}</td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
        bodyContainer.innerHTML = html;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        const closeBtn = document.getElementById('closeOverlayTalleres');
        const closeOverlay = () => {overlay.style.display = 'none';document.body.style.overflow = '';};
        closeBtn.onclick = closeOverlay;
        overlay.onclick = (e) => {if (e.target === overlay) closeOverlay();};
    },

    // ESTO FALTA POR MODIFICAR la idea de esto es que se puedan ver los detalles del tallerista, pero son muchos asi que tengo que preparar esto

    verDetalles: function(id) {
        fetch(`/api/tallerista-get/${id}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const t = result.data;
                    console.log("Datos del tallerista:", t);
                    window.talleristaActual = t;
                    const talleresLista = t.talleres || [];
                    const totalTalleres = talleresLista.length;
                    let talleresHtml = '';
                    if (totalTalleres > 0) {
                        const generarFilaTaller = (taller) => {
                            return `
                                <tr>
                                    <td>${taller.id_taller}</td>
                                    <td>${taller.nombre_taller || 'Sin nombre'}</td>
                                    <td>${nombresEstadoTaller[taller.id_estado_taller] || '-'}</td>
                                    <td>${taller.year_proceso || '-'}</td>
                                </tr>
                            `;
                        };
                        const mostrarInicial = 3;
                        const tieneMas = totalTalleres > mostrarInicial;
                        const talleresMostrar = tieneMas ? talleresLista.slice(0, mostrarInicial) : talleresLista;
                        talleresMostrar.forEach(taller => {talleresHtml += generarFilaTaller(taller);});
                        if (tieneMas) {
                            talleresHtml += `
                                <tr>
                                    <td colspan="4" class="text-center">
                                        <button class="btn btn-sm btn-outline-primary" onclick="GestionTalleristas.mostrarTodosTalleresOverlay()">
                                            Ver los ${totalTalleres} Talleres completos
                                        </button>
                                    </td>
                                </table>
                            `;
                        }
                    } else {talleresHtml = `<tr><td colspan="4" class="text-center text-muted">No tiene talleres asignados</td></tr>`;}
                    let html = `
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="fw-bold">Información Personal</h6>
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
                                    <tr><th>Género:</th><td>${nombresGenero[t.genero] || 'No registrado'}</td></tr>
                                    <tr><th>País:</th><td>${nombresPaises[t.id_pais] || t.id_pais || 'No registrado'}</td></tr>
                                    <tr><th>Comuna:</th><td>${nombresComunas[t.id_comuna] || t.id_comuna || 'No registrado'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold">Contactos</h6>
                                <table class="table table-sm">
                                    <tr><th>Teléfono del Profesor:</th><td>${t.telefono || 'No registrado'}</td></tr>
                                    <tr><th>Correo del Profesor:</th><td>${t.correo_electronico || 'No registrado'}</td></tr>
                                    <tr><th>Nombre del Contacto:</th><td>${t.nombre_contacto || 'No registrado'}</td></tr>
                                    <tr><th>Teléfono del Contacto:</th><td>${t.telefono_contacto || 'No registrado'}</td></tr>
                                    <tr><th>Correo del Contacto:</th><td>${t.correo_contacto || 'No registrado'}</td></tr>
                                </table>    
                            </div>
                        </div>
                        <div class="row">
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <h6 class="fw-bold">Información General</h6>
                                    <table class="table table-sm">
                                        <tr><th>Tipo de Usuario:</th><td>${t.tipo_usuario || 'No registrado'}</td></tr>
                                        <tr><th>Observación:</th><td>${t.observacion || 'No registrado'}</td></tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold">Resumen Profesional</h6>
                                    <table class="table table-sm">
                                        <tr><th>Profesión:</th><td>${t.profesion || 'No registrado'}</td></tr>
                                        <tr><th>Resumen Curricular:</th><td>${t.resumen_curricular || 'No registrado'}</td></tr>
                                    </table>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <h6 class="fw-bold">Información Adicional</h6>
                                    <table class="table table-sm">
                                        <tr><th>Usuario que ingresó al profesor:</th><td>${t.aud_usuario_ingreso || 'No registrado'}</td></tr>
                                        <tr><th>Fecha del ingreso:</th><td>${t.aud_fec_ingreso || 'No registrado'}</tr></tr>
                                        <tr><th>Usuario última modificación:</th><td>${t.aud_usuario_modifica || 'No registrado'}</td></tr>
                                        <tr><th>Fecha última modificación:</th><td>${t.aud_fec_modifica || 'No registrado'}</td></tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-12">
                                <h6 class="fw-bold">Talleres Asignados (${totalTalleres})</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm table-bordered">
                                        <thead class="table-light">
                                            <tr><th>ID</th><th>Nombre del Taller</th><th>Año Proceso</th><th>Estado</th></tr>
                                        </thead>
                                        <tbody>
                                            ${talleresHtml}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    `;
                    document.getElementById('detallesTalleristaBody').innerHTML = html;
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
            <tr>
                <td class="ps-4 fw-semibold">${t.ID_PROFESOR}</td>
                <td>${t.NOMBRE_COMPLETO || 'Sin nombre'}</td>
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
                </td>
            </tr>
        `;
    },
    // <button class="btn btn-sm btn-outline-danger" onclick="GestionTalleristas.confirmarEliminar(${t.ID_PROFESOR}, '${nombreCompleto.replace(/'/g, "\\'")}')" title="Suspender">
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