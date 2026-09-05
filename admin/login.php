<?php
require_once '../includes/config.php';

// যদি already login থাকে
if (isAdminLoggedIn()) {
    redirect('dashboard.php');
}

$page_title = 'Admin Login';
$base_path = '../';

$error = '';
$success = '';
$show_register = isset($_GET['register']) && $_GET['register'] == '1';

$db = getDB();
$adminExists = $db->query("SELECT id FROM admins LIMIT 1")->num_rows > 0;
$db->close();


// =============================
// REGISTER
// =============================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'register') {

    $name = clean($_POST['name']);
    $email = clean($_POST['email']);
    $pass = $_POST['password'];
    $phone = clean($_POST['phone']);
    $address = clean($_POST['address']);

    if (!$name || !$email || !$pass) {
        $error = "All required fields needed";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Invalid email";
    } elseif (strlen($pass) < 6) {
        $error = "Password min 6 chars";
    } else {

        $db = getDB();

        $emailE = $db->real_escape_string($email);
        $check = $db->query("SELECT id FROM admins WHERE email='$emailE'");

        if ($check->num_rows > 0) {
            $error = "Admin already exists";
        } else {

            $hash = password_hash($pass, PASSWORD_DEFAULT);

            $db->query("INSERT INTO admins (name,email,password,phone,address)
                        VALUES (
                        '".$db->real_escape_string($name)."',
                        '$emailE',
                        '$hash',
                        '".$db->real_escape_string($phone)."',
                        '".$db->real_escape_string($address)."'
                        )");

            $success = "Admin created! Now login.";
            $show_register = false;
        }

        $db->close();
    }
}


// =============================
// LOGIN
// =============================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'login') {

    $email = clean($_POST['email']);
    $pass = $_POST['password'];

    if (!$email || !$pass) {
        $error = "Enter email & password";
    } else {

        $db = getDB();

        $emailE = $db->real_escape_string($email);

        $result = $db->query("SELECT * FROM admins WHERE email='$emailE' LIMIT 1");

        if ($result->num_rows === 1) {

            $admin = $result->fetch_assoc();

            if (password_verify($pass, $admin['password'])) {

                session_regenerate_id(true);

                $_SESSION['admin_id'] = $admin['id'];
                $_SESSION['admin_name'] = $admin['name'];
                $_SESSION['admin_email'] = $admin['email'];

                redirect('dashboard.php');

            } else {
                $error = "Wrong password";
            }

        } else {
            $error = "Admin not found";
        }

        $db->close();
    }
}

include '../includes/header.php';
?>

<!-- (তোমার HTML same থাকবে — change লাগবে না) -->

<div class="auth-page">
    <div class="auth-container">
        <div class="auth-card">

            <h2><?= $show_register ? 'Admin Register' : 'Admin Login' ?></h2>

            <?php if ($error): ?>
                <div class="alert alert-danger"><?= $error ?></div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="alert alert-success"><?= $success ?></div>
            <?php endif; ?>

            <?php if ($show_register || !$adminExists): ?>

            <form method="POST">
                <input type="hidden" name="action" value="register">

                <input type="text" name="name" placeholder="Name" required>
                <input type="text" name="phone" placeholder="Phone">
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <input type="text" name="address" placeholder="Address">

                <button type="submit">Register</button>
            </form>

            <?php else: ?>

            <form method="POST">
                <input type="hidden" name="action" value="login">

                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>

                <button type="submit">Login</button>
            </form>

            <?php endif; ?>

        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>