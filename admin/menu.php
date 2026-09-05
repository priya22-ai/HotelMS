<?php
require_once '../includes/config.php';
if (!isAdminLoggedIn()) redirect('login.php');
$page_title = 'Manage Menu';
$base_path = '../';

$db = getDB();
$error = $success = '';

// Handle Add/Edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action    = $_POST['action'] ?? '';
    $meal_type = clean($_POST['meal_type'] ?? '');
    $menu_date = clean($_POST['menu_date'] ?? '');
    $items     = clean($_POST['items'] ?? '');
    $price     = floatval($_POST['price'] ?? 0);

    if (!$meal_type || !$menu_date || !$items) {
        $error = 'All fields are required.';
    } else {
        $mt = $db->real_escape_string($meal_type);
        $md = $db->real_escape_string($menu_date);
        $it = $db->real_escape_string($items);
        $pr = $price;
        $aid = (int)$_SESSION['admin_id'];

        if ($action === 'add') {
            $db->query("INSERT INTO menus (meal_type,menu_date,items,price,created_by) VALUES ('$mt','$md','$it','$pr','$aid')");
            $success = 'Menu added successfully!';
        } elseif ($action === 'edit' && isset($_POST['menu_id'])) {
            $mid = (int)$_POST['menu_id'];
            $db->query("UPDATE menus SET meal_type='$mt',menu_date='$md',items='$it',price='$pr' WHERE id=$mid");
            $success = 'Menu updated successfully!';
        }
    }
}

// Handle Delete
if (isset($_GET['delete'])) {
    $mid = (int)$_GET['delete'];
    $db->query("DELETE FROM menus WHERE id=$mid");
    $success = 'Menu deleted.';
}

// Fetch menus
$filter_date = clean($_GET['date'] ?? date('Y-m-d'));
$menus = $db->query("SELECT * FROM menus WHERE menu_date='$filter_date' ORDER BY FIELD(meal_type,'breakfast','lunch','dinner')");

// Edit prefill
$edit_menu = null;
if (isset($_GET['edit'])) {
    $eid = (int)$_GET['edit'];
    $r = $db->query("SELECT * FROM menus WHERE id=$eid");
    if ($r->num_rows) $edit_menu = $r->fetch_assoc();
}

include '../includes/header.php';
?>

