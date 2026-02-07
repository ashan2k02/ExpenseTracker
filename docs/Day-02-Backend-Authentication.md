# 📅 Day 2: Backend Foundation & Authentication
## Industry-Academia Collaborative Incubation Program
### Personal Expense Tracker - Full Stack Developer Challenge

---

## 🎯 Day 2 Objectives
- [x] Set up Express server
- [x] Configure Sequelize ORM
- [x] Create database models
- [x] Implement User model with password hashing
- [x] Build JWT authentication system
- [x] Create auth routes (register, login)

---

## 🚀 Express Server Setup

### app.js - Express Application Configuration
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
```

### server.js - Server Entry Point
```javascript
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 5001;

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
```

---

## 🗄️ Sequelize ORM Configuration

### config/database.js
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize };
```

---

## 📊 Database Models

### models/User.js
```javascript
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
```

### models/Category.js
```javascript
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'FaTag'
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6B7280'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // null for default categories
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Category;
```

---

## 🔐 JWT Authentication System

### How JWT Works:
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Server    │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  1. POST /login   │                   │
       │  {email, password}│                   │
       │──────────────────►│                   │
       │                   │  2. Verify user   │
       │                   │──────────────────►│
       │                   │◄──────────────────│
       │                   │                   │
       │                   │  3. Compare hash  │
       │                   │  (bcrypt)         │
       │                   │                   │
       │  4. JWT Token     │                   │
       │◄──────────────────│                   │
       │                   │                   │
       │  5. API Request   │                   │
       │  Authorization:   │                   │
       │  Bearer <token>   │                   │
       │──────────────────►│                   │
       │                   │  6. Verify JWT    │
       │                   │  7. Fetch data    │
       │◄──────────────────│                   │
       │                   │                   │
```

### utils/jwt.js
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
```

### middleware/auth.js
```javascript
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized, no token' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Not authorized, token failed' 
    });
  }
};

module.exports = { protect };
```

---

## 🎮 Auth Controller

### controllers/authController.js
```javascript
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all fields' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ 
        message: 'User already exists' 
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };
```

---

## 🛣️ Auth Routes

### routes/authRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
```

---

## 🧪 Testing Authentication

### Using cURL:
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test123!"}'

# Get current user (with token)
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Expected Responses:

**Register Success (201):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Login Success (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔒 Password Security

### bcrypt Hashing Process:
```
User Password: "Test123!"
          ↓
Salt Generation: "$2a$10$N9qo8uLOickgx2ZMRZoMy"
          ↓
Hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeXSHMcGc.Cd.K3k7rFk6TkPnV5sKF2Oa"
          ↓
Stored in Database
```

### Why bcrypt?
1. **Salt**: Unique for each password, prevents rainbow table attacks
2. **Cost Factor**: Adjustable work factor (10 rounds)
3. **Slow by Design**: Makes brute force attacks impractical

---

## ✅ Day 2 Checklist

- [x] Created Express server (app.js, server.js)
- [x] Configured Sequelize ORM
- [x] Created User model with hooks
- [x] Created Category model
- [x] Implemented password hashing with bcrypt
- [x] Built JWT token generation and verification
- [x] Created auth middleware for protected routes
- [x] Implemented register controller
- [x] Implemented login controller
- [x] Implemented getMe controller
- [x] Set up auth routes
- [x] Tested registration API
- [x] Tested login API

---

## 📚 Key Learnings

1. **Password Hashing**: Never store plain text passwords
2. **JWT Tokens**: Stateless authentication, no session storage needed
3. **Middleware Pattern**: Reusable code for route protection
4. **Sequelize Hooks**: Automatic password hashing before save
5. **Error Handling**: Always return appropriate status codes

---

## 🔜 Day 3 Preview
- Create Expense and Budget models
- Build CRUD operations for expenses
- Implement expense filtering and pagination
- Set up model associations

---

**Progress: Day 2 of 10 Complete** ████████░░ 20%
