const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const blogService = require('../services/blogService');
const { checkJwt } = require('../config/auth0');
const { requireAuth, requirePermission, requireRole, requireAnyRole, getUserInfo } = require('../middleware/auth0-permissions');

const router = express.Router();

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

// 1. Obtener lista de artículos (PÚBLICO)
// GET /api/blog/posts
router.get('/posts', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser un número entero entre 1 y 50'),
  query('category')
    .optional()
    .isSlug()
    .withMessage('La categoría debe ser un slug válido'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured debe ser un valor booleano'),
  handleValidationErrors
], async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      category: req.query.category,
      search: req.query.search,
      featured: req.query.featured
    };

    const result = await blogService.getPosts(options);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error en GET /posts:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error al obtener posts',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 2. Obtener artículo por slug (PÚBLICO)
// GET /api/blog/posts/:slug
router.get('/posts/:slug', [
  param('slug')
    .isSlug()
    .withMessage('El slug debe ser válido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await blogService.getPostBySlug(slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post no encontrado',
        message: `No se encontró un post con el slug: ${slug}`,
        code: 'POST_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error en GET /posts/:slug:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error al obtener post',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 3. Obtener categorías (PÚBLICO)
// GET /api/blog/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await blogService.getCategories();

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error en GET /categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error al obtener categorías',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 4. Obtener artículos relacionados (PÚBLICO)
// GET /api/blog/posts/:slug/related
router.get('/posts/:slug/related', [
  param('slug')
    .isSlug()
    .withMessage('El slug debe ser válido'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('El límite debe ser un número entero entre 1 y 10'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit) || 4;
    
    const relatedPosts = await blogService.getRelatedPosts(slug, limit);

    res.status(200).json({
      success: true,
      data: relatedPosts
    });
  } catch (error) {
    console.error('Error en GET /posts/:slug/related:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error al obtener posts relacionados',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 5. Incrementar vistas (PÚBLICO)
// POST /api/blog/posts/:slug/views
router.post('/posts/:slug/views', [
  param('slug')
    .isSlug()
    .withMessage('El slug debe ser válido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { slug } = req.params;
    const updated = await blogService.incrementViews(slug);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Post no encontrado',
        message: `No se encontró un post con el slug: ${slug}`,
        code: 'POST_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Views updated'
    });
  } catch (error) {
    console.error('Error en POST /posts/:slug/views:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error al actualizar vistas',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 6. Crear nuevo post
// POST /api/blog/posts
router.post('/posts', 
  checkJwt, 
  requirePermission('create:posts'), // Usar permisos en lugar de roles
  [
    body('title')
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ min: 1, max: 255 })
      .withMessage('El título debe tener entre 1 y 255 caracteres'),
  body('content')
    .notEmpty()
    .withMessage('El contenido es requerido')
    .isLength({ min: 1 })
    .withMessage('El contenido no puede estar vacío'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El extracto no puede exceder 500 caracteres'),
  body('author')
    .notEmpty()
    .withMessage('El autor es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El autor debe tener entre 1 y 100 caracteres'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array'),
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada tag debe tener entre 1 y 50 caracteres'),
  body('category')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('La categoría debe tener entre 1 y 100 caracteres'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published debe ser un valor booleano'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured debe ser un valor booleano'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('La imagen destacada debe ser una URL válida'),
  body('metaTitle')
    .optional()
    .isLength({ max: 255 })
    .withMessage('El meta título no puede exceder 255 caracteres'),
  body('metaDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La meta descripción no puede exceder 500 caracteres'),
  body('slug')
    .optional()
    .isSlug()
    .withMessage('El slug debe ser válido'),
  handleValidationErrors
], async (req, res) => {
  try {
    const postData = {
      title: req.body.title,
      content: req.body.content,
      excerpt: req.body.excerpt,
      author: req.body.author,
      tags: req.body.tags || [],
      category: req.body.category,
      published: req.body.published || false,
      featured: req.body.featured || false,
      featuredImage: req.body.featuredImage,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      slug: req.body.slug
    };

    const newPost = await blogService.createPost(postData);

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: newPost
    });
  } catch (error) {
    console.error('Error en POST /posts:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      postData: req.body
    });
    
    // Manejar errores de validación específicos
    if (error.message.includes('Errores de validación:')) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: error.message,
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (error.message.includes('Ya existe un post con el slug') || error.message.includes('Ya existe un registro con ese slug')) {
      return res.status(409).json({
        success: false,
        error: 'Conflicto',
        message: error.message,
        code: 'SLUG_ALREADY_EXISTS'
      });
    }
    
    if (error.message.includes('Ya existe un registro con ese')) {
      return res.status(409).json({
        success: false,
        error: 'Conflicto',
        message: error.message,
        code: 'UNIQUE_CONSTRAINT_ERROR'
      });
    }
    
    if (error.message.includes('Error de relación:')) {
      return res.status(400).json({
        success: false,
        error: 'Error de relación',
        message: error.message,
        code: 'FOREIGN_KEY_ERROR'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error al crear post',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 7. Actualizar post
// PUT /api/blog/posts/:slug
router.put('/posts/:slug', 
  checkJwt, 
  requirePermission('edit:posts'), // Usar permisos en lugar de roles
  [
    param('slug')
      .isSlug()
      .withMessage('El slug debe ser válido'),
    body('title')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('El título debe tener entre 1 y 255 caracteres'),
    body('content')
      .optional()
      .isLength({ min: 1 })
      .withMessage('El contenido no puede estar vacío'),
    body('excerpt')
      .optional()
      .isLength({ max: 500 })
      .withMessage('El extracto no puede exceder 500 caracteres'),
    body('author')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('El autor debe tener entre 1 y 100 caracteres'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Los tags deben ser un array'),
    body('category')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('La categoría debe tener entre 1 y 100 caracteres'),
    body('published')
      .optional()
      .isBoolean()
      .withMessage('Published debe ser un valor booleano'),
    body('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured debe ser un valor booleano'),
    body('featuredImage')
      .optional()
      .isURL()
      .withMessage('La imagen destacada debe ser una URL válida'),
    body('metaTitle')
      .optional()
      .isLength({ max: 255 })
      .withMessage('El meta título no puede exceder 255 caracteres'),
    body('metaDescription')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La meta descripción no puede exceder 500 caracteres'),
    handleValidationErrors
  ], 
  async (req, res) => {
    try {
      const { slug } = req.params;
      const updateData = req.body;

      const updatedPost = await blogService.updatePost(slug, updateData);

      if (!updatedPost) {
        return res.status(404).json({
          success: false,
          error: 'Post no encontrado',
          message: `No se encontró un post con el slug: ${slug}`,
          code: 'POST_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Post actualizado exitosamente',
        data: updatedPost
      });
    } catch (error) {
      console.error('Error en PUT /posts/:slug:', error);
      
      if (error.message.includes('Ya existe un post con el slug')) {
        return res.status(409).json({
          success: false,
          error: 'Conflicto',
          message: error.message,
          code: 'SLUG_ALREADY_EXISTS'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Error al actualizar post',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
);

// 8. Eliminar post
// DELETE /api/blog/posts/:slug
router.delete('/posts/:slug', 
  checkJwt, 
  requirePermission('delete:posts'), // Usar permisos en lugar de roles
  [
    param('slug')
      .isSlug()
      .withMessage('El slug debe ser válido'),
    handleValidationErrors
  ], 
  async (req, res) => {
    try {
      const { slug } = req.params;
      
      const deleted = await blogService.deletePost(slug);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Post no encontrado',
          message: `No se encontró un post con el slug: ${slug}`,
          code: 'POST_NOT_FOUND'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Post eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en DELETE /posts/:slug:', error);
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Error al eliminar post',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
);

// 9. Listar todos los posts (para administración)
// GET /api/blog/admin/posts
router.get('/admin/posts', 
  checkJwt, 
  requirePermission('read:posts'), // Usar permisos en lugar de roles
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número entero mayor a 0'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entero entre 1 y 100'),
    query('published')
      .optional()
      .isBoolean()
      .withMessage('Published debe ser un valor booleano'),
    handleValidationErrors
  ], 
  async (req, res) => {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        published: req.query.published,
        includeUnpublished: true // Para admin, mostrar todos los posts
      };

      const result = await blogService.getPosts(options);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en GET /admin/posts:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Error al obtener posts',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
);

module.exports = router;
