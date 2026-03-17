from flask import Blueprint, request, jsonify, Response
from app import db
from app.models import Estudiante, Servicio, PreRegistro, AsistenciaFeria, Carrera, SocioFormador, Usuario
from app.middleware import role_required
from io import StringIO, BytesIO
import csv
import bcrypt

admin_bp = Blueprint('admin', __name__)


def paginate_query(query, page=1, per_page=20):
    page = max(1, int(page))
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return paginated.items, {
        'page': paginated.page,
        'per_page': paginated.per_page,
        'total': paginated.total,
        'pages': paginated.pages,
    }


@admin_bp.route('/dashboard/stats', methods=['GET'])
@role_required('Admin')
def get_stats():
    periodo = request.args.get('periodo')

    total_registrados = Estudiante.query.count()

    if periodo:
        total_asistencias = AsistenciaFeria.query.filter_by(periodo=periodo).count()
        total_preregistros = PreRegistro.query.join(Servicio).filter(Servicio.periodo == periodo).count()
        servicios_activos = Servicio.query.filter_by(periodo=periodo).count()
    else:
        total_asistencias = AsistenciaFeria.query.count()
        total_preregistros = PreRegistro.query.count()
        servicios_activos = Servicio.query.count()

    # Asistencias por horario
    asistencias_horario = db.session.query(
        AsistenciaFeria.horario_seleccionado,
        db.func.count(AsistenciaFeria.id)
    ).group_by(AsistenciaFeria.horario_seleccionado).all()

    # Ocupación por periodo
    ocupacion_q = db.session.query(
        Servicio.periodo,
        db.func.sum(Servicio.cupo_maximo).label('cupo_total'),
        db.func.count(PreRegistro.id).label('inscritos_total')
    ).outerjoin(PreRegistro)
    if periodo:
        ocupacion_q = ocupacion_q.filter(Servicio.periodo == periodo)
    ocupacion_periodo = ocupacion_q.group_by(Servicio.periodo)\
        .order_by(Servicio.periodo).all()

    # Asistentes dentro ahora (siempre global, refleja estado actual)
    asistentes_dentro = AsistenciaFeria.query.filter_by(estatus_asistencia='dentro').count()

    # Proyectos más solicitados
    proyectos_q = db.session.query(
        Servicio.descripcion,
        Servicio.cupo_maximo,
        db.func.count(PreRegistro.id).label('inscritos')
    ).outerjoin(PreRegistro)
    if periodo:
        proyectos_q = proyectos_q.filter(Servicio.periodo == periodo)
    proyectos_top = proyectos_q.group_by(Servicio.id, Servicio.descripcion, Servicio.cupo_maximo)\
        .order_by(db.func.count(PreRegistro.id).desc()).limit(10).all()

    # Cupos disponibles
    cupos_q = db.session.query(
        Servicio.id,
        Servicio.descripcion,
        Servicio.crn,
        Servicio.cupo_maximo,
        db.func.count(PreRegistro.id).label('inscritos')
    ).outerjoin(PreRegistro)
    if periodo:
        cupos_q = cupos_q.filter(Servicio.periodo == periodo)
    cupos = cupos_q.group_by(Servicio.id, Servicio.descripcion, Servicio.crn, Servicio.cupo_maximo).all()

    # Inscritos por Socio Formador
    stats_sf_q = db.session.query(
        SocioFormador.nombre,
        db.func.count(PreRegistro.id).label('total_inscritos')
    ).join(Servicio, Servicio.socio_formador_id == SocioFormador.id)\
     .join(PreRegistro, PreRegistro.servicio_id == Servicio.id)
    if periodo:
        stats_sf_q = stats_sf_q.filter(Servicio.periodo == periodo)
    stats_sf = stats_sf_q.group_by(SocioFormador.nombre)\
        .order_by(db.func.count(PreRegistro.id).desc()).all()

    # --- Nuevas estadísticas ---

    # Tasa de no-asistencia
    if periodo:
        no_asistieron = AsistenciaFeria.query.filter_by(periodo=periodo, estatus_asistencia='no_asistió').count()
    else:
        no_asistieron = AsistenciaFeria.query.filter_by(estatus_asistencia='no_asistió').count()
    tasa_no_asistencia = round((no_asistieron / total_asistencias) * 100, 1) if total_asistencias > 0 else 0

    # Pre-registros por carrera
    preregistros_carrera_q = db.session.query(
        Carrera.abreviatura, Carrera.nombre, db.func.count(PreRegistro.id)
    ).join(Estudiante, Estudiante.carrera_id == Carrera.id)\
     .join(PreRegistro, PreRegistro.estudiante_id == Estudiante.id)
    if periodo:
        preregistros_carrera_q = preregistros_carrera_q.join(Servicio, Servicio.id == PreRegistro.servicio_id)\
            .filter(Servicio.periodo == periodo)
    preregistros_carrera = preregistros_carrera_q\
        .group_by(Carrera.id, Carrera.abreviatura, Carrera.nombre)\
        .order_by(db.func.count(PreRegistro.id).desc()).all()

    # Tendencia de inscripciones por día
    tendencia_q = db.session.query(
        db.func.date(PreRegistro.fecha_registro), db.func.count(PreRegistro.id)
    )
    if periodo:
        tendencia_q = tendencia_q.join(Servicio, Servicio.id == PreRegistro.servicio_id)\
            .filter(Servicio.periodo == periodo)
    tendencia = tendencia_q.group_by(db.func.date(PreRegistro.fecha_registro))\
        .order_by(db.func.date(PreRegistro.fecha_registro)).all()

    # Distribución de estatus de asistencia
    estatus_dist_q = db.session.query(
        AsistenciaFeria.estatus_asistencia, db.func.count(AsistenciaFeria.id)
    )
    if periodo:
        estatus_dist_q = estatus_dist_q.filter(AsistenciaFeria.periodo == periodo)
    estatus_dist = estatus_dist_q.group_by(AsistenciaFeria.estatus_asistencia).all()

    # Periodos disponibles
    periodos_disponibles = [p[0] for p in db.session.query(Servicio.periodo).distinct().order_by(Servicio.periodo).all()]

    return jsonify({
        'total_registrados': total_registrados,
        'total_asistencias_feria': total_asistencias,
        'total_preregistros': total_preregistros,
        'servicios_activos': servicios_activos,
        'asistencias_por_horario': [
            {'horario': h, 'total': t} for h, t in asistencias_horario
        ],
        'ocupacion_por_periodo': [
            {
                'periodo': p,
                'cupo_total': ct or 0,
                'inscritos': it,
                'porcentaje': round((it / ct) * 100, 1) if ct else 0,
            }
            for p, ct, it in ocupacion_periodo
        ],
        'asistentes_dentro': asistentes_dentro,
        'proyectos_mas_solicitados': [
            {'descripcion': d, 'cupo_maximo': cm, 'inscritos': i}
            for d, cm, i in proyectos_top
        ],
        'cupos_disponibles': [
            {
                'id': sid, 'descripcion': d, 'crn': c,
                'cupo_maximo': cm, 'inscritos': i,
                'disponibles': cm - i,
            }
            for sid, d, c, cm, i in cupos
        ],
        'inscritos_por_socio_formador': [
            {'socio_formador': nombre, 'total': total}
            for nombre, total in stats_sf
        ],
        'tasa_no_asistencia': tasa_no_asistencia,
        'no_asistieron': no_asistieron,
        'preregistros_por_carrera': [
            {'carrera': abr, 'nombre': nom, 'total': t}
            for abr, nom, t in preregistros_carrera
        ],
        'tendencia_inscripciones': [
            {'fecha': str(f), 'total': t} for f, t in tendencia
        ],
        'estatus_distribucion': [
            {'estatus': e, 'total': t} for e, t in estatus_dist
        ],
        'periodos_disponibles': periodos_disponibles,
    })


