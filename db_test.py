from ast import Param
import datetime
import functools,pyodbc
from flask import flash, redirect, request, session, url_for

DB_DRIVER = "ODBC Driver 18 for SQL Server" 
DB_SERVER = "SRV-SQDES" 
DB_NAME = "GESTION_TALLER"
DB_UID = "tallertest"
DB_PWD = "tallertest"

# info , alert , waring , danger

#pondre orden en este archivo, voy a segmentar todo segun a quien esta referido y a que cosa hace alucion

# from src.datebase.GESTION_TALLER import
# lo de aqui arriba aun no se como funciona, encontre menciones d elo mismo pero no formas de como usarlo ni de como poder vincularlo a sql server

#--SISTEMA--
def get_connection():
    try:
        conn = pyodbc.connect(f'DRIVER={{{DB_DRIVER}}};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_UID};PWD={DB_PWD};Encrypt=no;TrustServerCertificate=yes',autocommit=False)
        return conn
    except Exception as e:
        print(f"Error de conexion. revisa el get_connection en FLASK_APP/db_test.py: {e}")
        return None

def sql_date(date_value,datetime):
    if date_value:
        try:
            if isinstance(date_value, str):
                for fmt in ('%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%d/%m/%Y', '%d/%m/%Y %H:%M:%S'):
                    try:
                        dt = datetime.strptime(date_value, fmt)
                        return f"'{dt.strftime('%Y-%m-%d %H:%M:%S')}'"
                    except:
                        continue
                return f"'{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}'"
            elif isinstance(date_value, datetime):
                return f"'{date_value.strftime('%Y-%m-%d %H:%M:%S')}'"
            else:
                return f"'{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}'"
        except:
            return "NULL"
    return "NULL"

def sql_null_or_date(date_value):
    if date_value:
        return sql_date(date_value)
    return "NULL"

#--REQUERIMIENTOS DE SESSION--

def funcionario_required(f):
    @functools.wraps(f)
    def funcionario_decorated(*args , **kwargs):
        if 'id_usuario' not in session:
            flash('debe iniciar session para acceder', '')

def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        if session.get('tipo_usuario') != 'ADMIN':
            return "Acceso denegado", 403
        return f(*args, **kwargs)
    return decorated_function

#--AUTENTIFICACION--
# def autenticar(rut_numerico, dv, password):
#     conn = get_connection()
#     if not conn:
#         return {"success": False, "message": "Error de conexion a la base de datos"}
#     cursor = conn.cursor()
#     try:
#         # import hashlib
#         # contrasena_hash = hashlib.sha256(password.encode()).hexdigest()
#         query = """
#         SELECT TOP 1
#             P.ID_PERSONA,
#             P.NOMBRE_PERSONA,
#             P.APELLIDO_PATERNO,
#             P.APELLIDO_MATERNO,
#             P.CORREO_ELECTRONICO,
#             P.TIPO_USUARIO,
#             P.RUT_PERSONA,
#             P.DV_PERSONA
#         FROM SGT_PERSONA_TALLER P
#         WHERE P.RUT_PERSONA = ?
#             AND LOWER(P.DV_PERSONA) = LOWER(?)
#             AND P.CONTRASENA_HASH = ?
#             AND P.IND_ACTIVO = 1
#         """
#         print(f"DEBUG BD - Bsucando la persona: rut={rut_numerico}, dv={dv}") #probando si llega hasta aqui
#         cursor.execute(query, (rut_numerico,dv,password))
#         row = cursor.fetchone()
#         if row:
#             nombre_completo = f"{row[1]} {row[2]} {row[3]}".strip()
#             return {
#                 "success": True,
#                 "message": "Autenticacion exitosa",
#                 "datos":{
#                     "ID_PERSONA": row[0],
#                     "NOMBRE_COMPLETO": nombre_completo,
#                     "CORREO_ELECTRONICO": row[4],
#                     "TIPO_USUARIO": row[5],
#                     "RUT_PERSONA": row[6],
#                     "DV_PERSONA": row[7]
#                 }
#             }
#         else:
#             print("DEBUG - hola esto es para probar si tenemos un problema con las cosas del usuario, usuario no encontrado")
#             check_query = "SELECT COUNT (*) FROM SGT_PERSONA_TALLER WHERE RUT_PERSONA = ? AND LOWER(DV_PERSONA) = LOWER(?)"
#             cursor.execute(check_query, (rut_numerico, dv))
#             count = cursor.fetchone()[0]
#             if count > 0:
#                 print("DEBUG BD - El usuario existe pero la contraseña es incorrecta")
#             else:
#                 print("DEBUG BD - El usuario no existe en la BD")
#             return {"success": False, "message": "RUT o contraseña incorrectos"}
#     except Exception as e:
#         print(f"error en autenticacion: {e}")
#         import traceback
#         traceback.print_exc()
#         return {"success": False, "message": "error in the servidor causas"}
#     finally:
#         cursor.close()
#         conn.close()

