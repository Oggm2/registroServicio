from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Usuario, Estudiante, Servicio, PreRegistro, Carrera
from app.middleware import role_required

preregistros_bp = Blueprint('preregistros', __name__)


@preregistros_bp.route('', methods=['GET'])
@role_required('Becario', 'Admin')
def get_preregistros():
    query = PreRegistro.query.join(Estudiante).join(Servicio).join(Carrera)

    periodo = request.args.get('periodo')
    carrera = request.args.get('carrera')
    if periodo:
        query = query.filter(Servicio.periodo == periodo)
    if carrera:
        query = query.filter(Carrera.nombre.ilike(f'%{carrera}%'))

    registros = query.order_by(PreRegistro.fecha_registro.desc()).all()

    return jsonify([{
        'id': r.id,
        'estudiante_nombre': r.estudiante.nombre_completo,
        'matricula': r.estudiante.matricula,
        'carrera': r.estudiante.carrera.nombre if r.estudiante.carrera else None,
        'crn': r.servicio.crn,
        'servicio_descripcion': r.servicio.descripcion,
        'periodo': r.servicio.periodo,
        'fecha_registro': r.fecha_registro.isoformat() if r.fecha_registro else None,
    } for r in registros])


@preregistros_bp.route('', methods=['POST'])
@role_required('Becario', 'Admin')
def create_preregistro():
    data = request.get_json()
    estudiante_id = data.get('estudiante_id')
    crn = data.get('crn', '').strip()

    if not estudiante_id or not crn:
        return jsonify({'error': 'estudiante_id y CRN son requeridos'}), 400

    estudiante = Estudiante.query.get(estudiante_id)
    if not estudiante:
        return jsonify({'error': 'Estudiante no encontrado'}), 404

    servicio = Servicio.query.filter_by(crn=crn).first()
    if not servicio:
        return jsonify({'error': 'Servicio con ese CRN no encontrado'}), 404

    # Verificar cupo
    inscritos = PreRegistro.query.filter_by(servicio_id=servicio.id).count()
    if inscritos >= servicio.cupo_maximo:
        return jsonify({'error': 'El servicio ha alcanzado su cupo máximo'}), 409

    # Verificar duplicado
    existente = PreRegistro.query.filter_by(
        estudiante_id=estudiante_id, servicio_id=servicio.id
    ).first()
    if existente:
        return jsonify({'error': 'El estudiante ya está inscrito en este servicio'}), 409

    # Verificar límite de 1 servicio por periodo
    ya_inscrito_periodo = PreRegistro.query.join(Servicio).filter(
        PreRegistro.estudiante_id == estudiante_id,
        Servicio.periodo == servicio.periodo,
    ).first()
    if ya_inscrito_periodo:
        return jsonify({
            'error': f'El estudiante ya tiene un servicio inscrito en el periodo {servicio.periodo}'
        }), 409

    preregistro = PreRegistro(estudiante_id=estudiante_id, servicio_id=servicio.id)
    db.session.add(preregistro)
    db.session.commit()

    return jsonify({'id': preregistro.id, 'message': 'Inscripción exitosa'}), 201


@preregistros_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_preregistro(id):
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    preregistro = PreRegistro.query.get_or_404(id)

    # Estudiantes solo pueden cancelar los propios
    if user.rol == 'Estudiante':
        if not user.estudiante or preregistro.estudiante_id != user.estudiante.id:
            return jsonify({'error': 'No tienes permisos'}), 403

    db.session.delete(preregistro)
    db.session.commit()
    return jsonify({'message': 'Inscripción cancelada'})
