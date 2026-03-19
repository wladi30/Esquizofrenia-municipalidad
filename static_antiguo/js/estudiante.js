// console.log('DEBUG - estudiante.js cargado');
// class EstudianteApp {
//     constructor() {
//         this.talleres = [];
//         this.tallerSeleccionado = null;
//         this.filtros = {
//             busqueda: '',
//             categoria: '',
//             año: new Date().getFullYear(),
//             estado: ''
//         };
        
//         this.init();
//     }

//     init() {
//         console.log('DEBUG - Iniciando app');
//         this.cargarDatosIniciales();
//         this.configurarEventos();
//     }


    

//     async cargarDatosIniciales() {
//         try {
//             console.log('DEBUG - Cargando datos iniciales');
//             const sessionResp = await fetch('/debug-session');
//             const sessionData = await sessionResp.json();
//             console.log('DEBUG - Session data:', sessionData);

//             if (!sessionData.user_id) {
//                 window.location.href = '/login';
//                 return;
//             }
//             await this.cargarTalleres();
//             await this.cargarCategorias();
//             this.actualizarUISegunPagina();
            
//         } catch (error) {
//             console.error('Error en inicializacion:', error);
//             this.mostrarMensaje('Error al cargar la aplicacion', 'error');
//         }
//     }

//     configurarEventos() {
//         const busquedaInput = document.getElementById('busqueda');
//         if (busquedaInput) {
//             busquedaInput.addEventListener('input', (e) => {
//                 this.filtros.busqueda = e.target.value;
//                 this.debouncedBuscar();
//             });
//         }

//         const categoriaSelect = document.getElementById('categoria');
//         if (categoriaSelect) {
//             categoriaSelect.addEventListener('change', (e) => {
//                 this.filtros.categoria = e.target.value;
//                 console.log(e.target.value)
//                 this.aplicarFiltros();
//             });
//         }

//         const añoSelect = document.getElementById('año');
//         if (añoSelect) {
//             añoSelect.addEventListener('change', (e) => {
//                 this.filtros.año = e.target.value;
              
//                 this.aplicarFiltros();
//             });
//         }

//         const estadoSelect = document.getElementById('estado');
//         if (estadoSelect) {
//             estadoSelect.addEventListener('change', (e) => {
//                 this.filtros.estado = e.target.value;
//                 this.aplicarFiltros();
//             });
//         }

//         const recargarBtn = document.getElementById('recargarTalleres');
//         if (recargarBtn) {
//             recargarBtn.addEventListener('click', () => this.cargarTalleres());
//         }

//         document.addEventListener('keydown', (e) => {
//             if (e.key === 'Escape') {
//                 this.cerrarModal();
//             }
//         });
//     }

//     debouncedBuscar = this.debounce(() => {
//         this.aplicarFiltros();
//     }, 300);

//     debounce(func, wait) {
//         let timeout;
//         return (...args) => {
//             clearTimeout(timeout);
//             timeout = setTimeout(() => func.apply(this, args), wait);
//         };
//     }

//     async cargarTalleres() {
//         try {
//             this.mostrarCargando(true);
//             const response = await fetch('/api/talleres/list', {
//                 headers: {
//                     'Accept': 'application/json'
//                 }
//             });
            
//             if (!response.ok) {
//                 throw new Error(`Error HTTP: ${response.status}`);
//             }
            
//             const data = await response.json();
           
//             if (data.success) {
//                 this.talleres = data.data || [];
//                 this.aplicarFiltros();
//             } else {
//                 throw new Error(data.message || 'Error al cargar talleres');
//             }
            
//         } catch (error) {
//             console.error('Error cargando talleres:', error);
//             this.mostrarMensaje('Error al cargar talleres: ' + error.message, 'error');
//         } finally {
//             this.mostrarCargando(false);
//         }
//     }
// // codiguito chat gpt
//     // async cargarCategorias() { 
//     //     console.log('DEBUG - Ejecutando cargarCategorias');
//     //     try {
//     //         const response = await fetch('/api/categorias');
//     //         console.log('DEBUG - Response status:', response.status);
//     //         const data = await response.json();
//     //         console.log('DEBUG - Datos de categorías:', data);
//     //         if (data.success && Array.isArray(data.categorias)) {
//     //             const categoriaSelect = document.getElementById('categoria');
//     //             if (categoriaSelect) {
//     //                 console.log('DEBUG - Select de categorías encontrado');
//     //                 let opciones = '<option value="">TODAS LAS CATEGORÍAS</option>';
//     //                 data.categorias.forEach(c => {
//     //                     const id = c.ID_CATEGORIA || c.id_categoria;
//     //                     const desc = c.DESCRIPCION_CATEGORIA || c.descripcion_categoria;
//     //                     opciones += `<option value="${id}">${desc}</option>`;
//     //                     console.log(`DEBUG - Agregando opción: ${id} - ${desc}`);
//     //                 });
                    
