const axios = require('axios');

async function testUploadEndpoint() {
  try {
    console.log('Probando endpoint /api/upload/image...');
    
    // Intentar hacer una solicitud POST básica (sin archivo)
    const response = await axios.post('http://localhost:3000/api/upload/image', {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Endpoint responde correctamente');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('✅ Endpoint responde (con error esperado)');
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ No se puede conectar al servidor');
      console.log('Asegúrate de que el servidor esté ejecutándose en puerto 3000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testUploadEndpoint();
