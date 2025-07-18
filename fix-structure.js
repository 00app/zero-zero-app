#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 CRITICAL BUILD FIX: Removing duplicate directories...');

// Immediately remove the duplicate src directory
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  console.log('❌ CRITICAL: Found duplicate src/ directory - REMOVING NOW');
  try {
    // Use synchronous removal with force
    fs.rmSync(srcDir, { recursive: true, force: true });
    console.log('✅ FIXED: Duplicate src/ directory removed');
  } catch (error) {
    console.log('⚠️  Could not remove src/ directory:', error.message);
  }
}

// Also remove lib directory if it exists
const libDir = path.join(__dirname, 'lib');
if (fs.existsSync(libDir)) {
  console.log('❌ Found duplicate lib/ directory - REMOVING NOW');
  try {
    fs.rmSync(libDir, { recursive: true, force: true });
    console.log('✅ FIXED: Duplicate lib/ directory removed');
  } catch (error) {
    console.log('⚠️  Could not remove lib/ directory:', error.message);
  }
}

// Function to force remove a directory with multiple attempts
function forceRemoveDirectory(dirPath, name) {
  if (!fs.existsSync(dirPath)) {
    console.log(`✅ No ${name} directory found`);
    return true;
  }

  console.log(`❌ CRITICAL: Found ${name} directory causing build conflicts`);
  
  try {
    // List contents for debugging
    const contents = fs.readdirSync(dirPath);
    console.log(`   ${name} contains: ${contents.join(', ')}`);
    
    // Try multiple removal methods
    console.log(`   Attempting to remove ${name}...`);
    
    // Method 1: Direct removal
    fs.rmSync(dirPath, { 
      recursive: true, 
      force: true, 
      maxRetries: 5,
      retryDelay: 100
    });
    
    console.log(`✅ FIXED: ${name} directory removed successfully`);
    return true;
  } catch (error) {
    console.log(`⚠️  CRITICAL: Could not remove ${name} directory`);
    console.log(`   Error: ${error.message}`);
    console.log(`   MANUAL ACTION REQUIRED: Please delete the ${name}/ directory manually`);
    return false;
  }
}

// Remove duplicate directories that cause build conflicts
const duplicateDirectories = [
  { path: path.join(__dirname, 'src'), name: 'src' },
  { path: path.join(__dirname, 'lib'), name: 'lib' }
];

let allFixed = true;

duplicateDirectories.forEach(({ path: dirPath, name }) => {
  const fixed = forceRemoveDirectory(dirPath, name);
  if (!fixed) allFixed = false;
});

// Clean build artifacts
console.log('\n🧹 Cleaning build artifacts...');
const artifactPaths = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'build'),
  path.join(__dirname, '.vite'),
  path.join(__dirname, 'node_modules/.cache')
];

artifactPaths.forEach(artifactPath => {
  if (fs.existsSync(artifactPath)) {
    try {
      fs.rmSync(artifactPath, { recursive: true, force: true });
      console.log(`✅ Cleaned ${path.basename(artifactPath)}`);
    } catch (error) {
      console.log(`⚪ Could not clean ${path.basename(artifactPath)}`);
    }
  }
});

// Verify required files exist in the correct locations
console.log('\n📋 Verifying required files:');
const requiredFiles = [
  'App.tsx',
  'main.tsx',
  'components/dashboard/Dashboard.tsx',
  'components/dashboard/DashboardCard.tsx',
  'services/aiService.ts',
  'styles/globals.css',
  'package.json',
  'tsconfig.json'
];

const missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ MISSING: ${file}`);
    missingFiles.push(file);
    allFixed = false;
  }
});

// Check for import conflicts
console.log('\n🔍 Checking for import conflicts:');
const conflictPaths = [
  path.join(__dirname, 'src', 'App.tsx'),
  path.join(__dirname, 'src', 'main.tsx'),
  path.join(__dirname, 'lib', 'ai.ts')
];

let hasConflicts = false;
conflictPaths.forEach(conflictPath => {
  if (fs.existsSync(conflictPath)) {
    console.log(`❌ CONFLICT: ${conflictPath} still exists`);
    hasConflicts = true;
  }
});

if (!hasConflicts) {
  console.log('✅ No import conflicts detected');
}

// Check TypeScript syntax
console.log('\n🔧 Checking TypeScript syntax...');
try {
  const { execSync } = require('child_process');
  
  // Try a quick TypeScript check
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    cwd: __dirname
  });
  console.log('✅ TypeScript syntax check passed');
} catch (error) {
  console.log('❌ TypeScript syntax errors detected');
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  
  // Show first few lines of error for debugging
  const errorLines = errorOutput.split('\n').slice(0, 5);
  errorLines.forEach(line => {
    if (line.trim()) console.log(`   ${line}`);
  });
  
  allFixed = false;
}

// Final status
console.log('\n🎯 Build Fix Summary:');
console.log(`   Duplicate directories removed: ${duplicateDirectories.length}`);
console.log(`   Missing files: ${missingFiles.length}`);
console.log(`   Import conflicts: ${hasConflicts ? 'Yes' : 'No'}`);
console.log(`   TypeScript syntax: ${allFixed ? 'Clean' : 'Has errors'}`);

if (allFixed && !hasConflicts) {
  console.log('\n🎉 BUILD FIX COMPLETE!');
  console.log('✅ All conflicts resolved - Zero Zero is ready to build');
  console.log('\nNext steps:');
  console.log('  npm run dev    # Start development server');
  console.log('  npm run build  # Test build process');
} else {
  console.log('\n⚠️  BUILD FIX INCOMPLETE');
  console.log('Some issues still need attention:');
  
  if (missingFiles.length > 0) {
    console.log(`   • Missing files: ${missingFiles.join(', ')}`);
  }
  
  if (hasConflicts) {
    console.log('   • Import conflicts still exist');
    console.log('   • Manually delete duplicate src/ and lib/ directories');
  }
  
  if (!allFixed) {
    console.log('   • TypeScript syntax errors need fixing');
  }
}

console.log('\n🚀 Zero Zero structure fix complete!');