<?php
require_once '../includes/config.php';

if (!isAdminLoggedIn()) {
    redirect('login.php');
}

$page_title = 'Payments';
$base_path = '../';

include '../includes/header.php';
?>

<div class="dashboard-layout">

    <aside class="sidebar">
        <p class="sidebar-section-title">Admin Panel</p>

        <ul class="sidebar-nav">
            <li><a href="dashboard.php"><i class="fa fa-gauge"></i> Dashboard</a></li>
            <li><a href="menu.php"><i class="fa fa-utensils"></i> Manage Menu</a></li>
            <li><a href="users.php"><i class="fa fa-users"></i> Users</a></li>
            <li><a href="notifications.php"><i class="fa fa-bell"></i> Notifications</a></li>
            <li><a href="reports.php"><i class="fa fa-chart-bar"></i> Reports</a></li>
            <li><a href="payments.php" class="active"><i class="fa fa-money-bill"></i> Payments</a></li>
            <li><a href="timings.php"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php"><i class="fa fa-gear"></i> Settings</a></li>
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>


    <main class="dashboard-main">

        <h1 class="page-title">Payments</h1>

        <div class="card">
            <div class="card-body">
                <p>Payments page working successfully.</p>
            </div>
        </div>

    </main>

</div>

<?php include '../includes/footer.php'; ?>