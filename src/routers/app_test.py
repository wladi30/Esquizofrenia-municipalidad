from flask import Blueprint, render_template
from db_test import autenticar_simple

url_test = Blueprint('url_test', __name__, template_folder='src/templates')

@url_test.route("/test-index")
def index_chamuco():
    return render_template("index.html")

# IMPORTANTE
# segun la base de datos puedo ver que esta al momento de meter un estudiante este puede entrar a muchos talleres al mismo tiempo , la fecha de los talleres que vi comprobando al estudiante
# (id 1)muestran que este se metio a multiples talleres al mismo tiempo(8) y sin embargo en los registro muestra que los talleres despues tienen distintos cambios de fechas
# esto quiere decir que una persona puede meterse a multiples talleres en los cuales tal vez no siga despues o el taller muera , eso podria explicar por que las fechas de los talleres
# son distintas, revisando vi que la persona esta registrada 8 veces , la tabla estudiante parece no ser alterada en ningun momento, por lo cual no se por que tiene aud modifica,
# esto quiere decir que la tabla estudiante es mas un conector entre integrante y persona, asi que aqui solo se tiene que registrar cuando se crea un estudiante
# integrante es algo mas complicada , aqui se registran los estudiantes con los talleres, un detalle de esto , la fecha de inscripcion es igual la fecha de aud ingreso en integrante taller
# para hacerlo mas claro, el taller puede tener un boton dentro del mismo verdetalles(tambien fuera para mayor facilidad) en este boton nuevo muestra los talelristas, y aqui
# te permite ver cuantos talleristas tienes con sus nombres , etc. Tambien deberia ser que aqui mismo te permita ingresar al tema de poder ver los talleristas y editarlo
# seria un gran QoL eso.

# JM me confirmo, tabla estudiante se asigna al momento de crear la persona que a su vez se pone como estudiante, la tabla estudiante no se modifica en ningun momento y queda asi
# para siempre

# viendo la base de datos note que puede tener mas de un profesor los talleres, la id 640 tiene 3 profesores, ids 52,53,54 relacionados con deporte y distintos roles, tendria que 
# colocar el tema de que un taller pueda tener mas de un profesor y mostrar cuantos profesores tiene

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