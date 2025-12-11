const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔗 MongoDB Atlas Connection Setup\n');
console.log('Please provide your MongoDB Atlas connection string.');
console.log('Format: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database-name>?retryWrites=true&w=majority\n');
console.log('💡 Tips:');
console.log('   - Replace <username> and <password> with your Atlas credentials');
console.log('   - Replace <database-name> with: cooltech-dev');
console.log('   - Make sure your IP is whitelisted in Atlas Network Access\n');

rl.question('Enter your MongoDB Atlas connection string: ', (connectionString) => {
  if (!connectionString || !connectionString.trim()) {
    console.log('❌ Connection string cannot be empty!');
    rl.close();
    process.exit(1);
  }

  // Ensure database name is included
  let mongoUri = connectionString.trim();
  
  // If connection string doesn't have database name, add it
  if (!mongoUri.includes('/cooltech-dev') && !mongoUri.includes('/?') && !mongoUri.includes('&')) {
    // Add database name before query parameters
    if (mongoUri.includes('?')) {
      mongoUri = mongoUri.replace('?', '/cooltech-dev?');
    } else {
      mongoUri = mongoUri.endsWith('/') ? mongoUri + 'cooltech-dev' : mongoUri + '/cooltech-dev';
    }
  }

  const envPath = path.join(__dirname, '.env');
  
  // Read current .env file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update MONGO_URI
  if (envContent.includes('MONGO_URI=')) {
    envContent = envContent.replace(/MONGO_URI=.*/g, `MONGO_URI=${mongoUri}`);
  } else {
    envContent += `\nMONGO_URI=${mongoUri}\n`;
  }

  // Write updated .env file
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('\n✅ MongoDB Atlas connection string updated successfully!');
  console.log(`   Connection: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Make sure your IP is whitelisted in MongoDB Atlas Network Access');
  console.log('   2. Run: node troubleshoot-login.js (to seed database and fix admin account)');
  console.log('   3. Start backend: npm run dev');
  console.log('   4. Start frontend: npm run dev');
  
  rl.close();
  process.exit(0);
});

