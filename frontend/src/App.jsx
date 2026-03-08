import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Auth/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";

// Layanan
import PengajuanSurat from "./pages/Layanan/Pengajuan/PengajuanSurat";
import ArsipDokumen from "./pages/Layanan/Arsip/ArsipDokumen";
import Pengaduan from "./pages/Layanan/Pengaduan/Pengaduan";
import SuratDiajukan from "./pages/Layanan/SuratDiajukan/SuratDiajukan";
import PersetujuanSurat from "./pages/Layanan/PersetujuanSurat/PersetujuanSurat";

// Keuangan Desa
import DataAnggaran from "./pages/Keuangan/Data-Anggaran";
import InputAPBDes from "./pages/Keuangan/Input_APBDes/Input_APBDes";
import RealisasiAnggaran from "./pages/Keuangan/Realisasi_Anggaran/RealisasiAnggaran";
import LaporanDanaDesa from "./pages/Keuangan/Laporan_DanaDesa/LaporanDanaDesa";

// Program & Kegiatan
import Program from "./pages/Program-Kegiatan/Program_Desa/Program";
import LaporanKegiatan from "./pages/Program-Kegiatan/Laporan_Kegiatan/LaporanKegiatan";

// Dashboard Monitoring
import SuratDiproses from "./pages/DashboardMonitoring/SuratDiproses/SuratDiproses";
import AnggranMonitor from "./pages/DashboardMonitoring/Anggaran/Anggaran";
import Kependudukan from "./pages/DashboardMonitoring/Kependudukan/Kependudukan";
import BantuanSosial from "./pages/DashboardMonitoring/BantuanSosial/BantuanSosial";

// Informasi Desa
import Berita from "./pages/Berita/Berita";
import BeritaDetail from "./pages/Berita/BeritaDetail";
import Galeri from "./pages/Galeri/Galeri";
import StrukturOrganisasi from "./pages/StrukturOrganisasi/StrukturOrganisasi";
import Kontak from "./pages/Kontak/Kontak";

// Data Penduduk
import Penduduk from "./pages/Penduduk/Penduduk";
import PublicPenduduk from "./pages/Penduduk/PublicPenduduk";

import { ROLES } from "./context/AuthContext";

const { ADMIN, KEPDES, SEKRETARIS, BENDAHARA } = ROLES;
const ADMIN_KEPDES = [ADMIN, KEPDES];
const FINANCE_ROLES = [ADMIN, KEPDES, BENDAHARA];
const PROGRAM_ROLES = [ADMIN, KEPDES, SEKRETARIS];
const CITIZEN_ROLES = [ADMIN, KEPDES, SEKRETARIS];
const MONITOR_ROLES = [ADMIN, KEPDES, SEKRETARIS, BENDAHARA]; // Bantuan Sosial for all, others filtered by sidebar
const SURAT_STAFF = [ADMIN, KEPDES, SEKRETARIS];  // kelola surat
const KEPDES_ROLES = [ADMIN, KEPDES];              // persetujuan kepdes

export default function App() {
    return (
        <Routes>
            {/* ── Auth pages ───────────────────────────── */}
            <Route path="/login" element={<Login />} />

            {/* ── PUBLIC routes — no login required ────── */}
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/berita" element={<Berita />} />
                <Route path="/berita/:id" element={<BeritaDetail />} />
                <Route path="/galeri" element={<Galeri />} />
                <Route path="/struktur-organisasi" element={<StrukturOrganisasi />} />
                <Route path="/kontak" element={<Kontak />} />
                <Route path="/penduduk" element={<PublicPenduduk />} />
            </Route>

            {/* ── PRIVATE routes — login required ─────── */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/profile" element={<Profile />} />

                    {/* Layanan — semua role */}
                    <Route path="/pengajuan" element={<PengajuanSurat />} />
                    <Route path="/arsip" element={<ArsipDokumen />} />
                    <Route path="/pengaduan" element={<Pengaduan />} />

                    {/* Surat Diajukan — Admin, KepDes, Sekretaris */}
                    <Route element={<ProtectedRoute allowedRoles={SURAT_STAFF} />}>
                        <Route path="/surat-diajukan" element={<SuratDiajukan />} />
                    </Route>

                    {/* Persetujuan Surat — Admin, KepDes */}
                    <Route element={<ProtectedRoute allowedRoles={KEPDES_ROLES} />}>
                        <Route path="/persetujuan-surat" element={<PersetujuanSurat />} />
                    </Route>

                    {/* Informasi Desa private (edit) — akses baca di public routes */}

                    {/* Dashboard Monitoring — Bantuan Sosial semua, lainnya terbatas */}
                    <Route path="/bantuan-sosial" element={<BantuanSosial />} />

                    {/* Dashboard Monitoring — staffs only */}
                    <Route element={<ProtectedRoute allowedRoles={MONITOR_ROLES} />}>
                        <Route path="/anggaran" element={<AnggranMonitor />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={CITIZEN_ROLES} />}>
                        <Route path="/penduduk-stats" element={<Kependudukan />} />
                        <Route path="/surat" element={<SuratDiproses />} />
                    </Route>

                    {/* Data Penduduk — Admin, KepDes only */}
                    <Route element={<ProtectedRoute allowedRoles={ADMIN_KEPDES} />}>
                        <Route path="/warga" element={<Penduduk />} />
                    </Route>

                    {/* Keuangan Desa — Bendahara, Admin, KepDes */}
                    <Route element={<ProtectedRoute allowedRoles={FINANCE_ROLES} />}>
                        <Route path="/input-apbdes" element={<InputAPBDes />} />
                        <Route path="/data-anggaran" element={<DataAnggaran />} />
                        <Route path="/realisasi-anggaran" element={<RealisasiAnggaran />} />
                        <Route path="/laporan-dana-desa" element={<LaporanDanaDesa />} />
                    </Route>

                    {/* Program & Kegiatan — Admin, KepDes, Sekretaris */}
                    <Route element={<ProtectedRoute allowedRoles={PROGRAM_ROLES} />}>
                        <Route path="/program-desa" element={<Program />} />
                        <Route path="/laporan-kegiatan" element={<LaporanKegiatan />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
}