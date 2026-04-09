from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from flask_migrate import Migrate
from datetime import timedelta

db = SQLAlchemy()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")
mail = Mail()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(
        seconds=app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 86400)
    )

    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)

    # B2: CORS configurable via CORS_ORIGINS env var (default permisivo para dev)
    cors_origins = app.config.get('CORS_ORIGINS', '*')
    if isinstance(cors_origins, str) and cors_origins != '*' and ',' in cors_origins:
        cors_origins = [o.strip() for o in cors_origins.split(',')]
    CORS(app, resources={r"/api/*": {"origins": cors_origins}})

    # B3: Error handlers globales que devuelven JSON
    from flask import jsonify as _jsonify

    @app.errorhandler(404)
    def not_found(e):
        return _jsonify({'error': 'Recurso no encontrado'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return _jsonify({'error': 'Error interno del servidor'}), 500

    from app.routes.auth import auth_bp
    from app.routes.estudiantes import estudiantes_bp
    from app.routes.servicios import servicios_bp
    from app.routes.preregistros import preregistros_bp
    from app.routes.asistencias import asistencias_bp
    from app.routes.admin import admin_bp
    from app.routes.socios_formadores import socios_bp
    from app.routes.checkin import checkin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(estudiantes_bp, url_prefix='/api/estudiantes')
    app.register_blueprint(servicios_bp, url_prefix='/api/servicios')
    app.register_blueprint(preregistros_bp, url_prefix='/api/preregistros')
    app.register_blueprint(asistencias_bp, url_prefix='/api/asistencias-feria')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(socios_bp, url_prefix='/api/socios-formadores')
    app.register_blueprint(checkin_bp, url_prefix='/api/checkin')

    return app
