<?php
require_once '../includes/config.php';
if (!isAdminLoggedIn()) redirect('login.php');
$page_title = 'Reports';
$base_path = '../';
$db = getDB();

// Date range filter
$from = clean($_GET['from'] ?? date('Y-m-01'));
$to   = clean($_GET['to']   ?? date('Y-m-d'));

// Payment report: who paid
$paid_users = $db->query("SELECT u.name, u.email, u.user_type, u.category, SUM(p.amount) as total_paid, COUNT(p.id) as payment_count
    FROM payments p JOIN users u ON p.user_id=u.id
    WHERE p.status='paid' AND p.payment_date BETWEEN '$from' AND '$to'
    GROUP BY u.id ORDER BY total_paid DESC");

// Who hasn't paid
$unpaid_users = $db->query("SELECT u.name, u.email, u.user_type, COUNT(mo.id) as meal_count
    FROM users u LEFT JOIN meal_orders mo ON u.id=mo.user_id AND mo.order_date BETWEEN '$from' AND '$to'
    WHERE u.id NOT IN (SELECT DISTINCT user_id FROM payments WHERE status='paid' AND payment_date BETWEEN '$from' AND '$to')
    GROUP BY u.id HAVING meal_count > 0 ORDER BY meal_count DESC");

// Payment type breakdown
$type_breakdown = $db->query("SELECT payment_type, COUNT(*) as cnt, SUM(amount) as total FROM payments WHERE status='paid' AND payment_date BETWEEN '$from' AND '$to' GROUP BY payment_type");

// Monthly bar chart data
$monthly = $db->query("SELECT DATE_FORMAT(payment_date,'%b') as month, SUM(amount) as total FROM payments WHERE status='paid' AND YEAR(payment_date)=YEAR(CURDATE()) GROUP BY MONTH(payment_date) ORDER BY MONTH(payment_date)");
$chart_data = [];
while($r = $monthly->fetch_assoc()) $chart_data[] = ['label'=>$r['month'],'value'=>(int)$r['total'],'label_val'=>'৳'.number_format($r['total'],0)];

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
            <li><a href="reports.php" class="active"><i class="fa fa-chart-bar"></i> Reports</a></li>
            <li><a href="payments.php"><i class="fa fa-money-bill"></i> Payments</a></li>
            <li><a href="timings.php"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php"><i class="fa fa-gear"></i> Settings</a></li>
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>
    <main class="dashboard-main">
        <h1 class="page-title">Reports</h1>
        <p class="page-breadcrumb"><i class="fa fa-house"></i> Admin &rsaquo; Reports</p>

        <!-- Date Filter -->
        <div class="card" style="margin-bottom:24px;">
            <div class="card-body" style="padding:16px 20px;">
                <form method="GET" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
                    <div>
                        <label style="font-size:12px;color:var(--mid);display:block;margin-bottom:4px;">From Date</label>
                        <input type="date" name="from" value="<?= $from ?>" style="padding:9px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;">
                    </div>
                    <div>
                        <label style="font-size:12px;color:var(--mid);display:block;margin-bottom:4px;">To Date</label>
                        <input type="date" name="to" value="<?= $to ?>" style="padding:9px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;">
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fa fa-chart-bar"></i> Generate Report</button>
                </form>
            </div>
        </div>

        <!-- Payment Type Breakdown -->
        <div class="stats-grid" style="margin-bottom:24px;">
            <?php
            $types = ['daily'=>['icon'=>'fa-calendar-day','color'=>'orange'],'weekly'=>['icon'=>'fa-calendar-week','color'=>'gold'],'monthly'=>['icon'=>'fa-calendar','color'=>'green']];
            $type_totals = ['daily'=>0,'weekly'=>0,'monthly'=>0];
            if ($type_breakdown) while($r=$type_breakdown->fetch_assoc()) $type_totals[$r['payment_type']] = $r['total'];
            foreach($type_totals as $type=>$total):
            ?>
            <div class="stat-card">
                <div class="stat-icon <?= $types[$type]['color'] ?>"><i class="fa <?= $types[$type]['icon'] ?>"></i></div>
                <div class="stat-info">
                    <div class="stat-num">৳<?= number_format($total,0) ?></div>
                    <div class="stat-label"><?= ucfirst($type) ?> Payments</div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <!-- Monthly Chart -->
        <div class="card" style="margin-bottom:24px;">
            <div class="card-header"><span class="card-title">Monthly Revenue (<?= date('Y') ?>)</span></div>
            <div class="card-body">
                <div class="chart-area" id="monthly-chart" style="height:180px;">
                    <div style="color:var(--mid);font-size:13px;">Loading chart...</div>
                </div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
            <!-- Who Paid -->
            <div class="card">
                <div class="card-header"><span class="card-title" style="color:var(--success);">✅ Who Paid</span></div>
                <div class="card-body" style="padding:0;">
                    <div class="table-wrapper">
                        <table>
                            <thead><tr><th>Name</th><th>Type</th><th>Payments</th><th>Total</th></tr></thead>
                            <tbody>
                            <?php if ($paid_users && $paid_users->num_rows > 0): while($r=$paid_users->fetch_assoc()): ?>
                            <tr>
                                <td><strong><?= htmlspecialchars($r['name']) ?></strong><br><small style="color:var(--mid);"><?= htmlspecialchars($r['email']) ?></small></td>
                                <td><span class="badge badge-info"><?= ucfirst($r['user_type']) ?></span></td>
                                <td><?= $r['payment_count'] ?>x</td>
                                <td><strong style="color:var(--success);">৳<?= number_format($r['total_paid'],0) ?></strong></td>
                            </tr>
                            <?php endwhile; else: ?>
                            <tr><td colspan="4" style="text-align:center;padding:20px;color:var(--mid);">No payments in this period</td></tr>
                            <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Who Hasn't Paid -->
            <div class="card">
                <div class="card-header"><span class="card-title" style="color:var(--danger);">❌ Pending Payment</span></div>
                <div class="card-body" style="padding:0;">
                    <div class="table-wrapper">
                        <table>
                            <thead><tr><th>Name</th><th>Type</th><th>Meals</th></tr></thead>
                            <tbody>
                            <?php if ($unpaid_users && $unpaid_users->num_rows > 0): while($r=$unpaid_users->fetch_assoc()): ?>
                            <tr>
                                <td><strong><?= htmlspecialchars($r['name']) ?></strong><br><small style="color:var(--mid);"><?= htmlspecialchars($r['email']) ?></small></td>
                                <td><span class="badge badge-info"><?= ucfirst($r['user_type']) ?></span></td>
                                <td><span class="badge badge-danger"><?= $r['meal_count'] ?> meals</span></td>
                            </tr>
                            <?php endwhile; else: ?>
                            <tr><td colspan="3" style="text-align:center;padding:20px;color:var(--success);">All users have paid! 🎉</td></tr>
                            <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<script>
const chartData = <?= json_encode($chart_data) ?>;
document.addEventListener('DOMContentLoaded', function() {
    if (chartData.length > 0) {
        renderBarChart('monthly-chart', chartData);
    } else {
        document.getElementById('monthly-chart').innerHTML = '<div style="color:var(--mid);font-size:13px;text-align:center;width:100%;">No data for this year</div>';
    }
});
</script>
<?php $db->close(); include '../includes/footer.php'; ?>