@admin_bp.route('/reportes/estudiantes', methods=['GET'])
@role_required('Admin')
def reporte_estudiantes():
    formato = request.args.get('formato', 'csv')
    carrera = request.args.get('carrera', '').strip()

    query = Estudiante.query.join(Carrera).join(Usuario).order_by(Estudiante.nombre_completo)
    if carrera:
        query = query.filter(Carrera.nombre.ilike(f'%{carrera}%'))
    estudiantes = query.all()

    if formato == 'excel':
        try:
            from openpyxl import Workbook
            wb = Workbook()
            ws = wb.active
            ws.title = 'Estudiantes'
            ws.append(['Nombre', 'Matrícula', 'Carrera', 'Celular', 'Correo Alterno'])
            for e in estudiantes:
                ws.append([
                    e.nombre_completo, e.matricula,
                    e.carrera.nombre if e.carrera else '',
                    e.celular or '', e.correo_alterno or '',
                ])
            output = BytesIO()
            wb.save(output)
            output.seek(0)
            return Response(
                output.getvalue(),
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                headers={'Content-Disposition': 'attachment; filename=estudiantes.xlsx'},
            )
        except ImportError:
            return jsonify({'error': 'openpyxl no instalado'}), 500

    # CSV
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Nombre', 'Matrícula', 'Carrera', 'Celular', 'Correo Alterno'])
    for e in estudiantes:
        writer.writerow([
            e.nombre_completo, e.matricula,
            e.carrera.nombre if e.carrera else '',
            e.celular or '', e.correo_alterno or '',
        ])

    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=estudiantes.csv'},
    )


