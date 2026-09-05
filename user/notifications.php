<?php
require_once '../includes/config.php';
if (!isAdminLoggedIn()) redirect('login.php');
$page_title = 'Notifications';
$base_path = '../';
$db = getDB();
$success = $error = '';

// Add notification
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title   = clean($_POST['title'] ?? '');
    $message = clean($_POST['message'] ?? '');
    $target  = clean($_POST['target'] ?? 'all');
    if (!$title || !$message) { $error = 'Title and message required.'; }
    else {
        $t = $db->real_escape_string($title);
        $m = $db->real_escape_string($message);
        $tg = $db->real_escape_string($target);
        $aid = (int)$_SESSION['admin_id'];
        $db->query("INSERT INTO notifications (title,message,target,created_by) VALUES ('$t','$m','$tg',$aid)");
        $success = 'Notification sent!';
    }
}
if (isset($_GET['delete'])) {
    $nid = (int)$_GET['delete'];
    $db->query("DELETE FROM notifications WHERE id=$nid");
    $success = 'Notification deleted.';
}

$notifications = $db->query("SELECT n.*, a.name as admin_name FROM notifications n LEFT JOIN admins a ON n.created_by=a.id ORDER BY n.created_at DESC");
include '../includes/header.php';
?>
<div class="dashboard-layout">
    <aside class="sidebar">
        <p class="sidebar-section-title">Admin Panel</p>
        <ul class="sidebar-nav">
            <li><a href="dashboard.php"><i class="fa fa-gauge"></i> Dashboard</a></li>
            <li><a href="menu.php"><i class="fa fa-utensils"></i> Manage Menu</a></li>
            <li><a href="users.php"><i class="fa fa-users"></i> Users</a></li>
            <li><a href="notifications.php" class="active"><i class="fa fa-bell"></i> Notifications</a></li>
            <li><a href="reports.php"><i class="fa fa-chart-bar"></i> Reports</a></li>
            <li><a href="payments.php"><i class="fa fa-money-bill"></i> Payments</a></li>
            <li><a href="timings.php"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php"><i class="fa fa-gear"></i> Settings</a></li>
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>
    <main class="dashboard-main">
        <h1 class="page-title">Notifications</h1>
        <p class="page-breadcrumb"><i class="fa fa-house"></i> Admin &rsaquo; Notifications</p>
        <?php if ($error): ?><div class="alert alert-danger"><i class="fa fa-circle-xmark"></i><?= $error ?></div><?php endif; ?>
        <?php if ($success): ?><div class="alert alert-success"><i class="fa fa-check-circle"></i><?= $success ?></div><?php endif; ?>

        <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:24px;">
            <div class="card">
                <div class="card-header"><span class="card-title">Send Notification</span></div>
                <div class="card-body">
                    <form method="POST">
                        <div class="form-group" style="margin-bottom:16px;">
                            <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Title *</label>
                            <input type="text" name="title" class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);" placeholder="Notification title">
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Message *</label>
                            <textarea name="message" rows="4" class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);resize:vertical;" placeholder="Write your message..."></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Target</label>
                            <select name="target" class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);">
                                <option value="all">All Users</option>
                                <option value="students">Students</option>
                                <option value="employees">Employees</option>
                                <option value="guests">Guests</option>
                                <option value="cleaners">Cleaners</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;">
                            <i class="fa fa-paper-plane"></i> Send Notification
                        </button>
                    </form>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">All Notifications</span></div>
                <div class="card-body">
                    <?php if ($notifications->num_rows > 0): while($n = $notifications->fetch_assoc()): ?>
                    <div class="notification-item" style="margin-bottom:12px;">
                        <div class="notif-icon"><i class="fa fa-bell"></i></div>
                        <div class="notif-body" style="flex:1;">
                            <h4><?= htmlspecialchars($n['title']) ?></h4>
                            <p><?= htmlspecialchars($n['message']) ?></p>
                            <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;">
                                <span class="badge badge-info"><?= ucfirst($n['target']) ?></span>
                                <span style="font-size:11px;color:var(--mid);"><?= date('d M Y H:i', strtotime($n['created_at'])) ?></span>
                            </div>
                        </div>
                        <a href="notifications.php?delete=<?= $n['id'] ?>" onclick="return confirm('Delete?')" class="btn btn-sm btn-danger"><i class="fa fa-trash"></i></a>
                    </div>
                    <?php endwhile; else: ?>
                    <div style="text-align:center;color:var(--mid);padding:30px;">
                        <i class="fa fa-bell-slash" style="font-size:36px;display:block;margin-bottom:10px;opacity:0.3;"></i>
                        No notifications yet
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>
</div>
<?php $db->close(); include '../includes/footer.php'; ?>