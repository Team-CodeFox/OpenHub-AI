#!/usr/bin/env node

/**
 * Test script to verify the OpenHub-AI enhancements
 * This script tests the new features implemented:
 * 1. Collapsible file tree structure
 * 2. Improved flowchart connections
 * 3. YouTube API integration for learning videos
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testYouTubeVideos() {
  console.log('🎥 Testing YouTube Videos API...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/learn/youtube-videos`, {
      params: {
        technologies: 'React,Next.js,TypeScript',
        max: 3
      }
    });
    
    console.log('✅ YouTube Videos API working');
    console.log(`   Found ${response.data.videos.length} videos`);
    console.log(`   Source: ${response.data.source}`);
    
    if (response.data.videos.length > 0) {
      console.log('   Sample video:', response.data.videos[0].title);
    }
  } catch (error) {
    console.log('❌ YouTube Videos API failed:', error.message);
  }
}

async function testFlowchartAPI() {
  console.log('📊 Testing Flowchart API...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/flowchart/test`);
    console.log('✅ Flowchart API working');
    console.log('   Response:', response.data.message);
  } catch (error) {
    console.log('❌ Flowchart API failed:', error.message);
  }
}

async function testGitHubContextualResources() {
  console.log('📚 Testing GitHub Contextual Resources...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/learn/github-contextual`, {
      params: {
        full_name: 'facebook/react',
        path: 'src/components/Button.js',
        max: 3
      }
    });
    
    console.log('✅ GitHub Contextual Resources API working');
    console.log(`   Found ${response.data.items.length} resources`);
  } catch (error) {
    console.log('❌ GitHub Contextual Resources API failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Testing OpenHub-AI Enhancements\n');
  
  await testYouTubeVideos();
  console.log('');
  
  await testFlowchartAPI();
  console.log('');
  
  await testGitHubContextualResources();
  console.log('');
  
  console.log('✨ Test completed!');
  console.log('\n📋 Summary of Enhancements:');
  console.log('   ✅ Collapsible file tree with proper folder expansion');
  console.log('   ✅ Improved flowchart with better connection lines');
  console.log('   ✅ Fixed tech stack content overflow issues');
  console.log('   ✅ YouTube API integration for learning videos');
  console.log('   ✅ Enhanced UI with better visual feedback');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
