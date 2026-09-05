<?php
require_once '../includes/config.php';
if (!isAdminLoggedIn()) redirect('login.php');
$page_title = 'Settings';
$base_path = '../';
$db = getDB();
$success = $error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $keys = ['site_name','currency','breakfast_price','lunch_price','dinner_price'];
    foreach($keys as $k) {
        if (isset($_POST[$k])) {
            $val = $db->real_escape_string(clean($_POST[$k]));
            $key = $db->real_escape_string($k);
            $db->query("INSERT INTO settings (setting_key,setting_value) VALUES ('$key','$val') ON DUPLICATE KEY UPDATE setting_value='$val'");
        }
    }
    $success = 'Settings saved!';
}

$settings = [];
$r = $db->query("SELECT * FROM settings");
while($row = $r->fetch_assoc()) $settings[$row['setting_key']] = $row['setting_value'];

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
            <li><a href="timings.php"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php" class="active"><i class="fa fa-gear"></i> Settings</a></li>
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>
    <main class="dashboard-main">
        <h1 class="page-title">Settings</h1>
        <p class="page-breadcrumb"><i class="fa fa-house"></i> Admin &rsaquo; Settings</p>
        <?php if ($success): ?><div class="alert alert-success"><i class="fa fa-check-circle"></i><?= $success ?></div><?php endif; ?>
        <div class="card" style="max-width:600px;">
            <div class="card-header"><span class="card-title"><i class="fa fa-gear" style="color:var(--primary);margin-right:8px;"></i>System Settings</span></div>
            <div class="card-body">
                <form method="POST">
                    <div class="form-group" style="margin-bottom:16px;">
                        <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Site Name</label>
                        <input type="text" name="site_name" value="<?= htmlspecialchars($settings['site_name'] ?? 'Meal Management System') ?>"
                            class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);">
                    </div>
                    <div class="form-group" style="margin-bottom:16px;">
                        <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Currency Symbol</label>
                        <input type="text" name="currency" value="<?= htmlspecialchars($settings['currency'] ?? 'BDT') ?>"
                            class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);">
                    </div>
                    <div style="background:var(--light);border-radius:var(--radius);padding:18px;margin-bottom:16px;">
                        <h4 style="font-family:'Playfair Display',serif;font-size:16px;margin-bottom:14px;">Meal Prices (৳)</h4>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                            <?php foreach(['breakfast'=>'☕ Breakfast','lunch'=>'🌤️ Lunch','dinner'=>'🌙 Dinner'] as $k=>$l): ?>
                            <div>
                                <label style="color:var(--dark);font-size:12px;font-weight:600;display:block;margin-bottom:6px;"><?= $l ?></label>
                                <input type="number" name="<?=$k?>_price" step="0.01" value="<?= $settings[$k.'_price'] ?? 50 ?>"
                                    style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;font-size:15px;">
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:13px;">
                        <i class="fa fa-save"></i> Save Settings
                    </button>
                </form>
            </div>
        </div>
    </main>
</div>
<?php $db->close(); include '../includes/footer.php'; ?>