// Cargar variables de entorno PRIMERO
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importar rutas (ahora las variables de entorno ya están disponibles)
const contactRoutes = require('./routes/contact');
const blogRoutes = require('./routes/blog');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const roleRoutes = require('./routes/roles');

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS con soporte para uploads
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  maxAge: 86400 // Cache preflight por 24 horas
};

// Configuración de rate limiting - Más permisivo para uso normal
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // 500 requests por defecto
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Función para omitir rate limiting en endpoints específicos
  skip: (req, res) => {
    // Omitir rate limiting para endpoints de salud y blog público
    const exemptPaths = [
      '/api/health',
      '/api/blog/posts',
      '/api/blog/categories'
    ];
    return exemptPaths.some(path => req.path.startsWith(path));
  }
});

// Rate limiter más estricto para endpoints sensibles
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 requests máximo
  message: {
    error: 'Demasiadas solicitudes a endpoint sensible, intenta de nuevo más tarde.',
    code: 'RATE_LIMIT_STRICT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware de seguridad con soporte para imágenes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "https://i.ibb.co", "https://ibb.co"],
      connectSrc: ["'self'", "https://api.imgbb.com"]
    }
  }
}));

// Middleware básico
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Aplicar rate limiting a todas las rutas
app.use(limiter);

// Logging middleware simple
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'GoGestia API está funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas principales con rate limiting diferenciado
app.use('/api', contactRoutes); // Contact usa rate limiting normal
app.use('/api/blog', blogRoutes); // Blog es público, rate limiting muy permisivo
app.use('/api', strictLimiter, uploadRoutes); // Upload necesita rate limiting estricto  
app.use('/api/auth', strictLimiter, authRoutes); // Auth necesita rate limiting estricto
app.use('/api/roles', strictLimiter, roleRoutes); // Roles necesita rate limiting estricto

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenido a GoGestia API',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      contact: 'POST /api/contact',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        refreshToken: 'POST /api/auth/refresh-token',
        sendVerificationEmail: 'POST /api/auth/send-verification-email',
        requestPasswordReset: 'POST /api/auth/request-password-reset',
        me: 'GET /api/auth/me'
      },
      blog: {
        posts: 'GET /api/blog/posts',
        post: 'GET /api/blog/posts/:slug',
        categories: 'GET /api/blog/categories',
        related: 'GET /api/blog/posts/:slug/related',
        views: 'POST /api/blog/posts/:slug/views'
      },
      upload: {
        image: 'POST /api/upload/image',
        images: 'POST /api/upload/images',
        delete: 'DELETE /api/upload/image/:deleteUrl',
        info: 'GET /api/upload/image/:imageId (Nota: ImgBB no soporta esta función)'
      }
    }
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Middleware de manejo de errores globales
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // Error de autenticación JWT/Auth0
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Token de acceso inválido o ausente',
      message: error.message,
      code: 'UNAUTHORIZED'
    });
  }
  
  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: error.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Error de sintaxis JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'JSON malformado',
      message: 'El cuerpo de la solicitud contiene JSON inválido',
      code: 'INVALID_JSON'
    });
  }
  
  // Error genérico del servidor
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// Manejo de cierre elegante
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Health check disponible en: http://localhost:${PORT}/api/health`);
  
  // Verificar conexión a la base de datos
  try {
    await testConnection();
    console.log('📊 Base de datos conectada correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
  }
});

module.exports = app;
