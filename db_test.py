from ast import Param
import functools,pyodbc,datetime,traceback
from flask import flash, redirect, request, session, url_for

from configuracion import DB_DRIVER, DB_NAME, DB_PWD, DB_SERVER, DB_UID

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

#--FUNCIONARIO(ANTIGUAMENTE ESTUDIANTE)--
def ver_estudiante(id_estudiante): #ESTO DEBERIA SOLUCIONAR LOS PROBLEMAS CON LAS FECHAS TODAS RANCIAS
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL VER_ESTUDIANTE(?)}", (id_estudiante,))
        row = cursor.fetchone()
        if not row:
            return None
        # for i, value in enumerate(row):
        #     print(i, value, type(value))
        resultado = {
            'id_persona': row[0],
            'rut_persona': row[1],
            'dv_persona': row[2],
            'pasaporte': row[3],
            'id_estudiante': row[4],
            'nombre_persona': row[5],
            'apellido_paterno': row[6],
            'apellido_materno': row[7],
            'fec_nacimiento': row[8].strftime('%Y-%m-%d') if row[8] else None,
            'edad': row[9],
            'genero': row[10],
            'telefono': row[11],
            'telefono_contacto': row[12],
            'nombre_contacto': row[13],
            'correo_contacto': row[14],
            'observacion': row[15],
            'correo_electronico': row[16],
            'calle': row[17],
            'nro_calle': row[18],
            'nro_block': row[19],
            'nro_dpto': row[20],
            'villa': row[21],
            'id_comuna': row[22],
            'id_pais': row[23],
            'id_taller': row[24],
            'nombre_taller': row[25],
            'year_proceso': row[26],
            'pronom_estudiante': row[27],
            'fec_inscripcion': row[28].strftime('%Y-%m-%d %H:%M:%S') if row[28] else None,
            'fec_retiro': row[29].strftime('%Y-%m-%d %H:%M:%S') if row[29] else None,
            'fec_reincorporacion': row[30].strftime('%Y-%m-%d %H:%M:%S') if row[30] else None,
            'aud_usuario_ingreso_estudiante': row[31] if len(row) > 31 else None,
            'aud_fec_ingreso_estudiante': row[32].strftime('%Y-%m-%d %H:%M:%S') if len(row) > 32 and row[32] else None,
            'aud_usuario_ingreso_persona': row[33] if len(row) > 33 else None,
            'aud_fec_ingreso_persona': row[34].strftime('%Y-%m-%d %H:%M:%S') if len(row) > 34 and row[34] else None,
            'aud_usuario_modifica_persona': row[35] if len(row) > 35 else None,
            'aud_fec_modifica_persona': row[36].strftime('%Y-%m-%d %H:%M:%S') if len(row) > 36 and row[36] else None,
            'aud_usuario_ingreso_integrante_estudiante': row[37] if len(row) > 37 else None,
            'aud_fec_ingreso_integrante_estudiante': row[38].strftime('%Y-%m-%d %H:%M:%S') if len(row) > 38 and row[38] else None,
            'aud_usuario_modifica_integrante_estudiante': row[39] if len(row) > 39 else None,
            'aud_fec_modifica_integrante_estudiante': row[40].strftime('%Y-%m-%d %H:%M:%S') if len(row) > 40 and row[40] else None
        }
        return resultado
    except Exception as e:
        print(f"Error en VER_ESTUDIANTE: {e}")
        traceback.print_exc()
        return None
    finally:
        cursor.close()
        conn.close()

def obtener_estudiantes(id_estudiante=None, nombre_taller=None, year_proceso=None, nombre_completo=None, correo_electronico=None, ind_estado_integrante=None): 
    # lo mismo de arriba pero ahora son estudiants , profesores podran ver a su clase con esto
    # se tiene que actualizar con un procedimiento
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL LISTAR_ESTUDIANTES(?,?,?,?,?,?)}",(id_estudiante, nombre_taller, year_proceso, nombre_completo, correo_electronico, ind_estado_integrante))
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

