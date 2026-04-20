require('dotenv').config();
const bcrypt = require('bcrypt');
const MessManager = require('./src/models/MessManager');
const sequelize = require('./src/config/db');

async function hashPasswords() {
  try {
    await sequelize.authenticate();
    const managers = await MessManager.findAll();
    console.log('Found', managers.length, 'managers.');
    
    for (const manager of managers) {
      if (!manager.password.startsWith('$2b$')) {
        const hashedPassword = await bcrypt.hash(manager.password, 10);
        manager.password = hashedPassword;
        await manager.save();
        console.log(`Hashed password for ${manager.email}`);
      } else {
        console.log(`Password for ${manager.email} already hashed.`);
      }
    }
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

hashPasswords();
