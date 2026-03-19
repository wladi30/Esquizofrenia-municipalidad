from flask import abort, flash, jsonify, redirect, url_for, session, redirect, url_for, render_template , Blueprint , request
import functools
from src.utils.loggers import Logger
# aqui estaran las rutas principales sobre el tema de los talleres junto con todas las partes necesarias del funcionario , aqui no deberian estar las partes de debug ya que esan son del admin, tengo que ver tambien si le puedo colocar el tema de que 2 usuarios
# puedan acceder a las mismas rutas , por ahora no fucniona ademas tengo que mover el tema del usuario requerido que se encuentra
url_funcionario = Blueprint('url_funcionario', __name__, template_folder='src/templates')

from db_test import (
    ac_taller,
    borrar_estudiante,
    inscribir_el_taller,
    inscribir_taller_o_espera,
    obtener_profesores,
    obtener_estudiantes_por_taller,
    obtener_talleres,
    borrar_taller,
    ver_taller
)

logger = Logger()
#https://flask.palletsprojects.com/en/stable/patterns/flashing/

def funcionario_required(f):
    @functools.wraps(f)
    def funcionario_decorated(*args, **kwargs):
        # tuve un error de buvle antes, ademas de solucionarlo hice que la pag. del login fuera publica asi esta mejor
        if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
        if session.get('tipo_usuario') != 'FUNCIONARIO':
            flash('acceso denegado.', 'danger')
            abort(403)
            #en el caso de que el usuario no sea el funcionario le deberia tirar el abord para sacarlo
        return f(*args, **kwargs)
    return funcionario_decorated

#-- RUTAS BASES --
#-- DASHBOARD/FUNCIONARIO --
@url_funcionario.route('/dashboard')
@funcionario_required #aqui me aseguro solo puedan acceder funcionarios, tambien sirve para cuando se cierra la session y se vuelve atras en la pagina
def funcionario_dashboard():
    try:
        return render_template("funcionario/dashboard.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_dashboard: {e}","error_funcionario")
        return render_template("error/404.html"), 500 # 500

#-- ADMINISTRACION DE TALLER/FUNCIONARIO --
@url_funcionario.route('/taller')
@funcionario_required
def funcionario_admin_taller():
    try:
        return render_template("funcionario/administracion_taller.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_admin_taller : {e}", "error_funcionario")
        return render_template("error/500.html"), 500
    
#-- ADMINISTRACION DE TALLERISTA/FUNCIONARIO --
@url_funcionario.route('/tallerista')
@funcionario_required
def funcionario_gestion_tallerista():
    try:
        tallerista = obtener_profesores()
        return render_template("funcionario/gestion_tallerista.html", tallerista=tallerista)
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_gestion_tallerista: {e}", "error_funcionario")
        return render_template("error/500.html"), 500
    
#-- ADMINISTRACION DE INSCRIPCIONES/FUNCIONARIO --
@url_funcionario.route('/inscripciones')
@funcionario_required
def funcionario_gestion_inscripciones():
    try:
        return render_template("funcionario/gestion_inscripciones.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_gestion_inscripciones: {e}", "error_funcionario")
        return render_template("error/500.html"), 500
    
#-- LISTA DE ESPERA(A ESTE PUNTO NO SE SI LA USARE) -- 
@url_funcionario.route('/lista-espera')
@funcionario_required
def funcionario_lista_espera():
    try:
        return render_template("funcionario/lista_espera.html")
        # return print("ZA WARUDOO!!")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.lista_espera: {e}", "error_funcionario")
        return render_template("error/500.html"), 500
#-- FIN DE RUTAS BASES --

# -- SUBRUTAS --
#-- AQUI SERA LA REVISION DE INSCRIPCIONES --
@url_funcionario.route('/inscripciones/revision')
@funcionario_required
def funcionario_revision_inscripciones():
    try:
        return render_template("funcionario/revision_inscripciones.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_gestion_inscripciones: {e}", "error_funcionario")
        return render_template("error/500.html"), 500

#-- EL MASIVO TALLERES MUCHACHO --
@url_funcionario.route('/taller/masivo')
@funcionario_required
def funcionario_masivo_taller():
    try:
        return render_template("funcionario/taller_masivo.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_masivo_taller: {e}", "error_funcionario")
        return render_template("error/500.html"), 500
# -- FIN DE SUBRUTAS --
    
