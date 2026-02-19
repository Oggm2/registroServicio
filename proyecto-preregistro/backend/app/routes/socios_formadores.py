from flask import Blueprint, request, jsonify
from app import db
from app.models import SocioFormador, Servicio, PreRegistro, Estudiante, Carrera
from app.middleware import role_required

socios_bp = Blueprint('socios_formadores', __name__)


def paginate_query(query, page=1, per_page=20):
    page = max(1, int(page))
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return paginated.items, {
        'page': paginated.page,
        'per_page': paginated.per_page,
        'total': paginated.total,
        'pages': paginated.pages,
    }


@socios_bp.route('', methods=['GET'])
@role_required('Admin')
def get_socios():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    q = request.args.get('q', '').strip()

    query = SocioFormador.query
    if q:
        query = query.filter(SocioFormador.nombre.ilike(f'%{q}%'))
    query = query.order_by(SocioFormador.nombre)
    items, pagination = paginate_query(query, page, per_page)
    return jsonify({
        'data': [{'id': s.id, 'nombre': s.nombre} for s in items],
        'pagination': pagination,
    })


@socios_bp.route('', methods=['POST'])
@role_required('Admin')
def create_socio():
    data = request.get_json()
    nombre = data.get('nombre', '').strip()
    if not nombre:
        return jsonify({'error': 'El nombre es obligatorio'}), 400
    if SocioFormador.query.filter_by(nombre=nombre).first():
        return jsonify({'error': 'Ya existe un socio formador con ese nombre'}), 409
    socio = SocioFormador(nombre=nombre)
    db.session.add(socio)
    db.session.commit()
    return jsonify({'id': socio.id, 'message': 'Socio formador creado'}), 201


@socios_bp.route('/<int:id>', methods=['PUT'])
@role_required('Admin')
def update_socio(id):
    socio = SocioFormador.query.get_or_404(id)
    data = request.get_json()
    nombre = data.get('nombre', '').strip()
    if not nombre:
        return jsonify({'error': 'El nombre es obligatorio'}), 400
    existing = SocioFormador.query.filter(
        SocioFormador.nombre == nombre, SocioFormador.id != id
    ).first()
    if existing:
        return jsonify({'error': 'Ya existe un socio formador con ese nombre'}), 409
    socio.nombre = nombre
    db.session.commit()
    return jsonify({'message': 'Socio formador actualizado'})


@socios_bp.route('/<int:id>', methods=['DELETE'])
@role_required('Admin')
def delete_socio(id):
    socio = SocioFormador.query.get_or_404(id)
    if Servicio.query.filter_by(socio_formador_id=id).count() > 0:
        return jsonify({'error': 'No se puede eliminar: tiene servicios asociados'}), 409
    db.session.delete(socio)
    db.session.commit()
    return jsonify({'message': 'Socio formador eliminado'})


@socios_bp.route('/<int:id>/detalle', methods=['GET'])
@role_required('Admin')
def detalle_socio(id):
    socio = SocioFormador.query.get_or_404(id)
    servicios = Servicio.query.filter_by(socio_formador_id=id).all()

    servicios_data = []
    total_inscritos = 0
    total_cupo = 0
    for s in servicios:
        inscritos = PreRegistro.query.filter_by(servicio_id=s.id).count()
        total_inscritos += inscritos
        total_cupo += s.cupo_maximo
        servicios_data.append({
            'id': s.id,
            'descripcion': s.descripcion,
            'crn': s.crn,
            'periodo': s.periodo,
            'cupo_maximo': s.cupo_maximo,
            'inscritos': inscritos,
        })

    return jsonify({
        'id': socio.id,
        'nombre': socio.nombre,
        'total_servicios': len(servicios),
        'total_inscritos': total_inscritos,
        'total_cupo': total_cupo,
        'servicios': servicios_data,
    })


@socios_bp.route('/stats', methods=['GET'])
@role_required('Admin')
def stats_socios():
    results = db.session.query(
        SocioFormador.id,
        SocioFormador.nombre,
        db.func.count(db.distinct(Servicio.id)).label('total_servicios'),
        db.func.count(PreRegistro.id).label('total_inscritos'),
    ).outerjoin(Servicio, Servicio.socio_formador_id == SocioFormador.id)\
     .outerjoin(PreRegistro, PreRegistro.servicio_id == Servicio.id)\
     .group_by(SocioFormador.id, SocioFormador.nombre)\
     .order_by(db.func.count(PreRegistro.id).desc())\
     .all()

    return jsonify([{
        'id': r.id,
        'nombre': r.nombre,
        'total_servicios': r.total_servicios,
        'total_inscritos': r.total_inscritos,
    } for r in results])
