const axios = require('axios');

const testSearch = async () => {
  const baseUrl = 'http://localhost:3000/api/blog/posts';
  
  console.log('🧪 Probando búsquedas...\n');
  
  const searches = [
    { term: '5', description: 'Búsqueda con "5" (1 carácter)' },
    { term: 'guia', description: 'Búsqueda con "guia" (4 caracteres)' },
    { term: 'digitalización', description: 'Búsqueda con "digitalización"' },
    { term: 'x', description: 'Búsqueda con "x" (1 carácter que no existe)' }
  ];
  
  for (const search of searches) {
    try {
      const url = `${baseUrl}?page=1&limit=10&search=${encodeURIComponent(search.term)}`;
      console.log(`📍 ${search.description}`);
      console.log(`   URL: ${url}`);
      
      const response = await axios.get(url);
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📝 Posts encontrados: ${response.data.data.posts.length}`);
      console.log(`   📊 Total: ${response.data.data.pagination.total}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || 'Unknown'}`);
      console.log(`   💬 Mensaje: ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.details) {
        console.log(`   🔍 Detalles: ${JSON.stringify(error.response.data.details, null, 2)}`);
      }
    }
    console.log('');
  }
};

testSearch().catch(console.error);
