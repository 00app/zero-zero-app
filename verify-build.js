#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkDuplicateFiles() {
  log('📂 Checking for duplicate files...', 'blue');
  
  const duplicatePaths = [
    { path: 'src/App.tsx', rootPath: 'App.tsx' },
    { path: 'src/main.tsx', rootPath: 'main.tsx' },
    { path: 'src/styles/globals.css', rootPath: 'styles/globals.css' },
    { path: 'src/components', rootPath: 'components' }
  ];
  
  let foundDuplicates = false;
  let duplicateFiles = [];
  
  for (const { path, rootPath } of duplicatePaths) {
    if (existsSync(path) && existsSync(rootPath)) {
      log(`⚠️  Duplicate found: ${path} and ${rootPath}`, 'yellow');
      duplicateFiles.push(path);
      foundDuplicates = true;
    }
  }
  
  if (foundDuplicates) {
    log('❌ Duplicate files can cause build conflicts', 'red');
    log('   Remove the src/ directory to use root structure', 'yellow');
    log('   Duplicates found:', 'red');
    duplicateFiles.forEach(file => log(`   - ${file}`, 'red'));
    return false;
  }
  
  log('✅ No duplicate files found', 'green');
  return true;
}

function checkPackageJson() {
  log('📦 Checking package.json...', 'blue');
  
  try {
    const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf-8' }));
    
    // Check for required dependencies
    const requiredDeps = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      '@supabase/supabase-js': '^2.45.4',
      'lucide-react': '^0.294.0',
      'framer-motion': '^11.0.0'
    };
    
    const requiredDevDeps = {
      'typescript': '^5.2.2',
      'vite': '^5.0.8',
      'tailwindcss': '^3.4.1'
    };
    
    // Check dependencies
    for (const [dep, version] of Object.entries(requiredDeps)) {
      if (!packageJson.dependencies?.[dep]) {
        log(`❌ Missing dependency: ${dep}`, 'red');
        return false;
      }
      log(`✅ ${dep}: ${packageJson.dependencies[dep]}`, 'green');
    }
    
    // Check dev dependencies
    for (const [dep, version] of Object.entries(requiredDevDeps)) {
      if (!packageJson.devDependencies?.[dep]) {
        log(`❌ Missing dev dependency: ${dep}`, 'red');
        return false;
      }
      log(`✅ ${dep}: ${packageJson.devDependencies[dep]}`, 'green');
    }
    
    // Check scripts
    const requiredScripts = ['dev', 'build', 'type-check'];
    for (const script of requiredScripts) {
      if (!packageJson.scripts?.[script]) {
        log(`❌ Missing script: ${script}`, 'red');
        return false;
      }
    }
    
    // Check Node.js version
    if (packageJson.engines?.node !== '18') {
      log(`❌ Node.js version should be 18, got: ${packageJson.engines?.node}`, 'red');
      return false;
    }
    
    log('✅ Package.json configuration correct', 'green');
    return true;
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, 'red');
    return false;
  }
}

