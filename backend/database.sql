-- ============================================================
-- EXPENSE TRACKER - MySQL Database Schema
-- ============================================================
-- Version: 1.0
-- Created: February 2026
-- Description: Complete database schema for Personal Expense Tracker
-- ============================================================

-- Drop database if exists (uncomment for fresh start)
-- DROP DATABASE IF EXISTS expense_tracker;

-- Create the database
CREATE DATABASE IF NOT EXISTS expense_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

-- ============================================================
-- TABLE: users
-- Description: Stores user account information
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT uk_users_email UNIQUE (email),
  
  -- Indexes
  INDEX idx_users_email (email),
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: categories
-- Description: Expense categories (user-specific or default)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) DEFAULT '📦',
  color VARCHAR(20) DEFAULT '#6366f1',
  user_id INT DEFAULT NULL,  -- NULL for system default categories
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_categories_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  -- Constraints (unique category name per user)
  CONSTRAINT uk_categories_name_user UNIQUE (name, user_id),
  
  -- Indexes
  INDEX idx_categories_user_id (user_id),
  INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: expenses
-- Description: User expense records
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,  -- Also referred to as 'description'
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  payment_method ENUM(
    'cash', 
    'credit_card', 
    'debit_card', 
    'bank_transfer', 
    'upi', 
    'wallet', 
    'check', 
    'other'
  ) DEFAULT 'cash',
  notes TEXT DEFAULT NULL,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_expenses_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_expenses_category 
    FOREIGN KEY (category_id) REFERENCES categories(id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  
  -- Indexes for query optimization
  INDEX idx_expenses_user_id (user_id),
  INDEX idx_expenses_category_id (category_id),
  INDEX idx_expenses_date (date),
  INDEX idx_expenses_user_date (user_id, date),
  INDEX idx_expenses_user_category (user_id, category_id),
  INDEX idx_expenses_payment_method (payment_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: budgets
-- Description: Monthly budget limits (overall or per category)
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  month INT NOT NULL,  -- 1-12
  year INT NOT NULL,   -- e.g., 2026
  user_id INT NOT NULL,
  category_id INT DEFAULT NULL,  -- NULL for overall budget
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT fk_budgets_user 
    FOREIGN KEY (user_id) REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_budgets_category 
    FOREIGN KEY (category_id) REFERENCES categories(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  -- Constraints
  CONSTRAINT chk_budgets_month CHECK (month >= 1 AND month <= 12),
  CONSTRAINT chk_budgets_year CHECK (year >= 2000 AND year <= 2100),
  CONSTRAINT chk_budgets_amount CHECK (amount >= 0),
  CONSTRAINT uk_budgets_user_category_period UNIQUE (user_id, category_id, month, year),
  
  -- Indexes
  INDEX idx_budgets_user_id (user_id),
  INDEX idx_budgets_category_id (category_id),
  INDEX idx_budgets_period (month, year),
  INDEX idx_budgets_user_period (user_id, month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT DEFAULT CATEGORIES (System-wide defaults)
-- ============================================================
INSERT INTO categories (name, icon, color, user_id, is_default) VALUES
  ('Food & Dining', '🍕', '#ef4444', NULL, TRUE),
  ('Transportation', '🚗', '#f97316', NULL, TRUE),
  ('Shopping', '🛒', '#eab308', NULL, TRUE),
  ('Entertainment', '🎬', '#22c55e', NULL, TRUE),
  ('Bills & Utilities', '💡', '#3b82f6', NULL, TRUE),
  ('Healthcare', '🏥', '#8b5cf6', NULL, TRUE),
  ('Education', '📚', '#ec4899', NULL, TRUE),
  ('Travel', '✈️', '#06b6d4', NULL, TRUE),
  ('Groceries', '🛍️', '#14b8a6', NULL, TRUE),
  ('Personal Care', '💄', '#f472b6', NULL, TRUE),
  ('Home', '🏠', '#a855f7', NULL, TRUE),
  ('Other', '📦', '#6b7280', NULL, TRUE)
ON DUPLICATE KEY UPDATE name = name;

-- ============================================================
-- VIEWS (Optional - for easier querying)
-- ============================================================

-- View: Monthly expense summary per user
CREATE OR REPLACE VIEW v_monthly_expenses AS
SELECT 
  e.user_id,
  YEAR(e.date) AS year,
  MONTH(e.date) AS month,
  COUNT(*) AS expense_count,
  SUM(e.amount) AS total_amount,
  AVG(e.amount) AS avg_amount
FROM expenses e
GROUP BY e.user_id, YEAR(e.date), MONTH(e.date);

-- View: Category-wise expense summary
CREATE OR REPLACE VIEW v_category_expenses AS
SELECT 
  e.user_id,
  e.category_id,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  YEAR(e.date) AS year,
  MONTH(e.date) AS month,
  COUNT(*) AS expense_count,
  SUM(e.amount) AS total_amount
FROM expenses e
JOIN categories c ON e.category_id = c.id
GROUP BY e.user_id, e.category_id, c.name, c.icon, c.color, YEAR(e.date), MONTH(e.date);

-- View: Budget status (budget vs actual spending)
CREATE OR REPLACE VIEW v_budget_status AS
SELECT 
  b.id AS budget_id,
  b.user_id,
  b.month,
  b.year,
  b.amount AS budget_amount,
  b.category_id,
  c.name AS category_name,
  COALESCE(SUM(e.amount), 0) AS spent_amount,
  b.amount - COALESCE(SUM(e.amount), 0) AS remaining_amount,
  CASE 
    WHEN b.amount > 0 THEN ROUND((COALESCE(SUM(e.amount), 0) / b.amount) * 100, 2)
    ELSE 0 
  END AS spent_percentage
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN expenses e ON 
  e.user_id = b.user_id 
  AND YEAR(e.date) = b.year 
  AND MONTH(e.date) = b.month
  AND (b.category_id IS NULL OR e.category_id = b.category_id)
GROUP BY b.id, b.user_id, b.month, b.year, b.amount, b.category_id, c.name;

-- ============================================================
-- STORED PROCEDURES (Optional - for complex operations)
-- ============================================================

-- Procedure: Get user dashboard summary
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_get_dashboard_summary(IN p_user_id INT)
BEGIN
  DECLARE v_current_month INT DEFAULT MONTH(CURDATE());
  DECLARE v_current_year INT DEFAULT YEAR(CURDATE());
  
  -- Monthly total
  SELECT 
    COALESCE(SUM(amount), 0) AS monthly_total,
    COUNT(*) AS expense_count
  FROM expenses 
  WHERE user_id = p_user_id 
    AND MONTH(date) = v_current_month 
    AND YEAR(date) = v_current_year;
  
  -- Budget info
  SELECT 
    amount AS budget_amount,
    amount - COALESCE((
      SELECT SUM(amount) 
      FROM expenses 
      WHERE user_id = p_user_id 
        AND MONTH(date) = v_current_month 
        AND YEAR(date) = v_current_year
    ), 0) AS remaining
  FROM budgets 
  WHERE user_id = p_user_id 
    AND month = v_current_month 
    AND year = v_current_year 
    AND category_id IS NULL;
  
  -- Top categories
  SELECT 
    c.name,
    c.icon,
    c.color,
    SUM(e.amount) AS total
  FROM expenses e
  JOIN categories c ON e.category_id = c.id
  WHERE e.user_id = p_user_id 
    AND MONTH(e.date) = v_current_month 
    AND YEAR(e.date) = v_current_year
  GROUP BY c.id, c.name, c.icon, c.color
  ORDER BY total DESC
  LIMIT 5;
END //
DELIMITER ;

-- ============================================================
-- TRIGGERS (Optional - for data integrity)
-- ============================================================

-- Trigger: Validate expense amount is positive
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_expense_validate_amount
BEFORE INSERT ON expenses
FOR EACH ROW
BEGIN
  IF NEW.amount <= 0 THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Expense amount must be greater than 0';
  END IF;
END //
DELIMITER ;

-- ============================================================
-- SAMPLE DATA (for testing - uncomment if needed)
-- ============================================================

/*
-- Sample user (password: 'password123' - hashed with bcrypt)
INSERT INTO users (name, email, password) VALUES
('John Doe', 'john@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789');

-- Sample expenses for user 1
INSERT INTO expenses (title, amount, date, payment_method, notes, user_id, category_id) VALUES
('Lunch at restaurant', 25.50, '2026-02-01', 'credit_card', 'Business lunch', 1, 1),
('Uber ride', 15.00, '2026-02-02', 'wallet', 'To office', 1, 2),
('Netflix subscription', 15.99, '2026-02-03', 'credit_card', 'Monthly', 1, 4),
('Grocery shopping', 85.00, '2026-02-04', 'debit_card', 'Weekly groceries', 1, 3),
('Electricity bill', 120.00, '2026-02-05', 'bank_transfer', 'Feb 2026', 1, 5);

-- Sample budget for user 1
INSERT INTO budgets (amount, month, year, user_id, category_id) VALUES
(3000.00, 2, 2026, 1, NULL),  -- Overall budget
(500.00, 2, 2026, 1, 1),      -- Food budget
(200.00, 2, 2026, 1, 2);      -- Transportation budget
*/

-- ============================================================
-- END OF SCHEMA
-- ============================================================
