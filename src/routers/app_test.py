from flask import Blueprint, render_template
from db_test import autenticar_simple

url_test = Blueprint('url_test', __name__, template_folder='src/templates')

@url_test.route("/test-index")
def index_chamuco():
    return render_template("index.html")

# IMPORTANTE
# el nombre de los paises, comunas y tambien las categorias de los talleres, estan todos puestos en el backend, esto no debe ser asi
# los paises y comunas no van a cambiar pero las categorias si asi que tengo que adaptarlo ya que pueden añadir nuevas categorias o tal evz sacar algunas , asi que deberia tomarlas de la
# base y con eso actualizarse , tambien seria buena idea que hiciera lo mismo con los paises y comunas, genero por otro lado es puro frontend, en la base solo es un int, pero en el frontend
# toma valor y se le asigna un nombre(string)

# https://pypi.org/project/python-ipware/
# registrar todos los cambios en los logs, tambien poder tener una sesion unica, poder sacar la ip del usuario junto con su navegador, etc
# hacer que se generen por mes 
# fpdf2, weasyprint, jspdf

# se tiene que crear 2 tipos de usuarios mas, el usuario vista para que puedan ver el taller y admin para que puedan tal vez revisar a los funcionarios , podria hacer algo como lo que hizo el
# victor y hacer que pueda ver los inicios de session junto con poder descargarlos etc

# en la base de datos existe la tabla calendarizacion taller. esta sirve para registrar los talleres cuando se modifican , tambien se marca si el taller es mensual o semanal
# esta es la informacion que me faltaba respecto a los talleres

# integrante taller es lo del estudiante, con esto pude calcular la cantidad de estudiantes que existe en un taller

# resultado = autenticar_simple(12345678, 9, '123')
# print(resultado)

# RECORDAR poner un trigger para que cada vez que se abra el flask_app se actualice todas las edades de las personas taller y tambien funcionarios
# aqui mismo podria poner el trigger cosas que se active todo el rato

# USE GESTION_TALLER;

# IF OBJECT_ID('TR_SGT_PERSONA_CALCULAR_EDAD', 'TR') IS NOT NULL
#     DROP TRIGGER TR_SGT_PERSONA_CALCULAR_EDAD;
# GO

# CREATE TRIGGER TR_SGT_PERSONA_CALCULAR_EDAD
# ON SGT_PERSONA_TALLER
# AFTER INSERT, UPDATE
# AS BEGIN
# 	SET NOCOUNT ON;
# 	--servira para contar la edad del usuario calculando segun su nacimiento.
# 	UPDATE P
# 	SET EDAD = DATEDIFF(YEAR, I.FEC_NACIMIENTO, GETDATE())
# 	FROM SGT_PERSONA_TALLER P
# 		INNER JOIN INSERTED I ON P.ID_PERSONA = I.ID_PERSONA
# 	WHERE P.FEC_NACIMIENTO IS NOT NULL;
# END;
# GO

# document.getElementById('identificador').value = '12.345.678-9';
# document.getElementById('password').value = '123';
# document.getElementById('loginForm').dispatchEvent(new Event('submit'));

# fetch('/api/login', {
#     method: 'POST',
#     headers: {'Content-Type': 'application/json'},
#     body: JSON.stringify({rut: 12345678, dv: '9', password: '123'})
# }).then(r => r.json()).then(console.log)