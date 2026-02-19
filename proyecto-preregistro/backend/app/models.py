from app import db
from datetime import datetime


class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default='Estudiante')

    estudiante = db.relationship('Estudiante', backref='usuario', uselist=False)


class Carrera(db.Model):
    __tablename__ = 'carreras'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), unique=True, nullable=False)
    abreviatura = db.Column(db.String(20), unique=True, nullable=False)

    estudiantes = db.relationship('Estudiante', backref='carrera')


class Estudiante(db.Model):
    __tablename__ = 'estudiantes'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), unique=True)
    nombre_completo = db.Column(db.String(200), nullable=False)
    matricula = db.Column(db.String(30), unique=True, nullable=False)
    carrera_id = db.Column(db.Integer, db.ForeignKey('carreras.id'), nullable=False)
    celular = db.Column(db.String(20))
    correo_alterno = db.Column(db.String(150), unique=True)

    preregistros = db.relationship('PreRegistro', backref='estudiante')
    asistencias = db.relationship('AsistenciaFeria', backref='estudiante')


class SocioFormador(db.Model):
    __tablename__ = 'socios_formadores'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), unique=True, nullable=False)

    servicios = db.relationship('Servicio', backref='socio_formador')


class Servicio(db.Model):
    __tablename__ = 'servicios'
    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(300), nullable=False)
    crn = db.Column(db.String(30), unique=True, nullable=False)
    periodo = db.Column(db.String(30), nullable=False)
    cupo_maximo = db.Column(db.Integer, nullable=False, default=30)
    socio_formador_id = db.Column(db.Integer, db.ForeignKey('socios_formadores.id'), nullable=True)

    preregistros = db.relationship('PreRegistro', backref='servicio')


class PreRegistro(db.Model):
    __tablename__ = 'preregistros'
    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey('estudiantes.id'), nullable=False)
    servicio_id = db.Column(db.Integer, db.ForeignKey('servicios.id'), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('estudiante_id', 'servicio_id', name='uq_estudiante_servicio'),
    )


class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    token = db.Column(db.String(128), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)


class AsistenciaFeria(db.Model):
    __tablename__ = 'asistencias_feria'
    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey('estudiantes.id'), nullable=False)
    fecha_asistencia = db.Column(db.Date, default=datetime.utcnow)
    horario_seleccionado = db.Column(db.String(50), nullable=False)
    hora_real_asistencia = db.Column(db.Time)
    hora_salida = db.Column(db.DateTime)
    estatus_asistencia = db.Column(db.String(30), default='pendiente')
    evento_feria_id = db.Column(db.Integer, nullable=True)
    periodo = db.Column(db.String(30))
