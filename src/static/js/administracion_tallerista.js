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
        const nombreCompleto = `${t.NOMBRE_PERSONA || ''} ${t.APELLIDO_PATERNO || ''} ${t.APELLIDO_MATERNO || ''}`.trim();
        const tallerAsignado = t.NOMBRE_TALLER || 'Desconocido';
        return `
            <tr>
                <td class="ps-4 fw-semibold">${t.ID_PROFESOR}</td>
                <td>${nombreCompleto || 'Sin nombre, eso esta mal por que se supone QUE NO ACEPTA NULL , ASI QUE DIMELO YUYI , TAMO AQUI CON MAJITO, MAJITO? QUEN ES ESE MI BRODEL, MAJITO EL KE PARECE MUJEL, AY SI QUE ESA VAINA A MI ME GUTA'}</td>
                <td>${t.CORREO_ELECTRONICO || '-'}</td>
                <td>${t.PROFESION || '-'}</td>
                <td>${tallerAsignado}</td>
                <td class="text-end pe-4">
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
        const id = document.getElementById('idProfesor').value;
        const data = {
            nombre: document.getElementById('nombre').value.trim(),
            apellido_paterno: document.getElementById('apellidoPaterno').value.trim(),
            apellido_materno: document.getElementById('apellidoMaterno').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            profesion: document.getElementById('profesion').value.trim(),
            resumen_curricular: document.getElementById('resumenCurricular').value.trim()
        };
        
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
                    document.getElementById('idProfesor').value = t.ID_PROFESOR;
                    document.getElementById('nombre').value = t.NOMBRE_PERSONA;
                    document.getElementById('apellidoPaterno').value = t.APELLIDO_PATERNO;
                    document.getElementById('apellidoMaterno').value = t.APELLIDO_MATERNO;
                    document.getElementById('correo').value = t.CORREO_ELECTRONICO;
                    document.getElementById('telefono').value = t.TELEFONO;
                    document.getElementById('profesion').value = t.PROFESION;
                    document.getElementById('resumenCurricular').value = t.RESUMEN_CURRICULAR;
                    new bootstrap.Modal(document.getElementById('modalTallerista')).show();
                } else {
                    this.mostrarError(result.message || 'No se pudo cargar el tallerista');
                }
            })
            .catch(error => {
                console.error(error);
                this.mostrarError('Error de conexión');
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
        document.getElementById('busquedaNombre')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.aplicarFiltros(); });
        document.getElementById('busquedaId')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.aplicarFiltros(); });
        document.getElementById('formTallerista')?.addEventListener('submit', (e) => { e.preventDefault(); this.guardar(); });
    }
};

document.addEventListener('DOMContentLoaded', () => GestionTalleristas.inicializando());
window.GestionTalleristas = GestionTalleristas;