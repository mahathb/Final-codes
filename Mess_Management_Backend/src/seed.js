require('dotenv').config();
const sequelize = require('./config/db');
const bcrypt = require('bcrypt');
const { 
    Student, 
    MessManager, 
    Menu, 
    Poll, 
    PollOption, 
    ExtraItem 
} = require('./models/Index');

const seedDatabase = async () => {
    try {
        console.log("⏳ Connecting to Database...");
        await sequelize.authenticate();
        
        // sync({ force: true }) wipes the DB clean. 
        // Use this ONCE to fix the "StudentRollNo does not exist" error.
        await sequelize.sync({ force: true });
        console.log("✅ Database Wiped and Re-synced.");

        // 1. Create a Student (Password must be hashed for authController.login)
        const hashedPassword = await bcrypt.hash("abcdef", 10);
        await Student.create({
            rollNo: "231004",
            name: "Siddhant Singh",
            email: "siddhant23@iitk.ac.in",
            password: hashedPassword,
            roomNo: "H1-101",
            status: "Approved", // Approved status allows login
            messCardStatus: "Active"
        });

        // 2. Create a Manager (authController uses plain text for managers)
        const hPassword = await bcrypt.hash("abcd1234", 10);
        await MessManager.create({
            id: 1,
            name: "Admin",
            email: "manager@mess.com",
            password: hPassword 
        });

        // 3. Create Menu for Today
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = days[new Date().getDay()];
        
        const menuData = [
            { day: todayName, mealType: "Breakfast", items: ["Poha", "Tea", "Jalebi"] },
            { day: todayName, mealType: "Lunch", items: ["Dal Makhani", "Rice", "Roti", "Curd"] },
            { day: todayName, mealType: "Dinner", items: ["Paneer Butter Masala", "Jeera Rice", "Gulab Jamun"] }
        ];
        await Menu.bulkCreate(menuData);

        // 4. Create an Active Poll
        const poll = await Poll.create({
            title: "Special Sunday Dinner",
            description: "Vote for your favorite meal!",
            status: "active",
            startDate: new Date()
        });

        // 5. Create Poll Options (linked to the Poll)
        await PollOption.bulkCreate([
            { name: "Chicken Biryani", mealType: "Dinner", PollId: poll.id },
            { name: "Masala Dosa", mealType: "Dinner", PollId: poll.id },
            { name: "Paneer Pulao", mealType: "Dinner", PollId: poll.id }
        ]);

        // 6. Create Extra Items
        await ExtraItem.bulkCreate([
            { 
                name: "Omelette", 
                price: 20.00, 
                stockQuantity: 100, 
                mealType: "Breakfast", 
                day: "All", 
                isAvailable: true 
            },
            { 
                name: "Cold Coffee", 
                price: 35.00, 
                stockQuantity: 50, 
                mealType: "All", 
                day: "All", 
                isAvailable: true 
            }
        ]);

        console.log("🌱 Database Seeded Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
};

seedDatabase();