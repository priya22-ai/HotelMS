import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api.js';

export default function Header() {
  const [session, setSession] = useState({ admin: null, user: null });
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname.split('/').pop() || 'index';

  useEffect(() => {
    api.get('/session').then(r => setSession(r.data)).catch(()=>{});
  }, [location.pathname]);

  const logout = async () => {
    await api.post('/logout');
    setSession({ admin: null, user: null });
    navigate('/');
  };

  const isAdmin = !!session.admin;
  const isUser = !!session.user;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <div className="brand-icon"><i className="fa-solid fa-bowl-food"></i></div>
          <div className="brand-text">
            <span className="brand-name">MealMate</span>
            <span className="brand-sub">Management System</span>
          </div>
        </Link>

        <nav className="main-nav">
          <Link to="/" className={current === '' || current === 'index' ? 'active' : ''}><i className="fa fa-home"></i> Home</Link>
          {isAdmin && <>
            <Link to="/admin/dashboard"><i className="fa fa-gauge"></i> Dashboard</Link>
            <Link to="/admin/menu"><i className="fa fa-utensils"></i> Menu</Link>
            <Link to="/admin/users"><i className="fa fa-users"></i> Users</Link>
            <Link to="/admin/reports"><i className="fa fa-chart-bar"></i> Reports</Link>
            <Link to="/admin/settings"><i className="fa fa-gear"></i> Settings</Link>
          </>}
          {isUser && <>
            <Link to="/user/dashboard"><i className="fa fa-gauge"></i> My Meals</Link>
            <Link to="/user/meal-order"><i className="fa fa-utensils"></i> Order</Link>
            <Link to="/user/payments"><i className="fa fa-credit-card"></i> Payment</Link>
            <Link to="/user/activity"><i className="fa fa-calendar"></i> Activity</Link>
            <Link to="/user/report"><i className="fa fa-chart-line"></i> Report</Link>
          </>}
          {!isAdmin && !isUser && <>
            <Link to="/#about"><i className="fa fa-circle-info"></i> About</Link>
            <Link to="/#contact"><i className="fa fa-envelope"></i> Contact</Link>
          </>}
        </nav>

        <div className="header-actions">
          {isAdmin && <>
            <span className="user-badge admin-badge"><i className="fa fa-shield"></i> {session.admin.name}</span>
            <a onClick={logout} className="btn-logout" style={{cursor:'pointer'}}><i className="fa fa-right-from-bracket"></i> Logout</a>
          </>}
          {isUser && <>
            <span className="user-badge user-badge-profile"><i className="fa fa-user-circle"></i> {session.user.name}</span>
            <a onClick={logout} className="btn-logout" style={{cursor:'pointer'}}><i className="fa fa-right-from-bracket"></i> Logout</a>
          </>}
          {!isAdmin && !isUser && <Link to="/" className="btn-enter"><i className="fa fa-arrow-right-to-bracket"></i> Enter</Link>}
        </div>
      </div>
    </header>
  );
}
