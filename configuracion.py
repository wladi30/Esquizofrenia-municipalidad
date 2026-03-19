import os
from datetime import timedelta
from pathlib import Path

DB_DRIVER = "ODBC Driver 18 for SQL Server" 
DB_SERVER = "SRV-SQDES" 
DB_NAME = "GESTION_TALLER"
DB_UID = "tallertest"
DB_PWD = "tallertest"

DIR_BASE = Path(__file__).resolve().parent.parent # es la ruta raiz de todo el pryecto, la idea es que se pase por este archivo todas las rutas

# secret_key = os.environ.get('secret_key') or 'taller-test' # en este caso le pongo la secret key con un or para que no tenga problemas con las cookies en el futuro

permanent_session_lifetime = timedelta(minutes=10) # se explica solo

# no es necesario pero lo hice de este modo para normalizarlo segun una guia que vi
BD_DRIVER = DB_DRIVER or "ODBC Driver 18 for SQL Server"
BD_SERVER = DB_SERVER or "SRV-SQDES"
BD_NAME = DB_NAME or 'GESTION_TALLER'
BD_USR = DB_UID or 'tallertest'
BD_CTS = DB_PWD or 'tallertest'

# aqui se esta definiendo las carpetas de las cuales seran bases tanto los sistemas del proyecto como el js css y html en teemplates
static_folder = 'static'
templates_folder = 'templates'
logs_folder = os.path.join(DIR_BASE, 'logs') #un archivo para guardar los logs que hare despues

# logs de login , generales y de errores
log_level = os.environ.get('log_level') or 'info'
log_file = os.path.join(logs_folder, 'app.log')
error_log_file = os.path.join(logs_folder, 'error.log')

# aplicaciones url / utils
application_root = os.environ.get('application_root') or ''
preferred_url_scheme = os.environ.get('preferred_url_scheme') or 'http'
server_name = os.environ.get('server_name') or None

class Develoment():
    DEBUG = True
config= {'development':Develoment}