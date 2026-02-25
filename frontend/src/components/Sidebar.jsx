import { NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import "./sidebar.css";

export default function Sidebar({ collapsed }) {
  const [open, setOpen] = useState({
    layanan: true,
    payment: true,
    subscriptions: false,
    invoices: false,
    coupons: false,
  });

  const menus = useMemo(
    () => [
      { type: "link", label: "Beranda", to: "/", icon: "🏠" },

      {
        type: "group",
        key: "layanan",
        label: "Layanan",
        icon: "🧾",
        items: [
          { label: "Pengajuan Surat Online", to: "/pengajuan" },
          { label: "Arsip Dokumen", to: "/arsip" },
          { label: "Pengaduan", to: "/pengaduan" },
        ],
      },

      {
        type: "group",
        key: "dashboard-monitoring",
        label: "Dashboard Monitoring",
        icon: "📊",
        items: [
          { label: "Jumlah Penduduk", to: "/penduduk" },
          { label: "Surat Diproses", to: "/surat" },
          { label: "Total Anggaran", to: "/anggaran" },
          { label: "Data Bantuan Sosial", to: "/bantuan-sosial" },
        ],
      },
      
       {
        type: "group",
        key: "program-kegiatan",
        label: "Program & Kegiatan",
        icon: "📊",
        items: [
          { label: "Program Desa", to: "/program-desa" },
          { label: "Laporan Kegiatan", to: "/laporan-kegiatan" },
        ],
      },

      {
        type: "group",
        key: "keuangan-desa",
        label: "Keuangan Desa",
        icon: "💳",
        items: [
          { label: "Input APBDes", to: "/input-apbdes" },
          { label: "Data Anggaran", to: "/data-anggaran" },
          { label: "Laporan Dana Desa", to: "/laporan-dana-desa" },
          { label: "Realisasi Anggaran", to: "/realisasi-anggaran" },
        ],
      },

      { type: "group", key: "subscriptions", label: "Subscriptions", icon: "📦", items: [] },
      { type: "group", key: "invoices", label: "Invoices", icon: "🧾", items: [] },
      { type: "group", key: "coupons", label: "Coupons", icon: "🏷️", items: [] },
    ],
    []
  );

  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

  return (
    <aside className={`sb ${collapsed ? "sb--collapsed" : ""}`}>
      <div className="sb__top">
        <div className="sb__logo">▦</div>
      </div>

      <nav className="sb__nav">
        {menus.map((m, idx) => {
          if (m.type === "link") {
            return (
              <NavLink
                key={idx}
                to={m.to}
                end={m.to === "/"}
                className={({ isActive }) => `sb__item ${isActive ? "is-active" : ""}`}
              >
                <span className="sb__icon">{m.icon}</span>
                <span className="sb__label">{m.label}</span>
              </NavLink>
            );
          }

          // group
          const isOpen = !!open[m.key];

          return (
            <div key={m.key} className="sb__group">
              <button
                type="button"
                className="sb__groupBtn"
                onClick={() => toggle(m.key)}
                aria-expanded={isOpen}
              >
                <span className="sb__icon">{m.icon}</span>
                <span className="sb__label">{m.label}</span>
                <span className={`sb__chev ${isOpen ? "open" : ""}`}>▾</span>
              </button>

              {isOpen && m.items?.length > 0 && (
                <div className="sb__sub">
                  {m.items.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className={({ isActive }) => `sb__subItem ${isActive ? "is-active" : ""}`}
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}