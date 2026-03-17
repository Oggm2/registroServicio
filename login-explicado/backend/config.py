import os
from dotenv import load_dotenv

# load_dotenv() lee el archivo .env y pone cada línea como variable de entorno.
# Así las credenciales no están hardcodeadas en el código.
load_dotenv()


class Config:
    # SECRET_KEY: clave general de Flask (firmado de cookies, etc.)
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # URI de la base de datos PostgreSQL.
    # Formato: postgresql://usuario:contraseña@host:puerto/nombre_db
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://Feria_User:prueba@localhost:5432/Feria_Servicios'
    )

    # Desactiva una función de SQLAlchemy que consume memoria y no se usa.
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT_SECRET_KEY: clave con la que se firman los tokens JWT.
    # Si no hay variable de entorno, usa la misma SECRET_KEY.
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)

    # Tiempo de vida del token en segundos. 86400 = 24 horas.
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 86400))
