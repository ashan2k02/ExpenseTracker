# 📅 Day 1: Project Setup & Foundation
## Industry-Academia Collaborative Incubation Program
### Personal Expense Tracker - Full Stack Developer Challenge

---

## 🎯 Day 1 Objectives
- [x] Understand project requirements
- [x] Set up development environment
- [x] Initialize project structure
- [x] Configure version control (Git)
- [x] Plan the architecture

---

## 📋 Project Requirements Analysis

### Challenge Topic #5: Personal Expense Tracker
A full-stack web application to help users track their daily expenses.

### Required Features:
| Feature | Priority | Status |
|---------|----------|--------|
| User Authentication (Login/Register) | High | ✅ |
| Record daily expenses with categories | High | ✅ |
| Generate monthly/weekly expense reports | High | ✅ |
| Visual charts and graphs | Medium | ✅ |
| Set budgets and receive alerts | Medium | ✅ |
| Responsive UI | Medium | ✅ |

### Skills to Demonstrate:
- Object-Oriented Programming
- Data Analysis
- File I/O Operations
- Date Manipulation
- Reporting
- Full-Stack Development

---

## 🛠️ Development Environment Setup

### Prerequisites Installed:
```bash
# Node.js (v18 or higher)
node --version  # v18.x.x

# npm (comes with Node.js)
npm --version   # 9.x.x

# MySQL Server
mysql --version # 8.x.x

# Git
git --version   # 2.x.x

# Code Editor: VS Code with extensions:
# - ES7+ React/Redux/React-Native snippets
# - Tailwind CSS IntelliSense
# - MySQL extension
# - REST Client / Thunder Client
```

### Project Folder Structure Created:
```
expense-tracker/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Database & app configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, error handling
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Helper functions
│   │   ├── app.js        # Express app setup
│   │   └── server.js     # Server entry point
│   ├── .env              # Environment variables
│   ├── database.sql      # Database schema
│   └── package.json
│
├── frontend/             # React.js + Vite
│   ├── src/
│   │   ├── assets/       # Images, icons
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context (Auth)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── utils/        # Helper functions
│   │   ├── App.jsx       # Main App component
│   │   └── main.jsx      # React entry point
│   ├── .env              # Environment variables
│   └── package.json
│
└── docs/                 # Documentation
    ├── Day-01 to Day-10  # Daily progress guides
    └── Interview prep    # Interview preparation
```

---

## 🚀 Project Initialization

### Step 1: Create Backend
```bash
mkdir expense-tracker && cd expense-tracker
mkdir backend && cd backend
npm init -y

# Install dependencies
npm install express sequelize mysql2 bcryptjs jsonwebtoken cors dotenv
npm install --save-dev nodemon
```

### Step 2: Create Frontend
```bash
cd ../
npm create vite@latest frontend -- --template react
cd frontend

# Install dependencies
npm install
npm install axios react-router-dom recharts react-icons
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Configure Tailwind CSS
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 4: Environment Variables

**Backend (.env):**
```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=expense_tracker
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🗄️ Database Setup

### Create MySQL Database:
```sql
CREATE DATABASE expense_tracker 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE expense_tracker;
```

### Database Schema Design:
```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │   categories    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ name            │     │ name            │
│ email (unique)  │◄────│ user_id (FK)    │
│ password        │     │ icon            │
│ created_at      │     │ color           │
│ updated_at      │     │ created_at      │
└─────────────────┘     └─────────────────┘
         │
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│    expenses     │     │    budgets      │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │     │ user_id (FK)    │
│ category_id(FK) │     │ category_id(FK) │
│ description     │     │ amount          │
│ amount          │     │ period          │
│ date            │     │ start_date      │
│ payment_method  │     │ end_date        │
│ notes           │     │ created_at      │
│ created_at      │     │ updated_at      │
└─────────────────┘     └─────────────────┘
```

---

## 🏗️ Architecture Decision

### Why This Tech Stack?

| Technology | Reason |
|------------|--------|
| **React.js** | Component-based, large ecosystem, industry standard |
| **Vite** | Faster than CRA, hot module replacement |
| **Tailwind CSS** | Utility-first, rapid styling, responsive design |
| **Node.js/Express** | JavaScript full-stack, large npm ecosystem |
| **MySQL** | Robust RDBMS, perfect for structured data |
| **Sequelize ORM** | Object mapping, migrations, easier queries |
| **JWT** | Stateless authentication, secure, scalable |
| **Recharts** | React-based charts, easy integration |

### Design Pattern: MVC
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Model     │◄────│  Controller  │◄────│    View      │
│  (Sequelize) │     │  (Express)   │     │   (React)    │
│              │────►│              │────►│              │
│ - User       │     │ - authCtrl   │     │ - Login      │
│ - Expense    │     │ - expenseCtrl│     │ - Dashboard  │
│ - Category   │     │ - reportCtrl │     │ - Reports    │
│ - Budget     │     │ - budgetCtrl │     │ - Budgets    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📝 Git Setup

```bash
# Initialize Git
git init

# Create .gitignore
echo "node_modules/
.env
dist/
.DS_Store" > .gitignore

# Initial commit
git add .
git commit -m "Initial commit: Project setup"
```

---

## ✅ Day 1 Checklist

- [x] Analyzed project requirements
- [x] Set up development environment
- [x] Created project folder structure
- [x] Initialized backend (Node.js/Express)
- [x] Initialized frontend (React/Vite)
- [x] Configured Tailwind CSS
- [x] Set up environment variables
- [x] Designed database schema
- [x] Chose MVC architecture
- [x] Initialized Git repository

---

## 📚 Key Learnings

1. **Project Planning is Crucial**: Spending time upfront on architecture saves debugging later
2. **Environment Variables**: Never hardcode secrets, use .env files
3. **Folder Structure**: Organized code is maintainable code
4. **Version Control**: Commit early, commit often

---

## 🔜 Day 2 Preview
- Set up Express server
- Configure Sequelize ORM
- Create database models
- Implement user registration
- Build authentication system

---

**Progress: Day 1 of 10 Complete** ████░░░░░░ 10%
