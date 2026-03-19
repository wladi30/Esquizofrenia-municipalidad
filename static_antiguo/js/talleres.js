let talleres = [];
let tallerActual = null;
let paginaActual = 1;
const elementosPorPagina = 10;
const modalTaller = new bootstrap.Modal(document.getElementById('modalTaller'));
const modalDetallesTaller = new bootstrap.Modal(document.getElementById('modalDetallesTaller'));
const modalConfirmacionTaller = new bootstrap.Modal(document.getElementById('modalConfirmacionTaller'));

document.addEventListener('DOMContentLoaded', function() {
    cargarTalleres();
    configurarEventos();
});

async function cargarTalleres() {
    try {
        talleres = [];
        actualizarTabla();
        actualizarContador();
    } catch (error) {
        mostrarError('Error al cargar talleres: ' + error.message);
    }
}

function configurarEventos() {
    document.getElementById('buscarTaller').addEventListener('input', function() {
        filtrarTalleres();
    });
    
    document.getElementById('formTaller').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarTaller(e);
    });
}

async function guardarTaller(event) {
    event.preventDefault();
    
    const idTaller = document.getElementById('tallerId').value;
    
    const datos = {
        nombre_taller: document.getElementById('nombre_taller').value,
        lugar: document.getElementById('lugar').value,
        minimo_estudiante: document.getElementById('minimo_estudiante').value,
        maximo_estudiante: document.getElementById('maximo_estudiante').value,
        id_profesor: document.getElementById('id_profesor').value || null
    };
    
    let url, metodo;
    
    if (idTaller) {
        url = `/api/talleres/actualizar`;
        metodo = 'POST';
        datos.id_taller = idTaller;
        datos.id_estado_taller = document.getElementById('id_estado_taller').value;
        datos.observacion = document.getElementById('observacion').value;
    } else {
        url = `/api/talleres/crear`;
        metodo = 'POST';
    }
    
    try {
        const response = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        const resultado = await response.json();
        
        if (resultado.success) {
            alert(resultado.message);
            modalTaller.hide();
            cargarTalleres();
        } else {
            alert('Error: ' + resultado.message);
        }
    } catch (error) {
        mostrarError('Error: ' + error.message);
    }
}

async function cargarTaller(id) {
    try {
        const response = await fetch(`/api/talleres/ver/${id}`);
        const resultado = await response.json();
        
        if (resultado.success) {
            mostrarDetallesTaller(resultado.data);
        } else {
            alert(resultado.message);
        }
    } catch (error) {
        mostrarError('Error al cargar taller: ' + error.message);
    }
}

async function eliminarTaller(id) {
    document.getElementById('modalMessageTaller').textContent = 
        'Est aseguro de eliminar este taller?';
    
    const confirmBtn = document.getElementById('modalConfirmBtnTaller');
    confirmBtn.onclick = async () => {
        try {
            const response = await fetch(`/api/talleres/eliminar/${id}`, {
                method: 'DELETE'
            });
            
            const resultado = await response.json();
            
            if (resultado.success) {
                alert(resultado.message);
                modalConfirmacionTaller.hide();
                cargarTalleres();
            } else {
                alert('Error: ' + resultado.message);
            }
        } catch (error) {
            mostrarError('Error: ' + error.message);
        }
    };
    
    modalConfirmacionTaller.show();
}

function mostrarModalCrear() {
    document.getElementById('modalTituloTaller').textContent = 'Nuevo Taller';
    document.getElementById('formTaller').reset();
    document.getElementById('tallerId').value = '';
    modalTaller.show();
}

function mostrarModalEditar(id) {
    const taller = talleres.find(t => t.id_taller == id);
    if (!taller) return;
    
    document.getElementById('modalTituloTaller').textContent = 'Editar Taller';
    document.getElementById('tallerId').value = taller.id_taller;
    document.getElementById('nombre_taller').value = taller.nombre_taller;
    document.getElementById('lugar').value = taller.lugar;
    document.getElementById('minimo_estudiante').value = taller.minimo_estudiante;
    document.getElementById('maximo_estudiante').value = taller.maximo_estudiante;
    document.getElementById('id_profesor').value = taller.id_profesor || '';
    document.getElementById('id_estado_taller').value = taller.id_estado_taller;
    document.getElementById('observacion').value = taller.observacion || '';
    
    modalTaller.show();
}

