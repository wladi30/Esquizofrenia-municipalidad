from flask import Blueprint, render_template
from db_test import autenticar_simple

url_test = Blueprint('url_test', __name__, template_folder='src/templates')

@url_test.route("/test-index")
def index_chamuco():
    return render_template("index.html")

resultado = autenticar_simple(12345678, 9, '123')
print(resultado)

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