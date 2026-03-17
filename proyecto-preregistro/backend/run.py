import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # B5: debug solo si se indica explícitamente en la variable de entorno
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug, port=5000)
