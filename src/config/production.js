/**
 * Configuración de producción para GoGestia API
 */

const productionConfig = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 10000,
    host: '0.0.0.0',
    keepAliveTimeout: 65000,
    headersTimeout: 66000
  },

  // Configuración de seguridad
  security: {
    rateLimiting: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : false,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
      maxAge: 86400 // 24 horas
    },

    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  },

  // Configuración de email
  email: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    tls: {
      rejectUnauthorized: false
    }
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    requestLogging: true,
    errorLogging: true
  },

  // Timeouts y límites
  limits: {
    requestTimeout: 30000, // 30 segundos
    bodySize: '10mb',
    parameterLimit: 100,
    requestsPerMinute: 60
  },

  // Health check
  healthCheck: {
    path: '/api/health',
    checks: {
      email: true,
      memory: true,
      disk: false
    }
  }
};

module.exports = productionConfig;
