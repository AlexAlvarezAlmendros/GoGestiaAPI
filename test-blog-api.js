const axios = require('axios');

// Configuración de la API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  posts: `${API_BASE_URL}/api/blog/posts`,
  post: (slug) => `${API_BASE_URL}/api/blog/posts/${slug}`,
  categories: `${API_BASE_URL}/api/blog/categories`,
  related: (slug) => `${API_BASE_URL}/api/blog/posts/${slug}/related`,
  views: (slug) => `${API_BASE_URL}/api/blog/posts/${slug}/views`
};

// Función para hacer requests con manejo de errores
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.response?.data || error.message,
      message: error.message
    };
  }
};

// Función para mostrar resultados de tests
const showResult = (testName, result) => {
  const status = result.success ? '✅' : '❌';
  const statusCode = result.status ? `[${result.status}]` : '[ERROR]';
  
  console.log(`${status} ${testName} ${statusCode}`);
  
  if (!result.success) {
    console.log(`   Error: ${result.message}`);
    if (result.error?.message) {
      console.log(`   Detalles: ${result.error.message}`);
    }
  } else {
    // Mostrar información relevante según el endpoint
    if (result.data?.data) {
      const data = result.data.data;
      if (Array.isArray(data)) {
        console.log(`   Elementos encontrados: ${data.length}`);
      } else if (data.posts) {
        console.log(`   Posts: ${data.posts.length}, Total: ${data.pagination?.total || 'N/A'}`);
      } else if (data.title) {
        console.log(`   Post: "${data.title}"`);
      }
    }
  }
  console.log('');
};

// Tests principales
const runTests = async () => {
  console.log('🧪 Ejecutando pruebas de la API del Blog...');
  console.log(`🔗 URL base: ${API_BASE_URL}`);
  console.log('=' .repeat(50));

  // 1. Health check
  console.log('1. 🏥 Health Check');
  const healthResult = await makeRequest('GET', API_ENDPOINTS.health);
  showResult('Health check', healthResult);

  // 2. Obtener lista de posts
  console.log('2. 📝 Lista de Posts');
  const postsResult = await makeRequest('GET', API_ENDPOINTS.posts);
  showResult('GET /api/blog/posts', postsResult);

  // 2a. Lista de posts con parámetros
  console.log('2a. 📝 Lista de Posts con Paginación');
  const postsPageResult = await makeRequest('GET', `${API_ENDPOINTS.posts}?page=1&limit=2`);
  showResult('GET /api/blog/posts?page=1&limit=2', postsPageResult);

  // 2b. Lista de posts destacados
  console.log('2b. ⭐ Posts Destacados');
  const featuredResult = await makeRequest('GET', `${API_ENDPOINTS.posts}?featured=true`);
  showResult('GET /api/blog/posts?featured=true', featuredResult);

  // 2c. Búsqueda de posts
  console.log('2c. 🔍 Búsqueda de Posts');
  const searchResult = await makeRequest('GET', `${API_ENDPOINTS.posts}?search=digitalización`);
  showResult('GET /api/blog/posts?search=digitalización', searchResult);

  // 3. Obtener categorías
  console.log('3. 📂 Categorías');
  const categoriesResult = await makeRequest('GET', API_ENDPOINTS.categories);
  showResult('GET /api/blog/categories', categoriesResult);

  // 4. Obtener post específico
  console.log('4. 📄 Post Específico');
  const postResult = await makeRequest('GET', API_ENDPOINTS.post('5-errores-digitalizacion-procesos'));
  showResult('GET /api/blog/posts/5-errores-digitalizacion-procesos', postResult);

  // 5. Obtener posts relacionados
  console.log('5. 🔗 Posts Relacionados');
  const relatedResult = await makeRequest('GET', API_ENDPOINTS.related('5-errores-digitalizacion-procesos'));
  showResult('GET /api/blog/posts/5-errores-digitalizacion-procesos/related', relatedResult);

  // 6. Incrementar vistas
  console.log('6. 👁️ Incrementar Vistas');
  const viewsResult = await makeRequest('POST', API_ENDPOINTS.views('5-errores-digitalizacion-procesos'));
  showResult('POST /api/blog/posts/5-errores-digitalizacion-procesos/views', viewsResult);

  // 7. Tests de errores
  console.log('7. 🚫 Tests de Errores');
  
  // Post no existente
  const notFoundResult = await makeRequest('GET', API_ENDPOINTS.post('post-inexistente'));
  showResult('GET post inexistente (esperado 404)', notFoundResult);

  // Parámetros inválidos
  const invalidPageResult = await makeRequest('GET', `${API_ENDPOINTS.posts}?page=-1`);
  showResult('GET posts con página inválida (esperado 400)', invalidPageResult);

  console.log('=' .repeat(50));
  console.log('🎉 Pruebas completadas');
};

// Función para verificar si el servidor está ejecutándose
const checkServer = async () => {
  console.log('🔍 Verificando si el servidor está ejecutándose...');
  const result = await makeRequest('GET', API_ENDPOINTS.health);
  
  if (!result.success) {
    console.log('❌ El servidor no está ejecutándose o no responde');
    console.log('💡 Asegúrate de ejecutar "npm run dev" en otra terminal');
    process.exit(1);
  }
  
  console.log('✅ Servidor está ejecutándose correctamente');
  console.log('');
};

// Ejecutar las pruebas
const main = async () => {
  try {
    await checkServer();
    await runTests();
  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
    process.exit(1);
  }
};

// Ejecutar si el script se llama directamente
if (require.main === module) {
  main();
}

module.exports = { runTests, makeRequest, API_ENDPOINTS };
