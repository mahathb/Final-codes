require('dotenv').config();
const MessManager = require('./src/models/MessManager');
const sequelize = require('./src/config/db');

async function checkManagers() {
  try {
    await sequelize.authenticate();
    const managers = await MessManager.findAll();
    console.log('Managers count:', managers.length);
    managers.forEach(m => {
      const isHashed = m.password.startsWith('$2b$');
      console.log(`Manager: ${m.email}, Hashed: ${isHashed}, Length: ${m.password.length}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkManagers();
