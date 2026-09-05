<?php
require_once '../includes/config.php';
if (!isUserLoggedIn()) redirect('user/login.php');
$page_title = 'Meal Order';
$base_path = '../';

$db = getDB();
$uid = (int)$_SESSION['user_id'];
$today = date('Y-m-d');
$category = $_SESSION['user_category'];

// Get pricing for this user's category
$prices = [];
$pq = $db->query("SELECT * FROM pricing WHERE category='".ucfirst(strtolower($category))."' OR category='$category'");
while ($p = $pq->fetch_assoc()) $prices[$p['meal_type']] = $p['price'];
if (empty($prices)) {
    $prices = ['breakfast'=>50,'lunch'=>80,'dinner'=>70];
}

// Get timings
$timings = [];
$tq = $db->query("SELECT * FROM meal_timings");
while ($t = $tq->fetch_assoc()) $timings[$t['meal_type']] = $t;

// Today's order
$oq = $db->query("SELECT * FROM meal_orders WHERE user_id=$uid AND order_date='$today' LIMIT 1");
$existing = $oq->num_rows ? $oq->fetch_assoc() : null;

$msg = $err = '';

// Handle Save
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $breakfast = isset($_POST['breakfast']) ? 1 : 0;
    $lunch     = isset($_POST['lunch'])     ? 1 : 0;
    $dinner    = isset($_POST['dinner'])    ? 1 : 0;
    $total = ($breakfast * ($prices['breakfast']??50)) + ($lunch * ($prices['lunch']??80)) + ($dinner * ($prices['dinner']??70));

    if ($existing) {
        $eid = (int)$existing['id'];
        $db->query("UPDATE meal_orders SET breakfast=$breakfast, lunch=$lunch, dinner=$dinner, total_amount=$total WHERE id=$eid");
        $msg = "Today's meal updated successfully!";
    } else {
        $db->query("INSERT INTO meal_orders (user_id,order_date,breakfast,lunch,dinner,total_amount,status) VALUES ($uid,'$today',$breakfast,$lunch,$dinner,$total,'confirmed')");
        $msg = "Meal order placed successfully!";
    }
    // Refresh
    $oq = $db->query("SELECT * FROM meal_orders WHERE user_id=$uid AND order_date='$today' LIMIT 1");
    $existing = $oq->num_rows ? $oq->fetch_assoc() : null;
}

$db->close();
include '../includes/header.php';
?>

