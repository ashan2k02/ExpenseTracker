# 🗄️ Database Structure & Normalization Guide
## Personal Expense Tracker - Database Design Documentation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables Structure](#tables-structure)
4. [Database Normalization](#database-normalization)
5. [Relationships](#relationships)
6. [Indexes & Performance](#indexes--performance)
7. [Data Integrity](#data-integrity)

---

## 🎯 Overview

The Expense Tracker uses **MySQL** as its relational database with **5 main tables**:

| Table | Purpose | Records |
|-------|---------|---------|
| `users` | User accounts | User profiles & authentication |
| `categories` | Expense categories | Food, Transport, etc. |
| `expenses` | Expense transactions | Money spent records |
| `incomes` | Income transactions | Money earned records |
| `budgets` | Budget limits | Monthly spending limits |

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK: id          │
│    name         │
│    email (UQ)   │
│    password     │
│    avatar       │
│    created_at   │
│    updated_at   │
└────────┬────────┘
         │
         │ 1:N (One user has many...)
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
    ▼         ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│CATEGORIES│ │EXPENSES │ │ INCOMES │ │ BUDGETS │
├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤
│PK: id   │ │PK: id   │ │PK: id   │ │PK: id   │
│   name  │ │   title │ │   title │ │   amount│
│   icon  │ │   amount│ │   amount│ │   month │
│   color │ │   date  │ │   date  │ │   year  │
│FK:user_id│ │   notes │ │   source│ │FK:user_id│
│is_default│ │FK:user_id│ │   notes│ │FK:category_id│
└────┬────┘ │FK:category_id│ │FK:user_id│ └─────────┘
     │      └─────────┘ └─────────┘
     │           │
     │    N:1    │
     └───────────┘
   (Many expenses belong to one category)
```

### Detailed ERD with Cardinality

```
┌──────────────────────────────────────────────────────────────────┐
│                        RELATIONSHIPS                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   USERS ─────┬────── 1:N ──────> EXPENSES                        │
│              │                                                    │
│              ├────── 1:N ──────> INCOMES                         │
│              │                                                    │
│              ├────── 1:N ──────> CATEGORIES                      │
│              │                                                    │
│              └────── 1:N ──────> BUDGETS                         │
│                                                                   │
│   CATEGORIES ├────── 1:N ──────> EXPENSES                        │
│              │                                                    │
│              └────── 1:N ──────> BUDGETS                         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📦 Tables Structure

### 1️⃣ USERS Table

Stores user account information for authentication.

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,      -- Unique identifier
  name VARCHAR(100) NOT NULL,             -- User's full name
  email VARCHAR(255) NOT NULL UNIQUE,     -- Login email (unique)
  password VARCHAR(255) NOT NULL,         -- Hashed password (bcrypt)
  avatar VARCHAR(255) DEFAULT NULL,       -- Profile picture URL
  created_at TIMESTAMP DEFAULT NOW(),     -- Account creation date
  updated_at TIMESTAMP DEFAULT NOW()      -- Last update date
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique user ID |
| `name` | VARCHAR(100) | NOT NULL | User's display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `avatar` | VARCHAR(255) | NULLABLE | Profile image URL |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration date |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() | Last modification |

---

### 2️⃣ CATEGORIES Table

Stores expense/income categories (both system defaults and user-created).

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,              -- Category name
  icon VARCHAR(50) DEFAULT '📦',          -- Emoji icon
  color VARCHAR(20) DEFAULT '#6366f1',    -- Hex color code
  user_id INT DEFAULT NULL,               -- NULL = system default
  is_default BOOLEAN DEFAULT FALSE,       -- Is system category?
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (name, user_id)              -- Unique name per user
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK | Unique category ID |
| `name` | VARCHAR(50) | NOT NULL | Category name (Food, Transport) |
| `icon` | VARCHAR(50) | DEFAULT '📦' | Emoji representation |
| `color` | VARCHAR(20) | DEFAULT '#6366f1' | UI display color |
| `user_id` | INT | FK → users.id, NULLABLE | Owner (NULL = system) |
| `is_default` | BOOLEAN | DEFAULT FALSE | System-wide category flag |

**Default Categories:**
- 🍕 Food & Dining, 🚗 Transportation, 🛒 Shopping
- 🎬 Entertainment, 💡 Bills & Utilities, 🏥 Healthcare
- 📚 Education, ✈️ Travel, 🛍️ Groceries, 💄 Personal Care

---

### 3️⃣ EXPENSES Table

Stores all expense transactions.

```sql
CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,            -- Expense description
  amount DECIMAL(10, 2) NOT NULL,         -- Amount spent
  date DATE NOT NULL,                     -- Transaction date
  payment_method ENUM('cash', 'credit_card', 'debit_card', 
                      'bank_transfer', 'upi', 'wallet', 
                      'check', 'other') DEFAULT 'cash',
  notes TEXT DEFAULT NULL,                -- Additional notes
  user_id INT NOT NULL,                   -- Who made this expense
  category_id INT NOT NULL,               -- What category
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK | Unique expense ID |
| `title` | VARCHAR(255) | NOT NULL | What was purchased |
| `amount` | DECIMAL(10,2) | NOT NULL | Amount (up to 99,999,999.99) |
| `date` | DATE | NOT NULL | When it was spent |
| `payment_method` | ENUM | DEFAULT 'cash' | How it was paid |
| `notes` | TEXT | NULLABLE | Additional details |
| `user_id` | INT | FK → users.id | Owner of expense |
| `category_id` | INT | FK → categories.id | Category reference |

---

### 4️⃣ INCOMES Table

Stores all income transactions.

```sql
CREATE TABLE incomes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,            -- Income description
  amount DECIMAL(10, 2) NOT NULL,         -- Amount earned
  date DATE NOT NULL,                     -- Transaction date
  source ENUM('salary', 'freelance', 'investment', 
              'rental', 'business', 'gift', 
              'refund', 'other') DEFAULT 'salary',
  is_recurring BOOLEAN DEFAULT FALSE,     -- Regular income?
  recurring_frequency ENUM('weekly', 'bi-weekly', 
                           'monthly', 'yearly') DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK | Unique income ID |
| `title` | VARCHAR(255) | NOT NULL | Income description |
| `amount` | DECIMAL(10,2) | NOT NULL, CHECK > 0 | Amount earned |
| `date` | DATE | NOT NULL | When received |
| `source` | ENUM | DEFAULT 'salary' | Income source type |
| `is_recurring` | BOOLEAN | DEFAULT FALSE | Regular income flag |
| `recurring_frequency` | ENUM | NULLABLE | How often it repeats |
| `user_id` | INT | FK → users.id | Income owner |

---

### 5️⃣ BUDGETS Table

Stores monthly budget limits.

```sql
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,         -- Budget limit
  month INT NOT NULL,                     -- 1-12
  year INT NOT NULL,                      -- e.g., 2026
  user_id INT NOT NULL,                   -- Whose budget
  category_id INT DEFAULT NULL,           -- NULL = overall budget
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  
  UNIQUE KEY (user_id, category_id, month, year),  -- One budget per period
  CHECK (month >= 1 AND month <= 12),
  CHECK (year >= 2000 AND year <= 2100),
  CHECK (amount >= 0)
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK | Unique budget ID |
| `amount` | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Budget limit |
| `month` | INT | NOT NULL, CHECK 1-12 | Budget month |
| `year` | INT | NOT NULL | Budget year |
| `user_id` | INT | FK → users.id | Budget owner |
| `category_id` | INT | FK → categories.id, NULLABLE | NULL = overall |

---

## 📐 Database Normalization

### What is Normalization?

**Normalization** is the process of organizing data to:
- ✅ Reduce data redundancy (no duplicate data)
- ✅ Ensure data integrity (consistent, accurate data)
- ✅ Make updates easier (change in one place)

### Normal Forms Applied

---

### 1️⃣ First Normal Form (1NF) ✅

**Rule:** Each column contains atomic (indivisible) values, no repeating groups.

**Before (Unnormalized):**
```
| user_id | name  | expenses                    |
|---------|-------|------------------------------|
| 1       | John  | Lunch $10, Gas $30, Movie $15|  ❌ Multiple values!
```

**After (1NF):**
```
| expense_id | user_id | title  | amount |
|------------|---------|--------|--------|
| 1          | 1       | Lunch  | 10.00  |  ✅ One value per cell
| 2          | 1       | Gas    | 30.00  |
| 3          | 1       | Movie  | 15.00  |
```

**Our Implementation:**
- ✅ Each expense is a separate row in `expenses` table
- ✅ Each income is a separate row in `incomes` table
- ✅ No arrays or comma-separated values

---

### 2️⃣ Second Normal Form (2NF) ✅

**Rule:** Must be in 1NF + all non-key columns depend on the ENTIRE primary key.

**Before (1NF but not 2NF):**
```
| expense_id | user_id | user_name | user_email     | amount |
|------------|---------|-----------|----------------|--------|
| 1          | 1       | John      | john@email.com | 10.00  |
| 2          | 1       | John      | john@email.com | 30.00  |  ❌ User data repeated!
```

**After (2NF) - Separate Tables:**
```
USERS:                          EXPENSES:
| user_id | name | email      | | expense_id | user_id | amount |
|---------|------|------------|  |------------|---------|--------|
| 1       | John | john@...   |  | 1          | 1       | 10.00  |
                                 | 2          | 1       | 30.00  |
                                 ✅ User data stored once!
```

**Our Implementation:**
- ✅ User data is in `users` table only
- ✅ Category data is in `categories` table only
- ✅ Expenses reference users via `user_id` (foreign key)

---

### 3️⃣ Third Normal Form (3NF) ✅

**Rule:** Must be in 2NF + no transitive dependencies (non-key → non-key).

**Before (2NF but not 3NF):**
```
| expense_id | category_id | category_name | category_color |
|------------|-------------|---------------|----------------|
| 1          | 1           | Food          | #ef4444        |  ❌ category_name 
| 2          | 1           | Food          | #ef4444        |     depends on category_id
| 3          | 2           | Transport     | #f97316        |     not on expense_id
```

**After (3NF) - Remove Transitive Dependency:**
```
CATEGORIES:                     EXPENSES:
| cat_id | name      | color   | | expense_id | category_id | amount |
|--------|-----------|---------|  |------------|-------------|--------|
| 1      | Food      | #ef4444 |  | 1          | 1           | 10.00  |
| 2      | Transport | #f97316 |  | 2          | 1           | 30.00  |
                                  | 3          | 2           | 15.00  |
                                  ✅ Category details in one place!
```

**Our Implementation:**
- ✅ Category details (name, icon, color) stored only in `categories`
- ✅ Expenses just store `category_id` reference
- ✅ To update category color, change in ONE place

---

### Normalization Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    NORMALIZATION LEVELS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UNNORMALIZED                                                   │
│       │                                                          │
│       ▼  (Remove repeating groups)                              │
│    ┌──────┐                                                      │
│    │  1NF │  ✅ Atomic values, no repeating groups              │
│    └──┬───┘                                                      │
│       │  (Remove partial dependencies)                          │
│       ▼                                                          │
│    ┌──────┐                                                      │
│    │  2NF │  ✅ Separate user data from expenses                │
│    └──┬───┘                                                      │
│       │  (Remove transitive dependencies)                        │
│       ▼                                                          │
│    ┌──────┐                                                      │
│    │  3NF │  ✅ Separate category data from expenses            │
│    └──────┘                                                      │
│                                                                  │
│    OUR DATABASE IS IN 3NF! ✅                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Relationships

### Foreign Key Relationships

```sql
-- Expenses belong to a User and Category
expenses.user_id     → users.id        (Many-to-One)
expenses.category_id → categories.id   (Many-to-One)

-- Incomes belong to a User
incomes.user_id      → users.id        (Many-to-One)

-- Categories can belong to a User (or be system-wide)
categories.user_id   → users.id        (Many-to-One, nullable)

-- Budgets belong to a User and optionally a Category
budgets.user_id      → users.id        (Many-to-One)
budgets.category_id  → categories.id   (Many-to-One, nullable)
```

### Relationship Types

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Expenses | 1:N | One user has many expenses |
| User → Incomes | 1:N | One user has many incomes |
| User → Categories | 1:N | One user has many custom categories |
| User → Budgets | 1:N | One user has many budgets |
| Category → Expenses | 1:N | One category has many expenses |
| Category → Budgets | 1:N | One category can have budgets per month |

### ON DELETE Actions

| FK Constraint | Action | Reason |
|---------------|--------|--------|
| expenses → users | CASCADE | Delete user's expenses when user deleted |
| expenses → categories | RESTRICT | Prevent deleting category with expenses |
| incomes → users | CASCADE | Delete user's incomes when user deleted |
| budgets → users | CASCADE | Delete user's budgets when user deleted |
| budgets → categories | SET NULL | Keep budget, just remove category link |

---

## ⚡ Indexes & Performance

### Indexes Created

```sql
-- Users table
INDEX idx_users_email (email)           -- Fast login lookup
INDEX idx_users_created_at (created_at) -- Sort by registration date

-- Categories table
INDEX idx_categories_user_id (user_id)  -- Get user's categories
INDEX idx_categories_name (name)        -- Search by name

-- Expenses table
INDEX idx_expenses_user_id (user_id)           -- Get user's expenses
INDEX idx_expenses_category_id (category_id)   -- Filter by category
INDEX idx_expenses_date (date)                 -- Sort by date
INDEX idx_expenses_user_date (user_id, date)   -- User + date combo
INDEX idx_expenses_user_category (user_id, category_id)

-- Incomes table
INDEX idx_incomes_user_id (user_id)
INDEX idx_incomes_date (date)
INDEX idx_incomes_user_date (user_id, date)

-- Budgets table
INDEX idx_budgets_user_id (user_id)
INDEX idx_budgets_period (month, year)
INDEX idx_budgets_user_period (user_id, month, year)
```

### Why These Indexes?

| Query Pattern | Index Used | Benefit |
|---------------|------------|---------|
| Login by email | `idx_users_email` | O(log n) instead of O(n) |
| User's expenses | `idx_expenses_user_id` | Fast user filtering |
| Monthly report | `idx_expenses_user_date` | Efficient date range |
| Category filter | `idx_expenses_user_category` | Quick category lookup |

---

## 🔒 Data Integrity

### Constraints Applied

| Table | Constraint | Type | Purpose |
|-------|------------|------|---------|
| users | `uk_users_email` | UNIQUE | No duplicate emails |
| categories | `uk_categories_name_user` | UNIQUE | Unique name per user |
| budgets | `uk_budgets_user_category_period` | UNIQUE | One budget per period |
| budgets | `chk_budgets_month` | CHECK | Month must be 1-12 |
| budgets | `chk_budgets_year` | CHECK | Year 2000-2100 |
| budgets | `chk_budgets_amount` | CHECK | Amount >= 0 |
| incomes | `chk_incomes_amount` | CHECK | Amount > 0 |

### ENUM Validations

```sql
-- Payment methods (expenses)
ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 
     'upi', 'wallet', 'check', 'other')

-- Income sources
ENUM('salary', 'freelance', 'investment', 'rental', 
     'business', 'gift', 'refund', 'other')

-- Recurring frequency
ENUM('weekly', 'bi-weekly', 'monthly', 'yearly')
```

---

## 📊 Sample Queries

### Get User's Monthly Expenses
```sql
SELECT 
  c.name AS category,
  SUM(e.amount) AS total,
  COUNT(*) AS count
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = 1 
  AND MONTH(e.date) = 2 
  AND YEAR(e.date) = 2026
GROUP BY c.id
ORDER BY total DESC;
```

### Get Budget vs Actual
```sql
SELECT 
  b.amount AS budget,
  COALESCE(SUM(e.amount), 0) AS spent,
  b.amount - COALESCE(SUM(e.amount), 0) AS remaining
FROM budgets b
LEFT JOIN expenses e ON e.user_id = b.user_id 
  AND MONTH(e.date) = b.month 
  AND YEAR(e.date) = b.year
WHERE b.user_id = 1 
  AND b.month = 2 
  AND b.year = 2026
  AND b.category_id IS NULL;
```

---

## ✅ Summary

| Aspect | Implementation |
|--------|----------------|
| **Normalization** | 3NF - No redundancy, data integrity |
| **Tables** | 5 tables with proper relationships |
| **Foreign Keys** | All relationships enforced |
| **Indexes** | Optimized for common queries |
| **Constraints** | Data validation at database level |
| **Timestamps** | Automatic created_at, updated_at |

This database design follows industry best practices for:
- 📊 **Data Integrity** - Constraints prevent bad data
- ⚡ **Performance** - Indexes speed up queries
- 🔄 **Maintainability** - Normalized structure easy to update
- 🔒 **Security** - Foreign keys prevent orphan records

---

*Created for the Industry-Academia Collaborative Incubation Program*  
*University of Rajarata × PayMedia/DirectPay*
