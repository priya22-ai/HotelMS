import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api.js';

export default function AdminLogin() {
  const [mode, setMode] = useState('login'); // login | register
  const [exists, setExists] = useState(true);
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'' });
  const [msg, setMsg] = useState({ error:'', success:'' });
  const navigate = useNavigate();

  useEffect(()=> {
    api.get('/admin/exists').then(r=> { setExists(r.data.exists); if(!r.data.exists) setMode('register'); }).catch(()=>{});
    api.get('/session').then(r=> { if(r.data.admin) navigate('/admin/dashboard'); }).catch(()=>{});
  },[]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({error:'', success:''});
    try {
      if (mode==='register') {
        const r = await api.post('/admin/register', form);
        setMsg({success: r.data.message + ' Now login.', error:''});
        setMode('login');
      } else {
        await api.post('/admin/login', { email: form.email, password: form.password });
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setMsg({error: err.response?.data?.error || 'Failed', success:''});
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-img" />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="brand-icon"><i className="fa-solid fa-bowl-food"></i></div>
            <h2>{mode==='register'?'Admin Register':'Admin Login'}</h2>
            <p>{mode==='register'?'Create first administrator':'Welcome back, Admin'}</p>
          </div>
          {msg.error && <div className="alert alert-danger"><i className="fa fa-circle-xmark"></i> {msg.error}</div>}
          {msg.success && <div className="alert alert-success"><i className="fa fa-check-circle"></i> {msg.success}</div>}

          <form onSubmit={onSubmit}>
            {mode==='register' && (
              <>
                <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></div>
                <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="+880..." /></div>
                <div className="form-group"><label>Address</label><input className="form-control" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} /></div>
              </>
            )}
            <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required /></div>
            <div className="form-group"><label>Password *</label><input type="password" className="form-control" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required /></div>
            <button type="submit" className="btn-submit"><i className={`fa ${mode==='register'?'fa-user-plus':'fa-right-from-bracket'}`}></i> {mode==='register'?'Create Admin':'Login'}</button>
          </form>

          {exists && (
            <div className="auth-switch">
              {mode==='login' ? <><span>Need to create admin? </span><a onClick={()=>setMode('register')} style={{cursor:'pointer'}}>Register</a></> : <><span>Have account? </span><a onClick={()=>setMode('login')} style={{cursor:'pointer'}}>Login</a></>}
            </div>
          )}
          <div className="auth-switch" style={{marginTop:12}}><Link to="/" style={{color:'rgba(255,255,255,0.5)', fontSize:12}}><i className="fa fa-arrow-left"></i> Back to Home</Link></div>
        </div>
      </div>
    </div>
  );
}
