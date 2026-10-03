const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Employee = require('./models/Employee');
const Leave = require('./models/Leave');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_system';

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Check if test employee already exists
    let emp = await Employee.findOne({ empid: 'EMP101' });

    if (!emp) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      emp = new Employee({
        empid: 'EMP101',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        department: 'IT / Development',
        basicSalary: 50000,
        hra: 10000,
        da: 5000,
        deductions: 2500,
        netSalary: 62500,
        password: hashedPassword
      });

      await emp.save();
      console.log('✅ Created Demo Employee: EMP101 / password123');
    } else {
      console.log('ℹ️ Demo Employee EMP101 already exists.');
    }

    // Add sample leave if none exist for EMP101
    const leaveCount = await Leave.countDocuments({ empid: 'EMP101' });
    if (leaveCount === 0) {
      await Leave.create([
        {
          empid: 'EMP101',
          employeeName: 'Rahul Sharma',
          date: '2026-10-10',
          reason: 'Family function & personal travel',
          grant: 'yes'
        },
        {
          empid: 'EMP101',
          employeeName: 'Rahul Sharma',
          date: '2026-10-24',
          reason: 'Medical checkup',
          grant: 'no'
        }
      ]);
      console.log('✅ Seeded initial sample leaves for EMP101');
    }

    console.log('\n--- Test Credentials ---');
    console.log('Emp ID   : EMP101');
    console.log('Password : password123');
    console.log('------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
