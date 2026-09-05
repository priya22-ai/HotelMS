-- =============================================
-- HotelM / MealMate — Neon Postgres Schema
-- Target: Neon serverless Postgres (PG 16+)
-- Replaces meal_management.sql (MySQL) for Node + Neon
-- Supports both legacy normalized + new flat meal_orders
-- =============================================

-- Drop existing types if re-running (idempotent)
DROP TYPE IF EXISTS user_type_enum CASCADE;
DROP TYPE IF EXISTS category_enum CASCADE;
DROP TYPE IF EXISTS status_enum CASCADE;
DROP TYPE IF EXISTS meal_type_enum CASCADE;
DROP TYPE IF EXISTS payment_type_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS order_status_enum CASCADE;

CREATE TYPE user_type_enum AS ENUM ('student','guest','employee','cleaner');
CREATE TYPE category_enum AS ENUM ('COZY','Premium','VIP');
CREATE TYPE status_enum AS ENUM ('active','inactive');
CREATE TYPE meal_type_enum AS ENUM ('breakfast','lunch','dinner');
CREATE TYPE payment_type_enum AS ENUM ('daily','weekly','monthly');
CREATE TYPE payment_method_enum AS ENUM ('cash','bkash','nagad','card');
CREATE TYPE payment_status_enum AS ENUM ('paid','pending','failed');
CREATE TYPE order_status_enum AS ENUM ('ordered','cancelled','confirmed');

-- =============================================
-- 1. ADMINS
-- =============================================
CREATE TABLE IF NOT EXISTS admins (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    address     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. USERS
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    address     TEXT,
    user_type   user_type_enum NOT NULL DEFAULT 'student',
    category    category_enum  NOT NULL DEFAULT 'COZY',
    status      status_enum    NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

-- =============================================
-- 3. MENUS
-- =============================================
CREATE TABLE IF NOT EXISTS menus (
    id          SERIAL PRIMARY KEY,
    meal_type   meal_type_enum NOT NULL,
    menu_date   DATE NOT NULL,
    items       TEXT NOT NULL,
    price       DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    created_by  INT REFERENCES admins(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (meal_type, menu_date)
);
CREATE INDEX IF NOT EXISTS idx_menus_date ON menus(menu_date);

-- =============================================
-- 4. MEAL ORDERS — flat (one row per user per day) + legacy meal_type
--    - Flat columns: breakfast/lunch/dinner (0/1), total_amount
--    - Legacy columns: menu_id, meal_type (nullable for flat mode)
--    Supports both user/dashboard.php flat usage and normalized SQL
-- =============================================
CREATE TABLE IF NOT EXISTS meal_orders (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    menu_id         INT REFERENCES menus(id) ON DELETE SET NULL,
    meal_type       meal_type_enum, -- nullable when using flat mode
    order_date      DATE NOT NULL,
    -- flat mode columns (for React + user/meal-order.php compatibility)
    breakfast       SMALLINT NOT NULL DEFAULT 0 CHECK (breakfast IN (0,1)),
    lunch           SMALLINT NOT NULL DEFAULT 0 CHECK (lunch IN (0,1)),
    dinner          SMALLINT NOT NULL DEFAULT 0 CHECK (dinner IN (0,1)),
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status          order_status_enum NOT NULL DEFAULT 'ordered',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uniq_user_date UNIQUE (user_id, order_date)
);
CREATE INDEX IF NOT EXISTS idx_meal_orders_user_date ON meal_orders(user_id, order_date);
CREATE INDEX IF NOT EXISTS idx_meal_orders_date ON meal_orders(order_date);

-- =============================================
-- 5. PAYMENTS — extended with payment_for_* for reports
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id                  SERIAL PRIMARY KEY,
    user_id             INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount              DECIMAL(10,2) NOT NULL,
    payment_type        payment_type_enum NOT NULL DEFAULT 'monthly',
    payment_method      payment_method_enum NOT NULL DEFAULT 'cash',
    payment_date        DATE NOT NULL,
    payment_for_start   DATE,
    payment_for_end     DATE,
    status              payment_status_enum NOT NULL DEFAULT 'pending',
    note                TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =============================================
-- 6. NOTIFICATIONS — extended with user_id for targeting
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    target      VARCHAR(50) NOT NULL DEFAULT 'all',
    user_id     INT REFERENCES users(id) ON DELETE CASCADE, -- null = broadcast
    type        VARCHAR(20) DEFAULT 'info', -- meal/success/info for dashboard
    is_read     BOOLEAN DEFAULT FALSE,
    created_by  INT REFERENCES admins(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =============================================
-- 7. MEAL TIMINGS
-- =============================================
CREATE TABLE IF NOT EXISTS meal_timings (
    id          SERIAL PRIMARY KEY,
    meal_type   meal_type_enum NOT NULL UNIQUE,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO meal_timings (meal_type, start_time, end_time) VALUES
    ('breakfast', '07:00:00', '09:30:00'),
    ('lunch',     '12:00:00', '14:30:00'),
    ('dinner',    '19:00:00', '21:30:00')
ON CONFLICT (meal_type) DO NOTHING;

-- =============================================
-- 8. SETTINGS
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    id              SERIAL PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE,
    setting_value   TEXT
);

INSERT INTO settings (setting_key, setting_value) VALUES
    ('site_name',        'MealMate'),
    ('currency',         'BDT'),
    ('breakfast_price',  '50'),
    ('lunch_price',      '80'),
    ('dinner_price',     '70')
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- 9. PRICING — per-category meal pricing (for meal-order.php)
-- =============================================
CREATE TABLE IF NOT EXISTS pricing (
    id          SERIAL PRIMARY KEY,
    category    category_enum NOT NULL,
    meal_type   meal_type_enum NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    UNIQUE (category, meal_type)
);

INSERT INTO pricing (category, meal_type, price) VALUES
    ('COZY',    'breakfast', 50),
    ('COZY',    'lunch',     80),
    ('COZY',    'dinner',    70),
    ('Premium', 'breakfast', 60),
    ('Premium', 'lunch',     100),
    ('Premium', 'dinner',    90),
    ('VIP',     'breakfast', 80),
    ('VIP',     'lunch',     130),
    ('VIP',     'dinner',    120)
ON CONFLICT (category, meal_type) DO NOTHING;

-- =============================================
-- 10. SESSION STORE for express-session (connect-pg-simple)
--     Auto-created by connect-pg-simple if not exists, but pre-create for Neon
-- =============================================
CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- =============================================
-- DONE
-- =============================================
