from flask import Blueprint, jsonify, render_template

url_admin = Blueprint('url_admin', __name__, template_folder='src/templates')

@url_admin.route("/masiva-guts")
def guts():
    return render_template("a_massive_creature.html")

@url_admin.route("/index-antiguo")
def index_chamuco():
    return render_template("index.html")

@url_admin.route('/debug-rutas')
def debug_rutas():
    from flask import current_app
    rutas = []
    for rule in current_app.url_map.iter_rules():
        rutas.append({
            'endpoint': rule.endpoint,
            'url': str(rule)
        })
    return jsonify(rutas)

# los de aqui son filtros de prueba que estoy haciendo
# https://youtu.be/sZl-H6GkHrk , de este video lo saque
@url_admin.app_template_filter('/string_reversa')
def filtro_string_reversa(s):
    # string_reversa es lo que dice, es las veces que se devuelve hacia atras ciertos valores, aun por definir
    return s[::-1]

@url_admin.app_template_filter('/alternativo')
def filtro_alternativo(s):
    # alternativo es de alternar entre un valor o otro valor que se le especifica, aun por definir
    return ''.join([c.upper() if i % 2 == 0 else c.lower() for i, c in enumerate(s)])

@url_admin.app_template_filter('/repetir')
def repetir(s, veces=2):
    # repetir es las veces que algo se tiene que repetir, aun no se muy bien como se puede aplicar en los filtros pero alli esta, aun por definir
    return s * veces