//     //                 categoriaSelect.innerHTML = opciones;
//     //                 console.log('DEBUG - Select actualizado con', data.categorias.length, 'opciones');
//     //             } else {
//     //                 console.error('DEBUG - No se encontró el elemento select#categoria en el DOM');
//     //             }
//     //         } else {
//     //             console.error('DEBUG - La respuesta no tiene el formato esperado:', data);
//     //         }
//     //     } catch (error) {
//     //         console.error('ERROR EN CARGAR CATEGORIAS:', error);
//     //     }
//     // }

//     async cargarCategorias() {
//         try {
//             const response = await fetch('/api/categorias');
//             const data = await response.json();
            
//             if (data.success && data.categorias) {
//                 const categoriaSelect = document.getElementById('categoria');
//                 if (categoriaSelect) {
//                     const opciones = data.categorias.map (c => `<option valu="${c.ID_CATEGORIA}">${c.DESCRIPCION_CATEGORIA}</option>`).join('');
//                     categoriaSelect.innerHTML ='<option value="">TODAS LAS CATEGORIAS</option>' + opciones;
//                     categoriaSelect.innerHTML = '<option value="">TODAS LAS CATEGORIAS</option>' +
//                         data.categorias.map(c => 
//                             `<option value="${c.ID_CATEGORIA}">${c.DESCRIPCION_CATEGORIA}</option>`
//                         ).join('');
//                 }
//             }
//         } catch (error) {
//             console.error('ERROR EN CARGAR CATEGORIAS:', error);
//         }
//     }

//     aplicarFiltros() {
//         let talleresFiltrados = [...this.talleres];
//         console.log(talleresFiltrados);
//         if (this.filtros.busqueda) {
//             const termino = this.filtros.busqueda.toLowerCase();
//             talleresFiltrados = talleresFiltrados.filter(t => 
//                 (t.NOMBRE_TALLER || '').toLowerCase().includes(termino) ||
//                 (t.OBJETIVO_TALLER || '').toLowerCase().includes(termino) ||
//                 (t.LUGAR || '').toLowerCase().includes(termino)
//             );
//         }

//         if (this.filtros.categoria) {
//             talleresFiltrados = talleresFiltrados.filter(t => 
//                 t.ID_CATEGORIA == this.filtros.categoria
//             );
//         }

//         if (this.filtros.año) {
//             talleresFiltrados = talleresFiltrados.filter(t => 
//                 t.FEC_INICIO && new Date(t.FEC_INICIO).getFullYear() == this.filtros.año
//             );
//         }

//         if (this.filtros.estado) {
//             talleresFiltrados = talleresFiltrados.filter(t => 
//                 t.ID_ESTADO_TALLER == this.filtros.estado
//             );
//         }
//         console.log("talleres"+ talleresFiltrados)
//         this.renderizarTalleres(talleresFiltrados);
//     }

//     renderizarTalleres(talleres) {
//         const container = document.getElementById('talleres-container');
//         if (!container) return;

//         if (!talleres || talleres.length === 0) {
//             container.innerHTML = `
//                 <div class="empty-state">
//                     <i class="bi bi-inbox"></i>
//                     <h4>No hay talleres disponibles</h4>
//                     <p>Intenta ajustar los filtros de búsqueda</p>
//                 </div>
//             `;
//             return;
//         }

//         const añoActual = new Date().getFullYear();
        
//         container.innerHTML = talleres.map(taller => {
//             const puedeInscribirse = this.puedeInscribirse(taller);
//             const estadoClase = this.obtenerClaseEstado(taller);
//             const textoEstado = this.obtenerTextoEstado(taller);
//             const inscritos = taller.INSCRITOS || 0;
//             const cupos = taller.MAXIMO_ESTUDIANTE || 0;
//             const porcentajeCupos = cupos > 0 ? (inscritos / cupos) * 100 : 0;

