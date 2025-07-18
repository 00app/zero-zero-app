#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Ensures all required environment variables are present and valid
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}${colors.bright}🔧 Zero Zero Environment Validation${colors.reset}`);
console.log('=====================================\n');

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log(`${colors.red}❌ .env file not found${colors.reset}`);
  console.log(`${colors.yellow}💡 Copy .env.example to .env and add your API keys${colors.reset}`);
  process.exit(1);
}

// Load .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
const envVars = {};

envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Required environment variables
const requiredVars = [
  {
    name: 'VITE_SUPABASE_URL',
    validator: (value) => value && value.includes('supabase.co'),
    description: 'Supabase project URL'
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    validator: (value) => value && value.startsWith('eyJ'),
    description: 'Supabase anonymous key'
  },
  {
    name: 'VITE_OPENAI_API_KEY',
    validator: (value) => value && value.startsWith('sk-'),
    description: 'OpenAI API key for Zai chat'
  },
  {
    name: 'VITE_GOOGLE_MAPS_API_KEY',
    validator: (value) => value && value.startsWith('AIza'),
    description: 'Google Maps API key for location services'
  }
];

// Optional environment variables
const optionalVars = [
  {
    name: 'VITE_APP_NAME',
    default: 'zero zero',
    description: 'Application name'
  },
  {
    name: 'VITE_AI_ASSISTANT_NAME',
    default: 'zai',
    description: 'AI assistant name'
  }
];

let hasErrors = false;
let warningCount = 0;

console.log(`${colors.blue}📊 Core Services:${colors.reset}`);
requiredVars.forEach(({ name, validator, description }) => {
  const value = envVars[name];
  const isValid = validator(value);
  
  if (isValid) {
    console.log(`   ${colors.green}✅ ${name}${colors.reset}: ${description}`);
  } else {
    console.log(`   ${colors.red}❌ ${name}${colors.reset}: ${description} - ${value ? 'invalid format' : 'missing'}`);
    hasErrors = true;
  }
});

console.log(`\n${colors.blue}🔧 Optional Services:${colors.reset}`);
optionalVars.forEach(({ name, default: defaultValue, description }) => {
  const value = envVars[name];
  
  if (value) {
    console.log(`   ${colors.green}✅ ${name}${colors.reset}: ${description}`);
  } else {
    console.log(`   ${colors.yellow}⚠️ ${name}${colors.reset}: ${description} - using default: "${defaultValue}"`);
    warningCount++;
  }
});

// Node.js and npm version check
console.log(`\n${colors.blue}🔍 Build Environment:${colors.reset}`);

const nodeVersion = process.version;
const requiredNodeVersion = '18.20.8';

if (nodeVersion.includes(requiredNodeVersion)) {
  console.log(`   ${colors.green}✅ Node.js${colors.reset}: ${nodeVersion}`);
} else {
  console.log(`   ${colors.yellow}⚠️ Node.js${colors.reset}: ${nodeVersion} (recommended: v${requiredNodeVersion})`);
  warningCount++;
}

// Check package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.engines) {
    console.log(`   ${colors.green}✅ Package.json engines${colors.reset}: configured`);
  } else {
    console.log(`   ${colors.yellow}⚠️ Package.json engines${colors.reset}: not configured`);
    warningCount++;
  }
} else {
  console.log(`   ${colors.red}❌ package.json${colors.reset}: not found`);
  hasErrors = true;
}

// Summary
console.log(`\n${colors.cyan}📋 Summary:${colors.reset}`);
if (hasErrors) {
  console.log(`   ${colors.red}❌ Validation failed${colors.reset}: ${hasErrors ? 'Missing required variables' : 'All core services configured'}`);
  console.log(`   ${colors.yellow}💡 Fix the errors above before deploying${colors.reset}`);
  process.exit(1);
} else {
  console.log(`   ${colors.green}✅ Validation passed${colors.reset}: All core services configured`);
  if (warningCount > 0) {
    console.log(`   ${colors.yellow}⚠️ ${warningCount} warnings${colors.reset}: Optional configurations missing`);
  }
  console.log(`   ${colors.cyan}🚀 Ready for deployment${colors.reset}`);
}

console.log('\n=====================================');