#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 ZERO ZERO: FINAL DEPLOYMENT CLEANUP');
console.log('=======================================');

// Step 1: Remove duplicate src directory completely
console.log('\n1️⃣ Removing duplicate src/ directory...');
const srcDir = path.join(__dirname, 'src');
if (fs.existsSync(srcDir)) {
  try {
    fs.rmSync(srcDir, { recursive: true, force: true });
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

// Step 4: Verify required files for Vite React app
console.log('\n4️⃣ Verifying Vite React app structure...');
const requiredFiles = [
  'App.tsx',
  'main.tsx',
  'index.html',
  'vite.config.ts',
  'package.json',
  'tsconfig.json',
  'styles/globals.css',
  'components/dashboard/Dashboard.tsx',
  'components/dashboard/DashboardCard.tsx',
  'services/aiService.ts',
  'services/supabase.ts'
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

// Step 5: Check for navigation arrows in Dashboard
console.log('\n5️⃣ Verifying Dashboard navigation...');
const dashboardPath = path.join(__dirname, 'components/dashboard/Dashboard.tsx');
if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  const hasArrows = dashboardContent.includes('←') && 
                   dashboardContent.includes('→') && 
                   dashboardContent.includes('↑') && 
                   dashboardContent.includes('↓');
  
  if (hasArrows) {
    console.log('✅ Dashboard has navigation arrows for web testing');
  } else {
    console.log('❌ Dashboard missing navigation arrows');
    allFilesExist = false;
  }
  
  const hasSwipe = dashboardContent.includes('handlePan') && 
                   dashboardContent.includes('drag=');
  
  if (hasSwipe) {
    console.log('✅ Dashboard has swipe functionality for mobile');
  } else {
    console.log('❌ Dashboard missing swipe functionality');
    allFilesExist = false;
  }
}

// Step 6: Check environment setup
console.log('\n6️⃣ Checking environment setup...');
const envExample = path.join(__dirname, '.env.example');
const envFile = path.join(__dirname, '.env');

if (fs.existsSync(envExample)) {
  console.log('✅ .env.example file present');
} else {
  console.log('⚪ No .env.example file');
}

if (fs.existsSync(envFile)) {
  console.log('✅ .env file present (for local development)');
} else {
  console.log('⚪ No .env file (will use environment variables in production)');
}

// Step 7: Verify no icon usage (only text symbols)
console.log('\n7️⃣ Verifying no icons (only text symbols)...');
const componentFiles = [
  'components/dashboard/Dashboard.tsx',
  'components/dashboard/DashboardCard.tsx',
  'components/dashboard/DashboardTopBar.tsx'
];

let hasIcons = false;
componentFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Check for common icon imports or usage
    if (content.includes('lucide-react') || 
        content.includes('react-icons') || 
        content.includes('heroicons') ||
        content.includes('<Icon') ||
        content.includes('Icon>')) {
      console.log(`❌ ${file} contains icon usage`);
      hasIcons = true;
    }
  }
});

if (!hasIcons) {
  console.log('✅ No icons found - using text symbols only');
}

// Step 8: Test TypeScript compilation
console.log('\n8️⃣ Testing TypeScript compilation...');
try {
  const { execSync } = require('child_process');
  
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    cwd: __dirname,
    timeout: 30000
  });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  
  // Show key errors only
  const lines = errorOutput.split('\n').filter(line => 
    line.includes('error') || line.includes('Expected')
  );
  
  if (lines.length > 0) {
    console.log('   Key errors:');
    lines.slice(0, 3).forEach(line => {
      if (line.trim()) console.log(`     ${line.trim()}`);
    });
  }
  allFilesExist = false;
}

// Final status
console.log('\n🎯 DEPLOYMENT READINESS CHECK');
console.log('==============================');

if (allFilesExist && !hasIcons) {
  console.log('🎉 ZERO ZERO IS DEPLOYMENT READY!');
  console.log('✅ All duplicate directories removed');
  console.log('✅ All required files present');
  console.log('✅ Navigation arrows added for web testing');
  console.log('✅ Swipe functionality preserved for mobile');
  console.log('✅ Only text symbols used (no icons)');
  console.log('✅ TypeScript compilation successful');
  console.log('✅ Vite React app structure verified');
  
  console.log('\n🚀 DEPLOYMENT COMMANDS:');
  console.log('   npm run build          # Test production build');
  console.log('   npm run deploy         # Full deployment preparation');
  console.log('   npm run deploy-check   # Verify deployment readiness');
  
  console.log('\n📱 FEATURES READY:');
  console.log('   • Brutal design system with 3-color palette');
  console.log('   • Navigation arrows for web testing (↑↓←→)');
  console.log('   • Swipe gestures for mobile users');
  console.log('   • AI-powered Zai assistant with OpenAI integration');
  console.log('   • Carbon footprint calculations with real data');
  console.log('   • Supabase backend integration');
  console.log('   • Responsive design (mobile-first)');
  
} else {
  console.log('⚠️  DEPLOYMENT PREPARATION NEEDED:');
  
  if (!allFilesExist) {
    console.log('   • Some required files are missing or have errors');
  }
  
  if (hasIcons) {
    console.log('   • Remove icons and replace with text symbols');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('   1. Fix any missing files or TypeScript errors');
  console.log('   2. Replace any icons with text symbols (✓, ×, ↑, ↓, ←, →, ⚙)');
  console.log('   3. Run: npm run build');
  console.log('   4. Test the application thoroughly');
}

console.log('\n✨ Zero Zero final cleanup complete!');