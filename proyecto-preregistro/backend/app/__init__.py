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
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes.auth import auth_bp
    from app.routes.estudiantes import estudiantes_bp
    from app.routes.servicios import servicios_bp
    from app.routes.preregistros import preregistros_bp
    from app.routes.asistencias import asistencias_bp
    from app.routes.admin import admin_bp
    from app.routes.socios_formadores import socios_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(estudiantes_bp, url_prefix='/api/estudiantes')
    app.register_blueprint(servicios_bp, url_prefix='/api/servicios')
    app.register_blueprint(preregistros_bp, url_prefix='/api/preregistros')
    app.register_blueprint(asistencias_bp, url_prefix='/api/asistencias-feria')
    app.register_blueprint(admin_bp, url_prefix='/api')
    app.register_blueprint(socios_bp, url_prefix='/api/socios-formadores')

    return app
