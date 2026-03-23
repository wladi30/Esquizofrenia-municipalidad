from flask import Blueprint, render_template


url_test = Blueprint('url_test', __name__, template_folder='src/templates')


@url_test.route("/test-index")
def index_chamuco():
    return render_template("index.html")