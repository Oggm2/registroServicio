from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Usuario, Estudiante, AsistenciaFeria
from app.middleware import role_required
from datetime import date, datetime

asistencias_bp = Blueprint('asistencias', __name__)


@asistencias_bp.route('', methods=['POST'])
@jwt_required()
def registrar_asistencia():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)

    if not user or not user.estudiante:
        return jsonify({'error': 'Estudiante no encontrado'}), 404

    data = request.get_json()

    # Modo check: ver si ya tiene registro
    if data.get('check'):
        existente = AsistenciaFeria.query.filter_by(
            estudiante_id=user.estudiante.id
        ).order_by(AsistenciaFeria.id.desc()).first()
        if existente:
            return jsonify({'registro': {
                'id': existente.id,
                'horario_seleccionado': existente.horario_seleccionado,
                'estatus_asistencia': existente.estatus_asistencia,
                'fecha_asistencia': existente.fecha_asistencia.isoformat() if existente.fecha_asistencia else None,
            }})
        return jsonify({'registro': None})

    horario = data.get('horario_seleccionado', '').strip()
    if not horario:
        return jsonify({'error': 'Horario requerido'}), 400

    # Verificar si ya tiene registro activo
    existente = AsistenciaFeria.query.filter_by(
        estudiante_id=user.estudiante.id
    ).first()
    if existente:
        return jsonify({'error': 'Ya tienes un registro de asistencia'}), 409

    asistencia = AsistenciaFeria(
        estudiante_id=user.estudiante.id,
        horario_seleccionado=horario,
        fecha_asistencia=date.today(),
        estatus_asistencia='pendiente',
    )
    db.session.add(asistencia)
    db.session.commit()

    return jsonify({
        'registro': {
            'id': asistencia.id,
            'horario_seleccionado': asistencia.horario_seleccionado,
            'estatus_asistencia': asistencia.estatus_asistencia,
        },
        'message': 'Registro exitoso'
    }), 201


@asistencias_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_asistencia(id):
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    asistencia = AsistenciaFeria.query.get_or_404(id)

    # Solo el estudiante dueño puede cambiar su horario
    if user.rol == 'Estudiante':
        if not user.estudiante or asistencia.estudiante_id != user.estudiante.id:
            return jsonify({'error': 'No tienes permisos'}), 403

    data = request.get_json()
    if 'horario_seleccionado' in data:
        asistencia.horario_seleccionado = data['horario_seleccionado']

    db.session.commit()
    return jsonify({'message': 'Horario actualizado'})


@asistencias_bp.route('/<int:id>/validar', methods=['PUT'])
@role_required('Becario', 'Admin')
def validar_asistencia(id):
    asistencia = AsistenciaFeria.query.get_or_404(id)
    data = request.get_json()

    estatus = data.get('estatus_asistencia')
    if estatus not in ('pendiente', 'dentro', 'asistió', 'no_asistió'):
        return jsonify({'error': 'Estatus inválido'}), 400

    if estatus == 'dentro':
        asistencia.hora_real_asistencia = datetime.now().time()
    elif estatus == 'asistió':
        asistencia.hora_salida = datetime.now()

    asistencia.estatus_asistencia = estatus
    db.session.commit()
    return jsonify({'message': 'Estatus actualizado'})


@asistencias_bp.route('/dentro', methods=['GET'])
@role_required('Becario', 'Admin')
def asistentes_dentro():
    count = AsistenciaFeria.query.filter_by(estatus_asistencia='dentro').count()
    total_registrados = AsistenciaFeria.query.count()
    asistieron = AsistenciaFeria.query.filter(
        AsistenciaFeria.estatus_asistencia.in_(['dentro', 'asistió'])
    ).count()
    return jsonify({
        'dentro_ahora': count,
        'total_registrados': total_registrados,
        'total_asistieron': asistieron,
    })
