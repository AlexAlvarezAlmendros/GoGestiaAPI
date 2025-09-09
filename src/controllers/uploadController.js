// Cargar variables de entorno primero
require('dotenv').config();

const ImgBBClient = require('../config/imgbb');
const sharp = require('sharp');
const { Post } = require('../models');

// Inicializar cliente de ImgBB
const imgbb = new ImgBBClient(process.env.IMGBB_API_KEY || 'default_api_key');

// Debug: verificar que la API key se está cargando
console.log('ImgBB API Key configurada:', process.env.IMGBB_API_KEY ? 'Sí (oculta por seguridad)' : 'No');

// Función para optimizar imagen antes de subir
const optimizeImage = async (buffer, maxWidth = 1920, maxHeight = 1080) => {
  try {
    return await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
  } catch (error) {
    console.error('Error optimizing image:', error);
    return buffer; // Retornar buffer original si hay error
  }
};

// Subir imagen a Imgur
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se ha proporcionado ninguna imagen',
        code: 'NO_FILE_PROVIDED'
      });
    }

    // Optimizar imagen antes de subir
    const optimizedBuffer = await optimizeImage(req.file.buffer);

    // Subir a ImgBB
    const result = await imgbb.uploadImage(
      optimizedBuffer,
      req.body.title || 'GoGestia Blog Image',
      req.body.description || ''
    );

    if (result.success) {
      const imageData = result.data;
      
      // Si se proporciona un postId, actualizar el post
      if (req.body.postId) {
        try {
          const post = await Post.findByPk(req.body.postId);
          if (post) {
            post.featured_image = imageData.link;
            await post.save();
          }
        } catch (error) {
          console.error('Error updating post with image:', error);
          // No falla la subida si no se puede actualizar el post
        }
      }
      
      res.json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          id: imageData.id,
          url: imageData.link,
          deleteHash: imageData.deletehash,
          width: imageData.width,
          height: imageData.height,
          size: imageData.size,
          type: imageData.type,
          views: imageData.views,
          thumbnails: {
            small: imageData.thumb || imageData.link,
            medium: imageData.medium || imageData.link,
            large: imageData.display_url || imageData.link,
            huge: imageData.link
          }
        }
      });
    } else {
      throw new Error('Error al subir imagen a ImgBB');
    }
  } catch (error) {
    console.error('Error en uploadImage:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.data?.error || 'Error al procesar la imagen',
      code: 'UPLOAD_ERROR'
    });
  }
};

// Subir múltiples imágenes
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se han proporcionado imágenes',
        code: 'NO_FILES_PROVIDED'
      });
    }

    const uploadPromises = req.files.map(async (file, index) => {
      try {
        const optimizedBuffer = await optimizeImage(file.buffer);
        const result = await imgbb.uploadImage(
          optimizedBuffer,
          req.body.title || `GoGestia Blog Image ${index + 1}`,
          req.body.description || ''
        );

        if (result.success) {
          const imageData = result.data;
          return {
            id: imageData.id,
            url: imageData.link,
            deleteHash: imageData.deletehash,
            width: imageData.width,
            height: imageData.height,
            size: imageData.size,
            type: imageData.type,
            views: imageData.views,
            thumbnails: {
              small: imageData.thumb || imageData.link,
              medium: imageData.medium || imageData.link,
              large: imageData.display_url || imageData.link,
              huge: imageData.link
            }
          };
        }
        throw new Error('Error al subir imagen');
      } catch (error) {
        console.error('Error uploading individual image:', error);
        return { 
          error: error.response?.data?.data?.error || error.message,
          originalName: file.originalname 
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    res.json({
      success: true,
      message: `${successful.length} de ${results.length} imágenes subidas exitosamente`,
      data: {
        uploaded: successful,
        failed: failed,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length
        }
      }
    });
  } catch (error) {
    console.error('Error en uploadImages:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar las imágenes',
      code: 'UPLOAD_MULTIPLE_ERROR'
    });
  }
};

// Eliminar imagen de ImgBB
exports.deleteImage = async (req, res) => {
  try {
    const { deleteHash } = req.params;

    if (!deleteHash) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere la URL de eliminación de la imagen',
        code: 'DELETE_URL_REQUIRED'
      });
    }

    const result = await imgbb.deleteImage(deleteHash);

    if (result.success) {
      res.json({
        success: true,
        message: result.message || 'Imagen eliminada correctamente'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Imagen no encontrada o no se pudo eliminar',
        code: 'IMAGE_NOT_FOUND'
      });
    }
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la imagen',
      code: 'DELETE_ERROR'
    });
  }
};

// Obtener información de imagen
exports.getImageInfo = async (req, res) => {
  try {
    const { imageId } = req.params;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el ID de la imagen',
        code: 'IMAGE_ID_REQUIRED'
      });
    }

    const result = await imgbb.getImage(imageId);

    if (result.success) {
      const imageData = result.data;
      
      res.json({
        success: true,
        data: {
          id: imageData.id,
          url: imageData.link,
          width: imageData.width,
          height: imageData.height,
          size: imageData.size,
          type: imageData.type,
          views: imageData.views,
          title: imageData.title,
          description: imageData.description,
          datetime: imageData.datetime,
          thumbnails: {
            small: imageData.thumb || imageData.link,
            medium: imageData.medium || imageData.link,
            large: imageData.display_url || imageData.link,
            huge: imageData.link
          }
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Imagen no encontrada',
        code: 'IMAGE_NOT_FOUND'
      });
    }
  } catch (error) {
    console.error('Error al obtener información de imagen:', error);
    
    if (error.message.includes('no soporta obtener información')) {
      res.status(501).json({
        success: false,
        error: 'ImgBB no soporta obtener información de imagen por ID. Use la URL directa de la imagen.',
        code: 'FEATURE_NOT_SUPPORTED'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Error al obtener información de la imagen',
        code: 'GET_INFO_ERROR'
      });
    }
  }
};
