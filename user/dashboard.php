<?php
require_once '../includes/config.php';
if (!isUserLoggedIn()) redirect('user/login.php');
$page_title = 'My Dashboard';
$base_path = '../';

$db = getDB();
$uid = (int)$_SESSION['user_id'];

// User info
$user = $db->query("SELECT * FROM users WHERE id=$uid LIMIT 1")->fetch_assoc();

// Today's order
$today = date('Y-m-d');
$order_res = $db->query("SELECT * FROM meal_orders WHERE user_id=$uid AND order_date='$today' LIMIT 1");
$today_order = $order_res->num_rows ? $order_res->fetch_assoc() : null;

// Total meals this month
$month_start = date('Y-m-01');
$total_meals = $db->query("SELECT COUNT(*) as c FROM meal_orders WHERE user_id=$uid AND order_date>='$month_start'")->fetch_assoc()['c'];

// Total paid
$total_paid = $db->query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE user_id=$uid AND status='paid'")->fetch_assoc()['s'];

// Pending payment
$total_pending = $db->query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE user_id=$uid AND status='pending'")->fetch_assoc()['s'];

// Recent activity (last 7 days)
$recent = $db->query("SELECT * FROM meal_orders WHERE user_id=$uid ORDER BY order_date DESC LIMIT 7");

// Notifications (unread)
$notifs = $db->query("SELECT * FROM notifications WHERE (user_id=$uid OR user_id IS NULL) ORDER BY created_at DESC LIMIT 5");

// Meal timings
$timings = [];
$tq = $db->query("SELECT * FROM meal_timings");
while ($t = $tq->fetch_assoc()) $timings[$t['meal_type']] = $t;

$db->close();
include '../includes/header.php';
?>

