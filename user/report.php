<?php
require_once '../includes/config.php';
if (!isUserLoggedIn()) redirect('user/login.php');
$page_title = 'My Report';
$base_path = '../';

$db = getDB();
$uid = (int)$_SESSION['user_id'];

// All time stats
$total_orders    = $db->query("SELECT COUNT(*) as c FROM meal_orders WHERE user_id=$uid")->fetch_assoc()['c'];
$total_breakfast = $db->query("SELECT SUM(breakfast) as s FROM meal_orders WHERE user_id=$uid")->fetch_assoc()['s'] ?? 0;
$total_lunch     = $db->query("SELECT SUM(lunch) as s FROM meal_orders WHERE user_id=$uid")->fetch_assoc()['s'] ?? 0;
$total_dinner    = $db->query("SELECT SUM(dinner) as s FROM meal_orders WHERE user_id=$uid")->fetch_assoc()['s'] ?? 0;
$total_spent     = $db->query("SELECT COALESCE(SUM(total_amount),0) as s FROM meal_orders WHERE user_id=$uid")->fetch_assoc()['s'];
$total_paid      = $db->query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE user_id=$uid AND status='paid'")->fetch_assoc()['s'];
$total_pending   = $total_spent - $total_paid;

// Monthly breakdown (last 6 months)
$monthly = $db->query("
    SELECT DATE_FORMAT(order_date,'%b %Y') as month_label,
           DATE_FORMAT(order_date,'%Y-%m') as month_key,
           COUNT(*) as days,
           SUM(breakfast+lunch+dinner) as meals,
           SUM(total_amount) as amount
    FROM meal_orders
    WHERE user_id=$uid AND order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY month_key
    ORDER BY month_key DESC
");

// Payment history
$pay_history = $db->query("SELECT * FROM payments WHERE user_id=$uid ORDER BY payment_date DESC LIMIT 10");

$db->close();
include '../includes/header.php';

$max_amount = 1;
$monthly_data = [];
while ($m = $monthly->fetch_assoc()) { $monthly_data[] = $m; if ($m['amount'] > $max_amount) $max_amount = $m['amount']; }
?>

<div class="dashboard-layout">
    <aside class="sidebar">
        <div class="sidebar-user">
            <div class="sidebar-avatar"><i class="fa fa-user"></i></div>
            <div>
                <div class="sidebar-name"><?= htmlspecialchars($_SESSION['user_name']) ?></div>
                <div class="sidebar-role">
                    <span class="badge-cat badge-<?= strtolower($_SESSION['user_category']) ?>"><?= $_SESSION['user_category'] ?></span>
                </div>
            </div>
        </div>
        <nav class="sidebar-nav">
            <a href="dashboard.php"><i class="fa fa-gauge"></i> Dashboard</a>
            <a href="meal-order.php"><i class="fa fa-utensils"></i> Meal Order</a>
            <a href="payment.php"><i class="fa fa-credit-card"></i> Payment</a>
            <a href="activity.php"><i class="fa fa-calendar-check"></i> Activity</a>
            <a href="report.php" class="active"><i class="fa fa-chart-line"></i> My Report</a>
            <a href="notifications.php"><i class="fa fa-bell"></i> Notifications</a>
            <a href="logout.php" style="margin-top:auto;color:#e07070;"><i class="fa fa-right-from-bracket"></i> Logout</a>
        </nav>
    </aside>

    <main class="main-content">
        <div class="page-header">
            <h1><i class="fa fa-chart-line" style="color:var(--primary)"></i> My Report</h1>
        </div>

        <!-- Overall Stats -->
        <div class="stat-cards">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(200,96,42,0.1);color:var(--primary);"><i class="fa fa-calendar"></i></div>
                <div><span class="stat-num"><?= $total_orders ?></span><span class="stat-label">Total Order Days</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(212,165,71,0.15);color:var(--gold);"><i class="fa fa-utensils"></i></div>
                <div><span class="stat-num"><?= $total_breakfast+$total_lunch+$total_dinner ?></span><span class="stat-label">Total Meals</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(42,126,200,0.1);color:#2a7ec8;"><i class="fa fa-file-invoice-dollar"></i></div>
                <div><span class="stat-num">৳<?= number_format($total_spent,0) ?></span><span class="stat-label">Total Bill</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(46,158,91,0.1);color:#2e9e5b;"><i class="fa fa-check-circle"></i></div>
                <div><span class="stat-num">৳<?= number_format($total_paid,0) ?></span><span class="stat-label">Total Paid</span></div>
            </div>
        </div>

        <div class="grid-2">
            <!-- Meal Breakdown -->
            <div class="card">
                <div class="card-header"><h3><i class="fa fa-pie-chart"></i> Meal Breakdown (All Time)</h3></div>
                <div class="card-body">
                    <?php
                    $total_all = $total_breakfast + $total_lunch + $total_dinner ?: 1;
                    $meals_bp = [
                        ['label'=>'☀️ Breakfast','count'=>$total_breakfast,'color'=>'var(--gold)'],
                        ['label'=>'🌤️ Lunch','count'=>$total_lunch,'color'=>'var(--primary)'],
                        ['label'=>'🌙 Dinner','count'=>$total_dinner,'color'=>'var(--dark-3)'],
                    ];
                    ?>
                    <div style="display:flex;flex-direction:column;gap:16px;">
                    <?php foreach ($meals_bp as $bp):
                        $pct = round($bp['count']/$total_all*100);
                    ?>
                    <div>
                        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
                            <span><?= $bp['label'] ?></span>
                            <span><strong><?= $bp['count'] ?></strong> meals (<?= $pct ?>%)</span>
                        </div>
                        <div style="height:10px;background:var(--light);border-radius:50px;overflow:hidden;">
                            <div style="height:100%;width:<?= $pct ?>%;background:<?= $bp['color'] ?>;border-radius:50px;transition:width 1s;"></div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    </div>

                    <?php if ($total_pending > 0): ?>
                    <div class="alert" style="background:rgba(212,165,71,0.12);border:1px solid rgba(212,165,71,0.3);color:var(--dark);margin-top:20px;border-radius:var(--radius-sm);padding:14px;display:flex;gap:10px;align-items:center;">
                        <i class="fa fa-exclamation-triangle" style="color:var(--gold);"></i>
                        <span>You have <strong>৳<?= number_format($total_pending,2) ?></strong> pending payment. <a href="payment.php" style="color:var(--primary);">Pay now →</a></span>
                    </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Monthly Chart -->
            <div class="card">
                <div class="card-header"><h3><i class="fa fa-bar-chart"></i> Monthly Spending</h3></div>
                <div class="card-body">
                    <?php if (empty($monthly_data)): ?>
                        <div class="empty-state"><i class="fa fa-chart-bar"></i><p>No data yet</p></div>
                    <?php else: ?>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                    <?php foreach (array_reverse($monthly_data) as $m):
                        $bar_pct = round($m['amount']/$max_amount*100);
                    ?>
                    <div>
                        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;">
                            <span><?= $m['month_label'] ?></span>
                            <span><strong>৳<?= number_format($m['amount'],0) ?></strong> · <?= $m['meals'] ?> meals</span>
                        </div>
                        <div style="height:10px;background:var(--light);border-radius:50px;overflow:hidden;">
                            <div style="height:100%;width:<?= $bar_pct ?>%;background:linear-gradient(90deg,var(--primary),var(--gold));border-radius:50px;transition:width 1s;"></div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- Payment History -->
        <div class="card">
            <div class="card-header"><h3><i class="fa fa-receipt"></i> Payment History</h3></div>
            <div class="card-body">
                <?php if (!$pay_history || $pay_history->num_rows === 0): ?>
                    <div class="empty-state"><i class="fa fa-receipt"></i><p>No payments yet. <a href="payment.php">Make first payment →</a></p></div>
                <?php else: ?>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Date</th><th>Type</th><th>Period</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                        <?php while ($p = $pay_history->fetch_assoc()): ?>
                        <tr>
                            <td><?= date('d M Y', strtotime($p['payment_date'])) ?></td>
                            <td><span class="badge badge-primary"><?= ucfirst($p['payment_type']) ?></span></td>
                            <td style="font-size:12px;"><?= date('d M',strtotime($p['payment_for_start'])).' – '.date('d M Y',strtotime($p['payment_for_end'])) ?></td>
                            <td><?= htmlspecialchars($p['payment_method']) ?></td>
                            <td><strong>৳<?= number_format($p['amount'],2) ?></strong></td>
                            <td><span class="badge badge-<?= $p['status']==='paid'?'success':($p['status']==='failed'?'danger':'warning') ?>"><?= ucfirst($p['status']) ?></span></td>
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