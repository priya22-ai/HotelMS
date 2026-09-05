import { Link, useLocation } from 'react-router-dom';

export function AdminSidebar() {
  const path = useLocation().pathname;
  const active = (p) => path === p ? 'active' : '';
  return (
    <aside className="sidebar">
      <p className="sidebar-section-title">Admin Panel</p>
      <ul className="sidebar-nav">
        <li><Link to="/admin/dashboard" className={active('/admin/dashboard')}><i className="fa fa-gauge"></i> Dashboard</Link></li>
        <li><Link to="/admin/menu" className={active('/admin/menu')}><i className="fa fa-utensils"></i> Manage Menu</Link></li>
        <li><Link to="/admin/users" className={active('/admin/users')}><i className="fa fa-users"></i> Users</Link></li>
        <li><Link to="/admin/notifications" className={active('/admin/notifications')}><i className="fa fa-bell"></i> Notifications</Link></li>
        <li><Link to="/admin/reports" className={active('/admin/reports')}><i className="fa fa-chart-bar"></i> Reports</Link></li>
        <li><Link to="/admin/payments" className={active('/admin/payments')}><i className="fa fa-money-bill"></i> Payments</Link></li>
        <li><Link to="/admin/timings" className={active('/admin/timings')}><i className="fa fa-clock"></i> Meal Timings</Link></li>
        <li><Link to="/admin/settings" className={active('/admin/settings')}><i className="fa fa-gear"></i> Settings</Link></li>
      </ul>
    </aside>
  );
}

export function UserSidebar({ user }) {
  const path = useLocation().pathname;
  const active = (p) => path === p ? 'active' : '';
  const category = user?.category || 'COZY';
  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="sidebar-avatar"><i className="fa fa-user"></i></div>
        <div>
          <div className="sidebar-name">{user?.name || 'User'}</div>
          <div className="sidebar-role">
            <span className={`badge-cat badge-${category.toLowerCase()}`}>{category}</span>
            <span style={{fontSize:11, opacity:.6}}>{user?.user_type || ''}</span>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link to="/user/dashboard" className={active('/user/dashboard')}><i className="fa fa-gauge"></i> Dashboard</Link>
        <Link to="/user/meal-order" className={active('/user/meal-order')}><i className="fa fa-utensils"></i> Meal Order</Link>
        <Link to="/user/payments" className={active('/user/payments')}><i className="fa fa-credit-card"></i> Payment</Link>
        <Link to="/user/activity" className={active('/user/activity')}><i className="fa fa-calendar-check"></i> Activity</Link>
        <Link to="/user/report" className={active('/user/report')}><i className="fa fa-chart-line"></i> My Report</Link>
        <Link to="/user/notifications" className={active('/user/notifications')}><i className="fa fa-bell"></i> Notifications</Link>
      </nav>
    </aside>
  );
}
