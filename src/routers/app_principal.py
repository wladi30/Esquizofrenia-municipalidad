# https://youtu.be/NgxLGpb38Sk video git sobre sus funciones y como usarlas
from flask import flash, jsonify, make_response, redirect, url_for, session, redirect, url_for, render_template , Blueprint , request
from db_test import autenticar_simple
from datetime import datetime
# aqui no es mucho enrrollo, solo van las rutas principales que seran el dash board junto con otras rutas principales de todos los usuarios que deberian poder acceder

url_principal = Blueprint('url_principal', __name__, template_folder='src/templates')

@url_principal.route("/")
def index():
    if 'id_usuario' in session:
        return redirect(url_for('url_funcionario.funcionario_dashboard'))
        # elif session.get('tipo_usuario') == 'FUNCIONARIO':
        #     return redirect(url_for('url_funcionario.funcionario_dashboard'))
    return redirect(url_for('url_principal.pagina_login'))

@url_principal.route('/login-pagina', methods=['GET'])
def pagina_login():
    if 'id_usuario' in session:
        return redirect(url_for('url_principal.index'))
    return render_template('principal/login.html')

# DD JWT token firmados, investigar, probar unitest , pasar datos como url , usar postman, token , pytest
# @url_principal.route('/login', methods=['GET'])
# def login():
#     if 'id_usuario' in session:
#         return redirect(url_for('url_principal.index'))
#     if request.method == 'POST':
#         identificador = request.form.get('identificador')
#         contrasena = request.form.get('contrasena')
#         recordar = request.form.get('recordar')
#         resultado = autenticar(identificador, contrasena) #esto se encuentra en db_test, usa sgt_persona_taller para sacar esto del id y contra
#         if resultado['success']:
#             datos_usuario = resultado['datos'] #mas que nada datos que se usan en la session, son datos de sgt_persona
#             if recordar:
#                 session.permanent = True #aprovechando lo que aprendi con el tipo de flask, se ve buena idea el dar esta opcion, tal vez un modo de revertir esto?
#         session['id_usuario'] = datos_usuario['ID_PERSONA']
#         session['tipo_usuario'] = datos_usuario['TIPO_USUARIO']
#         session['nombre_completo'] = datos_usuario['NOMBRE_COMPLETO']
#         session['id_rol'] = datos_usuario['ID_ROL'] #esto es lo del id_estudiante, lo definire como ide rol para abarcar las otra que son admin y profesor 
#         flash(f'bienvenido, {session["nombre_completo"]}')
#         return redirect(url_for('url_funcionario.funcionario_dashboard'))
#     return redirect(url_for('url_principal.pagina_login'))

@url_principal.route('/login', methods=['GET'])
def login():
    # print(f"DEBUG - : identificador{type(identificador)}, {(identificador)}")
    # print(f"DEBUG - : contrasena{type(contrasena)}, {(contrasena)}")
    # if 'id_usuario' in session:
    #     return redirect(url_for('url_principal.index'))
    # if request.method == 'POST':
    #     identificador = request.form.get('identificador')
    #     contrasena = request.form.get('contrasena')
    #     recordar = request.form.get('recordar')
    #     resultado = autenticar_simple(identificador,contrasena)
    #     if resultado['success']:
    #         datos_usuario = resultado['datos']
    #         if recordar:
    #             session.permanent = True
    #     session['id_usuario'] = datos_usuario['ID_F']
    #     session['nombre_completo'] = datos_usuario['NOMBRE_COMPLETO']
    #     flash(f'bienvenido, {session["nombre_completo"]}')
        return redirect(url_for('url_funcionario.funcionario_dashboard'))
    # return redirect(url_for('url_pincipal.pagina_login'))    

@url_principal.route('/api/login', methods=['POST'])
def api_login():
    print(f"DEBUG - : contrasena{type(contrasena)}, {(contrasena)}")
    try:
        datos = request.get_json()
        rut = datos.get('rut')
        dv = datos.get('dv')
        contrasena = datos.get('password')

        if not rut or not dv or not contrasena:
            return jsonify({"success": False, "message": "Faltan datos"}), 400
        if not rut.isdigit():
            return jsonify({"success": False, "message": "RUT inválido"}), 400
        if len(rut) not in (7, 8):
            return jsonify({"success": False, "message": "El RUT es muy largo o muy pequeño"}), 400
        rut_num = int(rut)
        dv_mayus = dv.upper()
        resultado = autenticar_simple(rut_num, dv_mayus, contrasena)

        if resultado['success']:
            session['id_usuario'] = resultado['datos']['ID_F']
            session['nombre_completo'] = resultado['datos']['NOMBRE_COMPLETO']
            session['rut_f'] = rut_num
            session['dv_f'] = dv_mayus
            redirect_url = url_for('url_funcionario.funcionario_dashboard')
            return jsonify({"success": True, "redirect": redirect_url})
        else:
            return jsonify({"success": False, "message": "Usuario o contraseña incorrectos"}), 401
    except Exception as e:
        print(f"Error en api_login: {e}")
        return jsonify({"success": False, "message": "Error interno"}), 500

# @url_principal.route('/api/login', methods=['POST'])
# def api_login():
#     print(f"DEBUG - : contrasena{type(contrasena)}, {(contrasena)}")
#     try:
#         datos = request.get_json()
#         if not datos:
#             return jsonify({"success": False, "message": "Datos inválidos"}), 400
#         rut_str = datos.get('rut')
#         dv = datos.get('dv')
#         contrasena = datos.get('password')

#         if not rut_str or not dv or not contrasena:
#             return jsonify({"success": False, "message": "Faltan campos"}), 400
#         if not rut_str.isdigit() or len(rut_str) not in (7, 8):
#             return jsonify({"success": False, "message": "RUT debe tener 7 u 8 dígitos"}), 400
#         # if not validar_rut(rut_str, dv):
#         #     return jsonify({"success": False, "message": "Dígito verificador incorrecto"}), 400

#         rut_num = int(rut_str)
#         dv_mayus = dv.upper()
#         resultado = autenticar_simple(rut_num, dv_mayus, contrasena)

#         if resultado['success']:
#             session['id_usuario'] = resultado['datos']['ID_F']
#             session['nombre_completo'] = resultado['datos']['NOMBRE_COMPLETO']
#             session['rut_f'] = rut_num
#             session['dv_f'] = dv_mayus
#             redirect_url = url_for('url_funcionario.funcionario_dashboard')
#             return jsonify({"success": True, "redirect": redirect_url})
#         else:
#             return jsonify({"success": False, "message": resultado.get('message', 'Credenciales incorrectas')}), 401
#     except Exception as e:
#         print(f"Error en api_login: {e}")
#         import traceback
#         traceback.print_exc()
#         return jsonify({"success": False, "message": "Error interno del servidor"}), 500

@url_principal.route('/logout')
def logout():
    session.clear() # esto limpia los datos de la session
    response = make_response(redirect(url_for('url_principal.pagina_login'))) #lo clasico pero aqui estoy usando la function response, esto en flask lo que hace es que encapsula y lo convierte
    # esto es para no puedan volver a ser usados, lo que debe hacer, basicamente lobotomizar al navegador cada vez que esta funcion definida se activa.
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, post-check=0, pre-check=0" # no-chache no-store post y pre que revalide y tambien de paso deberia hacer que le queme el compu
    return response