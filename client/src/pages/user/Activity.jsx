import { useEffect, useState } from 'react';
import api from '../../api.js';
import { UserSidebar } from '../../components/Sidebar.jsx';
import { Link } from 'react-router-dom';

export default function UserActivity(){
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [year, setYear] = useState(new Date().getFullYear());

  const load = async (m=month, y=year)=> {
    const r = await api.get(`/user/activity?month=${m}&year=${y}`);
    setData(r.data); setMonth(r.data.month); setYear(r.data.year);
  };
  useEffect(()=>{ load(); },[]);

  if (!data) return <div className="dashboard-layout"><UserSidebar user={{}} /><main className="dashboard-main">Loading...</main></div>;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month-1, 1).getDay();
  const monthName = new Date(year, month-1,1).toLocaleDateString('en-US',{month:'long', year:'numeric'});
  const todayStr = new Date().toISOString().slice(0,10);

  return (
    <div className="dashboard-layout">
      <UserSidebar user={{category:'COZY'}} />
      <main className="dashboard-main">
        <h1 style={{fontFamily:'Playfair Display,serif', fontSize:28}}><i className="fa fa-calendar-check" style={{color:'var(--primary)'}}></i> Activity Calendar</h1>

        <div className="stat-cards" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(200,96,42,0.1)', color:'var(--primary)'}}><i className="fa fa-calendar"></i></div><div><div className="stat-num">{data.total_days}</div><div className="stat-label">Active Days</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(212,165,71,0.15)', color:'var(--gold)'}}><i className="fa fa-utensils"></i></div><div><div className="stat-num">{data.total_meals}</div><div className="stat-label">Total Meals</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(42,126,200,0.1)', color:'#2a7ec8'}}><i className="fa fa-file-invoice"></i></div><div><div className="stat-num">৳{Number(data.total_amount).toLocaleString()}</div><div className="stat-label">Month Bill</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{background:'rgba(46,158,91,0.1)', color:'#2e9e5b'}}><i className="fa fa-check-circle"></i></div><div><div className="stat-num">৳{Number(data.total_paid_month).toLocaleString()}</div><div className="stat-label">Paid</div></div></div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><i className="fa fa-calendar"></i> {monthName}</h3>
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>load(month-1, year)} className="btn btn-sm btn-outline"><i className="fa fa-chevron-left"></i></button>
              <button onClick={()=>{ const n=new Date(); load(n.getMonth()+1, n.getFullYear());}} className="btn btn-sm btn-outline">Today</button>
              <button onClick={()=>load(month+1, year)} className="btn btn-sm btn-outline"><i className="fa fa-chevron-right"></i></button>
            </div>
          </div>
          <div className="card-body">
            <div style={{display:'flex', gap:16, marginBottom:20, flexWrap:'wrap', fontSize:13}}>
              <span><span style={{display:'inline-block', width:12, height:12, background:'rgba(200,96,42,0.2)', border:'2px solid var(--primary)', borderRadius:3}}></span> Meal Ordered</span>
              <span><span style={{display:'inline-block', width:12, height:12, background:'rgba(46,158,91,0.15)', border:'2px solid #2e9e5b', borderRadius:3}}></span> Payment Made</span>
              <span><span style={{display:'inline-block', width:12, height:12, background:'var(--primary)', borderRadius:3}}></span> Today</span>
            </div>
            <div className="calendar-grid">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d} className="cal-day-name">{d}</div>)}
              {Array.from({length:firstDow}).map((_,i)=> <div key={'e'+i} className="cal-day empty"></div>)}
              {Array.from({length:daysInMonth}, (_,i)=>{
                const d=i+1;
                const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const order = data.orders[dateStr];
                const hasPay = !!data.payments[dateStr];
                const isToday = dateStr===todayStr;
                const cls = isToday ? 'today' : (order ? 'has-order' : '');
                return (
                  <div key={d} className={`cal-day ${cls} ${hasPay?'has-payment':''}`} title={order? `B:${order.breakfast} L:${order.lunch} D:${order.dinner}` : ''}>
                    <span>{d}</span>
                    {order && <div className="cal-dots">
                      {Number(order.breakfast)?<span className="dot dot-b"></span>:null}
                      {Number(order.lunch)?<span className="dot dot-l"></span>:null}
                      {Number(order.dinner)?<span className="dot dot-d"></span>:null}
                    </div>}
                    {hasPay && <span className="cal-paid-mark">৳</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3><i className="fa fa-list"></i> Meal Details — {monthName}</h3></div>
          <div className="card-body">
            {Object.keys(data.orders).length===0 ? <div className="empty-state"><i className="fa fa-calendar-xmark"></i><p>No orders this month</p></div> : (
              <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Total Meals</th><th>Amount</th></tr></thead>
                <tbody>{Object.entries(data.orders).sort().map(([date,o])=> {
                  const c = Number(o.breakfast)+Number(o.lunch)+Number(o.dinner);
                  return <tr key={date}><td>{new Date(date).toLocaleDateString()}</td><td>{Number(o.breakfast)?<span className="badge badge-success">✓</span>:'—'}</td><td>{Number(o.lunch)?<span className="badge badge-success">✓</span>:'—'}</td><td>{Number(o.dinner)?<span className="badge badge-success">✓</span>:'—'}</td><td><strong>{c} meal{c!==1?'s':''}</strong></td><td><strong>৳{Number(o.total_amount).toFixed(2)}</strong></td></tr>;
                })}</tbody></table></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
