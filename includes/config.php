<?php
// =============================
// Database Config
// =============================

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'meal_management');

// Session start (MUST BE TOP)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// DB Connection
function getDB() {
    static $conn;

    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

        if ($conn->connect_error) {
            die("DB Connection failed: " . $conn->connect_error);
        }

        $conn->set_charset("utf8mb4");
    }

    return $conn;
}

// =============================
// AUTH CHECKS
// =============================

function isAdminLoggedIn() {
    return isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id']);
}

function isUserLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// =============================
// HELPERS
// =============================

function redirect($url) {
    header("Location: $url");
    exit();
}

function clean($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function formatCurrency($amount) {
    return '৳ ' . number_format($amount, 2);
}
?>