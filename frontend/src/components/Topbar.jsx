import "./topbar.css";

export default function Topbar({ onToggleSidebar }) {
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

        <div className="profile">
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