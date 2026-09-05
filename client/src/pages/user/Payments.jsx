import { useEffect, useState } from 'react';
import api from '../../api.js';
import { UserSidebar } from '../../components/Sidebar.jsx';

export default function UserPayments(){
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ amount:'', payment_type:'monthly', payment_method:'cash', payment_date: new Date().toISOString().slice(0,10), note:'' });
  const [msg, setMsg] = useState({error:'', success:''});
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(),1).toISOString().slice(0,10));
  const [to, setTo] = useState(new Date().toISOString().slice(0,10));

  const load = async ()=> {
    const r = await api.get(`/user/payments?from=${from}&to=${to}`);
    setPayments(r.data.payments);
  };
  useEffect(()=>{ load(); },[]);

  const submit = async (e)=> {
    e.preventDefault();
    setMsg({error:'', success:''});
    try{
      const r = await api.post('/user/payments', form);
      setMsg({success: 'Payment submitted (pending)', error:''});
      setForm(prev=> ({...prev, amount:'', note:''}));
      load();
    }catch(err){ setMsg({error: err.response?.data?.error||'Failed', success:''}); }
  };

  return (
    <div className="dashboard-layout">
      <UserSidebar user={{category:'COZY'}} />
      <main className="dashboard-main">
        <h1 style={{fontFamily:'Playfair Display,serif', fontSize:28}}><i className="fa fa-credit-card" style={{color:'var(--primary)'}}></i> Payments</h1>
        {msg.error && <div className="alert alert-danger">{msg.error}</div>}
        {msg.success && <div className="alert alert-success">{msg.success}</div>}

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
          <div className="card">
            <div className="card-header"><span className="card-title">Make Payment</span></div>
            <div className="card-body">
              <form onSubmit={submit}>
                <div className="form-group" style={{marginBottom:12}}><label>Amount (৳) *</label><input type="number" step="0.01" className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Type</label><select className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.payment_type} onChange={e=>setForm({...form, payment_type:e.target.value})}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
                  <div className="form-group"><label>Method</label><select className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.payment_method} onChange={e=>setForm({...form, payment_method:e.target.value})}><option value="cash">Cash</option><option value="bkash">bKash</option><option value="nagad">Nagad</option><option value="card">Card</option></select></div>
                </div>
                <div className="form-group" style={{marginBottom:12}}><label>Date</label><input type="date" className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.payment_date} onChange={e=>setForm({...form, payment_date:e.target.value})} /></div>
                <div className="form-group" style={{marginBottom:12}}><label>Note</label><input className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.note} onChange={e=>setForm({...form, note:e.target.value})} placeholder="Optional" /></div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:12}}><i className="fa fa-paper-plane"></i> Submit Payment</button>
              </form>
              <div style={{display:'flex', gap:8, marginTop:14}}>
                <button type="button" onClick={()=>setForm({...form, payment_method:'bkash'})} className={`pay-method ${form.payment_method==='bkash'?'active':''}`} style={{flex:1, padding:10, borderRadius:8, border:'2px solid rgba(200,96,42,0.15)', textAlign:'center', cursor:'pointer'}}><i className="fa fa-mobile"></i> bKash</button>
                <button type="button" onClick={()=>setForm({...form, payment_method:'nagad'})} className={`pay-method ${form.payment_method==='nagad'?'active':''}`} style={{flex:1, padding:10, borderRadius:8, border:'2px solid rgba(200,96,42,0.15)', textAlign:'center', cursor:'pointer'}}><i className="fa fa-wallet"></i> Nagad</button>
                <button type="button" onClick={()=>setForm({...form, payment_method:'cash'})} className={`pay-method ${form.payment_method==='cash'?'active':''}`} style={{flex:1, padding:10, borderRadius:8, border:'2px solid rgba(200,96,42,0.15)', textAlign:'center', cursor:'pointer'}}><i className="fa fa-money-bill"></i> Cash</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">My Payments</span>
              <form onSubmit={e=>{e.preventDefault(); load();}} style={{display:'flex', gap:8, alignItems:'center'}}>
                <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{padding:'6px 10px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontSize:12}} />
                <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{padding:'6px 10px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontSize:12}} />
                <button type="submit" className="btn btn-sm btn-primary"><i className="fa fa-filter"></i></button>
              </form>
            </div>
            <div className="card-body" style={{padding:0}}>
              <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Type</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {payments.map(p=> <tr key={p.id}><td>{new Date(p.payment_date).toLocaleDateString()}</td><td><span className="badge badge-info">{p.payment_type}</span></td><td>{p.payment_method}</td><td><strong>৳{Number(p.amount).toFixed(2)}</strong></td><td><span className={`badge badge-${p.status==='paid'?'success': p.status==='failed'?'danger':'warning'}`}>{p.status}</span></td></tr>)}
                  {payments.length===0 && <tr><td colSpan={5} style={{textAlign:'center', padding:20, color:'var(--mid)'}}>No payments in this period</td></tr>}
                </tbody></table></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
