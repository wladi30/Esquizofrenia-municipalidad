from flask import Blueprint, render_template
from db_test import autenticar_simple

url_test = Blueprint('url_test', __name__, template_folder='src/templates')

@url_test.route("/test-index")
def index_chamuco():
    return render_template("index.html")

resultado = autenticar_simple(12345678, 9, '123')
print(resultado)

# document.getElementById('identificador').value = '12.345.678-9';
# document.getElementById('password').value = '123';
# document.getElementById('loginForm').dispatchEvent(new Event('submit'));

# fetch('/api/login', {
#     method: 'POST',
#     headers: {'Content-Type': 'application/json'},
#     body: JSON.stringify({rut: 12345678, dv: '9', password: '123'})
# }).then(r => r.json()).then(console.log)