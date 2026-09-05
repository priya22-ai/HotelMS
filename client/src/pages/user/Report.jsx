import { useEffect, useState } from 'react';
import api from '../../api.js';
import { UserSidebar } from '../../components/Sidebar.jsx';
import { Link } from 'react-router-dom';

export default function UserReport(){
  const [data, setData] = useState(null);
  useEffect(()=>{ api.get('/user/report').then(r=> setData(r.data)); },[]);

  if (!data) return <div className="dashboard-layout"><UserSidebar user={{}} /><main className="dashboard-main">Loading...</main></div>;

  const totalAll = Number(data.total_breakfast)+Number(data.total_lunch)+Number(data.total_dinner) || 1;
  const maxAmt = Math.max(...(data.monthly.map(m=>Number(m.amount))),1);

  return (
    <div className="dashboard-layout">
      <UserSidebar user={{category:'COZY'}} />
      <main className="dashboard-main">
        <h1 style={{fontFamily:'Playfair Display,serif', fontSize:28}}><i className="fa fa-chart-line" style={{color:'var(--primary)'}}></i> My Report</h1>

        <div className="stat-cards">
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(200,96,42,0.1)', color:'var(--primary)'}}><i className="fa fa-calendar"></i></div><div><div className="stat-num">{data.total_orders}</div><div className="stat-label">Total Order Days</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(212,165,71,0.15)', color:'var(--gold)'}}><i className="fa fa-utensils"></i></div><div><div className="stat-num">{totalAll===1?0: totalAll}</div><div className="stat-label">Total Meals</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(42,126,200,0.1)', color:'#2a7ec8'}}><i className="fa fa-file-invoice-dollar"></i></div><div><div className="stat-num">৳{Number(data.total_spent).toLocaleString()}</div><div className="stat-label">Total Bill</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(46,158,91,0.1)', color:'#2e9e5b'}}><i className="fa fa-check-circle"></i></div><div><div className="stat-num">৳{Number(data.total_paid).toLocaleString()}</div><div className="stat-label">Total Paid</div></div></div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3><i className="fa fa-pie-chart"></i> Meal Breakdown (All Time)</h3></div>
            <div className="card-body">
              {[
                {label:'☀️ Breakfast', count: Number(data.total_breakfast), color:'var(--gold)'},
                {label:'🌤️ Lunch', count: Number(data.total_lunch), color:'var(--primary)'},
                {label:'🌙 Dinner', count: Number(data.total_dinner), color:'var(--dark-3)'},
              ].map(bp=> {
                const pct = Math.round(bp.count/totalAll*100);
                return <div key={bp.label} style={{marginBottom:16}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6}}><span>{bp.label}</span><span><strong>{bp.count}</strong> meals ({pct}%)</span></div>
                  <div style={{height:10, background:'var(--light)', borderRadius:50, overflow:'hidden'}}><div style={{height:'100%', width: `${pct}%`, background: bp.color, borderRadius:50}}></div></div>
                </div>;
              })}
              {data.total_pending>0 && <div className="alert" style={{background:'rgba(212,165,71,0.12)', border:'1px solid rgba(212,165,71,0.3)', color:'var(--dark)', marginTop:20, borderRadius:'var(--radius-sm)', padding:14, display:'flex', gap:10, alignItems:'center'}}><i className="fa fa-exclamation-triangle" style={{color:'var(--gold)'}}></i><span>You have <strong>৳{Number(data.total_pending).toFixed(2)}</strong> pending. <Link to="/user/payments" style={{color:'var(--primary)'}}>Pay now →</Link></span></div>}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3><i className="fa fa-bar-chart"></i> Monthly Spending</h3></div>
            <div className="card-body">
              {data.monthly.length===0 ? <div className="empty-state"><i className="fa fa-chart-bar"></i><p>No data yet</p></div> : (
                <div style={{display:'flex', flexDirection:'column', gap:12}}>
                  {[...data.monthly].reverse().map(m=> {
                    const pct = Math.round(Number(m.amount)/maxAmt*100);
                    return <div key={m.month_key}>
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5}}><span>{m.month_label}</span><span><strong>৳{Number(m.amount).toLocaleString()}</strong> · {m.meals} meals</span></div>
                      <div style={{height:10, background:'var(--light)', borderRadius:50, overflow:'hidden'}}><div style={{height:'100%', width: `${pct}%`, background:'linear-gradient(90deg,var(--primary),var(--gold))', borderRadius:50}}></div></div>
                    </div>;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3><i className="fa fa-receipt"></i> Payment History</h3></div>
          <div className="card-body">
            {data.pay_history.length===0 ? <div className="empty-state"><i className="fa fa-receipt"></i><p>No payments yet. <Link to="/user/payments">Make first payment →</Link></p></div> : (
              <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Type</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>{data.pay_history.map(p=> <tr key={p.id}><td>{new Date(p.payment_date).toLocaleDateString()}</td><td><span className="badge badge-primary">{p.payment_type}</span></td><td>{p.payment_method}</td><td><strong>৳{Number(p.amount).toFixed(2)}</strong></td><td><span className={`badge badge-${p.status==='paid'?'success': p.status==='failed'?'danger':'warning'}`}>{p.status}</span></td></tr>)}</tbody></table></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
