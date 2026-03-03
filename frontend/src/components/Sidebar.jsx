import { NavLink } from "react-router-dom";
import { useMemo, useState, useContext } from "react";
import { AuthContext, ROLES } from "../context/AuthContext";
import "./sidebar.css";

const { ADMIN, KEPDES, SEKRETARIS, BENDAHARA, WARGA } = ROLES;

/**
 * Definisi semua menu + aturan role mana yang boleh mengaksesnya.
 * `allowedRoles: null`  → semua role boleh.
 * `allowedRoles: [...]` → hanya role di array yang boleh.
 */
const ALL_MENUS = [
    {
        type: "link",
        label: "Beranda",
        to: "/",
        icon: "🏠",
        allowedRoles: null, // semua
    },
    {
        type: "group",
        key: "layanan",
        label: "Layanan",
        icon: "🧾",
        allowedRoles: null, // semua
        itemRules: {
            "/pengajuan":         null,   // semua
            "/arsip":             null,
            "/pengaduan":         null,
            "/persetujuan-surat": [ADMIN, KEPDES], // hanya KepDes + Admin
        },
        items: [
            { label: "Pengajuan Surat Online",     to: "/pengajuan" },
            { label: "Arsip Dokumen",              to: "/arsip" },
            { label: "Pengaduan",                  to: "/pengaduan" },
            { label: "Persetujuan Surat (KepDes)", to: "/persetujuan-surat" },
        ],
    },
    {
        type: "group",
        key: "penduduk",
        label: "Data Penduduk",
        icon: "👥",
        allowedRoles: [ADMIN, KEPDES],
        items: [
            { label: "Daftar Penduduk", to: "/warga" },
        ],
    },
    {
        type: "group",
        key: "monitoring",
        label: "Dashboard Monitoring",
        icon: "📊",
        allowedRoles: [ADMIN, KEPDES, BENDAHARA], // Sekretaris tidak perlu dashboard
        itemRules: {
            "/penduduk-stats":  [ADMIN, KEPDES],
            "/surat":           [ADMIN, KEPDES],
            "/anggaran":        [ADMIN, KEPDES, BENDAHARA],
            "/bantuan-sosial":  [ADMIN, KEPDES, BENDAHARA],
        },
        items: [
            { label: "Jumlah Penduduk",     to: "/penduduk-stats" },
            { label: "Surat Diproses",      to: "/surat" },
            { label: "Total Anggaran",      to: "/anggaran" },
            { label: "Data Bantuan Sosial", to: "/bantuan-sosial" },
        ],
    },
    {
        type: "group",
        key: "program",
        label: "Program & Kegiatan",
        icon: "📋",
        allowedRoles: [ADMIN, KEPDES, SEKRETARIS],
        itemRules: {
            "/program-desa":     null,          // semua yang boleh lihat group ini
            "/laporan-kegiatan": null,
            "/surat-diajukan":   [ADMIN, SEKRETARIS], // KepDes TIDAK lihat ini
        },
        items: [
            { label: "Program Desa",       to: "/program-desa" },
            { label: "Laporan Kegiatan",   to: "/laporan-kegiatan" },
            { label: "Surat yang Diajukan", to: "/surat-diajukan" },
        ],
    },
    {
        type: "group",
        key: "keuangan",
        label: "Keuangan Desa",
        icon: "💳",
        allowedRoles: [ADMIN, KEPDES, BENDAHARA],
        items: [
            { label: "Input APBDes",        to: "/input-apbdes" },
            { label: "Data Anggaran",       to: "/data-anggaran" },
            { label: "Realisasi Anggaran",  to: "/realisasi-anggaran" },
            { label: "Laporan Dana Desa",   to: "/laporan-dana-desa" },
        ],
    },
    {
        type: "group",
        key: "bansos",
        label: "Bantuan Sosial",
        icon: "🤝",
        allowedRoles: [ADMIN, KEPDES, SEKRETARIS], // Sekretaris juga bisa lihat bansos
        items: [
            { label: "Kelola Bantuan", to: "/kelola-bansos" },
        ],
    },
    {
        type: "group",
        key: "informasi",
        label: "Informasi Desa",
        icon: "🏡",
        allowedRoles: null, // semua
        items: [
            { label: "Berita Desa",         to: "/berita" },
            { label: "Galeri Desa",         to: "/galeri" },
            { label: "Struktur Organisasi", to: "/struktur-organisasi" },
            { label: "Kontak & Lokasi",     to: "/kontak" },
        ],
    },
    {
        type: "group",
        key: "kelola",
        label: "Kelola Sistem",
        icon: "⚙️",
        allowedRoles: [ADMIN],
        items: [
            { label: "Manajemen User", to: "/users" },
        ],
    },
];

export default function Sidebar({ collapsed }) {
    const { user } = useContext(AuthContext);
    const roleName  = user?.role?.name ?? null;

    const [open, setOpen] = useState({
        layanan:    true,
        monitoring: true,
        informasi:  false,
        program:    false,
        keuangan:   false,
        bansos:     false,
        penduduk:   false,
        kelola:     false,
    });

    const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

    // Filter menus based on current role
    const menus = useMemo(() => {
        return ALL_MENUS
            .filter((m) => {
                if (!m.allowedRoles) return true; // semua boleh
                return m.allowedRoles.includes(roleName);
            })
            .map((m) => {
                // Filter sub-items if itemRules exists
                if (m.itemRules) {
                    const filteredItems = m.items.filter((item) => {
                        const rule = m.itemRules[item.to];
                        if (!rule) return true; // semua boleh
                        return rule.includes(roleName);
                    });
                    return { ...m, items: filteredItems };
                }
                return m;
            })
            .filter((m) => {
                // Hapus group jika tidak ada item tersisa
                if (m.type === "group" && m.items?.length === 0) return false;
                return true;
            });
    }, [roleName]);

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
                                            className={({ isActive }) =>
                                                `sb__subItem ${isActive ? "is-active" : ""}`
                                            }
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