//             return `
//                 <div class="taller-card" onclick="app.abrirDetalles(${taller.ID_TALLER})">
//                     <div class="taller-header">
//                         <h3>${taller.NOMBRE_TALLER || 'Sin nombre'}</h3>
//                         <span class="taller-categoria">${taller.NOMBRE_CATEGORIA || 'General'}</span>
//                     </div>
//                     <div class="taller-body">
//                         <div class="taller-detail">
//                             <label> Fechas:</label>
//                             <span class="value">
//                                 ${this.formatearFecha(taller.FEC_INICIO)} - ${this.formatearFecha(taller.FEC_TERMINO)}
//                             </span>
//                         </div>
//                         <div class="taller-detail">
//                             <label> Profesor:</label>
//                             <span class="value">${taller.NOMBRE_PROFESOR || 'No asignado'}</span>
//                         </div>
//                         <div class="taller-detail">
//                             <label> Lugar:</label>
//                             <span class="value">${taller.LUGAR || 'Por definir'}</span>
//                         </div>
//                         <div class="taller-detail">
//                             <label> Objetivo:</label>
//                             <span class="value">${taller.OBJETIVO_TALLER || 'Por definir'}</span>
//                         </div>
//                         <div class="cupos-indicator">
//                             <div class="cupos-bar">
//                                 <div class="cupos-fill" style="width: ${porcentajeCupos}%"></div>
//                             </div>
//                             <span class="cupos-text">${inscritos}/${cupos}</span>
//                         </div>
//                     </div>
//                     <div style="padding: 20px; border-top: 1px solid #f0f0f0;">
//                         <span class="status-badge ${estadoClase}">${textoEstado}</span>
//                         ${puedeInscribirse ? `
//                             <button class="action-btn btn-inscribir" 
//                                     onclick="event.stopPropagation(); app.abrirDetalles(${taller.ID_TALLER})">
//                                 <i class="bi bi-plus-circle"></i> Ver detalles
//                             </button>
//                         ` : `
//                             <button class="action-btn btn-detalle" 
//                                     onclick="event.stopPropagation(); app.abrirDetalles(${taller.ID_TALLER})">
//                                 <i class="bi bi-info-circle"></i> Ver detalles
//                             </button>
//                         `}
//                     </div>
//                 </div>
//             `;
//         }).join('');
//     }

//     puedeInscribirse(taller) {
//         const añoTaller = taller.FEC_INICIO ? new Date(taller.FEC_INICIO).getFullYear() : null;
//         const añoActual = new Date().getFullYear();
//         if (añoTaller !== añoActual) return false;
//         if (taller.ESTA_INSCRITO) return false;
//         const inscritos = taller.INSCRITOS || 0;
//         const cupos = taller.MAXIMO_ESTUDIANTE || 0;
        
//         return inscritos < cupos;
//     }

//     obtenerClaseEstado(taller) {
//         if (taller.ESTA_INSCRITO) return 'status-enrolled';
        
//         const inscritos = taller.INSCRITOS || 0;
//         const cupos = taller.MAXIMO_ESTUDIANTE || 0;
        
//         if (inscritos >= cupos) return 'status-full';
        
//         switch(taller.ID_ESTADO_TALLER) {
//             case 1: return 'status-available';
//             case 2: return 'status-waitlist';
//             default: return 'status-inactive';
//         }
//     }

//     obtenerTextoEstado(taller) {
//         if (taller.ESTA_INSCRITO) return 'Inscrito';
        
//         const inscritos = taller.INSCRITOS || 0;
//         const cupos = taller.MAXIMO_ESTUDIANTE || 0;
        
//         if (inscritos >= cupos) return 'Completo';
        
//         switch(taller.ID_ESTADO_TALLER) {
//             case 1: return 'Disponible';
//             case 2: return 'Proximamente';
//             default: return 'Inactivo';
//         }
//     }

//     async abrirDetalles(idTaller) {
//         try {
//             const taller = this.talleres.find(t => t.ID_TALLER === idTaller);
//             if (!taller) return;

//             this.tallerSeleccionado = taller;
//             const response = await fetch(`/api/taller/${idTaller}`);
//             if (!response.ok) throw new Error('No se pudo cargar el taller');
            
//             const detalles = await response.json();

//             const modalBody = document.getElementById('modalBody');
//             if (!modalBody) return;

