from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario, Estudiante, PreRegistro, Servicio, AsistenciaFeria, Carrera
from app.middleware import role_required

estudiantes_bp = Blueprint('estudiantes', __name__)


@estudiantes_bp.route('/mis-proyectos', methods=['GET'])
@jwt_required()
def mis_proyectos():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user or not user.estudiante:
        return jsonify({'error': 'Estudiante no encontrado'}), 404

    periodo = request.args.get('periodo')
    query = PreRegistro.query.filter_by(estudiante_id=user.estudiante.id)

    if periodo:
        query = query.join(Servicio).filter(Servicio.periodo == periodo)

    registros = query.join(Servicio).all()

    return jsonify([{
        'preregistro_id': r.id,
        'servicio_id': r.servicio.id,
        'servicio_descripcion': r.servicio.descripcion,
        'crn': r.servicio.crn,
        'periodo': r.servicio.periodo,
        'fecha_registro': r.fecha_registro.isoformat() if r.fecha_registro else None,
    } for r in registros])


@estudiantes_bp.route('/perfil', methods=['GET'])
@jwt_required()
def get_perfil():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user or not user.estudiante:
        return jsonify({'error': 'Estudiante no encontrado'}), 404

    est = user.estudiante
    return jsonify({
        'id': est.id,
        'nombre_completo': est.nombre_completo,
        'matricula': est.matricula,
        'carrera': est.carrera.nombre if est.carrera else '',
        'celular': est.celular or '',
        'correo_alterno': est.correo_alterno or '',
        'username': user.username,
    })


@estudiantes_bp.route('/perfil', methods=['PUT'])
@jwt_required()
def update_perfil():
    user_id = get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user or not user.estudiante:
        return jsonify({'error': 'Estudiante no encontrado'}), 404

    data = request.get_json()
    est = user.estudiante

    if 'celular' in data:
        est.celular = data['celular'].strip() or None

    if 'correo_alterno' in data:
        correo = data['correo_alterno'].strip() or None
        if correo:
            existing = Estudiante.query.filter(
                Estudiante.correo_alterno == correo,
                Estudiante.id != est.id
            ).first()
            if existing:
                return jsonify({'error': 'El correo alterno ya está registrado'}), 409
        est.correo_alterno = correo

    db.session.commit()
    return jsonify({'message': 'Perfil actualizado correctamente'})


@estudiantes_bp.route('/buscar', methods=['GET'])
@role_required('Becario', 'Admin')
def buscar_estudiante():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'error': 'Parámetro de búsqueda requerido'}), 400

    estudiantes = Estudiante.query.join(Carrera).filter(
        db.or_(
            Estudiante.matricula.ilike(f'%{q}%'),
            Estudiante.nombre_completo.ilike(f'%{q}%'),
        )
    ).limit(20).all()

    result = []
    for est in estudiantes:
        # Obtener preregistros
        preregistros = [{
            'id': pr.id,
            'crn': pr.servicio.crn,
            'descripcion': pr.servicio.descripcion,
        } for pr in est.preregistros]

        # Obtener asistencia feria más reciente
        asistencia = AsistenciaFeria.query.filter_by(
            estudiante_id=est.id
        ).order_by(AsistenciaFeria.id.desc()).first()

        est_data = {
            'id': est.id,
            'nombre_completo': est.nombre_completo,
            'matricula': est.matricula,
            'carrera_nombre': est.carrera.nombre if est.carrera else None,
            'celular': est.celular,
            'correo_alterno': est.correo_alterno,
            'preregistros': preregistros,
        }

        if asistencia:
            est_data['asistencia_feria'] = {
                'id': asistencia.id,
                'horario_seleccionado': asistencia.horario_seleccionado,
                'estatus': asistencia.estatus_asistencia,
            }

        result.append(est_data)

    return jsonify(result)


# Necesario importar db para el filtro or_
from app import db
