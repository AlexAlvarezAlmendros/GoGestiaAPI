# Plan de Tareas Backend

## 🎯 Objetivo
Desarrollar el servidor backend para gestionar el formulario de contacto con Node.js, Express y Nodemailer.

## 📋 Tareas

### 1. Configuración inicial del proyecto (2h)
- [ ] Inicializar proyecto Node.js con `npm init`
- [ ] Instalar dependencias: `express`, `nodemailer`, `cors`, `dotenv`
- [ ] Instalar dependencias de desarrollo: `nodemon`, `eslint`
- [ ] Configurar estructura de carpetas básica
- [ ] Crear archivo `.env.example` con variables requeridas
- [ ] Configurar `.gitignore`

### 2. Configuración del servidor Express (1h)
- [ ] Crear archivo `server.js` principal
- [ ] Configurar middleware básico (cors, express.json)
- [ ] Configurar variables de entorno con dotenv
- [ ] Crear health check endpoint (`GET /api/health`)
- [ ] Configurar puerto dinámico para producción

### 3. Implementación del servicio de email (3h)
- [ ] Crear módulo `services/emailService.js`
- [ ] Configurar transporter de Nodemailer con Gmail
- [ ] Implementar función de envío de emails con template HTML
- [ ] Añadir manejo de errores y reintentos
- [ ] Crear templates de email profesionales

### 4. Endpoint de contacto (2h)
- [ ] Crear ruta `POST /api/contact`
- [ ] Implementar validación de campos obligatorios
- [ ] Sanitizar inputs para prevenir XSS
- [ ] Integrar con servicio de email
- [ ] Devolver respuestas apropiadas (success/error)

### 5. Seguridad y validación (2h)
- [ ] Implementar rate limiting para prevenir spam
- [ ] Añadir validación de formato de email
- [ ] Configurar CORS con orígenes específicos
- [ ] Implementar logging de errores
- [ ] Añadir helmet para headers de seguridad

### 6. Testing y documentación (2h)
- [ ] Crear tests manuales del endpoint
- [ ] Documentar API en README
- [ ] Probar integración con Gmail
- [ ] Verificar manejo de errores
- [ ] Crear script de prueba local

### 7. Preparación para despliegue (1h)
- [ ] Configurar scripts en package.json
- [ ] Preparar configuración para Render
- [ ] Verificar variables de entorno necesarias
- [ ] Optimizar para producción
- [ ] Crear documentación de despliegue

## 📊 Estimación total: 13 horas

## 🔧 Stack técnico
- Node.js + Express
- Nodemailer
- Gmail API
- Render (despliegue)

## 📝 Entregables
- Servidor funcional con endpoint de contacto
- Documentación técnica
- Configuración de despliegue
- Templates de email