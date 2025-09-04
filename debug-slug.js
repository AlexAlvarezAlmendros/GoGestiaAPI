const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function debugSlugIssue() {
  console.log('🔍 Debugging slug issue...');
  
  try {
    const testSlug = 'tesdtestestestestnode-test-slug-unidrgqueness-js';
    
    // First, check if there are any posts with this slug
    console.log('\n1️⃣ Checking existing posts...');
    const postsResponse = await axios.get(`${API_BASE}/api/blog/posts`);
    
    console.log('Posts response structure:', JSON.stringify(postsResponse.data, null, 2));
    
    let existingPosts = [];
    if (postsResponse.data.data && postsResponse.data.data.posts && Array.isArray(postsResponse.data.data.posts)) {
      existingPosts = postsResponse.data.data.posts;
    } else if (postsResponse.data.posts && Array.isArray(postsResponse.data.posts)) {
      existingPosts = postsResponse.data.posts;
    } else if (Array.isArray(postsResponse.data)) {
      existingPosts = postsResponse.data;
    }
    
    console.log(`Found ${existingPosts.length} posts in database`);
    
    const conflictingPosts = existingPosts.filter(post => 
      post.slug === testSlug || post.slug.startsWith(testSlug)
    );
    
    if (conflictingPosts.length > 0) {
      console.log(`\n⚠️  Found ${conflictingPosts.length} posts with conflicting slugs:`);
      conflictingPosts.forEach(post => {
        console.log(`   - ID: ${post.id}, Slug: "${post.slug}", Title: "${post.title}"`);
      });
    } else {
      console.log('✅ No conflicting posts found');
    }
    
    // Try to create a new post with a very unique slug first
    console.log('\n2️⃣ Testing with completely unique slug...');
    const uniqueSlug = `test-unique-${Date.now()}`;
    
    const testData = {
      "title": "Test Unique Slug",
      "content": "Testing with a completely unique slug. This content is long enough to avoid validation issues and provides sufficient information for testing purposes.",
      "excerpt": "Test excerpt that meets minimum length requirements for validation",
      "tags": ["Test"],
      "author": "Test Author",
      "published": true,
      "slug": uniqueSlug
    };
    
    try {
      const response = await axios.post(`${API_BASE}/api/blog/posts`, testData);
      console.log(`✅ Success with unique slug: ${response.data.data.slug}`);
      
      // Now try with the same slug again to test our uniqueness logic
      console.log('\n3️⃣ Testing duplicate slug handling...');
      const duplicateResponse = await axios.post(`${API_BASE}/api/blog/posts`, {
        ...testData,
        title: "Test Duplicate Slug",
        content: "Testing duplicate slug handling with sufficient content length to meet validation requirements.",
        excerpt: "Test excerpt for duplicate slug handling that meets length requirements"
      });
      
      console.log(`✅ Success with duplicate handling: ${duplicateResponse.data.data.slug}`);
      
    } catch (error) {
      console.error('❌ Error in unique slug test:');
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${error.response.data.error || error.response.data.message}`);
        console.error(`   Details:`, error.response.data);
      } else {
        console.error('   Network Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

debugSlugIssue();
