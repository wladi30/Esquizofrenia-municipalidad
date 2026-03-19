# https://youtu.be/NgxLGpb38Sk video git sobre sus funciones y como usarlas
from flask import flash, jsonify, make_response, redirect, url_for, session, redirect, url_for, render_template , Blueprint , request
from db_test import autenticar
from datetime import datetime

url_principal = Blueprint('url_principal', __name__, template_folder='src/templates')

@url_principal.route("/")
def index():
    if 'id_usuario' in session:
        if session.get('tipo_usuario') == 'ADMIN':
            return redirect(url_for('url_funcionario.funcionario_dashboard'))
        elif session.get('tipo_usuario') == 'FUNCIONARIO':
            return redirect(url_for('url_funcionario.funcionario_dashboard'))
    return redirect(url_for('url_principal.pagina_login'))

@url_principal.route('/login-pagina', methods=['GET'])
def pagina_login():
    if 'id_usuario' in session:
        return redirect(url_for('url_principal.index'))
    return render_template('principal/login.html')

@url_principal.route('/login', methods=['GET'])
def login():
    if 'id_usuario' in session:
        return redirect(url_for('url_principal.index'))
    if request.method == 'POST':
        identificador = request.form.get('identificador')
        contrasena = request.form.get('contrasena')
        recordar = request.form.get('recordar')
        resultado = autenticar(identificador, contrasena) #esto se encuentra en db_test, usa sgt_persona_taller para sacar esto del id y contra
        if resultado['success']:
            datos_usuario = resultado['datos'] #mas que nada datos que se usan en la session, son datos de sgt_persona
            if recordar:
                session.permanent = True #aprovechando lo que aprendi con el tipo de flask, se ve buena idea el dar esta opcion, tal vez un modo de revertir esto?
        session['id_usuario'] = datos_usuario['ID_PERSONA']
        session['tipo_usuario'] = datos_usuario['TIPO_USUARIO']
        session['nombre_completo'] = datos_usuario['NOMBRE_COMPLETO']
        session['id_rol'] = datos_usuario['ID_ROL'] #esto es lo del id_estudiante, lo definire como ide rol para abarcar las otra que son admin y profesor 
        flash(f'bienvenido, {session["nombre_completo"]}')
        return redirect(url_for('url_funcionario.funcionario_dashboard'))
    return redirect(url_for('url_principal.pagina_login'))

@url_principal.route('/api/login', methods=['POST'])
def api_login():
    try:
        datos = request.json
        rut = datos.get('rut')
        dv = datos.get('dv')
        password = datos.get('password')
        #ou yes señor gringous
        print(f"DEBUG - hola este es el debug n°desconocido , aqui se intentara hacer un login con el rut y dv: rut={rut}, dv={dv}")
        if not rut or not dv or not password:
            # si no, sino sisnos, con esto confirmo que tiene que poner todooo aaa ayuda estoy cagado de sueñooo
            return jsonify({
                "success": False,
                "message": "tdos los campos son obligatorios"
            }), 400
        if not rut.isdigit() or len(rut) < 7 or len(rut) > 8:
            return jsonify({
                "success": False,
                "message": "yapo hijo de la santa madre toda poderosa, ponete weno y sacame un rut que tenga no menos de 7 digitos a su vez no mas de 8 digitosS quew mira que toy con sueño wons"
            }), 400
        #lo que esta pasando aqui es que se le esta pidiendo al usuario que entregue un rut de no menos de 7 y no mas de 8 caracteres, dudo que sea necesario menos o mas
        rut_numerico = int(rut)
        resultado = autenticar(rut_numerico, dv.lower(), password)
        #ideal que funcione asi el atenticar, la idea es meter el dv con el rut
        #lo sieguiente, parece algo redundante pero conviert el dv en mayuscula, en el js tambien hace lo mismo, sobra la vrd pero lo dejare asi
        if resultado['success']:
            datos_usuario = resultado['datos']
            session['id_usuario'] = datos_usuario['ID_PERSONA']
            session['tipo_usuario'] = datos_usuario['TIPO_USUARIO']
            session['nombre_persona'] = datos_usuario['NOMBRE_COMPLETO']
            session['rut_persona'] = datos_usuario['RUT_PERSONA']
            session['dv_persona'] = datos_usuario['DV_PERSONA']
            # contexto, aqui despues de aceptar los datos de la persona (rut,contraseña) se le busca segun lo ingresado, encontrando su nombre id_persona ,etc
            redirect_url = url_for('url_funcionario.funcionario_dashboard')
            # if datos_usuario['TIPO_USUARIO'] == 'ADMIN':
            #     redirect_url = url_for('url_funcionario.funcionario_dashboard')
            # elif datos_usuario['TIPO_USUARIO'] == 'FUNCIONARIO':
            #     redirect_url = url_for('url_funcionario.funcionario_dashboard')
            # else:
            #     redirect_url = url_for('url_principal.index')
            return jsonify({
                "success": True,
                "message": "Loosgin existos",
                "redirect": redirect_url
            })
            #auto explicativo la vrd pero por si acaso, desvia segun el tipo de usuario
        else:
            return jsonify({ #hola soy un mensaje de error saludos tengo sueño saludos...      saludos
                "success": False,
                "message": resultado.get('message', 'fiumba te equivocaste en el rut o contraseña')
            })
            # este es el caso de distintos tipos de usuario, por ahora el admin no tiene un lugar predifinido asi que lo mando con el funcionario en su dashboard , mientras que en el
            #improbable caso de que entre algun usuario que no sea los ya designados este sera redirigido hacia el index, osea hacia el login
    except Exception as e:
        print(f"Error not very guts that login, fallo el login se tiene que revisar: {e}")
        import traceback
        traceback.print_exc()
        return jsonify ({
            "success": False, 
            "message": str(e)
        }), 500
    
@url_principal.route('/logout')
def logout():
    session.clear() # esto limpia los datos de la session
    response = make_response(redirect(url_for('url_principal.pagina_login'))) #lo clasico pero aqui estoy usando la function response, esto en flask lo que hace es que encapsula y lo convierte
    # esto es para no puedan volver a ser usados, lo que debe hacer, basicamente lobotomizar al navegador cada vez que esta funcion definida se activa.
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, post-check=0, pre-check=0" # no-chache no-store post y pre que revalide y tambien de paso deberia hacer que le queme el compu
    return response