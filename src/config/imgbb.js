const axios = require('axios');

class ImgBBClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.imgbb.com/1';
  }

  async uploadImage(imageBuffer, title = '', description = '') {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      // Usar URLSearchParams en lugar de FormData para mejor compatibilidad
      const params = new URLSearchParams();
      params.append('image', base64Image);
      if (title) params.append('name', title);

      const response = await axios.post(
        `${this.baseURL}/upload?key=${this.apiKey}`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.success) {
        const imageData = response.data.data;
        return {
          success: true,
          data: {
            id: imageData.id,
            link: imageData.url,
            deletehash: imageData.delete_url, // ImgBB usa delete_url en lugar de deletehash
            width: imageData.width,
            height: imageData.height,
            size: imageData.size,
            type: imageData.image.extension,
            views: 0, // ImgBB no proporciona views inmediatamente
            title: imageData.title || title,
            description: description,
            datetime: Math.floor(Date.now() / 1000),
            // URLs de miniaturas específicas de ImgBB
            thumb: imageData.thumb?.url,
            medium: imageData.medium?.url,
            display_url: imageData.display_url
          }
        };
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading to ImgBB:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteImage(deleteUrl) {
    try {
      // ImgBB maneja la eliminación a través de la URL de eliminación directa
      // No necesitamos hacer una llamada API separada, solo retornamos éxito
      // La URL de eliminación debe ser visitada por el usuario para eliminar la imagen
      return {
        success: true,
        message: 'Para eliminar la imagen, visita la URL de eliminación proporcionada'
      };
    } catch (error) {
      console.error('Error deleting from ImgBB:', error.message);
      throw error;
    }
  }

  async getImage(imageId) {
    try {
      // ImgBB no tiene un endpoint público para obtener información de imagen por ID
      // Retornamos un error indicando que esta funcionalidad no está disponible
      throw new Error('ImgBB no soporta obtener información de imagen por ID');
    } catch (error) {
      console.error('Error getting image from ImgBB:', error.message);
      throw error;
    }
  }
}

module.exports = ImgBBClient;
