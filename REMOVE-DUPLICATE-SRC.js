#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 CRITICAL: Removing duplicate src directory...');

// Force remove the duplicate src directory and all its contents
const srcPath = path.join(__dirname, 'src');

if (fs.existsSync(srcPath)) {
  console.log('❌ Found duplicate src/ directory - removing completely...');
  
  try {
    // Remove all files and subdirectories recursively
    fs.rmSync(srcPath, { 
      recursive: true, 
      force: true,
      maxRetries: 3,
      retryDelay: 100
    });
    
    console.log('✅ Successfully removed duplicate src/ directory');
    console.log('✅ Build conflicts resolved');
  } catch (error) {
    console.error('❌ Failed to remove src/ directory:', error.message);
    console.log('⚠️  MANUAL ACTION REQUIRED: Delete the src/ directory manually');
    process.exit(1);
  }
} else {
  console.log('✅ No duplicate src/ directory found');
}

console.log('\n🎯 Structure cleanup complete!');
console.log('✅ Ready for development and deployment');