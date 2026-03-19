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
var element = document.getElementById('back-link');
element.setAttribute('href', document.referrer);
element.onclick = function() {
  history.back();
  return false;
}
// esta es una forma direfente de obtener el año, en este caso lo usare como una variable para poder usarlo en filtros por años
const currentYearV2 = new Date().getFullYear();
const filteredData = data.filter(item => {
  return new Date(item.date).getFullYear() === currentYearV2;
});
console.log(filteredData);
// la idea de esto es obtener el año y restarlo para obtener los talleres anteriores , etc

// IMPORTANTE, podria ser buena idea hacer un export con todo lo demas, jamas se me habia ocurrido y lo aprendi hace poco que se puede, podria separar gran parte del codigo de este modo
//asi para cuando tenga que hacer unos arreglos o debug pueda encargarme de revisar mas a detaller
export default currentYearV2;