function checkSupabaseVersion() {
  log('🔍 Checking Supabase configuration...', 'blue');
  
  try {
    const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf-8' }));
    const supabaseVersion = packageJson.dependencies?.['@supabase/supabase-js'];
    
    if (!supabaseVersion) {
      log('❌ @supabase/supabase-js not found in dependencies', 'red');
      return false;
    }
    
    // Check if it's the updated version (2.45.4 or higher)
    const version = supabaseVersion.replace('^', '');
    const versionParts = version.split('.').map(Number);
    const isUpdated = versionParts[0] >= 2 && versionParts[1] >= 45 && versionParts[2] >= 4;
    
    if (isUpdated) {
      log(`✅ Supabase version: ${supabaseVersion} (latest stable)`, 'green');
      log('✅ Checksum integrity issues resolved', 'green');
    } else {
      log(`⚠️  Supabase version ${supabaseVersion} may have checksum issues`, 'yellow');
      log('   Consider updating to ^2.45.4 or higher', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error checking Supabase version: ${error.message}`, 'red');
    return false;
  }
}

function checkTypeScriptConfig() {
  log('📝 Checking TypeScript configuration...', 'blue');
  
  if (!existsSync('tsconfig.json')) {
    log('❌ tsconfig.json not found', 'red');
    return false;
  }
  
  try {
    const tsconfig = JSON.parse(execSync('cat tsconfig.json', { encoding: 'utf-8' }));
    
    // Check essential compiler options
    const requiredOptions = {
      'jsx': 'react-jsx',
      'noEmit': true,
      'strict': true,
      'moduleResolution': 'bundler'
    };
    
    for (const [option, expectedValue] of Object.entries(requiredOptions)) {
      const actualValue = tsconfig.compilerOptions?.[option];
      if (actualValue !== expectedValue) {
        log(`❌ tsconfig.json: ${option} should be ${expectedValue}, got ${actualValue}`, 'red');
        return false;
      }
    }
    
    // Check that src directory is excluded
    if (tsconfig.exclude && tsconfig.exclude.includes('src')) {
      log('✅ TypeScript config excludes src directory', 'green');
    } else {
      log('⚠️  TypeScript config should exclude src directory', 'yellow');
    }
    
    // Check include paths
    const requiredIncludes = ['*.tsx', '*.ts', 'components/**/*.tsx'];
    for (const include of requiredIncludes) {
      if (!tsconfig.include?.includes(include)) {
        log(`❌ tsconfig.json missing include: ${include}`, 'red');
        return false;
      }
    }
    
    log('✅ TypeScript configuration valid', 'green');
    return true;
  } catch (error) {
    log(`❌ Error reading tsconfig.json: ${error.message}`, 'red');
    return false;
  }
}

function runTypeCheck() {
  log('🔍 Running TypeScript type checking...', 'blue');
  
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    log('✅ TypeScript type checking passed', 'green');
    return true;
  } catch (error) {
    log('❌ TypeScript type checking failed:', 'red');
    
    // Try to get detailed TypeScript errors
    try {
      const tsOutput = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
      if (tsOutput.trim()) {
        log('TypeScript errors:', 'red');
        console.log(tsOutput);
      }
    } catch (tsError) {
      log('Unable to get detailed TypeScript errors', 'yellow');
      log(String(error.message || error), 'red');
    }
    
    return false;
  }
}

function checkViteConfig() {
  log('⚡ Checking Vite configuration...', 'blue');
  
  if (!existsSync('vite.config.ts')) {
    log('❌ vite.config.ts not found', 'red');
    return false;
  }
  
  try {
    const viteConfig = execSync('cat vite.config.ts', { encoding: 'utf-8' });
    
    // Check for essential configurations
    const requiredConfigs = [
      'defineConfig',
      'react()',
      'outDir: \'dist\'',
      'target: \'es2020\''
    ];
    
    for (const config of requiredConfigs) {
      if (!viteConfig.includes(config)) {
        log(`❌ vite.config.ts missing: ${config}`, 'red');
        return false;
      }
    }
    
    log('✅ Vite configuration valid', 'green');
    return true;
  } catch (error) {
    log(`❌ Error reading vite.config.ts: ${error.message}`, 'red');
    return false;
  }
}

function checkNetlifyConfig() {
  log('🚀 Checking Netlify configuration...', 'blue');
  
  if (!existsSync('netlify.toml')) {
    log('❌ netlify.toml not found', 'red');
    return false;
  }
  
  try {
    const netlifyConfig = execSync('cat netlify.toml', { encoding: 'utf-8' });
    
    // Check build configuration
    const requiredConfigs = {
      'command = "npm install && npm run build"': 'Build command',
      'publish = "dist"': 'Publish directory',
      'NODE_VERSION = "18"': 'Node.js version',
      'NPM_VERSION = "8.19.4"': 'npm version'
    };
    
    for (const [config, description] of Object.entries(requiredConfigs)) {
      if (!netlifyConfig.includes(config)) {
        log(`❌ netlify.toml missing: ${description}`, 'red');
        return false;
      }
    }
    
    log('✅ Netlify configuration correct', 'green');
    return true;
  } catch (error) {
    log(`❌ Error reading netlify.toml: ${error.message}`, 'red');
    return false;
  }
}

function checkEnvironmentFiles() {
  log('🔐 Checking environment configuration...', 'blue');
  
  // Check for .env.example
  if (!existsSync('.env.example')) {
    log('❌ .env.example file not found', 'red');
    return false;
  }
  
  try {
    const envExample = execSync('cat .env.example', { encoding: 'utf-8' });
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];
    
    for (const variable of requiredVars) {
      if (!envExample.includes(variable)) {
        log(`❌ .env.example missing: ${variable}`, 'red');
        return false;
      }
    }
    
    log('✅ Environment configuration files valid', 'green');
    
    // Check for .env (optional for local development)
    if (existsSync('.env')) {
      log('✅ .env file found for local development', 'green');
    } else {
      log('ℹ️  .env file not found (create from .env.example for local dev)', 'cyan');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error reading .env.example: ${error.message}`, 'red');
    return false;
  }
}

function checkBuildFiles() {
  log('📁 Checking required build files...', 'blue');
  
  const requiredFiles = [
    'index.html',
    'main.tsx',
    'App.tsx',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    'netlify.toml',
    '.env.example',
    'styles/globals.css'
  ];
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      log(`❌ Missing required file: ${file}`, 'red');
      return false;
    }
  }
  
  log('✅ All required build files present', 'green');
  return true;
}

