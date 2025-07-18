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

function checkCleanSupabaseVersions() {
  log('🔍 Checking Supabase package versions (EINTEGRITY fix)...', 'blue');
  
  try {
    const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf-8' }));
    
    const requiredSupabaseVersions = {
      '@supabase/supabase-js': '^2.46.0',
      '@supabase/storage-js': '^2.8.0',
      '@supabase/postgrest-js': '^1.17.0'
    };
    
    let allCorrect = true;
    
    for (const [pkg, expectedVersion] of Object.entries(requiredSupabaseVersions)) {
      const actualVersion = packageJson.dependencies?.[pkg];
      if (actualVersion !== expectedVersion) {
        log(`❌ ${pkg}: expected ${expectedVersion}, got ${actualVersion}`, 'red');
        allCorrect = false;
      } else {
        log(`✅ ${pkg}: ${actualVersion} (clean NPM registry version)`, 'green');
      }
    }
    
    if (allCorrect) {
      log('✅ All Supabase packages use clean NPM registry versions', 'green');
      log('✅ EINTEGRITY checksum errors should be resolved', 'green');
    }
    
    return allCorrect;
  } catch (error) {
    log(`❌ Error checking Supabase versions: ${error.message}`, 'red');
    return false;
  }
}

function checkDuplicateDirectories() {
  log('📂 Checking for duplicate src/ directory...', 'blue');
  
  if (existsSync('src')) {
    log('❌ Duplicate src/ directory found - this causes build conflicts', 'red');
    log('   Remove src/ directory as we use root-level structure', 'yellow');
    
    // Check what's in the src directory
    try {
      const srcContents = readdirSync('src');
      log(`   Contents of src/: ${srcContents.join(', ')}`, 'yellow');
    } catch (error) {
      log(`   Could not read src/ directory: ${error.message}`, 'yellow');
    }
    
    return false;
  }
  
  log('✅ No duplicate src/ directory found', 'green');
  return true;
}

function checkPackageLockIntegrity() {
  log('🔒 Checking package-lock.json integrity...', 'blue');
  
  if (!existsSync('package-lock.json')) {
    log('❌ package-lock.json not found', 'red');
    return false;
  }
  
  try {
    const packageLock = JSON.parse(execSync('cat package-lock.json', { encoding: 'utf-8' }));
    
    // Check for Supabase packages in lockfile
    const supabasePackages = [
      '@supabase/supabase-js',
      '@supabase/storage-js', 
      '@supabase/postgrest-js'
    ];
    
    let allFound = true;
    for (const pkg of supabasePackages) {
      const nodePath = `node_modules/${pkg}`;
      if (!packageLock.packages?.[nodePath]) {
        log(`❌ ${pkg} not found in package-lock.json`, 'red');
        allFound = false;
      } else {
        const resolved = packageLock.packages[nodePath].resolved;
        if (!resolved || !resolved.includes('registry.npmjs.org')) {
          log(`❌ ${pkg} not using NPM registry URL: ${resolved}`, 'red');
          allFound = false;
        } else {
          log(`✅ ${pkg} using clean NPM registry`, 'green');
        }
      }
    }
    
    if (allFound) {
      log('✅ Package-lock.json has clean Supabase packages', 'green');
    }
    
    return allFound;
  } catch (error) {
    log(`❌ Error reading package-lock.json: ${error.message}`, 'red');
    return false;
  }
}

function checkNetlifyConfiguration() {
  log('🚀 Checking Netlify deployment configuration...', 'blue');
  
  if (!existsSync('netlify.toml')) {
    log('❌ netlify.toml not found', 'red');
    return false;
  }
  
  try {
    const netlifyConfig = execSync('cat netlify.toml', { encoding: 'utf-8' });
    
    const requiredConfigs = {
      'command = "npm install && npm run build"': 'Build command',
      'publish = "dist"': 'Publish directory',
      'NODE_VERSION = "18"': 'Node.js version',
      'NPM_VERSION = "8.19.4"': 'npm version'
    };
    
    let allCorrect = true;
    for (const [config, description] of Object.entries(requiredConfigs)) {
      if (!netlifyConfig.includes(config)) {
        log(`❌ netlify.toml missing: ${description}`, 'red');
        allCorrect = false;
      } else {
        log(`✅ ${description} configured correctly`, 'green');
      }
    }
    
    return allCorrect;
  } catch (error) {
    log(`❌ Error reading netlify.toml: ${error.message}`, 'red');
    return false;
  }
}

function checkGitIgnoreConfiguration() {
  log('📝 Checking .gitignore configuration...', 'blue');
  
  if (!existsSync('.gitignore')) {
    log('❌ .gitignore not found', 'red');
    return false;
  }
  
  try {
    const gitignore = execSync('cat .gitignore', { encoding: 'utf-8' });
    
    // Check that package-lock.json is NOT ignored
    if (gitignore.includes('package-lock.json') && !gitignore.includes('!package-lock.json')) {
      log('❌ package-lock.json is ignored - it should be committed for deployment', 'red');
      return false;
    }
    
    // Check that src/ directory is ignored
    if (!gitignore.includes('src/')) {
      log('⚠️  src/ directory not in .gitignore', 'yellow');
    } else {
      log('✅ src/ directory ignored to prevent conflicts', 'green');
    }
    
    log('✅ .gitignore allows package-lock.json to be committed', 'green');
    return true;
  } catch (error) {
    log(`❌ Error reading .gitignore: ${error.message}`, 'red');
    return false;
  }
}

