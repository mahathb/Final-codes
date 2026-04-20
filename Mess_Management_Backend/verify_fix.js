
require('dotenv').config();
const menuController = require('./src/controllers/menuController');
const Menu = require('./src/models/Menu');
const sequelize = require('./src/config/db');

async function testFix() {
    try {
        await sequelize.sync({ alter: true });

        // 1. Setup initial menu for Monday
        await Menu.destroy({ where: { day: 'Monday' } });
        await Menu.bulkCreate([
            { day: 'Monday', mealType: 'Breakfast', items: ['Old Tea'] },
            { day: 'Monday', mealType: 'Lunch', items: ['Old Rice'] },
            { day: 'Monday', mealType: 'Dinner', items: ['Old Roti'] }
        ]);
        console.log('--- Initial Monday menu setup ---');

        // 2. Mock req and res for updateDayMenu
        const mockRes = () => {
            const res = {};
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => { res.body = data; return res; };
            return res;
        };

        const testCases = [
            {
                name: "Empty meals object",
                req: { params: { day: "Monday" }, body: { meals: {} }, user: { role: 'manager' } },
                expectedStatus: 400
            },
            {
                name: "Missing Dinner",
                req: { params: { day: "Monday" }, body: { meals: { "Breakfast": ["A"], "Lunch": ["B"] } }, user: { role: 'manager' } },
                expectedStatus: 400
            },
            {
                name: "Invalid Day",
                req: { params: { day: "Funday" }, body: { meals: { "Breakfast": ["A"], "Lunch": ["B"], "Dinner": ["C"] } }, user: { role: 'manager' } },
                expectedStatus: 400
            }
        ];

        for (const tc of testCases) {
            console.log(`\nTesting: ${tc.name}`);
            const res = mockRes();
            await menuController.updateDayMenu(tc.req, res);
            
            if (res.statusCode === tc.expectedStatus) {
                console.log(`✅ Success: Received expected status ${tc.expectedStatus}`);
                console.log(`   Message: ${res.body.error}`);
            } else {
                console.log(`❌ Failure: Received status ${res.statusCode}, expected ${tc.expectedStatus}`);
            }

            // Verify Monday menu is still there
            const menus = await Menu.findAll({ where: { day: 'Monday' } });
            if (menus.length === 3) {
                console.log(`✅ Verification: Monday menu preserved (3 items)`);
            } else {
                console.log(`❌ Verification: Monday menu LOST or altered! (Total items: ${menus.length})`);
            }
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await sequelize.close();
    }
}

testFix();