<div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-user">
            <div class="sidebar-avatar"><i class="fa fa-user"></i></div>
            <div>
                <div class="sidebar-name"><?= htmlspecialchars($user['name']) ?></div>
                <div class="sidebar-role">
                    <span class="badge-cat badge-<?= strtolower($user['category']) ?>"><?= $user['category'] ?></span>
                    <span style="font-size:11px;opacity:0.6;"><?= ucfirst($user['user_type']) ?></span>
                </div>
            </div>
        </div>
        <nav class="sidebar-nav">
            <a href="dashboard.php" class="active"><i class="fa fa-gauge"></i> Dashboard</a>
            <a href="meal-order.php"><i class="fa fa-utensils"></i> Meal Order</a>
            <a href="payment.php"><i class="fa fa-credit-card"></i> Payment</a>
            <a href="activity.php"><i class="fa fa-calendar-check"></i> Activity</a>
            <a href="report.php"><i class="fa fa-chart-line"></i> My Report</a>
            <a href="notifications.php"><i class="fa fa-bell"></i> Notifications</a>
            <a href="logout.php" style="margin-top:auto;color:#e07070;"><i class="fa fa-right-from-bracket"></i> Logout</a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <div class="page-header">
            <div>
                <h1>Welcome, <?= htmlspecialchars(explode(' ',$user['name'])[0]) ?>! 👋</h1>
                <p style="color:var(--mid);font-size:14px;"><?= date('l, d F Y') ?></p>
            </div>
            <a href="meal-order.php" class="btn btn-primary"><i class="fa fa-plus"></i> Order Today's Meal</a>
        </div>

        <!-- Stat Cards -->
        <div class="stat-cards">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(200,96,42,0.1);color:var(--primary);">
                    <i class="fa fa-utensils"></i>
                </div>
                <div>
                    <span class="stat-num"><?= $total_meals ?></span>
                    <span class="stat-label">Meals This Month</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(46,158,91,0.1);color:#2e9e5b;">
                    <i class="fa fa-check-circle"></i>
                </div>
                <div>
                    <span class="stat-num">৳<?= number_format($total_paid,0) ?></span>
                    <span class="stat-label">Total Paid</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(212,165,71,0.15);color:var(--gold);">
                    <i class="fa fa-clock"></i>
                </div>
                <div>
                    <span class="stat-num">৳<?= number_format($total_pending,0) ?></span>
                    <span class="stat-label">Pending Payment</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(42,126,200,0.1);color:#2a7ec8;">
                    <i class="fa fa-crown"></i>
                </div>
                <div>
                    <span class="stat-num"><?= $user['category'] ?></span>
                    <span class="stat-label">My Category</span>
                </div>
            </div>
        </div>

        <div class="grid-2">
            <!-- Today's Meal Status -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fa fa-sun"></i> Today's Meal Status</h3>
                    <a href="meal-order.php" class="btn btn-sm btn-primary">Manage</a>
                </div>
                <div class="card-body">
                    <?php
                    $meals = ['breakfast'=>['icon'=>'☀️','label'=>'Breakfast'],'lunch'=>['icon'=>'🌤️','label'=>'Lunch'],'dinner'=>['icon'=>'🌙','label'=>'Dinner']];
                    foreach ($meals as $key => $info):
                        $ordered = $today_order && $today_order[$key] == 1;
                        $start = $timings[$key]['start_time'] ?? '';
                        $end   = $timings[$key]['end_time'] ?? '';
                    ?>
                    <div class="meal-status-row">
                        <span class="meal-emoji"><?= $info['icon'] ?></span>
                        <div style="flex:1;">
                            <div style="font-weight:600;"><?= $info['label'] ?></div>
                            <div style="font-size:12px;color:var(--mid);"><?= $start ? date('h:i A', strtotime($start)).' - '.date('h:i A', strtotime($end)) : '--' ?></div>
                        </div>
                        <span class="badge <?= $ordered ? 'badge-success' : 'badge-muted' ?>">
                            <?= $ordered ? '<i class="fa fa-check"></i> Ordered' : 'Not Set' ?>
                        </span>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Notifications -->
            <div class="card">
                <div class="card-header">
                    <h3><i class="fa fa-bell"></i> Notifications</h3>
                    <a href="notifications.php" class="btn btn-sm btn-outline">View All</a>
                </div>
                <div class="card-body">
                    <?php if ($notifs->num_rows === 0): ?>
                        <div class="empty-state"><i class="fa fa-bell-slash"></i><p>No notifications</p></div>
                    <?php else: ?>
                    <div class="notif-list">
                        <?php while ($n = $notifs->fetch_assoc()): ?>
                        <div class="notif-item <?= $n['is_read'] ? '' : 'unread' ?>">
                            <div class="notif-icon"><i class="fa fa-<?= $n['type']==='meal'?'utensils':($n['type']==='success'?'check':'info') ?>"></i></div>
                            <div>
                                <div class="notif-title"><?= htmlspecialchars($n['title']) ?></div>
                                <div class="notif-msg"><?= htmlspecialchars($n['message']) ?></div>
                                <div class="notif-time"><?= date('d M, h:i A', strtotime($n['created_at'])) ?></div>
                            </div>
                        </div>
                        <?php endwhile; ?>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
            <div class="card-header">
                <h3><i class="fa fa-calendar-check"></i> Recent Meal Activity</h3>
                <a href="activity.php" class="btn btn-sm btn-outline">Full Calendar</a>
            </div>
            <div class="card-body">
                <?php if ($recent->num_rows === 0): ?>
                    <div class="empty-state"><i class="fa fa-calendar-xmark"></i><p>No meal orders yet. <a href="meal-order.php">Order now!</a></p></div>
                <?php else: ?>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Date</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Amount</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                        <?php while ($row = $recent->fetch_assoc()): ?>
                        <tr>
                            <td><?= date('d M Y', strtotime($row['order_date'])) ?></td>
                            <td><?= $row['breakfast'] ? '<span class="badge badge-success">✓</span>' : '<span style="color:var(--mid)">—</span>' ?></td>
                            <td><?= $row['lunch']     ? '<span class="badge badge-success">✓</span>' : '<span style="color:var(--mid)">—</span>' ?></td>
                            <td><?= $row['dinner']    ? '<span class="badge badge-success">✓</span>' : '<span style="color:var(--mid)">—</span>' ?></td>
                            <td><strong>৳<?= number_format($row['total_amount'],2) ?></strong></td>
                            <td><span class="badge badge-<?= $row['status']==='confirmed'?'success':($row['status']==='cancelled'?'danger':'warning') ?>"><?= ucfirst($row['status']) ?></span></td>
                        </tr>
                        <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </main>
</div>

<?php include '../includes/footer.php'; ?>