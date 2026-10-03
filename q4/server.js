const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

// Import Mongoose Models
const Admin = require('./models/Admin');
const Employee = require('./models/Employee');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp_system';

// ==========================================
// 1. MIDDLEWARES & VIEW ENGINE SETUP
// ==========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'erp_admin_secret_key_7788',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // Session valid for 2 hours
  })
);

// Global flash messages and session variables for EJS templates
app.use((req, res, next) => {
  res.locals.adminUser = req.session.admin || null;
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  delete req.session.success;
  delete req.session.error;
  next();
});

// Auth Guard Middleware: Only logged in Admin can access protected routes
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  req.session.error = 'Please login first to access the Admin Panel.';
  res.redirect('/login');
}

// ==========================================
// 2. EMAIL SENDER FUNCTION (NODEMAILER)
// ==========================================
async function sendWelcomeEmail(employee, plainPassword) {
  const cleanPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
  const emailUser = (process.env.EMAIL_USER || '').trim();

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: emailUser,
      pass: cleanPass
    }
  });

  const mailOptions = {
    from: `"ERP Admin Panel" <${emailUser || 'swenishah2812@gmail.com'}>`,
    to: employee.email,
    subject: 'Welcome to ERP System - Your Login Credentials',
    html: `
      <h2>Hello ${employee.name},</h2>
      <p>Your employee account has been created successfully in the ERP System.</p>
      <h3>Your Login Credentials:</h3>
      <ul>
        <li><strong>Employee ID:</strong> ${employee.empid}</li>
        <li><strong>Password:</strong> ${plainPassword}</li>
      </ul>
      <h3>Salary Details:</h3>
      <ul>
        <li><strong>Department:</strong> ${employee.department}</li>
        <li><strong>Basic Salary:</strong> ₹${employee.basicSalary.toLocaleString()}</li>
        <li><strong>HRA:</strong> ₹${employee.hra.toLocaleString()}</li>
        <li><strong>DA:</strong> ₹${employee.da.toLocaleString()}</li>
        <li><strong>Deductions:</strong> ₹${employee.deductions.toLocaleString()}</li>
        <li><strong>Net Salary:</strong> ₹${employee.netSalary.toLocaleString()}</li>
      </ul>
      <p><em>Please keep these credentials secure.</em></p>
    `
  };

  try {
    if (emailUser && cleanPass) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] Successfully sent to ${employee.email} (Message ID: ${info.messageId})`);
      return { success: true };
    } else {
      console.log('------------------------------------------------------------');
      console.log('[EMAIL SIMULATION] Real SMTP password not set in .env.');
      console.log(`[SENT TO]: ${employee.email}`);
      console.log(`[CREDENTIALS]: EmpID: ${employee.empid} | Password: ${plainPassword}`);
      console.log('------------------------------------------------------------');
      return { success: false, simulated: true };
    }
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email:', error.message);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 3. ROUTES
// ==========================================

// Root Route: Redirect to dashboard if logged in, else login
app.get('/', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

// --- ADMIN LOGIN & LOGOUT ROUTES ---
app.get('/login', (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect('/dashboard');
  }
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      req.session.error = 'Invalid admin username or password!';
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      req.session.error = 'Invalid admin username or password!';
      return res.redirect('/login');
    }

    // Login success: Store admin in session
    req.session.admin = admin.username;
    req.session.success = `Welcome back, ${admin.username}!`;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.session.error = 'Server error during login. Please try again.';
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/login');
  });
});

// --- EMPLOYEE CRUD ROUTES (PROTECTED) ---

// READ: View all employees
app.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.render('dashboard', { employees });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// CREATE: Show Add Employee form
app.get('/employees/add', requireAdmin, (req, res) => {
  res.render('add-employee');
});

// CREATE: Process Add Employee
app.post('/employees/add', requireAdmin, async (req, res) => {
  try {
    const { name, email, department, basicSalary, hra, da, deductions } = req.body;

    // 1. Salary Calculation
    const basic = parseFloat(basicSalary) || 0;
    const calculatedHra = hra !== '' && hra !== undefined ? parseFloat(hra) : Math.round(basic * 0.20);
    const calculatedDa = da !== '' && da !== undefined ? parseFloat(da) : Math.round(basic * 0.10);
    const calculatedDeductions = deductions !== '' && deductions !== undefined ? parseFloat(deductions) : Math.round(basic * 0.05);
    const netSalary = basic + calculatedHra + calculatedDa - calculatedDeductions;

    // 2. Generate Emp ID (e.g. EMP4821)
    const empid = 'EMP' + Math.floor(1000 + Math.random() * 9000);

    // 3. Generate Random Password (e.g. Pass@7391)
    const plainPassword = 'Pass@' + Math.floor(1000 + Math.random() * 9000);

    // 4. Send Email with plain password BEFORE hashing
    const emailResult = await sendWelcomeEmail(
      { name, email, empid, department, basicSalary: basic, hra: calculatedHra, da: calculatedDa, deductions: calculatedDeductions, netSalary },
      plainPassword
    );

    // 5. Encrypt Password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 6. Save Employee in MongoDB
    const newEmployee = new Employee({
      empid,
      name,
      email,
      department,
      basicSalary: basic,
      hra: calculatedHra,
      da: calculatedDa,
      deductions: calculatedDeductions,
      netSalary,
      password: hashedPassword
    });

    await newEmployee.save();

    if (emailResult.success) {
      req.session.success = `Employee added! Email successfully sent to ${email} (Emp ID: ${empid}, Temp Password: ${plainPassword})`;
    } else if (emailResult.error) {
      req.session.error = `Employee saved (Emp ID: ${empid}), but email could not be delivered to ${email}. Reason: ${emailResult.error}`;
    } else {
      req.session.success = `Employee added successfully! Emp ID: ${empid} | Password: ${plainPassword} (Simulated mode: check terminal)`;
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error adding employee:', error);
    req.session.error = 'Failed to add employee: ' + error.message;
    res.redirect('/employees/add');
  }
});

// UPDATE: Show Edit Employee form
app.get('/employees/edit/:id', requireAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      req.session.error = 'Employee not found!';
      return res.redirect('/dashboard');
    }
    res.render('edit-employee', { employee });
  } catch (error) {
    console.error('Error finding employee for edit:', error);
    res.redirect('/dashboard');
  }
});

// UPDATE: Process Edit Employee
app.post('/employees/edit/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, department, basicSalary, hra, da, deductions } = req.body;

    // Recalculate salary
    const basic = parseFloat(basicSalary) || 0;
    const calculatedHra = parseFloat(hra) || 0;
    const calculatedDa = parseFloat(da) || 0;
    const calculatedDeductions = parseFloat(deductions) || 0;
    const netSalary = basic + calculatedHra + calculatedDa - calculatedDeductions;

    await Employee.findByIdAndUpdate(req.params.id, {
      name,
      email,
      department,
      basicSalary: basic,
      hra: calculatedHra,
      da: calculatedDa,
      deductions: calculatedDeductions,
      netSalary
    });

    req.session.success = 'Employee details updated successfully!';
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error updating employee:', error);
    req.session.error = 'Failed to update employee: ' + error.message;
    res.redirect(`/employees/edit/${req.params.id}`);
  }
});

// DELETE: Remove Employee
app.get('/employees/delete/:id', requireAdmin, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    req.session.success = 'Employee deleted successfully!';
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting employee:', error);
    req.session.error = 'Failed to delete employee!';
    res.redirect('/dashboard');
  }
});

// ==========================================
// 4. DATABASE CONNECTION & DEFAULT ADMIN SEED
// ==========================================
async function seedDefaultAdmin() {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultPassword = 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const defaultAdmin = new Admin({
        username: 'admin',
        password: hashedPassword
      });

      await defaultAdmin.save();
      console.log('[SEED] Default admin created -> Username: "admin" | Password: "admin123"');
    }
  } catch (err) {
    console.error('[SEED ERROR] Failed to seed default admin:', err.message);
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('[DB] Connected to MongoDB successfully.');
    await seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`[SERVER] ERP Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB ERROR] Could not connect to MongoDB:', err.message);
    console.log('Tip: Ensure MongoDB is running locally or specify a valid MONGO_URI in .env');
  });
