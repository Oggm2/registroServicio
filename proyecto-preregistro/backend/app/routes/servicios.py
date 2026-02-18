from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Servicio, PreRegistro
from app.middleware import role_required

servicios_bp = Blueprint('servicios', __name__)


@servicios_bp.route('', methods=['GET'])
@jwt_required()
def get_servicios():
    servicios = Servicio.query.order_by(Servicio.periodo.desc(), Servicio.descripcion).all()
    return jsonify([{
        'id': s.id,
        'descripcion': s.descripcion,
        'crn': s.crn,
        'periodo': s.periodo,
        'cupo_maximo': s.cupo_maximo,
        'inscritos': PreRegistro.query.filter_by(servicio_id=s.id).count(),
        'socio_formador_id': s.socio_formador_id,
        'socio_formador_nombre': s.socio_formador.nombre if s.socio_formador else None,
    } for s in servicios])


@servicios_bp.route('', methods=['POST'])
@role_required('Admin')
def create_servicio():
    data = request.get_json()
    if not all([data.get('descripcion'), data.get('crn'), data.get('periodo')]):
        return jsonify({'error': 'Campos obligatorios faltantes'}), 400

    if Servicio.query.filter_by(crn=data['crn']).first():
        return jsonify({'error': 'El CRN ya existe'}), 409

    servicio = Servicio(
        descripcion=data['descripcion'],
        crn=data['crn'],
        periodo=data['periodo'],
        cupo_maximo=data.get('cupo_maximo', 30),
        socio_formador_id=data.get('socio_formador_id') or None,
    )
    db.session.add(servicio)
    db.session.commit()

    return jsonify({'id': servicio.id, 'message': 'Servicio creado'}), 201


@servicios_bp.route('/<int:id>', methods=['PUT'])
@role_required('Admin')
def update_servicio(id):
    servicio = Servicio.query.get_or_404(id)
    data = request.get_json()

    if 'descripcion' in data:
        servicio.descripcion = data['descripcion']
    if 'crn' in data:
        existing = Servicio.query.filter(Servicio.crn == data['crn'], Servicio.id != id).first()
        if existing:
            return jsonify({'error': 'El CRN ya existe'}), 409
        servicio.crn = data['crn']
    if 'periodo' in data:
        servicio.periodo = data['periodo']
    if 'cupo_maximo' in data:
        nuevo_cupo = int(data['cupo_maximo'])
        inscritos = PreRegistro.query.filter_by(servicio_id=id).count()
        if nuevo_cupo < inscritos:
            return jsonify({'error': f'No se puede reducir a {nuevo_cupo}, hay {inscritos} inscritos'}), 409
        servicio.cupo_maximo = nuevo_cupo
    if 'socio_formador_id' in data:
        servicio.socio_formador_id = data['socio_formador_id'] or None

    db.session.commit()
    return jsonify({'message': 'Servicio actualizado'})


@servicios_bp.route('/<int:id>', methods=['DELETE'])
@role_required('Admin')
def delete_servicio(id):
    servicio = Servicio.query.get_or_404(id)
    db.session.delete(servicio)
    db.session.commit()
    return jsonify({'message': 'Servicio eliminado'})


@servicios_bp.route('/<int:id>/cupo', methods=['PUT'])
@role_required('Admin')
def update_cupo(id):
    servicio = Servicio.query.get_or_404(id)
    data = request.get_json()
    cupo = data.get('cupo_maximo')
    if cupo is None or int(cupo) < 0:
        return jsonify({'error': 'Cupo inválido'}), 400

    inscritos = PreRegistro.query.filter_by(servicio_id=id).count()
    if int(cupo) < inscritos:
        return jsonify({'error': f'No se puede reducir a {cupo}, hay {inscritos} inscritos'}), 409

    servicio.cupo_maximo = int(cupo)
    db.session.commit()
    return jsonify({'message': 'Cupo actualizado'})