# -- APIS DE TALLER --
#-- contexto contexto contextual, de aqui hacia arriba estooy solo definiendo lo basico, no es necesario explicar a detalle pero eso si lo que esta arriba sirve para definir la rutas bases de cada procedimiento del crud, a su vez
# que tambien estoy poniendole loggers en caso de que falle antes de llegar a dicho procedimiento
# -- API TALLER C(R)UD --
@url_funcionario.route('/api/taller-lista', methods=['GET'])
@funcionario_required
def api_taller_lista(): # contexto para que no te la meten sin pretexto, aqui estoy haciendo una lista de los talleres llamando por id y nombre taller, los uso para obtener la cantidad de alumnos por taller
    try: # ahora la diferencia es que antes esto lo hacia en js pero encontre la forma de hacerlo aqui, por que aqui? por se puede usar en mas partes de manera mas facil en vez de hacer el llamado por el sucio js todo el rato
        year = request.args.get('year', '')
        estado = request.args.get('estado', '')
        busqueda = request.args.get('busqueda', '')
        estados = [int(estado)] if estado else None
        año = int(year) if year else None
        talleres = obtener_talleres(año=año, estados=estados)

        for taller in talleres:
            estudiantes = obtener_estudiantes_por_taller(taller.get('ID_TALLER'))
            taller['personas_inscritas'] = len(estudiantes)
        if busqueda:
            busqueda_lower = busqueda.lower()
            talleres = [t for t in talleres if busqueda_lower in t.get('NOMBRE_TALLER', '').lower()]
        return jsonify({"success": True, "data": talleres, "total": len(talleres)})
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_taller_lista: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLER (C)RUD --
@url_funcionario.route('/api/taller-crear', methods=['POST'])
@funcionario_required
def api_crear_taller():
    try:
        data = request.json # duerman a michelo
        year_proceso = data.get('year_proceso')
        id_categoria = data.get('id_categoria')
        nombre_taller = data.get('nombre_taller')
        id_departamento = data.get('id_departamento', 1)
        objetivo_taller = data.get('objetivo_taller', '')
        fec_inicio = data.get('fec_inicio')
        fec_termino = data.get('fec_termino')
        nro_minutos = data.get('nro_minutos', 90)
        nro_clases_anual = data.get('nro_clases_anual', 1)
        horas_totales = data.get('horas_totales', 0)
        id_estado_taller = data.get('id_estado_taller', 1)
        lugar = data.get('lugar', '')
        minimo_estudiante = data.get('minimo_estudiante', 5)
        maximo_estudiante = data.get('maximo_estudiante', 20)
        requisito = data.get('requisito', '')
        edad_minima = data.get('edad_minima', 0)
        edad_maxima = data.get('edad_maxima', 99)
        material = data.get('material', '')
        ind_tipo_taller = data.get('ind_tipo_taller', 1)
        resultado = inscribir_el_taller(
            year_proceso,id_categoria,nombre_taller,id_departamento,objetivo_taller,fec_inicio,fec_termino,nro_minutos,
            nro_clases_anual,horas_totales,id_estado_taller,lugar,minimo_estudiante,maximo_estudiante,requisito,edad_minima,
            edad_maxima,material,ind_tipo_taller
        )
        #primero defino que son cada dato y despues los meto todos en el 'resultado'
        if resultado.get('success'):
            return jsonify({"success": True, "message": "taller creado", "id_taller": resultado.get('id_taller')}), 201
        else:
            return jsonify({"success": False, "message": resultado.get('message', 'Error al crear taller')}), 400
        # return print("ZA WARUDOO!!")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_crear_taller: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")

# -- API TALLER C(R)UD , V2 --
@url_funcionario.route('/api/taller-get/<int:id_taller>', methods=['GET'])
@funcionario_required
def api_get_taller_id(id_taller): #C(R)UD
    try:
        taller = ver_taller(id_taller)
        if not taller:
            return jsonify({"success": False, "message": "taller no encontrado"}), 404
        estudiantes = obtener_estudiantes_por_taller(id_taller)
        taller['personas_inscritas'] = len(estudiantes)
        #aqui numero 11 chupalo entonce intentando hacer que llame a los estudiantes wuap
        return jsonify({"success": True, "data": taller})
        # return print("ZA WARUDOO!!")
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")

