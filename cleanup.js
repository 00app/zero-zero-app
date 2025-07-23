#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Zero Zero: CRITICAL ERROR FIX - Removing duplicate directories...');

// Force remove duplicate src directory immediately
const duplicateSrcPath = path.join(__dirname, 'src');
if (fs.existsSync(duplicateSrcPath)) {
  console.log('❌ CRITICAL: Duplicate src/ directory found - FORCE REMOVING...');
  try {
    // Use recursive force removal
    fs.rmSync(duplicateSrcPath, { recursive: true, force: true, maxRetries: 3 });
    console.log('✅ FIXED: Duplicate src/ directory removed');
  } catch (error) {
    console.log('⚠️ MANUAL ACTION REQUIRED: Could not remove src/ directory');
    console.log('   Please manually delete the src/ directory');
    console.log('   Error:', error.message);
  }
} else {
  console.log('✅ No duplicate src/ directory found');
}

// Function to safely remove directory with detailed logging
function removeDirectory(dirPath, dirName) {
  if (fs.existsSync(dirPath)) {
    try {
      console.log(`❌ Found duplicate ${dirName} directory - removing...`);
      
      // List contents before removing for debugging
      const contents = fs.readdirSync(dirPath);
      console.log(`   Contents: ${contents.join(', ')}`);
      
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Successfully removed duplicate ${dirName} directory`);
      return true;
    } catch (error) {
      console.log(`⚠️  Could not remove ${dirName} directory:`, error.message);
      return false;
    }
  } else {
    console.log(`✅ No duplicate ${dirName} directory found`);
    return true;
  }
}

// Function to remove specific problematic files
function removeFile(filePath, fileName) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed conflicting file: ${fileName}`);
      return true;
    } catch (error) {
      console.log(`⚠️  Could not remove file ${fileName}:`, error.message);
      return false;
    }
  }
  return true;
}

// Remove all problematic duplicate directories and files
const duplicateItems = [
  { path: path.join(__dirname, 'src'), name: 'src', type: 'directory' },
  { path: path.join(__dirname, 'build'), name: 'build', type: 'directory' },
  { path: path.join(__dirname, 'dist'), name: 'dist', type: 'directory' },
  { path: path.join(__dirname, 'node_modules/.cache'), name: 'cache', type: 'directory' },
  { path: path.join(__dirname, '.vite'), name: '.vite', type: 'directory' },
  { path: path.join(__dirname, 'lib'), name: 'lib', type: 'directory' },
  { path: path.join(__dirname, 'src', 'App.tsx'), name: 'src/App.tsx', type: 'file' },
  { path: path.join(__dirname, 'src', 'main.tsx'), name: 'src/main.tsx', type: 'file' },
  { path: path.join(__dirname, 'src', 'styles', 'globals.css'), name: 'src/styles/globals.css', type: 'file' }
];

let allCleaned = true;
duplicateItems.forEach(({ path: itemPath, name, type }) => {
  if (fs.existsSync(itemPath)) {
    if (type === 'directory') {
      const cleaned = removeDirectory(itemPath, name);
      if (!cleaned) allCleaned = false;
    } else {
      const cleaned = removeFile(itemPath, name);
      if (!cleaned) allCleaned = false;
    }
  }
});

console.log('\n🔍 Verifying correct file structure...');

// Verify correct file structure exists
const requiredFiles = [
  'App.tsx',
  'main.tsx',
  'components/dashboard/ZaiChat.tsx',
  'services/aiService.ts',
  'services/supabase.ts',
  'supabase/functions/server/index.tsx',
  'styles/globals.css',
  '.env',
  'package.json',
  'tsconfig.json'
];

const missingFiles = [];
const existingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  } else {
    existingFiles.push(file);
  }
});

if (existingFiles.length > 0) {
  console.log('✅ Required files present:');
  existingFiles.forEach(file => console.log(`   ${file}`));
}

if (missingFiles.length > 0) {
  console.log('❌ Missing required files:');
  missingFiles.forEach(file => console.log(`   ${file}`));
  allCleaned = false;
} else {
  console.log('✅ All required files present');
}

