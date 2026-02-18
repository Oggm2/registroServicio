from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
from app import db, limiter
from app.models import Usuario, Estudiante, Carrera

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña requeridos'}), 400

    user = Usuario.query.filter_by(username=username).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    token = create_access_token(identity=user.id)

    user_data = {
        'id': user.id,
        'username': user.username,
        'rol': user.rol,
    }

    if user.estudiante:
        user_data['nombre'] = user.estudiante.nombre_completo
        user_data['estudiante_id'] = user.estudiante.id

    return jsonify({'token': token, 'user': user_data})


@auth_bp.route('/register', methods=['POST'])
@limiter.limit("3 per minute")
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    nombre = data.get('nombre_completo', '').strip()
    matricula = data.get('matricula', '').strip()
    carrera_id = data.get('carrera_id')

    if not all([username, password, nombre, matricula, carrera_id]):
        return jsonify({'error': 'Todos los campos obligatorios son requeridos'}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({'error': 'El nombre de usuario ya existe'}), 409

    if Estudiante.query.filter_by(matricula=matricula).first():
        return jsonify({'error': 'La matrícula ya está registrada'}), 409

    correo = data.get('correo_alterno', '').strip() or None
    if correo and Estudiante.query.filter_by(correo_alterno=correo).first():
        return jsonify({'error': 'El correo alterno ya está registrado'}), 409

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    user = Usuario(username=username, password_hash=password_hash, rol='Estudiante')
    db.session.add(user)
    db.session.flush()

    estudiante = Estudiante(
        usuario_id=user.id,
        nombre_completo=nombre,
        matricula=matricula,
        carrera_id=carrera_id,
        celular=data.get('celular', '').strip() or None,
        correo_alterno=correo,
    )
    db.session.add(estudiante)
    db.session.commit()

    token = create_access_token(identity=user.id)

    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'rol': user.rol,
            'nombre': estudiante.nombre_completo,
            'estudiante_id': estudiante.id,
        }
    }), 201


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Contraseña actual y nueva son requeridas'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'La nueva contraseña debe tener al menos 6 caracteres'}), 400

    if not bcrypt.checkpw(current_password.encode(), user.password_hash.encode()):
        return jsonify({'error': 'La contraseña actual es incorrecta'}), 401

    user.password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    db.session.commit()
    return jsonify({'message': 'Contraseña actualizada correctamente'})


@auth_bp.route('/forgot-password', methods=['POST'])
@limiter.limit("3 per minute")
def forgot_password():
    import uuid
    from datetime import datetime, timedelta
    from app.models import PasswordResetToken
    from flask import current_app
    from flask_mail import Message
    from app import mail

    data = request.get_json()
    email = data.get('email', '').strip()

    if not email:
        return jsonify({'message': 'Si el correo existe, recibirás un enlace de recuperación'}), 200

    estudiante = Estudiante.query.filter_by(correo_alterno=email).first()
    if estudiante and estudiante.usuario:
        token = str(uuid.uuid4())
        reset_token = PasswordResetToken(
            usuario_id=estudiante.usuario.id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=1),
        )
        db.session.add(reset_token)
        db.session.commit()

        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password/{token}"

        try:
            msg = Message(
                'Recuperación de contraseña - Sistema Pre-Registro',
                recipients=[email],
            )
            msg.html = f"""
            <h2>Recuperación de contraseña</h2>
            <p>Hola {estudiante.nombre_completo},</p>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p><a href="{reset_link}">Haz clic aquí para restablecer tu contraseña</a></p>
            <p>Este enlace expira en 1 hora.</p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
            """
            mail.send(msg)
        except Exception:
            pass

    return jsonify({'message': 'Si el correo existe, recibirás un enlace de recuperación'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
@limiter.limit("5 per minute")
def reset_password():
    from datetime import datetime
    from app.models import PasswordResetToken

    data = request.get_json()
    token = data.get('token', '').strip()
    new_password = data.get('new_password', '')

    if not token or not new_password:
        return jsonify({'error': 'Token y nueva contraseña son requeridos'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'La nueva contraseña debe tener al menos 6 caracteres'}), 400

    reset_token = PasswordResetToken.query.filter_by(token=token, used=False).first()
    if not reset_token or reset_token.expires_at < datetime.utcnow():
        return jsonify({'error': 'Token inválido o expirado'}), 400

    user = Usuario.query.get(reset_token.usuario_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    user.password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    reset_token.used = True
    db.session.commit()
    return jsonify({'message': 'Contraseña restablecida correctamente'})


@auth_bp.route('/carreras', methods=['GET'])
def get_carreras():
    """Endpoint público para obtener carreras (usado en registro)."""
    carreras = Carrera.query.order_by(Carrera.nombre).all()
    return jsonify([{'id': c.id, 'nombre': c.nombre, 'abreviatura': c.abreviatura} for c in carreras])