# -- API TALLER CR(U)D --
@url_funcionario.route('/api/taller-ac/<int:id_taller>', methods=['PUT'])
@funcionario_required
def api_actualizar_taller(id_taller): #CR(U)D
    try:
        data = request.json
        resultado = ac_taller(
            id_taller=id_taller,
            id_estado_taller=data.get('id_estado_taller'),
            fec_estado_taller=data.get('fec_estado_taller') or data.get('fec_inicio'),
            obervacion=data.get('observacion', ''),
            aud_usuario_ingreso=session.get('id_usuario', 'sistema'),
            aud_fec_ingreso=None,
            aud_usuario_modifica=session.get('id_usuario', 'sistema'),
            aud_fec_modifica=None
        )
        if resultado:
            return jsonify({"success": True, "message": "taller actualizado correctamente"})
        else:
            return jsonify({"success": False, "message": "eeror al actualizar el tallere"}), 400
        # return print("ZA WARUDOO!!")
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")

# -- API TALLER CRU(D)? , ES UN UPDATE DISFRAZADO DE DELETE --
@url_funcionario.route('/api/taller-cambiar/<int:id_taller>', methods=['DELETE'])
@funcionario_required
def api_delete_taller(id_taller): # CRU(D)
    try:
        resultado = ac_taller(
            id_taller=id_taller,
            id_estado_taller=4,
            fec_estado_taller=None, #deberia haber un getdate()
            obervacion="-",
            aud_usuario_ingreso=session.get('id_usuario', 'sistema'),
            aud_fec_ingreso=None,
            aud_usuario_modifica=session.get('id_usuario', 'sistema'),
            aud_fec_modifica=None
        )
        if resultado:
            return jsonify({"success": True, "message": "Taller cambiado a no usado/suspendido"})
        else:
            return jsonify({"success": False, "message": "error el intentar cambiar el taller"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")
    
# -- API TALLER CRU(D) --
@url_funcionario.route('/api/taller-delete/<int:id_taller>', methods=['DELETE'])
@funcionario_required
def api_delete_verdadero_taller(id_taller): #este delete cumple con el crud, sin embargo existe uno que solo modifica y deshabilita en vez de eliminar.
    #estoy creando este por si acaso lo que se busca es hacer desaparecer los datos.
    try:
        resultado = borrar_taller(id_taller)
        if resultado:
            return jsonify({"success": True, "message": "Taller eliminado de la base de datos"})
        else:
            return jsonify({"success": False, "message": "error al eliminar el taller. esta cosa es simple por lo cual se tiene que rvisar principalmente la base de datos"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
# -- FIN DE APIS DE TALLER --

# -- APIS TALLERISTAS --
# -- API TALLERISTA C(R)UD --
@url_funcionario.route('/api/tallerista-lista', methods=['GET'])
@funcionario_required
def api_lista_tallerista():
    try:
        talleristas = obtener_profesores()
        return jsonify({"success": True, "data": talleristas, "total": len(talleristas)})
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_tallerista_lista: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLERISTA (C)RUD --
@url_funcionario.route('/api/tallerista-crear', methods=['POST'])
@funcionario_required
def api_crear_tallerista():
    try:
        data = request.json
        from db_test import inscribir_profesores
        resultado = inscribir_profesores(
            id_persona=data.get('id_persona'),
            profesion=data.get('profesion', ''),
            resumen_curricular=data.get('resumen_curricular', '')
        )
        if resultado.get('success'):
            return jsonify({"success": True, "message": "Tallerista creado exitosamente", "id_profesor": resultado.get('id_profesor')}), 201
        else:
            return jsonify({"success": False, "message": resultado.get('message', 'Error al crear tallerista')}), 400
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_crear_tallerista: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLERISTA CR(U)D --
@url_funcionario.route('/api/tallerista-actualizar/<int:id_profesor>', methods=['PUT'])
@funcionario_required
def api_actualizar_tallerista(id_profesor):
    try:
        data = request.json
        from db_test import ac_profesor
        resultado = ac_profesor(
            id_persona=data.get('id_persona'),
            profesion=data.get('profesion', ''),
            resumen_curricular=data.get('resumen_curricular', ''),
            aud_usuario_ingreso=session.get('id_usuario', 'sistema'),
            aud_fec_ingreso=None,
            aud_usuario_modifica=session.get('id_usuario', 'sistema'),
            aud_fec_modifica=None
        )
        if resultado:
            return jsonify({"success": True, "message": "Tallerista actualizado correctamente"})
        else:
            return jsonify({"success": False, "message": "Error al actualizar tallerista"}), 400
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_actualizar_tallerista: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500
# -- FIN DE LAS APIS DE TALLERISTA --

# -- APIS DE INSCRIPCION --
# -- API INSCRIPCION C(R)UD --
@url_funcionario.route('/api/inscripcion-lista', methods=['GET'])
@funcionario_required
def api_inscripcion_lista():
    try:
        taller_id = request.args.get('taller_id')
        from db_test import obtener_estudiantes
        estudiantes = obtener_estudiantes()
        if taller_id:
            estudiantes_taller = obtener_estudiantes_por_taller(int(taller_id))
            return jsonify({"success": True, "data": estudiantes_taller, "total": len(estudiantes_taller)})
        return jsonify({"success": True, "data": estudiantes, "total": len(estudiantes)})
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_inscripcion_lista: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500

# -- API INSCRIPCION (C)RUD --
@url_funcionario.route('/api/inscripcion-crear', methods=['POST'])
@funcionario_required
def api_crear_inscripcion():
    try:
        data = request.json
        resultado = inscribir_taller_o_espera(
            id_taller=data.get('id_taller'),
            id_estudiante=data.get('id_estudiante'),
            year_proceso=data.get('year_proceso', 2026)
        )
        return jsonify(resultado)
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_crear_inscripcion: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500
    
# -- API INSCRIPCION CRU(D) --
@url_funcionario.route('/api/inscripcion-eliminar', methods=['DELETE'])
@funcionario_required
def api_eliminar_inscripcion():
    try:
        id_taller = request.args.get('id_taller')
        id_estudiante = request.args.get('id_estudiante')
        if not id_taller or not id_estudiante:
            return jsonify({"success": False, "message": "Faltan parámetros"}), 400
        resultado = borrar_estudiante(int(id_estudiante), int(id_taller))
        if resultado:
            return jsonify({"success": True, "message": "Inscripción eliminada correctamente"})
        else:
            return jsonify({"success": False, "message": "Error al eliminar inscripción"}), 400
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_eliminar_inscripcion: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500

# -- API INSCRIPCION C(R)UD , V2 --
@url_funcionario.route('/api/lista-espera', methods=['GET'])
@funcionario_required
def api_lista_espera():
    try:
        return jsonify({"success": True, "data": [], "total": 0})
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_lista_espera: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500
# -- FINAL DE APIS DE INSCRIPCION --

#--- GATA ---
@url_funcionario.route('/criatura')
@funcionario_required
def joven_guts():
    return render_template('a_massive_creature.html')
#--- EL FIN DE LA GUTS ---

#-- LOS QUE ESTEN AQUI NO LOS USARE POR MIENTRAS --
# -- vere si sigo utilizando este , estoy cambiando las cosas y no se si usare este pero no afecta en nada dejarlo aqui, mientras no lo llame 
@url_funcionario.route('/api/tallerista/seleccion', methods=['GET'])
@funcionario_required
def api_seleccion_tallerista():
    try:
        profesores = obtener_profesores()
        talleristas = []
        # return print("ZA WARUDOO!!")
        for prof in profesores:
            nombre_completo = f"{prof.get('NOMBRE_PERSONA', '')} {prof.get('APELLIDO_PATERNO', '')}".strip()
            talleristas.append({
                "ID_TALLERISTA": prof.get('ID_PROFESOR'),
                "NOMBRE_COMPLETO": nombre_completo if nombre_completo else "como verga paso esto xd"
            })
        return jsonify(talleristas)
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_seleccion_tallerista : {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")

@url_funcionario.route('/taller/<int:id_taller>/inscritos')
@funcionario_required
def ver_inscritos_taller(id_taller):
    try:
        return render_template("inscripcion/talleres.html", id_taller=id_taller)
        # return print("ZA WARUDOO!!")
        # no deberia colocar un error aqui?
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.ver_inscritos_taller: {e}", "error_funcionario")
        return render_template("error/500.html"), 500
        # return print("ZA WARUDOO!!")

#-- APIS de talleres adicionales(puede que se queden aqui o no, depende de como vaya todo) --
@url_funcionario.route('/api/taller/<int:id_taller>/inscritos')
@funcionario_required
def ver_inscritos_taller_est(id_taller):
    try: # aqui se tiene que hacer algo con respecto al ver los talleres, se obtienen estudiantes pero con la lista de arriba esto pasa a ser casi inutil
        estudiantes = obtener_estudiantes_por_taller(id_taller)
        return jsonify({"success": True, "data": estudiantes})
        # return print("ZA WARUDOO!!")
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")
#-- FIN DE LOS NO USADOS --

#-- RUTAS ADICIONALES --
# -- API CATEGORIA --
@url_funcionario.route('/api/categoria', methods=['GET'])
@funcionario_required
def api_categoria_taller():
    try:
        categorias = [
            {"ID_CATEGORIA": 1, "DESCRIPCION_CATEGORIA": "DANZA CLÁSICA"},
            {"ID_CATEGORIA": 2, "DESCRIPCION_CATEGORIA": "DANZAS REGIONALES"},
            {"ID_CATEGORIA": 3, "DESCRIPCION_CATEGORIA": "DANZAS DEL FOLCLORE NACIONAL"},
            {"ID_CATEGORIA": 4, "DESCRIPCION_CATEGORIA": "DANZAS URBANAS"},
            {"ID_CATEGORIA": 5, "DESCRIPCION_CATEGORIA": "ARTES VISUALES"},
            {"ID_CATEGORIA": 6, "DESCRIPCION_CATEGORIA": "FOTOGRAFÍA"},
            {"ID_CATEGORIA": 7, "DESCRIPCION_CATEGORIA": "ARTES Y OFICIOS"},
            {"ID_CATEGORIA": 8, "DESCRIPCION_CATEGORIA": "ARTES ESCÉNICAS EN TEATRO"},
            {"ID_CATEGORIA": 9, "DESCRIPCION_CATEGORIA": "LITERATURA"},
            {"ID_CATEGORIA": 10, "DESCRIPCION_CATEGORIA": "YOGA"},
            {"ID_CATEGORIA": 11, "DESCRIPCION_CATEGORIA": "AGRUPACIÓN ARTISTICA PERMANENTE DEL CCM"},
            {"ID_CATEGORIA": 12, "DESCRIPCION_CATEGORIA": "ARTES Y MANUALIDADES"},
            {"ID_CATEGORIA": 13, "DESCRIPCION_CATEGORIA": "BABY FUTBOL"},
            {"ID_CATEGORIA": 14, "DESCRIPCION_CATEGORIA": "MANUALIDADES"},
            {"ID_CATEGORIA": 15, "DESCRIPCION_CATEGORIA": "ESTÉTICA"},
            {"ID_CATEGORIA": 16, "DESCRIPCION_CATEGORIA": "TERAPIA"},
            {"ID_CATEGORIA": 17, "DESCRIPCION_CATEGORIA": "VESTUARIO Y CORTINAJE"},
            {"ID_CATEGORIA": 18, "DESCRIPCION_CATEGORIA": "IDIOMA"},
            {"ID_CATEGORIA": 19, "DESCRIPCION_CATEGORIA": "EMPRENDIMIENTO"},
            {"ID_CATEGORIA": 20, "DESCRIPCION_CATEGORIA": "COCINA"},
            {"ID_CATEGORIA": 22, "DESCRIPCION_CATEGORIA": "DESARROLLO PERSONAL"},
            {"ID_CATEGORIA": 23, "DESCRIPCION_CATEGORIA": "MEDICINA NATURAL"},
            {"ID_CATEGORIA": 24, "DESCRIPCION_CATEGORIA": "SENCE"},
            {"ID_CATEGORIA": 25, "DESCRIPCION_CATEGORIA": "NATACION"},
            {"ID_CATEGORIA": 26, "DESCRIPCION_CATEGORIA": "EJERCICIO EN AGUA"},
            {"ID_CATEGORIA": 27, "DESCRIPCION_CATEGORIA": "AMBIENTACION EN AGUA"},
            {"ID_CATEGORIA": 28, "DESCRIPCION_CATEGORIA": "PREUNIVERSITARIO"},
            {"ID_CATEGORIA": 29, "DESCRIPCION_CATEGORIA": "GIMNASIA"},
            {"ID_CATEGORIA": 30, "DESCRIPCION_CATEGORIA": "HUERTOS"},
            {"ID_CATEGORIA": 31, "DESCRIPCION_CATEGORIA": "OTEC"},
            {"ID_CATEGORIA": 32, "DESCRIPCION_CATEGORIA": "OLIMPIADA"}
        ]
        #por el momento lo dejare asi el tema de las categorias, ya que no existiran mas categorias(probablemente) no creo que sea un problema por el momento simplente dejarlo asi
        #el tema esta en que esta parte se tiene que hacer manual asi que esera un tanot complicado el tener que cambiar lo hago lector de dastos por el momento
        return jsonify(categorias)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")
#-- FIN DE CATEGORIA --