@admin_bp.route('/reportes/preregistros', methods=['GET'])
@role_required('Admin')
def reporte_preregistros():
    formato = request.args.get('formato', 'csv')
    periodo = request.args.get('periodo', '').strip()
    carrera = request.args.get('carrera', '').strip()
    socio_formador = request.args.get('socio_formador', '').strip()
    crn = request.args.get('crn', '').strip()

    query = PreRegistro.query.join(Estudiante).join(Servicio).join(
        Carrera, Estudiante.carrera_id == Carrera.id
    )
    if periodo:
        query = query.filter(Servicio.periodo == periodo)
    if carrera:
        query = query.filter(Carrera.nombre.ilike(f'%{carrera}%'))
    if crn:
        query = query.filter(Servicio.crn.ilike(f'%{crn}%'))
    if socio_formador:
        query = query.join(SocioFormador, SocioFormador.id == Servicio.socio_formador_id)\
            .filter(SocioFormador.nombre.ilike(f'%{socio_formador}%'))
    registros = query.order_by(PreRegistro.fecha_registro.desc()).all()

    rows = []
    for r in registros:
        rows.append([
            r.estudiante.nombre_completo,
            r.estudiante.matricula,
            r.estudiante.carrera.nombre if r.estudiante.carrera else '',
            r.servicio.crn,
            r.servicio.descripcion,
            r.servicio.periodo,
            r.fecha_registro.strftime('%Y-%m-%d %H:%M') if r.fecha_registro else '',
        ])

    headers_row = ['Nombre', 'Matrícula', 'Carrera', 'CRN', 'Servicio', 'Periodo', 'Fecha Registro']

    if formato == 'excel':
        try:
            from openpyxl import Workbook
            wb = Workbook()
            ws = wb.active
            ws.title = 'Pre-registros'
            ws.append(headers_row)
            for row in rows:
                ws.append(row)
            output = BytesIO()
            wb.save(output)
            output.seek(0)
            return Response(
                output.getvalue(),
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                headers={'Content-Disposition': 'attachment; filename=preregistros.xlsx'},
            )
        except ImportError:
            return jsonify({'error': 'openpyxl no instalado'}), 500

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(headers_row)
    for row in rows:
        writer.writerow(row)

    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=preregistros.csv'},
    )


# Endpoint adicional: carreras (público, para el registro)
@admin_bp.route('/carreras', methods=['GET'])
def get_carreras():
    carreras = Carrera.query.order_by(Carrera.nombre).all()
    return jsonify([{'id': c.id, 'nombre': c.nombre, 'abreviatura': c.abreviatura} for c in carreras])


# ═══════════════════════════════════════════
#   RESET PASSWORD (Admin)
# ═══════════════════════════════════════════

