const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '.env.example');
const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  process.exit(0);
}

// Check if .env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ .env.example file not found');
  process.exit(1);
}

// Copy .env.example to .env
try {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file from .env.example');
  console.log('📝 Please review the .env file and update values if needed');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

