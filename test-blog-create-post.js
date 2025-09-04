const axios = require('axios');

class BlogPostTester {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.createdPosts = []; // Para limpiar después
  }

  async runAllTests() {
    console.log('🧪 INICIANDO TESTS DEL ENDPOINT CREAR POST');
    console.log('='.repeat(50));

    try {
      await this.testServerConnection();
      await this.testCreatePostMinimal();
      await this.testCreatePostComplete();
      await this.testCreatePostValidation();
      await this.testCreatePostDuplicateSlug();
      await this.testCreatedPostsExist();
      
      console.log('\n✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');
    } catch (error) {
      console.log('\n❌ ERROR EN LOS TESTS:', error.message);
    }
  }

  async testServerConnection() {
    console.log('\n📡 Test 1: Verificando conexión al servidor...');
    try {
      const response = await axios.get(`${this.baseURL}/api/health`);
      console.log('✅ Servidor conectado:', response.data.message);
    } catch (error) {
      throw new Error('No se puede conectar al servidor. Asegúrate de que esté ejecutándose en puerto 3000');
    }
  }

  async testCreatePostMinimal() {
    console.log('\n📝 Test 2: Crear post con campos mínimos...');
    
    const postData = {
      title: 'Test Post Mínimo',
      content: 'Este es el contenido mínimo de un post de prueba.',
      author: 'Test Author'
    };

    try {
      const response = await axios.post(`${this.baseURL}/api/blog/posts`, postData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 201 && response.data.success) {
        console.log('✅ Post mínimo creado exitosamente');
        console.log(`   ID: ${response.data.data.id}`);
        console.log(`   Slug: ${response.data.data.slug}`);
        console.log(`   Título: ${response.data.data.title}`);
        this.createdPosts.push(response.data.data.slug);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      if (error.response) {
        console.log('❌ Error al crear post mínimo:');
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async testCreatePostComplete() {
    console.log('\n📋 Test 3: Crear post completo con todos los campos...');
    
    const postData = {
      title: 'Post Completo de Prueba - GoGestia',
      content: '<h2>Introducción</h2><p>Este es un post completo de prueba con HTML. Incluye múltiples párrafos para probar el cálculo del tiempo de lectura.</p><h3>Sección 1</h3><p>Contenido de la primera sección con más texto para alcanzar una longitud significativa.</p><h3>Sección 2</h3><p>Segunda sección con aún más contenido para simular un artículo real del blog.</p>',
      excerpt: 'Este es un extracto del post completo de prueba que muestra las capacidades del sistema.',
      author: 'Equipo GoGestia Test',
      tags: ['test', 'gogestia', 'blog', 'desarrollo'],
      published: true,
      featuredImage: 'https://i.ibb.co/ejemplo/imagen-test.jpg',
      metaTitle: 'Post Completo de Prueba - SEO Title',
      metaDescription: 'Meta descripción optimizada para SEO del post de prueba completo.',
      slug: 'post-completo-prueba-gogestia'
    };

    try {
      const response = await axios.post(`${this.baseURL}/api/blog/posts`, postData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 201 && response.data.success) {
        console.log('✅ Post completo creado exitosamente');
        console.log(`   ID: ${response.data.data.id}`);
        console.log(`   Slug: ${response.data.data.slug}`);
        console.log(`   Título: ${response.data.data.title}`);
        console.log(`   Tags: ${response.data.data.tags.join(', ')}`);
        console.log(`   Tiempo de lectura: ${response.data.data.readTime} min`);
        console.log(`   Estado: ${response.data.data.publishedAt ? 'Publicado' : 'Borrador'}`);
        this.createdPosts.push(response.data.data.slug);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      if (error.response) {
        console.log('❌ Error al crear post completo:');
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async testCreatePostValidation() {
    console.log('\n🔍 Test 4: Validando errores de validación...');
    
    const invalidData = {
      // title faltante (requerido)
      content: '', // content vacío (requerido)
      // author faltante (requerido)
      tags: 'invalid', // debe ser array
      published: 'invalid', // debe ser boolean
      featuredImage: 'invalid-url' // debe ser URL válida
    };

    try {
      const response = await axios.post(`${this.baseURL}/api/blog/posts`, invalidData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Si llega aquí, el test falló porque debería haber dado error
      throw new Error('Se esperaba un error de validación pero la solicitud fue exitosa');
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validación funcionando correctamente');
        console.log(`   Errores detectados: ${error.response.data.details.length}`);
        error.response.data.details.forEach((err, index) => {
          console.log(`   ${index + 1}. ${err.msg}`);
        });
      } else {
        throw new Error('Se esperaba un error 400 de validación');
      }
    }
  }

  async testCreatePostDuplicateSlug() {
    console.log('\n🔄 Test 5: Probando slug duplicado...');
    
    const postData = {
      title: 'Post Duplicate Slug Test',
      content: 'Contenido del post para probar slug duplicado.',
      author: 'Test Author',
      slug: 'test-post-minimo' // Mismo slug que el primer post
    };

    try {
      const response = await axios.post(`${this.baseURL}/api/blog/posts`, postData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      throw new Error('Se esperaba un error de slug duplicado pero la solicitud fue exitosa');
      
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('✅ Detección de slug duplicado funcionando correctamente');
        console.log(`   Error: ${error.response.data.message}`);
      } else {
        throw new Error('Se esperaba un error 409 de conflicto por slug duplicado');
      }
    }
  }

  async testCreatedPostsExist() {
    console.log('\n🔎 Test 6: Verificando que los posts creados existen...');
    
    for (const slug of this.createdPosts) {
      try {
        const response = await axios.get(`${this.baseURL}/api/blog/posts/${slug}`);
        
        if (response.status === 200 && response.data.success) {
          console.log(`✅ Post encontrado: ${slug}`);
        } else {
          throw new Error(`Post ${slug} no encontrado`);
        }
      } catch (error) {
        console.log(`❌ Error al buscar post ${slug}:`, error.message);
      }
    }
  }

  async cleanup() {
    console.log('\n🧹 Limpieza: Posts creados durante las pruebas');
    console.log('   (Nota: En un entorno de producción, aquí eliminarías los posts de prueba)');
    this.createdPosts.forEach((slug, index) => {
      console.log(`   ${index + 1}. ${slug}`);
    });
  }
}

// Ejecutar tests
async function runTests() {
  const tester = new BlogPostTester();
  
  try {
    await tester.runAllTests();
    await tester.cleanup();
  } catch (error) {
    console.log('\n💥 ERROR GENERAL:', error.message);
    process.exit(1);
  }
}

// Verificar si el script se ejecuta directamente
if (require.main === module) {
  runTests();
}

module.exports = BlogPostTester;
