# 🔐 Autenticación con Auth0

Este proyecto incluye un sistema completo de autenticación usando Auth0, permitiendo registro, login y gestión de usuarios sin roles específicos.

## 🚀 Características Implementadas

- ✅ **Registro de usuarios** con validación completa
- ✅ **Login/Logout** seguro con JWT tokens
- ✅ **Gestión de perfil** (ver y actualizar)
- ✅ **Refresh tokens** para mantener sesiones
- ✅ **Validación de emails** y contraseñas seguras
- ✅ **Recuperación de contraseña**
- ✅ **Middleware de autenticación** para rutas protegidas
- ✅ **Base de datos local** sincronizada con Auth0
- ✅ **Manejo de errores** completo y específico

## 📁 Estructura de Archivos

```
src/
├── config/
│   └── auth0.js              # Configuración de Auth0
├── controllers/
│   └── authController.js     # Controlador de autenticación
├── middleware/
│   └── authValidation.js     # Validaciones para auth
├── models/
│   └── User.js              # Modelo de usuario
├── routes/
│   └── auth.js              # Rutas de autenticación
└── services/
    └── authService.js       # Lógica de negocio de auth

scripts/
└── init-users-table.js     # Script para inicializar tabla users

test-auth0.js               # Pruebas completas del sistema
AUTH0_SETUP.md             # Guía de configuración detallada
```

## 🛠️ Configuración Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Auth0
1. Crea una cuenta en [Auth0](https://auth0.com)
2. Configura una aplicación "Machine to Machine"
3. Crea una API identifier
4. Actualiza las variables en `.env`:

```env
AUTH0_DOMAIN=tu-dominio.auth0.com
AUTH0_CLIENT_ID=tu-client-id
AUTH0_CLIENT_SECRET=tu-client-secret  
AUTH0_AUDIENCE=https://tu-api-identifier
JWT_SECRET=tu-jwt-secret
```

### 3. Inicializar base de datos
```bash
npm run db:init-users
```

### 4. Iniciar servidor
```bash
npm start
```

### 5. Probar la implementación
```bash
npm run test:auth
```

## 📚 Endpoints Disponibles

### 🌐 Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `POST` | `/api/auth/refresh-token` | Refrescar token |
| `POST` | `/api/auth/request-password-reset` | Solicitar cambio de contraseña |

### 🔒 Protegidos (requieren Bearer token)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/auth/profile` | Obtener perfil del usuario |
| `PUT` | `/api/auth/profile` | Actualizar perfil |
| `POST` | `/api/auth/send-verification-email` | Enviar email de verificación |
| `GET` | `/api/auth/me` | Verificar autenticación |

## 🧪 Ejemplos de Uso

### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "Password123!",
    "name": "Juan Pérez",
    "nickname": "juanp"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com", 
    "password": "Password123!"
  }'
```

### Acceder a ruta protegida
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

## 🔧 Validaciones Implementadas

### Contraseña
- Mínimo 8 caracteres
- Al menos: 1 minúscula, 1 mayúscula, 1 número, 1 carácter especial

### Email
- Formato válido
- Entre 5 y 100 caracteres

### Nombre
- Entre 2 y 100 caracteres
- Solo letras y espacios

## 📊 Respuestas de API

### Éxito en Login
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
    "emailVerified": false
  }
}
```

### Error de Validación
```json
{
  "success": false,
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "msg": "La contraseña debe tener entre 8 y 128 caracteres",
      "param": "password",
      "location": "body"
    }
  ]
}
```

## 🔒 Seguridad

- ✅ **JWT Tokens** con expiración automática
- ✅ **Refresh Tokens** para renovación segura
- ✅ **Validación de entrada** exhaustiva
- ✅ **Rate Limiting** en todas las rutas
- ✅ **CORS** configurado apropiadamente
- ✅ **Helmet** para headers de seguridad
- ✅ **Auth0** maneja el almacenamiento seguro de contraseñas

## 🚨 Troubleshooting

### "jwt audience invalid"
- Verifica que `AUTH0_AUDIENCE` coincida con tu API identifier en Auth0

### "Unable to verify certificate"
- En desarrollo, puedes usar: `NODE_TLS_REJECT_UNAUTHORIZED=0`

### "User already exists"
- Normal al probar. El email debe ser único.

## 📈 Próximos Pasos

1. **Roles y Permisos**: Implementar RBAC con Auth0
2. **Social Login**: Google, Facebook, GitHub
3. **MFA**: Autenticación de múltiples factores  
4. **Profile Pictures**: Upload de avatares
5. **Email Templates**: Personalizar emails de Auth0

## 📞 Soporte

Para más información, consulta:
- [Documentación de Auth0](https://auth0.com/docs)
- [AUTH0_SETUP.md](./AUTH0_SETUP.md) - Guía detallada
- `test-auth0.js` - Ejemplos de testing
