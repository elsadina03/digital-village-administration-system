import "./topbar.css";
import { useNavigate, NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { LuX, LuMenu, LuBell } from "react-icons/lu";

export default function Topbar({ onToggleSidebar, isPublic }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const displayName = user?.name ?? "—";
  const displayRole = user?.role?.name ?? user?.role ?? "—";

  const navItems = [
    { to: "/",                    label: "Beranda",            end: true },
    { to: "/berita",              label: "Berita" },
    { to: "/penduduk",            label: "Penduduk" },
    { to: "/galeri",              label: "Galeri" },
    { to: "/struktur-organisasi", label: "Struktur Organisasi" },
    { to: "/kontak",              label: "Kontak" },
  ];

  if (isPublic) {
    return (
      <>
        <header className="topbar">
          <div className="topbar-brand" onClick={() => navigate("/")}>
            ▦ Desa Bahagia
          </div>

          {/* Desktop nav */}
          <div className="searchWrap desktop-nav">
            <nav style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {navItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => (isActive ? "nav-active" : "")}
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="right">
            <button className="btn" onClick={() => navigate("/login")}>
              Login
            </button>
            {/* Hamburger for mobile */}
            <button
              className="iconBtn hamburger-btn"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <LuX size={20} /> : <LuMenu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile dropdown nav */}
        {mobileNavOpen && (
          <nav className="mobile-nav">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "nav-active" : ""}`
                }
                onClick={() => setMobileNavOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </>
    );
  }

  return (
    <header className="topbar">
      <button className="iconBtn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <LuMenu size={20} />
      </button>

      <div className="searchWrap">
        <input className="search" placeholder="Cari Fitur" />
      </div>

      <div className="right">
        <button className="iconBtn" title="Help">?</button>
        <button className="iconBtn notif-btn" title="Notif"><LuBell size={20} /></button>

        <div className="profile" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
          <div className="avatar" />
          <div className="profileText">
            <div className="name">{displayName}</div>
            <div className="role">{displayRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}