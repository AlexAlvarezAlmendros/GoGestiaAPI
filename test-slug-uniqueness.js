const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testSlugUniqueness() {
  console.log('🧪 Testing slug uniqueness...');
  
  try {
    // Create 3 posts with the same title (using timestamp for uniqueness)
    const timestamp = Date.now();
    const sameTitle = `Test Slug Uniqueness ${timestamp}`;
    const posts = [];
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\n📝 Creating post ${i} with title: "${sameTitle}"`);
      
      const postData = {
        title: sameTitle,
        content: `Este es el contenido del post número ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        author: 'Test Author',
        categories: ['Tecnología'],
        tags: ['test', `test-${i}`]
      };

      const response = await axios.post(`${API_BASE}/api/blog/posts`, postData);
      
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.status === 201) {
        const post = response.data.data || response.data.post || response.data;
        posts.push(post);
        console.log(`✅ Post ${i} created successfully!`);
        console.log(`   - Slug: ${post.slug}`);
        console.log(`   - ID: ${post.id}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Summary of created posts:');
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}" -> slug: "${post.slug}"`);
    });
    
    // Verify all slugs are unique
    const slugs = posts.map(p => p.slug);
    const uniqueSlugs = [...new Set(slugs)];
    
    if (slugs.length === uniqueSlugs.length) {
      console.log('\n✅ SUCCESS: All slugs are unique!');
    } else {
      console.log('\n❌ FAILURE: Duplicate slugs found!');
      console.log('Slugs:', slugs);
      console.log('Unique slugs:', uniqueSlugs);
    }
    
  } catch (error) {
    console.error('❌ Error during slug uniqueness test:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${error.response.data.error || error.response.data.message}`);
      if (error.response.data.details) {
        console.error('Details:', error.response.data.details);
      }
    } else {
      console.error('Network/Other Error:', error.message);
    }
  }
}

// Run the test
testSlugUniqueness();