<div class="dashboard-layout">
    <aside class="sidebar">
        <div class="sidebar-user">
            <div class="sidebar-avatar"><i class="fa fa-user"></i></div>
            <div>
                <div class="sidebar-name"><?= htmlspecialchars($_SESSION['user_name']) ?></div>
                <div class="sidebar-role">
                    <span class="badge-cat badge-<?= strtolower($category) ?>"><?= $category ?></span>
                </div>
            </div>
        </div>
        <nav class="sidebar-nav">
            <a href="dashboard.php"><i class="fa fa-gauge"></i> Dashboard</a>
            <a href="meal-order.php" class="active"><i class="fa fa-utensils"></i> Meal Order</a>
            <a href="payment.php"><i class="fa fa-credit-card"></i> Payment</a>
            <a href="activity.php"><i class="fa fa-calendar-check"></i> Activity</a>
            <a href="report.php"><i class="fa fa-chart-line"></i> My Report</a>
            <a href="notifications.php"><i class="fa fa-bell"></i> Notifications</a>
            <a href="logout.php" style="margin-top:auto;color:#e07070;"><i class="fa fa-right-from-bracket"></i> Logout</a>
        </nav>
    </aside>

    <main class="main-content">
        <div class="page-header">
            <div>
                <h1><i class="fa fa-utensils" style="color:var(--primary)"></i> Today's Meal Order</h1>
                <p style="color:var(--mid);font-size:14px;"><?= date('l, d F Y') ?></p>
            </div>
        </div>

        <?php if ($msg): ?><div class="alert alert-success"><i class="fa fa-check-circle"></i> <?= $msg ?></div><?php endif; ?>
        <?php if ($err): ?><div class="alert alert-danger"><i class="fa fa-circle-xmark"></i> <?= $err ?></div><?php endif; ?>

        <form method="POST">
            <div class="meal-order-grid">
                <?php
                $meal_info = [
                    'breakfast' => ['emoji'=>'☀️','label'=>'Breakfast','desc'=>'Morning meal to start your day'],
                    'lunch'     => ['emoji'=>'🌤️','label'=>'Lunch','desc'=>'Midday full course meal'],
                    'dinner'    => ['emoji'=>'🌙','label'=>'Dinner','desc'=>'Evening wholesome meal'],
                ];
                foreach ($meal_info as $key => $info):
                    $checked = $existing && $existing[$key] == 1;
                    $start = $timings[$key]['start_time'] ?? '';
                    $end   = $timings[$key]['end_time']   ?? '';
                    $price = $prices[$key] ?? 0;
                    $now = date('H:i:s');
                    $active = $start && $end && $now >= $start && $now <= $end;
                ?>
                <div class="meal-order-card <?= $checked ? 'selected' : '' ?>" onclick="toggleMeal('<?= $key ?>')">
                    <input type="checkbox" name="<?= $key ?>" id="<?= $key ?>" <?= $checked ? 'checked' : '' ?> style="display:none;">
                    <div class="meal-order-top">
                        <span class="meal-order-emoji"><?= $info['emoji'] ?></span>
                        <?php if ($active): ?>
                            <span class="badge badge-success" style="font-size:10px;"><i class="fa fa-circle" style="font-size:8px;"></i> OPEN NOW</span>
                        <?php endif; ?>
                    </div>
                    <h3><?= $info['label'] ?></h3>
                    <p><?= $info['desc'] ?></p>
                    <div class="meal-time-tag">
                        <i class="fa fa-clock"></i>
                        <?= $start ? date('h:i A',strtotime($start)).' – '.date('h:i A',strtotime($end)) : 'Time not set' ?>
                    </div>
                    <div class="meal-price-tag">৳<?= number_format($price,2) ?></div>
                    <div class="meal-check-icon" id="check_<?= $key ?>">
                        <?= $checked ? '<i class="fa fa-check-circle"></i>' : '<i class="fa fa-circle"></i>' ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <!-- Total Summary -->
            <div class="order-summary card">
                <div class="card-body">
                    <div class="order-total-row">
                        <span>Estimated Total Today:</span>
                        <strong id="total_display">৳<?= number_format(($existing['total_amount'] ?? 0), 2) ?></strong>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:16px;">
                        <i class="fa fa-save"></i> <?= $existing ? 'Update Meal Order' : 'Place Meal Order' ?>
                    </button>
                </div>
            </div>
        </form>
    </main>
</div>

<script>
const prices = {
    breakfast: <?= $prices['breakfast'] ?? 50 ?>,
    lunch: <?= $prices['lunch'] ?? 80 ?>,
    dinner: <?= $prices['dinner'] ?? 70 ?>
};

function toggleMeal(id) {
    const cb = document.getElementById(id);
    const card = cb.closest('.meal-order-card');
    const icon = document.getElementById('check_' + id);
    cb.checked = !cb.checked;
    card.classList.toggle('selected', cb.checked);
    icon.innerHTML = cb.checked ? '<i class="fa fa-check-circle"></i>' : '<i class="fa fa-circle"></i>';
    updateTotal();
}

function updateTotal() {
    let total = 0;
    ['breakfast','lunch','dinner'].forEach(m => {
        if (document.getElementById(m).checked) total += prices[m];
    });
    document.getElementById('total_display').textContent = '৳' + total.toFixed(2);
}
</script>

<?php include '../includes/footer.php'; ?>