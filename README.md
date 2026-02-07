# 💰 Personal Expense Tracker

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.x-61dafb.svg)

A modern, full-stack personal finance management application built with React.js and Node.js.

**Industry-Academia Collaborative Incubation Program**  
*University of Rajarata × PayMedia/DirectPay*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Reference](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- 🔐 **User Authentication** - Secure JWT-based login and registration
- 💸 **Expense Management** - Full CRUD operations for tracking expenses
- 💵 **Income Tracking** - Track multiple income sources with recurring support
- 📁 **Custom Categories** - Create and manage expense/income categories
- 🎯 **Budget Management** - Set monthly budgets (overall and per category)
- 📊 **Interactive Dashboard** - Real-time overview with visual statistics

### Reports & Analytics
- 📈 **Weekly Reports** - Last 7 days expense breakdown
- 📅 **Monthly Reports** - Monthly trends and comparisons
- 📆 **Yearly Reports** - Annual financial overview
- 🥧 **Category Analysis** - Pie charts for spending distribution

### User Experience
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite for optimal speed
- 🔄 **Real-time Updates** - Instant feedback on all operations

---

## 🛠 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router v6 | Navigation |
| Recharts | Data Visualization |
| React Icons | Icon Library |
| React Hot Toast | Notifications |

</td>
<td valign="top" width="50%">

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MySQL | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| express-validator | Validation |

</td>
</tr>
</table>

---

## 📸 Screenshots

| Dashboard | Expenses | Reports |
|-----------|----------|---------|
| Overview with charts | Manage transactions | Visual analytics |

---

## 🚀 Installation

### Prerequisites

- **Node.js** v18.0.0 or higher
- **MySQL** v8.0 or higher
- **npm** or **yarn**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/ashan2k02/ExpenseTracker.git
cd ExpenseTracker

# Install all dependencies
npm run install:all
# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### Database Setup

1. **Create MySQL Database:**
```sql
CREATE DATABASE expense_tracker;
```

2. **Run the Schema** (optional - tables auto-create):
```bash
mysql -u root -p expense_tracker < backend/database.sql
```

### Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env
# Edit .env with your database credentials
```

**Environment Variables (.env):**
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

**Start the Server:**
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

Backend runs at: `http://localhost:5001`

### Frontend Setup

```bash
cd frontend

# Create .env file
echo "VITE_API_URL=http://localhost:5001/api" > .env
```

**Start the Application:**
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend runs at: `http://localhost:5173`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `expense_tracker` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

---

## 📚 API Reference

### Base URL
```
http://localhost:5001/api
```

### Authentication
All protected routes require the `Authorization` header:
```
Authorization: Bearer <token>
```

### Endpoints

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| PUT | `/auth/profile` | Update profile | ✅ |
| PUT | `/auth/password` | Change password | ✅ |

**Register Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```
</details>

<details>
<summary><b>💸 Expenses</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/expenses` | Get all expenses (paginated) | ✅ |
| GET | `/expenses/:id` | Get single expense | ✅ |
| GET | `/expenses/summary` | Get expense summary | ✅ |
| POST | `/expenses` | Create expense | ✅ |
| PUT | `/expenses/:id` | Update expense | ✅ |
| DELETE | `/expenses/:id` | Delete expense | ✅ |

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category ID
- `startDate` - Filter from date
- `endDate` - Filter to date

**Create Expense:**
```json
{
  "amount": 50.00,
  "description": "Grocery shopping",
  "categoryId": 1,
  "date": "2025-01-15"
}
```
</details>

<details>
<summary><b>💵 Income</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/incomes` | Get all incomes | ✅ |
| GET | `/incomes/:id` | Get single income | ✅ |
| GET | `/incomes/summary` | Get income summary | ✅ |
| POST | `/incomes` | Create income | ✅ |
| PUT | `/incomes/:id` | Update income | ✅ |
| DELETE | `/incomes/:id` | Delete income | ✅ |

**Income Sources:**
- `salary`, `freelance`, `investment`, `rental`, `business`, `gift`, `refund`, `other`

**Recurring Frequencies:**
- `none`, `weekly`, `bi-weekly`, `monthly`, `yearly`

**Create Income:**
```json
{
  "amount": 5000.00,
  "source": "salary",
  "description": "Monthly salary",
  "date": "2025-01-01",
  "isRecurring": true,
  "recurringFrequency": "monthly"
}
```
</details>

<details>
<summary><b>📁 Categories</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | Get all categories | ✅ |
| GET | `/categories/:id` | Get single category | ✅ |
| POST | `/categories` | Create category | ✅ |
| PUT | `/categories/:id` | Update category | ✅ |
| DELETE | `/categories/:id` | Delete category | ✅ |

**Create Category:**
```json
{
  "name": "Transportation",
  "icon": "🚗",
  "color": "#3498db",
  "type": "expense"
}
```
</details>

<details>
<summary><b>🎯 Budgets</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/budgets` | Get all budgets | ✅ |
| GET | `/budgets/:month/:year` | Get budget by period | ✅ |
| POST | `/budgets` | Create/Update budget | ✅ |
| DELETE | `/budgets/:id` | Delete budget | ✅ |

**Create Budget:**
```json
{
  "amount": 2000.00,
  "month": 1,
  "year": 2025,
  "categoryId": null
}
```
</details>

<details>
<summary><b>📊 Reports</b></summary>

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reports/dashboard` | Dashboard summary | ✅ |
| GET | `/reports/weekly` | Weekly report | ✅ |
| GET | `/reports/monthly/:year/:month` | Monthly report | ✅ |
| GET | `/reports/yearly/:year` | Yearly report | ✅ |
| GET | `/reports/category` | Category breakdown | ✅ |

**Dashboard Response:**
```json
{
  "success": true,
  "data": {
    "totalExpenses": 1500.00,
    "totalIncome": 5000.00,
    "balance": 3500.00,
    "monthlyBudget": 2000.00,
    "budgetUsed": 75.0,
    "recentTransactions": [...],
    "expensesByCategory": [...]
  }
}
```
</details>

---

## 📂 Project Structure

```
expense-tracker/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 config/          # Database & app configuration
│   │   │   └── database.js     # Sequelize connection
│   │   ├── 📁 controllers/     # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── expenseController.js
│   │   │   ├── incomeController.js
│   │   │   ├── categoryController.js
│   │   │   ├── budgetController.js
│   │   │   └── reportController.js
│   │   ├── 📁 middleware/      # Express middleware
│   │   │   ├── auth.js         # JWT authentication
│   │   │   ├── errorHandler.js # Error handling
│   │   │   └── validation.js   # Request validation
│   │   ├── 📁 models/          # Sequelize models
│   │   │   ├── User.js
│   │   │   ├── Expense.js
│   │   │   ├── Income.js
│   │   │   ├── Category.js
│   │   │   └── Budget.js
│   │   ├── 📁 routes/          # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── incomeRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   └── reportRoutes.js
│   │   ├── 📁 utils/           # Helper functions
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point
│   ├── database.sql            # Database schema
│   ├── .env.example            # Environment template
│   └── package.json
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable UI components
│   │   │   ├── 📁 common/      # Buttons, inputs, modals
│   │   │   ├── 📁 charts/      # Recharts components
│   │   │   └── 📁 layout/      # Sidebar, Navbar
│   │   ├── 📁 context/         # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── 📁 pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Budgets.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── 📁 services/        # API service functions
│   │   │   ├── api.js          # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── expenseService.js
│   │   │   ├── incomeService.js
│   │   │   └── ...
│   │   ├── App.jsx             # Main app with routes
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── .env                    # Environment variables
│   └── package.json
│
├── 📁 docs/                    # Documentation
│   ├── PRESENTATION-GUIDE.md
│   ├── QUICK-PRESENTATION-POINTS.md
│   └── ...
│
├── DEPLOYMENT.md               # Deployment guide
└── README.md
```

---

## 🌐 Deployment

### Free Hosting Options

| Service | Use For | Free Tier |
|---------|---------|-----------|
| [Render](https://render.com) | Backend | 750 hours/month |
| [Vercel](https://vercel.com) | Frontend | Unlimited |
| [TiDB Cloud](https://tidbcloud.com) | Database | 5GB storage |
| [PlanetScale](https://planetscale.com) | Database | 5GB storage |
| [Railway](https://railway.app) | Full Stack | $5 credit/month |

### Quick Deploy

**Backend to Render:**
1. Connect GitHub repository
2. Set environment variables
3. Build command: `npm install`
4. Start command: `npm start`

**Frontend to Vercel:**
1. Import from GitHub
2. Set `VITE_API_URL` to backend URL
3. Deploy automatically

📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Testing

### Manual Testing
```bash
# Test registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!"}'

# Test login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ashan Udayanga**

- GitHub: [@ashan2k02](https://github.com/ashan2k02)

---

## 🙏 Acknowledgments

- University of Rajarata
- PayMedia/DirectPay
- Industry-Academia Collaborative Incubation Program

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for the 10-Day Full Stack Challenge

</div>
