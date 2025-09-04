const axios = require('axios');

async function testValidationErrors() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔍 TESTING VALIDATION ERRORS DETALLADO');
  console.log('='.repeat(50));

  const testCases = [
    {
      name: 'Post sin título',
      data: {
        content: 'Contenido válido',
        author: 'Autor válido'
      }
    },
    {
      name: 'Post sin contenido',
      data: {
        title: 'Título válido',
        author: 'Autor válido'
      }
    },
    {
      name: 'Post sin autor',
      data: {
        title: 'Título válido',
        content: 'Contenido válido'
      }
    },
    {
      name: 'Post con título vacío',
      data: {
        title: '',
        content: 'Contenido válido',
        author: 'Autor válido'
      }
    },
    {
      name: 'Post con contenido vacío',
      data: {
        title: 'Título válido',
        content: '',
        author: 'Autor válido'
      }
    },
    {
      name: 'Post con autor vacío',
      data: {
        title: 'Título válido',
        content: 'Contenido válido',
        author: ''
      }
    },
    {
      name: 'Post con slug duplicado',
      data: {
        title: 'Título válido con slug duplicado',
        content: 'Contenido válido',
        author: 'Autor válido',
        slug: 'post-duplicado-test'
      }
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${i + 1}. 🧪 Test: ${testCase.name}`);
    
    try {
      const response = await axios.post(`${baseURL}/api/blog/posts`, testCase.data, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`❌ ERROR: Se esperaba que fallara pero fue exitoso`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      
    } catch (error) {
      if (error.response) {
        console.log(`✅ Error capturado correctamente:`);
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Code: ${error.response.data.code || 'N/A'}`);
        console.log(`   Error: ${error.response.data.error || 'N/A'}`);
        console.log(`   Message: ${error.response.data.message || 'N/A'}`);
        
        if (error.response.data.details) {
          console.log(`   Details:`, error.response.data.details);
        }
      } else {
        console.log(`❌ Error de conexión: ${error.message}`);
      }
    }
    
    // Pausa pequeña entre tests
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Test especial: crear un post válido primero para luego intentar duplicar el slug
  console.log(`\n${testCases.length + 1}. 🧪 Test especial: Crear post para luego duplicar slug`);
  
  try {
    // Crear post inicial
    const initialPost = {
      title: 'Post inicial para test de duplicado',
      content: 'Contenido del post inicial',
      author: 'Test Author',
      slug: 'post-duplicado-test'
    };
    
    const response1 = await axios.post(`${baseURL}/api/blog/posts`, initialPost, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`✅ Post inicial creado: ${response1.data.data.slug}`);
    
    // Intentar crear post con mismo slug
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const duplicatePost = {
      title: 'Post duplicado para test',
      content: 'Contenido del post duplicado',
      author: 'Test Author 2',
      slug: 'post-duplicado-test' // Mismo slug
    };
    
    await axios.post(`${baseURL}/api/blog/posts`, duplicatePost, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log(`❌ ERROR: Se esperaba error de slug duplicado`);
    
  } catch (error) {
    if (error.response) {
      console.log(`✅ Error de slug duplicado capturado:`);
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Code: ${error.response.data.code || 'N/A'}`);
      console.log(`   Message: ${error.response.data.message || 'N/A'}`);
    } else {
      console.log(`❌ Error inesperado: ${error.message}`);
    }
  }

  console.log('\n✅ TESTS DE VALIDACIÓN COMPLETADOS');
}

// Ejecutar tests
testValidationErrors().catch(error => {
  console.error('\n💥 ERROR EN TESTS:', error.message);
  process.exit(1);
});
