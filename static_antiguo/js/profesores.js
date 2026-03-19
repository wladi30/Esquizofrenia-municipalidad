let profesores = [];
let profesorActual = null;
let paginaActual = 1;
const elementosPorPagina = 10;
const modalProfesor = new bootstrap.Modal(document.getElementById('modalProfesor'));
const modalDetallesProfesor = new bootstrap.Modal(document.getElementById('modalDetallesProfesor'));
const modalConfirmacionProfesor = new bootstrap.Modal(document.getElementById('modalConfirmacionProfesor'));

document.addEventListener('DOMContentLoaded', function() {
    cargarProfesores();
    configurarEventos();
});

async function cargarProfesores() {
    try {
        profesores = [];
        actualizarTabla();
        actualizarContador();
    } catch (error) {
        mostrarError('Error al cargar profesores: ' + error.message);
    }
}

function configurarEventos() {
    document.getElementById('buscarProfesor').addEventListener('input', function() {
        filtrarProfesores();
    });
    
    document.getElementById('formProfesor').addEventListener('submit', function(e) {
        e.preventDefault();
        guardarProfesor(e);
    });
}

async function guardarProfesor(event) {
    event.preventDefault();
    
    const idProfesor = document.getElementById('profesorId').value;
    
    const datos = {
        id_persona: document.getElementById('id_persona').value,
        profesion: document.getElementById('profesion').value,
        resumen_curricular: document.getElementById('resumen_curricular').value
    };
    
    let url, metodo;
    
    if (idProfesor) {
        url = `/api/profesores/actualizar`;
        metodo = 'POST';
    } else {
        url = `/api/profesores/crear`;
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
            modalProfesor.hide();
            cargarProfesores();
        } else {
            alert('Error: ' + resultado.message);
        }
    } catch (error) {
        mostrarError('Error: ' + error.message);
    }
}

async function cargarProfesor(id) {
    try {
        const response = await fetch(`/api/profesores/ver/${id}`);
        const resultado = await response.json();
        
        if (resultado.success) {
            mostrarDetallesProfesor(resultado.data);
        } else {
            alert(resultado.message);
        }
    } catch (error) {
        mostrarError('Error al cargar profesor: ' + error.message);
    }
}

async function eliminarProfesor(id) {
    document.getElementById('modalMessageProfesor').textContent = 
        'Esta seguro de eliminar este profesor?';
    
    const confirmBtn = document.getElementById('modalConfirmBtnProfesor');
    confirmBtn.onclick = async () => {
        try {
            const response = await fetch(`/api/profesores/eliminar/${id}`, {
                method: 'DELETE'
            });
            
            const resultado = await response.json();
            
            if (resultado.success) {
                alert(resultado.message);
                modalConfirmacionProfesor.hide();
                cargarProfesores();
            } else {
                alert('Error: ' + resultado.message);
            }
        } catch (error) {
            mostrarError('Error: ' + error.message);
        }
    };
    
    modalConfirmacionProfesor.show();
}

function mostrarModalCrear() {
    document.getElementById('modalTituloProfesor').textContent = 'Nuevo Profesor';
    document.getElementById('formProfesor').reset();
    document.getElementById('profesorId').value = '';
    modalProfesor.show();
}

function mostrarModalEditar(id) {
    const profesor = profesores.find(p => p.id_profesor == id);
    if (!profesor) return;
    
    document.getElementById('modalTituloProfesor').textContent = 'Editar Profesor';
    document.getElementById('profesorId').value = profesor.id_profesor;
    document.getElementById('id_persona').value = profesor.id_persona;
    document.getElementById('profesion').value = profesor.profesion;
    document.getElementById('resumen_curricular').value = profesor.resumen_curricular;
    
    modalProfesor.show();
}

function mostrarDetallesProfesor(datos) {
    if (!datos || datos.length === 0) return;
    
    const profesor = datos[0];
    let contenido = `
        <div class="row">
            <div class="col-md-6">
                <h6>Información Basica</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="40%">ID Profesor:</th>
                        <td>${profesor.id_profesor}</td>
                    </tr>
                    <tr>
                        <th>ID Persona:</th>
                        <td>${profesor.id_persona}</td>
                    </tr>
                    <tr>
                        <th>Profesión:</th>
                        <td>${profesor.profesion}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>Asignaciones</h6>
                <table class="table table-sm">
                    <tr>
                        <th width="40%">Taller Asignado:</th>
                        <td>${profesor.nombre_taller || 'No asignado'}</td>
                    </tr>
                    <tr>
                        <th>ID Taller:</th>
                        <td>${profesor.id_taller || 'N/A'}</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h6>Resumen Curricular</h6>
                <div class="card">
                    <div class="card-body">
                        ${profesor.resumen_curricular || '<em class="text-muted">No disponible</em>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('detallesContenidoProfesor').innerHTML = contenido;
    modalDetallesProfesor.show();
}

function actualizarTabla() {
    const cuerpo = document.getElementById('cuerpoTabla');
    cuerpo.innerHTML = '';
    
    const inicio = (paginaActual - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    const profesoresPagina = profesores.slice(inicio, fin);
    
    profesoresPagina.forEach(prof => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${prof.id_profesor}</td>
            <td>${prof.id_persona}</td>
            <td>${prof.profesion}</td>
            <td>${prof.nombre_taller || 'No asignado'}</td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                            type="button" data-bs-toggle="dropdown">
                        Acciones
                    </button>
                    <ul class="dropdown-menu actions-dropdown">
                        <li>
                            <a class="dropdown-item" href="#" onclick="cargarProfesor(${prof.id_profesor})">
                                <i class="bi bi-eye me-2"></i> Ver Detalles
                            </a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="#" onclick="mostrarModalEditar(${prof.id_profesor})">
                                <i class="bi bi-pencil me-2"></i> Editar
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item text-danger" href="#" onclick="eliminarProfesor(${prof.id_profesor})">
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

function filtrarProfesores() {
    const termino = document.getElementById('buscarProfesor').value.toLowerCase();
    
    if (!termino) {
        actualizarTabla();
        return;
    }
    
    const filtrados = profesores.filter(prof => 
        prof.id_profesor.toString().includes(termino) ||
        prof.id_persona.toString().includes(termino) ||
        prof.profesion.toLowerCase().includes(termino) ||
        (prof.nombre_taller && prof.nombre_taller.toLowerCase().includes(termino))
    );
    
    const cuerpo = document.getElementById('cuerpoTabla');
    cuerpo.innerHTML = '';
    
    filtrados.forEach(prof => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${prof.id_profesor}</td>
            <td>${prof.id_persona}</td>
            <td>${prof.profesion}</td>
            <td>${prof.nombre_taller || 'No asignado'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" 
                        onclick="cargarProfesor(${prof.id_profesor})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" 
                        onclick="mostrarModalEditar(${prof.id_profesor})">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        cuerpo.appendChild(fila);
    });
    
    document.getElementById('contadorProfesores').textContent = 
        `${filtrados.length} de ${profesores.length} profesores`;
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(profesores.length / elementosPorPagina);
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
    if (numero < 1 || numero > Math.ceil(profesores.length / elementosPorPagina)) return;
    paginaActual = numero;
    actualizarTabla();
}

function actualizarContador() {
    document.getElementById('contadorProfesores').textContent = `${profesores.length} profesores`;
}

function recargarProfesores() {
    cargarProfesores();
}

function mostrarError(mensaje) {
    console.error(mensaje);
    alert('Error: ' + mensaje);
}