// Check environment file and validate API keys
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL=https://fielacxysnzfekcnhvdl.supabase.co');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    const hasOpenAIKey = envContent.includes('VITE_OPENAI_API_KEY=sk-proj-7Sf3KRl4EteeSwNQ');
    
    console.log('🔧 Environment configuration:');
    console.log(`   ${hasSupabaseUrl ? '✅' : '❌'} Supabase URL configured`);
    console.log(`   ${hasSupabaseKey ? '✅' : '❌'} Supabase anon key configured`);
    console.log(`   ${hasOpenAIKey ? '✅' : '❌'} OpenAI API key configured`);
    
    if (hasSupabaseUrl && hasSupabaseKey && hasOpenAIKey) {
      console.log('✅ All required environment variables configured');
    } else {
      console.log('⚠️  Some environment variables may be missing or incorrect');
    }
  } catch (error) {
    console.log('⚠️  Could not read .env file:', error.message);
  }
} else {
  console.log('❌ .env file missing');
  allCleaned = false;
}

// Check for TypeScript and build configuration
const buildFiles = ['tsconfig.json', 'vite.config.ts', 'package.json'];
buildFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
    allCleaned = false;
  }
});

// Check package.json scripts
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredScripts = ['dev', 'build', 'cleanup', 'validate'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length === 0) {
      console.log('✅ All required npm scripts configured');
    } else {
      console.log(`⚠️  Missing npm scripts: ${missingScripts.join(', ')}`);
    }
  } catch (error) {
    console.log('⚠️  Could not read package.json:', error.message);
  }
}

console.log(`\n🎯 Cleanup ${allCleaned ? 'completed successfully' : 'completed with warnings'}`);

// GitHub deployment preparation
console.log('\n🚀 GitHub Deployment Preparation:');

// Check for deployment files
const deploymentFiles = [
  'netlify.toml',
  'vercel.json',
  '.gitignore'
];

deploymentFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} configured for deployment`);
  } else {
    console.log(`⚪ ${file} not found (optional)`);
  }
});

// Final verification - list current directory structure
console.log('\n📁 Current project structure (clean):');
try {
  const items = fs.readdirSync(__dirname);
  const directories = items.filter(item => {
    const itemPath = path.join(__dirname, item);
    return fs.statSync(itemPath).isDirectory() && !item.startsWith('.') && item !== 'node_modules';
  });
  
  directories.forEach(dir => {
    console.log(`   📂 ${dir}/`);
  });
  
  const mainFiles = items.filter(item => {
    return item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.json') || item === 'README.md' || item === '.env';
  });
  
  if (mainFiles.length > 0) {
    console.log('   📄 Main files:');
    mainFiles.forEach(file => {
      console.log(`      ${file}`);
    });
  }
} catch (error) {
  console.log('⚠️  Could not list directory structure:', error.message);
}

// Check for any remaining duplicates or conflicts
console.log('\n🔍 Conflict Detection:');
const conflictChecks = [
  { path: path.join(__dirname, 'src'), name: 'Duplicate src/ directory' },
  { path: path.join(__dirname, 'lib'), name: 'Duplicate lib/ directory' },
  { path: path.join(__dirname, 'build'), name: 'Build artifacts' },
  { path: path.join(__dirname, 'dist'), name: 'Distribution artifacts' }
];

let hasConflicts = false;
conflictChecks.forEach(({ path: checkPath, name }) => {
  if (fs.existsSync(checkPath)) {
    console.log(`❌ ${name} still exists`);
    hasConflicts = true;
  } else {
    console.log(`✅ No ${name.toLowerCase()}`);
  }
});

if (allCleaned && !hasConflicts) {
  console.log('\n🎉 Zero Zero is ready for GitHub deployment!');
  console.log('Next steps:');
  console.log('  1. git add .');
  console.log('  2. git commit -m "Ready for deployment"');
  console.log('  3. git push origin main');
  console.log('  4. Configure Netlify/Vercel with environment variables');
} else {
  console.log('\n🔧 Some issues detected - check the messages above');
  if (hasConflicts) {
    console.log('⚠️  Run this cleanup script again to resolve conflicts');
  }
}

console.log('\n✨ Zero Zero cleanup complete!');