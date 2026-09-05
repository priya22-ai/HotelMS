import { useEffect, useState } from 'react';
import api from '../../api.js';
import { UserSidebar } from '../../components/Sidebar.jsx';

export default function UserNotifications(){
  const [list, setList] = useState([]);
  useEffect(()=>{ api.get('/user/notifications').then(r=> setList(r.data.notifications)); },[]);

  return (
    <div className="dashboard-layout">
      <UserSidebar user={{category:'COZY'}} />
      <main className="dashboard-main">
        <h1 style={{fontFamily:'Playfair Display,serif', fontSize:28}}><i className="fa fa-bell" style={{color:'var(--primary)'}}></i> Notifications</h1>
        <div className="card">
          <div className="card-body">
            {list.length===0 ? <div className="empty-state"><i className="fa fa-bell-slash"></i><p>No notifications yet</p></div> : list.map(n=> (
              <div key={n.id} className="notification-item">
                <div className="notif-icon"><i className="fa fa-bell"></i></div>
                <div className="notif-body"><h4>{n.title}</h4><p>{n.message}</p><div style={{fontSize:11, color:'var(--mid)', marginTop:6}}>{new Date(n.created_at).toLocaleString()} {n.target && <span className="badge badge-info" style={{marginLeft:8}}>{n.target}</span>}</div></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
