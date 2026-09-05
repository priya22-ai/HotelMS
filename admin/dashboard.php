<?php
require_once '../includes/config.php';
if (!isAdminLoggedIn()) redirect('login.php');
$page_title = 'Admin Dashboard';
$base_path = '../';

$db = getDB();

// Stats
$total_users   = $db->query("SELECT COUNT(*) as c FROM users")->fetch_assoc()['c'];
$total_meals_today = $db->query("SELECT COUNT(*) as c FROM meal_orders WHERE order_date=CURDATE()")->fetch_assoc()['c'];
$total_paid    = $db->query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE status='paid'")->fetch_assoc()['s'];
$pending_payments = $db->query("SELECT COUNT(*) as c FROM payments WHERE status='pending'")->fetch_assoc()['c'];

// Today's orders by meal type
$breakfast_count = $db->query("SELECT COUNT(*) as c FROM meal_orders WHERE order_date=CURDATE() AND meal_type='breakfast'")->fetch_assoc()['c'];
$lunch_count     = $db->query("SELECT COUNT(*) as c FROM meal_orders WHERE order_date=CURDATE() AND meal_type='lunch'")->fetch_assoc()['c'];
$dinner_count    = $db->query("SELECT COUNT(*) as c FROM meal_orders WHERE order_date=CURDATE() AND meal_type='dinner'")->fetch_assoc()['c'];

// Recent users
$recent_users = $db->query("SELECT * FROM users ORDER BY created_at DESC LIMIT 5");

// Notifications
$notifications = $db->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5");

$db->close();
include '../includes/header.php';
?>
<style>
.admin-sidebar-nav a.active { background:rgba(212,165,71,0.12); color:var(--gold-light); }
</style>

