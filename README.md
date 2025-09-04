# 🚀 GoGestia API

API backend para el formulario de contacto de GoGestia, desarrollada con Node.js, Express y Nodemailer.

## 📋 Características

- ✅ Endpoint de contacto con validación robusta
- ✅ **API completa de Blog** con sistema de posts, categorías, tags y autores
- ✅ Envío de emails con templates HTML profesionales
- ✅ Rate limiting para prevenir spam
- ✅ Sanitización de inputs para prevenir XSS
- ✅ Logging de errores y monitoreo
- ✅ CORS configurado para producción
- ✅ Headers de seguridad con Helmet
- ✅ Manejo elegante de errores
- ✅ Health check endpoint
- ✅ Base de datos SQLite con Sequelize ORM

## 🛠️ Stack Tecnológico

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **SQLite** - Base de datos ligera
- **Nodemailer** - Servicio de emails
- **Gmail API** - Proveedor de email
- **express-validator** - Validación de datos
- **helmet** - Seguridad HTTP
- **express-rate-limit** - Rate limiting
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Variables de entorno

## 📦 Instalación

### Prerrequisitos
- Node.js 16+ instalado
- Cuenta de Gmail con App Password configurada

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/AlexAlvarezAlmendros/GoGestiaAPI.git
   cd GoGestiaAPI
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus datos:
   ```env
   PORT=3000
   NODE_ENV=development
   
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-app-password
   EMAIL_FROM="GoGestia Contact" <noreply@gogestia.com>
   EMAIL_TO=contacto@gogestia.com
   
   CORS_ORIGIN=http://localhost:3000,https://gogestia.com
   
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=5
   ```

