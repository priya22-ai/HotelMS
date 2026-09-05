<?php
require_once '../includes/config.php';
if (!isAdminLoggedIn()) redirect('login.php');
$page_title = 'Meal Timings';
$base_path = '../';
$db = getDB();
$success = $error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    foreach(['breakfast','lunch','dinner'] as $meal) {
        $start = clean($_POST[$meal.'_start'] ?? '');
        $end   = clean($_POST[$meal.'_end']   ?? '');
        if ($start && $end) {
            $ms = $db->real_escape_string($meal);
            $ss = $db->real_escape_string($start);
            $es = $db->real_escape_string($end);
            $db->query("UPDATE meal_timings SET start_time='$ss', end_time='$es' WHERE meal_type='$ms'");
        }
    }
    $success = 'Meal timings updated successfully!';
}

$timings = [];
$r = $db->query("SELECT * FROM meal_timings ORDER BY FIELD(meal_type,'breakfast','lunch','dinner')");
while ($row = $r->fetch_assoc()) $timings[$row['meal_type']] = $row;

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
            <li><a href="payments.php"><i class="fa fa-money-bill"></i> Payments</a></li>
            <li><a href="timings.php" class="active"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php"><i class="fa fa-gear"></i> Settings</a></li>
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>
    <main class="dashboard-main">
        <h1 class="page-title">Meal Timings</h1>
        <p class="page-breadcrumb"><i class="fa fa-house"></i> Admin &rsaquo; Timings</p>
        <?php if ($success): ?><div class="alert alert-success"><i class="fa fa-check-circle"></i><?= $success ?></div><?php endif; ?>
        <div class="card" style="max-width:600px;">
            <div class="card-header"><span class="card-title"><i class="fa fa-clock" style="color:var(--primary);margin-right:8px;"></i>Set Meal Times</span></div>
            <div class="card-body">
                <form method="POST">
                    <?php
                    $meal_info = ['breakfast'=>['icon'=>'☕','label'=>'Breakfast'],'lunch'=>['icon'=>'🌤️','label'=>'Lunch'],'dinner'=>['icon'=>'🌙','label'=>'Dinner']];
                    foreach($meal_info as $meal=>$info):
                    $t = $timings[$meal] ?? ['start_time'=>'','end_time'=>''];
                    ?>
                    <div style="background:var(--light);border-radius:var(--radius);padding:20px;margin-bottom:16px;border:1px solid rgba(200,96,42,0.1);">
                        <h4 style="font-family:'Playfair Display',serif;font-size:16px;margin-bottom:14px;">
                            <?= $info['icon'] ?> <?= $info['label'] ?>
                        </h4>
                        <div class="form-row">
                            <div>
                                <label style="color:var(--dark);font-size:12px;font-weight:600;display:block;margin-bottom:6px;">Start Time</label>
                                <input type="time" name="<?= $meal ?>_start" value="<?= substr($t['start_time'],0,5) ?>"
                                    style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;font-size:15px;">
                            </div>
                            <div>
                                <label style="color:var(--dark);font-size:12px;font-weight:600;display:block;margin-bottom:6px;">End Time</label>
                                <input type="time" name="<?= $meal ?>_end" value="<?= substr($t['end_time'],0,5) ?>"
                                    style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;font-size:15px;">
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:13px;">
                        <i class="fa fa-save"></i> Save Timings
                    </button>
                </form>
            </div>
        </div>
    </main>
</div>
<?php $db->close(); include '../includes/footer.php'; ?>