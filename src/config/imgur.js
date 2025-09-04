const axios = require('axios');

class ImgurClient {
  constructor(clientId) {
    this.clientId = clientId;
    this.baseURL = 'https://api.imgur.com/3';
  }

  async uploadImage(imageBuffer, title = '', description = '') {
    try {
      const base64Image = imageBuffer.toString('base64');
      
      const response = await axios.post(
        `${this.baseURL}/image`,
        {
          image: base64Image,
          type: 'base64',
          title: title,
          description: description
        },
        {
          headers: {
            Authorization: `Client-ID ${this.clientId}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading to Imgur:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteImage(deleteHash) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/image/${deleteHash}`,
        {
          headers: {
            Authorization: `Client-ID ${this.clientId}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting from Imgur:', error.response?.data || error.message);
      throw error;
    }
  }

  async getImage(imageId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/image/${imageId}`,
        {
          headers: {
            Authorization: `Client-ID ${this.clientId}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting image from Imgur:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = ImgurClient;
