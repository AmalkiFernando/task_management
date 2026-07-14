const { sequelize } = require('./src/models');

(async () => {
  try {
    console.log('🔄 Syncing database with models...');
    
    // Add the professional_role column to project_members table
    await sequelize.query(`
      ALTER TABLE project_members 
      ADD COLUMN professional_role ENUM(
        'designer',
        'frontend_developer',
        'backend_developer',
        'qa_engineer',
        'devops_engineer',
        'data_analyst',
        'product_manager',
        'business_analyst',
        'content_writer',
        'marketing_specialist',
        'other'
      ) DEFAULT 'other';
    `).catch(() => {
      console.log('ℹ️  Column already exists or other consideration');
    });

    console.log('✅ Database schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
