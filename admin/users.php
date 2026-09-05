<?php
require_once '../includes/config.php';
if (!isAdminLoggedIn()) redirect('login.php');
$page_title = 'Manage Users';
$base_path = '../';

$db = getDB();
$success = $error = '';

// Toggle status
if (isset($_GET['toggle'])) {
    $uid = (int)$_GET['toggle'];
    $db->query("UPDATE users SET status=IF(status='active','inactive','active') WHERE id=$uid");
    $success = 'User status updated.';
}
// Delete
if (isset($_GET['delete'])) {
    $uid = (int)$_GET['delete'];
    $db->query("DELETE FROM users WHERE id=$uid");
    $success = 'User deleted.';
}

// Filter
$filter = clean($_GET['filter'] ?? '');
$search = clean($_GET['search'] ?? '');
$where = "WHERE 1=1";
if ($filter) $where .= " AND user_type='".$db->real_escape_string($filter)."'";
if ($search) $where .= " AND (name LIKE '%".$db->real_escape_string($search)."%' OR email LIKE '%".$db->real_escape_string($search)."%')";

$users = $db->query("SELECT * FROM users $where ORDER BY created_at DESC");

include '../includes/header.php';
?>
<div class="dashboard-layout">
    <aside class="sidebar">
        <p class="sidebar-section-title">Admin Panel</p>
        <ul class="sidebar-nav">
            <li><a href="dashboard.php"><i class="fa fa-gauge"></i> Dashboard</a></li>
            <li><a href="menu.php"><i class="fa fa-utensils"></i> Manage Menu</a></li>
            <li><a href="users.php" class="active"><i class="fa fa-users"></i> Users</a></li>
            <li><a href="notifications.php"><i class="fa fa-bell"></i> Notifications</a></li>
            <li><a href="reports.php"><i class="fa fa-chart-bar"></i> Reports</a></li>
            <li><a href="payments.php"><i class="fa fa-money-bill"></i> Payments</a></li>
            <li><a href="timings.php"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php"><i class="fa fa-gear"></i> Settings</a></li>
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>
    <main class="dashboard-main">
        <h1 class="page-title">Manage Users</h1>
        <p class="page-breadcrumb"><i class="fa fa-house"></i> Admin &rsaquo; Users</p>

        <?php if ($success): ?><div class="alert alert-success"><i class="fa fa-check-circle"></i><?= $success ?></div><?php endif; ?>

        <!-- Filter Bar -->
        <div class="card" style="margin-bottom:20px;">
            <div class="card-body" style="padding:16px 20px;">
                <form method="GET" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
                    <div>
                        <label style="font-size:12px;color:var(--mid);display:block;margin-bottom:4px;">Search</label>
                        <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" placeholder="Name or email..." style="padding:9px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;font-size:14px;min-width:220px;">
                    </div>
                    <div>
                        <label style="font-size:12px;color:var(--mid);display:block;margin-bottom:4px;">User Type</label>
                        <select name="filter" style="padding:9px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;font-size:14px;">
                            <option value="">All Types</option>
                            <?php foreach(['student','guest','cleaner','employee'] as $t): ?>
                            <option value="<?=$t?>" <?= $filter===$t?'selected':'' ?>><?= ucfirst($t) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fa fa-search"></i> Filter</button>
                    <a href="users.php" class="btn btn-outline"><i class="fa fa-rotate-right"></i> Reset</a>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <span class="card-title"><i class="fa fa-users" style="color:var(--primary);margin-right:8px;"></i>All Users (<?= $users->num_rows ?>)</span>
            </div>
            <div class="card-body" style="padding:0;">
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Category</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                        <tbody>
                        <?php if ($users->num_rows > 0): $i=1; while($u = $users->fetch_assoc()): ?>
                        <tr>
                            <td><?= $i++ ?></td>
                            <td><strong><?= htmlspecialchars($u['name']) ?></strong></td>
                            <td style="font-size:13px;"><?= htmlspecialchars($u['email']) ?></td>
                            <td><?= htmlspecialchars($u['phone'] ?: '—') ?></td>
                            <td><span class="badge badge-info"><?= ucfirst($u['user_type']) ?></span></td>
                            <td>
                                <span class="badge badge-<?= $u['category']==='VIP'?'danger':($u['category']==='Premium'?'gold':'primary') ?>">
                                    <?= $u['category'] ?>
                                </span>
                            </td>
                            <td>
                                <span class="badge badge-<?= $u['status']==='active'?'success':'danger' ?>">
                                    <?= ucfirst($u['status']) ?>
                                </span>
                            </td>
                            <td style="font-size:12px;"><?= date('d M Y', strtotime($u['created_at'])) ?></td>
                            <td>
                                <a href="users.php?toggle=<?= $u['id'] ?>" class="btn btn-sm <?= $u['status']==='active'?'btn-warning':'btn-success' ?>" style="background:<?= $u['status']==='active'?'var(--warning)':'var(--success)' ?>;color:white;" title="Toggle Status">
                                    <i class="fa fa-<?= $u['status']==='active'?'ban':'check' ?>"></i>
                                </a>
                                <a href="users.php?delete=<?= $u['id'] ?>" class="btn btn-sm btn-danger" onclick="return confirm('Delete this user?')" title="Delete">
                                    <i class="fa fa-trash"></i>
                                </a>
                            </td>
                        </tr>
                        <?php endwhile; else: ?>
                        <tr><td colspan="9" style="text-align:center;padding:30px;color:var(--mid);">No users found</td></tr>
                        <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>
<?php $db->close(); include '../includes/footer.php'; ?>