# def autenticar_usuario(identificador, password):
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("EXEC autenticar ?, ?", (identificador, password))
#     resultado = cursor.fetchone()
#     if resultado and resultado[0] == 1:
#         cursor.execute("""
#             SELECT ID_PERSONA, NOMBRE_PERSONA, APELLIDO_PATERNO, 
#                    CORREO_ELECTRONICO, TIPO_USUARIO
#             FROM SGT_PERSONA_TALLER 
#             WHERE RUT_PERSONA = ?
#         """)
#         user = cursor.fetchone()
#         cursor.close()
#         conn.close()
#         if user:
#             id_rol = None
#             if user[4] == 'FUNCIONARIO':
#                 cur2 = conn.cursor()
#                 cur2.execute("SELECT ID_PERSONA FROM SGT_PERSONA_TALLER WHERE ID_PERSONA = ?", (user[0],))
#                 rol = cur2.fetchone()
#                 id_rol = rol[0] if rol else None
#                 cur2.close()
#             elif user[4] == 'ADMIN':
#                 cur2 = conn.cursor()
#                 cur2.execute("SELECT ID_PERSONA FROM SGT_PERSONA_TALLER WHERE ID_PERSONA = ?", (user[0],))
#                 rol = cur2.fetchone()
#                 id_rol = rol[0] if rol else None
#                 cur2.close()
#             return {
#                 'success': True,
#                 'id_persona': user[0],
#                 'nombre': user[1],
#                 'apellido': user[2],
#                 'nombre_completo': f"{user[1]} {user[2] or ''}".strip(),
#                 'email': user[3],
#                 'tipo_usuario': user[4],
#                 'id_rol': id_rol
#             }
#     cursor.close()
#     conn.close()
#     return {"success": False, "message": "Credenciales incorrectas"}

def autenticar_simple(rut, dv, contrasena):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL AUTENTIFICACION_SIN_HASH(?, ?, ?)}", (rut, dv, contrasena))
        row = cursor.fetchone()
        if row and row.EXITO == 1:
            return {"success": True, "message": row.MENSAJE, "datos": {"ID_F": row.ID_F, "NOMBRE_COMPLETO": row.NOMBRE}}
        else:
            mensaje = row.MENSAJE if row else "Error desconocido"
            return {"success": False, "message": mensaje}
    except Exception as e:
        print(f"Error: {e}")
        return {"success": False, "message": "Error interno"}
    finally:
        cursor.close()
        conn.close()

#--REGISTRAR PERSONAS--
def registrar_persona(rut_persona,dv_persona,nombre_persona,apellido_paterno,apellido_materno,fec_nacimiento, genero, telefono, correo, contrasena, tipo_usuario='ESTUDIANTE', pasaporte=None, calle=None, nro_calle=None, id_comuna=None, id_pais=None):
    conn = get_connection()
    if not conn: #lo que trato de hacer aqui es poder registrar estudiantes/profesores/admins con la id persona, se obtienen sus datos, quedan almacenados y serviran para poder acceder a los por parte de los usuarios
        return {"success": False, "message": "Error de conexcion"}
    cursor = conn.cursor()
    try: #admin solo se puede crear en la base de datos por ahora, eso si no creo que sea buena idea que en la misma pagina un admin pueda crear otro admin, podria ser peligroso asi que primero se registran y en la base se les actualiza
    # POR El momento no uso mas esto, me servia para crear usuarios de los cuales separaba en estudiante , profesor y funcionario, tambien admin pero ahora tengo 2 tablas distintas
    # persona taller son est y profes , persona funcionario es para los funcionarios y tal vez admins?    
        pasaporte_sql = f"'{pasaporte}'" if pasaporte else "NULL"
        calle_sql = f"'{calle}'" if calle else "NULL"
        nro_calle_sql = f"'{nro_calle}'" if nro_calle else "NULL"
        id_comuna_sql = str(id_comuna) if id_comuna else "NULL"
        id_pais_sql = str(id_pais) if id_pais else "NULL"
        query = f"""{{CALL REGISTRAR_PERSONA({rut_persona},'{dv_persona}',{pasaporte_sql},'{nombre_persona}','{apellido_paterno}','{apellido_materno}','{fec_nacimiento}','{genero}','{telefono}','{correo}','{contrasena}','{tipo_usuario}',{calle_sql},{nro_calle_sql},{id_comuna_sql},{id_pais_sql})}}"""
        cursor.execute(query)
        resultado = cursor.fetchone()
        conn.commit()

        if resultado and resultado[0] == 'success':
            return {
                "success": True,
                "message": resultado[1],
                "id_persona": resultado[2],
                "id_rol": resultado[3]
            }
        else:
            return {
                "success": False,
                "message": resultado[1]
        if resultado else "Error deconocido lptm"
        }
    except Exception as e:
        print(f"Error en REGISTRO_PERSONA: {e}")
        conn.rollback()
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

