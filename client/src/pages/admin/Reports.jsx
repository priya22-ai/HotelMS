import { useEffect, useState } from 'react';
import api from '../../api.js';
import { AdminSidebar } from '../../components/Sidebar.jsx';

export default function AdminReports(){
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(),1).toISOString().slice(0,10));
  const [to, setTo] = useState(new Date().toISOString().slice(0,10));
  const [data, setData] = useState(null);

  const load = async ()=> {
    const r = await api.get(`/admin/reports?from=${from}&to=${to}`);
    setData(r.data);
  };
  useEffect(()=>{ load(); },[]);

  const totals = { daily:0, weekly:0, monthly:0 };
  if (data) data.breakdown.forEach(b=> totals[b.payment_type]= Number(b.total));

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Reports</h1>
        <p className="page-breadcrumb"><i className="fa fa-house"></i> Admin › Reports</p>

        <div className="card" style={{marginBottom:24}}>
          <div className="card-body" style={{padding:'16px 20px'}}>
            <form onSubmit={e=>{e.preventDefault(); load();}} style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end'}}>
              <div><label style={{fontSize:12, color:'var(--mid)', display:'block', marginBottom:4}}>From</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{padding:'9px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif'}} /></div>
              <div><label style={{fontSize:12, color:'var(--mid)', display:'block', marginBottom:4}}>To</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{padding:'9px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif'}} /></div>
              <button type="submit" className="btn btn-primary"><i className="fa fa-chart-bar"></i> Generate Report</button>
            </form>
          </div>
        </div>

        {data && <>
          <div className="stats-grid" style={{marginBottom:24}}>
            {[
              {label:'Daily Payments', val: totals.daily, icon:'fa-calendar-day', color:'orange'},
              {label:'Weekly Payments', val: totals.weekly, icon:'fa-calendar-week', color:'gold'},
              {label:'Monthly Payments', val: totals.monthly, icon:'fa-calendar', color:'green'},
            ].map(c=> (
              <div key={c.label} className="stat-card"><div className={`stat-icon ${c.color}`}><i className={`fa ${c.icon}`}></i></div><div className="stat-info"><div className="stat-num">৳{Number(c.val).toLocaleString()}</div><div className="stat-label">{c.label}</div></div></div>
            ))}
          </div>

          <div className="card" style={{marginBottom:24}}>
            <div className="card-header"><span className="card-title">Monthly Revenue ({new Date().getFullYear()})</span></div>
            <div className="card-body">
              {data.chart_data.length===0 ? <div style={{color:'var(--mid)', fontSize:13, textAlign:'center', width:'100%'}}>No data for this year</div> : (
                <div style={{display:'flex', gap:8, alignItems:'flex-end', height:150}}>
                  {data.chart_data.map((d,i)=> {
                    const max = Math.max(...data.chart_data.map(x=>x.value),1);
                    return <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                      <div style={{fontSize:11, color:'#7a5c3a', fontWeight:600}}>{d.value>0? d.label_val:''}</div>
                      <div className="chart-bar" style={{width:'100%', height: Math.max((d.value/max)*120,4)}} title={d.value}></div>
                      <div style={{fontSize:10, color:'#7a5c3a'}}>{d.label}</div>
                    </div>;
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
            <div className="card">
              <div className="card-header"><span className="card-title" style={{color:'var(--success)'}}>✅ Who Paid</span></div>
              <div className="card-body" style={{padding:0}}><div className="table-wrapper"><table><thead><tr><th>Name</th><th>Type</th><th>Payments</th><th>Total</th></tr></thead>
                <tbody>{data.paid_users.map((r,i)=> <tr key={i}><td><strong>{r.name}</strong><br /><small style={{color:'var(--mid)'}}>{r.email}</small></td><td><span className="badge badge-info">{r.user_type}</span></td><td>{r.payment_count}x</td><td><strong style={{color:'var(--success)'}}>৳{Number(r.total_paid).toLocaleString()}</strong></td></tr>)}
                {data.paid_users.length===0 && <tr><td colSpan={4} style={{textAlign:'center', padding:20, color:'var(--mid)'}}>No payments in this period</td></tr>}
                </tbody></table></div></div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title" style={{color:'var(--danger)'}}>❌ Pending Payment</span></div>
              <div className="card-body" style={{padding:0}}><div className="table-wrapper"><table><thead><tr><th>Name</th><th>Type</th><th>Meals</th></tr></thead>
                <tbody>{data.unpaid_users.map((r,i)=> <tr key={i}><td><strong>{r.name}</strong><br /><small style={{color:'var(--mid)'}}>{r.email}</small></td><td><span className="badge badge-info">{r.user_type}</span></td><td><span className="badge badge-danger">{r.meal_count} meals</span></td></tr>)}
                {data.unpaid_users.length===0 && <tr><td colSpan={3} style={{textAlign:'center', padding:20, color:'var(--success)'}}>All users have paid! 🎉</td></tr>}
                </tbody></table></div></div>
            </div>
          </div>
        </>}
      </main>
    </div>
  );
}
