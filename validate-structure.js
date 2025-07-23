#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Zero Zero: Validating project structure...');

// Check for duplicate src directory
const srcPath = path.join(__dirname, 'src');
const duplicateFiles = [];

if (fs.existsSync(srcPath)) {
  console.log('❌ Found duplicate src directory');
  
  // List contents
  try {
    const contents = fs.readdirSync(srcPath, { withFileTypes: true });
    console.log('📁 Duplicate src contents:', contents.map(item => item.name));
    duplicateFiles.push('src/');
  } catch (error) {
    console.log('⚠️  Could not read src directory');
  }
  
  // Try to remove it
  try {
    fs.rmSync(srcPath, { recursive: true, force: true });
    console.log('✅ Removed duplicate src directory');
  } catch (error) {
    console.log('❌ Could not remove duplicate src directory:', error.message);
    process.exit(1);
  }
}

// Check for correct main files
const mainFiles = [
  'App.tsx',
  'main.tsx',
  'index.html',
  'package.json',
  'vite.config.ts'
];

const missingFiles = [];
mainFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('❌ Missing required files:', missingFiles);
  process.exit(1);
}

// Check for correct component structure
const componentDirs = [
  'components',
  'components/intro',
  'components/onboarding',
  'components/dashboard'
];

const missingDirs = [];
componentDirs.forEach(dir => {
  if (!fs.existsSync(path.join(__dirname, dir))) {
    missingDirs.push(dir);
  }
});

if (missingDirs.length > 0) {
  console.log('❌ Missing required directories:', missingDirs);
  process.exit(1);
}

console.log('✅ Project structure validated');
console.log('🚀 Ready to start Zero Zero!');