const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testCustomSlugUniqueness() {
  console.log('🧪 Testing custom slug uniqueness...');
  
  try {
    // Test data similar to what frontend sends
    const baseSlug = 'tesdtestestestestnode-test-slug-unidrgqueness-js';
    const posts = [];
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\n📝 Creating post ${i} with custom slug: "${baseSlug}"`);
      
      const postData = {
        "title": `Test Post ${i} with Custom Slug`,
        "content": `Content for test post ${i}. This is testing custom slug uniqueness functionality.`,
        "excerpt": `Excerpt for test post ${i}`,
        "tags": ["Digitalización", "Empresas"],
        "author": "GoGestia Team",
        "published": true,
        "featuredImage": "https://i.ibb.co/4Z7zt5wc/Captura-de-pantalla-2025-03-27-155604.jpg",
        "metaTitle": `Test Post ${i} | GoGestia`,
        "metaDescription": `Meta description for test post ${i}`,
        "slug": baseSlug  // Same slug for all posts to test uniqueness
      };

      try {
        const response = await axios.post(`${API_BASE}/api/blog/posts`, postData);
        
        console.log(`Response status: ${response.status}`);
        
        if (response.status === 201) {
          const post = response.data.data || response.data.post || response.data;
          posts.push(post);
          console.log(`✅ Post ${i} created successfully!`);
          console.log(`   - Final Slug: ${post.slug}`);
          console.log(`   - ID: ${post.id}`);
          console.log(`   - Title: ${post.title}`);
        }
      } catch (error) {
        console.error(`❌ Error creating post ${i}:`);
        if (error.response) {
          console.error(`   Status: ${error.response.status}`);
          console.error(`   Error: ${error.response.data.error || error.response.data.message}`);
          if (error.response.data.details) {
            console.error('   Details:', error.response.data.details);
          }
        } else {
          console.error('   Network/Other Error:', error.message);
        }
        break; // Stop on first error
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (posts.length > 0) {
      console.log('\n📊 Summary of created posts:');
      posts.forEach((post, index) => {
        console.log(`${index + 1}. "${post.title}" -> slug: "${post.slug}"`);
      });
      
      // Verify all slugs are unique
      const slugs = posts.map(p => p.slug);
      const uniqueSlugs = [...new Set(slugs)];
      
      if (slugs.length === uniqueSlugs.length) {
        console.log('\n✅ SUCCESS: All slugs are unique!');
        console.log('Expected behavior: Each post should have a unique slug variant');
        console.log('Result: ✅ PASSED');
      } else {
        console.log('\n❌ FAILURE: Duplicate slugs found!');
        console.log('Slugs:', slugs);
        console.log('Unique slugs:', uniqueSlugs);
      }
    } else {
      console.log('\n❌ No posts were created successfully');
    }
    
  } catch (error) {
    console.error('❌ General error during test:');
    console.error(error.message);
  }
}

// Run the test
testCustomSlugUniqueness();
