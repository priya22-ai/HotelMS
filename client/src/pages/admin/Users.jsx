import { useEffect, useState } from 'react';
import api from '../../api.js';
import { AdminSidebar } from '../../components/Sidebar.jsx';

export default function AdminUsers(){
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');

  const load = async ()=> {
    const r = await api.get(`/admin/users?search=${encodeURIComponent(search)}&filter=${encodeURIComponent(filter)}`);
    setUsers(r.data.users);
  };
  useEffect(()=>{ load(); },[]);

  const toggle = async (id)=> { await api.patch(`/admin/users/${id}/toggle`); setMsg('Status toggled'); load(); };
  const del = async (id)=> { if(!confirm('Delete this user?')) return; await api.delete(`/admin/users/${id}`); setMsg('User deleted'); load(); };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-breadcrumb"><i className="fa fa-house"></i> Admin › Users</p>
        {msg && <div className="alert alert-success">{msg}</div>}
        <div className="card" style={{marginBottom:20}}>
          <div className="card-body" style={{padding:'16px 20px'}}>
            <form onSubmit={e=>{e.preventDefault(); load();}} style={{display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end'}}>
              <div><label style={{fontSize:12, color:'var(--mid)', display:'block', marginBottom:4}}>Search</label><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name or email..." style={{padding:'9px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif', fontSize:14, minWidth:220}} /></div>
              <div><label style={{fontSize:12, color:'var(--mid)', display:'block', marginBottom:4}}>User Type</label>
                <select value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:'9px 14px', borderRadius:8, border:'1px solid rgba(200,96,42,0.2)', fontFamily:'DM Sans,sans-serif', fontSize:14}}>
                  <option value="">All Types</option>
                  <option value="student">Student</option><option value="guest">Guest</option><option value="cleaner">Cleaner</option><option value="employee">Employee</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary"><i className="fa fa-search"></i> Filter</button>
              <button type="button" onClick={()=>{setSearch(''); setFilter(''); setTimeout(load,0);}} className="btn btn-outline"><i className="fa fa-rotate-right"></i> Reset</button>
            </form>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title"><i className="fa fa-users" style={{color:'var(--primary)', marginRight:8}}></i>All Users ({users.length})</span></div>
          <div className="card-body" style={{padding:0}}>
            <div className="table-wrapper"><table><thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Category</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u,i)=> <tr key={u.id}><td>{i+1}</td><td><strong>{u.name}</strong></td><td style={{fontSize:13}}>{u.email}</td><td>{u.phone||'—'}</td><td><span className="badge badge-info">{u.user_type}</span></td>
                  <td><span className={`badge badge-${u.category==='VIP'?'danger':u.category==='Premium'?'gold':'primary'}`}>{u.category}</span></td>
                  <td><span className={`badge badge-${u.status==='active'?'success':'danger'}`}>{u.status}</span></td>
                  <td style={{fontSize:12}}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td><button onClick={()=>toggle(u.id)} className="btn btn-sm" style={{background: u.status==='active'?'var(--warning)':'var(--success)', color:'white', marginRight:6}}><i className={`fa fa-${u.status==='active'?'ban':'check'}`}></i></button><button onClick={()=>del(u.id)} className="btn btn-sm btn-danger"><i className="fa fa-trash"></i></button></td></tr>)}
                {users.length===0 && <tr><td colSpan={9} style={{textAlign:'center', padding:30, color:'var(--mid)'}}>No users found</td></tr>}
              </tbody></table></div>
          </div>
        </div>
      </main>
    </div>
  );
}
