// https://youtu.be/blBoIyNhGvY
// este video es bueno para hacer unos catch error , eso si tambien comenta el hecho de mandar logs pero yo tengo que adpatarlo para que se manden logs con mi sistema de errores, asi queda en evidencia cuales son los problemas que estan ocurriendo en el codigo.
// tambien necesito encontrar mas videos para poder ver como hacer un error logs mas presciso, por ahora tengo problemas para identificar en donde estan los errores en las cosas que estoy haciendo.
// Consigue la fecha actual pero solo muestra el año, no los meses ni dias esta puesto como "año_actual" para llamarlo
const today = new Date();
const currentYear = today.getFullYear();
const elements = document.querySelectorAll('.myClass, [name="año_actual"]');
document.addEventListener("DOMContentLoaded",()=> {
console.log(elements)
elements.forEach((item) => {
    item.innerHTML = currentYear;});
});
// Esto sirve para deolver las paginas en cuanto se produzca un error de url, la idea es que se use cuando el usuario acceda a una pagina que no deberia y le tira error
// Usa back-link

// var element = document.getElementById('back-link');
// element.setAttribute('href', document.referrer);
// element.onclick = function() {
//   history.back();
//   return false;
// }

var element = document.getElementById('back-link');
if (element) {
    element.setAttribute('href', document.referrer);
    element.onclick = function() {
        history.back();
        return false;
    }
}
// no se puede exportar asi que cuando la quiera usar tendre que llamar al general entero, tal vez buscar una forma de exportarla? este js se llenara de cosas

// el current year v2 es bueno para usarlo como filtro asi como para ponerlo en un display en pantalla, siempre solo dara el 2026 del año , algo que no se eso si es si lo da como numero o
// lo suelta como si fuera una string, ahora esto no tengo idea si afectara realmente pero debo buscar por que en algun futuro podria afectar
export const currentYearV2 = new Date().getFullYear();
if (typeof data !== 'undefined' && data !== null) {
    const filteredData = data.filter(item => {
        return new Date(item.date).getFullYear() === currentYearV2;
    });
    console.log(filteredData);
} else {
    // esto lo hice para que no mandara un error cada vez que se accede a una nueba pagina, el general,js se le tira un llamado desde base.html el cual lo tienen con extendes todos
    // asi que puede ser algo molesto ver que el error sale todo el rato
    console.warn("La variable 'data' no está definida en esta página.");
}

// la idea de esto es obtener el año y restarlo para obtener los talleres anteriores , etc

// IMPORTANTE, podria ser buena idea hacer un export con todo lo demas, jamas se me habia ocurrido y lo aprendi hace poco que se puede, podria separar gran parte del codigo de este modo
//asi para cuando tenga que hacer unos arreglos o debug pueda encargarme de revisar mas a detaller
// se puede utilizar el * para realizar un import masivo, en el caso de que se quiera trar multiples funciones de un js a otro