<div class="dashboard-layout">
    <aside class="sidebar">
        <p class="sidebar-section-title">Admin Panel</p>
        <ul class="sidebar-nav">
            <li><a href="dashboard.php"><i class="fa fa-gauge"></i> Dashboard</a></li>
            <li><a href="menu.php" class="active"><i class="fa fa-utensils"></i> Manage Menu</a></li>
            <li><a href="users.php"><i class="fa fa-users"></i> Users</a></li>
            <li><a href="notifications.php"><i class="fa fa-bell"></i> Notifications</a></li>
            <li><a href="reports.php"><i class="fa fa-chart-bar"></i> Reports</a></li>
            <li><a href="payments.php"><i class="fa fa-money-bill"></i> Payments</a></li>
            <li><a href="timings.php"><i class="fa fa-clock"></i> Meal Timings</a></li>
            <li><a href="settings.php"><i class="fa fa-gear"></i> Settings</a></li>
            <li><a href="logout.php"><i class="fa fa-right-from-bracket"></i> Logout</a></li>
        </ul>
    </aside>
    <main class="dashboard-main">
        <h1 class="page-title">Manage Menu</h1>
        <p class="page-breadcrumb"><i class="fa fa-house"></i> Admin &rsaquo; Menu</p>

        <?php if ($error): ?><div class="alert alert-danger"><i class="fa fa-circle-xmark"></i><?= $error ?></div><?php endif; ?>
        <?php if ($success): ?><div class="alert alert-success"><i class="fa fa-check-circle"></i><?= $success ?></div><?php endif; ?>

        <div style="display:grid;grid-template-columns:1fr 1.6fr;gap:24px;">
            <!-- Add/Edit Form -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title"><?= $edit_menu ? 'Edit Menu' : 'Add Menu' ?></span>
                </div>
                <div class="card-body">
                    <form method="POST">
                        <input type="hidden" name="action" value="<?= $edit_menu ? 'edit' : 'add' ?>">
                        <?php if ($edit_menu): ?><input type="hidden" name="menu_id" value="<?= $edit_menu['id'] ?>"><?php endif; ?>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Meal Type *</label>
                            <select name="meal_type" class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);">
                                <option value="">-- Select --</option>
                                <?php foreach(['breakfast'=>'Breakfast','lunch'=>'Lunch','dinner'=>'Dinner'] as $v=>$l): ?>
                                <option value="<?=$v?>" <?= ($edit_menu && $edit_menu['meal_type']==$v)?'selected':'' ?>><?=$l?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Menu Date *</label>
                            <input type="date" name="menu_date" value="<?= $edit_menu ? $edit_menu['menu_date'] : date('Y-m-d') ?>" class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);">
                        </div>
                        <div class="form-group" style="margin-bottom:16px;">
                            <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Menu Items *</label>
                            <textarea name="items" rows="4" class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);resize:vertical;" placeholder="e.g. Paratha, Egg curry, Tea"><?= $edit_menu ? htmlspecialchars($edit_menu['items']) : '' ?></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom:20px;">
                            <label style="color:var(--dark);font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Price (৳) *</label>
                            <input type="number" name="price" step="0.01" value="<?= $edit_menu ? $edit_menu['price'] : '50' ?>" class="form-control" style="color:var(--dark);background:var(--light);border:1px solid rgba(200,96,42,0.2);">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;padding:12px;">
                            <i class="fa <?= $edit_menu ? 'fa-save' : 'fa-plus' ?>"></i> <?= $edit_menu ? 'Update Menu' : 'Add Menu' ?>
                        </button>
                        <?php if ($edit_menu): ?>
                        <a href="menu.php" class="btn btn-outline" style="width:100%;justify-content:center;padding:12px;margin-top:10px;display:flex;">
                            <i class="fa fa-times"></i> Cancel
                        </a>
                        <?php endif; ?>
                    </form>
                </div>
            </div>

            <!-- Menu List -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Menu List</span>
                    <form method="GET" style="display:flex;gap:8px;align-items:center;">
                        <input type="date" name="date" value="<?= $filter_date ?>" style="padding:7px 12px;border-radius:8px;border:1px solid rgba(200,96,42,0.25);font-family:'DM Sans',sans-serif;font-size:13px;">
                        <button type="submit" class="btn btn-sm btn-primary"><i class="fa fa-filter"></i> Filter</button>
                    </form>
                </div>
                <div class="card-body" style="padding:0;">
                    <div class="table-wrapper">
                        <table>
                            <thead><tr><th>Meal</th><th>Date</th><th>Items</th><th>Price</th><th>Actions</th></tr></thead>
                            <tbody>
                            <?php
                            $meal_icons = ['breakfast'=>'☕','lunch'=>'🌤️','dinner'=>'🌙'];
                            if ($menus && $menus->num_rows > 0):
                            while ($m = $menus->fetch_assoc()):
                            ?>
                            <tr>
                                <td>
                                    <span style="font-size:18px;"><?= $meal_icons[$m['meal_type']] ?? '🍽️' ?></span>
                                    <span class="badge badge-<?= $m['meal_type']==='breakfast'?'warning':($m['meal_type']==='lunch'?'gold':'info') ?>">
                                        <?= ucfirst($m['meal_type']) ?>
                                    </span>
                                </td>
                                <td><?= date('d M Y', strtotime($m['menu_date'])) ?></td>
                                <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="<?= htmlspecialchars($m['items']) ?>">
                                    <?= htmlspecialchars($m['items']) ?>
                                </td>
                                <td><strong>৳<?= number_format($m['price'],0) ?></strong></td>
                                <td>
                                    <a href="menu.php?edit=<?= $m['id'] ?>" class="btn btn-sm btn-gold"><i class="fa fa-edit"></i></a>
                                    <a href="menu.php?delete=<?= $m['id'] ?>" class="btn btn-sm btn-danger" onclick="return confirm('Delete this menu?')"><i class="fa fa-trash"></i></a>
                                </td>
                            </tr>
                            <?php endwhile; else: ?>
                            <tr><td colspan="5" style="text-align:center;padding:30px;color:var(--mid);">
                                <i class="fa fa-plate-wheat" style="font-size:28px;display:block;margin-bottom:8px;opacity:0.4;"></i>
                                No menus for <?= date('d M Y', strtotime($filter_date)) ?>
                            </td></tr>
                            <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<?php $db->close(); include '../includes/footer.php'; ?>