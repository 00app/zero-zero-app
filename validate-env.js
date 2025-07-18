#!/usr/bin/env node

console.log('🔍 Zero Zero Environment Validation\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

// Check for .env file and load it manually since we're in Node context
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=');
        envVars[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.log('❌ Could not read .env file:', error.message);
  }
} else {
  console.log('❌ .env file not found');
}

// Required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'VITE_OPENAI_API_KEY'
];

const optionalEnvVars = [
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_APP_NAME',
  'VITE_AI_ASSISTANT_NAME',
  'OPENAI_API_KEY'
];

console.log('\n📋 Required Environment Variables:');
requiredEnvVars.forEach(envVar => {
  const value = envVars[envVar] || process.env[envVar];
  const status = value ? '✅' : '❌';
  const preview = value ? `${value.substring(0, 20)}...` : 'Not set';
  console.log(`  ${status} ${envVar}: ${preview}`);
});

console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach(envVar => {
  const value = envVars[envVar] || process.env[envVar];
  const status = value ? '✅' : '⚪';
  const preview = value ? `${value.substring(0, 20)}...` : 'Not set';
  console.log(`  ${status} ${envVar}: ${preview}`);
});

// Validate Supabase URL format
const supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
if (supabaseUrl) {
  const isValidSupabaseUrl = supabaseUrl.includes('supabase.co') && supabaseUrl.startsWith('https://');
  console.log(`\n🔗 Supabase URL validation: ${isValidSupabaseUrl ? '✅ Valid' : '❌ Invalid format'}`);
  
  if (isValidSupabaseUrl) {
    const projectId = supabaseUrl.split('//')[1].split('.')[0];
    console.log(`   Project ID: ${projectId}`);
  }
}

// Validate OpenAI API key format
const openaiKey = envVars.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
if (openaiKey) {
  const isValidOpenAIKey = openaiKey.startsWith('sk-');
  console.log(`🤖 OpenAI API Key validation: ${isValidOpenAIKey ? '✅ Valid format' : '❌ Invalid format'}`);
  
  if (isValidOpenAIKey) {
    console.log(`   Key length: ${openaiKey.length} characters`);
  }
}

// Check for other environment files
const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
console.log('\n📄 Environment files:');
envFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '⚪'} ${file}`);
});

// Overall status
const allRequired = requiredEnvVars.every(envVar => envVars[envVar] || process.env[envVar]);
console.log(`\n🎯 Overall status: ${allRequired ? '✅ Ready for production' : '⚠️  Missing required variables'}`);

if (!allRequired) {
  console.log('\n💡 To fix missing variables:');
  console.log('  1. Create a .env file in your project root');
  console.log('  2. Add the missing environment variables');
  console.log('  3. Restart your development server');
  console.log('\nExample .env file:');
  console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  console.log('VITE_OPENAI_API_KEY=sk-your-openai-key-here');
}

// Check Zero Zero specific structure
console.log('\n🏗️  Zero Zero Structure Check:');
const zeroZeroFiles = [
  'App.tsx',
  'components/dashboard/ZaiChat.tsx',
  'services/aiService.ts',
  'styles/globals.css'
];

const missingZZFiles = [];
zeroZeroFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) missingZZFiles.push(file);
});

if (missingZZFiles.length === 0) {
  console.log('✅ Zero Zero structure complete');
} else {
  console.log('❌ Missing Zero Zero files - run cleanup.js to fix');
}

// Check for duplicate src directory
const srcExists = fs.existsSync(path.join(__dirname, 'src'));
if (srcExists) {
  console.log('\n⚠️  Duplicate src/ directory detected!');
  console.log('   Run: npm run cleanup to remove conflicts');
} else {
  console.log('\n✅ No duplicate src/ directory conflicts');
}

console.log('\n🚀 Zero Zero Environment Check Complete!');

if (allRequired && missingZZFiles.length === 0 && !srcExists) {
  console.log('🎉 Everything looks perfect! Ready to launch your sustainability app!');
} else {
  console.log('🔧 Some issues need attention - check the messages above');
}