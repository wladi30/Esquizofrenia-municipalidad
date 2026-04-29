from datetime import date, datetime
import traceback
import pyodbc
from flask import abort, flash, jsonify, redirect, url_for, session, redirect, url_for, render_template , Blueprint , request
import functools
from src.utils.loggers import Logger
# aqui estaran las rutas principales sobre el tema de los talleres junto con todas las partes necesarias del funcionario , aqui no deberian estar las partes de debug ya que esan son del admin, tengo que ver tambien si le puedo colocar el tema de que 2 usuarios
# puedan acceder a las mismas rutas , por ahora no fucniona ademas tengo que mover el tema del usuario requerido que se encuentra
url_funcionario = Blueprint('url_funcionario', __name__, template_folder='src/templates')

from db_test import (
    ac_profesor,
    ac_taller,
    borrar_estudiante,
    cambiar_estado_taller_de_baja,
    inscribir_el_taller,
    inscribir_taller_o_espera,
    inscribir_talleristas,
    # obtener_historial_talleres_por_tallerista,
    obtener_profesores,
    obtener_estudiantes_por_taller,
    obtener_talleres,
    suspender_tallerista,
    ver_profesor,
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
            # abort(403)
            #en el caso de que el usuario no sea el funcionario le deberia tirar el abord para sacarlo
            # lo deje comentado por mientras por que estoy cambiando el tema del usuario
            # ahora la tabla funcionario es la que dependen esto, quiere decir que no tiene tipo usuario lo cual caga casi todo el login con la session
        return f(*args, **kwargs)
    return funcionario_decorated

#-- RUTAS BASES --
#-- DASHBOARD/FUNCIONARIO --
#aqui me aseguro solo puedan acceder funcionarios, tambien sirve para cuando se cierra la session y se vuelve atras en la pagina
@url_funcionario.route('/dashboard')
@funcionario_required 
def funcionario_dashboard():
    try:
        if 'id_usuario' not in session:
            flash('debe iniciar sesion para acceder', 'warning')
            return redirect(url_for('url_principal.login'))
        return render_template("funcionario/dashboard.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_dashboard: {e}","error_funcionario")
        return render_template("error/404.html"), 500 # 500

#-- ADMINISTRACION DE TALLER/FUNCIONARIO --
@url_funcionario.route('/taller')
@funcionario_required
def funcionario_admin_taller():
    try:
        if 'id_usuario' not in session:
            flash('debe iniciar sesion para acceder', 'warning')
            return redirect(url_for('url_principal.login'))
        return render_template("funcionario/administracion_taller.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_admin_taller : {e}", "error_funcionario")
        return render_template("error/500.html"), 500
    
#-- ADMINISTRACION DE TALLERISTA/FUNCIONARIO --
@url_funcionario.route('/tallerista')
@funcionario_required
def funcionario_gestion_tallerista():
    try:
        if 'id_usuario' not in session:
            flash('debe iniciar sesion para acceder', 'warning')
            return redirect(url_for('url_principal.login'))
        return render_template("funcionario/administracion_tallerista.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_gestion_tallerista: {e}", "error_funcionario")
        return render_template("error/500.html"), 500

#-- ADMINISTRACION DE INSCRIPCIONES/FUNCIONARIO --
@url_funcionario.route('/inscripciones')
@funcionario_required
def funcionario_gestion_inscripciones():
    try:
        if 'id_usuario' not in session:
            flash('debe iniciar sesion para acceder', 'warning')
            return redirect(url_for('url_principal.login'))
        return render_template("funcionario/gestion_inscripciones.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_gestion_inscripciones: {e}", "error_funcionario")
        return render_template("error/500.html"), 500
    
#-- LISTA DE ESPERA(A ESTE PUNTO NO SE SI LA USARE) -- 
@url_funcionario.route('/lista-espera')
@funcionario_required
def funcionario_lista_espera():
    try:
        if 'id_usuario' not in session:
            flash('debe iniciar sesion para acceder', 'warning')
            return redirect(url_for('url_principal.login'))
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
        if 'id_usuario' not in session:
            flash('debe iniciar sesion para acceder', 'warning')
            return redirect(url_for('url_principal.login'))
        return render_template("funcionario/revision_inscripciones.html")
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.funcionario_gestion_inscripciones: {e}", "error_funcionario")
        return render_template("error/500.html"), 500

#-- EL MASIVO TALLERES MUCHACHO --
@url_funcionario.route('/taller/masivo')
@funcionario_required
def funcionario_masivo_taller():
    try:
        if 'id_usuario' not in session:
            flash('debe iniciar sesion para acceder', 'warning')
            return redirect(url_for('url_principal.login'))
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
def api_taller_lista():
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        year = request.args.get('year')
        estado = request.args.get('estado')
        categoria = request.args.get('categoria')
        id_del_taller = request.args.get('busqueda_id')
        busqueda_lugar = request.args.get('busqueda_lugar')
        busqueda_nombre = request.args.get('busqueda_nombre')

        año = int(year) if year and year.isdigit() else None
        id_estado = int(estado) if estado and estado.isdigit() else None
        id_categoria = int(categoria) if categoria and categoria.isdigit() else None
        busqueda_id = int(id_del_taller) if id_del_taller and id_del_taller.isdigit() else None

        lugar = busqueda_lugar if busqueda_lugar and busqueda_lugar.strip() else None
        nombre = busqueda_nombre if busqueda_nombre and busqueda_nombre.strip() else None

        talleres = obtener_talleres(year_proceso=año,id_categoria=id_categoria,id_estado_taller=id_estado,id_taller=busqueda_id,lugar=lugar,nombre_taller=nombre)
        for taller in talleres:
            estudiantes = obtener_estudiantes_por_taller(taller.get('ID_TALLER'))
            taller['personas_inscritas'] = len(estudiantes)
        return jsonify({"success": True, "data": talleres, "total": len(talleres)})
    except Exception as e:
        logger.add_to_log("error", f"api_taller_lista: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLER (C)RUD --
@url_funcionario.route('/api/taller-crear', methods=['POST'])
@funcionario_required
def api_crear_taller():
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        data = request.json
        id_profesor_v2 = data.get('id_profesor')
        year_proceso_v2 = data.get('year_proceso')
        id_categoria_v2 = data.get('id_categoria')
        nombre_taller_v2 = data.get('nombre_taller')
        objetivo = data.get('objetivo_taller')
        
        fecha_inicio = data.get('fecha_inicio')
        fecha_termino = data.get('fecha_termino')
        
        if fecha_inicio == 'nop' or fecha_inicio is None:
            fecha_inicio = '1900-01-01'
        if fecha_termino == 'nop' or fecha_termino is None:
            fecha_termino = '1900-01-01'
        
        numero_minutos = data.get('nro_minutos')
        numero_clases_anual = data.get('nro_clases_anual')
        horas_totales_v2 = data.get('horas_totales_v2')
        estado = data.get('id_estado_taller')
        observacion_v2 = data.get('observacion_v2')
        lugar_v2 = data.get('lugar')
        min_estudiante = data.get('minimo_estudiante')
        max_estudiante = data.get('maximo_estudiante')
        requisito_v2 = data.get('requisito')
        edad_min = data.get('edad_minima')
        edad_max = data.get('edad_maxima')
        material_v2 = data.get('material')
        tipo_taller = data.get('ind_tipo_taller')
        usuario_ingreso = session.get('nombre_persona', session.get('id_usuario', 'SISTEMA'))
        if not nombre_taller_v2: return jsonify({"success": False, "message": "El nombre del taller es obligatorio"}), 400
        if not id_categoria_v2: return jsonify({"success": False, "message": "La categoria es obligatoria"}), 400
        resultado = inscribir_el_taller(
            id_profesor=id_profesor_v2,
            year_proceso=year_proceso_v2,
            id_categoria=id_categoria_v2,
            nombre_taller=nombre_taller_v2,
            objetivo_taller=objetivo,
            fec_inicio=fecha_inicio,
            fec_termino=fecha_termino,
            nro_minutos=numero_minutos,
            nro_clases_anual=numero_clases_anual,
            horas_totales=horas_totales_v2,
            id_estado_taller=estado,
            observacion=observacion_v2,
            lugar=lugar_v2,
            minimo_estudiante=min_estudiante,
            maximo_estudiante=max_estudiante,
            requisito=requisito_v2,
            edad_minima=edad_min,
            edad_maxima=edad_max,
            material=material_v2,
            ind_tipo_taller=tipo_taller,
            aud_usuario_ingreso=usuario_ingreso
        )
        if resultado.get('success'):
            return jsonify({
                "success": True,
                "message": resultado.get('message'),
                "id_taller": resultado.get('id_taller')
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": resultado.get('message', 'Error al crear taller')
            }), 400
    except Exception as e:
        logger.add_to_log("error", f"error en api_crear_taller: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLER C(R)UD , V3 --
@url_funcionario.route('/api/taller-get/<int:id_taller>', methods=['GET'])
@funcionario_required
def api_get_taller_id(id_taller): #C(R)UD
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        if request.method == 'GET':
            taller = ver_taller(id_taller)
            if not taller:
                return jsonify({"success": False, "message": "taller no encontrado"}), 404
            estudiantes = obtener_estudiantes_por_taller(id_taller)
            taller['personas_inscritas'] = len(estudiantes)
        return jsonify({"success": True, "data": taller})
        # return print("ZA WARUDOO!!")
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")

# -- API TALLER CR(U)D --
@url_funcionario.route('/api/taller-ac/<int:id_taller>', methods=['PUT'])
@funcionario_required
def api_actualizar_taller(id_taller): #CR(U)D
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        if request.method ==  'PUT':
            data = request.json
            year_proceso_v2 = data.get('year_proceso')
            id_categoria_v2 = data.get('id_categoria')
            nombre_taller_v2 = data.get('nombre_taller')
            objetivo = data.get('objetivo_taller')
            
            fecha_inicio = data.get('fecha_inicio',False)
            fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()

            fecha_termino = data.get('fecha_termino',False)
            fecha_termino = datetime.strptime(fecha_termino, "%Y-%m-%d").date()

            numero_minutos = data.get('nro_minutos')
            numero_clases_anual = data.get('nro_clases_anual')
            horas_totales_v2 = data.get('horas_totales_v2')
            estado = data.get('id_estado_taller')

            observacion_v2 = data.get('observacion_v2')
            lugar_v2 = data.get('lugar')
            min_estudiante = data.get('minimo_estudiante')
            max_estudiante = data.get('maximo_estudiante')
            requisito_v2 = data.get('requisito')
            edad_min = data.get('edad_minima')
            edad_max = data.get('edad_maxima')
            material_v2 = data.get('material')
            tipo_taller = data.get('ind_tipo_taller')
            usuario_modifica = session.get('nombre_persona', session.get('id_usuario'))

            resultado = ac_taller(
                id_taller=id_taller,
                year_proceso=year_proceso_v2,
                id_categoria=id_categoria_v2,
                nombre_taller=nombre_taller_v2,
                objetivo_taller=objetivo,
                fec_inicio=fecha_inicio,
                fec_termino=fecha_termino,
                nro_minutos=numero_minutos,
                nro_clases_anual=numero_clases_anual,
                horas_totales=horas_totales_v2,
                id_estado_taller=estado,
                observacion=observacion_v2,
                lugar=lugar_v2,
                minimo_estudiante=min_estudiante,
                maximo_estudiante=max_estudiante,
                requisito=requisito_v2,
                edad_minima=edad_min,
                edad_maxima=edad_max,
                material=material_v2,
                ind_tipo_taller=tipo_taller,
                aud_usuario_modifica=usuario_modifica
            )
            if resultado:  
                return jsonify({"success": True, "message": "taller actualizado correctamente"})
            else:
                return jsonify({"success": False, "message": "Error al actualizar el taller"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLER CRU(D)? , ES UN UPDATE DISFRAZADO DE DELETE --
@url_funcionario.route('/api/taller-cambiar/<int:id_taller>', methods=['PUT'])
@funcionario_required
def api_delete_taller(id_taller): # CRU(D)
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        if request.method ==  'PUT':
            usuario_modifica = session.get('nombre_persona', session.get('id_usuario'))
            resultado = cambiar_estado_taller_de_baja(
                id_taller=id_taller,
                aud_usuario_modifica=usuario_modifica
            )
            if resultado:
                return jsonify({"success": True, "message": "Taller cambiado a no usado/suspendido"})
            else:
                return jsonify({"success": False, "message": "error el intentar cambiar el taller"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")
        
# -- APIS TALLERISTAS --
# -- API TALERISTAS LISTA DE TALLERES --
# @url_funcionario.route('/api/talleres-lista-select', methods=['GET'])
# @funcionario_required
# def api_talleres_lista_select():
#     if 'id_usuario' not in session:
#             flash('Debe iniciar sesión para acceder', 'warning')
#             return redirect(url_for('url_principal.pagina_login'))
#     try:
#         from db_test import obtener_talleres
#         talleres = obtener_talleres()
#         lista = []
#         for t in talleres:
#             lista.append({
#                 "ID_TALLER": t.get("ID_TALLER"),
#                 "NOMBRE_TALLER": t.get("NOMBRE_TALLER"),
#                 "YEAR_PROCESO": t.get("YEAR_PROCESO")
#             })
#         return jsonify({"success": True, "data": lista})
#     except Exception as e:
#         return jsonify({"success": False, "message": str(e)}), 500
    
# -- API TALLERISTA CRU(D) --
@url_funcionario.route('/api/tallerista-suspender/<int:id_profesor>', methods=['PUT'])
@funcionario_required
def api_tallerista_suspender(id_profesor):
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        usuario = session.get('nombre_persona', session.get('id_usuario', 'SISTEMA'))
        resultado = suspender_tallerista(id_profesor, usuario)
        if resultado:
            return jsonify({"success": True, "message": "Tallerista suspendido correctamente"})
        else:
            return jsonify({"success": False, "message": "Error al suspender"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLERISTA C(R)UD --
@url_funcionario.route('/api/tallerista-get/<int:id_profesor>', methods=['GET'])
@funcionario_required
def api_get_tallerista(id_profesor):
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        if request.method == 'GET':
            tallerista = ver_profesor(id_profesor)
            if not tallerista:
                return jsonify({"success": False, "message": "tallerista no encontrado"}), 404
            # talleres = obtener_historial_talleres_por_tallerista(id_profesor)
            # tallerista['personas_inscritas'] = len(talleres)
        return jsonify({"success": True, "data": tallerista})
        # return print("ZA WARUDOO!!")
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")

# -- API TALLERISTA C(R)UD --
@url_funcionario.route('/api/tallerista-lista', methods=['GET'])
@funcionario_required
def api_lista_tallerista():
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        id_profesor_str = request.args.get('id_profesor')
        id_taller_str = request.args.get('id_taller')
        nombre_taller = request.args.get('nombre_taller')
        profesion = request.args.get('profesion')
        nombre_completo = request.args.get('nombre_completo')
        correo_electronico = request.args.get('correo_electronico')

        id_profesor = int(id_profesor_str) if id_profesor_str and id_profesor_str.isdigit() else None
        id_taller = int(id_taller_str) if id_taller_str and id_taller_str.isdigit() else None

        nombre_taller = nombre_taller if nombre_taller and nombre_taller.strip() else None
        profesion = profesion if profesion and profesion.strip() else None
        nombre_completo = nombre_completo if nombre_completo and nombre_completo.strip() else None
        correo_electronico = correo_electronico if correo_electronico and correo_electronico.strip() else None

        talleristas = obtener_profesores(id_profesor=id_profesor,nombre_completo=nombre_completo,id_taller=id_taller,nombre_taller=nombre_taller,profesion=profesion,correo_electronico=correo_electronico)
        
        return jsonify({"success": True, "data": talleristas, "total": len(talleristas)})
    except Exception as e:
        print(f"Error en api_lista_tallerista: {e}")
        traceback.print_exc()
        # el traceback lo aplique un poco en distintas partes , ahora que estoy mejorando el codigo deberia aplicarlo en todos los lados posibles
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLERISTA (C)RUD --
@url_funcionario.route('/api/tallerista-crear', methods=['POST'])
@funcionario_required
def api_crear_tallerista():
    if 'id_usuario' not in session:
        return jsonify({"success": False, "message": "Debe iniciar sesión"}), 401
    try:
        data = request.json
        fecha_nacimiento_str = data.get('fec_nacimiento')
        fecha_nacimiento = datetime.strptime(fecha_nacimiento_str, "%Y-%m-%d").date()
        usuario_ingreso = session.get('nombre_persona', session.get('id_usuario', 'SISTEMA'))
        resultado = inscribir_talleristas(
            pi_rut_profesor=data.get('rut_profesor'),
            pi_dv_profesor=data.get('dv_profesor'),
            pi_nombre_profesor=data.get('nombre_persona', ''),
            pi_apellido_paterno=data.get('apellido_paterno', ''),
            pi_apellido_materno=data.get('apellido_materno', ''),
            pi_fec_nacimiento=fecha_nacimiento,
            pi_genero=data.get('genero'),
            pi_nro_calle=data.get('nro_calle', ''),
            pi_nro_block=data.get('nro_block', ''),
            pi_nro_dpto=data.get('nro_dpto', ''),
            pi_calle=data.get('calle', ''),
            pi_villa=data.get('villa', ''),
            pi_id_comuna=data.get('id_comuna', 1),
            pi_id_pais=data.get('id_pais', 1),
            pi_telefono=data.get('telefono', ''),
            pi_correo_electronico=data.get('correo_electronico', ''),
            pi_nombre_contacto=data.get('nombre_contacto', ''),
            pi_telefono_contacto=data.get('telefono_contacto', ''),
            pi_correo_contacto=data.get('correo_contacto', ''),
            pi_observacion=data.get('observacion', '-'),
            pi_profesion=data.get('profesion', '-'),
            pi_resumen_curricular=data.get('resumen_curricular', ''),
            pi_id_usuario=usuario_ingreso
        )
        if resultado.get('success'):
            return jsonify({"success": True, "message": resultado.get('message'), "id_profesor": resultado.get('id_profesor')}), 201
        else:
            return jsonify({"success": False, "message": resultado.get('message')}), 400
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_crear_tallerista: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500

# -- API TALLERISTA CR(U)D --
@url_funcionario.route('/api/tallerista-actualizar/<int:id_profesor>', methods=['PUT'])
@funcionario_required
def api_actualizar_tallerista(id_profesor):
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        data = request.get_json()
        usuario_modifica = session.get('nombre_persona', 'sistema')
        # esto tambien me lo dio la ia, con esto no se deberia romper en el caso que me pasen nulls o str
        try:
            genero = int(data.get('genero', 2))
            if genero not in (0, 1, 2):
                genero = 2
        except (ValueError, TypeError):
            genero = 2
        def to_int(val, default=0):
            try:
                return int(val) if val is not None else default
            except (ValueError, TypeError):
                return default
            # sera buena idea aplicarlo? o tal vez deberia preguntar? si esto es necesario bueno ya lo van a revisar en todo caso
        resultado = ac_profesor(
            id_profesor=id_profesor,
            nombre_persona=data.get('nombre_persona', ''),
            apellido_paterno=data.get('apellido_paterno', ''),
            apellido_materno=data.get('apellido_materno', ''),
            genero=genero,
            telefono=data.get('telefono', ''),
            correo_electronico=data.get('correo_electronico', ''),
            telefono_contacto=data.get('telefono_contacto', ''),
            nombre_contacto=data.get('nombre_contacto', ''),
            correo_contacto=data.get('correo_contacto', ''),
            profesion=data.get('profesion', ''),
            resumen_curricular=data.get('resumen_curricular', ''),
            ind_activo=to_int(data.get('ind_activo'), 1),
            observacion=data.get('observacion', ''),
            id_pais=to_int(data.get('id_pais'), 1),
            id_comuna=to_int(data.get('id_comuna'), 1),
            villa=data.get('villa', ''),
            nro_dpto=data.get('nro_dpto', ''),
            nro_block=data.get('nro_block', ''),
            nro_calle=data.get('nro_calle', ''),
            calle=data.get('calle', ''),
            aud_usuario_modifica_pt=usuario_modifica,
            aud_usuario_modifica_p=usuario_modifica
        )
        if resultado:
            return jsonify({"success": True, "message": "Tallerista actualizado correctamente"})
        else:
            return jsonify({"success": False, "message": "Error al actualizar tallerista"}), 500
    except Exception as e:
        print(f"Error en api_actualizar_tallerista: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500
# -- FIN DE LAS APIS DE TALLERISTA --

# -- APIS DE INSCRIPCION --
# -- API INSCRIPCION C(R)UD --
@url_funcionario.route('/api/inscripcion-lista', methods=['GET'])
@funcionario_required
def api_inscripcion_lista():
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
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
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        data = request.json
        id_taller_ins=data.get('id_taller')
        id_estudiante_ins=data.get('id_estudiante')
        year_proceso_ins=data.get('year_proceso')
        aud_usuario_ingreso_ins=session.get('nombre_persona', session.get('id_usuario', 'SISTEMA'))
        resultado = inscribir_taller_o_espera(
            id_taller=id_taller_ins,
            id_estudiante=id_estudiante_ins,
            year_proceso=year_proceso_ins,
            aud_usuario_ingreso=aud_usuario_ingreso_ins
        )
        return jsonify(resultado)
    except Exception as e:
        logger.add_to_log("error", f"error en funcionario.api_crear_inscripcion: {e}", "error_funcionario")
        return jsonify({"success": False, "message": str(e)}), 500
    
# -- API INSCRIPCION CRU(D) --
@url_funcionario.route('/api/inscripcion-eliminar', methods=['DELETE'])
@funcionario_required
def api_eliminar_inscripcion():
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        id_taller = request.args.get('id_taller')
        id_estudiante = request.args.get('id_estudiante')
        if not id_taller or not id_estudiante:
            return jsonify({"success": False, "message": "Faltan parametros"}), 400
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
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
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
#--- EL DESTINO DE LA GUTS ---

#-- LOS QUE ESTEN AQUI NO LOS USARE POR MIENTRAS --
# -- vere si sigo utilizando este , estoy cambiando las cosas y no se si usare este pero no afecta en nada dejarlo aqui, mientras no lo llame 
# @url_funcionario.route('/api/tallerista/seleccion', methods=['GET'])
# @funcionario_required
# def api_seleccion_tallerista():
#     try:
#         profesores = obtener_profesores()
#         talleristas = []
#         # return print("ZA WARUDOO!!")
#         for prof in profesores:
#             nombre_completo = f"{prof.get('NOMBRE_PERSONA', '')} {prof.get('APELLIDO_PATERNO', '')}".strip()
#             talleristas.append({
#                 "ID_TALLERISTA": prof.get('ID_PROFESOR'),
#                 "NOMBRE_COMPLETO": nombre_completo if nombre_completo else "como verga paso esto xd"
#             })
#         return jsonify(talleristas)
#     except Exception as e:
#         logger.add_to_log("error", f"error en funcionario.api_seleccion_tallerista : {e}", "error_funcionario")
#         return jsonify({"success": False, "message": str(e)}), 500
#         # return print("ZA WARUDOO!!")

@url_funcionario.route('/taller/<int:id_taller>/inscritos')
@funcionario_required
def ver_inscritos_taller(id_taller):
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
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
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
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
# por ahora no tengo un uso para esto, pero la idea original es que esto se usara para conseguir las categorias y mandarlas a base de datos,
# el problema surje cuando de hecho esto es un tanto inseguro, por lo cual no es necesario suarlo, actualmente estoy usando un procedimiento almacenado
# para hacer esto mismo asi que no tengo problemas, lo dejo aqui por esta bonito
@funcionario_required
def api_categoria_taller():
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        categorias = [
            {"ID_CATEGORIA": 1, "DESCRIPCION_CATEGORIA": "DANZA CLASICA"},
            {"ID_CATEGORIA": 2, "DESCRIPCION_CATEGORIA": "DANZAS REGIONALES"},
            {"ID_CATEGORIA": 3, "DESCRIPCION_CATEGORIA": "DANZAS DEL FOLCLORE NACIONAL"},
            {"ID_CATEGORIA": 4, "DESCRIPCION_CATEGORIA": "DANZAS URBANAS"},
            {"ID_CATEGORIA": 5, "DESCRIPCION_CATEGORIA": "ARTES VISUALES"},
            {"ID_CATEGORIA": 6, "DESCRIPCION_CATEGORIA": "FOTOGRAFIA"},
            {"ID_CATEGORIA": 7, "DESCRIPCION_CATEGORIA": "ARTES Y OFICIOS"},
            {"ID_CATEGORIA": 8, "DESCRIPCION_CATEGORIA": "ARTES ESCENICAS EN TEATRO"},
            {"ID_CATEGORIA": 9, "DESCRIPCION_CATEGORIA": "LITERATURA"},
            {"ID_CATEGORIA": 10, "DESCRIPCION_CATEGORIA": "YOGA"},
            {"ID_CATEGORIA": 11, "DESCRIPCION_CATEGORIA": "AGRUPACIÓN ARTISTICA PERMANENTE DEL CCM"},
            {"ID_CATEGORIA": 12, "DESCRIPCION_CATEGORIA": "ARTES Y MANUALIDADES"},
            {"ID_CATEGORIA": 13, "DESCRIPCION_CATEGORIA": "BABY FUTBOL"},
            {"ID_CATEGORIA": 14, "DESCRIPCION_CATEGORIA": "MANUALIDADES"},
            {"ID_CATEGORIA": 15, "DESCRIPCION_CATEGORIA": "ESTETICA"},
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
        # YUYI LA PTMADRE QUE ETA VAINA NO LA TOY USANDO GOKU ETA VAINA ES SERIA
        #por el momento lo dejare asi el tema de las categorias, ya que no existiran mas categorias(probablemente) no creo que sea un problema por el momento simplente dejarlo asi
        #el tema esta en que esta parte se tiene que hacer manual asi que esera un tanot complicado el tener que cambiar lo hago lector de dastos por el momento
        return jsonify(categorias)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        # return print("ZA WARUDOO!!")
#-- FIN DE CATEGORIA --

# -- API DEPARTAMENTO --
@url_funcionario.route('/api/departamento', methods=['GET'])
@funcionario_required
def api_departamento_taller():
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        departamentos = [
            {"ID_DEPARTAMENTO": 169, "DESCRIPCION_DEPARTAMENTO": "desconocido"},
            {"ID_DEPARTAMENTO": 22, "DESCRIPCION_DEPARTAMENTO": "desconocido"},
            {"ID_DEPARTAMENTO": 104, "DESCRIPCION_DEPARTAMENTO": "desconocido"}
        ]
        return jsonify(departamentos)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
#-- FIN DE DEPARTAMENTO --

# -- API GENERO --
@url_funcionario.route('/api/genero', methods=['GET'])
@funcionario_required
def api_genero_persona():
    if 'id_usuario' not in session:
            flash('Debe iniciar sesión para acceder', 'warning')
            return redirect(url_for('url_principal.pagina_login'))
    try:
        genero = [
            {"GENERO": 0, "MASCULINO": "Masculino"},
            {"GENERO": 1, "FEMENINO": "Femenino"},
            {"GENERO": 2, "OTRO": "Otro"}
        ]
        return jsonify(genero)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
#-- FIN DE GENERO --

#-- FIN RUTAS ADICIONALES --