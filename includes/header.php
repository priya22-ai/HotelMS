<?php
// Header & Navbar - All Pages
$current_page = basename($_SERVER['PHP_SELF']);
$site_name = "Meal Management System";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($page_title) ? $page_title . ' — ' : '' ?><?= $site_name ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="<?= $base_path ?? '' ?>assets/css/style.css">
    <?php if(isset($extra_css)) echo $extra_css; ?>
</head>
<body>

<!-- Header -->
<header class="site-header">
    <div class="header-inner">
        <div class="brand">
            <div class="brand-icon"><i class="fa-solid fa-bowl-food"></i></div>
            <div class="brand-text">
                <span class="brand-name">MealMate</span>
                <span class="brand-sub">Management System</span>
            </div>
        </div>

        <nav class="main-nav">
            <a href="<?= $base_path ?? '' ?>index.php" class="<?= $current_page=='index.php'?'active':'' ?>">
                <i class="fa fa-home"></i> Home
            </a>
            <?php if(isAdminLoggedIn()): ?>
                <a href="<?= $base_path ?? '../' ?>admin/dashboard.php" class="<?= strpos($current_page,'admin')!==false?'active':'' ?>">
                    <i class="fa fa-gauge"></i> Dashboard
                </a>
                <a href="<?= $base_path ?? '../' ?>admin/menu.php"><i class="fa fa-utensils"></i> Menu</a>
                <a href="<?= $base_path ?? '../' ?>admin/users.php"><i class="fa fa-users"></i> Users</a>
                <a href="<?= $base_path ?? '../' ?>admin/reports.php"><i class="fa fa-chart-bar"></i> Reports</a>
                <a href="<?= $base_path ?? '../' ?>admin/settings.php"><i class="fa fa-gear"></i> Settings</a>
            <?php elseif(isUserLoggedIn()): ?>
                <a href="<?= $base_path ?? '../' ?>user/dashboard.php"><i class="fa fa-gauge"></i> My Meals</a>
                <a href="<?= $base_path ?? '../' ?>user/menu.php"><i class="fa fa-utensils"></i> Menu</a>
                <a href="<?= $base_path ?? '../' ?>user/payment.php"><i class="fa fa-credit-card"></i> Payment</a>
                <a href="<?= $base_path ?? '../' ?>user/activity.php"><i class="fa fa-calendar"></i> Activity</a>
                <a href="<?= $base_path ?? '../' ?>user/report.php"><i class="fa fa-chart-line"></i> Report</a>
            <?php else: ?>
                <a href="<?= $base_path ?? '' ?>index.php#about"><i class="fa fa-circle-info"></i> About</a>
                <a href="<?= $base_path ?? '' ?>index.php#contact"><i class="fa fa-envelope"></i> Contact</a>
            <?php endif; ?>
        </nav>

        <div class="header-actions">
            <?php if(isAdminLoggedIn()): ?>
                <span class="user-badge admin-badge"><i class="fa fa-shield"></i> Admin</span>
                <a href="<?= $base_path ?? '../' ?>admin/logout.php" class="btn-logout"><i class="fa fa-right-from-bracket"></i> Logout</a>
            <?php elseif(isUserLoggedIn()): ?>
                <div class="user-badge user-badge-profile">
                    <i class="fa fa-user-circle"></i>
                    <span><?= htmlspecialchars($_SESSION['user_name'] ?? 'User') ?></span>
                </div>
                <a href="<?= $base_path ?? '../' ?>user/logout.php" class="btn-logout"><i class="fa fa-right-from-bracket"></i> Logout</a>
            <?php else: ?>
                <a href="<?= $base_path ?? '' ?>index.php" class="btn-enter"><i class="fa fa-arrow-right-to-bracket"></i> Enter</a>
            <?php endif; ?>
            <button class="nav-toggle" onclick="toggleNav()"><i class="fa fa-bars"></i></button>
        </div>
    </div>
</header>

<div class="header-spacer"></div>