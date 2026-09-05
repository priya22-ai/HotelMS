<?php
require_once '../includes/config.php';
if (!isAdminLoggedIn()) redirect('login.php');
$page_title = 'Payments';
$base_path = '../';
$db = getDB();

$from = clean($_GET['from'] ?? date('Y-m-01'));
$to   = clean($_GET['to']   ?? date('Y-m-d'));
$filter_type = clean($_GET['type'] ?? '');
$filter_status = clean($_GET['status'] ?? '');

$where = "WHERE p.payment_date BETWEEN '$from' AND '$to'";
if ($filter_type)   $where .= " AND p.payment_type='".$db->real_escape_string($filter_type)."'";
if ($filter_status) $where .= " AND p.status='".$db->real_escape_string($filter_status)."'";

$payments = $db->query("SELECT p.*, u.name, u.email, u.user_type FROM payments p JOIN users u ON p.user_id=u.id $where ORDER BY p.created_at DESC");

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
            <li><a href="payments.php" class="active"><i class="fa fa-money-bill"></i> Payments</a></li>
            <li><a href="timings.php"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php"><i class="fa fa-gear"></i> Settings</a></li>
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>
    <main class="dashboard-main">
        <h1 class="page-title">Payments</h1>
        <p class="page-breadcrumb"><i class="fa fa-house"></i> Admin &rsaquo; Payments</p>
        <div class="card" style="margin-bottom:20px;">
            <div class="card-body" style="padding:16px 20px;">
                <form method="GET" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
                    <div><label style="font-size:12px;color:var(--mid);display:block;margin-bottom:4px;">From</label>
                        <input type="date" name="from" value="<?= $from ?>" style="padding:9px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;"></div>
                    <div><label style="font-size:12px;color:var(--mid);display:block;margin-bottom:4px;">To</label>
                        <input type="date" name="to" value="<?= $to ?>" style="padding:9px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;"></div>
                    <div><label style="font-size:12px;color:var(--mid);display:block;margin-bottom:4px;">Type</label>
                        <select name="type" style="padding:9px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;">
                            <option value="">All</option>
                            <option value="daily" <?=$filter_type==='daily'?'selected':''?>>Daily</option>
                            <option value="weekly" <?=$filter_type==='weekly'?'selected':''?>>Weekly</option>
                            <option value="monthly" <?=$filter_type==='monthly'?'selected':''?>>Monthly</option>
                        </select></div>
                    <div><label style="font-size:12px;color:var(--mid);display:block;margin-bottom:4px;">Status</label>
                        <select name="status" style="padding:9px 14px;border-radius:8px;border:1px solid rgba(200,96,42,0.2);font-family:'DM Sans',sans-serif;">
                            <option value="">All</option>
                            <option value="paid" <?=$filter_status==='paid'?'selected':''?>>Paid</option>
                            <option value="pending" <?=$filter_status==='pending'?'selected':''?>>Pending</option>
                        </select></div>
                    <button type="submit" class="btn btn-primary"><i class="fa fa-filter"></i> Filter</button>
                </form>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><span class="card-title">Payment Records (<?= $payments->num_rows ?>)</span></div>
            <div class="card-body" style="padding:0;">
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>#</th><th>User</th><th>Amount</th><th>Type</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
                        <tbody>
                        <?php if ($payments->num_rows > 0): $i=1; while($p=$payments->fetch_assoc()): ?>
                        <tr>
                            <td><?= $i++ ?></td>
                            <td><strong><?= htmlspecialchars($p['name']) ?></strong><br><small><?= htmlspecialchars($p['email']) ?></small></td>
                            <td><strong style="color:var(--primary);">৳<?= number_format($p['amount'],2) ?></strong></td>
                            <td><span class="badge badge-info"><?= ucfirst($p['payment_type']) ?></span></td>
                            <td><?= ucfirst($p['payment_method']) ?></td>
                            <td><?= date('d M Y', strtotime($p['payment_date'])) ?></td>
                            <td><span class="badge badge-<?= $p['status']==='paid'?'success':'warning' ?>"><?= ucfirst($p['status']) ?></span></td>
                        </tr>
                        <?php endwhile; else: ?>
                        <tr><td colspan="7" style="text-align:center;padding:30px;color:var(--mid);">No payments found</td></tr>
                        <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>
<?php $db->close(); include '../includes/footer.php'; ?>