#!/usr/bin/env node

/**
 * Build Verification Script
 * Verifies the build output is correct and production-ready
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}${colors.bright}🔍 Zero Zero Build Verification${colors.reset}`);
console.log('===================================\n');

const distPath = path.join(__dirname, 'dist');
const criticalFiles = [
  'index.html',
  'assets/index.js',
  'assets/index.css'
];

let hasErrors = false;
let warningCount = 0;

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.log(`${colors.red}❌ Build directory not found${colors.reset}`);
  console.log(`   Expected: ${distPath}`);
  console.log(`   ${colors.yellow}💡 Run 'npm run build' first${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.blue}📁 Build Directory:${colors.reset}`);
console.log(`   ${colors.green}✅ dist/ directory exists${colors.reset}`);

// Check critical files
console.log(`\n${colors.blue}📄 Critical Files:${colors.reset}`);
criticalFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`   ${colors.green}✅ ${file}${colors.reset} (${size} KB)`);
  } else {
    console.log(`   ${colors.red}❌ ${file}${colors.reset} - missing`);
    hasErrors = true;
  }
});

// Check assets directory
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  console.log(`\n${colors.blue}🎨 Assets:${colors.reset}`);
  console.log(`   ${colors.green}✅ ${assets.length} files in assets/${colors.reset}`);
  
  // Check for common asset types
  const jsFiles = assets.filter(file => file.endsWith('.js'));
  const cssFiles = assets.filter(file => file.endsWith('.css'));
  const mapFiles = assets.filter(file => file.endsWith('.map'));
  
  if (jsFiles.length > 0) {
    console.log(`   ${colors.green}✅ ${jsFiles.length} JavaScript files${colors.reset}`);
  } else {
    console.log(`   ${colors.red}❌ No JavaScript files found${colors.reset}`);
    hasErrors = true;
  }
  
  if (cssFiles.length > 0) {
    console.log(`   ${colors.green}✅ ${cssFiles.length} CSS files${colors.reset}`);
  } else {
    console.log(`   ${colors.red}❌ No CSS files found${colors.reset}`);
    hasErrors = true;
  }
  
  if (mapFiles.length > 0) {
    console.log(`   ${colors.yellow}⚠️ ${mapFiles.length} source map files${colors.reset} (should be excluded in production)`);
    warningCount++;
  }
} else {
  console.log(`\n${colors.red}❌ Assets directory not found${colors.reset}`);
  hasErrors = true;
}

// Check index.html content
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  console.log(`\n${colors.blue}📝 Index.html Validation:${colors.reset}`);
  
  if (indexContent.includes('<title>')) {
    console.log(`   ${colors.green}✅ Title tag present${colors.reset}`);
  } else {
    console.log(`   ${colors.yellow}⚠️ Title tag missing${colors.reset}`);
    warningCount++;
  }
  
  if (indexContent.includes('viewport')) {
    console.log(`   ${colors.green}✅ Viewport meta tag present${colors.reset}`);
  } else {
    console.log(`   ${colors.yellow}⚠️ Viewport meta tag missing${colors.reset}`);
    warningCount++;
  }
  
  if (indexContent.includes('assets/')) {
    console.log(`   ${colors.green}✅ Asset references present${colors.reset}`);
  } else {
    console.log(`   ${colors.red}❌ No asset references found${colors.reset}`);
    hasErrors = true;
  }
  
  if (indexContent.includes('type="module"')) {
    console.log(`   ${colors.green}✅ ES modules configured${colors.reset}`);
  } else {
    console.log(`   ${colors.yellow}⚠️ ES modules not detected${colors.reset}`);
    warningCount++;
  }
}

// Calculate total build size
const getBuildSize = (dir) => {
  let totalSize = 0;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getBuildSize(filePath);
    } else {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
};

const totalSize = getBuildSize(distPath);
const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

console.log(`\n${colors.blue}📊 Build Statistics:${colors.reset}`);
console.log(`   Total build size: ${totalSizeMB} MB`);

if (totalSize < 5 * 1024 * 1024) { // 5MB
  console.log(`   ${colors.green}✅ Build size optimal${colors.reset}`);
} else if (totalSize < 10 * 1024 * 1024) { // 10MB
  console.log(`   ${colors.yellow}⚠️ Build size acceptable${colors.reset}`);
  warningCount++;
} else {
  console.log(`   ${colors.red}❌ Build size too large${colors.reset}`);
  hasErrors = true;
}

// Final summary
console.log(`\n${colors.cyan}📋 Build Verification Summary:${colors.reset}`);
if (hasErrors) {
  console.log(`   ${colors.red}❌ Build verification failed${colors.reset}`);
  console.log(`   ${colors.yellow}💡 Fix the errors above before deploying${colors.reset}`);
  process.exit(1);
} else {
  console.log(`   ${colors.green}✅ Build verification passed${colors.reset}`);
  if (warningCount > 0) {
    console.log(`   ${colors.yellow}⚠️ ${warningCount} warnings${colors.reset}: Review items above`);
  }
  console.log(`   ${colors.cyan}🚀 Ready for deployment to Netlify${colors.reset}`);
}

console.log('\n===================================');