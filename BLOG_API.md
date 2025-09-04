# Blog API - GoGestia

Esta documentación describe los endpoints del blog implementados en la API de GoGestia.

## 🚀 Configuración Inicial

### Instalación de Dependencias
```bash
npm install sqlite3 sequelize
```

### Inicialización de la Base de Datos
```bash
# Crear las tablas y poblar con datos de ejemplo
npm run db:init

# O usar el comando completo de setup
npm run setup
```

### Iniciar el Servidor
```bash
# Modo desarrollo con nodemon
npm run dev

# Modo producción
npm start
```

## 📊 Esquema de Base de Datos

### Tablas Principales

#### Posts
- `id` - ID único
- `slug` - Identificador amigable (único)
- `title` - Título del post
- `excerpt` - Resumen del post
- `content` - Contenido completo (HTML/Markdown)
- `featured_image` - URL de imagen destacada
- `category_id` - ID de categoría (FK)
- `author_id` - ID del autor (FK)
- `status` - Estado ('draft', 'published')
- `featured` - Es destacado (boolean)
- `published_at` - Fecha de publicación
- `views` - Contador de vistas
- `read_time` - Tiempo de lectura estimado (minutos)
- `meta_title` - Título para SEO
- `meta_description` - Descripción para SEO
- `meta_keywords` - Palabras clave para SEO

#### Categories
- `id` - ID único
- `name` - Nombre de la categoría
- `slug` - Identificador amigable (único)
- `description` - Descripción de la categoría

#### Authors
- `id` - ID único
- `name` - Nombre del autor
- `email` - Email (único)
- `avatar` - URL del avatar
- `bio` - Biografía del autor

#### Tags
- `id` - ID único
- `name` - Nombre del tag
- `slug` - Identificador amigable (único)

#### Post_Tags (Tabla de relación)
- `post_id` - ID del post (FK)
- `tag_id` - ID del tag (FK)

## 🔗 Endpoints de la API

### Base URL
```
http://localhost:3000/api/blog
```

### 1. Obtener Lista de Artículos
```http
GET /api/blog/posts
```

#### Query Parameters
- `page` (int): Número de página (default: 1)
- `limit` (int): Artículos por página (default: 10, max: 50)
- `category` (string): Filtrar por slug de categoría
- `search` (string): Buscar en título y contenido
- `featured` (boolean): Solo artículos destacados

#### Ejemplo de Respuesta
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "slug": "5-errores-digitalizacion-procesos",
        "title": "5 Errores Comunes en la Digitalización de Procesos Empresariales",
        "excerpt": "Descubre los errores más frecuentes...",
        "featuredImage": "https://example.com/image.jpg",
        "category": {
          "id": 1,
          "name": "Digitalización",
          "slug": "digitalizacion"
        },
        "tags": ["Procesos", "Digitalización", "Errores"],
        "author": {
          "name": "Juan Pérez",
          "avatar": "https://example.com/avatar.jpg"
        },
        "publishedAt": "2024-01-15T10:00:00Z",
        "readTime": 8,
        "views": 245
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 2. Obtener Artículo por Slug
```http
GET /api/blog/posts/:slug
```

#### Ejemplo de Respuesta
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "5-errores-digitalizacion-procesos",
    "title": "5 Errores Comunes en la Digitalización de Procesos Empresariales",
    "excerpt": "Descubre los errores más frecuentes...",
    "content": "Contenido completo en HTML o Markdown",
    "featuredImage": "https://example.com/image.jpg",
    "images": [],
    "category": {
      "id": 1,
      "name": "Digitalización",
      "slug": "digitalizacion"
    },
    "tags": ["Procesos", "Digitalización", "Errores"],
    "author": {
      "name": "Juan Pérez",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Experto en transformación digital"
    },
    "publishedAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-16T14:30:00Z",
    "readTime": 8,
    "views": 245,
    "seo": {
      "metaTitle": "5 Errores Comunes en la Digitalización | GoGestia",
      "metaDescription": "Descubre los errores más frecuentes...",
      "keywords": ["digitalización", "procesos", "errores"]
    }
  }
}
```

### 3. Obtener Categorías
```http
GET /api/blog/categories
```

#### Ejemplo de Respuesta
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Digitalización",
      "slug": "digitalizacion",
      "count": 5
    }
  ]
}
```

### 4. Obtener Artículos Relacionados
```http
GET /api/blog/posts/:slug/related
```

#### Query Parameters
- `limit` (int): Número máximo de artículos relacionados (default: 4, max: 10)

### 5. Incrementar Vistas
```http
POST /api/blog/posts/:slug/views
```

#### Ejemplo de Respuesta
```json
{
  "success": true,
  "message": "Views updated"
}
```

## 🧪 Pruebas

### Ejecutar Todas las Pruebas
```bash
npm run test:all
```

### Pruebas Específicas del Blog
```bash
npm run test:blog
```

### Pruebas Manuales
```bash
# Iniciar servidor
npm run dev

# En otra terminal, ejecutar pruebas
node test-blog-api.js
```

## 📁 Estructura del Código

```
src/
├── config/
│   └── database.js          # Configuración de Sequelize
├── models/
│   ├── index.js            # Definición de relaciones
│   ├── Author.js           # Modelo de autores
│   ├── Category.js         # Modelo de categorías
│   ├── Post.js             # Modelo de posts
│   ├── PostTag.js          # Modelo de relación posts-tags
│   └── Tag.js              # Modelo de tags
├── routes/
│   └── blog.js             # Rutas del blog
├── services/
│   └── blogService.js      # Lógica de negocio
└── server.js               # Servidor principal

scripts/
└── init-database.js        # Script de inicialización

test-blog-api.js            # Pruebas de endpoints
```

## 🔧 Scripts NPM Disponibles

- `npm run db:init` - Inicializar base de datos con datos de ejemplo
- `npm run db:setup` - Alias para db:init
- `npm run setup` - Instalar dependencias e inicializar BD
- `npm run test:blog` - Ejecutar pruebas del blog
- `npm run test:all` - Ejecutar todas las pruebas

## 🎯 Ejemplos de Uso

### Obtener Posts con Filtros
```bash
# Posts destacados
curl "http://localhost:3000/api/blog/posts?featured=true"

# Posts por categoría
curl "http://localhost:3000/api/blog/posts?category=digitalizacion"

# Búsqueda
curl "http://localhost:3000/api/blog/posts?search=automatización"

# Paginación
curl "http://localhost:3000/api/blog/posts?page=2&limit=5"
```

### Obtener Post Específico
```bash
curl "http://localhost:3000/api/blog/posts/5-errores-digitalizacion-procesos"
```

### Incrementar Vistas
```bash
curl -X POST "http://localhost:3000/api/blog/posts/5-errores-digitalizacion-procesos/views"
```

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **SQLite** - Base de datos (fácil para desarrollo)
- **express-validator** - Validación de entrada

## 🔮 Futuras Mejoras

- [ ] Sistema de comentarios
- [ ] Gestión de imágenes múltiples por post
- [ ] Sistema de likes/reacciones
- [ ] Búsqueda avanzada con Elasticsearch
- [ ] Cache con Redis
- [ ] Generación automática de sitemap
- [ ] RSS/Atom feeds
- [ ] Sistema de draft colaborativo
