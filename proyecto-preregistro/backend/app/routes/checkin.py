import hmac
import hashlib
import time
import base64

from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import Estudiante, AsistenciaFeria
from app.middleware import role_required
from datetime import datetime

checkin_bp = Blueprint('checkin', __name__)


def _generar_token(horas: int, secret_key: str):
    expires_at = int(time.time()) + (horas * 3600)
    mensaje = f"feria-checkin:{expires_at}"
    firma = hmac.new(secret_key.encode(), mensaje.encode(), hashlib.sha256).hexdigest()
    raw = f"{expires_at}.{firma}"
    token = base64.urlsafe_b64encode(raw.encode()).decode()
    return token, expires_at


def _verificar_token(token: str, secret_key: str):
    try:
        raw = base64.urlsafe_b64decode(token.encode()).decode()
        expires_at_str, firma_recibida = raw.split(".", 1)
        expires_at = int(expires_at_str)
        if time.time() > expires_at:
            return False, "El QR ha expirado"
        mensaje = f"feria-checkin:{expires_at}"
        firma_esperada = hmac.new(secret_key.encode(), mensaje.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(firma_recibida, firma_esperada):
            return False, "QR inválido"
        return True, None
    except Exception:
        return False, "QR inválido"


@checkin_bp.route('/generar-token', methods=['POST'])
@role_required('Admin')
def generar_token():
    data = request.get_json() or {}
    horas = int(data.get('horas_validez', 8))
    if horas < 1 or horas > 48:
        return jsonify({'error': 'horas_validez debe estar entre 1 y 48'}), 400

    secret_key = current_app.config['SECRET_KEY']
    token, expires_at = _generar_token(horas, secret_key)

    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
    qr_url = f"{frontend_url}/check-in?token={token}"

    return jsonify({
        'token': token,
        'expires_at': expires_at,
        'expires_at_readable': datetime.fromtimestamp(expires_at).strftime('%d/%m/%Y %H:%M'),
        'qr_url': qr_url,
    })


@checkin_bp.route('/entrada', methods=['POST'])
def registrar_entrada():
    data = request.get_json() or {}
    matricula = data.get('matricula', '').strip().upper()
    token = data.get('token', '').strip()

    if not matricula or not token:
        return jsonify({'error': 'Matrícula y token son requeridos'}), 400

    secret_key = current_app.config['SECRET_KEY']
    valido, error = _verificar_token(token, secret_key)
    if not valido:
        return jsonify({'error': error}), 401

    estudiante = Estudiante.query.filter_by(matricula=matricula).first()
    if not estudiante:
        return jsonify({'error': 'Matrícula no encontrada. Verifica que esté correcta'}), 404

    asistencia = AsistenciaFeria.query.filter_by(
        estudiante_id=estudiante.id
    ).first()

    if not asistencia:
        return jsonify({'error': 'No tienes un registro activo en la feria. Regístrate primero desde el sistema'}), 400

    if asistencia.estatus_asistencia == 'dentro':
        return jsonify({'error': 'Ya registraste tu entrada a la feria'}), 409

    if asistencia.estatus_asistencia in ('asistió', 'no_asistió'):
        return jsonify({'error': 'Tu asistencia ya fue procesada'}), 409

    asistencia.estatus_asistencia = 'dentro'
    asistencia.hora_real_asistencia = datetime.now().time()
    db.session.commit()

    return jsonify({
        'nombre_completo': estudiante.nombre_completo,
        'matricula': estudiante.matricula,
        'horario_seleccionado': asistencia.horario_seleccionado,
    }), 200
