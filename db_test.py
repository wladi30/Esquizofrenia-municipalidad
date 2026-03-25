from ast import Param
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
def autenticar(rut_numerico, dv, password):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexion a la base de datos"}
    cursor = conn.cursor()
    try:
        import hashlib
        contrasena_hash = hashlib.sha256(password.encode()).hexdigest()
        query = """
        SELECT TOP 1
            P.ID_PERSONA,
            P.NOMBRE_PERSONA,
            P.APELLIDO_PATERNO,
            P.APELLIDO_MATERNO,
            P.CORREO_ELECTRONICO,
            P.TIPO_USUARIO,
            P.RUT_PERSONA,
            P.DV_PERSONA
        FROM SGT_PERSONA_TALLER P
        WHERE P.RUT_PERSONA = ?
            AND LOWER(P.DV_PERSONA) = LOWER(?)
            AND P.CONTRASENA_HASH = ?
            AND P.IND_ACTIVO = 1
        """
        print(f"DEBUG BD - Bsucando la persona: rut={rut_numerico}, dv={dv}") #probando si llega hasta aqui
        cursor.execute(query, (rut_numerico,dv,contrasena_hash))
        row = cursor.fetchone()
        if row:
            nombre_completo = f"{row[1]} {row[2]} {row[3]}".strip()
            return {
                "success": True,
                "message": "Autenticacion exitosa",
                "datos":{
                    "ID_PERSONA": row[0],
                    "NOMBRE_COMPLETO": nombre_completo,
                    "CORREO_ELECTRONICO": row[4],
                    "TIPO_USUARIO": row[5],
                    "RUT_PERSONA": row[6],
                    "DV_PERSONA": row[7]
                }
            }
        else:
            print("DEBUG - hola esto es para probar si tenemos un problema con las cosas del usuario, usuario no encontrado")
            check_query = "SELECT COUNT (*) FROM SGT_PERSONA_TALLER WHERE RUT_PERSONA = ? AND LOWER(DV_PERSONA) = LOWER(?)"
            cursor.execute(check_query, (rut_numerico, dv))
            count = cursor.fetchone()[0]
            if count > 0:
                print("DEBUG BD - El usuario existe pero la contraseña es incorrecta")
            else:
                print("DEBUG BD - El usuario no existe en la BD")
            return {"success": False, "message": "RUT o contraseña incorrectos"}
    except Exception as e:
        print(f"error en autenticacion: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "message": "error in the servidor causas"}
    finally:
        cursor.close()
        conn.close()

def autenticar_usuario(identificador, password):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("EXEC autenticar ?, ?", (identificador, password))
    resultado = cursor.fetchone()
    if resultado and resultado[0] == 1:
        cursor.execute("""
            SELECT ID_PERSONA, NOMBRE_PERSONA, APELLIDO_PATERNO, 
                   CORREO_ELECTRONICO, TIPO_USUARIO
            FROM SGT_PERSONA_TALLER 
            WHERE RUT_PERSONA = ?
        """)
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if user:
            id_rol = None
            if user[4] == 'FUNCIONARIO':
                cur2 = conn.cursor()
                cur2.execute("SELECT ID_PERSONA FROM SGT_PERSONA_TALLER WHERE ID_PERSONA = ?", (user[0],))
                rol = cur2.fetchone()
                id_rol = rol[0] if rol else None
                cur2.close()
            elif user[4] == 'ADMIN':
                cur2 = conn.cursor()
                cur2.execute("SELECT ID_PERSONA FROM SGT_PERSONA_TALLER WHERE ID_PERSONA = ?", (user[0],))
                rol = cur2.fetchone()
                id_rol = rol[0] if rol else None
                cur2.close()
            return {
                'success': True,
                'id_persona': user[0],
                'nombre': user[1],
                'apellido': user[2],
                'nombre_completo': f"{user[1]} {user[2] or ''}".strip(),
                'email': user[3],
                'tipo_usuario': user[4],
                'id_rol': id_rol
            }
    cursor.close()
    conn.close()
    return {"success": False, "message": "Credenciales incorrectas"}

def autenticar_usuario_simple(identificador, contrasena):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        import hashlib
        contrasena_hash = hashlib.sha256(contrasena.encode()).hexdigest()
        query = f"""
        SELECT TOP 1 
            P.ID_PERSONA,
            P.RUT_PERSONA,
            P.DV_PERSONA,
            P.NOMBRE_PERSONA,
            P.APELLIDO_PATERNO,
            P.APELLIDO_MATERNO,
            P.CORREO_ELECTRONICO,
            P.TIPO_USUARIO,
            ISNULL(E.ID_ESTUDIANTE, PR.ID_PROFESOR) AS ID_ROL
        FROM SGT_PERSONA P
        LEFT JOIN SGT_ESTUDIANTE E ON P.ID_PERSONA = E.ID_PERSONA
        LEFT JOIN SGT_PROFESOR PR ON P.ID_PERSONA = PR.ID_PERSONA
        WHERE (P.RUT_PERSONA = TRY_CAST('{identificador}' AS NUMERIC) 
               OR P.CORREO_ELECTRONICO = '{identificador}')
          AND P.CONTRASENA_HASH = '{contrasena_hash}'
          AND P.IND_ACTIVO = 1
        """
        cursor.execute(query)
        row = cursor.fetchone()
        if row:
            nombre_completo = f"{row[3]} {row[4]} {row[5]}".strip()
            return {
                "success": True,
                "message": "Autenticación exitosa",
                "datos": {
                    "ID_PERSONA": row[0],
                    "RUT_PERSONA": row[1],
                    "DV_PERSONA": row[2],
                    "NOMBRE_COMPLETO": nombre_completo,
                    "CORREO_ELECTRONICO": row[6],
                    "TIPO_USUARIO": row[7],
                    "ID_ROL": row[8]
                }
            }
        else:
            return {"success": False, "message": "Usuario o contraseña incorrectos"}  
    except Exception as e:
        print(f"Error en autenticación: {e}")
        return {"success": False, "message": "Error en el servidor"}
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

def crear_persona(rut,dv,nombre_persona,apellido_paterno,apellido_materno,correo,telefono,contrasena,tipo_usuario):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexion"}
    cursor = conn.cursor()
    try:
        import hashlib
        contrasena_hash = hashlib.sha256(contrasena.encode()).hexdigest()
        query = f"""
        INSERT INTO SGT_PERSONA_TALLER (RUT_PERSONA, DV_PERSONA, NOMBRE_PERSONA, APELLIDO_PATERNO, APELLIDO_MATERNO, CORREO_ELECTRONICO, TELEFONO, CONTRASENA_HASH,TIPO_USUARIO, IND_ACTIVO, AUD_USUARIO_INGRESO, AUD_FEC_INGRESO) 
        VALUES ({rut}, '{dv}', '{nombre_persona}', '{apellido_paterno}', '{apellido_materno}', '{correo}', '{telefono}', '{contrasena_hash}', '{tipo_usuario}', 1, 'sistema', GETDATE())
        SELECT SCOPE_IDENTITY() AS ID_PERSONA
        """
        cursor.execute(query)
        id_persona = cursor.fetchone()[0]
        conn.commit()
        return {
            "success": True,
            "message": "Persona creada exitosamente",
            "id_persona": id_persona
        }
    except Exception as e:
        conn.rollback()
        print(f"Error creando persona: {e}")
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

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

def inscribir_taller_o_espera(id_taller, id_estudiante, year_proceso):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        print(f"DEBUG - Ejecutando INSCRIBIR_TALLER_O_ESPERA({id_taller}, {id_estudiante}, {year_proceso})")
        cursor.execute(f"{{CALL INSCRIBIR_TALLER_O_ESPERA({id_taller}, {id_estudiante}, {year_proceso})}}")
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
        return None
    cursor = conn.cursor()
    try:
        print(f"DEBUG - Consultando taller ID: {id_taller}")
        query = f"""
        SELECT 
            T.ID_TALLER,
            T.ID_CATEGORIA,
            T.NOMBRE_TALLER,
            T.ID_DEPARTAMENTO,
            T.OBJETIVO_TALLER,
            T.FEC_INICIO,
            T.FEC_TERMINO,
            T.NRO_MINUTOS,
            T.NRO_CLASES_ANUAL,
            T.HORAS_TOTALES,
            T.ID_ESTADO_TALLER,
            T.FEC_ESTADO_TALLER,
            T.OBSERVACION,
            T.LUGAR,
            T.MINIMO_ESTUDIANTE,
            T.MAXIMO_ESTUDIANTE,
            ISNULL((
                SELECT COUNT(*) 
                FROM SGT_INTEGRANTE_TALLER E 
                WHERE E.ID_TALLER = T.ID_TALLER 
                AND E.IND_ESTADO_INTEGRANTE = 1
            ), 0) as personas_inscritas,
            T.REQUISITO,
            T.EDAD_MINIMA,
            T.EDAD_MAXIMA,
            T.MATERIAL
        FROM SGT_TALLER T
        WHERE T.ID_TALLER = {id_taller}
          AND T.ID_ESTADO_TALLER IN (1,2,3,4)
        """
        cursor.execute(query)
        row = cursor.fetchone()
        if row:
            #print(f"DEBUG - Taller encontrado: ID={row[0]}, Nombre={row[2]}")
            resultado = {
                'id_taller': row[0],
                'id_categoria': row[1],
                'nombre_taller': row[2],
                'id_departamento': row[3],
                'objetivo_taller': row[4],
                'fec_inicio': row[5].strftime('%Y-%m-%d') if row[5] else None,
                'fec_termino': row[6].strftime('%Y-%m-%d') if row[6] else None,
                'nro_minutos': row[7],
                'nro_clases_anual': row[8],
                'horas_totales': row[9],
                'id_estado_taller': row[10],
                'fec_estado_taller': row[11].strftime('%Y-%m-%d') if row[11] else None,
                'observacion': row[12],
                'lugar': row[13],
                'minimo_estudiante': row[14],
                'maximo_estudiante': row[15],
                'personas_inscritas': row[16],
                'requisito': row[17] if len(row) > 17 else '',
                'edad_minima': row[18] if len(row) > 18 else 0,
                'edad_maxima': row[19] if len(row) > 19 else 0,
                'material': row[20] if len(row) > 20 else ''
            }
            return resultado
        else:
            print(f"DEBUG - No se encontró el taller ID {id_taller} o no está activo")
            return None
    except Exception as e:
        print(f"Error en ver_taller: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return None
    finally:
        cursor.close()
        conn.close()

def obtener_talleres(año=None, estados=None, id_categoria=None): #esto deberia hacer que los talleres se filtren por año, la idea es que el admin puedan modificar ese año asi de este modo se pueden los talleres anteriores
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try: # falta revisar esto mejor, no se porque params no esta funcionando, tengo que importarlo de algo ?
        sql = "SELECT * FROM SGT_TALLER WHERE 1=1"
        # buena cosa tuvo de idea deep seak asi que la aplique
        parametros = []
        if año is not None:
            sql += " AND YEAR_PROCESO = ?"
            parametros.append(año)
        if estados:
            placeholders = ','.join(['?'] * len(estados))
            sql += f" AND ID_ESTADO_TALLER IN ({placeholders})"
            parametros.extend(estados)
        # añadi el tema de buscar por categoria(GUTS) espermos que funcione
        if id_categoria:
            sql += f" AND ID_CATEGORIA = ?"
            parametros.append(id_categoria)
        cursor.execute(sql, parametros)
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error obteniendo talleres: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def obtener_estudiantes_por_taller(id_taller): #mas que nada para el admin, aun queda mucho por hacer pero vamos progresando
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor() # 12/03-- le quite que filtrara por id, es redundante ya que se esta obteniendo un taller en especifico, por lo cual no seran tantas personas como para tener que filtrar por quien esta activo y no
    try:
        sql = "SELECT pe.NOMBRE_PERSONA, pe.APELLIDO_PATERNO, pe.APELLIDO_MATERNO, pe.EDAD, pe.TELEFONO, pe.CORREO_ELECTRONICO FROM SGT_INTEGRANTE_TALLER it JOIN SGT_PERSONA_TALLER pe ON it.ID_ESTUDIANTE = pe.ID_PERSONA WHERE it.ID_TALLER = ?"
        cursor.execute(sql, (id_taller,))
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error obteniendo estudiantes de taller: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def buscar_talleres(termino, categoria=None, año=None, estados=None, limite=999): #limite infinito para probar
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        palabras = [p for p in (termino or '').split() if p]
        donde = []
        parametros = []
        
        if palabras:
            for p in palabras:
                donde.append(f"NOMBRE_TALLER LIKE '%{p}%'")
        if categoria:
            donde.append(f"ID_CATEGORIA = {categoria}")
        if año:
            donde.append(f"YEAR_PROCESO = {año}")
        if estados:
            placeholders = ','.join(str(e) for e in estados)
            donde.append(f"ID_ESTADO_TALLER IN ({placeholders})")
        sql = "SELECT TOP(?) * FROM SGT_TALLER"
        if donde:
            sql += " WHERE " + " AND ".join(donde)
        sql += " ORDER BY FEC_INICIO DESC"
        
        cursor.execute(sql, (limite,))
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error buscando talleres: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def ac_taller(id_taller,id_estado_taller,fec_estado_taller,observacion,aud_usuario_ingreso,aud_fec_ingreso,aud_usuario_modifica,aud_fec_modifica):
     conn = get_connection()
     if not conn:
          return False
     cursor = conn.cursor()
     try:
          fec_estado_taller_str = f"'{fec_estado_taller}'" if fec_estado_taller else "NULL"
          aud_fec_ingreso_str = f"'{aud_fec_ingreso}'" if aud_fec_ingreso else "NULL"
          aud_fec_modifica_str = f"'{aud_fec_modifica}'" if aud_fec_modifica else "NULL"
          query=f"""{{CALL AC_TALLER({id_taller},{id_estado_taller},{fec_estado_taller_str},'{observacion}','{aud_usuario_ingreso}',{aud_fec_ingreso},'{aud_usuario_modifica}',{aud_fec_modifica})}}"""
          cursor.execute(query)
          return True
     except Exception as e:
          print(f"Error en AC_TALLER. revisa las urls o la ID: {e}")
          conn.rollback()
          return False
     finally:
          cursor.close()
          conn.close()

def inscribir_el_taller(year_proceso, id_categoria, nombre_taller, id_departamento,objetivo_taller, fec_inicio, fec_termino, nro_minutos,nro_clases_anual,horas_totales,id_estado_taller,lugar,minimo_estudiante,maximo_estudiante,requisito,edad_minima,edad_maxima, material, ind_tipo_taller):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        query = f"""{{CALL INSCRIBIR_EL_TALLER({year_proceso}, {id_categoria}, '{nombre_taller}', {id_departamento},'{objetivo_taller}', '{fec_inicio}', '{fec_termino}', {nro_minutos},{nro_clases_anual}, {horas_totales}, {id_estado_taller}, GETDATE(),'-', '{lugar}', {minimo_estudiante}, {maximo_estudiante},'{requisito}', {edad_minima}, {edad_maxima}, '{material}',{ind_tipo_taller}, '', '1900-01-01 00:00:00.000','', '1900-01-01 00:00:00.000')}}"""
        cursor.execute(query)
        resultado = cursor.fetchone()
        conn.commit()
        return {
            "success": True,
            "message": "Taller creado exitosamente",
            "id_taller": resultado[0] if resultado else None,
            "nombre_taller": resultado[1] if resultado else nombre_taller
        }
    except Exception as e:
        print(f"Error en INSCRIBIR_EL_TALLER: {e}")
        conn.rollback()
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def borrar_taller(id_taller):
     conn = get_connection()
     if not conn:
           return False
     cursor = conn.cursor()
     try:
          cursor.execute(f"{{CALL BORRAR_TALLER({id_taller})}}")
          conn.commit()
          return True
     except Exception as e:
          print(f"Error en BORRAR_TALLER: {e}")
          conn.rollback()
          return False
     finally:
          cursor.close()
          conn.close()

#--TALLERISTA(ANTIGUAMENTE PROFESOR)--
def ver_profesor(id_profesor):
     conn = get_connection()
     if not conn:
          return None
     cursor = conn.cursor()
     try:
          cursor.execute(f'{{CALL VER_PROFESOR({id_profesor})}}')
          resultados=[]
          for row in cursor:
               profesor={
                    'id_profesor': row[0],
                    'profesion':row[1],
                    'resumen_curricular':row[2],
                    'aud_fec_ingreso':row[3].strftime('%Y-%m-%d %H:%M:%S') if row[3] else None,
                    'aud_fec_modifica':row[4].strftime('%Y-%m-%d %H:%M:%S') if row[4] else None,
               }
          resultados.append(profesor)
          return resultados
     except Exception as e:
          print(f"Error en VER_PROFESOR. revisa las urls o la ID: {e}")
          return None
     finally:
          cursor.close()
          conn.close()

def obtener_profesores():
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        sql = "SELECT p.ID_PROFESOR, pe.ID_PERSONA, pe.NOMBRE_PERSONA, pe.APELLIDO_PATERNO, pe.APELLIDO_MATERNO, pe.CORREO_ELECTRONICO FROM SGT_PROFESOR p JOIN SGT_PERSONA_TALLER pe ON p.ID_PERSONA = pe.ID_PERSONA"
        cursor.execute(sql)
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error obteniendo profesores: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def ac_profesor(id_persona,profesion,resumen_curricular,aud_usuario_ingreso,aud_fec_ingreso,aud_usuario_modifica,aud_fec_modifica):
    conn = get_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        aud_fec_ingreso_str = f"'{aud_fec_ingreso}'" if aud_fec_ingreso else "NULL"
        aud_fec_modifica_str = f"'{aud_fec_modifica}'" if aud_fec_modifica else "NULL"
        query = f"""{{CALL AC_TALLERISTAS({id_persona}, '{profesion}', '{resumen_curricular}','{aud_usuario_ingreso}', {aud_fec_ingreso_str},'{aud_usuario_modifica}', {aud_fec_modifica_str})}}"""
        cursor.execute(query)
        conn.commit()
        return True
    except Exception as e:
        print(f"Error en AC_TALLERISTAS: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def inscribir_profesores(id_persona,profesion,resumen_curricular):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        query = f"""{{CALL INSCRIBIR_TALLERISTAS({id_persona}, '{profesion}', '{resumen_curricular}','', '1900-01-01 00:00:00.000', '', '1900-01-01 00:00:00.000')}}"""
        cursor.execute(query)
        resultado = cursor.fetchone()
        conn.commit()
        return {
            "success": True,
            "message": "Profesor creado exitosamente",
            "id_profesor": resultado[0] if resultado else None,
            "id_persona": resultado[1] if resultado else id_persona
        }
    except Exception as e:
        print(f"Error en INSCRIBIR_TALLERISTAS: {e}")
        conn.rollback()
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def borrar_profesor(id_profesor):
    conn = get_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        cursor.execute(f"{{CALL BORRAR_PROFESOR({id_profesor})}}")
        conn.commit()
        return True
    except Exception as e:
        print(f"Error en BORRAR_PROFESOR: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()
#--AQUI TERMINA--