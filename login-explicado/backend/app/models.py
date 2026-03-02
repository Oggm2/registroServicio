from app import db


# ── Modelo Usuario ────────────────────────────────────────────────────────────
# db.Model es la clase base de SQLAlchemy.
# Cada atributo db.Column se convierte en una columna en la tabla de PostgreSQL.
class Usuario(db.Model):
    __tablename__ = 'usuarios'  # nombre real de la tabla en la DB

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)

    # NUNCA se guarda la contraseña en texto plano.
    # Se guarda el hash generado por bcrypt.
    password_hash = db.Column(db.String(255), nullable=False)

    # rol define qué puede hacer el usuario: 'Estudiante', 'Becario', 'Admin'
    rol = db.Column(db.String(20), nullable=False, default='Estudiante')

    # Relación uno-a-uno con Estudiante.
    # backref='usuario' agrega un atributo .usuario a Estudiante automáticamente.
    # uselist=False indica que es uno-a-uno (no una lista).
    estudiante = db.relationship('Estudiante', backref='usuario', uselist=False)


# ── Modelo Estudiante ─────────────────────────────────────────────────────────
# Cada Usuario de rol Estudiante tiene un registro Estudiante asociado
# con sus datos personales (nombre, matrícula, etc.)
class Estudiante(db.Model):
    __tablename__ = 'estudiantes'

    id = db.Column(db.Integer, primary_key=True)

    # ForeignKey: apunta al id de la tabla usuarios.
    # unique=True refuerza la relación uno-a-uno.
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), unique=True)

    nombre_completo = db.Column(db.String(200), nullable=False)
    matricula = db.Column(db.String(30), unique=True, nullable=False)
    carrera_id = db.Column(db.Integer, db.ForeignKey('carreras.id'), nullable=False)
    celular = db.Column(db.String(20))
    correo_alterno = db.Column(db.String(150), unique=True)
