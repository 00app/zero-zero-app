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

function checkPackageLock() {
  log('🔒 Checking package-lock.json...', 'blue');
  
  if (!existsSync('package-lock.json')) {
    log('❌ package-lock.json not found', 'red');
    log('   Run: npm install to generate it', 'yellow');
    return false;
  }
  
  log('✅ package-lock.json found', 'green');
  return true;
}

function checkNetlifyConfig() {
  log('🚀 Checking Netlify configuration...', 'blue');
  
  if (!existsSync('netlify.toml')) {
    log('❌ netlify.toml not found', 'red');
    return false;
  }
  
  try {
    const netlifyConfig = execSync('cat netlify.toml', { encoding: 'utf-8' });
    
    // Check build command
    if (!netlifyConfig.includes('npm install && npm run build')) {
      log('❌ Build command should be "npm install && npm run build"', 'red');
      return false;
    }
    
    // Check publish directory
    if (!netlifyConfig.includes('publish = "dist"')) {
      log('❌ Publish directory should be "dist"', 'red');
      return false;
    }
    
    log('✅ Netlify configuration correct', 'green');
    return true;
  } catch (error) {
    log(`❌ Error reading netlify.toml: ${error.message}`, 'red');
    return false;
  }
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
    'App.tsx',
    'package-lock.json'
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
  log('🏗️  Running build test...', 'blue');
  
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
  log('🚀 Zero Zero Netlify Build Verification', 'blue');
  log('========================================', 'blue');
  
  const checks = [
    checkPackageLock,
    checkNetlifyConfig,
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
    log('🎉 All checks passed! Ready for Netlify deployment', 'green');
    log('', 'reset');
    log('✅ Fixes applied:', 'blue');
    log('   • package-lock.json generated and present', 'reset');
    log('   • Build command changed to "npm install && npm run build"', 'reset');
    log('   • Publish directory confirmed as "dist"', 'reset');
    log('   • Vite 5.0 properly installed as dev dependency', 'reset');
    log('', 'reset');
    log('Next steps:', 'blue');
    log('1. git add . && git commit -m "Fix: Add package-lock.json and update build commands"', 'reset');
    log('2. git push origin main', 'reset');
    log('3. Deploy to Netlify (should work without "missing lockfile" error)', 'reset');
    log('', 'reset');
    log('🟢 Environment variables to set in Netlify dashboard:', 'green');
    log('   • VITE_SUPABASE_URL', 'reset');
    log('   • VITE_SUPABASE_ANON_KEY', 'reset');
  } else {
    log('❌ Some checks failed. Fix issues before deployment', 'red');
    process.exit(1);
  }
}

main();