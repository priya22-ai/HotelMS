import { useEffect, useState } from 'react';
import api from '../../api.js';
import { AdminSidebar } from '../../components/Sidebar.jsx';

export default function AdminSettings(){
  const [s, setS] = useState({ site_name:'MealMate', currency:'BDT', breakfast_price:'50', lunch_price:'80', dinner_price:'70' });
  const [msg, setMsg] = useState('');

  useEffect(()=>{ api.get('/admin/settings').then(r=> setS(prev=> ({...prev, ...r.data.settings}))); },[]);

  const save = async (e)=> {
    e.preventDefault();
    await api.put('/admin/settings', s);
    setMsg('Settings saved!'); setTimeout(()=>setMsg(''),3000);
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Settings</h1>
        <p className="page-breadcrumb"><i className="fa fa-house"></i> Admin › Settings</p>
        {msg && <div className="alert alert-success"><i className="fa fa-check-circle"></i> {msg}</div>}
        <div className="card" style={{maxWidth:600}}>
          <div className="card-header"><span className="card-title"><i className="fa fa-gear" style={{color:'var(--primary)', marginRight:8}}></i>System Settings</span></div>
          <div className="card-body">
            <form onSubmit={save}>
              <div className="form-group" style={{marginBottom:16}}>
                <label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Site Name</label>
                <input value={s.site_name} onChange={e=>setS({...s, site_name:e.target.value})} className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} />
              </div>
              <div className="form-group" style={{marginBottom:16}}>
                <label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Currency</label>
                <input value={s.currency} onChange={e=>setS({...s, currency:e.target.value})} className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} />
              </div>
              <div style={{background:'var(--light)', borderRadius:'var(--radius)', padding:18, marginBottom:16}}>
                <h4 style={{fontFamily:'Playfair Display,serif', fontSize:16, marginBottom:14}}>Meal Prices (৳)</h4>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
                  <div><label style={{fontSize:12, fontWeight:600, display:'block', marginBottom:6}}>☕ Breakfast</label><input type="number" value={s.breakfast_price} onChange={e=>setS({...s, breakfast_price:e.target.value})} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif', fontSize:15}} /></div>
                  <div><label style={{fontSize:12, fontWeight:600, display:'block', marginBottom:6}}>🌤️ Lunch</label><input type="number" value={s.lunch_price} onChange={e=>setS({...s, lunch_price:e.target.value})} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif', fontSize:15}} /></div>
                  <div><label style={{fontSize:12, fontWeight:600, display:'block', marginBottom:6}}>🌙 Dinner</label><input type="number" value={s.dinner_price} onChange={e=>setS({...s, dinner_price:e.target.value})} style={{width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif', fontSize:15}} /></div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:13}}><i className="fa fa-save"></i> Save Settings</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
