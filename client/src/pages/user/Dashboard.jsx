import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api.js';
import { UserSidebar } from '../../components/Sidebar.jsx';

export default function UserDashboard(){
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(()=> {
    api.get('/user/dashboard').then(r=> setData(r.data)).catch(e=>{
      if(e.response?.status===401) navigate('/user/login');
      else setErr('Failed to load dashboard');
    });
  },[]);

  if (err) return <div className="dashboard-layout"><UserSidebar user={{}} /><main className="dashboard-main"><div className="alert alert-danger">{err}</div></main></div>;
  if (!data) return <div className="dashboard-layout"><UserSidebar user={{}} /><main className="dashboard-main">Loading...</main></div>;

  const { user, today_order, total_meals, total_paid, total_pending, recent, notifications, timings } = data;

  return (
    <div className="dashboard-layout">
      <UserSidebar user={user} />
      <main className="dashboard-main">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
          <div>
            <h1 style={{fontFamily:'Playfair Display,serif', fontSize:28}}>Welcome, {user.name.split(' ')[0]}! 👋</h1>
            <p style={{color:'var(--mid)', fontSize:14}}>{new Date().toLocaleDateString('en-US',{weekday:'long', day:'numeric', month:'long', year:'numeric'})}</p>
          </div>
          <Link to="/user/meal-order" className="btn btn-primary"><i className="fa fa-plus"></i> Order Today's Meal</Link>
        </div>

        <div className="stat-cards">
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(200,96,42,0.1)', color:'var(--primary)'}}><i className="fa fa-utensils"></i></div><div><div className="stat-num">{total_meals}</div><div className="stat-label">Meals This Month</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(46,158,91,0.1)', color:'#2e9e5b'}}><i className="fa fa-check-circle"></i></div><div><div className="stat-num">৳{Number(total_paid).toLocaleString()}</div><div className="stat-label">Total Paid</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(212,165,71,0.15)', color:'var(--gold)'}}><i className="fa fa-clock"></i></div><div><div className="stat-num">৳{Number(total_pending).toLocaleString()}</div><div className="stat-label">Pending Payment</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(42,126,200,0.1)', color:'#2a7ec8'}}><i className="fa fa-crown"></i></div><div><div className="stat-num">{user.category}</div><div className="stat-label">My Category</div></div></div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3><i className="fa fa-sun"></i> Today's Meal Status</h3><Link to="/user/meal-order" className="btn btn-sm btn-primary">Manage</Link></div>
            <div className="card-body">
              {['breakfast','lunch','dinner'].map(key=> {
                const info = { breakfast:{icon:'☀️', label:'Breakfast'}, lunch:{icon:'🌤️', label:'Lunch'}, dinner:{icon:'🌙', label:'Dinner'} }[key];
                const ordered = today_order && Number(today_order[key])===1;
                const t = timings[key]||{};
                return (
                  <div key={key} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid rgba(200,96,42,0.08)'}}>
                    <span style={{fontSize:24}}>{info.icon}</span>
                    <div style={{flex:1}}><div style={{fontWeight:600}}>{info.label}</div><div style={{fontSize:12, color:'var(--mid)'}}>{t.start_time ? `${t.start_time.slice(0,5)} - ${t.end_time.slice(0,5)}` : '--'}</div></div>
                    <span className={`badge badge-${ordered?'success':'warning'}`} style={{background: ordered? 'rgba(46,158,91,0.12)': 'rgba(122,92,58,0.08)', color: ordered? 'var(--success)':'var(--mid)'}}>{ordered ? <><i className="fa fa-check"></i> Ordered</> : 'Not Set'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3><i className="fa fa-bell"></i> Notifications</h3><Link to="/user/notifications" className="btn btn-sm btn-outline">View All</Link></div>
            <div className="card-body">
              {notifications.length===0 ? <div className="empty-state"><i className="fa fa-bell-slash"></i><p>No notifications</p></div> : notifications.map(n=> (
                <div key={n.id} className={`notification-item ${n.is_read?'':'unread'}`} style={{marginBottom:10}}>
                  <div className="notif-icon"><i className={`fa fa-${n.type==='meal'?'utensils': n.type==='success'?'check':'info'}`}></i></div>
                  <div><div style={{fontWeight:600, fontSize:14}}>{n.title}</div><div style={{fontSize:13, color:'var(--mid)'}}>{n.message}</div><div style={{fontSize:11, color:'rgba(122,92,58,0.6)'}}>{new Date(n.created_at).toLocaleString()}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3><i className="fa fa-calendar-check"></i> Recent Meal Activity</h3><Link to="/user/activity" className="btn btn-sm btn-outline">Full Calendar</Link></div>
          <div className="card-body">
            {recent.length===0 ? <div className="empty-state"><i className="fa fa-calendar-xmark"></i><p>No meal orders yet. <Link to="/user/meal-order">Order now!</Link></p></div> : (
              <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>{recent.map(row=> <tr key={row.id}><td>{new Date(row.order_date).toLocaleDateString()}</td><td>{Number(row.breakfast)?<span className="badge badge-success">✓</span>:<span style={{color:'var(--mid)'}}>—</span>}</td><td>{Number(row.lunch)?<span className="badge badge-success">✓</span>:<span style={{color:'var(--mid)'}}>—</span>}</td><td>{Number(row.dinner)?<span className="badge badge-success">✓</span>:<span style={{color:'var(--mid)'}}>—</span>}</td><td><strong>৳{Number(row.total_amount).toFixed(2)}</strong></td><td><span className={`badge badge-${row.status==='confirmed'?'success':row.status==='cancelled'?'danger':'warning'}`}>{row.status}</span></td></tr>)}</tbody></table></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
