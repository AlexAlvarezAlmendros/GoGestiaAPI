const { Post, Category, Author, Tag } = require('../src/models');

const addMoreSampleData = async () => {
  try {
    console.log('📝 Agregando más datos de ejemplo al blog...');

    // Obtener el autor existente
    const author = await Author.findOne();
    
    // Obtener categorías existentes
    const categories = await Category.findAll();
    
    // Obtener tags existentes
    const tags = await Tag.findAll();

    // Crear posts adicionales
    const additionalPosts = await Post.bulkCreate([
      {
        slug: 'transformacion-digital-2024',
        title: 'Guía Completa para la Transformación Digital en 2024',
        excerpt: 'Una guía paso a paso para implementar la transformación digital en tu empresa de manera exitosa.',
        content: `
          <h2>¿Qué es la Transformación Digital?</h2>
          <p>La transformación digital es el proceso de integrar tecnología digital en todas las áreas de una empresa...</p>
          
          <h2>Pasos para la Transformación Digital</h2>
          <h3>1. Evaluación del Estado Actual</h3>
          <p>Antes de comenzar cualquier transformación, es crucial entender dónde te encuentras actualmente...</p>
          
          <h3>2. Definición de Objetivos</h3>
          <p>Establece metas claras y medibles para tu proceso de transformación...</p>
          
          <h3>3. Selección de Tecnologías</h3>
          <p>No se trata de adoptar todas las tecnologías disponibles, sino las que realmente aporten valor...</p>
          
          <h3>4. Capacitación del Equipo</h3>
          <p>La tecnología es solo una herramienta; las personas son quienes la hacen funcionar...</p>
          
          <h3>5. Implementación Gradual</h3>
          <p>Es mejor implementar cambios de forma progresiva que intentar transformar todo de una vez...</p>
          
          <h2>Errores Comunes a Evitar</h2>
          <ul>
            <li>Falta de liderazgo ejecutivo</li>
            <li>Resistencia al cambio no gestionada</li>
            <li>Inversión insuficiente en capacitación</li>
            <li>Expectativas poco realistas</li>
          </ul>
          
          <h2>Conclusión</h2>
          <p>La transformación digital exitosa requiere planificación, paciencia y compromiso a largo plazo.</p>
        `,
        featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
        category_id: categories.find(c => c.slug === 'digitalizacion')?.id || categories[0].id,
        author_id: author.id,
        status: 'published',
        featured: true,
        published_at: new Date('2024-01-20T08:00:00Z'),
        views: 189,
        read_time: 12,
        meta_title: 'Transformación Digital 2024: Guía Completa | GoGestia',
        meta_description: 'Guía paso a paso para implementar la transformación digital en tu empresa.',
        meta_keywords: 'transformación digital,2024,guía,implementación,empresa'
      },
      {
        slug: 'gestion-tiempo-equipos-remotos',
        title: 'Gestión Eficaz del Tiempo en Equipos Remotos',
        excerpt: 'Estrategias probadas para mejorar la productividad y gestión del tiempo en equipos de trabajo remoto.',
        content: `
          <h2>El Desafío del Trabajo Remoto</h2>
          <p>Gestionar el tiempo efectivamente en equipos remotos presenta desafíos únicos...</p>
          
          <h2>Estrategias Clave</h2>
          <h3>1. Establecer Rutinas Claras</h3>
          <p>Las rutinas proporcionan estructura y ayudan a mantener la productividad...</p>
          
          <h3>2. Herramientas de Comunicación</h3>
          <p>Seleccionar las herramientas adecuadas es fundamental para la coordinación...</p>
          
          <h3>3. Metodologías Ágiles</h3>
          <p>Adoptar metodologías ágiles puede mejorar significativamente la eficiencia...</p>
          
          <h2>Métricas de Productividad</h2>
          <p>Es importante medir el progreso con métricas relevantes:</p>
          <ul>
            <li>Tiempo de entrega de tareas</li>
            <li>Calidad del trabajo</li>
            <li>Satisfacción del equipo</li>
            <li>Comunicación efectiva</li>
          </ul>
        `,
        featured_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
        category_id: categories.find(c => c.slug === 'productividad')?.id || categories[1].id,
        author_id: author.id,
        status: 'published',
        featured: false,
        published_at: new Date('2024-01-12T11:00:00Z'),
        views: 142,
        read_time: 7,
        meta_title: 'Gestión del Tiempo en Equipos Remotos | GoGestia',
        meta_description: 'Estrategias para mejorar la productividad en equipos de trabajo remoto.',
        meta_keywords: 'gestión tiempo,equipos remotos,productividad,trabajo remoto'
      },
      {
        slug: 'inteligencia-artificial-pymes',
        title: 'Cómo la Inteligencia Artificial Puede Transformar tu PYME',
        excerpt: 'Descubre aplicaciones prácticas y accesibles de IA para pequeñas y medianas empresas.',
        content: `
          <h2>IA para PYMEs: Más Accesible de lo que Piensas</h2>
          <p>La inteligencia artificial ya no es exclusiva de las grandes corporaciones...</p>
          
          <h2>Aplicaciones Prácticas</h2>
          <h3>1. Atención al Cliente</h3>
          <p>Los chatbots pueden manejar consultas básicas 24/7...</p>
          
          <h3>2. Análisis de Datos</h3>
          <p>Herramientas de IA pueden analizar patrones en tus ventas...</p>
          
          <h3>3. Automatización de Marketing</h3>
          <p>Personalización de campañas basada en comportamiento del cliente...</p>
          
          <h2>Primeros Pasos</h2>
          <ol>
            <li>Identifica procesos repetitivos</li>
            <li>Evalúa herramientas disponibles</li>
            <li>Comienza con una prueba piloto</li>
            <li>Mide resultados y optimiza</li>
          </ol>
        `,
        featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
        category_id: categories.find(c => c.slug === 'tecnologia')?.id || categories[2].id,
        author_id: author.id,
        status: 'published',
        featured: true,
        published_at: new Date('2024-01-08T15:30:00Z'),
        views: 298,
        read_time: 9,
        meta_title: 'IA para PYMEs: Transformación Accesible | GoGestia',
        meta_description: 'Aplicaciones prácticas de inteligencia artificial para pequeñas empresas.',
        meta_keywords: 'inteligencia artificial,IA,PYME,transformación,tecnología'
      }
    ]);

    // Asociar tags con los nuevos posts
    const tagMapping = {
      'transformacion-digital-2024': ['digitalizacion', 'procesos', 'innovacion'],
      'gestion-tiempo-equipos-remotos': ['eficiencia', 'gestion', 'procesos'],
      'inteligencia-artificial-pymes': ['innovacion', 'tecnologia', 'automatizacion']
    };

    for (const post of additionalPosts) {
      const postTags = tagMapping[post.slug] || [];
      const tagInstances = tags.filter(tag => postTags.includes(tag.slug));
      if (tagInstances.length > 0) {
        await post.setTags(tagInstances);
      }
    }

    console.log(`✅ Se agregaron ${additionalPosts.length} posts adicionales al blog`);
    console.log('\n📝 Nuevos posts creados:');
    additionalPosts.forEach(post => {
      console.log(`- ${post.title} (${post.slug})`);
    });

    // Mostrar estadísticas finales
    const totalPosts = await Post.count();
    const totalCategories = await Category.count();
    const totalTags = await Tag.count();
    
    console.log('\n📊 Estadísticas finales del blog:');
    console.log(`- Posts: ${totalPosts}`);
    console.log(`- Categorías: ${totalCategories}`);
    console.log(`- Tags: ${totalTags}`);

  } catch (error) {
    console.error('❌ Error al agregar datos adicionales:', error);
    throw error;
  }
};

// Ejecutar si el script se ejecuta directamente
if (require.main === module) {
  const { sequelize, testConnection } = require('../src/config/database');
  
  testConnection()
    .then(() => addMoreSampleData())
    .then(() => {
      console.log('🎉 Datos adicionales agregados exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    })
    .finally(() => {
      sequelize.close();
    });
}

module.exports = { addMoreSampleData };
