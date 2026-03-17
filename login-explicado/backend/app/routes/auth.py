from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt
from app import db, limiter
from app.models import Usuario

# ── Blueprint ─────────────────────────────────────────────────────────────────
# Un Blueprint es un "grupo de rutas". Se registra en create_app() con un prefijo.
# Aquí el prefijo es '/api/auth', así que:
#   /login  →  /api/auth/login
auth_bp = Blueprint('auth', __name__)


# ── Ruta de Login ─────────────────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")   # Máximo 5 intentos por minuto por IP (anti-fuerza bruta)
def login():
    # 1. Leer el JSON que envió el frontend
    #    El frontend manda: { "username": "...", "password": "..." }
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    # 2. Validación básica: ambos campos deben estar presentes
    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña requeridos'}), 400

    # 3. Buscar el usuario en la base de datos por su username
    user = Usuario.query.filter_by(username=username).first()

    # 4. Verificar contraseña con bcrypt
    #    bcrypt.checkpw() compara el texto plano con el hash guardado.
    #    Si el usuario no existe, o el hash no coincide → credenciales incorrectas.
    #    NUNCA digas cuál de los dos falló (seguridad).
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    # 5. Crear el JWT (token de acceso)
    #    identity=user.id  → el token "contiene" el ID del usuario.
    #    Cuando el frontend mande este token en futuros requests,
    #    el backend puede saber quién es con get_jwt_identity().
    token = create_access_token(identity=user.id)

    # 6. Armar la respuesta con datos del usuario
    user_data = {
        'id': user.id,
        'username': user.username,
        'rol': user.rol,         # 'Estudiante' | 'Becario' | 'Admin'
    }

    # Si el usuario tiene un perfil de Estudiante, agregar nombre
    if user.estudiante:
        user_data['nombre'] = user.estudiante.nombre_completo
        user_data['estudiante_id'] = user.estudiante.id

    # 7. Devolver token + datos del usuario al frontend
    #    El frontend guardará el token en localStorage y lo usará en cada request.
    return jsonify({'token': token, 'user': user_data})
