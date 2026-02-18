from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models import Usuario


def role_required(*roles):
    """Decorator para proteger endpoints por rol."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = Usuario.query.get(user_id)
            if not user or user.rol not in roles:
                return jsonify({'error': 'No tienes permisos para esta acción'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
