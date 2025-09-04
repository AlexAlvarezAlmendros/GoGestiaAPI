const axios = require('axios');

async function testYourSpecificData() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔧 TEST CON TUS DATOS ESPECÍFICOS');
  console.log('='.repeat(50));

  // REEMPLAZA ESTOS DATOS CON LOS QUE ESTÁS ENVIANDO CUANDO OBTIENES EL ERROR
  const yourPostData = {
    title: 'Guía Completa de Gestión Empresarial con GoGestia', // Tu título exacto
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
    slug: 'guia-completa-gestion-empresarial-gogestia'
  };

  console.log('\n📋 Datos que se van a enviar:');
  console.log(JSON.stringify(yourPostData, null, 2));

  try {
    console.log('\n🚀 Enviando petición...');
    const response = await axios.post(`${baseURL}/api/blog/posts`, yourPostData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('\n✅ POST CREADO EXITOSAMENTE');
    console.log(`   ID: ${response.data.data.id}`);
    console.log(`   Slug: ${response.data.data.slug}`);
    console.log(`   Status: ${response.status}`);
    
  } catch (error) {
    console.log('\n❌ ERROR CAPTURADO:');
    
    if (error.response) {
      console.log(`   Status HTTP: ${error.response.status}`);
      console.log(`   Error Code: ${error.response.data.code || 'N/A'}`);
      console.log(`   Error Type: ${error.response.data.error || 'N/A'}`);
      console.log(`   Message: ${error.response.data.message || 'N/A'}`);
      
      if (error.response.data.details) {
        console.log(`   Validation Details:`);
        error.response.data.details.forEach((detail, index) => {
          console.log(`     ${index + 1}. Campo: ${detail.path}`);
          console.log(`        Valor: ${detail.value || 'undefined'}`);
          console.log(`        Error: ${detail.msg}`);
        });
      }
      
      console.log('\n📊 Respuesta completa del servidor:');
      console.log(JSON.stringify(error.response.data, null, 2));
      
    } else {
      console.log(`   Error de conexión: ${error.message}`);
    }
  }
}

// INSTRUCCIONES:
// 1. Reemplaza 'yourPostData' con los datos exactos que estás enviando
// 2. Ejecuta: node test-your-data.js
// 3. Revisa los logs detallados

testYourSpecificData().catch(error => {
  console.error('\n💥 ERROR CRÍTICO:', error.message);
});
