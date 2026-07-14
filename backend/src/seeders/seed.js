require('dotenv').config();
const sequelize = require('../config/db');
const { User, Project, ProjectMember, Task } = require('../models');

async function seed() {
  await sequelize.sync();

  const [admin, adminCreated] = await User.findOrCreate({
    where: { email: 'admin@gmail.com' },
    defaults: { name: 'System Admin', password: 'Admin@123', role: 'admin' },
  });
  if (!adminCreated) {
    admin.set({ name: 'System Admin', password: 'Admin@123', role: 'admin' });
    await admin.save();
  }

  const [pm, pmCreated] = await User.findOrCreate({
    where: { email: 'manager@gmail.com' },
    defaults: { name: 'Priya Manager', password: 'Manager@123', role: 'project_manager' },
  });
  if (!pmCreated) {
    pm.set({ name: 'Priya Manager', password: 'Manager@123', role: 'project_manager' });
    await pm.save();
  }

  const [member, memberCreated] = await User.findOrCreate({
    where: { email: 'member@gmail.com' },
    defaults: { name: 'Sam Member', password: 'Member@123', role: 'team_member' },
  });
  if (!memberCreated) {
    member.set({ name: 'Sam Member', password: 'Member@123', role: 'team_member' });
    await member.save();
  }

  const [project] = await Project.findOrCreate({
    where: { name: 'Website Redesign' },
    defaults: {
      description: 'Revamp the company marketing site',
      status: 'active',
      created_by: pm.id,
    },
  });

  await ProjectMember.findOrCreate({ where: { project_id: project.id, user_id: pm.id }, defaults: { project_role: 'manager' } });
  await ProjectMember.findOrCreate({ where: { project_id: project.id, user_id: member.id }, defaults: { project_role: 'member' } });

  await Task.findOrCreate({
    where: { title: 'Design homepage mockup', project_id: project.id },
    defaults: {
      description: 'Create high-fidelity Figma mockup for the new homepage',
      status: 'in_progress',
      priority: 'high',
      assigned_to: member.id,
      created_by: pm.id,
    },
  });

  console.log('Seed complete. Login with:');
  console.log('  admin@gmail.com / Admin@123');
  console.log('  manager@gmail.com / Manager@123');
  console.log('  member@gmail.com / Member@123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});