4. **Inicializar la base de datos (nuevo)**
   ```bash
   npm run setup
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

6. **Ejecutar en producción**
   ```bash
   npm start
   ```

## 🔧 Configuración de Gmail

Para usar Gmail como proveedor de email:

1. **Habilitar 2FA** en tu cuenta de Google
2. **Generar App Password**:
   - Ir a [Google Account Security](https://myaccount.google.com/security)
   - Buscar "App passwords"
   - Generar una nueva contraseña para "Mail"
3. **Usar el App Password** en `EMAIL_PASS` (no tu contraseña normal)

## 📚 API Endpoints

### 🏥 Health Check
```http
GET /api/health
```

### 📞 Contacto
```http
POST /api/contact
```

### 📝 Blog API
La API incluye un sistema completo de blog. Para documentación detallada, ver [BLOG_API.md](BLOG_API.md).

#### Endpoints principales:
- `GET /api/blog/posts` - Lista de artículos con filtros y paginación
- `GET /api/blog/posts/:slug` - Artículo específico por slug
- `GET /api/blog/categories` - Lista de categorías
- `GET /api/blog/posts/:slug/related` - Artículos relacionados
- `POST /api/blog/posts/:slug/views` - Incrementar vistas

---

### Health Check (Detalle)
```http
GET /api/health
```

**Respuesta de éxito:**
```json
{
  "status": "ok",
  "message": "GoGestia API está funcionando correctamente",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### Enviar Mensaje de Contacto
```http
POST /api/contact
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+34 600 123 456",
  "company": "Empresa Ejemplo S.L.",
  "position": "Director Comercial",
  "message": "Hola, me gustaría solicitar información sobre sus servicios de gestión empresarial.",
  "acceptPrivacy": true
}
```

**Respuesta de éxito:**
```json
{
  "success": true,
  "message": "Tu solicitud de informe ha sido enviada correctamente. Te contactaremos pronto.",
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "messageId": "1234567890@gmail.com",
    "confirmationSent": true,
    "responseTime": "1250ms"
  },
  "code": "REPORT_REQUEST_SENT"
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "field": "email",
      "message": "Debe proporcionar un email válido",
      "value": "email-invalido"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

### Estado del Servicio
```http
GET /api/contact/status
```

**Respuesta:**
```json
{
  "status": "operational",
  "message": "Servicio de contacto funcionando correctamente",
  "services": {
    "email": "operational",
    "validation": "operational"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔒 Seguridad

### Rate Limiting
- **5 requests** por IP cada **15 minutos**
- Configurable via variables de entorno

### Validaciones
- **Sanitización** de todos los inputs
- **Validación de formato** de email
- **Prevención de XSS** con escape de HTML
- **Longitud máxima** de campos
- **Caracteres permitidos** específicos por campo

### Headers de Seguridad
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### CORS
- Orígenes específicos configurables
- Métodos permitidos: GET, POST
- Headers controlados

## 📧 Templates de Email

### Email al Administrador
- Diseño profesional y responsive
- Información completa del contacto
- Formato fácil de leer
- Links directos para responder

### Email de Confirmación
- Confirmación automática al usuario
- Branding de GoGestia
- Información de tiempos de respuesta
- Diseño moderno y profesional

## 🚀 Despliegue

### Render
1. Conectar repositorio en [Render](https://render.com)
2. Configurar variables de entorno
3. Deploy automático desde `main`

### Variables de Entorno Necesarias
```env
NODE_ENV=production
PORT=10000
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM="GoGestia Contact" <noreply@gogestia.com>
EMAIL_TO=contacto@gogestia.com
CORS_ORIGIN=https://gogestia.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

## 🧪 Testing

### Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev

# Lint del código
npm run lint

# Arreglar problemas de lint
npm run lint:fix
```

### Testing Manual
```bash
# Health check
curl http://localhost:3000/api/health

# Test de contacto
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+34 600 000 000",
    "company": "Test Company S.L.",
    "position": "CEO",
    "message": "This is a test message from the API.",
    "acceptPrivacy": true
  }'

# Estado del servicio
curl http://localhost:3000/api/contact/status

# Test endpoints del blog
npm run test:blog

# O manualmente:
curl http://localhost:3000/api/blog/posts
curl http://localhost:3000/api/blog/categories
curl http://localhost:3000/api/blog/posts/5-errores-digitalizacion-procesos
```

## 📁 Estructura del Proyecto

```
GoGestiaAPI/
├── src/
│   ├── config/
│   │   ├── database.js         # Configuración Sequelize
│   │   └── production.js       # Config de producción
│   ├── models/                 # Modelos de Sequelize
│   │   ├── index.js           # Relaciones entre modelos
│   │   ├── Author.js          # Modelo de autores
│   │   ├── Category.js        # Modelo de categorías
│   │   ├── Post.js            # Modelo de posts
│   │   ├── PostTag.js         # Relación posts-tags
│   │   └── Tag.js             # Modelo de tags
│   ├── routes/
│   │   ├── contact.js         # Rutas del contacto
│   │   └── blog.js            # Rutas del blog
│   ├── services/
│   │   ├── emailService.js    # Servicio de emails
│   │   └── blogService.js     # Lógica de negocio del blog
│   ├── templates/
│   │   └── emailTemplates.js  # Templates HTML
│   ├── utils/
│   │   └── validation.js      # Utilidades de validación
│   └── server.js              # Servidor principal
├── scripts/
│   └── init-database.js       # Inicialización de BD
├── .env.example               # Variables de entorno ejemplo
├── test-blog-api.js          # Pruebas del blog
├── BLOG_API.md               # Documentación del blog
├── .eslintrc.json            # Configuración ESLint
├── .gitignore                # Archivos ignorados por Git
├── package.json              # Dependencias y scripts
└── README.md                 # Esta documentación
```

## 🐛 Troubleshooting

### Error: "Servicio de email no disponible"
- Verificar credenciales de Gmail
- Comprobar que el App Password es correcto
- Revisar configuración de 2FA en Google

### Error: "Rate limit exceeded"
- Esperar 15 minutos antes de reintentar
- Verificar configuración de rate limiting

### Error: "CORS"
- Verificar que el origen está en CORS_ORIGIN
- Comprobar configuración de CORS en el servidor

## 📞 Soporte

Para soporte técnico o preguntas sobre la API:
- **Email**: alex@gogestia.com
- **GitHub Issues**: [Crear issue](https://github.com/AlexAlvarezAlmendros/GoGestiaAPI/issues)

## 📄 Licencia

ISC License - Ver archivo [LICENSE](LICENSE) para más detalles.

---

**GoGestia API** - Desarrollado con ❤️ para optimizar la comunicación empresarial.
