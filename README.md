# Exercise 7 - Nexora Tech: Company Management Webpage

---

## Aim

To develop a full-stack company management webpage using Node.js, Express, MongoDB, and vanilla HTML/CSS/JavaScript that supports user registration, role-based login (Admin/Employee), admin approval system, and secure JWT authentication.

---

## Software / Tools Required

- Node.js (v18 or above)
- MongoDB (local or Atlas)
- VS Code or any code editor
- Web browser (Chrome/Edge)
- Postman (optional, for API testing)

---

## Theory / Observation

### 1. Full-Stack Web Application

A full-stack application combines a **frontend** (user interface) and a **backend** (server + database). In this project:
- **Frontend** - HTML, CSS, and vanilla JavaScript served as static files
- **Backend** - Node.js with Express.js framework handling API routes
- **Database** - MongoDB (NoSQL) using Mongoose ODM for data modeling

### 2. RESTful API Design

The backend exposes RESTful endpoints under `/api/`:
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get logged-in user details
- `GET /api/users/employees` - List all employees (admin only)
- `GET /api/users/admins` - List all admins (approved employees)
- `PUT /api/users/approve/:id` - Approve an employee (admin only)
- `DELETE /api/users/:id` - Remove a user (admin only)

### 3. Authentication & Authorization (JWT)

- **Authentication** verifies who the user is. Passwords are hashed using **bcryptjs** before storing. On login, the server compares the hash.
- **Authorization** controls what a user can do. A **JSON Web Token (JWT)** is issued on login/register and stored in the browser's `localStorage`. Protected routes check this token via middleware.
- Two middleware layers:
  - `auth.js` - Verifies the JWT token and attaches user data to the request
  - `admin.js` - Checks if the authenticated user has the `admin` role

### 4. Role-Based Access Control

The system has two roles:
| Role | Registration Approval | Can View Admins | Can Approve Employees |
|------|----------------------|-----------------|----------------------|
| Admin | Auto-approved | Yes | Yes |
| Employee | Pending until admin approves | Only after approval | No |

### 5. MongoDB Data Model

The `User` schema contains:
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, hashed)
- `role` (String: "employee" or "admin")
- `department` (String)
- `approved` (Boolean, default false)
- `timestamps` (auto-generated createdAt/updatedAt)

### 6. Frontend-Backend Communication

The frontend uses the **Fetch API** to send requests to the backend:
- On successful login/register, the JWT token and user object are stored in `localStorage`
- The dashboard reads from `localStorage` to determine the user's role and approval status
- Protected API calls include the token in the `x-auth-token` header

### 7. Password Security

Passwords are never stored in plain text. The flow is:
1. User enters password
2. Server generates a **salt** (10 rounds)
3. Password + salt are hashed using bcryptjs
4. Only the hash is stored in MongoDB
5. On login, bcryptjs compares the entered password against the stored hash

---

## Procedure

### Step 1 - Set Up the Project

```
mkdir exe7
cd exe7
mkdir backend frontend
cd backend
npm init -y
```

### Step 2 - Install Dependencies

```
cd backend
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

### Step 3 - Create the Environment File

Create `backend/.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/companydb
PORT=5000
JWT_SECRET=company_secret_key
```

### Step 4 - Create the User Model

Create `backend/models/User.js` with fields: name, email, password, role, department, approved, and timestamps.

### Step 5 - Create Authentication Middleware

- `backend/middleware/auth.js` - Verifies JWT token from `x-auth-token` header
- `backend/middleware/admin.js` - Checks if user role is "admin"

### Step 6 - Create API Routes

- `backend/routes/auth.js` - Register, Login, Get current user
- `backend/routes/users.js` - List employees, List admins, Approve employee, Delete user

### Step 7 - Create the Server

Create `backend/server.js`:
- Load environment variables
- Set up Express with JSON parsing and CORS
- Connect to MongoDB
- Mount auth and user routes
- Serve frontend as static files
- Listen on configured port

### Step 8 - Build the Frontend

Create the following files under `frontend/`:
- `index.html` - Home/landing page
- `register.html` - Registration form with role selector
- `login.html` - Login form
- `dashboard.html` - Role-based dashboard
- `css/style.css` - Complete responsive styling
- `js/register.js` - Registration logic with Fetch API
- `js/login.js` - Login logic with Fetch API
- `js/dashboard.js` - Dashboard logic, approval system, data loading

### Step 9 - Run the Application

```
cd backend
npm start
```

Open `http://localhost:5000` in the browser.