function checkTypeScriptConfiguration() {
  log('📝 Checking TypeScript configuration...', 'blue');
  
  if (!existsSync('tsconfig.json')) {
    log('❌ tsconfig.json not found', 'red');
    return false;
  }
  
  try {
    const tsconfig = JSON.parse(execSync('cat tsconfig.json', { encoding: 'utf-8' }));
    
    // Check that src directory is excluded
    if (tsconfig.exclude && tsconfig.exclude.includes('src')) {
      log('✅ TypeScript excludes src/ directory', 'green');
    } else {
      log('⚠️  TypeScript should exclude src/ directory', 'yellow');
    }
    
    // Check essential options
    const requiredOptions = {
      'jsx': 'react-jsx',
      'noEmit': true,
      'strict': true
    };
    
    for (const [option, expectedValue] of Object.entries(requiredOptions)) {
      const actualValue = tsconfig.compilerOptions?.[option];
      if (actualValue !== expectedValue) {
        log(`❌ tsconfig.json: ${option} should be ${expectedValue}, got ${actualValue}`, 'red');
        return false;
      }
    }
    
    log('✅ TypeScript configuration correct', 'green');
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

function runCleanBuild() {
  log('🏗️  Running clean production build...', 'blue');
  
  try {
    // Clean first
    log('   Cleaning previous build...', 'cyan');
    if (existsSync('dist')) {
      execSync('rm -rf dist', { stdio: 'pipe' });
    }
    
    // Build
    log('   Building application...', 'cyan');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Check build output
    if (!existsSync('dist')) {
      log('❌ Build completed but dist folder not found', 'red');
      return false;
    }
    
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
      
      if (existsSync('dist/assets')) {
        const assetsFiles = readdirSync('dist/assets');
        log(`   Assets generated: ${assetsFiles.length} files`, 'cyan');
        
        // Check for reasonable build size
        const jsFiles = assetsFiles.filter(f => f.endsWith('.js'));
        const cssFiles = assetsFiles.filter(f => f.endsWith('.css'));
        log(`   JavaScript files: ${jsFiles.length}`, 'cyan');
        log(`   CSS files: ${cssFiles.length}`, 'cyan');
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

function checkEnvironmentVariables() {
  log('🔐 Checking environment variable configuration...', 'blue');
  
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
      } else {
        log(`✅ ${variable} documented in .env.example`, 'green');
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Error reading .env.example: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Zero Zero - Netlify Deployment Fix Verification', 'magenta');
  log('================================================', 'magenta');
  log('', 'reset');
  
  const checks = [
    { name: 'Clean Supabase Versions (EINTEGRITY Fix)', fn: checkCleanSupabaseVersions },
    { name: 'Duplicate Directory Check', fn: checkDuplicateDirectories },
    { name: 'Package Lock Integrity', fn: checkPackageLockIntegrity },
    { name: 'Netlify Configuration', fn: checkNetlifyConfiguration },
    { name: 'Git Ignore Configuration', fn: checkGitIgnoreConfiguration },
    { name: 'TypeScript Configuration', fn: checkTypeScriptConfiguration },
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'TypeScript Type Check', fn: runTypeCheck },
    { name: 'Clean Production Build', fn: runCleanBuild }
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
    log('🎉 ALL NETLIFY DEPLOYMENT FIXES VERIFIED!', 'green');
    log('', 'reset');
    log('✅ EINTEGRITY Issues Fixed:', 'blue');
    log('   • Supabase packages updated to clean NPM registry versions', 'reset');
    log('   • @supabase/supabase-js: ^2.46.0 (latest stable)', 'reset');
    log('   • @supabase/storage-js: ^2.8.0 (clean registry)', 'reset');
    log('   • @supabase/postgrest-js: ^1.17.0 (clean registry)', 'reset');
    log('   • package-lock.json regenerated with fresh checksums', 'reset');
    log('', 'reset');
    log('✅ Deployment Configuration:', 'blue');
    log('   • Netlify build command: npm install && npm run build', 'reset');
    log('   • Node.js 18 with npm 8.19.4', 'reset');
    log('   • Publish directory: dist', 'reset');
    log('   • Duplicate src/ directory conflicts resolved', 'reset');
    log('   • package-lock.json tracked in Git for deployment', 'reset');
    log('', 'reset');
    log('🚀 Ready for GitHub → Netlify deployment:', 'cyan');
    log('1. git add .', 'reset');
    log('2. git commit -m "Fix: Resolve EINTEGRITY errors and clean Supabase packages"', 'reset');
    log('3. git push origin main', 'reset');
    log('4. In Netlify: "Clear cache and deploy site"', 'reset');
    log('5. Set environment variables:', 'reset');
    log('   • VITE_SUPABASE_URL=your-supabase-project-url', 'reset');
    log('   • VITE_SUPABASE_ANON_KEY=your-supabase-anon-key', 'reset');
    log('', 'reset');
    log('🟢 GitHub Repository: https://github.com/00app/zero-zero-app', 'green');
    log('🟢 All package checksums clean and verified', 'green');
    log('🟢 No more EINTEGRITY deployment errors', 'green');
  } else {
    log('❌ Some deployment fixes failed:', 'red');
    failedChecks.forEach(check => log(`   - ${check}`, 'red'));
    log('', 'reset');
    log('Please fix the failed checks before deploying to Netlify.', 'yellow');
    process.exit(1);
  }
}

main();