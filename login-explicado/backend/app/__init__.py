from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import timedelta

# ── Instancias globales de extensiones ──────────────────────────────────────
# Se crean aquí (sin app) para que puedan importarse desde cualquier archivo.
# La app se les "inyecta" después en create_app() con .init_app(app).

db = SQLAlchemy()        # ORM: maneja la base de datos
jwt = JWTManager()       # Maneja la generación y validación de tokens JWT

# Limiter: limita cuántas veces se puede llamar a una ruta por minuto.
# get_remote_address = identifica al usuario por su IP.
# storage_uri="memory://" = guarda los contadores en RAM (para desarrollo).
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")


# ── Factory de la aplicación ─────────────────────────────────────────────────
# En vez de crear Flask en el nivel del módulo, usamos una función.
# Ventaja: permite crear múltiples instancias (por ejemplo, para tests).
def create_app():
    app = Flask(__name__)

    # Carga toda la configuración desde la clase Config en config.py
    app.config.from_object('config.Config')

    # Sobreescribe JWT_ACCESS_TOKEN_EXPIRES para que sea un timedelta
    # (Flask-JWT-Extended lo requiere así, no como int).
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
        seconds=app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 86400)
    )

    # ── Inicializar extensiones con la app ───────────────────────────────────
    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)

    # CORS: permite que el frontend (en otro puerto/dominio) haga peticiones.
    # r"/api/*"  → solo rutas que empiecen con /api/
    # "origins": "*" → acepta peticiones de cualquier origen (en producción se restringe)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Registrar Blueprints (grupos de rutas) ───────────────────────────────
    # Importamos aquí dentro para evitar importaciones circulares.
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    # Resultado: /login → /api/auth/login

    return app
