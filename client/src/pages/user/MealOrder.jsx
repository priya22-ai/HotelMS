import { useEffect, useState } from 'react';
import api from '../../api.js';
import { UserSidebar } from '../../components/Sidebar.jsx';

export default function UserMealOrder(){
  const [data, setData] = useState(null);
  const [checks, setChecks] = useState({breakfast:false, lunch:false, dinner:false});
  const [msg, setMsg] = useState({error:'', success:''});
  const [user, setUser] = useState(null);

  const load = async ()=> {
    const r = await api.get('/user/meal-order');
    setData(r.data);
    const o = r.data.order;
    if (o) setChecks({ breakfast: !!Number(o.breakfast), lunch: !!Number(o.lunch), dinner: !!Number(o.dinner) });
    // also get user info for sidebar
    const s = await api.get('/user/dashboard');
    setUser(s.data.user);
  };
  useEffect(()=>{ load(); },[]);

  const toggle = (k)=> {
    setChecks(prev=> ({...prev, [k]: !prev[k]}));
  };

  const submit = async (e)=> {
    e.preventDefault();
    setMsg({error:'', success:''});
    try{
      const r = await api.post('/user/meal-order', checks);
      setMsg({success: r.data.message, error:''});
      load();
    }catch(err){ setMsg({error: err.response?.data?.error||'Failed', success:''}); }
  };

  if (!data) return <div className="dashboard-layout"><UserSidebar user={user} /><main className="dashboard-main">Loading...</main></div>;
  const { prices, timings, order } = data;
  const total = (checks.breakfast? Number(prices.breakfast):0) + (checks.lunch? Number(prices.lunch):0) + (checks.dinner? Number(prices.dinner):0);

  return (
    <div className="dashboard-layout">
      <UserSidebar user={user || {name:'User', category:'COZY'}} />
      <main className="dashboard-main">
        <div style={{marginBottom:24}}>
          <h1 style={{fontFamily:'Playfair Display,serif', fontSize:28}}><i className="fa fa-utensils" style={{color:'var(--primary)'}}></i> Today's Meal Order</h1>
          <p style={{color:'var(--mid)', fontSize:14}}>{new Date().toLocaleDateString('en-US',{weekday:'long', day:'numeric', month:'long', year:'numeric'})}</p>
        </div>
        {msg.success && <div className="alert alert-success"><i className="fa fa-check-circle"></i> {msg.success}</div>}
        {msg.error && <div className="alert alert-danger">{msg.error}</div>}

        <form onSubmit={submit}>
          <div className="meal-order-grid">
            {[
              {key:'breakfast', emoji:'☀️', label:'Breakfast', desc:'Morning meal to start your day'},
              {key:'lunch', emoji:'🌤️', label:'Lunch', desc:'Midday full course meal'},
              {key:'dinner', emoji:'🌙', label:'Dinner', desc:'Evening wholesome meal'},
            ].map(info=> {
              const checked = checks[info.key];
              const t = timings[info.key]||{};
              const price = prices[info.key]||0;
              const now = new Date().toTimeString().slice(0,8);
              const active = t.start_time && t.end_time && now >= t.start_time && now <= t.end_time;
              return (
                <div key={info.key} className={`meal-order-card ${checked?'selected':''}`} onClick={()=>toggle(info.key)}>
                  <div className="meal-order-top"><span className="meal-order-emoji">{info.emoji}</span>{active && <span className="badge badge-success" style={{fontSize:10}}><i className="fa fa-circle" style={{fontSize:8}}></i> OPEN NOW</span>}</div>
                  <h3>{info.label}</h3>
                  <p style={{fontSize:13, color:'var(--mid)'}}>{info.desc}</p>
                  <div className="meal-time-tag"><i className="fa fa-clock"></i> {t.start_time ? `${String(t.start_time).slice(0,5)} – ${String(t.end_time).slice(0,5)}` : 'Time not set'}</div>
                  <div className="meal-price-tag">৳{Number(price).toFixed(2)}</div>
                  <div className="meal-check-icon">{checked ? <i className="fa fa-check-circle"></i> : <i className="fa fa-circle"></i>}</div>
                </div>
              );
            })}
          </div>
          <div className="card order-summary">
            <div className="card-body">
              <div className="order-total-row"><span>Estimated Total Today:</span><strong>৳{total.toFixed(2)}</strong></div>
              <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%', justifyContent:'center', marginTop:16}}><i className="fa fa-save"></i> {order ? 'Update Meal Order' : 'Place Meal Order'}</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
