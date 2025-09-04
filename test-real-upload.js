const axios = require('axios');
const FormData = require('form-data');

async function testRealUpload() {
  console.log('=== PRUEBA DE UPLOAD REAL ===');
  
  try {
    // Crear una imagen de prueba simple (1x1 pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');
    
    // Crear FormData como lo haría un cliente real
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    formData.append('title', 'Test Image from API');
    formData.append('description', 'Imagen de prueba desde el endpoint');
    
    console.log('Enviando POST a /api/upload/image...');
    
    const response = await axios.post(
      'http://localhost:3000/api/upload/image',
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 segundos de timeout
      }
    );
    
    console.log('✅ Upload exitoso!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error del servidor:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ No se puede conectar al servidor');
      console.log('Asegúrate de que el servidor esté ejecutándose en puerto 3000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testRealUpload();
