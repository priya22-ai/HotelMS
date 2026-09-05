import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api.js';
import { AdminSidebar } from '../../components/Sidebar.jsx';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(()=> {
    api.get('/admin/dashboard').then(r=> setData(r.data)).catch(e=> {
      if (e.response?.status===401) navigate('/admin/login');
      else setErr(e.response?.data?.error || 'Failed to load');
    });
  },[]);

  if (err) return <div className="dashboard-layout"><AdminSidebar /><main className="dashboard-main"><div className="alert alert-danger">{err}</div></main></div>;
  if (!data) return <div className="dashboard-layout"><AdminSidebar /><main className="dashboard-main">Loading...</main></div>;

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-breadcrumb"><i className="fa fa-house"></i> Home › Dashboard &nbsp;|&nbsp; <span style={{color:'var(--primary)'}}>{new Date().toLocaleDateString('en-US',{weekday:'long', day:'numeric', month:'long', year:'numeric'})}</span></p>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon orange"><i className="fa fa-users"></i></div><div className="stat-info"><div className="stat-num">{data.total_users}</div><div className="stat-label">Total Users</div></div></div>
          <div className="stat-card"><div className="stat-icon gold"><i className="fa fa-bowl-food"></i></div><div className="stat-info"><div className="stat-num">{data.total_meals_today}</div><div className="stat-label">Meals Today</div></div></div>
          <div className="stat-card"><div className="stat-icon green"><i className="fa fa-bangladeshi-taka-sign"></i></div><div className="stat-info"><div className="stat-num">৳{Number(data.total_paid).toLocaleString()}</div><div className="stat-label">Total Collected</div></div></div>
          <div className="stat-card"><div className="stat-icon blue"><i className="fa fa-clock"></i></div><div className="stat-info"><div className="stat-num">{data.pending_payments}</div><div className="stat-label">Pending Payments</div></div></div>
        </div>

        <div className="card" style={{marginBottom:24}}>
          <div className="card-header"><span className="card-title"><i className="fa fa-sun" style={{color:'var(--gold)', marginRight:8}}></i>Today's Meal Orders</span><span style={{fontSize:13, color:'var(--mid)'}}>{new Date().toLocaleDateString()}</span></div>
          <div className="card-body">
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16}}>
              <div style={{background:'rgba(200,96,42,0.06)', borderRadius:'var(--radius)', padding:20, textAlign:'center', border:'1px solid rgba(200,96,42,0.15)'}}><i className="fa fa-coffee" style={{fontSize:28, color:'var(--primary)', marginBottom:10, display:'block'}}></i><div style={{fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:700}}>{data.breakfast_count}</div><div style={{fontSize:13, color:'var(--mid)'}}>Breakfast</div></div>
              <div style={{background:'rgba(212,165,71,0.06)', borderRadius:'var(--radius)', padding:20, textAlign:'center', border:'1px solid rgba(212,165,71,0.15)'}}><i className="fa fa-sun" style={{fontSize:28, color:'var(--gold)', marginBottom:10, display:'block'}}></i><div style={{fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:700}}>{data.lunch_count}</div><div style={{fontSize:13, color:'var(--mid)'}}>Lunch</div></div>
              <div style={{background:'rgba(46,158,91,0.06)', borderRadius:'var(--radius)', padding:20, textAlign:'center', border:'1px solid rgba(46,158,91,0.15)'}}><i className="fa fa-moon" style={{fontSize:28, color:'var(--success)', marginBottom:10, display:'block'}}></i><div style={{fontFamily:'Playfair Display,serif', fontSize:28, fontWeight:700}}>{data.dinner_count}</div><div style={{fontSize:13, color:'var(--mid)'}}>Dinner</div></div>
            </div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
          <div className="card">
            <div className="card-header"><span className="card-title"><i className="fa fa-users" style={{color:'var(--primary)', marginRight:8}}></i>Recent Users</span></div>
            <div className="card-body" style={{padding:0}}>
              <div className="table-wrapper"><table><thead><tr><th>Name</th><th>Type</th><th>Category</th><th>Status</th></tr></thead>
                <tbody>{data.recent_users.map(u=> <tr key={u.id}><td>{u.name}</td><td><span className="badge badge-info">{u.user_type}</span></td><td><span className="badge badge-gold">{u.category}</span></td><td><span className={`badge badge-${u.status==='active'?'success':'danger'}`}>{u.status}</span></td></tr>)}
                {data.recent_users.length===0 && <tr><td colSpan={4} style={{textAlign:'center', padding:20, color:'var(--mid)'}}>No users yet</td></tr>}
                </tbody></table></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title"><i className="fa fa-bell" style={{color:'var(--gold)', marginRight:8}}></i>Notifications</span></div>
            <div className="card-body">
              {data.notifications.length===0 ? <div style={{textAlign:'center', color:'var(--mid)', padding:20}}><i className="fa fa-bell-slash" style={{fontSize:28, display:'block', marginBottom:8}}></i>No notifications yet.</div> : data.notifications.map(n=> (
                <div key={n.id} className="notification-item"><div className="notif-icon"><i className="fa fa-bell"></i></div><div className="notif-body"><h4>{n.title}</h4><p>{n.message.slice(0,60)}...</p></div><span className="notif-time">{new Date(n.created_at).toLocaleDateString()}</span></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