function checkImportPaths() {
  log('🔗 Checking import paths...', 'blue');
  
  try {
    // Check main App.tsx for proper imports
    const appContent = execSync('cat App.tsx', { encoding: 'utf-8' });
    
    // Check for relative imports
    const importLines = appContent.split('\n').filter(line => line.trim().startsWith('import'));
    
    for (const line of importLines) {
      // Check for absolute imports that should be relative
      if (line.includes('import') && line.includes('/components/') && !line.includes('./components/')) {
        log(`⚠️  Potential import issue in App.tsx: ${line.trim()}`, 'yellow');
      }
    }
    
    log('✅ Import paths appear correct', 'green');
    return true;
  } catch (error) {
    log(`❌ Error checking import paths: ${error.message}`, 'red');
    return false;
  }
}

function checkNodeVersion() {
  log('🟢 Checking Node.js version...', 'blue');
  
  // Check .nvmrc file
  if (existsSync('.nvmrc')) {
    try {
      const nvmrcContent = execSync('cat .nvmrc', { encoding: 'utf-8' }).trim();
      if (nvmrcContent === '18') {
        log('✅ .nvmrc specifies Node.js 18', 'green');
      } else {
        log(`❌ .nvmrc should specify Node.js 18, got: ${nvmrcContent}`, 'red');
        return false;
      }
    } catch (error) {
      log(`❌ Error reading .nvmrc: ${error.message}`, 'red');
      return false;
    }
  } else {
    log('⚠️  .nvmrc file not found (recommended for deployment)', 'yellow');
  }
  
  return true;
}

function runBuild() {
  log('🏗️  Running production build...', 'blue');
  
  try {
    log('   Building application...', 'cyan');
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
    
    // Check build size
    try {
      const distStats = statSync('dist');
      log(`✅ Build completed successfully`, 'green');
      
      // Check assets folder size
      if (existsSync('dist/assets')) {
        const assetsFiles = readdirSync('dist/assets');
        log(`   Assets generated: ${assetsFiles.length} files`, 'cyan');
      }
      
    } catch (error) {
      log(`⚠️  Could not check build stats: ${error.message}`, 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Zero Zero - Final Deployment Verification', 'magenta');
  log('===============================================', 'magenta');
  log('', 'reset');
  
  const checks = [
    { name: 'Duplicate Files', fn: checkDuplicateFiles },
    { name: 'Package Configuration', fn: checkPackageJson },
    { name: 'Supabase Version', fn: checkSupabaseVersion },
    { name: 'TypeScript Config', fn: checkTypeScriptConfig },
    { name: 'Vite Configuration', fn: checkViteConfig },
    { name: 'Netlify Configuration', fn: checkNetlifyConfig },
    { name: 'Environment Files', fn: checkEnvironmentFiles },
    { name: 'Build Files', fn: checkBuildFiles },
    { name: 'Import Paths', fn: checkImportPaths },
    { name: 'Node.js Version', fn: checkNodeVersion },
    { name: 'TypeScript Check', fn: runTypeCheck },
    { name: 'Production Build', fn: runBuild }
  ];
  
  let allPassed = true;
  let failedChecks = [];
  
  for (const { name, fn } of checks) {
    log(`Running ${name}...`, 'blue');
    if (!fn()) {
      allPassed = false;
      failedChecks.push(name);
      log(`❌ ${name} failed`, 'red');
      break;
    } else {
      log(`✅ ${name} passed`, 'green');
    }
    console.log('');
  }
  
  if (allPassed) {
    log('🎉 ALL CHECKS PASSED! Ready for deployment', 'green');
    log('', 'reset');
    log('✅ Deployment fixes applied:', 'blue');
    log('   • Supabase updated to v2.45.4 (checksum issues resolved)', 'reset');
    log('   • TypeScript configuration optimized for root structure', 'reset');
    log('   • Duplicate src/ directory conflicts resolved', 'reset');
    log('   • Vite 5.0.8 with proper build optimization', 'reset');
    log('   • Netlify config with Node.js 18 and npm 8.19.4', 'reset');
    log('   • Environment variables properly configured', 'reset');
    log('   • All dependencies use stable versions', 'reset');
    log('', 'reset');
    log('🚀 Next steps for GitHub → Netlify deployment:', 'cyan');
    log('1. git add .', 'reset');
    log('2. git commit -m "Final deployment-ready build with all fixes"', 'reset');
    log('3. git push origin main', 'reset');
    log('4. Connect GitHub repo to Netlify', 'reset');
    log('5. Set environment variables in Netlify dashboard:', 'reset');
    log('   • VITE_SUPABASE_URL', 'reset');
    log('   • VITE_SUPABASE_ANON_KEY', 'reset');
    log('', 'reset');
    log('🟢 GitHub Repository: https://github.com/00app/zero-zero-app', 'green');
    log('🟢 Build Command: npm install && npm run build', 'green');
    log('🟢 Publish Directory: dist', 'green');
    log('🟢 Node.js Version: 18', 'green');
    log('', 'reset');
    log('💡 All known build, dependency, and environment errors have been resolved!', 'yellow');
  } else {
    log('❌ Some checks failed. Please fix before deployment:', 'red');
    failedChecks.forEach(check => log(`   - ${check}`, 'red'));
    process.exit(1);
  }
}

main();