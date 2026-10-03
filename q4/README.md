# ERP System - Admin Panel with Employee Management

Practical Assignment Solution for **Question 4 (Q4)**:
> *"Develop login for an ADMIN panel of ERP system with session, CRUD operations for employees table (generate empid and password) with salary calculation with mongoose, express and EJS template engine. Send email to employee when inserted. Encrypt the password. Logout."*

---

## 🚀 Key Features Implemented

1. **Admin Panel Login & Session Authentication (`express-session`)**:
   - Protected routes using custom middleware (`requireAdmin`).
   - Default admin credentials seeded automatically upon database connection.
   - Session-based login persistence.
   - **Logout** route destroying session and redirecting to login.

2. **Full CRUD Operations for Employees**:
   - **Create**: Add new employee with auto-generated credentials and calculated salary.
   - **Read**: Display all employees in an organized, responsive table on the dashboard.
   - **Update**: Edit existing employee details with live salary recalculation.
   - **Delete**: Remove employee record from MongoDB with confirmation dialog.

3. **Auto-Generated Credentials**:
   - **`empid`**: Auto-generated format (e.g., `EMP4821`).
   - **`password`**: Auto-generated temporary password (e.g., `Pass@7391`).

4. **Password Encryption (`bcryptjs`)**:
   - Generated password is encrypted with 10 salt rounds before saving in MongoDB.
   - Admin password is also securely hashed.

5. **Salary Calculation**:
   - **Formula**:
     $$\text{Net Salary} = \text{Basic Salary} + \text{HRA (20\%)} + \text{DA (10\%)} - \text{Deductions / PF (5\%) }$$
   - Live real-time calculation in the UI as the user types.
   - Server-side calculation and persistence in MongoDB.

6. **Automated Welcome Email (`nodemailer`)**:
   - Sends the unencrypted initial password and `empid` to the employee's email.
   - Safe simulation fallback if real SMTP credentials are not configured or offline during practical viva.

7. **Clean and Simple CSS**:
   - Clean, lightweight vanilla CSS (`public/style.css`).
   - Clear tables, forms, cards, and action buttons.

---

## 📁 Project Structure

```
assi-3 mern/
├── models/
│   ├── Admin.js         # Mongoose schema for Admin
│   └── Employee.js      # Mongoose schema for Employee (salary + credentials)
├── views/
│   ├── login.ejs        # Admin Login page
│   ├── dashboard.ejs    # Employee table, salary summary, CRUD actions
│   ├── add-employee.ejs # Form with live salary calculation
│   └── edit-employee.ejs# Form to edit employee and recalculate salary
├── public/
│   └── style.css        # Simple, clean CSS styling
├── .env                 # Environment variables (Mongo URI, Port, Email)
├── .env.example         # Example configuration
├── package.json         # Dependencies and scripts
├── server.js            # Main Express application & routes
└── README.md            # Documentation & Viva Guide
```

---

## ⚙️ How to Run

### Step 1: Ensure MongoDB is Running
Make sure local MongoDB is running:
```bash
# If running MongoDB locally as a service or mongod
mongod
```
*(Or use MongoDB Compass or provide a MongoDB Atlas cloud URI in `.env`)*

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Application
```bash
npm start
```
The server will start at:
👉 **http://localhost:3000**

---

## 🔑 Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

---

## 📧 Email Configuration (Optional)

In `.env`, you can provide your Gmail credentials:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```
> **Note for Practical Exams:** If you leave `EMAIL_USER` and `EMAIL_PASS` blank, the application will automatically simulate email sending in the terminal and display the generated credentials on screen so your practical demonstration never fails!
