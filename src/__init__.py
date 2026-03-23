from flask import Flask

from src.routers.error import error_404 
from .routers.app_funcionario import url_funcionario
from .routers.app_principal import url_principal
from .routers.app_admin import url_admin
from .routers.app_test import url_test
# from app import url_app

def init_app(config):
    app = Flask(__name__)
    app.config.from_object(config)
    #cargar ruta aqui
    # app.register_blueprint(url_app)
    app.register_blueprint(url_principal)
    app.register_blueprint(url_admin)
    app.register_blueprint(url_funcionario)
    app.register_blueprint(url_test)
    app.register_error_handler(404,error_404)
    return app
