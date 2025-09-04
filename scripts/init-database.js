const { sequelize, testConnection, syncDatabase } = require('../src/config/database');
const { Post, Category, Author, Tag } = require('../src/models');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Inicializando base de datos...');
    
    // Verificar conexión
    await testConnection();
    
    // Sincronizar base de datos (esto creará las tablas)
    await syncDatabase(true); // force: true recreará las tablas
    
    console.log('📝 Creando datos de ejemplo...');
    
    // Crear autor de ejemplo
    const author = await Author.create({
      name: 'Juan Pérez',
      email: 'juan.perez@gogestia.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      bio: 'Experto en transformación digital y procesos empresariales con más de 10 años de experiencia.'
    });
    
    // Crear categorías de ejemplo
    const categories = await Category.bulkCreate([
      {
        name: 'Digitalización',
        slug: 'digitalizacion',
        description: 'Artículos sobre transformación digital y automatización de procesos'
      },
      {
        name: 'Productividad',
        slug: 'productividad',
        description: 'Tips y estrategias para mejorar la productividad empresarial'
      },
      {
        name: 'Tecnología',
        slug: 'tecnologia',
        description: 'Últimas tendencias en tecnología empresarial'
      }
    ]);
    
    // Crear tags de ejemplo
    const tags = await Tag.bulkCreate([
      { name: 'Procesos', slug: 'procesos' },
      { name: 'Digitalización', slug: 'digitalizacion' },
      { name: 'Errores', slug: 'errores' },
      { name: 'Automatización', slug: 'automatizacion' },
      { name: 'Eficiencia', slug: 'eficiencia' },
      { name: 'Software', slug: 'software' },
      { name: 'Gestión', slug: 'gestion' },
      { name: 'Innovación', slug: 'innovacion' }
    ]);
    
    // Crear posts de ejemplo
    const posts = await Post.bulkCreate([
      {
        slug: '5-errores-digitalizacion-procesos',
        title: '5 Errores Comunes en la Digitalización de Procesos Empresariales',
        excerpt: 'Descubre los errores más frecuentes que cometen las empresas al digitalizar sus procesos y cómo evitarlos para garantizar una transformación exitosa.',
        content: `
          <h2>Introducción</h2>
          <p>La digitalización de procesos empresariales es fundamental en el mundo actual, pero muchas empresas cometen errores que pueden ser costosos. En este artículo exploramos los 5 errores más comunes.</p>
          
          <h2>1. No definir objetivos claros</h2>
          <p>Uno de los errores más frecuentes es comenzar la digitalización sin tener objetivos específicos y medibles...</p>
          
          <h2>2. Ignorar a los usuarios finales</h2>
          <p>La tecnología debe servir a las personas, no al revés. Es crucial involucrar a los usuarios desde el inicio...</p>
          
          <h2>3. Subestimar la gestión del cambio</h2>
          <p>La resistencia al cambio es natural. Es importante preparar a los equipos para la transición...</p>
          
          <h2>4. Elegir soluciones inadecuadas</h2>
          <p>No todas las herramientas son apropiadas para todos los procesos. La selección debe ser cuidadosa...</p>
          
          <h2>5. Falta de medición y seguimiento</h2>
          <p>Sin métricas claras, es imposible determinar el éxito de la digitalización...</p>
          
          <h2>Conclusión</h2>
          <p>Evitar estos errores comunes puede marcar la diferencia entre una digitalización exitosa y un proyecto fallido.</p>
        `,
        featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
        category_id: categories[0].id, // Digitalización
        author_id: author.id,
        status: 'published',
        featured: true,
        published_at: new Date('2024-01-15T10:00:00Z'),
        views: 245,
        read_time: 8,
        meta_title: '5 Errores Comunes en la Digitalización | GoGestia',
        meta_description: 'Descubre los errores más frecuentes que cometen las empresas al digitalizar sus procesos y cómo evitarlos.',
        meta_keywords: 'digitalización,procesos,errores,transformación digital,automatización'
      },
      {
        slug: 'automatizacion-procesos-beneficios',
        title: 'Los Beneficios de la Automatización de Procesos en tu Empresa',
        excerpt: 'Descubre cómo la automatización puede transformar tu empresa, reducir costos y mejorar la eficiencia operacional.',
        content: `
          <h2>¿Qué es la automatización de procesos?</h2>
          <p>La automatización de procesos consiste en utilizar tecnología para realizar tareas repetitivas sin intervención humana...</p>
          
          <h2>Principales beneficios</h2>
          <h3>1. Reducción de costos</h3>
          <p>La automatización permite reducir significativamente los costos operacionales...</p>
          
          <h3>2. Mejora de la eficiencia</h3>
          <p>Los procesos automatizados son más rápidos y precisos que los manuales...</p>
          
          <h3>3. Reducción de errores</h3>
          <p>La automatización elimina los errores humanos en tareas repetitivas...</p>
          
          <h2>Casos de uso comunes</h2>
          <p>Algunos ejemplos típicos de automatización incluyen:</p>
          <ul>
            <li>Procesamiento de facturas</li>
            <li>Gestión de inventarios</li>
            <li>Atención al cliente</li>
            <li>Reportes automáticos</li>
          </ul>
        `,
        featured_image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=400&fit=crop',
        category_id: categories[0].id, // Digitalización
        author_id: author.id,
        status: 'published',
        featured: false,
        published_at: new Date('2024-01-10T14:00:00Z'),
        views: 156,
        read_time: 6,
        meta_title: 'Beneficios de la Automatización de Procesos | GoGestia',
        meta_description: 'Descubre cómo la automatización puede transformar tu empresa y mejorar la eficiencia.',
        meta_keywords: 'automatización,procesos,eficiencia,costos,tecnología'
      },
      {
        slug: 'herramientas-productividad-2024',
        title: 'Las Mejores Herramientas de Productividad para 2024',
        excerpt: 'Una guía completa de las herramientas más efectivas para mejorar la productividad de tu equipo en 2024.',
        content: `
          <h2>Introducción</h2>
          <p>En 2024, la productividad sigue siendo clave para el éxito empresarial. Estas son las herramientas que están marcando la diferencia...</p>
          
          <h2>Herramientas de gestión de proyectos</h2>
          <h3>1. Asana</h3>
          <p>Excelente para equipos medianos que necesitan un balance entre funcionalidad y simplicidad...</p>
          
          <h3>2. Monday.com</h3>
          <p>Ideal para equipos que requieren alta personalización en sus flujos de trabajo...</p>
          
          <h2>Herramientas de comunicación</h2>
          <h3>1. Slack</h3>
          <p>La plataforma líder para comunicación empresarial...</p>
          
          <h3>2. Microsoft Teams</h3>
          <p>Perfecta integración con el ecosistema Microsoft...</p>
          
          <h2>Conclusión</h2>
          <p>La elección de las herramientas correctas puede incrementar significativamente la productividad de tu equipo.</p>
        `,
        featured_image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
        category_id: categories[1].id, // Productividad
        author_id: author.id,
        status: 'published',
        featured: true,
        published_at: new Date('2024-01-05T09:00:00Z'),
        views: 324,
        read_time: 10,
        meta_title: 'Mejores Herramientas de Productividad 2024 | GoGestia',
        meta_description: 'Descubre las herramientas más efectivas para mejorar la productividad de tu equipo.',
        meta_keywords: 'productividad,herramientas,2024,gestión,eficiencia'
      }
    ]);
    
    // Asociar tags con posts
    await posts[0].setTags([tags[0], tags[1], tags[2]]); // Procesos, Digitalización, Errores
    await posts[1].setTags([tags[3], tags[4], tags[0]]); // Automatización, Eficiencia, Procesos
    await posts[2].setTags([tags[4], tags[5], tags[6]]); // Eficiencia, Software, Gestión
    
    console.log('✅ Base de datos inicializada correctamente con datos de ejemplo');
    console.log(`📊 Creados: ${posts.length} posts, ${categories.length} categorías, ${tags.length} tags, 1 autor`);
    
    // Mostrar algunos ejemplos de los datos creados
    console.log('\n📝 Posts creados:');
    posts.forEach(post => {
      console.log(`- ${post.title} (${post.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Ejecutar la inicialización si el script se ejecuta directamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Inicialización completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