function mostrarDetallesTaller(datos) {
    if (!datos) return;
    
    let contenido = `
        <div class="row">
            <div class="col-md-6">
                <h6>Información Básica</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="40%">ID Taller:</th>
                        <td>${datos.id_taller}</td>
                    </tr>
                    <tr>
                        <th>Nombre:</th>
                        <td>${datos.nombre_taller}</td>
                    </tr>
                    <tr>
                        <th>Categoría:</th>
                        <td>${datos.id_categoria || 'No especificada'}</td>
                    </tr>
                    <tr>
                        <th>Lugar:</th>
                        <td>${datos.lugar || 'No especificado'}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Estadísticas</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="40%">Cupos:</th>
                        <td>
                            <span class="badge-cupos">
                                ${datos.personas_inscritas || 0} / ${datos.maximo_estudiante}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <th>Mínimo:</th>
                        <td>${datos.minimo_estudiante}</td>
                    </tr>
                    <tr>
                        <th>Máximo:</th>
                        <td>${datos.maximo_estudiante}</td>
                    </tr>
                    <tr>
                        <th>Estado:</th>
                        <td>
                            <span class="badge-estado-taller ${datos.id_estado_taller == 1 ? 'badge-activo-taller' : 'badge-inactivo-taller'}">
                                ${datos.id_estado_taller == 1 ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h6>Detalles</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="20%">Fecha Inicio:</th>
                        <td>${datos.fec_inicio || 'No especificada'}</td>
                        <th width="20%">Fecha Término:</th>
                        <td>${datos.fec_termino || 'No especificada'}</td>
                    </tr>
                    <tr>
                        <th>Horas Totales:</th>
                        <td>${datos.horas_totales || '0'}</td>
                        <th>Clases Anuales:</th>
                        <td>${datos.nro_clases_anual || '0'}</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h6>Observación</h6>
                <div class="card">
                    <div class="card-body">
                        ${datos.observacion || '<em class="text-muted">Sin observaciones</em>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('detallesContenidoTaller').innerHTML = contenido;
    modalDetallesTaller.show();
}

function actualizarTabla() {
    const cuerpo = document.getElementById('cuerpoTabla');
    cuerpo.innerHTML = '';
    
    const inicio = (paginaActual - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    const talleresPagina = talleres.slice(inicio, fin);
    
    talleresPagina.forEach(taller => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${taller.id_taller}</td>
            <td>${taller.nombre_taller}</td>
            <td>${taller.id_categoria || 'General'}</td>
            <td>
                <span class="badge-cupos">
                    ${taller.personas_inscritas || 0} / ${taller.maximo_estudiante}
                </span>
            </td>
            <td>
                <span class="badge-estado-taller ${taller.id_estado_taller == 1 ? 'badge-activo-taller' : 'badge-inactivo-taller'}">
                    ${taller.id_estado_taller == 1 ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                            type="button" data-bs-toggle="dropdown">
                        Acciones
                    </button>
                    <ul class="dropdown-menu actions-dropdown">
                        <li>
                            <a class="dropdown-item" href="#" onclick="cargarTaller(${taller.id_taller})">
                                <i class="bi bi-eye me-2"></i> Ver Detalles
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="#" onclick="mostrarModalEditar(${taller.id_taller})">
                                <i class="bi bi-pencil me-2"></i> Editar
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item text-danger" href="#" onclick="eliminarTaller(${taller.id_taller})">
                                <i class="bi bi-trash me-2"></i> Eliminar
                            </a>
                        </li>
                    </ul>
                </div>
            </td>
        `;
        cuerpo.appendChild(fila);
    });
    
    actualizarPaginacion();
    actualizarContador();
}

function filtrarTalleres() {
    const termino = document.getElementById('buscarTaller').value.toLowerCase();
    
    if (!termino) {
        actualizarTabla();
        return;
    }
    
    const filtrados = talleres.filter(taller => 
        taller.id_taller.toString().includes(termino) ||
        taller.nombre_taller.toLowerCase().includes(termino) ||
        (taller.id_categoria && taller.id_categoria.toLowerCase().includes(termino))
    );
    
    const cuerpo = document.getElementById('cuerpoTabla');
    cuerpo.innerHTML = '';
    
    filtrados.forEach(taller => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${taller.id_taller}</td>
            <td>${taller.nombre_taller}</td>
            <td>${taller.id_categoria || 'General'}</td>
            <td>
                <span class="badge-cupos">
                    ${taller.personas_inscritas || 0} / ${taller.maximo_estudiante}
                </span>
            </td>
            <td>
                <span class="badge-estado-taller ${taller.id_estado_taller == 1 ? 'badge-activo-taller' : 'badge-inactivo-taller'}">
                    ${taller.id_estado_taller == 1 ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="cargarTaller(${taller.id_taller})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" 
                        onclick="mostrarModalEditar(${taller.id_taller})">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        cuerpo.appendChild(fila);
    });
    
    document.getElementById('contadorTalleres').textContent = 
        `${filtrados.length} de ${talleres.length} talleres`;
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(talleres.length / elementosPorPagina);
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';
    
    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">
            &laquo;
        </a>
    `;
    paginacion.appendChild(liAnterior);
    
    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${paginaActual === i ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" onclick="cambiarPagina(${i})">
                ${i}
            </a>
        `;
        paginacion.appendChild(li);
    }
    
    const liSiguiente = document.createElement('li');
    liSiguiente.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
    liSiguiente.innerHTML = `
        <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">
            &raquo;
        </a>
    `;
    paginacion.appendChild(liSiguiente);
}

function cambiarPagina(numero) {
    if (numero < 1 || numero > Math.ceil(talleres.length / elementosPorPagina)) return;
    paginaActual = numero;
    actualizarTabla();
}

function actualizarContador() {
    document.getElementById('contadorTalleres').textContent = `${talleres.length} talleres`;
}

function recargarTalleres() {
    cargarTalleres();
}

function mostrarError(mensaje) {
    console.error(mensaje);
    alert('Error: ' + mensaje);
}