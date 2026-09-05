import { useEffect, useState } from 'react';
import api from '../../api.js';
import { AdminSidebar } from '../../components/Sidebar.jsx';

export default function AdminPayments(){
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(),1).toISOString().slice(0,10));
  const [to, setTo] = useState(new Date().toISOString().slice(0,10));
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [payments, setPayments] = useState([]);

  const load = async ()=> {
    const r = await api.get(`/admin/payments?from=${from}&to=${to}&type=${type}&status=${status}`);
    setPayments(r.data.payments);
  };
  useEffect(()=>{ load(); },[]);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Payments</h1>
        <p className="page-breadcrumb"><i className="fa fa-house"></i> Admin › Payments</p>
        <div className="card" style={{marginBottom:20}}>
          <div className="card-body" style={{padding:'16px 20px'}}>
            <form onSubmit={e=>{e.preventDefault(); load();}} style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end'}}>
              <div><label style={{fontSize:12, color:'var(--mid)', display:'block', marginBottom:4}}>From</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{padding:'9px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif'}} /></div>
              <div><label style={{fontSize:12, color:'var(--mid)', display:'block', marginBottom:4}}>To</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{padding:'9px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif'}} /></div>
              <div><label style={{fontSize:12, color:'var(--mid)', display:'block', marginBottom:4}}>Type</label><select value={type} onChange={e=>setType(e.target.value)} style={{padding:'9px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif'}}><option value="">All</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
              <div><label style={{fontSize:12, color:'var(--mid)', display:'block', marginBottom:4}}>Status</label><select value={status} onChange={e=>setStatus(e.target.value)} style={{padding:'9px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif'}}><option value="">All</option><option value="paid">Paid</option><option value="pending">Pending</option></select></div>
              <button type="submit" className="btn btn-primary"><i className="fa fa-filter"></i> Filter</button>
            </form>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Payment Records ({payments.length})</span></div>
          <div className="card-body" style={{padding:0}}><div className="table-wrapper"><table><thead><tr><th>#</th><th>User</th><th>Amount</th><th>Type</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {payments.map((p,i)=> <tr key={p.id}><td>{i+1}</td><td><strong>{p.name}</strong><br /><small>{p.email}</small></td><td><strong style={{color:'var(--primary)'}}>৳{Number(p.amount).toFixed(2)}</strong></td><td><span className="badge badge-info">{p.payment_type}</span></td><td>{p.payment_method}</td><td>{new Date(p.payment_date).toLocaleDateString()}</td><td><span className={`badge badge-${p.status==='paid'?'success':'warning'}`}>{p.status}</span></td></tr>)}
              {payments.length===0 && <tr><td colSpan={7} style={{textAlign:'center', padding:30, color:'var(--mid)'}}>No payments found</td></tr>}
            </tbody></table></div></div>
        </div>
      </main>
    </div>
  );
}
