-- =============================================
-- HotelM / MealMate Database Setup
-- Database: meal_management
-- =============================================

CREATE DATABASE IF NOT EXISTS meal_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE meal_management;

-- =============================================
-- 1. ADMINS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  DEFAULT NULL,
    address     TEXT         DEFAULT NULL,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 2. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  DEFAULT NULL,
    address     TEXT         DEFAULT NULL,
    user_type   ENUM('student','guest','employee','cleaner') NOT NULL DEFAULT 'student',
    category    ENUM('COZY','Premium','VIP')                 NOT NULL DEFAULT 'COZY',
    status      ENUM('active','inactive')                    NOT NULL DEFAULT 'active',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 3. MENUS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS menus (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    meal_type   ENUM('breakfast','lunch','dinner') NOT NULL,
    menu_date   DATE         NOT NULL,
    items       TEXT         NOT NULL,
    price       DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    created_by  INT          DEFAULT NULL,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 4. MEAL ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS meal_orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT          NOT NULL,
    menu_id     INT          DEFAULT NULL,
    meal_type   ENUM('breakfast','lunch','dinner') NOT NULL,
    order_date  DATE         NOT NULL,
    status      ENUM('ordered','cancelled') NOT NULL DEFAULT 'ordered',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id)  REFERENCES menus(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 5. PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    payment_type    ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'monthly',
    payment_method  ENUM('cash','bkash','nagad','card') NOT NULL DEFAULT 'cash',
    payment_date    DATE         NOT NULL,
    status          ENUM('paid','pending')            NOT NULL DEFAULT 'pending',
    note            TEXT         DEFAULT NULL,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 6. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    message     TEXT         NOT NULL,
    target      VARCHAR(50)  NOT NULL DEFAULT 'all',
    created_by  INT          DEFAULT NULL,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 7. MEAL TIMINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS meal_timings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    meal_type   ENUM('breakfast','lunch','dinner') NOT NULL UNIQUE,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default meal timings
INSERT INTO meal_timings (meal_type, start_time, end_time) VALUES
    ('breakfast', '07:00:00', '09:30:00'),
    ('lunch',     '12:00:00', '14:30:00'),
    ('dinner',    '19:00:00', '21:30:00')
ON DUPLICATE KEY UPDATE meal_type = meal_type;

-- =============================================
-- 8. SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE,
    setting_value   TEXT         DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default settings
INSERT INTO settings (setting_key, setting_value) VALUES
    ('site_name',        'MealMate'),
    ('currency',         'BDT'),
    ('breakfast_price',  '50'),
    ('lunch_price',      '80'),
    ('dinner_price',     '70')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- =============================================
-- DONE! All tables created successfully.
-- =============================================