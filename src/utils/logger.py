import logging, os
from logging.handlers import RotatingFileHandler
from flask import has_request_context,request
from configuracion import Config

class requestFormatter(logging.Formatter):
    def format(self , record): #la llamada queda en el log si ocurrio de una peticion http, si no queda debe ser problema del log.
        if has_request_context(): # si es que se agrega al registro ocurre fiumba
            record.url = request.url
            record.remote_addr = request.remote_addr
            record.method = request.method
            record.path = request.path
            record.user_agent = request.user_agent.string if request.user_agent else 'Unkown'
        else: # esto en caso de que no esten las tareas programadas les pondra guion, para que asi no tengan null
            record.url = None
            record.remote_addr = '-'
            record.method = '-'
            record.path = '-'
            record.user_agent = '-'
        return super().format(record)
    
    def setup_loggin(app): #se creara la carpeta log con esto
        if not os.path.exists(Config.logs_folder):
            os.makedirs(Config.logs_folder)
        file_formatter = requestFormatter