def ac_estudiante(id_estudiante=None,nombre_persona=None,apellido_paterno=None,apellido_materno=None,pronom_estudiante=None,genero=None,telefono=None,correo_electronico=None,telefono_contacto=None,nombre_contacto=None,
                  correo_contacto=None,observacion=None,ind_estado_integrante=None,id_pais=None,id_comuna=None,villa=None,nro_dpto=None,nro_block=None,nro_calle=None,calle=None,fec_ingreso=None,fec_retiro=None,
                  fec_reincorporacion=None,aud_usuario_modifica=None):
    conn = get_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL AC_TALLERISTAS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}",
            (id_estudiante,nombre_persona,apellido_paterno,apellido_materno,pronom_estudiante,genero,telefono,correo_electronico,telefono_contacto,nombre_contacto,correo_contacto,observacion,ind_estado_integrante,id_pais,
            id_comuna,villa,nro_dpto,nro_block,nro_calle,calle,fec_ingreso,fec_retiro,fec_reincorporacion,aud_usuario_modifica))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error en AC_ESTUDIANTE: {e}")
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
        cursor.execute("{CALL VER_TALLERES(?)}", (id_taller,))
        rows = cursor.fetchall()
        if not rows:
            return None
        first = rows[0]
        # for i, value in enumerate(first):
        #     print(i, value, type(value))
        taller = {
            'id_taller': first[0],
            'year_proceso': first[1],
            'id_categoria': first[2],
            'nombre_taller': first[3],
            'id_departamento': first[4],
            'objetivo_taller': first[5],
            'fec_inicio': first[6].strftime('%Y-%m-%d') if first[6] else None,
            'fec_termino': first[7].strftime('%Y-%m-%d') if first[7] else None,
            'nro_minutos': first[8],
            'nro_clases_anual': first[9],
            'horas_totales': first[10],
            'id_estado_taller': first[11],
            'fec_estado_taller': first[12].strftime('%Y-%m-%d') if first[12] else None,
            'observacion': first[13],
            'lugar': first[14],
            'minimo_estudiante': first[15],
            'maximo_estudiante': first[16],
            'personas_inscritas': first[17],
            'requisito': first[18] if len(first) > 18 else '',
            'edad_minima': first[19] if len(first) > 19 else 0,
            'edad_maxima': first[20] if len(first) > 20 else 0,
            'material': first[21] if len(first) > 21 else '',
            'ind_tipo_taller': first[22],
            'aud_usuario_ingreso_taller': first[30],
            'aud_fec_ingreso_taller': first[31].strftime('%Y-%m-%d %H:%M:%S') if first[31] else None,
            'aud_usuario_modifica_taller': first[32],
            'aud_fec_modifica_taller': first[33].strftime('%Y-%m-%d %H:%M:%S') if first[33] else None,
            'aud_usuario_ingreso_gestion': first[34],
            'aud_fec_ingreso_gestion': first[35].strftime('%Y-%m-%d %H:%M:%S') if first[35] else None,
        }
        profesores = []
        for row in rows:
            profesor = {
                'id_profesor': row[23],
                'nombre_persona': row[24],
                'apellido_paterno': row[25],
                'apellido_materno': row[26],
                'edad': row[27],
                'genero': row[28],
                'profesion': row[29],
            }
            if not any(p['id_profesor'] == profesor['id_profesor'] for p in profesores):
                profesores.append(profesor)
        taller['profesores'] = profesores
        return taller
    except Exception as e:
        print(f"Error en ver_taller: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

def obtener_talleres(year_proceso=None, id_categoria=None, id_estado_taller=None, id_taller=None, lugar=None, nombre_taller=None):
    conn = get_connection()
    if not conn:
        return {"success": False, "message": "Error de conexión"}
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

def ac_taller(id_profesor,
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
              aud_usuario_modifica):
    conn = get_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        sql = "{CALL AC_TALLER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}"
        params = (
            id_profesor,
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
        traceback.print_exc()
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
        traceback.print_exc()
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
        cursor.execute("{CALL VER_PROFESOR(?)}", (id_profesor,))
        rows = cursor.fetchall()
        if not rows:
            return None
        first = rows[0]
        # for i, value in enumerate(first):
        #     print(i, value)
        profesor = {
            'id_persona' : first[0],
            'rut_persona' : first[1],
            'dv_persona' : first[2],
            'id_profesor' : first[3],
            'nombre_persona' : first[4],
            'apellido_paterno' : first[5],
            'apellido_materno' : first[6],
            'fec_nacimiento' : first[7].strftime('%Y-%m-%d') if first[7] else None,
            'edad' : first[8],
            'genero' : first[9],
            'telefono' : first[10],
            'telefono_contacto' : first[11],
            'nombre_contacto' : first[12],
            'correo_contacto' : first[13],
            'observacion' : first[14],
            'correo_electronico' : first[15],
            'calle' : first[16],
            'nro_calle' : first[17],
            'nro_block' : first[18],
            'nro_dpto' : first[19],
            'villa' : first[20],
            'id_comuna' : first[21],
            'id_pais' : first[22],
            'profesion' : first[23],
            'resumen_curricular' : first[24],
            'aud_usuario_ingreso_profesor' : first[29] if len(first) > 29 else None,
            'aud_fec_ingreso_profesor': first[30].strftime('%Y-%m-%d %H:%M:%S') if len(first) > 30 and first[30] else None,
            'aud_usuario_modifica_profesor' : first[31] if len(first) > 31 else None,
            'aud_fec_modifica_profesor': first[32].strftime('%Y-%m-%d %H:%M:%S') if len(first) > 32 and first[32] else None,
            'aud_usuario_ingreso_persona' : first[33] if len(first) > 33 else None,
            'aud_fec_ingreso_persona': first[34].strftime('%Y-%m-%d %H:%M:%S') if len(first) > 34 and first[34] else None,
            'aud_usuario_modifica_persona' : first[35] if len(first) > 35 else None,
            'aud_fec_modifica_persona': first[36].strftime('%Y-%m-%d %H:%M:%S') if len(first) > 36 and first[36] else None,
            'aud_usuario_ingreso_gestion_profesor' : first[37] if len(first) > 37 else None,
            'aud_fec_ingreso_gestion_profesor': first[38].strftime('%Y-%m-%d %H:%M:%S') if len(first) > 38 and first[38] else None
        }
        talleres = []
        for row in rows:
            taller = {
                'id_taller' : row[25],
                'nombre_taller' : row[26],
                'year_proceso' : row[27],
                'id_estado_taller' : row[28]
            }
            if not any(p['id_taller'] == taller['id_taller'] for p in talleres):
                talleres.append(taller)
        profesor['talleres'] = talleres
        return profesor
    except Exception as e:
        print(f"Error en ver_profesor: {e}")
        traceback.print_exc()
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
                profesion, resumen_curricular, observacion, id_pais, id_comuna,
                villa, nro_dpto, nro_block, nro_calle, calle,
                aud_usuario_modifica_pt, aud_usuario_modifica_p):
    conn = get_connection()
    if not conn:
        return False
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL AC_TALLERISTAS(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}",
                    (id_profesor, nombre_persona, apellido_paterno, apellido_materno, genero,
                    telefono, correo_electronico, telefono_contacto, nombre_contacto, correo_contacto,
                    profesion, resumen_curricular, observacion, id_pais, id_comuna,
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

def inscribir_talleristas(pi_rut_profesor,pi_dv_profesor,pi_nombre_profesor,pi_apellido_paterno,pi_apellido_materno,
                          pi_fec_nacimiento,pi_genero,pi_nro_calle,pi_nro_block,pi_nro_dpto,pi_calle,pi_villa,pi_id_comuna,
                          pi_id_pais,pi_telefono,pi_correo_electronico,pi_nombre_contacto,pi_telefono_contacto,
                          pi_correo_contacto,pi_observacion,pi_id_usuario,pi_profesion,pi_resumen_curricular):
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

#--EXTRAS--
def obtener_paises(id_pais=None,nombre_pais=None):
    conn = get_connection()
    if not conn:
        return []
    cursor = conn.cursor()
    try:
        cursor.execute("{CALL LISTAR_PAISES(?, ?)}",(id_pais,nombre_pais))
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error en obtener_paises: {e}")
        return []
    finally:
        cursor.close()
        conn.close()
#--AQUI TERMINA--