//             const puedeInscribirse = this.puedeInscribirse(taller);
//             const inscritos = taller.INSCRITOS || 0;
//             const cupos = taller.MAXIMO_ESTUDIANTE || 0;

//             modalBody.innerHTML = `
//                 <div style="margin-bottom: 20px;">
//                     <h3 style="color: #333; margin-bottom: 15px;">${detalles.NOMBRE_TALLER}</h3>
                    
//                     <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
//                         <p style="margin: 0; color: #666; line-height: 1.6;">${detalles.OBJETIVO_TALLER || 'Sin descripcion disponible'}</p>
//                     </div>

//                     <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
//                         <div>
//                             <h4 style="color: #555; margin-bottom: 10px; font-size: 1.1rem;">Informacion General</h4>
//                             <table style="width: 100%;">
//                                 <tr><td style="padding: 5px 0; color: #666;"> Inicio:</td><td style="font-weight: 500;">${this.formatearFecha(detalles.FEC_INICIO)}</td></tr>
//                                 <tr><td style="padding: 5px 0; color: #666;"> Termino:</td><td style="font-weight: 500;">${this.formatearFecha(detalles.FEC_TERMINO)}</td></tr>
//                                 <tr><td style="padding: 5px 0; color: #666;"> Horas totales:</td><td style="font-weight: 500;">${detalles.HORAS_TOTALES || 'N/A'}</td></tr>
//                                 <tr><td style="padding: 5px 0; color: #666;"> Lugar:</td><td style="font-weight: 500;">${detalles.LUGAR || 'Por definir'}</td></tr>
//                             </table>
//                         </div>
//                         <div>
//                             <h4 style="color: #555; margin-bottom: 10px; font-size: 1.1rem;">Requisitos</h4>
//                             <table style="width: 100%;">
//                                 <tr><td style="padding: 5px 0; color: #666;"> Edad:</td><td style="font-weight: 500;">${detalles.EDAD_MINIMA || 0} - ${detalles.EDAD_MAXIMA || 99} años</td></tr>
//                                 <tr><td style="padding: 5px 0; color: #666;"> Requisito:</td><td style="font-weight: 500;">${detalles.REQUISITO || 'Ninguno'}</td></tr>
//                                 <tr><td style="padding: 5px 0; color: #666;"> Material:</td><td style="font-weight: 500;">${detalles.MATERIAL || 'No especificado'}</td></tr>
//                             </table>
//                         </div>
//                     </div>

//                     <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
//                         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
//                             <span style="font-weight: 600; color: #555;">Cupos disponibles:</span>
//                             <span style="font-weight: 600; color: ${inscritos >= cupos ? '#dc3545' : '#28a745'};">
//                                 ${cupos - inscritos} de ${cupos}
//                             </span>
//                         </div>
//                         <div style="height: 10px; background: #e0e0e0; border-radius: 5px; overflow: hidden;">
//                             <div style="height: 100%; width: ${(inscritos / cupos) * 100}%; background: ${inscritos >= cupos ? '#dc3545' : '#667eea'};"></div>
//                         </div>
//                     </div>
//                 </div>
//             `;

//             const btnInscribir = document.getElementById('btnInscribirseModal');
//             if (btnInscribir) {
//                 if (puedeInscribirse) {
//                     btnInscribir.style.display = 'block';
//                     btnInscribir.disabled = false;
//                     btnInscribir.onclick = () => this.inscribirse();
//                 } else {
//                     btnInscribir.style.display = 'none';
//                 }
//             }

//             document.getElementById('detallesModal').classList.add('active');
//         } catch (error) {
//             console.error('Error cargando detalles:', error);
//             this.mostrarMensaje('Error al cargar detalles del taller', 'error');
//         }
//     }

//     async inscribirse() {
//         if (!this.tallerSeleccionado) return;

//         try {
//             const response = await fetch('/api/estudiante/inscribirse-taller', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     id_taller: this.tallerSeleccionado.ID_TALLER
//                 })
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 this.mostrarMensaje('¡Inscripcion exitosa!', 'success');
//                 this.cerrarModal();
//                 await this.cargarTalleres();
//                 if (window.location.pathname.includes('mis-talleres')) {
//                     this.cargarMisTalleres();
//                 }
//             } else {
//                 this.mostrarMensaje(data.error || data.mensaje || 'Error en la inscripcion', 'error');
//             }

