
require('dotenv').config();
const Menu = require('./src/models/Menu');
const sequelize = require('./src/config/db');

async function testAtomicity() {
    try {
        await sequelize.sync({ alter: true });

        // 1. Create initial menu for Monday
        await Menu.destroy({ where: { day: 'Monday' } });
        await Menu.create({
            day: 'Monday',
            mealType: 'Breakfast',
            items: ['Initial Eggs', 'Initial Toast']
        });
        console.log('--- Initial menu created for Monday ---');

        // 2. Try to update Monday menu but fail halfway
        console.log('--- Attempting update with failure ---');
        try {
            await sequelize.transaction(async (t) => {
                // Delete existing
                await Menu.destroy({ where: { day: 'Monday' }, transaction: t });
                console.log('   Deleted existing Monday menu (inside transaction)');

                // Simulate invalid data causing error
                console.log('   Simulating error during recreation...');
                throw new Error('FAILED_RECREATION');
            });
        } catch (e) {
            console.log('   Caught simulation error:', e.message);
        }

        // 3. Check if menu still exists
        const menus = await Menu.findAll({ where: { day: 'Monday' } });
        if (menus.length > 0) {
            console.log('SUCCESS: Menu was preserved (Atomicity works!)');
            console.log('Menu content:', JSON.stringify(menus, null, 2));
        } else {
            console.log('FAILURE: Menu was lost! (Atomicity BUG confirmed)');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await sequelize.close();
    }
}

testAtomicity();