# def crear_persona(rut,dv,nombre_persona,apellido_paterno,apellido_materno,correo,telefono,contrasena,tipo_usuario):
#     conn = get_connection()
#     if not conn:
#         return {"success": False, "message": "Error de conexion"}
#     cursor = conn.cursor()
#     try:
#         import hashlib
#         contrasena_hash = hashlib.sha256(contrasena.encode()).hexdigest()
#         query = f"""
#         INSERT INTO SGT_PERSONA_TALLER (RUT_PERSONA, DV_PERSONA, NOMBRE_PERSONA, APELLIDO_PATERNO, APELLIDO_MATERNO, CORREO_ELECTRONICO, TELEFONO, CONTRASENA_HASH,TIPO_USUARIO, IND_ACTIVO, AUD_USUARIO_INGRESO, AUD_FEC_INGRESO) 
#         VALUES ({rut}, '{dv}', '{nombre_persona}', '{apellido_paterno}', '{apellido_materno}', '{correo}', '{telefono}', '{contrasena_hash}', '{tipo_usuario}', 1, 'sistema', GETDATE())
#         SELECT SCOPE_IDENTITY() AS ID_PERSONA
#         """
#         cursor.execute(query)
#         id_persona = cursor.fetchone()[0]
#         conn.commit()
#         return {
#             "success": True,
#             "message": "Persona creada exitosamente",
#             "id_persona": id_persona
#         }
#     except Exception as e:
#         conn.rollback()
#         print(f"Error creando persona: {e}")
#         return {"success": False, "message": str(e)}
#     finally:
#         cursor.close()
#         conn.close()

