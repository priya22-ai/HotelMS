import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api.js';

export default function UserLogin() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'', user_type:'student', category:'COZY' });
  const [msg, setMsg] = useState({error:'', success:''});
  const navigate = useNavigate();

  useEffect(()=> {
    api.get('/session').then(r=> { if(r.data.user) navigate('/user/dashboard'); }).catch(()=>{});
  },[]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({error:'', success:''});
    try {
      if (mode==='register') {
        const r = await api.post('/user/register', form);
        setMsg({success: r.data.message + ' Now login.', error:''});
        setMode('login');
      } else {
        await api.post('/user/login', { email: form.email, password: form.password, category: form.category });
        const s = await api.get('/session');
        if (s.data.user) navigate('/user/dashboard');
        else setMsg({error: 'Login succeeded but session not stored — check cookies', success:''});
      }
    } catch (err) {
      console.error('user login error', err.response?.data || err.message);
      setMsg({error: err.response?.data?.error || err.message || 'Failed', success:''});
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-img" />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="brand-icon"><i className="fa-solid fa-bowl-food"></i></div>
            <h2>{mode==='register'?'Create Account':'User Login'}</h2>
            <p>{mode==='register'?'Join MealMate today':'Welcome back!'}</p>
          </div>
          {msg.error && <div className="alert alert-danger"><i className="fa fa-circle-xmark"></i> {msg.error}</div>}
          {msg.success && <div className="alert alert-success"><i className="fa fa-check-circle"></i> {msg.success}</div>}

          <form onSubmit={onSubmit}>
            {mode==='register' && (
              <>
                <div className="form-row">
                  <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
                  <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
                <div className="form-group"><label>Password *</label><input type="password" className="form-control" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>User Type *</label>
                    <select className="form-control" value={form.user_type} onChange={e=>setForm({...form,user_type:e.target.value})}>
                      <option value="student">🎓 Student</option>
                      <option value="guest">🧳 Guest</option>
                      <option value="employee">💼 Employee</option>
                      <option value="cleaner">🧹 Cleaner</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Category *</label>
                    <select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                      <option value="COZY">🏠 COZY</option>
                      <option value="Premium">⭐ Premium</option>
                      <option value="VIP">👑 VIP</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Address</label><input className="form-control" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
                <button type="submit" className="btn-submit"><i className="fa fa-user-plus"></i> Create Account</button>
              </>
            )}
            {mode==='login' && (
              <>
                <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
                <div className="form-group"><label>Password</label><input type="password" className="form-control" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
                <div className="form-group"><label>Category (Optional)</label>
                  <select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    <option value="">-- Any Category --</option>
                    <option value="COZY">🏠 COZY</option>
                    <option value="Premium">⭐ Premium</option>
                    <option value="VIP">👑 VIP</option>
                  </select>
                </div>
                <button type="submit" className="btn-submit"><i className="fa fa-right-from-bracket"></i> Login</button>
              </>
            )}
          </form>

          <div className="auth-switch">
            {mode==='login' ? <><span>New user? </span><a onClick={()=>setMode('register')} style={{cursor:'pointer'}}>Create Account</a></> : <><span>Have account? </span><a onClick={()=>setMode('login')} style={{cursor:'pointer'}}>Login here</a></>}
          </div>
          <div className="auth-switch" style={{marginTop:12}}><Link to="/" style={{color:'rgba(255,255,255,0.4)', fontSize:12}}><i className="fa fa-arrow-left"></i> Back to Home</Link></div>
        </div>
      </div>
    </div>
  );
}