<div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
        <div style="padding:16px 12px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:10px;">
                <div class="brand-icon" style="width:36px;height:36px;font-size:16px;"><i class="fa fa-shield"></i></div>
                <div>
                    <div style="color:var(--gold-light);font-weight:600;font-size:14px;"><?= htmlspecialchars($_SESSION['admin_name']) ?></div>
                    <div style="color:rgba(255,255,255,0.4);font-size:11px;">Administrator</div>
                </div>
            </div>
        </div>
        <p class="sidebar-section-title">Main Menu</p>
        <ul class="sidebar-nav">
            <li><a href="dashboard.php" class="active"><i class="fa fa-gauge"></i> Dashboard</a></li>
            <li><a href="menu.php"><i class="fa fa-utensils"></i> Manage Menu</a></li>
            <li><a href="users.php"><i class="fa fa-users"></i> Users</a></li>
            <li><a href="notifications.php"><i class="fa fa-bell"></i> Notifications</a></li>
            <li><a href="reports.php"><i class="fa fa-chart-bar"></i> Reports</a></li>
            <li><a href="payments.php"><i class="fa fa-money-bill"></i> Payments</a></li>
            <li><a href="timings.php"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php"><i class="fa fa-gear"></i> Settings</a></li>
        </ul>
        <p class="sidebar-section-title">Account</p>
        <ul class="sidebar-nav">
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>

    <main class="dashboard-main">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-breadcrumb"><i class="fa fa-house"></i> Home &rsaquo; Dashboard &nbsp;|&nbsp; <span style="color:var(--primary);"><?= date('l, d F Y') ?></span></p>

        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon orange"><i class="fa fa-users"></i></div>
                <div class="stat-info">
                    <div class="stat-num"><?= $total_users ?></div>
                    <div class="stat-label">Total Users</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gold"><i class="fa fa-bowl-food"></i></div>
                <div class="stat-info">
                    <div class="stat-num"><?= $total_meals_today ?></div>
                    <div class="stat-label">Meals Today</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="fa fa-bangladeshi-taka-sign"></i></div>
                <div class="stat-info">
                    <div class="stat-num">৳<?= number_format($total_paid) ?></div>
                    <div class="stat-label">Total Collected</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><i class="fa fa-clock"></i></div>
                <div class="stat-info">
                    <div class="stat-num"><?= $pending_payments ?></div>
                    <div class="stat-label">Pending Payments</div>
                </div>
            </div>
        </div>

        <!-- Today's Meal Summary -->
        <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
                <span class="card-title"><i class="fa fa-sun" style="color:var(--gold);margin-right:8px;"></i>Today's Meal Orders</span>
                <span style="font-size:13px;color:var(--mid);"><?= date('d M Y') ?></span>
            </div>
            <div class="card-body">
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
                    <div style="background:rgba(200,96,42,0.06);border-radius:var(--radius);padding:20px;text-align:center;border:1px solid rgba(200,96,42,0.15);">
                        <i class="fa fa-coffee" style="font-size:28px;color:var(--primary);margin-bottom:10px;display:block;"></i>
                        <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;"><?= $breakfast_count ?></div>
                        <div style="font-size:13px;color:var(--mid);">Breakfast</div>
                    </div>
                    <div style="background:rgba(212,165,71,0.06);border-radius:var(--radius);padding:20px;text-align:center;border:1px solid rgba(212,165,71,0.15);">
                        <i class="fa fa-sun" style="font-size:28px;color:var(--gold);margin-bottom:10px;display:block;"></i>
                        <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;"><?= $lunch_count ?></div>
                        <div style="font-size:13px;color:var(--mid);">Lunch</div>
                    </div>
                    <div style="background:rgba(46,158,91,0.06);border-radius:var(--radius);padding:20px;text-align:center;border:1px solid rgba(46,158,91,0.15);">
                        <i class="fa fa-moon" style="font-size:28px;color:var(--success);margin-bottom:10px;display:block;"></i>
                        <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;"><?= $dinner_count ?></div>
                        <div style="font-size:13px;color:var(--mid);">Dinner</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
            <!-- Recent Users -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title"><i class="fa fa-users" style="color:var(--primary);margin-right:8px;"></i>Recent Users</span>
                    <a href="users.php" class="btn btn-sm btn-outline">View All</a>
                </div>
                <div class="card-body" style="padding:0;">
                    <div class="table-wrapper">
                        <table>
                            <thead><tr><th>Name</th><th>Type</th><th>Category</th><th>Status</th></tr></thead>
                            <tbody>
                            <?php if ($recent_users->num_rows > 0): while($u = $recent_users->fetch_assoc()): ?>
                            <tr>
                                <td><?= htmlspecialchars($u['name']) ?></td>
                                <td><span class="badge badge-info"><?= ucfirst($u['user_type']) ?></span></td>
                                <td><span class="badge badge-gold"><?= $u['category'] ?></span></td>
                                <td><span class="badge badge-<?= $u['status']==='active'?'success':'danger' ?>"><?= ucfirst($u['status']) ?></span></td>
                            </tr>
                            <?php endwhile; else: ?>
                            <tr><td colspan="4" style="text-align:center;color:var(--mid);padding:20px;">No users yet</td></tr>
                            <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Recent Notifications -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title"><i class="fa fa-bell" style="color:var(--gold);margin-right:8px;"></i>Notifications</span>
                    <a href="notifications.php" class="btn btn-sm btn-outline">Manage</a>
                </div>
                <div class="card-body">
                    <?php if ($notifications->num_rows > 0): while($n = $notifications->fetch_assoc()): ?>
                    <div class="notification-item">
                        <div class="notif-icon"><i class="fa fa-bell"></i></div>
                        <div class="notif-body">
                            <h4><?= htmlspecialchars($n['title']) ?></h4>
                            <p><?= htmlspecialchars(substr($n['message'],0,60)) ?>...</p>
                        </div>
                        <span class="notif-time"><?= date('d M', strtotime($n['created_at'])) ?></span>
                    </div>
                    <?php endwhile; else: ?>
                    <div style="text-align:center;color:var(--mid);padding:20px;">
                        <i class="fa fa-bell-slash" style="font-size:28px;display:block;margin-bottom:8px;"></i>
                        No notifications yet. <a href="notifications.php">Add one</a>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>
</div>

<?php include '../includes/footer.php'; ?>