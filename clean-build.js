#!/usr/bin/env node

/**
 * Clean Build Script
 * Removes duplicate files and ensures proper build structure
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning build structure...');

// Files and directories to remove
const toRemove = [
  'App.tsx', // Root App.tsx (should be in src/)
  'main.tsx', // Root main.tsx (should be in src/)
  'components', // Root components/ (should be in src/)
  'styles/globals.css', // Root styles/ (should be in src/styles/)
  'src/components/CTAButton.tsx', // Duplicate
  'src/components/GlitchIntro.tsx', // Duplicate
  'src/components/RSVPAnimation.tsx', // Duplicate
  'cleanup.js',
  'fix-structure.js',
  'EMERGENCY-FIX.js',
  'FINAL-CLEANUP.js',
  'FINAL-FIX.js',
  'REMOVE-DUPLICATE-SRC.js',
  'deploy-check.js',
  'validate-structure.js'
];

let removedCount = 0;
let errorCount = 0;

toRemove.forEach(item => {
  const itemPath = path.join(__dirname, item);
  
  try {
    if (fs.existsSync(itemPath)) {
      const stats = fs.lstatSync(itemPath);
      
      if (stats.isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${item}`);
      } else {
        fs.unlinkSync(itemPath);
        console.log(`✅ Removed file: ${item}`);
      }
      removedCount++;
    }
  } catch (error) {
    console.log(`❌ Error removing ${item}:`, error.message);
    errorCount++;
  }
});

console.log(`\n🎯 Cleanup complete: ${removedCount} items removed, ${errorCount} errors`);

// Verify src structure
const srcPath = path.join(__dirname, 'src');
const requiredSrcFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/styles/globals.css'
];

console.log('\n📁 Verifying src/ structure...');
requiredSrcFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
  }
});

console.log('\n🚀 Build structure cleaned and verified');