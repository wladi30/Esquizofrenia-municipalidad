from flask import Flask, abort, flash, redirect, url_for, session, redirect, url_for, render_template , Blueprint , request
import functools
from datetime import timedelta

def error_404(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),404

def error_401(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),401

def error_402(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),402

def error_403(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),403

def error_405(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),405

def error_406(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),406

def error_407(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),407

def error_408(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),408

def error_409(error): #PAGINA NO ENCONTRADA, SALE ESTE ERROR
    return render_template("error/404.html"),409

# 404 300 400 500!