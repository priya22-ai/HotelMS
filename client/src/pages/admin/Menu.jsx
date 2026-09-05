import { useEffect, useState } from 'react';
import api from '../../api.js';
import { AdminSidebar } from '../../components/Sidebar.jsx';

export default function AdminMenu() {
  const [menus, setMenus] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [form, setForm] = useState({ meal_type:'', menu_date:new Date().toISOString().slice(0,10), items:'', price:'50' });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState({error:'', success:''});

  const load = async (d=date) => {
    const r = await api.get(`/admin/menus?date=${d}`);
    setMenus(r.data.menus);
  };
  useEffect(()=>{ load(); },[]);

  const onDateFilter = (e) => { e.preventDefault(); load(date); };

  const submit = async (e)=> {
    e.preventDefault();
    setMsg({error:'', success:''});
    try {
      if (editing) {
        await api.put(`/admin/menus/${editing.id}`, form);
        setMsg({success:'Menu updated', error:''});
      } else {
        await api.post('/admin/menus', form);
        setMsg({success:'Menu added', error:''});
      }
      setEditing(null);
      setForm({ meal_type:'', menu_date: new Date().toISOString().slice(0,10), items:'', price:'50' });
      load(date);
    } catch(err){ setMsg({error: err.response?.data?.error || 'Failed', success:''}); }
  };

  const startEdit = (m)=> { setEditing(m); setForm({ meal_type:m.meal_type, menu_date:m.menu_date.slice(0,10), items:m.items, price:String(m.price) }); };
  const del = async (id)=> { if(!confirm('Delete this menu?')) return; await api.delete(`/admin/menus/${id}`); load(date); };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Manage Menu</h1>
        <p className="page-breadcrumb"><i className="fa fa-house"></i> Admin › Menu</p>
        {msg.error && <div className="alert alert-danger">{msg.error}</div>}
        {msg.success && <div className="alert alert-success">{msg.success}</div>}

        <div style={{display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:24}}>
          <div className="card">
            <div className="card-header"><span className="card-title">{editing?'Edit Menu':'Add Menu'}</span></div>
            <div className="card-body">
              <form onSubmit={submit}>
                <div className="form-group" style={{marginBottom:16}}>
                  <label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Meal Type *</label>
                  <select className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.meal_type} onChange={e=>setForm({...form, meal_type:e.target.value})} required>
                    <option value="">-- Select --</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div className="form-group" style={{marginBottom:16}}>
                  <label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Menu Date *</label>
                  <input type="date" className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.menu_date} onChange={e=>setForm({...form, menu_date:e.target.value})} required />
                </div>
                <div className="form-group" style={{marginBottom:16}}>
                  <label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Menu Items *</label>
                  <textarea rows={4} className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.items} onChange={e=>setForm({...form, items:e.target.value})} required placeholder="e.g. Paratha, Egg curry, Tea" />
                </div>
                <div className="form-group" style={{marginBottom:20}}>
                  <label style={{color:'var(--dark)', fontSize:13, fontWeight:600, display:'block', marginBottom:6}}>Price (৳) *</label>
                  <input type="number" step="0.01" className="form-control" style={{color:'var(--dark)', background:'var(--light)', border:'1px solid rgba(200,96,42,0.2)'}} value={form.price} onChange={e=>setForm({...form, price:e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:12}}><i className={`fa ${editing?'fa-save':'fa-plus'}`}></i> {editing?'Update Menu':'Add Menu'}</button>
                {editing && <button type="button" onClick={()=>{setEditing(null); setForm({ meal_type:'', menu_date:new Date().toISOString().slice(0,10), items:'', price:'50'})}} className="btn btn-outline" style={{width:'100%', justifyContent:'center', padding:12, marginTop:10, display:'flex'}}><i className="fa fa-times"></i> Cancel</button>}
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Menu List</span>
              <form onSubmit={onDateFilter} style={{display:'flex', gap:8, alignItems:'center'}}>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:'7px 12px', borderRadius:8, border:'1px solid rgba(200,96,42,0.25)', fontFamily:'DM Sans,sans-serif', fontSize:13}} />
                <button type="submit" className="btn btn-sm btn-primary"><i className="fa fa-filter"></i> Filter</button>
              </form>
            </div>
            <div className="card-body" style={{padding:0}}>
              <div className="table-wrapper"><table><thead><tr><th>Meal</th><th>Date</th><th>Items</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  {menus.map(m=> (
                    <tr key={m.id}>
                      <td><span style={{fontSize:18}}>{m.meal_type==='breakfast'?'☕':m.meal_type==='lunch'?'🌤️':'🌙'}</span> <span className="badge badge-info">{m.meal_type}</span></td>
                      <td>{new Date(m.menu_date).toLocaleDateString()}</td>
                      <td style={{maxWidth:180, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={m.items}>{m.items}</td>
                      <td><strong>৳{Number(m.price).toFixed(0)}</strong></td>
                      <td><button onClick={()=>startEdit(m)} className="btn btn-sm btn-gold" style={{marginRight:6}}><i className="fa fa-edit"></i></button><button onClick={()=>del(m.id)} className="btn btn-sm btn-danger"><i className="fa fa-trash"></i></button></td>
                    </tr>
                  ))}
                  {menus.length===0 && <tr><td colSpan={5} style={{textAlign:'center', padding:30, color:'var(--mid)'}}><i className="fa fa-plate-wheat" style={{fontSize:28, display:'block', marginBottom:8, opacity:.4}}></i>No menus for {new Date(date).toLocaleDateString()}</td></tr>}
                </tbody></table></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
