#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkDependencies() {
  log('🔍 Checking dependencies...', 'blue');
  
  try {
    const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf-8' }));
    
    // Check for Vite
    if (!packageJson.devDependencies?.vite) {
      log('❌ Vite not found in devDependencies', 'red');
      return false;
    }
    
    // Check for required scripts
    const requiredScripts = ['dev', 'build', 'preview'];
    for (const script of requiredScripts) {
      if (!packageJson.scripts?.[script]) {
        log(`❌ Missing script: ${script}`, 'red');
        return false;
      }
    }
    
    log('✅ All dependencies and scripts found', 'green');
    return true;
  } catch (error) {
    log(`❌ Error checking dependencies: ${error.message}`, 'red');
    return false;
  }
}

function checkBuildFiles() {
  log('📁 Checking build configuration...', 'blue');
  
  const requiredFiles = [
    'vite.config.ts',
    'tsconfig.json',
    'netlify.toml',
    'index.html',
    'main.tsx',
    'App.tsx'
  ];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      log(`❌ Missing file: ${file}`, 'red');
      return false;
    }
  }
  
  log('✅ All build files present', 'green');
  return true;
}

function runBuild() {
  log('🏗️  Running build...', 'blue');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    
    // Check if dist folder was created
    if (!existsSync('dist')) {
      log('❌ Build completed but dist folder not found', 'red');
      return false;
    }
    
    // Check for essential build files
    const distFiles = ['index.html', 'assets'];
    for (const file of distFiles) {
      if (!existsSync(join('dist', file))) {
        log(`❌ Missing in dist: ${file}`, 'red');
        return false;
      }
    }
    
    log('✅ Build completed successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'red');
    return false;
  }
}

function checkEnvironmentVariables() {
  log('🔐 Checking environment variables...', 'blue');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  let envFileExists = existsSync('.env');
  let envExampleExists = existsSync('.env.example');
  
  if (!envExampleExists) {
    log('❌ .env.example file not found', 'red');
    return false;
  }
  
  if (!envFileExists) {
    log('⚠️  .env file not found (create from .env.example)', 'yellow');
    log('   This is required for local development', 'yellow');
  }
  
  log('✅ Environment configuration ready', 'green');
  return true;
}

function main() {
  log('🚀 Zero Zero Build Verification', 'blue');
  log('================================', 'blue');
  
  const checks = [
    checkDependencies,
    checkBuildFiles,
    checkEnvironmentVariables,
    runBuild
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false;
      break;
    }
    console.log('');
  }
  
  if (allPassed) {
    log('🎉 All checks passed! Ready for deployment', 'green');
    log('', 'reset');
    log('Next steps:', 'blue');
    log('1. git add . && git commit -m "Deploy ready"', 'reset');
    log('2. git push origin main', 'reset');
    log('3. Deploy to Netlify', 'reset');
  } else {
    log('❌ Some checks failed. Fix issues before deployment', 'red');
    process.exit(1);
  }
}

main();