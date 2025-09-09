# 🔐 Auth0 Implementation Guide

## 📋 Configuración Requerida

### 1. Variables de Entorno (.env)

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_AUDIENCE=https://your-api-identifier
JWT_SECRET=your-jwt-secret-key
```

### 2. Configuración en Auth0 Dashboard

#### Crear una Aplicación:
1. Ve a Auth0 Dashboard > Applications
2. Crea una nueva aplicación tipo "Machine to Machine"
3. Autoriza para Management API v2
4. Copia Domain, Client ID y Client Secret

#### Crear una API:
1. Ve a Auth0 Dashboard > APIs
2. Crea una nueva API
3. Usa el Identifier como AUTH0_AUDIENCE
4. Habilita RBAC si planeas usar roles (opcional)

#### Configurar Database Connection:
1. Ve a Connections > Database
2. Crea una nueva conexión "Username-Password-Authentication"
3. Habilita "Disable Sign Ups" si quieres controlar registros

## 🚀 Endpoints Disponibles

### Públicos (no requieren autenticación)

#### POST /api/auth/register
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!",
  "name": "Juan Pérez",
  "nickname": "juanp" // opcional
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "auth0Id": "auth0|...",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "nickname": "juanp",
    "picture": null,
    "emailVerified": false
  },
  "message": "Usuario registrado exitosamente"
}
```

#### POST /api/auth/login
Autentica un usuario.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "v1.M...",
    "idToken": "eyJ...",
    "tokenType": "Bearer",
    "expiresIn": 86400
  },
  "user": {
    "id": 1,
    "auth0Id": "auth0|...",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "nickname": "juanp",
    "picture": "https://...",
    "emailVerified": false,
    "locale": "es"
  },
  "message": "Login exitoso"
}
```

#### POST /api/auth/refresh-token
Refresca el token de acceso.

**Body:**
```json
{
  "refresh_token": "v1.M..."
}
```

#### POST /api/auth/request-password-reset
Solicita cambio de contraseña.

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

#### POST /api/auth/logout
Cierra sesión (lado cliente).

### Privados (requieren Bearer token)

#### GET /api/auth/profile
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer eyJ...
```

#### PUT /api/auth/profile
Actualiza el perfil del usuario.

**Headers:**
```
Authorization: Bearer eyJ...
```

**Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "nickname": "jcperez",
  "locale": "en"
}
```

#### POST /api/auth/send-verification-email
Envía email de verificación.

#### GET /api/auth/me
Endpoint de prueba para verificar autenticación.

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Completa el archivo `.env` con tus credenciales de Auth0.

### 3. Inicializar tabla de usuarios
```bash
node scripts/init-users-table.js
```

### 4. Iniciar servidor
```bash
npm start
# o para desarrollo
npm run dev
```

## 🧪 Testing

### Probar registro:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Password123!",
    "name": "Usuario de Prueba"
  }'
```

### Probar login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Password123!"
  }'
```

### Probar endpoint protegido:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔒 Validaciones

### Contraseña:
- Mínimo 8 caracteres
- Al menos una minúscula
- Al menos una mayúscula  
- Al menos un número
- Al menos un carácter especial (@$!%*?&)

### Email:
- Formato válido
- Entre 5 y 100 caracteres

### Nombre:
- Entre 2 y 100 caracteres
- Solo letras y espacios

### Nickname:
- Entre 2 y 50 caracteres (opcional)
- Solo letras, números, guiones y guiones bajos

## 📈 Próximos Pasos

1. **Roles y Permisos**: Implementar sistema de roles usando Auth0 RBAC
2. **Social Login**: Añadir login con Google, Facebook, etc.
3. **MFA**: Implementar autenticación de múltiples factores
4. **Rate Limiting**: Añadir límites específicos para endpoints de auth
5. **Audit Logs**: Registrar eventos de autenticación

## 🐛 Troubleshooting

### Error: "Unable to verify the first certificate"
Añade a tu código de testing:
```javascript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Solo para desarrollo
```

### Error: "audience is required"
Verifica que AUTH0_AUDIENCE esté configurado correctamente en .env

### Error: "jwt audience invalid"
El token fue emitido para una audiencia diferente. Verifica la configuración.
