# Personal Expense Tracker

A full-stack expense tracking application built with React.js and Node.js.

## Features

- 🔐 **User Authentication** - Secure login and registration with JWT
- 💰 **Expense Management** - Add, edit, and delete expenses
- 📁 **Categories** - Organize expenses by customizable categories
- 🎯 **Budget Setting** - Set monthly budgets (overall and per category)
- 📊 **Dashboard** - Visual overview with charts and statistics
- 📈 **Reports** - Weekly, monthly, and yearly expense reports
- 📱 **Responsive UI** - Works on desktop and mobile devices

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE expense_tracker;
```

2. The tables will be automatically created when you start the backend server.

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the example:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

4. Start the development server:
```bash
npm run dev
```

The backend will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be running at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Expenses
- `GET /api/expenses` - Get all expenses (with pagination & filters)
- `GET /api/expenses/:id` - Get single expense
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:month/:year` - Get budget by period
- `POST /api/budgets` - Create/update budget
- `DELETE /api/budgets/:id` - Delete budget

### Reports
- `GET /api/reports/dashboard` - Get dashboard summary
- `GET /api/reports/monthly/:year/:month` - Get monthly report
- `GET /api/reports/weekly` - Get weekly report
- `GET /api/reports/yearly/:year` - Get yearly report

## Project Structure

```
expense-tracker/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   └── package.json
│
└── README.md
```

## License

MIT
