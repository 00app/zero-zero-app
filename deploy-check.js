#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Zero Zero: GitHub Deployment Check\n');

// Deployment readiness checklist
const deploymentChecks = [
  {
    name: 'Clean Structure',
    check: () => !fs.existsSync(path.join(__dirname, 'src')),
    message: 'No duplicate src/ directory'
  },
  {
    name: 'Environment Variables',
    check: () => {
      const envPath = path.join(__dirname, '.env');
      if (!fs.existsSync(envPath)) return false;
      const content = fs.readFileSync(envPath, 'utf8');
      return content.includes('VITE_SUPABASE_URL') && 
             content.includes('VITE_OPENAI_API_KEY');
    },
    message: 'Environment variables configured'
  },
  {
    name: 'Package Configuration',
    check: () => {
      const packagePath = path.join(__dirname, 'package.json');
      if (!fs.existsSync(packagePath)) return false;
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return pkg.scripts.build && pkg.scripts.dev;
    },
    message: 'Build scripts configured'
  },
  {
    name: 'TypeScript Configuration',
    check: () => fs.existsSync(path.join(__dirname, 'tsconfig.json')),
    message: 'TypeScript configuration present'
  },
  {
    name: 'Vite Configuration',
    check: () => fs.existsSync(path.join(__dirname, 'vite.config.ts')),
    message: 'Vite configuration present'
  },
  {
    name: 'Deployment Config',
    check: () => fs.existsSync(path.join(__dirname, 'netlify.toml')) || 
                 fs.existsSync(path.join(__dirname, 'vercel.json')),
    message: 'Deployment configuration present'
  },
  {
    name: 'Git Ignore',
    check: () => {
      const gitignorePath = path.join(__dirname, '.gitignore');
      if (!fs.existsSync(gitignorePath)) return false;
      const content = fs.readFileSync(gitignorePath, 'utf8');
      return content.includes('node_modules') && content.includes('dist');
    },
    message: 'Git ignore configured'
  },
  {
    name: 'Main Components',
    check: () => {
      const requiredFiles = [
        'App.tsx',
        'main.tsx',
        'styles/globals.css',
        'components/dashboard/Dashboard.tsx',
        'services/aiService.ts'
      ];
      return requiredFiles.every(file => 
        fs.existsSync(path.join(__dirname, file))
      );
    },
    message: 'Core components present'
  }
];

// Run all checks
let allPassed = true;
const results = [];

deploymentChecks.forEach(({ name, check, message }) => {
  const passed = check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}: ${message}`);
  results.push({ name, passed, message });
  if (!passed) allPassed = false;
});

console.log('\n📊 Deployment Readiness Summary:');
console.log(`   Passed: ${results.filter(r => r.passed).length}/${results.length}`);
console.log(`   Status: ${allPassed ? '✅ Ready for deployment' : '❌ Issues need attention'}`);

// Check for environment variables specifically
console.log('\n🔧 Environment Variables:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY', 
    'VITE_OPENAI_API_KEY'
  ];
  
  envVars.forEach(envVar => {
    const hasVar = envContent.includes(`${envVar}=`);
    console.log(`   ${hasVar ? '✅' : '❌'} ${envVar}`);
  });
} else {
  console.log('   ❌ No .env file found');
}

// Check package.json dependencies
console.log('\n📦 Dependencies Check:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const criticalDeps = [
    'react',
    'react-dom',
    'framer-motion',
    'openai',
    '@supabase/supabase-js',
    'typescript',
    'vite'
  ];
  
  criticalDeps.forEach(dep => {
    const hasDep = pkg.dependencies[dep] || pkg.devDependencies[dep];
    console.log(`   ${hasDep ? '✅' : '❌'} ${dep}`);
  });
}

// File size analysis
console.log('\n📏 Project Size Analysis:');
const getDirectorySize = (dirPath) => {
  if (!fs.existsSync(dirPath)) return 0;
  let size = 0;
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory() && item !== 'node_modules') {
      size += getDirectorySize(itemPath);
    } else if (stats.isFile()) {
      size += stats.size;
    }
  });
  
  return size;
};

const projectSize = getDirectorySize(__dirname);
const projectSizeMB = (projectSize / 1024 / 1024).toFixed(2);
console.log(`   Project size (excluding node_modules): ${projectSizeMB} MB`);

// Build test (dry run)
console.log('\n🔨 Build Check:');
try {
  const { execSync } = require('child_process');
  
  console.log('   Running TypeScript check...');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ TypeScript check passed');
  
} catch (error) {
  console.log('   ❌ TypeScript check failed');
  console.log('   Error:', error.message.split('\n')[0]);
  allPassed = false;
}

// Final recommendations
console.log('\n💡 Deployment Recommendations:');

if (allPassed) {
  console.log('🎉 Zero Zero is ready for GitHub deployment!');
  console.log('\nNext steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "feat: zero zero ready for deployment"');
  console.log('3. git push origin main');
  console.log('4. Configure your hosting platform with environment variables');
  console.log('5. Set build command: npm run build');
  console.log('6. Set publish directory: dist');
} else {
  console.log('🔧 Fix the issues above before deployment:');
  
  const failedChecks = results.filter(r => !r.passed);
  failedChecks.forEach(({ name, message }) => {
    console.log(`   • Fix ${name}: ${message}`);
  });
  
  console.log('\nThen run this script again to verify');
}

// Design compliance check
console.log('\n🎨 Zero Zero Design Compliance:');
const cssPath = path.join(__dirname, 'styles/globals.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const designChecks = [
    { check: cssContent.includes('--zz-black: #000000'), name: 'Black color defined' },
    { check: cssContent.includes('--zz-white: #ffffff'), name: 'White color defined' },
    { check: cssContent.includes('--zz-grey: #242424'), name: 'Grey color defined' },
    { check: cssContent.includes('Roboto'), name: 'Roboto font configured' },
    { check: cssContent.includes('zz-circle-button'), name: 'Button styles defined' }
  ];
  
  designChecks.forEach(({ check, name }) => {
    console.log(`   ${check ? '✅' : '❌'} ${name}`);
  });
} else {
  console.log('   ❌ styles/globals.css not found');
}

console.log('\n✨ Zero Zero deployment check complete!');