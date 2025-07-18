#!/usr/bin/env node

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config();

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_GOOGLE_MAPS_API_KEY'
];

const OPTIONAL_ENV_VARS = [
  'VITE_AIR_QUALITY_API_KEY',
  'VITE_TWILIO_ACCOUNT_SID',
  'VITE_TWILIO_AUTH_TOKEN',
  'VITE_TWILIO_PHONE',
  'VITE_APP_NAME',
  'VITE_AI_ASSISTANT_NAME'
];

console.log('🔍 Zero Zero Environment Validation');
console.log('=====================================');

let hasErrors = false;

// Check required environment variables
console.log('\n📋 Required Environment Variables:');
REQUIRED_ENV_VARS.forEach(envVar => {
  const value = process.env[envVar];
  if (value && value.trim()) {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${envVar}: Missing or empty`);
    hasErrors = true;
  }
});

// Check optional environment variables
console.log('\n📋 Optional Environment Variables:');
OPTIONAL_ENV_VARS.forEach(envVar => {
  const value = process.env[envVar];
  if (value && value.trim()) {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`⚠️  ${envVar}: Not set (optional)`);
  }
});

// Check package.json
console.log('\n📦 Package Configuration:');
try {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
  console.log(`✅ Package name: ${packageJson.name}`);
  console.log(`✅ Version: ${packageJson.version}`);
  console.log(`✅ Node version: ${packageJson.engines?.node || 'Not specified'}`);
  console.log(`✅ NPM version: ${packageJson.engines?.npm || 'Not specified'}`);
} catch (error) {
  console.log(`❌ Package.json error: ${error.message}`);
  hasErrors = true;
}

// Check critical files
console.log('\n📁 Critical Files:');
const criticalFiles = [
  'App.tsx',
  'main.tsx',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.js',
  'styles/globals.css'
];

criticalFiles.forEach(file => {
  try {
    readFileSync(join(process.cwd(), file), 'utf8');
    console.log(`✅ ${file}: Found`);
  } catch (error) {
    console.log(`❌ ${file}: Missing`);
    hasErrors = true;
  }
});

// Environment-specific checks
console.log('\n🔧 Environment-Specific Checks:');

// Supabase URL validation
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (supabaseUrl) {
  if (supabaseUrl.includes('supabase.co')) {
    console.log('✅ Supabase URL format looks correct');
  } else {
    console.log('⚠️  Supabase URL format may be incorrect');
  }
}

// OpenAI API key validation
const openaiKey = process.env.VITE_OPENAI_API_KEY;
if (openaiKey) {
  if (openaiKey.startsWith('sk-')) {
    console.log('✅ OpenAI API key format looks correct');
  } else {
    console.log('⚠️  OpenAI API key format may be incorrect');
  }
}

// Google Maps API key validation
const mapsKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
if (mapsKey) {
  if (mapsKey.startsWith('AIza')) {
    console.log('✅ Google Maps API key format looks correct');
  } else {
    console.log('⚠️  Google Maps API key format may be incorrect');
  }
}

// Summary
console.log('\n📊 Summary:');
if (hasErrors) {
  console.log('❌ Environment validation failed');
  console.log('   Please fix the issues above before deploying');
  process.exit(1);
} else {
  console.log('✅ Environment validation passed');
  console.log('   Your Zero Zero app is ready for deployment!');
  process.exit(0);
}