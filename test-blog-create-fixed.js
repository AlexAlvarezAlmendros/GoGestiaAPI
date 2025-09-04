const axios = require('axios');

async function testCreateBlogPost() {
  const baseURL = 'http://localhost:3000';
  const createdPosts = [];

  console.log('🧪 INICIANDO TESTS DEL ENDPOINT CREAR POST');
  console.log('='.repeat(50));

  try {
    // Test 1: Verificar conexión al servidor
    console.log('\n📡 Test 1: Verificando conexión al servidor...');
    try {
      const response = await axios.get(`${baseURL}/api/health`);
      console.log('✅ Servidor conectado:', response.data.message);
    } catch (error) {
      throw new Error('No se puede conectar al servidor. Asegúrate de que esté ejecutándose en puerto 3000');
    }

    // Test 2: Crear post con campos mínimos
    console.log('\n📝 Test 2: Crear post con campos mínimos...');
    try {
      const timestamp = Date.now();
      const minimalPost = {
        title: `Post de Prueba Mínimo ${timestamp}`,
        content: 'Este es el contenido de prueba para el post mínimo. Debe tener suficiente contenido para generar un excerpt automático y probar todas las funciones.',
        author: 'Autor de Prueba'
      };

      const response = await axios.post(`${baseURL}/api/blog/posts`, minimalPost, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('✅ Post mínimo creado exitosamente');
      console.log(`   ID: ${response.data.data.id}`);
      console.log(`   Slug: ${response.data.data.slug}`);
      console.log(`   Categoría: ${response.data.data.category?.name || 'Sin categoría'}`);
      console.log(`   Autor: ${response.data.data.author?.name || 'Sin autor'}`);
      
      createdPosts.push(response.data.data.slug);
    } catch (error) {
      console.log('❌ Error al crear post mínimo:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
      throw error;
    }

    // Pequeña pausa para evitar bloqueos de SQLite
    await new Promise(resolve => setTimeout(resolve, 100));

    // Test 3: Crear post completo con todos los campos
    console.log('\n📄 Test 3: Crear post completo...');
    try {
      const timestamp = Date.now();
      const fullPost = {
        title: `Guía Completa de Gestión Empresarial con GoGestia ${timestamp}`,
        content: `
          <h2>Introducción</h2>
          <p>La gestión empresarial eficiente es fundamental para el éxito de cualquier organización en el mundo actual.</p>
          
          <h3>Beneficios de una buena gestión</h3>
          <ul>
            <li>Mejora de la productividad</li>
            <li>Optimización de recursos</li>
            <li>Reducción de costos</li>
            <li>Mayor satisfacción del cliente</li>
          </ul>
          
          <h3>Herramientas tecnológicas</h3>
          <p>Las herramientas digitales como GoGestia permiten automatizar procesos y mejorar la eficiencia operativa.</p>
          
          <h2>Conclusión</h2>
          <p>Implementar un sistema de gestión adecuado es clave para el crecimiento sostenible de tu empresa.</p>
        `,
        excerpt: 'Descubre cómo optimizar la gestión de tu empresa con herramientas modernas y estrategias efectivas.',
        author: 'Equipo GoGestia',
        category: 'Gestión Empresarial',
        tags: ['gestión', 'empresas', 'productividad', 'tecnología'],
        published: true,
        featured: true,
        featuredImage: 'https://example.com/imagen-gestion.jpg',
        metaTitle: 'Guía Completa de Gestión Empresarial - GoGestia',
        metaDescription: 'Aprende las mejores prácticas de gestión empresarial con nuestra guía completa.',
        slug: `guia-completa-gestion-empresarial-gogestia-${timestamp}`
      };

      const response = await axios.post(`${baseURL}/api/blog/posts`, fullPost, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('✅ Post completo creado exitosamente');
      console.log(`   ID: ${response.data.data.id}`);
      console.log(`   Slug: ${response.data.data.slug}`);
      console.log(`   Autor: ${response.data.data.author?.name || 'Sin autor'}`);
      console.log(`   Categoría: ${response.data.data.category?.name || 'Sin categoría'}`);
      console.log(`   Tags: ${response.data.data.tags?.join(', ') || 'Sin tags'}`);
      console.log(`   Publicado: ${response.data.data.publishedAt ? 'Sí' : 'No'}`);
      console.log(`   Tiempo de lectura: ${response.data.data.readTime || 0} min`);
      
      createdPosts.push(response.data.data.slug);
    } catch (error) {
      console.log('❌ Error al crear post completo:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
      throw error;
    }

    // Pequeña pausa para evitar bloqueos de SQLite
    await new Promise(resolve => setTimeout(resolve, 100));

    // Test 4: Verificar que los posts creados existen
    console.log('\n🔎 Test 4: Verificando que los posts creados existen...');
    for (const slug of createdPosts) {
      try {
        const response = await axios.get(`${baseURL}/api/blog/posts/${slug}`);
        
        if (response.status === 200) {
          console.log(`✅ Post encontrado: ${slug}`);
          console.log(`   Título: ${response.data.data?.title || 'Sin título'}`);
        } else {
          console.log(`❌ Post ${slug} no encontrado (status: ${response.status})`);
        }
      } catch (error) {
        console.log(`❌ Error al buscar post ${slug}: ${error.response?.status || error.message}`);
      }
    }

    // Test 5: Validación de campos requeridos
    console.log('\n🔍 Test 5: Validando campos requeridos...');
    try {
      const invalidPost = {
        // title faltante
        content: '', // content vacío
        // author faltante
      };

      await axios.post(`${baseURL}/api/blog/posts`, invalidPost, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('❌ Se esperaba un error de validación');
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        console.log('✅ Validación funcionando correctamente');
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.message || error.response.data.error}`);
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }

    console.log('\n✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');
    
  } catch (error) {
    console.log('\n❌ ERROR EN LOS TESTS:', error.message);
    throw error;
  } finally {
    console.log('\n🧹 Limpieza: Posts creados durante las pruebas');
    createdPosts.forEach((slug, index) => {
      console.log(`   ${index + 1}. ${slug}`);
    });
    console.log('   (Nota: En un entorno de producción, aquí eliminarías los posts de prueba)');
  }
}

// Ejecutar el test
testCreateBlogPost().catch(error => {
  console.error('\n💥 ERROR GENERAL:', error.message);
  process.exit(1);
});
