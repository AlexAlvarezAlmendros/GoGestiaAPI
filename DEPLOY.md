# Configuración para Render

## Variables de Entorno Requeridas

Configurar estas variables en el dashboard de Render:

### Configuración Básica
- `NODE_ENV=production`
- `PORT=10000` (Render asigna automáticamente)

### Configuración de Email
- `EMAIL_USER=tu-email@gmail.com`
- `EMAIL_PASS=tu-app-password-de-gmail`
- `EMAIL_FROM="GoGestia Contact" <noreply@gogestia.com>`
- `EMAIL_TO=contacto@gogestia.com`

### Configuración de Seguridad
- `CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com`
- `RATE_LIMIT_WINDOW_MS=900000` (15 minutos)
- `RATE_LIMIT_MAX_REQUESTS=5`

## Configuración del Servicio

### Build Command
```bash
npm install
```

### Start Command
```bash
npm start
```

### Environment
- Node.js

### Health Check Endpoint
- Path: `/api/health`
- Expected Status: 200

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

### 2. Test de Contacto
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

### 3. Estado del Servicio
```bash
curl https://tu-app.onrender.com/api/contact/status
```

## Troubleshooting

### Error: "Application failed to respond"
- Verificar que todas las variables de entorno están configuradas
- Revisar logs en el dashboard de Render
- Verificar que el puerto está configurado correctamente

### Error: "Email service error"
- Verificar credenciales de Gmail
- Comprobar que el App Password es correcto
- Verificar que 2FA está habilitado

### Error: "CORS"
- Verificar que CORS_ORIGIN incluye el dominio correcto
- Comprobar que no hay espacios extra en las URLs

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
