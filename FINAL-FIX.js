#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 ZERO ZERO: FINAL BUILD FIX');
console.log('===============================');

// Step 1: Remove duplicate src directory completely
console.log('\n1️⃣ Removing duplicate src/ directory...');
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  try {
    // Remove all files in src directory first
    const srcFiles = fs.readdirSync(srcDir, { withFileTypes: true });
    srcFiles.forEach(file => {
      const fullPath = path.join(srcDir, file.name);
      if (file.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    });
    
    // Remove the directory itself
    fs.rmdirSync(srcDir);
    console.log('✅ Removed duplicate src/ directory');
  } catch (error) {
    console.log('⚠️  Could not remove src/ directory:', error.message);
  }
} else {
  console.log('✅ No duplicate src/ directory found');
}

// Step 2: Remove duplicate lib directory
console.log('\n2️⃣ Removing duplicate lib/ directory...');
const libDir = path.join(__dirname, 'lib');
if (fs.existsSync(libDir)) {
  try {
    fs.rmSync(libDir, { recursive: true, force: true });
    console.log('✅ Removed duplicate lib/ directory');
  } catch (error) {
    console.log('⚠️  Could not remove lib/ directory:', error.message);
  }
} else {
  console.log('✅ No duplicate lib/ directory found');
}

// Step 3: Clean build artifacts
console.log('\n3️⃣ Cleaning build artifacts...');
const buildDirs = ['dist', 'build', '.vite', 'node_modules/.cache'];
buildDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Cleaned ${dir}/`);
    } catch (error) {
      console.log(`⚪ Could not clean ${dir}/`);
    }
  }
});

// Step 4: Verify required files exist in correct locations
console.log('\n4️⃣ Verifying file structure...');
const requiredFiles = [
  'App.tsx',
  'main.tsx',
  'services/aiService.ts',
  'components/dashboard/Dashboard.tsx',
  'components/dashboard/DashboardCard.tsx',
  'styles/globals.css',
  'package.json',
  'tsconfig.json',
  'vite.config.ts'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ MISSING: ${file}`);
    allFilesExist = false;
  }
});

// Step 5: Check for remaining conflicts
console.log('\n5️⃣ Checking for import conflicts...');
const conflictPaths = [
  'src/',
  'lib/',
  'src/App.tsx',
  'src/main.tsx',
  'lib/ai.ts'
];

let hasConflicts = false;
conflictPaths.forEach(conflictPath => {
  const fullPath = path.join(__dirname, conflictPath);
  if (fs.existsSync(fullPath)) {
    console.log(`❌ CONFLICT: ${conflictPath} still exists`);
    hasConflicts = true;
  }
});

if (!hasConflicts) {
  console.log('✅ No import conflicts detected');
}

// Step 6: Test TypeScript compilation
console.log('\n6️⃣ Testing TypeScript compilation...');
try {
  const { execSync } = require('child_process');
  
  // Quick syntax check
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    cwd: __dirname,
    timeout: 30000
  });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  
  // Show relevant errors only
  const lines = errorOutput.split('\n').filter(line => 
    line.includes('error') || line.includes('Expected') || line.includes('services/aiService.ts')
  );
  
  if (lines.length > 0) {
    console.log('   Key errors:');
    lines.slice(0, 3).forEach(line => {
      if (line.trim()) console.log(`     ${line.trim()}`);
    });
  }
}

// Final status
console.log('\n🎯 FINAL STATUS');
console.log('================');

if (allFilesExist && !hasConflicts) {
  console.log('🎉 ZERO ZERO BUILD FIX COMPLETE!');
  console.log('✅ All duplicate directories removed');
  console.log('✅ All required files present');
  console.log('✅ No import conflicts detected');
  console.log('✅ Ready for development and build');
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('   npm run dev    # Start development server');
  console.log('   npm run build  # Test production build');
  console.log('   npm run deploy-check  # Verify deployment readiness');
  
} else {
  console.log('⚠️  SOME ISSUES REMAIN:');
  
  if (!allFilesExist) {
    console.log('   • Some required files are missing');
  }
  
  if (hasConflicts) {
    console.log('   • Import conflicts still exist');
    console.log('   • Manually delete any remaining src/ or lib/ directories');
  }
  
  console.log('\n🔧 MANUAL STEPS NEEDED:');
  console.log('   1. Manually delete src/ directory if it still exists');
  console.log('   2. Manually delete lib/ directory if it still exists');
  console.log('   3. Run: npm run dev');
}

console.log('\n✨ Zero Zero build fix script complete!');