@admin_bp.route('/admin/usuarios/<int:id>/reset-password', methods=['PUT'])
@role_required('Admin')
def reset_user_password(id):
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()
    new_password = data.get('new_password', '')

    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'La nueva contraseña debe tener al menos 6 caracteres'}), 400

    usuario.password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()
    db.session.commit()
    return jsonify({'message': 'Contraseña restablecida correctamente'})


# ═══════════════════════════════════════════
#   GESTIÓN ESTUDIANTES
# ═══════════════════════════════════════════

@admin_bp.route('/admin/estudiantes', methods=['GET'])
@role_required('Admin')
def get_estudiantes():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    q = request.args.get('q', '').strip()

    query = Estudiante.query.join(Carrera).join(Usuario).order_by(Estudiante.nombre_completo)
    if q:
        query = query.filter(
            db.or_(
                Estudiante.nombre_completo.ilike(f'%{q}%'),
                Estudiante.matricula.ilike(f'%{q}%'),
                Usuario.username.ilike(f'%{q}%'),
            )
        )

    items, pagination = paginate_query(query, page, per_page)
    return jsonify({
        'data': [{
            'id': e.id,
            'nombre_completo': e.nombre_completo,
            'matricula': e.matricula,
            'carrera': e.carrera.nombre if e.carrera else '',
            'carrera_id': e.carrera_id,
            'celular': e.celular or '',
            'correo_alterno': e.correo_alterno or '',
            'username': e.usuario.username if e.usuario else '',
            'usuario_id': e.usuario_id,
        } for e in items],
        'pagination': pagination,
    })


@admin_bp.route('/admin/estudiantes', methods=['POST'])
@role_required('Admin')
def create_estudiante():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    nombre = data.get('nombre_completo', '').strip()
    matricula = data.get('matricula', '').strip().lower()
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

    return jsonify({'id': estudiante.id, 'message': 'Estudiante creado'}), 201


@admin_bp.route('/admin/estudiantes/<int:id>', methods=['PUT'])
@role_required('Admin')
def update_estudiante(id):
    estudiante = Estudiante.query.get_or_404(id)
    data = request.get_json()

    if 'nombre_completo' in data:
        nombre = data['nombre_completo'].strip()
        if nombre:
            estudiante.nombre_completo = nombre

    if 'carrera_id' in data:
        carrera_id = data['carrera_id']
        if not Carrera.query.get(carrera_id):
            return jsonify({'error': 'Carrera no válida'}), 400
        estudiante.carrera_id = carrera_id

    if 'celular' in data:
        estudiante.celular = data['celular'].strip() or None

    if 'correo_alterno' in data:
        correo = data['correo_alterno'].strip() or None
        if correo:
            existing = Estudiante.query.filter(
                Estudiante.correo_alterno == correo,
                Estudiante.id != id
            ).first()
            if existing:
                return jsonify({'error': 'El correo alterno ya está registrado'}), 409
        estudiante.correo_alterno = correo

    db.session.commit()
    return jsonify({'message': 'Estudiante actualizado'})


@admin_bp.route('/admin/estudiantes/<int:id>', methods=['DELETE'])
@role_required('Admin')
def delete_estudiante(id):
    estudiante = Estudiante.query.get_or_404(id)
    usuario_id = estudiante.usuario_id

    PreRegistro.query.filter_by(estudiante_id=id).delete()
    AsistenciaFeria.query.filter_by(estudiante_id=id).delete()
    db.session.delete(estudiante)

    if usuario_id:
        usuario = Usuario.query.get(usuario_id)
        if usuario:
            db.session.delete(usuario)

    db.session.commit()
    return jsonify({'message': 'Estudiante eliminado'})


# ═══════════════════════════════════════════
#   GESTIÓN BECARIOS
# ═══════════════════════════════════════════

@admin_bp.route('/admin/becarios', methods=['GET'])
@role_required('Admin')
def get_becarios():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Usuario.query.filter_by(rol='Becario').order_by(Usuario.username)
    items, pagination = paginate_query(query, page, per_page)
    return jsonify({
        'data': [{'id': u.id, 'username': u.username} for u in items],
        'pagination': pagination,
    })


