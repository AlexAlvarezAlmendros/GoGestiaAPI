const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testOriginalProblem() {
  console.log('🧪 Testing the original frontend problem...');
  
  try {
    // Test with the exact data structure from your frontend
    const originalData = {
      "title": "tesdtestestestestnode test-slug-unidrgqueness.js",
      "content": "testestestestgestesnodrgdrgde test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug-uniqueness.js",
      "excerpt": "node test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-drgslug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug-uniqueness.js",
      "tags": [
        "Digitalización",
        "Empresas"
      ],
      "author": "GoGestia Team",
      "published": true,
      "featuredImage": "https://i.ibb.co/4Z7zt5wc/Captura-de-pantalla-2025-03-27-155604.jpg",
      "metaTitle": "tesdtestestestestnode test-sl-uniqueness.js | GoGestia",
      "metaDescription": "node test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug-uniqueness.jsnode test-slug",
      "slug": "tesdtestestestestnode-test-slug-unidrgqueness-js"
    };

    console.log('\n📝 Attempting to create post with potentially duplicate slug...');
    console.log(`Slug: ${originalData.slug}`);

    try {
      const response = await axios.post(`${API_BASE}/api/blog/posts`, originalData);
      
      if (response.status === 201) {
        console.log('✅ SUCCESS: Post created!');
        console.log(`   - Original slug requested: ${originalData.slug}`);
        console.log(`   - Final slug assigned: ${response.data.data.slug}`);
        console.log(`   - Post ID: ${response.data.data.id}`);
        console.log(`   - Title: ${response.data.data.title}`);
        
        if (response.data.data.slug !== originalData.slug) {
          console.log('🎯 SLUG UNIQUENESS WORKING: System automatically created unique variant!');
        } else {
          console.log('ℹ️  Original slug was available and used');
        }
      }
      
    } catch (error) {
      console.error('❌ ERROR occurred:');
      
      if (error.response) {
        console.error(`   Status: ${error.response.status} ${error.response.statusText}`);
        console.error(`   Error: ${error.response.data.error || error.response.data.message}`);
        
        if (error.response.status === 409) {
          console.error('❌ SLUG UNIQUENESS NOT WORKING: Still getting 409 conflict');
          console.error('   This means the slug uniqueness logic is not being applied');
        }
        
        if (error.response.data.details) {
          console.error('   Details:', JSON.stringify(error.response.data.details, null, 2));
        }
      } else {
        console.error('   Network/Other Error:', error.message);
      }
    }

    // Test creating the same post again to verify uniqueness
    console.log('\n🔄 Testing duplicate creation...');
    try {
      const duplicateResponse = await axios.post(`${API_BASE}/api/blog/posts`, {
        ...originalData,
        title: originalData.title + ' (Duplicate Test)'
      });
      
      console.log('✅ Second post created successfully!');
      console.log(`   - Final slug: ${duplicateResponse.data.data.slug}`);
      
    } catch (error) {
      console.error('❌ Error creating duplicate:');
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${error.response.data.error}`);
      }
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testOriginalProblem();