---

## Output

### 1. Home Page

On visiting `http://localhost:5000`, the landing page displays:
- Nexora Tech branding with navigation bar
- Hero section with "Join Our Team" and "Member Login" buttons
- Feature cards highlighting Employee Dashboard, Admin Controls, and Secure Login
- Call-to-action section

### 2. Registration Page

The registration form allows users to:
- Enter full name, email, password, and department
- Choose role: **Employee** or **Admin**
- Password must be at least 6 characters
- On success: JWT token is stored, user is redirected to dashboard
- On error: appropriate message is shown (e.g., "Email already registered")

**Sample Registration Output:**
```
Input:  Name = "Rahul Sharma", Email = "rahul@company.com", Password = "123456", Department = "Engineering", Role = "Employee"
Result: Account created! Redirecting to dashboard...
Token stored in localStorage
```

### 3. Login Page

- User enters email and password
- On success: redirected to dashboard with user data
- On failure: "Invalid credentials" message displayed

**Sample Login Output:**
```
Input:  Email = "rahul@company.com", Password = "123456"
Result: Login successful! Redirecting...
Welcome, Rahul Sharma
```

### 4. Employee Dashboard (Not Yet Approved)

When a newly registered employee logs in:
- Shows "Approval Pending" banner
- Displays role as "Employee", department, and status as "Pending"
- Admin section is hidden
- Message: "Your account is awaiting approval from an admin."

### 5. Admin Dashboard

When an admin logs in:
- Shows all registered employees with their status
- Each employee card shows: Name, Email, Department, and Approval Status
- **Pending** employees have an "Approve" button next to them
- Clicking "Approve" sends a PUT request to `/api/users/approve/:id`
- Employee status changes from "Pending" to "Approved"

**Sample Admin Dashboard Output:**
```
Welcome, Admin User
Role: Admin
Department: Management
Status: Admin

Employees List:
+------------------+-----------------------+--------------+----------+
| Name             | Email                 | Department   | Status   |
+------------------+-----------------------+--------------+----------+
| Rahul Sharma     | rahul@company.com     | Engineering  | Pending  | [Approve]
| Priya Patel      | priya@company.com     | Design       | Approved |
+------------------+-----------------------+--------------+----------+
```

### 6. Employee Dashboard (Approved)

Once an admin approves the employee:
- "Approval Pending" banner disappears
- Status changes to "Approved"
- Admin section appears showing administrator details (Name, Email, Department)

**Sample Approved Employee Output:**
```
Welcome, Rahul Sharma
Role: Employee
Department: Engineering
Status: Approved

Administrators:
+----------------+-----------------------+--------------+
| Name           | Email                 | Department   |
+----------------+-----------------------+--------------+
| Admin User     | admin@company.com     | Management   |
+----------------+-----------------------+--------------+
```

### 7. API Response Examples

**Register Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Rahul Sharma",
    "email": "rahul@company.com",
    "role": "employee",
    "department": "Engineering",
    "approved": false
  }
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Rahul Sharma",
    "email": "rahul@company.com",
    "role": "employee",
    "department": "Engineering",
    "approved": true
  }
}
```

**Approve Employee Response:**
```json
{
  "msg": "User approved",
  "user": {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "name": "Rahul Sharma",
    "approved": true
  }
}
```

### 8. Logout

Clicking the **Logout** button clears `localStorage` and redirects to the login page.

---

## Conclusion

The company management webpage was successfully developed and tested. The application demonstrates full-stack development concepts including RESTful API design, JWT-based authentication, role-based access control, password hashing with bcryptjs, MongoDB data modeling with Mongoose, and responsive frontend design with vanilla HTML/CSS/JavaScript. The admin approval workflow ensures that only verified employees can access sensitive administrator information.
