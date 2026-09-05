<?php
require_once '../includes/config.php';
if (!isUserLoggedIn()) redirect('user/login.php');
$page_title = 'Activity';
$base_path = '../';

$db = getDB();
$uid = (int)$_SESSION['user_id'];

$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('m');
$year  = isset($_GET['year'])  ? (int)$_GET['year']  : (int)date('Y');
if ($month < 1) { $month = 12; $year--; }
if ($month > 12){ $month = 1;  $year++; }

$month_start = sprintf('%04d-%02d-01', $year, $month);
$month_end   = date('Y-m-t', strtotime($month_start));

// All orders this month
$orders = [];
$oq = $db->query("SELECT * FROM meal_orders WHERE user_id=$uid AND order_date BETWEEN '$month_start' AND '$month_end'");
while ($o = $oq->fetch_assoc()) $orders[$o['order_date']] = $o;

// Payments this month
$payments = [];
$pq = $db->query("SELECT * FROM payments WHERE user_id=$uid AND payment_date BETWEEN '$month_start' AND '$month_end' AND status='paid'");
while ($p = $pq->fetch_assoc()) $payments[$p['payment_date']] = $p;

// Stats
$total_days   = count($orders);
$total_meals  = 0;
$total_amount = 0;
foreach ($orders as $o) {
    $total_meals  += $o['breakfast'] + $o['lunch'] + $o['dinner'];
    $total_amount += $o['total_amount'];
}
$total_paid_month = 0;
foreach ($payments as $p) $total_paid_month += $p['amount'];

$db->close();
include '../includes/header.php';

