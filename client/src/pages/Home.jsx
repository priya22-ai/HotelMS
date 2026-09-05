import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [type, setType] = useState('');
  const navigate = useNavigate();

  const selectEntry = (t) => setType(t);
  const proceed = () => {
    if (!type) return alert('Please select Admin or User');
    navigate(type === 'admin' ? '/admin/login' : '/user/login');
  };

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge"><i className="fa fa-star"></i> Premium Meal Management</div>
          <h1 className="hero-title">Delicious Meals, <span>Perfectly Managed</span></h1>
          <p className="hero-subtitle">Track your daily meals, manage payments, and enjoy a seamless dining experience — all in one place.</p>

          <div className="entry-card">
            <h3><i className="fa fa-door-open" style={{color:'var(--gold)', marginRight:8}}></i>Select Your Entry</h3>
            <p style={{color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:20, textAlign:'center'}}>Choose how you want to continue</p>
            <div className="entry-options">
              <div className={`entry-option ${type==='admin'?'selected':''}`} onClick={()=>selectEntry('admin')}>
                <i className="fa fa-shield-halved"></i>
                <strong>Admin</strong>
                <small style={{display:'block', fontSize:11, marginTop:4, opacity:.7}}>Manage & Control</small>
              </div>
              <div className={`entry-option ${type==='user'?'selected':''}`} onClick={()=>selectEntry('user')}>
                <i className="fa fa-user-circle"></i>
                <strong>User</strong>
                <small style={{display:'block', fontSize:11, marginTop:4, opacity:.7}}>Order & Track</small>
              </div>
            </div>
            <button className="btn-proceed" onClick={proceed}><i className="fa fa-arrow-right-to-bracket"></i> &nbsp;Continue</button>
          </div>
        </div>
      </section>

      <section className="features-section" id="about">
        <div className="section-header">
          <span className="section-tag">Why MealMate?</span>
          <h2 className="section-title">Everything You Need <br /><span>In One System</span></h2>
        </div>
        <div className="features-grid">
          {[
            {icon:'fa-utensils', t:'Smart Menu Setup', d:'Admin can set breakfast, lunch, and dinner menus for every day — edit or delete anytime with ease.'},
            {icon:'fa-clock', t:'Timed Meal Slots', d:'Customizable meal timing windows. Users get notified when meals are ready or time is running out.'},
            {icon:'fa-credit-card', t:'Flexible Payments', d:'Pay daily, weekly, or monthly. Multiple payment methods including bKash, Nagad, and cash.'},
            {icon:'fa-chart-bar', t:'Detailed Reports', d:'Both admins and users get full reports — who paid, who didn\'t, how many meals, and expenses.'},
            {icon:'fa-bell', t:'Live Notifications', d:'Real-time meal notifications — know when your meal is ready and how many people ordered today.'},
            {icon:'fa-users', t:'User Categories', d:'Student, Guest, Employee, Cleaner — with COZY, Premium, and VIP tiers for personalized service.'},
          ].map(f=> (
            <div className="feature-card" key={f.t}>
              <div className="feature-icon"><i className={`fa ${f.icon}`}></i></div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="about-inner">
          <div className="about-img-wrap">
            <img src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80" alt="Meal" className="about-img" />
          </div>
          <div className="about-text">
            <span className="section-tag">About System</span>
            <h2>Built for Hostels, Offices & Institutions</h2>
            <p>MealMate is a complete meal management solution designed for hostels, corporate offices, universities, and institutions.</p>
            <br />
            <p>With role-based access, smart notifications, and detailed reporting, managing daily meals has never been easier.</p>
            <br />
            <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
              <div style={{textAlign:'center'}}><div style={{fontFamily:'Playfair Display,serif', fontSize:32, color:'var(--gold)', fontWeight:700}}>3x</div><div style={{fontSize:13, color:'rgba(255,255,255,0.5)'}}>Meals Per Day</div></div>
              <div style={{textAlign:'center'}}><div style={{fontFamily:'Playfair Display,serif', fontSize:32, color:'var(--primary-light)', fontWeight:700}}>100%</div><div style={{fontSize:13, color:'rgba(255,255,255,0.5)'}}>Tracked</div></div>
              <div style={{textAlign:'center'}}><div style={{fontFamily:'Playfair Display,serif', fontSize:32, color:'var(--gold-light)', fontWeight:700}}>∞</div><div style={{fontSize:13, color:'rgba(255,255,255,0.5)'}}>Users</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" style={{padding:'80px 20px', background:'var(--light-2)'}}>
        <div style={{maxWidth:600, margin:'0 auto', textAlign:'center'}}>
          <span className="section-tag">Contact Us</span>
          <h2 className="section-title" style={{marginBottom:30}}>Get In <span>Touch</span></h2>
          <div className="card"><div className="card-body">
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20}}>
              <div style={{background:'var(--light)', padding:20, borderRadius:'var(--radius)', textAlign:'center'}}><i className="fa fa-envelope" style={{fontSize:24, color:'var(--primary)', marginBottom:8, display:'block'}}></i><strong>Email</strong><br /><span style={{fontSize:13, color:'var(--mid)'}}>admin@mealmate.com</span></div>
              <div style={{background:'var(--light)', padding:20, borderRadius:'var(--radius)', textAlign:'center'}}><i className="fa fa-phone" style={{fontSize:24, color:'var(--primary)', marginBottom:8, display:'block'}}></i><strong>Phone</strong><br /><span style={{fontSize:13, color:'var(--mid)'}}>+880 1700-000000</span></div>
            </div>
            <button className="btn btn-primary" style={{width:'100%', justifyContent:'center'}} onClick={()=>window.scrollTo(0,0)}><i className="fa fa-arrow-right-to-bracket"></i> Get Started Now</button>
          </div></div>
        </div>
      </section>
    </>
  );
}
