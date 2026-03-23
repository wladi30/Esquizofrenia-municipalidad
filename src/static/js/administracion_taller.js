// https://youtu.be/l50gnBWHmdA
// Este video explica vien el tema de los imports y exports ademas de dar muchos ejemplos de como aplicar esto, desde dinamicos a import masivos de un js a otro, recomiendo ver dde nuevo
// estoy haciendo un import de general que trae la constante currentYearV2, esta me da el año actual el cual que lo usare como
import {currentYearV2} from "./general"
// Aqui doy inicio al js principal que se encargara de casi todo sobre administracion de talleres

// el de aca sera lo que definira a lo que se muestra en la pag de talleres, aqui hare definiciones de cuandos talleres se muestran por pagina al igual que setear cuales seran los filtros
const GestionTalleres = {
    // Van a estar aqui la configuracion y los datos junto con el estado de la app en si, esta parte se 
    configuracion: {
        paginaActual: 1,
        itemsPorPagina: 30,
        filtros: {
            // esto es suponiendo el año, se tiene que hacer de manera automatica.
            year: currentYearV2,
            estado: '',
            busqueda: ''
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
        this.cargarTalleristasSelect();
    },
    // 
    cargarCategorias: function() {
        fetch('/funcionario/api/categoria')
            .then(response => response.json())
            .then(data => {
                // aqui lo pase a convertir en un array
                this.config.data.categorias = data;
                const selectCategoria = document.getElementById('categoria');
                // aqui lo que hago (ademas de ponerle un texto para mayor indicacion) le coloco un valor por default , si no tiene esto puede dar un error
                selectCategoria.innerHTML = '<option value="">Seleccione categoría...</option>';
                data.forEach(cat => {
                    // hago uso de la id categoria y descripcion de la base dedatos, podria tambien usdar las que tengo creadas en mi app de funcionario
                    const option = document.createElement('option');
                    option.value = cat.ID_CATEGORIA;
                    option.textContent = cat.DESCRIPCION_CATEGORIA;
                    selectCategoria.appendChild(option);
                });
            })
            // un catch simplemente, tal vez le podria poner un log para mas debug?
            .catch(error => {
                console.error('Error cargando categorías:', error);
                this.mostrarError('No se pudieron cargar las categorías.');
            });
    },
    // aqui va la parte d elos talleristas
    cargarTalleristasSelect: function(){
        // contruire primero las urls despues seguimos con los filtros
        fetch('funcionario/api/tallerista-lista')
        .then(response => response.json())
        .then(result => {
            if (result.succes){
                this.config.data.talleristas = result.data;
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
    cargarTalleres: function(){
        // aqui estoy haciendo los filtros que usare en cargar taller, year y estado seran valores mas simples de poner, year es solo el año que deberia ser automatico ademas de poder colocar los años anteriores
        // y estado seran los estados del 1 al 4 que se encuentran los talleres
        const params = new URLSearchParams();
        if (filtros.year) params.append('year', filtros.year);
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        // html que deberia mostrar el indicador de la carga de la tabla, es solo algo visual debo buscar los iconos en bt
        document.getElementById('tablaTalleresCuerpo').innerHTML = `{aqui deberia ir algo .html, debo ver que colocar}`
        fetch(`/funcionario/api/taller-lista?${params.toString()}`)
            .then(response => response.json())
            .then(result => {
                // ATENCION recuerda que aqui aun no existe nada, tambien los innerHTML de esta funcion aun no tienen nada valido, asi que tengo que solucionarlo
                // solo deberia poner unos cuantos iconos en los innerHTML, por lo demas debo ver que ocuure de resultado, podria ser mostrarPagina pero lo veo despues.
                if (result.succes) {

                }
                else {
                    this.mostrarError(result.message);
                    document.getElementById('tablaTalleresCuerpo').innerHTML =`{aqui lo mismo, deberia ir algo relacionado con errores en cargar los datos}`;
                }
            })
            .catch(error => {
                console.error('', error);
                this.mostrarError('');
                document.getElementById('tablaTalleresBody').innerHTML = `{ aqui algo relacionado con errores de conexion}`;
            });
    },
    // esto genera un html para la fila de tabla taller, esto deberia dar pie a que en la lista se muestren bien los talleres
    generarFilaTaller: function(t){
        const inscritos = t.personas_inscritas || 0;
        const maximo = t.MAXMIMO_ESTUDIANTE || 20;
        const porcentaje = maximo > 0 ? (inscritos / maximo) * 100 : 0;
        let estadoClass = '', estado = '';
        // aqui pondre todos los estados de taller , son solo 4 por defecto pondre el estado 3(cerrado) como el predeterminado
        switch (t.ID_ESTADO_TALLER) {
            case 1: estadoClass = 'estado 1' ; estadoTexto = 'INGRESADO';
            case 2: estadoClass = 'estado 2' ; estadoTexto = 'CALENDARIZADO';
            case 3: estadoClass = 'estado 3' ; estadoTexto = 'CERRADO';
            case 4: estadoClass = 'estado 4' ; estadoTexto = 'DE BAJA';
            default : estadoClass = 'estado 3' ; estadoTexto = 'CERRADO';
        }
        return `{ insertar porbablemente texto masivo de html aaaaa}`
    },
    mostrarPagina: function(pagina){
        //esto mas que nada me serivra para mostrar una pagina especifica en ela lista de los talleres
        this.config.paginaActual = pagina;
        const inicio = (pagina - 1) * this.config.itemsPorPagina;
        const fin = inicio + this.config.itemsPorPagina;
        const datosPagina = this.config.data.talleres.slice(inicio,fin);
        const  tbody = document.getElementById('tablaTalleresCuerpo');
        // tengo que cambiarlo y mejorarlo
        if (datosPagina.length ===0) {
            tbody.innerHTML = `{ Wuaa soy un innerHTML que necesita atencion en algun futuro }`
        }
        else {
            // falta terminar este
            tbody.innerHTML = datosPagina.map(taller => this.generarFilaTaller(taller)).join('');
        }
        this.actualizarPaginacion();
        // esta parte del codigo de abajo es algo que sqe de stack overflow, se supone que deberia mostrar 10~ por pagina.
        document.getElementById('inforPaginacion').textContent = `Mostrando ${inicio + 1}-${Math.min(fin, this.config.data.talleres.length)} de ${this.config.data.talleres.length} resultados`;
    },
    obtenerNombreCategoria: function(idCategoria){
        const categoria = this.config.data.categorias.find(c => c.ID_CATEGORIA == idCategoria);
        return categoria ? categoria.DESCRIPCION_CATEGORIA : null;

    },  
    cambiarPagina: function(){},
    bindEventos: function(){},
    // actualizarPaginacion: function(){},
    cargarCategorias: function(){},
    abrirModalNuevoTaller: function(){},
    editarTaller: function(){},
    guardarTaller: function(){},
    eliminarTaller: function(){},
    confirmarEliminar: function(){},
    exportarTalleres: function(){},
    importarTalleres: function(){},
    aplicarFiltros: function(){},
    limpiarFiltros: function(){},
    verDetalles: function(){},
    abrirModalEditarDesdeDetalles: function(){},
    cambiarPagina: function(){},
    mostrarExito: function(){},
    mostrarError: function(){},
}