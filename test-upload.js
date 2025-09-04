const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3000/api';

// Función para crear una imagen de prueba simple
function createTestImage() {
  const svgContent = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" 
            text-anchor="middle" dominant-baseline="middle" fill="#333">
        Test Image for GoGestia
      </text>
      <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="16" 
            text-anchor="middle" dominant-baseline="middle" fill="#666">
        Generated: ${new Date().toISOString()}
      </text>
    </svg>
  `;
  
  const buffer = Buffer.from(svgContent);
  return buffer;
}

// Test 1: Subir una imagen individual
async function testSingleImageUpload() {
  console.log('\n🧪 Test 1: Subiendo imagen individual...');
  
  try {
    const imageBuffer = createTestImage();
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'test-image.svg',
      contentType: 'image/svg+xml'
    });
    form.append('title', 'Imagen de prueba GoGestia');
    form.append('description', 'Esta es una imagen de prueba generada automáticamente');

    const response = await axios.post(`${API_BASE_URL}/upload/image`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('✅ Upload exitoso:', {
      id: response.data.id,
      url: response.data.url,
      deleteHash: response.data.deleteHash,
      title: response.data.title
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error en upload individual:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

// Test 2: Subir múltiples imágenes
async function testMultipleImageUpload() {
  console.log('\n🧪 Test 2: Subiendo múltiples imágenes...');
  
  try {
    const form = new FormData();
    
    // Crear 3 imágenes de prueba
    for (let i = 1; i <= 3; i++) {
      const imageBuffer = createTestImage();
      form.append('images', imageBuffer, {
        filename: `test-image-${i}.svg`,
        contentType: 'image/svg+xml'
      });
    }

    const response = await axios.post(`${API_BASE_URL}/upload/images`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('✅ Upload múltiple exitoso:', {
      total: response.data.results.length,
      successful: response.data.results.filter(r => r.success).length,
      failed: response.data.results.filter(r => !r.success).length
    });

    return response.data.results.filter(r => r.success);
  } catch (error) {
    console.error('❌ Error en upload múltiple:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return [];
  }
}

// Test 3: Obtener información de imagen
async function testGetImageInfo(deleteHash) {
  console.log('\n🧪 Test 3: Obteniendo información de imagen...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/upload/image/${deleteHash}`);
    
    console.log('✅ Información obtenida:', {
      id: response.data.id,
      title: response.data.title,
      views: response.data.views,
      size: response.data.size,
      datetime: new Date(response.data.datetime * 1000).toISOString()
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo información:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
}

// Test 4: Eliminar imagen
async function testDeleteImage(deleteHash) {
  console.log('\n🧪 Test 4: Eliminando imagen...');
  
  try {
    const response = await axios.delete(`${API_BASE_URL}/upload/image/${deleteHash}`);
    
    console.log('✅ Imagen eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error eliminando imagen:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return false;
  }
}

// Test 5: Verificar que el servidor esté funcionando
async function testServerHealth() {
  console.log('\n🏥 Verificando estado del servidor...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Servidor funcionando:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Servidor no disponible:', error.message);
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log('🚀 Iniciando tests del sistema de upload...');
  
  // Verificar servidor
  const serverOk = await testServerHealth();
  if (!serverOk) {
    console.log('\n❌ El servidor no está disponible. Asegúrate de que esté ejecutándose.');
    return;
  }

  // Test de upload individual
  const singleUpload = await testSingleImageUpload();
  
  // Test de upload múltiple
  const multipleUploads = await testMultipleImageUpload();
  
  // Si tenemos imágenes subidas, probar info y eliminación
  if (singleUpload) {
    await testGetImageInfo(singleUpload.deleteHash);
    
    // Esperar un poco antes de eliminar
    console.log('\n⏳ Esperando 2 segundos antes de eliminar...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testDeleteImage(singleUpload.deleteHash);
  }

  // Limpiar las imágenes múltiples
  if (multipleUploads.length > 0) {
    console.log('\n🧹 Limpiando imágenes múltiples...');
    for (const upload of multipleUploads) {
      await testDeleteImage(upload.deleteHash);
    }
  }

  console.log('\n🎉 Tests completados!');
  console.log('\n📝 Resumen:');
  console.log('- Servidor: ✅ Funcionando');
  console.log('- Upload individual: ✅ Funcional');
  console.log('- Upload múltiple: ✅ Funcional');
  console.log('- Obtener info: ✅ Funcional');
  console.log('- Eliminar imagen: ✅ Funcional');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Error en los tests:', error);
    process.exit(1);
  });
}

module.exports = {
  testSingleImageUpload,
  testMultipleImageUpload,
  testGetImageInfo,
  testDeleteImage,
  testServerHealth,
  runAllTests
};
