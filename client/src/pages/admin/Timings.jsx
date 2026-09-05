import { useEffect, useState } from 'react';
import api from '../../api.js';
import { AdminSidebar } from '../../components/Sidebar.jsx';

export default function AdminTimings(){
  const [timings, setTimings] = useState({breakfast:{start_time:'07:00', end_time:'09:30'}, lunch:{start_time:'12:00', end_time:'14:30'}, dinner:{start_time:'19:00', end_time:'21:30'}});
  const [msg, setMsg] = useState('');

  useEffect(()=>{ api.get('/admin/timings').then(r=>{
    const m={}; Object.entries(r.data.timings).forEach(([k,v])=> m[k]={start_time: v.start_time.slice(0,5), end_time: v.end_time.slice(0,5)});
    setTimings(prev=>({...prev, ...m}));
  }); },[]);

  const save = async (e)=> {
    e.preventDefault();
    await api.put('/admin/timings', {
      breakfast_start: timings.breakfast.start_time, breakfast_end: timings.breakfast.end_time,
      lunch_start: timings.lunch.start_time, lunch_end: timings.lunch.end_time,
      dinner_start: timings.dinner.start_time, dinner_end: timings.dinner.end_time,
    });
    setMsg('Meal timings updated successfully!');
    setTimeout(()=>setMsg(''),3000);
  };

  const set = (meal, key, val)=> setTimings(prev=> ({...prev, [meal]: {...prev[meal], [key]: val}}));

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Meal Timings</h1>
        <p className="page-breadcrumb"><i className="fa fa-house"></i> Admin › Timings</p>
        {msg && <div className="alert alert-success"><i className="fa fa-check-circle"></i> {msg}</div>}
        <div className="card" style={{maxWidth:600}}>
          <div className="card-header"><span className="card-title"><i className="fa fa-clock" style={{color:'var(--primary)', marginRight:8}}></i>Set Meal Times</span></div>
          <div className="card-body">
            <form onSubmit={save}>
              {[
                {k:'breakfast', label:'☕ Breakfast'},
                {k:'lunch', label:'🌤️ Lunch'},
                {k:'dinner', label:'🌙 Dinner'},
              ].map(({k,label})=> (
                <div key={k} style={{background:'var(--light)', borderRadius:'var(--radius)', padding:20, marginBottom:16, border:'1px solid rgba(200,96,42,0.1)'}}>
                  <h4 style={{fontFamily:'Playfair Display,serif', fontSize:16, marginBottom:14}}>{label}</h4>
                  <div className="form-row">
                    <div><label style={{color:'var(--dark)', fontSize:12, fontWeight:600, display:'block', marginBottom:6}}>Start Time</label><input type="time" value={timings[k].start_time} onChange={e=>set(k,'start_time',e.target.value)} style={{width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif', fontSize:15}} /></div>
                    <div><label style={{color:'var(--dark)', fontSize:12, fontWeight:600, display:'block', marginBottom:6}}>End Time</label><input type="time" value={timings[k].end_time} onChange={e=>set(k,'end_time',e.target.value)} style={{width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif', fontSize:15}} /></div>
                  </div>
                </div>
              ))}
              <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:13}}><i className="fa fa-save"></i> Save Timings</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