@admin_bp.route('/admin/becarios', methods=['POST'])
@role_required('Admin')
def create_becario():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({'error': 'El nombre de usuario ya existe'}), 409

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = Usuario(username=username, password_hash=password_hash, rol='Becario')
    db.session.add(user)
    db.session.commit()

    return jsonify({'id': user.id, 'message': 'Becario creado'}), 201


@admin_bp.route('/admin/becarios/<int:id>', methods=['DELETE'])
@role_required('Admin')
def delete_becario(id):
    usuario = Usuario.query.get_or_404(id)
    if usuario.rol != 'Becario':
        return jsonify({'error': 'El usuario no es un becario'}), 400
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({'message': 'Becario eliminado'})


# ═══════════════════════════════════════════
#   GESTIÓN CARRERAS
# ═══════════════════════════════════════════

@admin_bp.route('/admin/carreras', methods=['GET'])
@role_required('Admin')
def get_carreras_admin():
    carreras = Carrera.query.order_by(Carrera.nombre).all()
    return jsonify([{'id': c.id, 'nombre': c.nombre, 'abreviatura': c.abreviatura} for c in carreras])


@admin_bp.route('/admin/carreras', methods=['POST'])
@role_required('Admin')
def create_carrera():
    data = request.get_json()
    nombre = data.get('nombre', '').strip()
    abreviatura = data.get('abreviatura', '').strip()

    if not nombre or not abreviatura:
        return jsonify({'error': 'Nombre y abreviatura son requeridos'}), 400

    if Carrera.query.filter_by(nombre=nombre).first():
        return jsonify({'error': 'Ya existe una carrera con ese nombre'}), 409

    if Carrera.query.filter_by(abreviatura=abreviatura).first():
        return jsonify({'error': 'Ya existe una carrera con esa abreviatura'}), 409

    carrera = Carrera(nombre=nombre, abreviatura=abreviatura)
    db.session.add(carrera)
    db.session.commit()
    return jsonify({'id': carrera.id, 'message': 'Carrera creada'}), 201


@admin_bp.route('/admin/carreras/<int:id>', methods=['PUT'])
@role_required('Admin')
def update_carrera(id):
    carrera = Carrera.query.get_or_404(id)
    data = request.get_json()

    if 'nombre' in data:
        nombre = data['nombre'].strip()
        if nombre and nombre != carrera.nombre:
            if Carrera.query.filter(Carrera.nombre == nombre, Carrera.id != id).first():
                return jsonify({'error': 'Ya existe una carrera con ese nombre'}), 409
            carrera.nombre = nombre

    if 'abreviatura' in data:
        abreviatura = data['abreviatura'].strip()
        if abreviatura and abreviatura != carrera.abreviatura:
            if Carrera.query.filter(Carrera.abreviatura == abreviatura, Carrera.id != id).first():
                return jsonify({'error': 'Ya existe una carrera con esa abreviatura'}), 409
            carrera.abreviatura = abreviatura

    db.session.commit()
    return jsonify({'message': 'Carrera actualizada'})


@admin_bp.route('/admin/carreras/<int:id>', methods=['DELETE'])
@role_required('Admin')
def delete_carrera(id):
    carrera = Carrera.query.get_or_404(id)
    if Estudiante.query.filter_by(carrera_id=carrera.id).first() is not None:
        return jsonify({'error': 'No se puede eliminar: hay estudiantes asignados a esta carrera'}), 409
    db.session.delete(carrera)
    db.session.commit()
    return jsonify({'message': 'Carrera eliminada'})


# ═══════════════════════════════════════════
#   REBOOT FERIA
# ═══════════════════════════════════════════

@admin_bp.route('/admin/reboot-feria', methods=['DELETE'])
@role_required('Admin')
def reboot_feria():
    data = request.get_json()
    periodo = data.get('periodo', '').strip()
    if not periodo:
        return jsonify({'error': 'El periodo es requerido'}), 400

    deleted = AsistenciaFeria.query.filter_by(periodo=periodo).delete()
    db.session.commit()
    return jsonify({'message': f'Se eliminaron {deleted} registros de asistencia del periodo {periodo}', 'deleted': deleted})
