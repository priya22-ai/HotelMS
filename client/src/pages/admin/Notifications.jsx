import { useEffect, useState } from 'react';
import api from '../../api.js';
import { AdminSidebar } from '../../components/Sidebar.jsx';

export default function AdminNotifications(){
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title:'', message:'', target:'all' });
  const [msg, setMsg] = useState({error:'', success:''});

  const load = async ()=> {
    const r = await api.get('/admin/notifications');
    setList(r.data.notifications);
  };
  useEffect(()=>{ load(); },[]);

  const submit = async (e)=> {
    e.preventDefault();
    setMsg({error:'', success:''});
    try{
      await api.post('/admin/notifications', form);
      setMsg({success:'Notification sent!', error:''});
      setForm({title:'', message:'', target:'all'});
      load();
    }catch(err){ setMsg({error: err.response?.data?.error||'Failed', success:''}); }
  };
  const del = async (id)=> { if(!confirm('Delete?')) return; await api.delete(`/admin/notifications/${id}`); load(); };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Notifications</h1>
        <p className="page-breadcrumb"><i className="fa fa-house"></i> Admin › Notifications</p>
        {msg.error && <div className="alert alert-danger">{msg.error}</div>}
        {msg.success && <div className="alert alert-success">{msg.success}</div>}

        <div style={{display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:24}}>
          <div className="card">
            <div className="card-header"><span className="card-title">Send Notification</span></div>
            <div className="card-body">
              <form onSubmit={submit}>
                <div className="form-group" style={{marginBottom:16}}><label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} placeholder="Notification title" required /></div>
                <div className="form-group" style={{marginBottom:16}}><label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Message *</label><textarea rows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)', resize:'vertical'}} placeholder="Write your message..." required /></div>
                <div className="form-group" style={{marginBottom:20}}><label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Target</label>
                  <select value={form.target} onChange={e=>setForm({...form,target:e.target.value})} className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}}>
                    <option value="all">All Users</option><option value="student">Students</option><option value="employee">Employees</option><option value="guest">Guests</option><option value="cleaner">Cleaners</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:12}}><i className="fa fa-paper-plane"></i> Send Notification</button>
              </form>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">All Notifications</span></div>
            <div className="card-body">
              {list.map(n=> (
                <div key={n.id} className="notification-item" style={{marginBottom:12}}>
                  <div className="notif-icon"><i className="fa fa-bell"></i></div>
                  <div className="notif-body" style={{flex:1}}><h4>{n.title}</h4><p>{n.message}</p><div style={{display:'flex', gap:10, marginTop:6, flexWrap:'wrap'}}><span className="badge badge-info">{n.target}</span><span style={{fontSize:11, color:'var(--mid)'}}>{new Date(n.created_at).toLocaleString()}</span>{n.admin_name && <span style={{fontSize:11, color:'var(--mid)'}}>by {n.admin_name}</span>}</div></div>
                  <button onClick={()=>del(n.id)} className="btn btn-sm btn-danger"><i className="fa fa-trash"></i></button>
                </div>
              ))}
              {list.length===0 && <div style={{textAlign:'center', color:'var(--mid)', padding:30}}><i className="fa fa-bell-slash" style={{fontSize:36, display:'block', marginBottom:10, opacity:.3}}></i>No notifications yet</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
