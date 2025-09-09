# ⚠️ OBSOLETO - Guía de Despliegue en Render con SQLite + Persistent Disk

> **NOTA IMPORTANTE**: Esta guía está obsoleta. El proyecto ahora usa **Turso** (SQLite en la nube) en lugar de Persistent Disk.
> 
> **Ver la nueva guía**: `DEPLOY.md`
> 
> **Ventajas de Turso**:
> - ✅ Sin costos adicionales (vs $7.25/mes de Persistent Disk)
> - ✅ Sin problemas de permisos
> - ✅ Mejor rendimiento y escalabilidad
> - ✅ Configuración más simple

---

Esta guía te llevará paso a paso para desplegar tu API de GoGestia en Render usando SQLite con Persistent Disk para persistencia de datos.

## 📋 Requisitos Previos

- ✅ Cuenta en [Render](https://render.com) (plan Starter o superior)
- ✅ Repositorio en GitHub con el código
- ✅ Configuración de Auth0 completada

## 🗄️ Paso 1: Crear Persistent Disk

### 1.1 Acceder a Render Dashboard
1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Haz clic en **"New +"** (esquina superior derecha)
3. Selecciona **"Persistent Disk"**

### 1.2 Configurar el Disco
```
Name: gogestia-sqlite-disk
Size: 1 GB (suficiente para SQLite)
Region: Oregon (US West) - elige la más cercana
```

### 1.3 Crear el Disco
- Haz clic en **"Create Persistent Disk"**
- ⏱️ Espera unos minutos a que se cree
- 📝 Anota el nombre del disco: `gogestia-sqlite-disk`

## 🌐 Paso 2: Crear Web Service

### 2.1 Crear Nuevo Servicio
1. Ve al Dashboard de Render
2. Haz clic en **"New +"**
3. Selecciona **"Web Service"**

### 2.2 Conectar Repositorio
1. Conecta tu cuenta de GitHub si no lo has hecho
2. Busca y selecciona: `AlexAlvarezAlmendros/GoGestiaAPI`
3. Haz clic en **"Connect"**

### 2.3 Configuración Básica
```
Name: gogestia-api
Environment: Node
Region: Oregon (US West) - misma que el disco
Branch: auth0-implementation (o main)
```

### 2.4 Build & Deploy Settings
```
Build Command: npm run render-build
Start Command: npm run render-start
```

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Ir a Environment Variables
En la configuración del Web Service, ve a la sección **"Environment"**

### 3.2 Añadir Variables
Añade las siguientes variables una por una:

```bash
# Configuración de entorno
NODE_ENV=production
PORT=10000

# Configuración del disco persistente
PERSISTENT_DISK_PATH=/opt/render/project/data

# Auth0 Configuration
AUTH0_DOMAIN=docai.eu.auth0.com
AUTH0_CLIENT_ID=oHmZTcSJFM03PCzLrE52AiKYbcwejb9P
AUTH0_CLIENT_SECRET=tu_client_secret_aqui
AUTH0_AUDIENCE=gogestia

# JWT Configuration  
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Email Configuration (opcional)
SMTP_HOST=tu_smtp_host
SMTP_PORT=587
SMTP_USER=tu_email@dominio.com
SMTP_PASS=tu_password_email
FROM_EMAIL=noreply@gogestia.com

# API Keys (opcional)
IMGBB_API_KEY=tu_imgbb_api_key_aqui
```

> ⚠️ **IMPORTANTE**: Reemplaza los valores de ejemplo con tus credenciales reales

## 🔗 Paso 4: Conectar Persistent Disk

### 4.1 En Environment Settings
En la misma página de configuración, busca la sección **"Persistent Disks"**

### 4.2 Añadir Disco
```
Disk: gogestia-sqlite-disk (selecciona el que creaste)
Mount Path: /opt/render/project/data
```

### 4.3 Guardar Configuración
Haz clic en **"Save Changes"**

## 🚀 Paso 5: Desplegar

### 5.1 Deploy Manual
1. Ve a la pestaña **"Deploys"**
2. Haz clic en **"Deploy latest commit"**
3. ⏱️ Espera 5-10 minutos para el primer deploy

### 5.2 Monitorear Deploy
Observa los logs para verificar que:
- ✅ El disco persistente se monta correctamente
- ✅ La base de datos SQLite se crea en el disco
- ✅ Los modelos se sincronizan
- ✅ Los datos por defecto se crean
- ✅ El servidor inicia correctamente

### 5.3 Logs Esperados
```
🚀 Iniciando configuración de base de datos para producción...
📁 Verificando directorio del disco persistente: /opt/render/project/data
✅ Directorio del disco persistente existe
✅ Permisos de escritura verificados
📁 Base de datos SQLite en producción: /opt/render/project/data/database.sqlite
🔗 Probando conexión a la base de datos...
✅ Conexión a SQLite establecida
🔄 Sincronizando modelos de base de datos...
✅ Modelos sincronizados
🌱 Verificando datos por defecto...
📝 Creando categorías por defecto...
✅ 3 categorías creadas
🎉 Base de datos inicializada correctamente para producción
🚀 Servidor ejecutándose en puerto 10000
```

## ✅ Paso 6: Verificar Funcionamiento

### 6.1 Obtener URL
Tu API estará disponible en: `https://gogestia-api.onrender.com`

### 6.2 Probar Endpoints
```bash
# Health check
GET https://gogestia-api.onrender.com/api/health

# Blog público
GET https://gogestia-api.onrender.com/api/blog/posts

# Categorías
GET https://gogestia-api.onrender.com/api/blog/categories
```

### 6.3 Probar Auth0
```bash
# Endpoint protegido (requiere token)
POST https://gogestia-api.onrender.com/api/blog/posts
Authorization: Bearer tu_token_auth0
```

## 🛠️ Configuración de Dominio (Opcional)

### 6.1 Dominio Personalizado
1. Ve a **"Settings"** de tu Web Service
2. En la sección **"Custom Domains"**
3. Añade tu dominio: `api.gogestia.com`
4. Configura los DNS según las instrucciones

### 6.2 SSL Automático
Render configura SSL automáticamente para dominios personalizados.

## 📊 Monitoreo y Mantenimiento

### 📈 Métricas
- **CPU Usage**: Disponible en el dashboard
- **Memory Usage**: Monitoreo automático
- **Disk Usage**: Verifica el uso del persistent disk

### 🔄 Backups
- **Automáticos**: Render hace backups del persistent disk
- **Manuales**: Puedes crear snapshots desde el dashboard

### 📝 Logs
- Accede a logs en tiempo real desde el dashboard
- Logs se mantienen por 7 días en plan Starter

## 🚨 Troubleshooting

### Problema: Error de permisos en disco
```bash
# Verificar en logs:
❌ Error de permisos en disco persistente

# Solución:
# 1. Verificar que PERSISTENT_DISK_PATH=/opt/render/project/data
# 2. Redeploy el servicio
```

### Problema: Base de datos no se inicializa
```bash
# Verificar en logs:
❌ Error inicializando base de datos

# Solución:
# 1. Verificar variables de entorno
# 2. Revisar que el disco esté montado correctamente
# 3. Check logs completos para error específico
```

### Problema: Auth0 no funciona
```bash
# Verificar variables:
AUTH0_DOMAIN=docai.eu.auth0.com
AUTH0_CLIENT_ID=oHmZTcSJFM03PCzLrE52AiKYbcwejb9P
AUTH0_CLIENT_SECRET=tu_secret_real
AUTH0_AUDIENCE=gogestia

# También verificar que la URL de Render esté en Auth0 Allowed Origins
```

## 💰 Costos Estimados

```
Web Service (Starter): $7/mes
Persistent Disk (1GB): $0.25/mes
TOTAL: ~$7.25/mes
```

## 🎉 ¡Listo!

Tu API está ahora desplegada en Render con:
- ✅ SQLite persistente en disco dedicado
- ✅ Auth0 funcionando correctamente
- ✅ Endpoints públicos y protegidos
- ✅ SSL automático
- ✅ Monitoreo incluido

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en el dashboard de Render
2. Verifica las variables de entorno
3. Consulta esta documentación
4. Contacta soporte de Render si es necesario

¡Tu API está lista para producción! 🚀
