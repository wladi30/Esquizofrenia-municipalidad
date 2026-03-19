import os
from src import init_app
from configuracion import config

# secret_key = os.environ.get('secret_key') or 'taller-test' # en este caso le pongo la secret key con un or para que no tenga problemas con las cookies en el futuro

# app.secret_key = os.urandom(24)

def main():
    app = init_app(config)
    app.secret_key = 'taller-test-secreta-secretisima'
    app.run(debug=True, port=5000)

if __name__ == "__main__":
    main()