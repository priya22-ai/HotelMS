<?php
require_once '../includes/config.php';
$page_title = 'User Login';
$base_path = '../';
$error = $success = '';
$show_register = isset($_GET['register']) && $_GET['register'] == '1';

// Handle Registration
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'register') {
    $name      = clean($_POST['name'] ?? '');
    $email     = clean($_POST['email'] ?? '');
    $pass      = $_POST['password'] ?? '';
    $phone     = clean($_POST['phone'] ?? '');
    $address   = clean($_POST['address'] ?? '');
    $user_type = clean($_POST['user_type'] ?? 'student');
    $category  = clean($_POST['category'] ?? 'COZY');

    if (!$name || !$email || !$pass || !$user_type || !$category) {
        $error = 'Please fill all required fields.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Invalid email address.';
    } elseif (strlen($pass) < 6) {
        $error = 'Password must be at least 6 characters.';
    } else {
        $db = getDB();
        $emailE = $db->real_escape_string($email);
        if ($db->query("SELECT id FROM users WHERE email='$emailE' LIMIT 1")->num_rows) {
            $error = 'This email is already registered.';
        } else {
            $hash  = password_hash($pass, PASSWORD_DEFAULT);
            $ne    = $db->real_escape_string($name);
            $pe    = $db->real_escape_string($phone);
            $ae    = $db->real_escape_string($address);
            $ute   = $db->real_escape_string($user_type);
            $ce    = $db->real_escape_string($category);
            $db->query("INSERT INTO users (name,email,password,phone,address,user_type,category) VALUES ('$ne','$emailE','$hash','$pe','$ae','$ute','$ce')");
            $success = 'Registration successful! You can now login.';
            $show_register = false;
        }
        $db->close();
    }
}

// Handle Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $email    = clean($_POST['email'] ?? '');
    $pass     = $_POST['password'] ?? '';
    $category = clean($_POST['category'] ?? '');

    if (!$email || !$pass) {
        $error = 'Please enter email and password.';
    } else {
        $db = getDB();
        $emailE = $db->real_escape_string($email);
        $query  = "SELECT * FROM users WHERE email='$emailE' AND status='active'";
        if ($category) $query .= " AND category='".$db->real_escape_string($category)."'";
        $query .= " LIMIT 1";
        $result = $db->query($query);
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            if (password_verify($pass, $user['password'])) {
                $_SESSION['user_id']       = $user['id'];
                $_SESSION['user_name']     = $user['name'];
                $_SESSION['user_email']    = $user['email'];
                $_SESSION['user_type']     = $user['user_type'];
                $_SESSION['user_category'] = $user['category'];
                redirect('../user/dashboard.php');
            } else { $error = 'Incorrect password.'; }
        } else { $error = 'No active user found with this email/category.'; }
        $db->close();
    }
}

if (isUserLoggedIn()) redirect('../user/dashboard.php');
include '../includes/header.php';
?>

<div class="auth-page">
    <div class="auth-bg-img"></div>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-logo">
                <div class="brand-icon"><i class="fa-solid fa-bowl-food"></i></div>
                <h2><?= $show_register ? 'Create Account' : 'User Login' ?></h2>
                <p><?= $show_register ? 'Join MealMate today' : 'Welcome back!' ?></p>
            </div>

            <?php if ($error): ?><div class="alert alert-danger"><i class="fa fa-circle-xmark"></i><?= $error ?></div><?php endif; ?>
            <?php if ($success): ?><div class="alert alert-success"><i class="fa fa-check-circle"></i><?= $success ?></div><?php endif; ?>

            <?php if ($show_register): ?>
            <!-- REGISTRATION FORM -->
            <form method="POST">
                <input type="hidden" name="action" value="register">
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" class="form-control" placeholder="Your name" required>
                    </div>
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" name="phone" class="form-control" placeholder="+880...">
                    </div>
                </div>
                <div class="form-group">
                    <label>Email Address *</label>
                    <input type="email" name="email" class="form-control" placeholder="your@email.com" required>
                </div>
                <div class="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" class="form-control" placeholder="Min 6 characters" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>User Type *</label>
                        <select name="user_type" class="form-control" required>
                            <option value="student">🎓 Student</option>
                            <option value="guest">🧳 Guest</option>
                            <option value="employee">💼 Employee</option>
                            <option value="cleaner">🧹 Cleaner</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Category *</label>
                        <select name="category" class="form-control" required>
                            <option value="COZY">🏠 COZY</option>
                            <option value="Premium">⭐ Premium</option>
                            <option value="VIP">👑 VIP</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" name="address" class="form-control" placeholder="Your address">
                </div>
                <button type="submit" class="btn-submit"><i class="fa fa-user-plus"></i> Create Account</button>
            </form>
            <div class="auth-switch">Already have an account? <a href="login.php">Login here</a></div>

            <?php else: ?>
            <!-- LOGIN FORM -->
            <form method="POST">
                <input type="hidden" name="action" value="login">
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" class="form-control" placeholder="your@email.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" class="form-control" placeholder="Your password" required>
                </div>
                <div class="form-group">
                    <label>Category (Optional)</label>
                    <select name="category" class="form-control">
                        <option value="">-- Any Category --</option>
                        <option value="COZY">🏠 COZY</option>
                        <option value="Premium">⭐ Premium</option>
                        <option value="VIP">👑 VIP</option>
                    </select>
                </div>
                <button type="submit" class="btn-submit"><i class="fa fa-right-from-bracket"></i> Login</button>
            </form>
            <div class="auth-switch">New user? <a href="login.php?register=1">Create Account</a></div>
            <?php endif; ?>

            <div class="auth-switch" style="margin-top:12px;">
                <a href="../index.php" style="color:rgba(255,255,255,0.4);font-size:12px;"><i class="fa fa-arrow-left"></i> Back to Home</a>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>