//         } catch (error) {
//             console.error('Error en inscripcion:', error);
//             this.mostrarMensaje('Error al procesar la inscripcion', 'error');
//         }
//     }

//     cerrarModal() {
//         const modal = document.getElementById('detallesModal');
//         if (modal) {
//             modal.classList.remove('active');
//             this.tallerSeleccionado = null;
//         }
//     }

//     async cargarMisTalleres() {
//         try {
//             const response = await fetch('/api/estudiantes/mis-talleres');
//             const data = await response.json();
            
//             if (data.success) {
//                 this.renderizarMisTalleres(data.talleres);
//             }
//         } catch (error) {
//             console.error('Error cargando mis talleres:', error);
//         }
//     }

//     renderizarMisTalleres(talleres) {
//         const container = document.getElementById('mis-talleres-container');
//         if (!container) return;

//         if (!talleres || talleres.length === 0) {
//             container.innerHTML = `
//                 <div class="empty-state">
//                     <i class="bi bi-journal-x"></i>
//                     <h4>No estás inscrito en ningún taller</h4>
//                     <p>Visita la seccion de talleres disponibles para inscribirte</p>
//                     <a href="/estudiante/talleres" class="action-btn btn-inscribir" style="display: inline-block; margin-top: 20px;">
//                         Ver talleres disponibles
//                     </a>
//                 </div>
//             `;
//             return;
//         }

//         container.innerHTML = talleres.map(taller => `
//             <div class="taller-card" onclick="app.abrirDetalles(${taller.ID_TALLER})">
//                 <div class="taller-header">
//                     <h3>${taller.NOMBRE_TALLER}</h3>
//                     <span class="taller-categoria">${taller.CATEGORIA || 'General'}</span>
//                 </div>
//                 <div class="taller-body">
//                     <div class="taller-detail">
//                         <label>Fechas:</label>
//                         <span class="value">${this.formatearFecha(taller.FEC_INICIO)} - ${this.formatearFecha(taller.FEC_TERMINO)}</span>
//                     </div>
//                     <div class="taller-detail">
//                         <label>Profesor:</label>
//                         <span class="value">${taller.NOMBRE_PROFESOR || 'No asignado'}</span>
//                     </div>
//                     <div class="taller-detail">
//                         <label>Lugar:</label>
//                         <span class="value">${taller.LUGAR || 'Por definir'}</span>
//                     </div>
//                 </div>
//                 <div style="padding: 20px; border-top: 1px solid #f0f0f0;">
//                     <span class="status-badge status-enrolled">Inscrito</span>
//                     <span class="action-btn btn-detalle" style="margin-left: 10px;">
//                         <i class="bi bi-info-circle"></i> Ver detalles
//                     </span>
//                 </div>
//             </div>
//         `).join('');
//     }

//     actualizarUISegunPagina() {
//         const path = window.location.pathname;
//         document.querySelectorAll('.estudiante-nav a').forEach(link => {
//             link.classList.remove('active');
//             if (path.includes(link.getAttribute('href'))) {
//                 link.classList.add('active');
//             }
//         });

//         if (path.includes('mis-talleres')) {
//             this.cargarMisTalleres();
//           }
//         }
//     formatearFecha(fechaString) {
//         if (!fechaString) return 'No especificada';
//         try {
//             const fecha = new Date(fechaString);
//             return fecha.toLocaleDateString('es-ES', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//             });
//         } catch {
//             return fechaString;
//           }
//         } 
//     mostrarCargando(mostrar) {
//         const spinner = document.getElementById('loadingSpinner');
//         if (spinner) {
//             spinner.style.display = mostrar ? 'block' : 'none';
//         }
//       }

//     mostrarMensaje(texto, tipo) {
//         const mensajeDiv = document.getElementById('mensaje');
//         if (!mensajeDiv) return;

//         mensajeDiv.className = `message ${tipo}`;
//         mensajeDiv.innerHTML = `
//             <i class="bi bi-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
//             ${texto}
//         `;
//         mensajeDiv.style.display = 'flex';

//         setTimeout(() => {
//             mensajeDiv.style.display = 'none';
//         }, 5000);
//       }

//     cerrarSesion() {
//         if (confirm('¿Estás seguro de que deseas cerrar sesion?')) {
//             window.location.href = '/logout';
//         }
//     }
// }

// let app;
// document.addEventListener('DOMContentLoaded', () => {
//     app = new EstudianteApp();
//     window.app = app;
// });