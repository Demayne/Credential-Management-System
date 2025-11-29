require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const OrganizationalUnit = require('../models/OrganizationalUnit');
const Division = require('../models/Division');
const CredentialRepository = require('../models/CredentialRepository');
const connectDB = require('../config/database');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await OrganizationalUnit.deleteMany({});
    await Division.deleteMany({});
    await CredentialRepository.deleteMany({});

    console.log('Cleared existing data...');

    // Create Organizational Units
    const ous = await OrganizationalUnit.insertMany([
      {
        name: 'News Management',
        code: 'NEWS',
        description: 'Manages all news-related content and operations'
      },
      {
        name: 'Software Reviews',
        code: 'SOFTWARE',
        description: 'Handles software review content and operations'
      },
      {
        name: 'Hardware Reviews',
        code: 'HARDWARE',
        description: 'Manages hardware review content and operations'
      },
      {
        name: 'Opinion Publishing',
        code: 'OPINION',
        description: 'Handles opinion and editorial content'
      }
    ]);

    console.log('Created Organizational Units...');

    // Create Divisions for each OU
    // Specification requires: "Each of these OUs has over 10 different divisions within them"
    const divisions = [];

    // News Management Divisions (11+ divisions)
    const newsDivisions = await Division.insertMany([
      { name: 'Editorial', code: 'NEWS-EDIT', organizationalUnit: ous[0]._id, description: 'Content editing and management' },
      { name: 'IT', code: 'NEWS-IT', organizationalUnit: ous[0]._id, description: 'IT infrastructure and support' },
      { name: 'Finance', code: 'NEWS-FIN', organizationalUnit: ous[0]._id, description: 'Financial operations' },
      { name: 'Content Writing', code: 'NEWS-WRITE', organizationalUnit: ous[0]._id, description: 'Content creation and writing' },
      { name: 'Social Media', code: 'NEWS-SOCIAL', organizationalUnit: ous[0]._id, description: 'Social media management' },
      { name: 'SEO', code: 'NEWS-SEO', organizationalUnit: ous[0]._id, description: 'Search engine optimization' },
      { name: 'Video Production', code: 'NEWS-VIDEO', organizationalUnit: ous[0]._id, description: 'Video content production' },
      { name: 'Photography', code: 'NEWS-PHOTO', organizationalUnit: ous[0]._id, description: 'Photography and image management' },
      { name: 'Legal', code: 'NEWS-LEGAL', organizationalUnit: ous[0]._id, description: 'Legal affairs and compliance' },
      { name: 'HR', code: 'NEWS-HR', organizationalUnit: ous[0]._id, description: 'Human resources' },
      { name: 'Marketing', code: 'NEWS-MKTG', organizationalUnit: ous[0]._id, description: 'Marketing and promotion' },
      { name: 'Analytics', code: 'NEWS-ANALYTICS', organizationalUnit: ous[0]._id, description: 'Data analytics and reporting' }
    ]);
    divisions.push(...newsDivisions);

    // Software Reviews Divisions (11+ divisions)
    const softwareDivisions = await Division.insertMany([
      { name: 'Development', code: 'SOFT-DEV', organizationalUnit: ous[1]._id, description: 'Software development team' },
      { name: 'Testing', code: 'SOFT-TEST', organizationalUnit: ous[1]._id, description: 'Quality assurance and testing' },
      { name: 'Finance', code: 'SOFT-FIN', organizationalUnit: ous[1]._id, description: 'Financial operations' },
      { name: 'Product Review', code: 'SOFT-REVIEW', organizationalUnit: ous[1]._id, description: 'Software product reviews' },
      { name: 'Research', code: 'SOFT-RESEARCH', organizationalUnit: ous[1]._id, description: 'Product research and analysis' },
      { name: 'Content Creation', code: 'SOFT-CONTENT', organizationalUnit: ous[1]._id, description: 'Review content creation' },
      { name: 'DevOps', code: 'SOFT-DEVOPS', organizationalUnit: ous[1]._id, description: 'DevOps and infrastructure' },
      { name: 'Security', code: 'SOFT-SEC', organizationalUnit: ous[1]._id, description: 'Security and compliance' },
      { name: 'Support', code: 'SOFT-SUPPORT', organizationalUnit: ous[1]._id, description: 'Technical support' },
      { name: 'Partnerships', code: 'SOFT-PARTNER', organizationalUnit: ous[1]._id, description: 'Vendor partnerships' },
      { name: 'IT', code: 'SOFT-IT', organizationalUnit: ous[1]._id, description: 'IT infrastructure' },
      { name: 'Marketing', code: 'SOFT-MKTG', organizationalUnit: ous[1]._id, description: 'Marketing and promotion' }
    ]);
    divisions.push(...softwareDivisions);

    // Hardware Reviews Divisions (11+ divisions)
    const hardwareDivisions = await Division.insertMany([
      { name: 'Lab Operations', code: 'HW-LAB', organizationalUnit: ous[2]._id, description: 'Hardware testing lab' },
      { name: 'IT', code: 'HW-IT', organizationalUnit: ous[2]._id, description: 'IT infrastructure' },
      { name: 'Finance', code: 'HW-FIN', organizationalUnit: ous[2]._id, description: 'Financial operations' },
      { name: 'Product Testing', code: 'HW-TEST', organizationalUnit: ous[2]._id, description: 'Hardware product testing' },
      { name: 'Benchmarking', code: 'HW-BENCH', organizationalUnit: ous[2]._id, description: 'Performance benchmarking' },
      { name: 'Review Writing', code: 'HW-WRITE', organizationalUnit: ous[2]._id, description: 'Review content writing' },
      { name: 'Photography', code: 'HW-PHOTO', organizationalUnit: ous[2]._id, description: 'Product photography' },
      { name: 'Video Production', code: 'HW-VIDEO', organizationalUnit: ous[2]._id, description: 'Video review production' },
      { name: 'Procurement', code: 'HW-PROC', organizationalUnit: ous[2]._id, description: 'Hardware procurement' },
      { name: 'Inventory', code: 'HW-INV', organizationalUnit: ous[2]._id, description: 'Inventory management' },
      { name: 'Logistics', code: 'HW-LOG', organizationalUnit: ous[2]._id, description: 'Shipping and logistics' },
      { name: 'Vendor Relations', code: 'HW-VENDOR', organizationalUnit: ous[2]._id, description: 'Vendor relationships' }
    ]);
    divisions.push(...hardwareDivisions);

    // Opinion Publishing Divisions (11+ divisions)
    const opinionDivisions = await Division.insertMany([
      { name: 'Writing', code: 'OPIN-WRITE', organizationalUnit: ous[3]._id, description: 'Content writing team' },
      { name: 'Finance', code: 'OPIN-FIN', organizationalUnit: ous[3]._id, description: 'Financial operations' },
      { name: 'Editorial', code: 'OPIN-EDIT', organizationalUnit: ous[3]._id, description: 'Editorial oversight' },
      { name: 'Fact Checking', code: 'OPIN-FACT', organizationalUnit: ous[3]._id, description: 'Fact checking and verification' },
      { name: 'Research', code: 'OPIN-RESEARCH', organizationalUnit: ous[3]._id, description: 'Research and investigation' },
      { name: 'Opinion Writing', code: 'OPIN-OPINION', organizationalUnit: ous[3]._id, description: 'Opinion piece writing' },
      { name: 'Column Management', code: 'OPIN-COL', organizationalUnit: ous[3]._id, description: 'Column and series management' },
      { name: 'Guest Writers', code: 'OPIN-GUEST', organizationalUnit: ous[3]._id, description: 'Guest writer coordination' },
      { name: 'Legal Review', code: 'OPIN-LEGAL', organizationalUnit: ous[3]._id, description: 'Legal review and compliance' },
      { name: 'Social Media', code: 'OPIN-SOCIAL', organizationalUnit: ous[3]._id, description: 'Social media engagement' },
      { name: 'Community', code: 'OPIN-COMM', organizationalUnit: ous[3]._id, description: 'Community engagement' },
      { name: 'IT', code: 'OPIN-IT', organizationalUnit: ous[3]._id, description: 'IT infrastructure and support' }
    ]);
    divisions.push(...opinionDivisions);

    console.log('Created Divisions...');

    // Update OUs with their divisions
    await OrganizationalUnit.updateOne(
      { _id: ous[0]._id },
      { $set: { divisions: newsDivisions.map(d => d._id) } }
    );
    await OrganizationalUnit.updateOne(
      { _id: ous[1]._id },
      { $set: { divisions: softwareDivisions.map(d => d._id) } }
    );
    await OrganizationalUnit.updateOne(
      { _id: ous[2]._id },
      { $set: { divisions: hardwareDivisions.map(d => d._id) } }
    );
    await OrganizationalUnit.updateOne(
      { _id: ous[3]._id },
      { $set: { divisions: opinionDivisions.map(d => d._id) } }
    );

    // Create Demo Users
    // Admin User - Demonstrates multi-OU and multi-division assignment
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@cooltech.com'.toLowerCase(),
      password: 'Admin123!',
      role: 'admin',
      organizationalUnits: [ous[0]._id, ous[1]._id, ous[2]._id], // Multiple OUs
      divisions: [
        newsDivisions[0]._id, newsDivisions[1]._id, newsDivisions[2]._id, // News divisions
        softwareDivisions[0]._id, softwareDivisions[1]._id, // Software divisions
        hardwareDivisions[0]._id // Hardware division
      ], // Multiple divisions across multiple OUs
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        department: 'Administration'
      }
    });

    // Management User - Demonstrates single OU with multiple divisions
    const managerUser = await User.create({
      username: 'manager',
      email: 'manager@cooltech.com'.toLowerCase(),
      password: 'Manager123!',
      role: 'management',
      organizationalUnits: [ous[0]._id], // Single OU
      divisions: [newsDivisions[0]._id, newsDivisions[1]._id, newsDivisions[2]._id, newsDivisions[3]._id], // Multiple divisions
      profile: {
        firstName: 'Manager',
        lastName: 'User',
        department: 'News Management'
      }
    });

    // Regular User - Demonstrates single OU and single division
    const regularUser = await User.create({
      username: 'user',
      email: 'user@cooltech.com'.toLowerCase(),
      password: 'User123!',
      role: 'user',
      organizationalUnits: [ous[1]._id], // Single OU
      divisions: [softwareDivisions[0]._id], // Single division
      profile: {
        firstName: 'Regular',
        lastName: 'User',
        department: 'Software Reviews'
      }
    });

    // Additional demo user - Demonstrates multi-OU assignment (non-admin)
    const multiOUUser = await User.create({
      username: 'multiuser',
      email: 'multiuser@cooltech.com'.toLowerCase(),
      password: 'Multi123!',
      role: 'user',
      organizationalUnits: [ous[1]._id, ous[3]._id], // Multiple OUs
      divisions: [
        softwareDivisions[0]._id, softwareDivisions[1]._id, // Software divisions
        opinionDivisions[0]._id, opinionDivisions[1]._id // Opinion divisions
      ], // Multiple divisions across multiple OUs
      profile: {
        firstName: 'Multi',
        lastName: 'User',
        department: 'Cross-Department'
      }
    });

    console.log('Created Demo Users...');
    console.log('\n=== DEMO ACCOUNTS ===');
    console.log('Admin (Multi-OU, Multi-Division):');
    console.log('  Email: admin@cooltech.com');
    console.log('  Password: Admin123!');
    console.log('  OUs: News Management, Software Reviews, Hardware Reviews');
    console.log('  Divisions: Multiple across 3 OUs');
    console.log('\nManager (Single OU, Multi-Division):');
    console.log('  Email: manager@cooltech.com');
    console.log('  Password: Manager123!');
    console.log('  OUs: News Management');
    console.log('  Divisions: Editorial, IT, Finance, Content Writing');
    console.log('\nUser (Single OU, Single Division):');
    console.log('  Email: user@cooltech.com');
    console.log('  Password: User123!');
    console.log('  OUs: Software Reviews');
    console.log('  Divisions: Development');
    console.log('\nMulti-User (Multi-OU, Multi-Division, Non-Admin):');
    console.log('  Email: multiuser@cooltech.com');
    console.log('  Password: Multi123!');
    console.log('  OUs: Software Reviews, Opinion Publishing');
    console.log('  Divisions: Multiple across 2 OUs');
    console.log('====================\n');

    // Create sample credential repositories with more test data
    // News Management - IT Division
    const repo1 = await CredentialRepository.create({
      division: newsDivisions[1]._id, // NEWS-IT
      credentials: [
        {
          title: 'Production WordPress Site',
          category: 'WordPress',
          url: 'https://news.cooltech.com/wp-admin',
          username: 'admin',
          password: 'SecurePass123!',
          notes: 'Main production site for news content',
          tags: ['production', 'wordpress', 'critical'],
          createdBy: adminUser._id
        },
        {
          title: 'Database Server',
          category: 'Database',
          url: 'mysql://db.news.cooltech.com',
          username: 'dbadmin',
          password: 'DbSecure456!',
          notes: 'MySQL database for news content',
          tags: ['database', 'mysql', 'server'],
          createdBy: adminUser._id
        },
        {
          title: 'CDN Account',
          category: 'Server',
          url: 'https://cdn.cooltech.com',
          username: 'cdnadmin',
          password: 'CDNPass789!',
          notes: 'Content delivery network account',
          tags: ['cdn', 'server', 'infrastructure'],
          createdBy: managerUser._id
        },
        {
          title: 'Backup Server',
          category: 'Server',
          url: 'ssh://backup.news.cooltech.com',
          username: 'backup',
          password: 'BackupPass123!',
          notes: 'Automated backup server for news content',
          tags: ['backup', 'server', 'infrastructure'],
          createdBy: adminUser._id
        }
      ]
    });

    // News Management - Finance Division
    const repo1b = await CredentialRepository.create({
      division: newsDivisions[2]._id, // NEWS-FIN
      credentials: [
        {
          title: 'Accounting System',
          category: 'Financial',
          url: 'https://accounting.news.cooltech.com',
          username: 'finance',
          password: 'FinancePass123!',
          notes: 'Financial management and accounting system',
          tags: ['finance', 'accounting', 'critical'],
          createdBy: adminUser._id
        },
        {
          title: 'Payment Gateway',
          category: 'Financial',
          url: 'https://payments.news.cooltech.com',
          username: 'payments',
          password: 'PaymentPass456!',
          notes: 'Payment processing gateway',
          tags: ['payments', 'financial', 'gateway'],
          createdBy: adminUser._id
        }
      ]
    });

    // Software Reviews - Development Division
    const repo2 = await CredentialRepository.create({
      division: softwareDivisions[0]._id, // SOFT-DEV
      credentials: [
        {
          title: 'GitHub Organization',
          category: 'API',
          url: 'https://github.com/cooltech',
          username: 'devteam',
          password: 'GitHubToken789!',
          notes: 'GitHub organization for software projects',
          tags: ['github', 'api', 'development'],
          createdBy: regularUser._id
        },
        {
          title: 'Staging Server',
          category: 'Server',
          url: 'ssh://staging.software.cooltech.com',
          username: 'deploy',
          password: 'StagingPass321!',
          notes: 'Staging environment for software reviews',
          tags: ['staging', 'server', 'ssh'],
          createdBy: regularUser._id
        },
        {
          title: 'CI/CD Pipeline',
          category: 'API',
          url: 'https://ci.cooltech.com',
          username: 'cicd',
          password: 'CICDPass456!',
          notes: 'Continuous integration and deployment',
          tags: ['ci', 'cd', 'automation'],
          createdBy: adminUser._id
        },
        {
          title: 'Docker Registry',
          category: 'Server',
          url: 'https://registry.software.cooltech.com',
          username: 'docker',
          password: 'DockerPass789!',
          notes: 'Private Docker container registry',
          tags: ['docker', 'containers', 'devops'],
          createdBy: regularUser._id
        }
      ]
    });

    // Software Reviews - Testing Division
    const repo2b = await CredentialRepository.create({
      division: softwareDivisions[1]._id, // SOFT-TEST
      credentials: [
        {
          title: 'Test Management System',
          category: 'Other',
          url: 'https://test.software.cooltech.com',
          username: 'tester',
          password: 'TestPass123!',
          notes: 'Test case management and tracking',
          tags: ['testing', 'qa', 'management'],
          createdBy: regularUser._id
        },
        {
          title: 'Test Database',
          category: 'Database',
          url: 'mysql://testdb.software.cooltech.com',
          username: 'testdb',
          password: 'TestDbPass456!',
          notes: 'Test database for QA environment',
          tags: ['database', 'testing', 'qa'],
          createdBy: regularUser._id
        }
      ]
    });

    // Hardware Reviews - Lab Operations Division
    const repo3 = await CredentialRepository.create({
      division: hardwareDivisions[0]._id, // HW-LAB
      credentials: [
        {
          title: 'Lab Management System',
          category: 'Other',
          url: 'https://lab.cooltech.com',
          username: 'labadmin',
          password: 'LabPass123!',
          notes: 'Hardware testing lab management system',
          tags: ['lab', 'testing', 'hardware'],
          createdBy: adminUser._id
        },
        {
          title: 'Equipment Database',
          category: 'Database',
          url: 'https://equipment.cooltech.com',
          username: 'equipadmin',
          password: 'EquipPass456!',
          notes: 'Hardware equipment inventory database',
          tags: ['equipment', 'database', 'inventory'],
          createdBy: adminUser._id
        },
        {
          title: 'Benchmarking Tools',
          category: 'Other',
          url: 'https://benchmark.hw.cooltech.com',
          username: 'benchmark',
          password: 'BenchPass789!',
          notes: 'Hardware performance benchmarking tools',
          tags: ['benchmark', 'performance', 'testing'],
          createdBy: adminUser._id
        }
      ]
    });

    // Hardware Reviews - IT Division
    const repo3b = await CredentialRepository.create({
      division: hardwareDivisions[1]._id, // HW-IT
      credentials: [
        {
          title: 'Hardware Review CMS',
          category: 'WordPress',
          url: 'https://hw.cooltech.com/wp-admin',
          username: 'hwadmin',
          password: 'HWPass123!',
          notes: 'Content management for hardware reviews',
          tags: ['cms', 'wordpress', 'hardware'],
          createdBy: adminUser._id
        },
        {
          title: 'IT Infrastructure',
          category: 'Server',
          url: 'ssh://it.hw.cooltech.com',
          username: 'itadmin',
          password: 'ITPass456!',
          notes: 'IT infrastructure management server',
          tags: ['it', 'server', 'infrastructure'],
          createdBy: adminUser._id
        }
      ]
    });

    // Opinion Publishing - Writing Division
    const repo4 = await CredentialRepository.create({
      division: opinionDivisions[0]._id, // OPIN-WRITE
      credentials: [
        {
          title: 'CMS Platform',
          category: 'WordPress',
          url: 'https://opinion.cooltech.com/wp-admin',
          username: 'opinionadmin',
          password: 'OpinionPass123!',
          notes: 'Content management system for opinion pieces',
          tags: ['cms', 'wordpress', 'content'],
          createdBy: multiOUUser._id
        },
        {
          title: 'Editorial Calendar',
          category: 'Other',
          url: 'https://calendar.opinion.cooltech.com',
          username: 'editor',
          password: 'EditorPass456!',
          notes: 'Editorial calendar and scheduling system',
          tags: ['calendar', 'editorial', 'scheduling'],
          createdBy: multiOUUser._id
        },
        {
          title: 'Content Database',
          category: 'Database',
          url: 'mysql://content.opinion.cooltech.com',
          username: 'contentdb',
          password: 'ContentDbPass789!',
          notes: 'Database for opinion content storage',
          tags: ['database', 'content', 'storage'],
          createdBy: multiOUUser._id
        }
      ]
    });

    // Opinion Publishing - Editorial Division
    const repo4b = await CredentialRepository.create({
      division: opinionDivisions[1]._id, // OPIN-EDIT
      credentials: [
        {
          title: 'Editorial Workflow',
          category: 'Other',
          url: 'https://workflow.opinion.cooltech.com',
          username: 'editorial',
          password: 'EditorialPass123!',
          notes: 'Editorial workflow and approval system',
          tags: ['workflow', 'editorial', 'approval'],
          createdBy: multiOUUser._id
        }
      ]
    });

    console.log('Created Sample Credential Repositories...');
    const totalCredentials = repo1.credentials.length + repo1b.credentials.length + 
                            repo2.credentials.length + repo2b.credentials.length + 
                            repo3.credentials.length + repo3b.credentials.length + 
                            repo4.credentials.length + repo4b.credentials.length;
    console.log(`\n📊 Database Statistics:`);
    console.log(`   Organizational Units: ${ous.length}`);
    console.log(`   Total Divisions: ${divisions.length}`);
    console.log(`   Divisions per OU: ${Math.floor(divisions.length / ous.length)}`);
    console.log(`   Users: 4 (admin, manager, user, multiuser)`);
    console.log(`   Credential Repositories: 8`);
    console.log(`   Sample Credentials: ${totalCredentials}`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

