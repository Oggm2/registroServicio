# Cómo funciona el inicio de sesión — de punta a punta

## Estructura de archivos

```
login-explicado/
├── backend/
│   ├── run.py              ← Arranca el servidor Flask
│   ├── config.py           ← Configuración (DB, JWT, etc.)
│   └── app/
│       ├── __init__.py     ← Crea la app Flask y registra extensiones
│       ├── models.py       ← Tablas de la DB (Usuario, Estudiante)
│       └── routes/
│           └── auth.py     ← Ruta POST /api/auth/login
│
└── frontend/
    └── src/
        ├── main.jsx                          ← Punto de entrada React
        ├── App.jsx                           ← Mapa de rutas
        ├── services/api.js                   ← Cliente HTTP (axios)
        ├── context/AuthContext.jsx           ← Estado global de sesión
        └── components/
            ├── auth/Login.jsx                ← Formulario de login
            └── common/ProtectedRoute.jsx     ← Guardián de rutas
```

---

## El flujo completo cuando el usuario hace clic en "Ingresar"

```
[1] Login.jsx
    El usuario llena el form y hace submit.
    handleSubmit() llama a:
        login(username, password)   ← viene de useAuth()

[2] AuthContext.jsx → login()
    Llama a:
        authAPI.login({ username, password })

[3] api.js → authAPI.login()
    axios hace:
        POST http://localhost:5000/api/auth/login
        Body: { "username": "...", "password": "..." }
    El interceptor de request automáticamente agrega el token
    si ya existía (en este caso no, porque es el login).

[4] Flask → auth.py → def login()
    a) Lee username y password del JSON
    b) Busca el usuario en PostgreSQL:
           SELECT * FROM usuarios WHERE username = '...'
    c) Verifica la contraseña con bcrypt:
           bcrypt.checkpw(password_ingresado, hash_guardado)
    d) Si todo ok, crea un JWT:
           token = create_access_token(identity=user.id)
    e) Responde con JSON:
           { "token": "eyJ...", "user": { id, username, rol, nombre } }

[5] api.js → interceptor de response
    Si la respuesta fue exitosa (200), la pasa tal cual.
    Si fuera 401 en una ruta diferente a /login, limpiaría la sesión.

[6] AuthContext.jsx → login() (continuación)
    Recibe { token, user }
    Guarda en localStorage:
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
    Actualiza el estado:
        setUser(user)
    Devuelve user a Login.jsx

[7] Login.jsx (continuación)
    Recibe el user con su rol.
    Redirige según el rol:
        Estudiante → /feria
        Becario    → /buscar-estudiante
        Admin      → /dashboard
```

---

## Cómo se protegen las rutas

```
App.jsx define:
    <Route path="/dashboard" element={
        <ProtectedRoute roles={['Admin']}>
            <Dashboard />
        </ProtectedRoute>
    } />

ProtectedRoute hace 3 checks en orden:
    1. ¿Todavía está cargando? → mostrar spinner
    2. ¿user es null? → redirigir a /login
    3. ¿El rol del user no está en roles[]? → redirigir a /dashboard
    4. Todo ok → renderizar el componente hijo
```

---

## Cómo funciona la sesión persistente

Cuando el usuario abre la app de nuevo (o recarga):

```
main.jsx renderiza → AuthProvider monta → useEffect() corre:
    1. Lee localStorage.getItem('user')   → string JSON del usuario
    2. Lee localStorage.getItem('token')  → el JWT guardado
    3. Si ambos existen:
           setUser(JSON.parse(stored))    → la sesión se "restaura"
    4. setLoading(false)                  → la app puede renderizarse

Si el token expiró (después de 24h):
    - El backend responde 401 en el siguiente request
    - El interceptor de api.js lo detecta
    - Limpia localStorage y redirige a /login
```

---

## Cómo funciona el JWT en requests posteriores

Después del login, el interceptor de request en api.js agrega automáticamente:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El backend en rutas protegidas usa `@jwt_required()`:
```python
@ruta_bp.route('/datos-privados', methods=['GET'])
@jwt_required()
def datos_privados():
    user_id = get_jwt_identity()  # extrae el id del token
    # ...
```

---

## Tecnologías usadas y por qué

| Tecnología | Qué hace en este proyecto |
|---|---|
| Flask | Framework web de Python que recibe y responde peticiones HTTP |
| SQLAlchemy | ORM: convierte objetos Python ↔ filas de PostgreSQL |
| Flask-JWT-Extended | Genera y valida tokens JWT |
| bcrypt | Hashea contraseñas (nunca se guarda texto plano) |
| Flask-Limiter | Limita intentos de login por IP (anti fuerza bruta) |
| Flask-CORS | Permite que el frontend (puerto 5173) llame al backend (5000) |
| React + Vite | Framework frontend + bundler rápido |
| React Router | Maneja la navegación por URL en el frontend |
| Axios | Cliente HTTP con interceptores (más potente que fetch) |
| Context API | Estado global de React (evita pasar props por 10 niveles) |
| localStorage | Persiste token y datos del usuario entre recargas |
