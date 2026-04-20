
require('dotenv').config();
const Student = require('./src/models/Student');
const studentController = require('./src/controllers/studentController');
const authController = require('./src/controllers/authController');
const sequelize = require('./src/config/db');

async function testStudentBug() {
    try {
        await sequelize.sync({ alter: true });

        const testRoll = "TESTREJECT";
        const testEmail = "testreject@iitk.ac.in";

        // 1. Clean up
        await Student.destroy({ where: { rollNo: testRoll } });

        // 2. Register (Mock)
        const student = await Student.create({
            rollNo: testRoll,
            name: "Test Reject",
            email: testEmail,
            password: "hashed_password_123", // not really checking password in this test
            status: "Pending",
            messCardStatus: "Pending"
        });
        console.log('--- Student Registered (Pending) ---');

        // 3. Reject
        const reqReject = { params: { rollNo: testRoll }, user: { role: 'manager' } };
        const resReject = { json: (d) => console.log('   Reject Response:', d.message), status: (s) => resReject };
        await studentController.rejectStudent(reqReject, resReject);

        // 4. Verify Rejected
        let updated = await Student.findByPk(testRoll);
        console.log(`   Verification after Reject: status=${updated.status}, messCardStatus=${updated.messCardStatus}`);

        // 5. Activate (Toggle)
        console.log('--- Manager clicks "Activate" ---');
        const reqToggle = { params: { rollNo: testRoll }, user: { role: 'manager' } };
        const resToggle = { json: (d) => console.log('   Toggle Response:', d.message), status: (s) => resToggle };
        await studentController.toggleMessStatus(reqToggle, resToggle);

        // 6. Verify Activated
        updated = await Student.findByPk(testRoll);
        console.log(`   Verification after Activate: status=${updated.status}, messCardStatus=${updated.messCardStatus}`);

        // 7. Test Login Logic
        console.log('--- Simulating Login Logic ---');
        const mockUser = updated;
        
        let blockedByPending = mockUser.status && mockUser.status.toLowerCase() === "pending";
        let blockedByRejected = mockUser.status && mockUser.status.toLowerCase() === "rejected";
        let blockedBySuspended = mockUser.messCardStatus && mockUser.messCardStatus.toLowerCase() === "suspended";

        console.log(`   Login Logic Checks:`);
        console.log(`     blockedByPending: ${blockedByPending}`);
        console.log(`     blockedByRejected: ${blockedByRejected}`);
        console.log(`     blockedBySuspended: ${blockedBySuspended}`);

        if (!blockedByPending && !blockedByRejected && !blockedBySuspended) {
            console.log('SUCCESS: Login would BE GRANTED (Bug not reproduced in isolation)');
        } else {
            console.log('FAILURE: Login would BE BLOCKED (Bug reproduced!)');
        }

    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await sequelize.close();
    }
}

testStudentBug();
