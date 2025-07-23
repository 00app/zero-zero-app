#!/usr/bin/env node

import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

config();

console.log('🚀 Zero Zero Deployment Check');
console.log('=============================');

let hasErrors = false;
let warnings = 0;

// Check if dist directory exists
console.log('\n📁 Build Output:');
if (existsSync(join(process.cwd(), 'dist'))) {
  console.log('✅ dist/ directory exists');
  
  // Check for critical build files
  const buildFiles = ['index.html', 'assets'];
  buildFiles.forEach(file => {
    if (existsSync(join(process.cwd(), 'dist', file))) {
      console.log(`✅ dist/${file} exists`);
    } else {
      console.log(`❌ dist/${file} missing`);
      hasErrors = true;
    }
  });
} else {
  console.log('❌ dist/ directory missing - run npm run build first');
  hasErrors = true;
}

// Check Netlify configuration
console.log('\n🌐 Netlify Configuration:');
if (existsSync(join(process.cwd(), 'netlify.toml'))) {
  console.log('✅ netlify.toml exists');
  
  try {
    const netlifyConfig = readFileSync(join(process.cwd(), 'netlify.toml'), 'utf8');
    if (netlifyConfig.includes('npm run build')) {
      console.log('✅ Build command configured');
    } else {
      console.log('⚠️  Build command not found in netlify.toml');
      warnings++;
    }
    
    if (netlifyConfig.includes('publish = "dist"')) {
      console.log('✅ Publish directory configured');
    } else {
      console.log('⚠️  Publish directory not configured');
      warnings++;
    }
  } catch (error) {
    console.log(`❌ Error reading netlify.toml: ${error.message}`);
    hasErrors = true;
  }
} else {
  console.log('⚠️  netlify.toml missing - manual configuration required');
  warnings++;
}

// Check Netlify functions
console.log('\n🔧 Netlify Functions:');
if (existsSync(join(process.cwd(), 'netlify/functions'))) {
  console.log('✅ netlify/functions directory exists');
  
  if (existsSync(join(process.cwd(), 'netlify/functions/openai-chat.js'))) {
    console.log('✅ OpenAI chat function exists');
  } else {
    console.log('⚠️  OpenAI chat function missing');
    warnings++;
  }
} else {
  console.log('⚠️  netlify/functions directory missing');
  warnings++;
}

// Check environment variables for production
console.log('\n🔐 Production Environment Variables:');
const prodEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_GOOGLE_MAPS_API_KEY'
];

prodEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value && value.trim()) {
    console.log(`✅ ${envVar}: Configured`);
  } else {
    console.log(`❌ ${envVar}: Missing - required for production`);
    hasErrors = true;
  }
});

// Check package.json for deployment
console.log('\n📦 Package.json Deployment Settings:');
try {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
  
  if (packageJson.engines?.node) {
    console.log(`✅ Node version specified: ${packageJson.engines.node}`);
  } else {
    console.log('⚠️  Node version not specified in engines');
    warnings++;
  }
  
  if (packageJson.engines?.npm) {
    console.log(`✅ NPM version specified: ${packageJson.engines.npm}`);
  } else {
    console.log('⚠️  NPM version not specified in engines');
    warnings++;
  }
  
  if (packageJson.scripts?.build) {
    console.log('✅ Build script configured');
  } else {
    console.log('❌ Build script missing');
    hasErrors = true;
  }
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
  hasErrors = true;
}

// Check TypeScript configuration
console.log('\n📝 TypeScript Configuration:');
if (existsSync(join(process.cwd(), 'tsconfig.json'))) {
  console.log('✅ tsconfig.json exists');
  
  try {
    const tsConfig = JSON.parse(readFileSync(join(process.cwd(), 'tsconfig.json'), 'utf8'));
    if (tsConfig.compilerOptions?.target) {
      console.log(`✅ TypeScript target: ${tsConfig.compilerOptions.target}`);
    } else {
      console.log('⚠️  TypeScript target not specified');
      warnings++;
    }
  } catch (error) {
    console.log(`❌ Error reading tsconfig.json: ${error.message}`);
    hasErrors = true;
  }
} else {
  console.log('❌ tsconfig.json missing');
  hasErrors = true;
}

// Final deployment readiness check
console.log('\n🎯 Deployment Readiness:');
console.log(`   Errors: ${hasErrors ? 'Yes' : 'None'}`);
console.log(`   Warnings: ${warnings}`);

if (hasErrors) {
  console.log('\n❌ Deployment blocked - fix errors above');
  console.log('   Run the following commands to resolve issues:');
  console.log('   1. npm run build');
  console.log('   2. Check environment variables');
  console.log('   3. Verify configuration files');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  Deployment ready with warnings');
  console.log('   Consider addressing warnings for optimal deployment');
  process.exit(0);
} else {
  console.log('\n✅ Deployment ready!');
  console.log('   Your Zero Zero app is ready for production deployment');
  process.exit(0);
}