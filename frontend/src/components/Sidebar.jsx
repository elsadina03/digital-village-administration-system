import { NavLink } from "react-router-dom";
import { useMemo, useState, useContext } from "react";
import { AuthContext, ROLES } from "../context/AuthContext";

const { ADMIN, KEPDES, SEKRETARIS, BENDAHARA, WARGA } = ROLES;

const ALL_MENUS = [
    {
        type: "link",
        label: "Beranda",
        to: "/",
        icon: <i className="fas fa-home"></i>,
        allowedRoles: null,
    },
    {
        type: "group",
        key: "layanan",
        label: "Layanan",
        icon: <i className="fas fa-envelope-open-text"></i>,
        allowedRoles: null,
        itemRules: {
            "/pengajuan": null,
            "/arsip": null,
            "/pengaduan": null,
            "/persetujuan-surat": [ADMIN, KEPDES],
        },
        items: [
            { label: "Pengajuan Surat Online", to: "/pengajuan" },
            { label: "Arsip Dokumen", to: "/arsip" },
            { label: "Pengaduan", to: "/pengaduan" },
            { label: "Persetujuan Surat (KepDes)", to: "/persetujuan-surat" },
        ],
    },
    {
        type: "group",
        key: "penduduk",
        label: "Data Penduduk",
        icon: <i className="fas fa-users"></i>,
        allowedRoles: [ADMIN, KEPDES],
        items: [
            { label: "Daftar Penduduk", to: "/warga" },
        ],
    },
    {
        type: "group",
        key: "monitoring",
        label: "Dashboard Monitoring",
        icon: <i className="fas fa-chart-bar"></i>,
        allowedRoles: [ADMIN, KEPDES, BENDAHARA],
        itemRules: {
            "/penduduk-stats": [ADMIN, KEPDES],
            "/surat": [ADMIN, KEPDES],
            "/anggaran": [ADMIN, KEPDES, BENDAHARA],
            "/bantuan-sosial": [ADMIN, KEPDES, BENDAHARA],
        },
        items: [
            { label: "Jumlah Penduduk", to: "/penduduk-stats" },
            { label: "Surat Diproses", to: "/surat" },
            { label: "Total Anggaran", to: "/anggaran" },
            { label: "Data Bantuan Sosial", to: "/bantuan-sosial" },
        ],
    },
    {
        type: "group",
        key: "program",
        label: "Program & Kegiatan",
        icon: <i className="fas fa-tasks"></i>,
        allowedRoles: [ADMIN, KEPDES, SEKRETARIS],
        itemRules: {
            "/program-desa": null,
            "/laporan-kegiatan": null,
            "/surat-diajukan": [ADMIN, SEKRETARIS],
        },
        items: [
            { label: "Program Desa", to: "/program-desa" },
            { label: "Laporan Kegiatan", to: "/laporan-kegiatan" },
            { label: "Surat yang Diajukan", to: "/surat-diajukan" },
        ],
    },
    {
        type: "group",
        key: "keuangan",
        label: "Keuangan Desa",
        icon: <i className="fas fa-wallet"></i>,
        allowedRoles: [ADMIN, KEPDES, BENDAHARA],
        items: [
            { label: "Input APBDes", to: "/input-apbdes" },
            { label: "Data Anggaran", to: "/data-anggaran" },
            { label: "Realisasi Anggaran", to: "/realisasi-anggaran" },
            { label: "Laporan Dana Desa", to: "/laporan-dana-desa" },
        ],
    },
    {
        type: "group",
        key: "bansos",
        label: "Bantuan Sosial",
        icon: <i className="fas fa-hand-holding-heart"></i>,
        allowedRoles: [ADMIN, KEPDES, SEKRETARIS],
        items: [
            { label: "Kelola Bantuan", to: "/kelola-bansos" },
        ],
    },
    {
        type: "group",
        key: "informasi",
        label: "Informasi Desa",
        icon: <i className="fas fa-newspaper"></i>,
        allowedRoles: null,
        items: [
            { label: "Berita Desa", to: "/berita" },
            { label: "Galeri Desa", to: "/galeri" },
            { label: "Struktur Organisasi", to: "/struktur-organisasi" },
            { label: "Kontak & Lokasi", to: "/kontak" },
        ],
    },
    {
        type: "group",
        key: "kelola",
        label: "Kelola Sistem",
        icon: <i className="fas fa-cog"></i>,
        allowedRoles: [ADMIN],
        items: [
            { label: "Manajemen User", to: "/users" },
        ],
    },
];

export default function Sidebar() {
    const { user } = useContext(AuthContext);
    const roleName = user?.role?.name ?? user?.role ?? null;
    const userName = user?.name ?? "—";

    const menus = useMemo(() => {
        return ALL_MENUS
            .filter((m) => {
                if (!m.allowedRoles) return true;
                return m.allowedRoles.includes(roleName);
            })
            .map((m) => {
                if (m.itemRules) {
                    const filteredItems = m.items.filter((item) => {
                        const rule = m.itemRules[item.to];
                        if (!rule) return true;
                        return rule.includes(roleName);
                    });
                    return { ...m, items: filteredItems };
                }
                return m;
            })
            .filter((m) => {
                if (m.type === "group" && m.items?.length === 0) return false;
                return true;
            });
    }, [roleName]);

    return (
        <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
            <div className="sb-sidenav-menu">
                <div className="nav">
                    <div className="sb-sidenav-menu-heading">Menu Utama</div>

                    {menus.map((m, idx) => {
                        if (m.type === "link") {
                            return (
                                <NavLink key={idx} className="nav-link" to={m.to} end={m.to === "/"}>
                                    <div className="sb-nav-link-icon">{m.icon}</div>
                                    {m.label}
                                </NavLink>
                            );
                        }

                        const collapseId = `collapse${m.key.charAt(0).toUpperCase() + m.key.slice(1)}`;

                        return (
                            <div key={m.key}>
                                <a
                                    className="nav-link collapsed"
                                    href="#"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#${collapseId}`}
                                    aria-expanded="false"
                                    aria-controls={collapseId}
                                >
                                    <div className="sb-nav-link-icon">{m.icon}</div>
                                    {m.label}
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down"></i></div>
                                </a>
                                <div className="collapse" id={collapseId} data-bs-parent="#sidenavAccordion">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        {m.items.map((it) => (
                                            <NavLink key={it.to} className="nav-link" to={it.to}>
                                                {it.label}
                                            </NavLink>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="sb-sidenav-footer">
                <div className="small">Logged in as:</div>
                {userName} ({roleName ?? "Warga"})
            </div>
        </nav>
    );
}
