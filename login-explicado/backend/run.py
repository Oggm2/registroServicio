# Punto de entrada del servidor.
# Se ejecuta con:  python run.py
# O en producción con gunicorn:  gunicorn run:app

from app import create_app

app = create_app()

if __name__ == '__main__':
    # debug=True → recarga automáticamente al guardar cambios (solo desarrollo)
    # port=5000  → el servidor escucha en http://localhost:5000
    app.run(debug=True, port=5000)