$days_in_month = (int)date('t', strtotime($month_start));
$first_day_of_week = (int)date('w', strtotime($month_start));
$month_name = date('F Y', strtotime($month_start));
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
            <a href="activity.php" class="active"><i class="fa fa-calendar-check"></i> Activity</a>
            <a href="report.php"><i class="fa fa-chart-line"></i> My Report</a>
            <a href="notifications.php"><i class="fa fa-bell"></i> Notifications</a>
            <a href="logout.php" style="margin-top:auto;color:#e07070;"><i class="fa fa-right-from-bracket"></i> Logout</a>
        </nav>
    </aside>

    <main class="main-content">
        <div class="page-header">
            <h1><i class="fa fa-calendar-check" style="color:var(--primary)"></i> Activity Calendar</h1>
        </div>

        <!-- Month Stats -->
        <div class="stat-cards" style="grid-template-columns:repeat(4,1fr)">
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(200,96,42,0.1);color:var(--primary);"><i class="fa fa-calendar"></i></div>
                <div><span class="stat-num"><?= $total_days ?></span><span class="stat-label">Active Days</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(212,165,71,0.15);color:var(--gold);"><i class="fa fa-utensils"></i></div>
                <div><span class="stat-num"><?= $total_meals ?></span><span class="stat-label">Total Meals</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(42,126,200,0.1);color:#2a7ec8;"><i class="fa fa-file-invoice"></i></div>
                <div><span class="stat-num">৳<?= number_format($total_amount,0) ?></span><span class="stat-label">Month Bill</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(46,158,91,0.1);color:#2e9e5b;"><i class="fa fa-check-circle"></i></div>
                <div><span class="stat-num">৳<?= number_format($total_paid_month,0) ?></span><span class="stat-label">Paid</span></div>
            </div>
        </div>

        <!-- Calendar -->
        <div class="card">
            <div class="card-header">
                <h3><i class="fa fa-calendar"></i> <?= $month_name ?></h3>
                <div style="display:flex;gap:8px;">
                    <a href="?month=<?= $month-1 ?>&year=<?= $year ?>" class="btn btn-sm btn-outline"><i class="fa fa-chevron-left"></i></a>
                    <a href="?month=<?= date('m') ?>&year=<?= date('Y') ?>" class="btn btn-sm btn-outline">Today</a>
                    <a href="?month=<?= $month+1 ?>&year=<?= $year ?>" class="btn btn-sm btn-outline"><i class="fa fa-chevron-right"></i></a>
                </div>
            </div>
            <div class="card-body">
                <!-- Legend -->
                <div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;font-size:13px;">
                    <span><span style="display:inline-block;width:12px;height:12px;background:rgba(200,96,42,0.2);border:2px solid var(--primary);border-radius:3px;"></span> Meal Ordered</span>
                    <span><span style="display:inline-block;width:12px;height:12px;background:rgba(46,158,91,0.15);border:2px solid #2e9e5b;border-radius:3px;"></span> Payment Made</span>
                    <span><span style="display:inline-block;width:12px;height:12px;background:var(--primary);border-radius:3px;"></span> Today</span>
                </div>

                <div class="calendar-grid">
                    <?php foreach (['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as $d): ?>
                        <div class="cal-day-name"><?= $d ?></div>
                    <?php endforeach; ?>

                    <?php for ($i = 0; $i < $first_day_of_week; $i++): ?>
                        <div class="cal-day empty"></div>
                    <?php endfor; ?>

                    <?php for ($d = 1; $d <= $days_in_month; $d++):
                        $date_str = sprintf('%04d-%02d-%02d', $year, $month, $d);
                        $has_order = isset($orders[$date_str]);
                        $has_payment = isset($payments[$date_str]);
                        $is_today = $date_str === date('Y-m-d');
                        $order = $has_order ? $orders[$date_str] : null;
                        $class = $is_today ? 'today' : ($has_order ? 'has-order' : '');
                        if ($has_payment) $class .= ' has-payment';
                    ?>
                    <div class="cal-day <?= $class ?>" title="<?= $has_order ? "B:{$order['breakfast']} L:{$order['lunch']} D:{$order['dinner']}" : '' ?>">
                        <span class="cal-date"><?= $d ?></span>
                        <?php if ($has_order): ?>
                        <div class="cal-dots">
                            <?= $order['breakfast'] ? '<span class="dot dot-b" title="Breakfast"></span>' : '' ?>
                            <?= $order['lunch']     ? '<span class="dot dot-l" title="Lunch"></span>'     : '' ?>
                            <?= $order['dinner']    ? '<span class="dot dot-d" title="Dinner"></span>'    : '' ?>
                        </div>
                        <?php endif; ?>
                        <?php if ($has_payment): ?>
                            <span class="cal-paid-mark">৳</span>
                        <?php endif; ?>
                    </div>
                    <?php endfor; ?>
                </div>
            </div>
        </div>

        <!-- Order Detail Table -->
        <div class="card">
            <div class="card-header"><h3><i class="fa fa-list"></i> Meal Details — <?= $month_name ?></h3></div>
            <div class="card-body">
                <?php if (empty($orders)): ?>
                    <div class="empty-state"><i class="fa fa-calendar-xmark"></i><p>No orders this month</p></div>
                <?php else: ?>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Date</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Total Meals</th><th>Amount</th></tr></thead>
                        <tbody>
                        <?php foreach ($orders as $date => $o):
                            $meals_count = $o['breakfast'] + $o['lunch'] + $o['dinner'];
                        ?>
                        <tr>
                            <td><?= date('d M Y', strtotime($date)) ?></td>
                            <td><?= $o['breakfast'] ? '<span class="badge badge-success">✓</span>' : '—' ?></td>
                            <td><?= $o['lunch']     ? '<span class="badge badge-success">✓</span>' : '—' ?></td>
                            <td><?= $o['dinner']    ? '<span class="badge badge-success">✓</span>' : '—' ?></td>
                            <td><strong><?= $meals_count ?> meal<?= $meals_count!=1?'s':'' ?></strong></td>
                            <td><strong>৳<?= number_format($o['total_amount'],2) ?></strong></td>
                        </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </main>
</div>

<?php include '../includes/footer.php'; ?>