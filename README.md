# Sistema de Pre-Registro de Servicios

Plataforma web para gestionar el pre-registro de estudiantes en servicios, proyectos y eventos de feria en una institución educativa. Incluye control de asistencias, gestión de socios formadores y un dashboard administrativo con reportes.

---

## Tabla de Contenidos

- [¿Qué hace esta aplicación?](#qué-hace-esta-aplicación)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Base de datos](#base-de-datos)
- [Backend](#backend)
- [Frontend](#frontend)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Roles de usuario](#roles-de-usuario)
- [Endpoints de la API](#endpoints-de-la-api)

---

## ¿Qué hace esta aplicación?

El sistema permite:

- Que **estudiantes** se pre-registren en servicios/proyectos y eventos de feria, gestionen su perfil y vean su historial.
- Que **becarios** busquen estudiantes, validen asistencias, inscriban a estudiantes en servicios y gestionen pre-registros.
- Que **administradores** gestionen usuarios, servicios, socios formadores, carreras, generen reportes en Excel y vean estadísticas en tiempo real.

---

## Tecnologías utilizadas

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.2.0 | Framework de UI |
| Vite | 5.0.0 | Bundler y servidor de desarrollo |
| React Router | 6.20 | Enrutamiento del lado del cliente |
| Axios | 1.6.2 | Cliente HTTP con interceptores |
| Recharts | 2.10.3 | Gráficas y visualización de datos |
| React Hot Toast | 2.4.1 | Notificaciones |
| React Icons | 4.12.0 | Iconos |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Flask | 3.0.0 | Framework web Python |
| Flask-SQLAlchemy | 3.1.1 | ORM para la base de datos |
| Flask-JWT-Extended | 4.6.0 | Autenticación con tokens JWT |
| Flask-CORS | 4.0.0 | Manejo de CORS |
| Flask-Mail | 0.10.0 | Envío de correos electrónicos |
| Flask-Limiter | 3.5.0 | Rate limiting (anti fuerza bruta) |
| Flask-Migrate | 4.0.5 | Migraciones de base de datos |
| bcrypt | 4.1.2 | Hash de contraseñas |
| openpyxl | 3.1.2 | Exportación a Excel |
| Gunicorn | 21.2.0 | Servidor WSGI para producción |

### Base de datos
- **PostgreSQL** — Base de datos relacional principal

---

## Estructura del proyecto

```
registroServicio/
├── BASE.sql                          # Esquema y datos iniciales de la BD
├── login-explicado/                  # Documentación y ejemplos de autenticación
│
└── proyecto-preregistro/             # Proyecto principal
    ├── .env                          # Variables de entorno
    │
    ├── backend/
    │   ├── run.py                    # Punto de entrada del servidor
    │   ├── config.py                 # Configuración de Flask
    │   ├── requirements.txt          # Dependencias Python
    │   └── app/
    │       ├── __init__.py           # App factory (extensiones y blueprints)
    │       ├── models.py             # Modelos ORM (SQLAlchemy)
    │       ├── middleware.py         # Decorador de roles (role_required)
    │       └── routes/
    │           ├── auth.py           # Login, registro, recuperación de contraseña
    │           ├── estudiantes.py    # Perfil y proyectos del estudiante
    │           ├── servicios.py      # CRUD de servicios
    │           ├── preregistros.py   # Gestión de pre-registros
    │           ├── asistencias.py    # Control de asistencias
    │           ├── admin.py          # Dashboard, stats, gestión de usuarios
    │           └── socios_formadores.py  # Empresas socias
    │
    └── frontend/
        ├── vite.config.js            # Config de Vite (puerto 3000, proxy /api)
        ├── index.html                # HTML raíz
        └── src/
            ├── main.jsx              # Punto de entrada React
            ├── App.jsx               # Definición de rutas
            ├── services/
            │   └── api.js            # Cliente Axios con interceptores
            ├── context/
            │   └── AuthContext.jsx   # Estado global de autenticación
            └── components/
                ├── auth/             # Login, Register, ForgotPassword, ResetPassword
                ├── common/           # Layout, Navbar, Sidebar, ProtectedRoute
                ├── estudiante/       # Vistas del estudiante
                ├── becario/          # Vistas del becario
                └── admin/            # Dashboard y gestión administrativa
```

---

## Base de datos

### Configuración inicial

La base de datos se llama `Feria_Servicios` y se maneja con **PostgreSQL**.

Para crearla desde cero, ejecuta el archivo `BASE.sql` que incluye el esquema completo y datos de ejemplo:

```bash
# 1. Conectarte a PostgreSQL y crear el usuario y la base de datos
psql -U postgres

CREATE USER "Feria_User" WITH PASSWORD 'prueba';
CREATE DATABASE "Feria_Servicios" OWNER "Feria_User";
\q

# 2. Importar el esquema y datos
psql -U Feria_User -d Feria_Servicios -f BASE.sql
```

### Tablas principales

| Tabla | Descripción |
|---|---|
| `usuarios` | Credenciales y rol de cada usuario |
| `estudiantes` | Perfil del estudiante (matrícula, carrera, contacto) |
| `carreras` | Catálogo de carreras (IS, LAE, CP) |
| `socios_formadores` | Empresas/organizaciones socias (Google, BBVA, Amazon, etc.) |
| `servicios` | Servicios o proyectos disponibles para registro |
| `eventos_feria` | Eventos de feria con fecha, horario y ubicación |
| `preregistros` | Relación estudiante ↔ servicio (sin duplicados) |
| `asistencias_feria` | Registro de asistencia con estado y hora real |
| `password_reset_tokens` | Tokens para recuperación de contraseña por correo |

### Diagrama simplificado

```
usuarios (1) ──── (1) estudiantes ──── (N) preregistros ──── (N) servicios
                                  └─── (N) asistencias_feria
usuarios ──── rol: Estudiante | Becario | Admin
estudiantes ──── carrera_id → carreras
servicios ──── socio_formador_id → socios_formadores
servicios ──── evento_feria_id → eventos_feria (opcional)
```

---

## Backend

### Arquitectura

El backend usa el patrón **App Factory** de Flask. En `app/__init__.py` se inicializan todas las extensiones y se registran los blueprints:

```python
# Extensiones inicializadas
db          → SQLAlchemy ORM
jwt         → Flask-JWT-Extended (tokens 24h)
cors        → Flask-CORS (orígenes configurables)
limiter     → Flask-Limiter (rate limiting)
mail        → Flask-Mail (SMTP Gmail)
migrate     → Flask-Migrate (migraciones Alembic)
```

### Autenticación JWT

1. El cliente hace POST a `/api/auth/login` con username y password.
2. El backend valida las credenciales con bcrypt y devuelve un token JWT.
3. El token se incluye en cada petición siguiente como header: `Authorization: Bearer <token>`.
4. Los endpoints protegidos usan `@jwt_required()` y el decorador `@role_required('Admin')` para control de acceso por rol.

### Control de roles

El archivo `middleware.py` define el decorador `role_required`:

```python
@role_required('Admin', 'Becario')
def mi_endpoint():
    ...
```

Si el usuario no tiene el rol requerido, la API devuelve `403 Forbidden`.

### Seguridad implementada

- Contraseñas hasheadas con **bcrypt**
- Rate limiting: 5 intentos/min en login, 3/min en registro
- CORS configurado por variables de entorno
- Tokens JWT con expiración de 24 horas
- Tokens de un solo uso para recuperación de contraseña

---

## Frontend

### Conexión con el backend

El frontend se comunica con el backend exclusivamente a través del cliente Axios definido en `src/services/api.js`.

**En desarrollo**, Vite hace proxy de `/api` al backend:

```js
// vite.config.js
server: {
  port: 3000,
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

Así el frontend en `localhost:3000` llama a `/api/auth/login` y Vite lo redirige a `localhost:5000/api/auth/login` sin problemas de CORS.

### Interceptores de Axios

```
Petición saliente → adjunta automáticamente el token JWT del localStorage
Respuesta 401     → borra la sesión y redirige al login
```

### Autenticación en el cliente

El estado de sesión se gestiona con `AuthContext` (React Context API):

- Al iniciar sesión, el token y datos del usuario se guardan en `localStorage`.
- Al recargar la página, la sesión se restaura automáticamente si el token existe.
- `useAuth()` es el hook para acceder al estado de auth en cualquier componente.

### Rutas protegidas

`ProtectedRoute.jsx` envuelve las rutas que requieren autenticación:

- Si no hay sesión → redirige a `/login`
- Si el rol no coincide → redirige al dashboard correspondiente
- Si todo está bien → renderiza el componente

### Rutas de la aplicación

| Ruta | Acceso | Componente |
|---|---|---|
| `/login` | Público | Login.jsx |
| `/register` | Público | Register.jsx |
| `/forgot-password` | Público | ForgotPassword.jsx |
| `/reset-password/:token` | Público | ResetPassword.jsx |
| `/feria` | Estudiante | RegistroFeria.jsx |
| `/mis-proyectos` | Estudiante | MisProyectos.jsx |
| `/servicios` | Estudiante | ServiciosDisponibles.jsx |
| `/mi-perfil` | Estudiante | MiPerfil.jsx |
| `/buscar-estudiante` | Becario / Admin | BuscarEstudiante.jsx |
| `/validar-asistencia` | Becario / Admin | ValidarAsistencia.jsx |
| `/inscribir-servicio` | Becario / Admin | InscribirServicio.jsx |
| `/preregistros` | Becario / Admin | PreRegistros.jsx |
| `/dashboard` | Admin | Dashboard.jsx |
| `/gestion-servicios` | Admin | GestionServicios.jsx |
| `/gestion-socios` | Admin | GestionSocios.jsx |
| `/gestion-estudiantes` | Admin | GestionEstudiantes.jsx |
| `/gestion-becarios` | Admin | GestionBecarios.jsx |
| `/gestion-carreras` | Admin | GestionCarreras.jsx |
| `/reportes` | Admin | Reportes.jsx |

---

## Variables de entorno

Crea el archivo `proyecto-preregistro/.env` con los siguientes valores:

```env
# ── Seguridad ──────────────────────────────────────────
SECRET_KEY=cambia-esta-clave-en-produccion
JWT_SECRET_KEY=cambia-esta-clave-jwt-en-produccion

# ── Base de datos ──────────────────────────────────────
DATABASE_URL=postgresql://Feria_User:prueba@localhost:5432/Feria_Servicios

# ── Correo electrónico (Gmail SMTP) ───────────────────
MAIL_USERNAME=tu-correo@gmail.com
MAIL_PASSWORD=tu-app-password-de-gmail
MAIL_DEFAULT_SENDER=tu-correo@gmail.com

# ── URL del frontend (para links en correos) ──────────
FRONTEND_URL=http://localhost:3000

# ── CORS (en producción usa tu dominio real) ──────────
# CORS_ORIGINS=https://mi-dominio.com
```

> **Nota:** Para `MAIL_PASSWORD` usa una [contraseña de aplicación de Google](https://support.google.com/accounts/answer/185833), no tu contraseña normal.

---

## Instalación y ejecución

### Requisitos previos

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd registroServicio
```

### 2. Configurar la base de datos

```bash
psql -U postgres -c "CREATE USER \"Feria_User\" WITH PASSWORD 'prueba';"
psql -U postgres -c "CREATE DATABASE \"Feria_Servicios\" OWNER \"Feria_User\";"
psql -U Feria_User -d Feria_Servicios -f BASE.sql
```

### 3. Configurar y ejecutar el backend

```bash
cd proyecto-preregistro/backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env (ver sección anterior)
cp ../.env.example ../.env      # o crearlo manualmente

# Ejecutar servidor de desarrollo
python run.py
# El backend corre en http://localhost:5000
```

### 4. Configurar y ejecutar el frontend

```bash
cd proyecto-preregistro/frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
# El frontend corre en http://localhost:3000
```

### 5. Abrir la aplicación

Visita [http://localhost:3000](http://localhost:3000) en tu navegador.

### Producción

```bash
# Backend con Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"

# Frontend: generar build estático
npm run build
# Sirve la carpeta dist/ con Nginx, Apache o cualquier CDN
```

---

## Roles de usuario

| Rol | Descripción | Acceso |
|---|---|---|
| **Estudiante** | Usuario final que se registra en servicios | Perfil, servicios disponibles, registro a feria, mis proyectos |
| **Becario** | Auxiliar que gestiona registros y asistencias | Buscar estudiantes, validar asistencia, inscribir en servicios, pre-registros |
| **Admin** | Administrador del sistema | Todo lo anterior + dashboard, gestión completa, reportes Excel |

---

## Endpoints de la API

### Autenticación `/api/auth`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/login` | Iniciar sesión, devuelve JWT |
| POST | `/register` | Registrar nuevo usuario |
| POST | `/forgot-password` | Enviar correo de recuperación |
| POST | `/reset-password` | Cambiar contraseña con token |

### Estudiantes `/api/estudiantes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/perfil` | Obtener perfil del estudiante autenticado |
| PUT | `/perfil` | Actualizar perfil |
| GET | `/proyectos` | Obtener proyectos del estudiante |

### Servicios `/api/servicios`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar servicios disponibles |
| POST | `/` | Crear servicio (Admin) |
| PUT | `/:id` | Actualizar servicio (Admin) |
| DELETE | `/:id` | Eliminar servicio (Admin) |

### Pre-registros `/api/preregistros`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar pre-registros |
| POST | `/` | Crear pre-registro |
| DELETE | `/:id` | Cancelar pre-registro |

### Asistencias `/api/asistencias-feria`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar asistencias |
| POST | `/` | Registrar asistencia |
| PUT | `/:id` | Actualizar estatus de asistencia |

### Admin `/api/`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/dashboard` | Estadísticas generales |
| GET | `/reportes` | Exportar reportes a Excel |
| GET/POST/PUT/DELETE | `/gestion-*` | CRUD de usuarios, carreras, becarios |

### Socios Formadores `/api/socios-formadores`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Listar socios |
| POST | `/` | Crear socio (Admin) |
| PUT | `/:id` | Actualizar socio (Admin) |
| DELETE | `/:id` | Eliminar socio (Admin) |

---

## Flujo completo de una petición

```
Usuario en navegador (localhost:3000)
    │
    ▼
React Component llama a api.js
    │  POST /api/auth/login  { username, password }
    ▼
Vite Dev Server (proxy)
    │  redirige a localhost:5000/api/auth/login
    ▼
Flask Backend
    │  valida con bcrypt
    │  genera JWT
    ▼
Respuesta: { token, user }
    │
    ▼
AuthContext guarda token en localStorage
    │
    ▼
Interceptor de Axios adjunta token en cada petición siguiente
    │  Authorization: Bearer <token>
    ▼
Flask verifica JWT → extrae rol → ejecuta endpoint
```
