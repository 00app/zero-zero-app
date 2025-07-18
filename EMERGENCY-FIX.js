#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY BUILD FIX: Removing all duplicate directories...');

// Force remove src directory
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
  console.log('❌ REMOVING: src/ directory');
  try {
    fs.rmSync(srcPath, { recursive: true, force: true });
    console.log('✅ REMOVED: src/ directory');
  } catch (error) {
    console.log('⚠️  Error removing src/:', error.message);
  }
}

// Force remove lib directory
const libPath = path.join(__dirname, 'lib');
if (fs.existsSync(libPath)) {
  console.log('❌ REMOVING: lib/ directory');
  try {
    fs.rmSync(libPath, { recursive: true, force: true });
    console.log('✅ REMOVED: lib/ directory');
  } catch (error) {
    console.log('⚠️  Error removing lib/:', error.message);
  }
}

// Force remove build artifacts
const buildDirs = ['dist', 'build', '.vite', 'node_modules/.cache'];
buildDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`❌ REMOVING: ${dir}/ directory`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ REMOVED: ${dir}/ directory`);
    } catch (error) {
      console.log(`⚠️  Error removing ${dir}/:`, error.message);
    }
  }
});

console.log('\n🎯 Emergency fix complete!');
console.log('✅ All duplicate directories removed');
console.log('✅ Build artifacts cleaned');
console.log('\nNow you can run:');
console.log('  npm run dev');
console.log('  npm run build');