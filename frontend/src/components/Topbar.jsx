import "./topbar.css";
import { useNavigate, NavLink } from "react-router-dom";

export default function Topbar({ onToggleSidebar, isPublic }) {
  const navigate = useNavigate();

  if (isPublic) {
    return (
      <header className="topbar">
        <div style={{display: 'flex', alignItems: 'center', gap:12}}>
          <div style={{fontSize:20, fontWeight:700, cursor: 'pointer'}} onClick={()=>navigate('/')}>▦ Desa Bahagia</div>
        </div>

        <div className="searchWrap">
          <nav style={{display: 'flex', gap:12, justifyContent:'center'}}>
            <NavLink to="/" end className={({isActive})=>isActive? 'nav-active':''}>Beranda</NavLink>
            <NavLink to="/berita" className={({isActive})=>isActive? 'nav-active':''}>Berita</NavLink>
            <NavLink to="/penduduk" className={({isActive})=>isActive? 'nav-active':''}>Jumlah Penduduk</NavLink>
            <NavLink to="/struktur-organisasi" className={({isActive})=>isActive? 'nav-active':''}>Struktur Organisasi</NavLink>
          </nav>
        </div>

        <div className="right">
          <button className="btn" onClick={() => navigate('/login')}>Login</button>
        </div>
      </header>
    );
  }

  return (
    <header className="topbar">
      <button className="iconBtn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>

      <div className="searchWrap">
        <input className="search" placeholder="Cari Fitur" />
      </div>

      <div className="right">
        <button className="iconBtn" title="Help">?</button>
        <button className="iconBtn" title="Notif">🔔</button>

        <div className="profile" onClick={() => navigate("/profile")} style={{cursor: 'pointer'}}>
          <div className="avatar" />
          <div className="profileText">
            <div className="name">Hariyanto</div>
            <div className="role">Warga</div>
          </div>
        </div>
      </div>
    </header>
  );
}