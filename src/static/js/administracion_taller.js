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
    },
    cargarTalleres: function(){},
    bindEventos: function(){},
}