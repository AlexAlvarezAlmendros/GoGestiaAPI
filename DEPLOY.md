# Configuración para Render con Turso

## Variables de Entorno Requeridas

Configurar estas variables en el dashboard de Render:

### Configuración Básica
- `NODE_ENV=production`
- `PORT=10000` (Render asigna automáticamente)

### Base de Datos Turso
- `TURSO_DATABASE_URL=libsql://your-database-name-your-org.turso.io`
- `TURSO_AUTH_TOKEN=your-turso-auth-token`

### Autenticación Auth0
- `AUTH0_DOMAIN=your-tenant.auth0.com`
- `AUTH0_AUDIENCE=your-api-identifier`

### Configuración de Email
- `EMAIL_USER=tu-email@gmail.com`
- `EMAIL_PASS=tu-app-password-de-gmail`
- `EMAIL_FROM="GoGestia Contact" <noreply@gogestia.com>`
- `EMAIL_TO=contacto@gogestia.com`

### Configuración de Seguridad
- `CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com`
- `RATE_LIMIT_WINDOW_MS=900000` (15 minutos)
- `RATE_LIMIT_MAX_REQUESTS=5`

### Servicios Externos
- `IMGUR_CLIENT_ID=your-imgur-client-id` (para subida de imágenes)

## Configuración del Servicio en Render

### Build Command
```bash
npm install && npm run init:production
```

### Start Command
```bash
npm start
```

### Environment
- Node.js (versión 18+)

### Health Check Endpoint
- Path: `/api/health`
- Expected Status: 200

## Configuración de Turso

### Paso 1: Crear Cuenta
1. Ir a [Turso.tech](https://turso.tech)
2. Crear cuenta gratuita
3. Instalar Turso CLI:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

### Paso 2: Configurar Base de Datos
```bash
# Iniciar sesión
turso auth login

# Crear base de datos
turso db create gogestia-api

# Obtener URL de conexión
turso db show gogestia-api --url

# Crear token de autenticación
turso db tokens create gogestia-api
```

### Paso 3: Configurar Variables en Render
1. En el dashboard de Render, ir a "Environment"
2. Agregar `TURSO_DATABASE_URL` con la URL obtenida
3. Agregar `TURSO_AUTH_TOKEN` con el token generado

## Configuración de Auth0

### Paso 1: Crear Aplicación
1. Ir a [Auth0 Dashboard](https://manage.auth0.com)
2. Crear nueva API
3. Configurar permisos: `create:posts`, `edit:posts`, `delete:posts`, `read:posts`

### Paso 2: Configurar Variables
- `AUTH0_DOMAIN`: Tu dominio de Auth0 (ej: `your-tenant.auth0.com`)
- `AUTH0_AUDIENCE`: Identifier de tu API

## Configuración de Gmail

### Paso 1: Habilitar 2FA
1. Ir a [Google Account Security](https://myaccount.google.com/security)
2. Activar "2-Step Verification"

### Paso 2: Generar App Password
1. En "2-Step Verification", buscar "App passwords"
2. Seleccionar "Mail" y generar contraseña
3. Usar esta contraseña en `EMAIL_PASS`

## Verificación Post-Deploy

### 1. Health Check
```bash
curl https://tu-app.onrender.com/api/health
```

### 2. Test de Conexión Base de Datos
El sistema verificará automáticamente la conexión a Turso durante el deploy.

### 3. Test de Contacto
```bash
curl -X POST https://tu-app.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "subject": "Test message",
    "message": "This is a test message.",
    "phone": "+34 600 000 000"
  }'
```

### 4. Test de Blog API (requiere autenticación)
```bash
# Obtener posts públicos
curl https://tu-app.onrender.com/api/blog/posts

# Crear post (requiere token Auth0)
curl -X POST https://tu-app.onrender.com/api/blog/posts \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "Test content",
    "category_id": 1,
    "author_id": 1
  }'
```

## Troubleshooting

### Error: "TURSO_DATABASE_URL no está configurada"
- Verificar que las variables de entorno de Turso están configuradas
- Comprobar que la URL tiene el formato correcto: `libsql://...`
- Verificar que el token de autenticación es válido

### Error: "Application failed to respond"
- Verificar que todas las variables de entorno están configuradas
- Revisar logs en el dashboard de Render
- Verificar que el puerto está configurado correctamente
- Comprobar que Turso está accesible

### Error: "Email service error"
- Verificar credenciales de Gmail
- Comprobar que el App Password es correcto
- Verificar que 2FA está habilitado

### Error: "Auth0 authentication failed"
- Verificar que AUTH0_DOMAIN y AUTH0_AUDIENCE están configurados
- Comprobar que los permisos están configurados en Auth0
- Verificar que el token JWT es válido

### Error: "CORS"
- Verificar que CORS_ORIGIN incluye el dominio correcto
- Comprobar que no hay espacios extra en las URLs

## Ventajas de Turso sobre SQLite + Persistent Disk

### Costos
- **Turso**: Gratis hasta 500 databases
- **Persistent Disk**: $7.25/mes por 1GB
- **Ahorro**: $87/año

### Rendimiento
- **Turso**: Optimizado para la nube, múltiples regiones
- **SQLite**: Limitado a un solo servidor
- **Latencia**: Mejor con Turso global

### Simplicidad
- **Turso**: Sin configuración de discos
- **SQLite**: Requiere persistent disk y permisos
- **Mantenimiento**: Cero con Turso

### Escalabilidad
- **Turso**: Escalado automático
- **SQLite**: Limitado por el disco
- **Backup**: Automático con Turso

## Monitoreo

### Logs
Los logs se pueden ver en tiempo real en el dashboard de Render.

### Métricas
- Response time del health check
- Número de requests por minuto
- Rate limiting activations

### Alertas
Configurar alertas en Render para:
- Health check failures
- High response times  
- Service downtime

## Escalado

### Recursos
- CPU: 0.5 vCPU (suficiente para la carga esperada)
- RAM: 512 MB (ajustar según necesidad)

### Auto-scaling
Render escalará automáticamente basado en:
- CPU usage
- Memory usage  
- Request volume

## Dominio Personalizado

### 1. Configurar DNS
Apuntar el dominio a la URL de Render:
```
CNAME api.gogestia.com -> tu-app.onrender.com
```

### 2. Configurar SSL
Render maneja SSL automáticamente para dominios personalizados.

### 3. Actualizar CORS
Actualizar `CORS_ORIGIN` para incluir el nuevo dominio.

## Backup y Recuperación

### Código
El código está respaldado en GitHub automáticamente.

### Configuración
Exportar variables de entorno regularmente:
```bash
# En el dashboard de Render, ir a Environment y exportar
```

### Logs
Los logs se mantienen por 7 días en Render.

## Contacto de Soporte

Para problemas de despliegue:
- Email: alex@gogestia.com
- GitHub Issues: [Crear issue](https://github.com/AlexAlvarezAlmendros/GoGestiaAPI/issues)
