require('dotenv').config();
const bcrypt = require('bcrypt');
const MessManager = require('../src/models/MessManager');
const sequelize = require('../src/config/db');

async function verify() {
  try {
    await sequelize.authenticate();
    const manager = await MessManager.findOne({ where: { email: 'manager@mess.com' } });
    if (!manager) {
      console.log('Manager not found');
      return;
    }
    const passwordToTest = 'abcd1234';
    const isMatch = await bcrypt.compare(passwordToTest, manager.password);
    console.log(`Password "${passwordToTest}" for ${manager.email}: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
