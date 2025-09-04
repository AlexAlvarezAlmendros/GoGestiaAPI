const ImgBBClient = require('./src/config/imgbb');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

async function testImgBBAPI() {
  console.log('=== PRUEBA DE API IMGBB ===');
  
  // Verificar API key
  const apiKey = process.env.IMGBB_API_KEY;
  console.log('API Key encontrada:', apiKey ? `Sí (${apiKey.substring(0, 8)}...)` : 'No');
  
  if (!apiKey || apiKey === 'tu_imgbb_api_key_aqui') {
    console.log('❌ API Key no configurada correctamente');
    console.log('1. Ve a https://api.imgbb.com/');
    console.log('2. Obtén tu API key');
    console.log('3. Actualiza el archivo .env con: IMGBB_API_KEY=tu_api_key_real');
    return;
  }
  
  // Crear cliente
  const imgbb = new ImgBBClient(apiKey);
  
  // Crear una imagen de prueba simple (1x1 pixel PNG transparente)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  
  try {
    console.log('Probando upload a ImgBB...');
    const result = await imgbb.uploadImage(testImageBuffer, 'Test Image', 'Imagen de prueba desde GoGestia API');
    
    if (result.success) {
      console.log('✅ Upload exitoso!');
      console.log('URL de la imagen:', result.data.link);
      console.log('ID:', result.data.id);
      console.log('Delete URL:', result.data.deletehash);
    } else {
      console.log('❌ Upload falló');
    }
  } catch (error) {
    console.log('❌ Error en upload:', error.message);
    if (error.response?.data) {
      console.log('Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testImgBBAPI();