#--FUNCIONARIO(ANTIGUAMENTE ESTUDIANTE)--
def ver_estudiante(id_estudiante, id_taller=None): #ESTO DEBERIA SOLUCIONAR LOS PROBLEMAS CON LAS FECHAS TODAS RANCIAS
    conn = get_connection()
    if not conn:
        return None
    cursor = conn.cursor()
    try:
        if id_taller:
            cursor.execute(f"{{CALL VER_ESTUDIANTE_TALLER({id_estudiante}, {id_taller})}}")
        else:
            cursor.execute(f"{{CALL VER_ESTUDIANTE({id_estudiante})}}")
        
        estudiante = []
        for row in cursor:
            resultado_e = {
                'id_taller': row[0],
                'nombre_taller': row[1],
                'id_estudiante': row[2],
                'year_proceso': row[3],
                'estado_integrante': row[4],
                'fec_inscripcion': str(row[5]) if row[5] else '1900-01-01',
                'fec_retiro': str(row[6]) if row[6] else '1900-01-01',
                'observacion': row[7] or '-',
                'fec_reincorporacion': str(row[8]) if row[8] else '1900-01-01',
                'aud_usuario_ingreso': row[9] or 'sistema',
                'aud_fec_ingreso': str(row[10]) if row[10] else '1900-01-01',
                'aud_usuario_modifica': row[11] or 'sistema',
                'aud_fec_modifica': str(row[12]) if row[12] else '1900-01-01'
            }
            estudiante.append(resultado_e)
        return estudiante
    except Exception as e:
        print(f"Error en VER_ESTUDIANTE: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def obtener_estudiantes(): # lo mismo de arriba pero ahora son estudiants , profesores podran ver a su clase con esto
    # se tiene que actualizar con un procedimiento
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        sql = "SELECT e.ID_ESTUDIANTE, pe.ID_PERSONA, pe.NOMBRE_PERSONA, pe.APELLIDO_PATERNO, pe.APELLIDO_MATERNO, pe.EDAD, pe.TELEFONO, pe.CORREO_ELECTRONICO FROM SGT_ESTUDIANTE e JOIN SGT_PERSONA_TALLER pe ON e.ID_PERSONA = pe.ID_PERSONA"
        cursor.execute(sql)
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error obteniendo estudiantes: {e}")
        return []
    finally:
        cursor.close()
        conn.close()
        
def ver_estudiante_con_taller(id_estudiante, id_taller):
    conn = get_connection()
    if not conn:
        return None
    cursor = conn.cursor() #la id taller es opcional, actualmente funciona con ids, quiero cambiarlo para que el admin pueda ver los talleres con todos sus estudiantes, al buscar un estudiante que sea por nombre, obvio se deberia poder filtrar por multiples cosas, año ingreso, taller, edad, comuna, pais, etc
    try:
        query = f"""SELECT E.ID_TALLER, T.NOMBRE_TALLER, E.ID_ESTUDIANTE, E.YEAR_PROCESO, E.IND_ESTADO_INTEGRANTE, E.FEC_INSCRIPCION, E.FEC_RETIRO, E.OBSERVACION, E.FEC_REINCORPORACION
        FROM SGT_INTEGRANTE_TALLER E
        INNER JOIN SGT_TALLER T ON E.ID_TALLER = T.ID_TALLER
        WHERE E.ID_ESTUDIANTE = {id_estudiante} 
          AND E.ID_TALLER = {id_taller}"""
        cursor.execute(query)
        estudiante = []
        for row in cursor:
            resultado_e = {
                'id_taller': row[0],
                'nombre_taller': row[1],
                'id_estudiante': row[2],
                'year_proceso': row[3],
                'estado_integrante': row[4],
                'fec_inscripcion': str(row[5]) if row[5] else '1900-01-01',
                'fec_retiro': str(row[6]) if row[6] else '1900-01-01',
                'observacion': row[7] or '-',
                'fec_reincorporacion': str(row[8]) if row[8] else '1900-01-01'
            }
            estudiante.append(resultado_e)
        return estudiante
    except Exception as e:
        print(f"Error en ver_estudiante_con_taller: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def ac_estudiante(id_estudiante, id_taller, year_proceso, ind_estado_integrante,fec_inscripcion=None, fec_retiro=None, observacion='-',fec_reincorporacion=None, aud_usuario_ingreso='sistema',aud_fec_ingreso=None, aud_usuario_modifica='sistema',aud_fec_modifica=None):
    conn = get_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        from datetime import datetime
        fecha_actual = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        fec_retiro_final = fec_retiro if fec_retiro else '1900-01-01 00:00:00'
        fec_reincorporacion_final = fec_reincorporacion if fec_reincorporacion else '1900-01-01 00:00:00'
        query = f"""DECLARE @fec_retiro_dt DATETIME = CONVERT(DATETIME, '{fec_retiro_final}', 120)DECLARE @fec_reincorporacion_dt DATETIME = CONVERT(DATETIME, '{fec_reincorporacion_final}', 120)DECLARE @fec_inscripcion_dt DATETIME = CONVERT(DATETIME, '{fecha_actual}', 120)DECLARE @aud_fec_ingreso_dt DATETIME = CONVERT(DATETIME, '{fecha_actual}', 120)DECLARE @aud_fec_modifica_dt DATETIME = CONVERT(DATETIME, '{fecha_actual}', 120)
        EXEC AC_ESTUDIANTE
            @ID_TALLER = {id_taller},
            @ID_ESTUDIANTE = {id_estudiante},
            @YEAR_PROCESO = {year_proceso},
            @IND_ESTADO_INTEGRANTE = {ind_estado_integrante},
            @FEC_INSCRIPCION = @fec_inscripcion_dt,
            @FEC_RETIRO = @fec_retiro_dt,
            @OBSERVACION = '{observacion}',
            @FEC_REINCORPORACION = @fec_reincorporacion_dt,
            @AUD_USUARIO_INGRESO = '{aud_usuario_ingreso}',
            @AUD_FEC_INGRESO = @aud_fec_ingreso_dt,
            @AUD_USUARIO_MODIFICA = '{aud_usuario_modifica}',
            @AUD_FEC_MODIFICA = @aud_fec_modifica_dt
        """
        #un tanto largo y confuso pero funciona, mejor no tocarlo
        print(f"DEBUG - Query AC_ESTUDIANTE: {query[:500]}...") #mas cosas de debug, sirve para mostrar los 500 primeros caracteres
        cursor.execute(query)
        conn.commit()
        print(f"DEBUG_DB - AC_ESTUDIANTE ejecutado exitosamente")
        return True
    except Exception as e:
        print(f"Error en AC_ESTUDIANTE: {e}")
        import traceback
        print(f"Traceback completo: {traceback.format_exc()}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def inscribir_en_el_taller(id_taller, id_estudiante, year_proceso):
    # inscribir taller ya no la usare, necesito el sistema de gestion de cupos asi que usare el otro, mientras ese deberia de redirigir al nuevo sistema salu2.
    return inscribir_taller_o_espera(id_taller, id_estudiante, year_proceso)

def inscribir_taller_o_espera(id_taller, id_estudiante, year_proceso, aud_usuario_ingreso):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        print(f"DEBUG - Ejecutando INSCRIBIR_TALLER_O_ESPERA({id_taller}, {id_estudiante}, {year_proceso}, '{aud_usuario_ingreso}')")
        cursor.execute(f"{{CALL INSCRIBIR_TALLER_O_ESPERA({id_taller}, {id_estudiante}, {year_proceso}, '{aud_usuario_ingreso}')}}")
        try:
            row = cursor.fetchone()
            print(f"DEBUG - Resultado obtenido: {row}")
        except Exception as fetch_error:
            print(f"DEBUG - Error al obtener resultados: {fetch_error}")
            while cursor.nextset():
                try:
                    row = cursor.fetchone()
                    if row:
                        print(f"DEBUG - Resultado alternativo: {row}")
                        break
                except:
                    continue
        conn.commit()
        if row:
            resultado = {
                "mensaje": row[0],
                "en_lista_espera": bool(row[1]),
                "id_taller": row[2],
                "id_estudiante": row[3]
            }
            mensaje = str(resultado["mensaje"]).lower()
            es_exitoso = ('inscripción exitosa' in mensaje or 'Bien' in str(resultado["mensaje"]) or 'agregado a lista' in mensaje)
            return {
                "success": es_exitoso,
                "message": resultado["mensaje"],
                "en_lista_espera": resultado["en_lista_espera"],
                "data": resultado
            }
        else:
            try: 
                rows = cursor.fetchall()
                if rows:
                    print(f"DEBUG - Filas adicionales: {rows}")
            except:
                pass
            return {"success": False, "message": "El procedimiento no devolvió resultados"}
    except Exception as e:
        error_msg = str(e)
        print(f"Error en INSCRIBIR_TALLER_O_ESPERA: {error_msg}")
        try:
            if cursor.messages:
                for msg in cursor.messages:
                    print(f"Mensaje SQL: {msg}")
        except:
            pass
        conn.rollback()
        return {"success": False, "message": f"Error en base de datos: {error_msg}"}
    finally:
        cursor.close()
        conn.close()

def borrar_estudiante(id_estudiante, id_taller=None):
    conn = get_connection()
    if not conn:
        print("ERROR: No hay conexión a la base de datos")
        return False
    cursor = conn.cursor()
    try:
        if id_taller is not None:
            print(f"DEBUG - Ejecutando BORRAR_ESTUDIANTE({id_estudiante}, {id_taller})")
            cursor.execute(f"{{CALL BORRAR_ESTUDIANTE({id_estudiante}, {id_taller})}}")
        else:
            print(f"DEBUG - Ejecutando BORRAR_ESTUDIANTE antiguo ({id_estudiante})")
            cursor.execute(f"{{CALL BORRAR_ESTUDIANTE({id_estudiante})}}")
        conn.commit()
        print(f"DEBUG - Estudiante {id_estudiante} eliminado exitosamente")
        return True
    except Exception as e:
        print(f"ERROR en BORRAR_ESTUDIANTE: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

#--TALLER--
def ver_taller(id_taller):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL VER_TALLERES(?)}", (id_taller))
        row = cursor.fetchone()
        
        if row:
            resultado = {
                'id_taller': row[0],
                'year_proceso': row[1],
                'id_categoria': row[2],
                'nombre_taller': row[3],
                'id_departamento': row[4],
                'objetivo_taller': row[5],
                'fec_inicio': row[6].strftime('%Y-%m-%d') if row[6] else None,
                'fec_termino': row[7].strftime('%Y-%m-%d') if row[7] else None,
                'nro_minutos': row[8],
                'nro_clases_anual': row[9],
                'horas_totales': row[10],
                'id_estado_taller': row[11],
                'fec_estado_taller': row[12].strftime('%Y-%m-%d') if row[12] else None,
                'observacion': row[13],
                'lugar': row[14],
                'minimo_estudiante': row[15],
                'maximo_estudiante': row[16],
                'personas_inscritas': row[17],
                'requisito': row[18] if len(row) > 18 else '',
                'edad_minima': row[19] if len(row) > 19 else 0,
                'edad_maxima': row[20] if len(row) > 20 else 0,
                'material': row[21] if len(row) > 21 else '',
                'ind_tipo_taller': row[22],
                'id_profesor': row[23],
                'nombre_persona': row[24],
                'apellido_paterno': row[25],
                'apellido_materno': row[26],
                'edad': row[27],
                'genero': row[28],
                'profesion': row[29],
                'ind_activo': row[30],
                'aud_usuario_ingreso': row[31],
                'aud_fec_ingreso': row[32].strftime('%Y-%m-%d %H:%M:%S') if row[32] else None,
                'aud_usuario_modifica': row[33],
                'aud_fec_modifica': row[34].strftime('%Y-%m-%d %H:%M:%S') if row[34] else None
            }
            return resultado
        else:
            return None
    except Exception as e:
        print(f"Error en ver_taller: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def obtener_talleres(year_proceso=None, id_categoria=None, id_estado_taller=None, id_taller=None, lugar=None, nombre_taller=None):
    # print(f"DEBUG - : year_proceso{type(year_proceso)}, {(year_proceso)}")
    # print(f"DEBUG - : id_estado_taller{type(id_estado_taller)}, {(id_estado_taller)}")
    # print(f"DEBUG - : id_categoria{type(id_categoria)}, {(id_categoria)}")
    # print(f"DEBUG - : id_taller{type(id_taller)}, {(id_taller)}")
    # print(f"DEBUG - : lugar{type(lugar)}, {(lugar)}")
    # print(f"DEBUG - : nombre_taller{type(nombre_taller)}, {(nombre_taller)}")
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL LISTAR_TALLERES_FILTRADOS(?, ?, ?, ?, ?, ?)}",(year_proceso, id_categoria, id_estado_taller, id_taller, lugar, nombre_taller))
        columns = [c[0] for c in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error en obtener_talleres: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def obtener_estudiantes_por_taller(id_taller):
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL LISTAR_ESTUDIANTES_POR_TALLER(?)}", (id_taller))
        columns = [c[0] for c in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error en obtener_estudiantes_por_taller: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def buscar_talleres(nombre_taller=None, id_categoria=None, year_proceso=None, id_estado_Taller=None, limite=100): #limite infinito para probar
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL BUSCAR_TALLERES(?, ?, ?, ?)}",(nombre_taller, id_categoria, year_proceso, id_estado_Taller))
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error en obtener_talleres: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def ac_taller(id_taller, 
              year_proceso, 
              id_categoria,
              nombre_taller, 
              objetivo_taller, 
              fec_inicio, 
              fec_termino, 
              nro_minutos, 
              nro_clases_anual, 
              horas_totales, 
              id_estado_taller, 
              observacion, 
              lugar, 
              minimo_estudiante, 
              maximo_estudiante, 
              requisito, 
              edad_minima, 
              edad_maxima, 
              material, 
              ind_tipo_taller, 
              aud_usuario_modifica):
    conn = get_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        sql = "{CALL AC_TALLER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}"
        params = (
            id_taller, 
            year_proceso, 
            id_categoria, 
            nombre_taller, 
            objetivo_taller, 
            fec_inicio, 
            fec_termino, 
            nro_minutos, 
            nro_clases_anual, 
            horas_totales, 
            id_estado_taller, 
            observacion, 
            lugar, 
            minimo_estudiante, 
            maximo_estudiante, 
            requisito, 
            edad_minima, 
            edad_maxima, 
            material, 
            ind_tipo_taller, 
            aud_usuario_modifica
        )
        cursor.execute(sql, params)
        conn.commit()
        return True
    except Exception as e:
        print(f"Error en AC_TALLER: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def inscribir_el_taller(id_profesor,year_proceso,id_categoria,nombre_taller,objetivo_taller,fec_inicio,fec_termino,nro_minutos,nro_clases_anual,horas_totales,id_estado_taller,observacion,lugar,minimo_estudiante,maximo_estudiante,requisito,edad_minima,edad_maxima,material,ind_tipo_taller,aud_usuario_ingreso):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        sql = "{CALL INSCRIBIR_EL_TALLER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}"
        params = (
            id_profesor,year_proceso, id_categoria, nombre_taller, objetivo_taller,
            fec_inicio, fec_termino, nro_minutos, nro_clases_anual,
            horas_totales, id_estado_taller, observacion, lugar,
            minimo_estudiante, maximo_estudiante, requisito,
            edad_minima, edad_maxima, material, ind_tipo_taller,
            aud_usuario_ingreso
        )
        cursor.execute(sql, params)
        resultado = cursor.fetchone()
        conn.commit()
        return {
            "success": True,
            "message": "Taller creado exitosamente",
            "id_taller": resultado[0] if resultado else None
        }
    except Exception as e:
        print(f"Error en INSCRIBIR_EL_TALLER: {e}")
        conn.rollback()
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def cambiar_estado_taller_de_baja(id_taller, aud_usuario_modifica):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL DE_BAJA_ESTADO_TALLER(?, ?)}",
            (id_taller, aud_usuario_modifica)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Error en DE_BAJA_ESTADO_TALLER: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

#--TALLERISTA(ANTIGUAMENTE PROFESOR)--
def ver_profesor(id_profesor):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try: 
        cursor.execute("{CALL VER_PROFESOR(?)}", (id_profesor))
        row = cursor.fetchone()

        if row:
            profesor = {
                'id_persona' : row[0],
                'rut_persona' : row[1],
                'dv_persona' : row[2],
                'id_profesor' : row[3],
                'nombre_persona' : row[4],
                'apellido_paterno' : row[5],
                'apellido_materno' : row[6],
                'fec_nacimiento' : row[7].strftime('%Y-%m-%d') if row[7] else None,
                'edad' : row[8],
                'genero' : row[9],
                'telefono' : row[10],
                'telefono_contacto' : row[11],
                'nombre_contacto' : row[12],
                'correo_contacto' : row[13],
                'ind_activo' : row[14],
                'tipo_usuario' : row[15],
                'observacion' : row[16],
                'correo_electronico' : row[17],
                'calle' : row[18],
                'nro_calle' : row[19],
                'nro_block' : row[20],
                'nro_dpto' : row[21],
                'villa' : row[22],
                'id_comuna' : row[23],
                'id_pais' : row[24],
                'profesion' : row[25],
                'resumen_curricular' : row[26],
                'id_taller' : row[27],
                'nombre_taller' : row[28],
                'year_proceso' : row[29],
                'aud_usuario_ingreso' : row[30],
                'aud_fec_ingreso':row[31].strftime('%Y-%m-%d %H:%M:%S') if row[31] else None,
                'aud_usuario_modifica' : row[32],
                'aud_fec_modifica':row[33].strftime('%Y-%m-%d %H:%M:%S') if row[33] else None
            }
            return profesor
        else:
            print(f"DEBUG - No se encontro el profesor ID {id_profesor} o no existe en las 3 tablas")
            return None
    except Exception as e:
        print(f"Error en ver_profesor: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def obtener_profesores(id_profesor=None, nombre_completo=None, id_taller=None, nombre_taller=None, profesion=None, correo_electronico=None):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor  = conn.cursor()
    try:
        cursor.execute("{CALL LISTAR_TALLERISTAS_FILTRADOS(?, ?, ?, ?, ?, ?)}",(id_profesor,nombre_completo,id_taller,nombre_taller,profesion,correo_electronico))
        columns = [c[0] for c in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error en la obtener_profesores: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def ac_profesor(id_profesor, nombre_persona, apellido_paterno, apellido_materno, genero,
                telefono, correo_electronico, telefono_contacto, nombre_contacto, correo_contacto,
                profesion, resumen_curricular, ind_activo, observacion, id_pais, id_comuna,
                villa, nro_dpto, nro_block, nro_calle, calle,
                aud_usuario_modifica_pt, aud_usuario_modifica_p):
    conn = get_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL AC_TALLERISTAS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}",
                    (id_profesor, nombre_persona, apellido_paterno, apellido_materno, genero,
                    telefono, correo_electronico, telefono_contacto, nombre_contacto, correo_contacto,
                    profesion, resumen_curricular, ind_activo, observacion, id_pais, id_comuna,
                    villa, nro_dpto, nro_block, nro_calle, calle,
                    aud_usuario_modifica_pt, aud_usuario_modifica_p))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error en AC_TALLERISTAS: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# def inscribir_profesores(id_persona, profesion, resumen_curricular, aud_usuario_ingreso):
#     conn = get_connection()
#     if not conn:
#         return {"success": False, "message": "Error de conexión"}
#     cursor = conn.cursor()
#     try:
#         cursor.execute("{CALL INSCRIBIR_TALLERISTAS(?, ?, ?, ?)}",
#             (id_persona, profesion, resumen_curricular, aud_usuario_ingreso)
#         )
#         conn.commit()
#         return True
#     except Exception as e:
#         print(f"Error en INSCRIBIR_TALLERISTAS: {e}")
#         conn.rollback()
#         return {"success": False, "message": str(e)}
#     finally:
#         cursor.close()
#         conn.close()

def inscribir_talleristas(pi_rut_profesor,pi_dv_profesor,pi_nombre_profesor,pi_apellido_paterno,pi_apellido_materno,
                          pi_fec_nacimiento,
                          pi_genero,pi_nro_calle,pi_nro_block,pi_nro_dpto,
                        pi_calle,pi_villa,pi_id_comuna,pi_id_pais,pi_telefono,pi_correo_electronico,pi_nombre_contacto,pi_telefono_contacto,pi_correo_contacto,pi_observacion,
                        pi_id_usuario,pi_profesion,pi_resumen_curricular):
    # print(f"DEBUG - : pi_rut_profesor{type(pi_rut_profesor)}, {(pi_rut_profesor)}")
    # print(f"DEBUG - : pi_nombre_profesor{type(pi_nombre_profesor)}, {(pi_nombre_profesor)}")
    # print(f"DEBUG - : pi_dv_profesor{type(pi_dv_profesor)}, {(pi_dv_profesor)}")
    # print(f"DEBUG - : pi_apellido_paterno{type(pi_apellido_paterno)}, {(pi_apellido_paterno)}")
    # print(f"DEBUG - : pi_apellido_materno{type(pi_apellido_materno)}, {(pi_apellido_materno)}")
    # print(f"DEBUG - : pi_genero{type(pi_genero)}, {(pi_genero)}")
    # print(f"DEBUG - : pi_fec_nacimiento{type(pi_fec_nacimiento)}, {(pi_fec_nacimiento)}")
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL INSCRIBIR_TALLERISTAS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}",
        (
        pi_rut_profesor, 
        pi_dv_profesor, 
        pi_nombre_profesor,
        pi_apellido_paterno,
        pi_apellido_materno,
        pi_fec_nacimiento,
        pi_genero,
        pi_nro_calle,
        pi_nro_block,
        pi_nro_dpto,
        pi_calle,
        pi_villa,
        pi_id_comuna,
        pi_id_pais,
        pi_telefono,
        pi_correo_electronico,
        pi_nombre_contacto,
        pi_telefono_contacto,
        pi_correo_contacto,
        pi_observacion,
        pi_id_usuario,
        pi_profesion,
        pi_resumen_curricular))
        conn.commit()
        return {"success": True, "message": "Tallerista creado exitosamente"}
    except Exception as e:
        print(f"Error en INSCRIBIR_TALLERISTAS: {e}")
        conn.rollback()
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def suspender_tallerista(id_profesor,aud_usuario_modifica):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL SUSPENDER_TALLERISTA(?,?)}",
        (
        id_profesor, 
        aud_usuario_modifica))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error en SUSPENDER_TALLERISTA: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def obtener_historial_talleres_por_tallerista(id_profesor):
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL OBTENER_HISTORIAL_TALLERES_TALLERISTA(?)}", (id_profesor,))
        columns = [column[0] for column in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error en obtener_historial_talleres_por_tallerista: {e}")
        return []
    finally:
        cursor.close()
        conn.close()


def obtener_estudiantes_por_taller_proc(id_taller):
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL OBTENER_ESTUDIANTES_POR_TALLER(?)}", (id_taller,))
        columns = [column[0] for column in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error en obtener_estudiantes_por_taller_proc: {e}")
        return []
    finally:
        cursor.close()
        conn.close()
#--AQUI TERMINA--