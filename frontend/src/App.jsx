import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Dashboard from "./pages/Dashboard/Dashboard";
import PengajuanSurat from "./pages/Layanan/Pengajuan/PengajuanSurat";
import ArsipDokumen from "./pages/Layanan/Arsip/ArsipDokumen";
import Pengaduan from "./pages/Layanan/Pengaduan/Pengaduan";
import Profile from "./pages/Profile/Profile";
import Program from "./pages/Program-Kegiatan/Program_Desa/Program";
import Keuangan from "./pages/Keuangan/Data-Anggaran";
import Input_APBDes from "./pages/Keuangan/Input_APBDes/Input_APBDes";
import LaporanKegiatan from "./pages/Program-Kegiatan/Laporan_Kegiatan/LaporanKegiatan";
import SuratDiproses from "./pages/Dashboard_Monitoring/Surat_Diproses/SuratDiproses";
import PembuatanSurat from "./pages/Program-Kegiatan/Pembuatan_Surat/PembuatanSurat";
import Anggaran from "./pages/DashboardMonitoring/Anggaran/Anggaran";
import Kependudukan from "./pages/DashboardMonitoring/Kependudukan/Kependudukan";
=======
import Berita from "./pages/Berita/Berita";
import BeritaDetail from "./pages/Berita/BeritaDetail";
import Penduduk from "./pages/Penduduk/Penduduk";
import StrukturOrganisasi from "./pages/StrukturOrganisasi/StrukturOrganisasi";
import BantuanSosial from "./pages/Dashboard_Monitoring/BantuanSosial/BantuanSosial";
import LaporanDanaDesa from "./pages/Keuangan/Laporan_DanaDesa/LaporanDanaDesa";
import RealisasiAnggaran from "./pages/Keuangan/Realisasi_Anggaran/RealisasiAnggaran";
import Galeri from "./pages/Galeri/Galeri";
import Kontak from "./pages/Kontak/Kontak";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        {/* Layanan */}
        <Route path="/pengajuan" element={<PengajuanSurat />} />
        <Route path="/arsip" element={<ArsipDokumen />} />
        <Route path="/pengaduan" element={<Pengaduan />} />

        {/* Keuangan Desa */}
        <Route path="/data-anggaran" element={<Keuangan />} />
        <Route path="/input-apbdes" element={<Input_APBDes />} />
        <Route path="/realisasi-anggaran" element={<RealisasiAnggaran />} />
        <Route path="/laporan-dana-desa" element={<LaporanDanaDesa />} />

        {/* Program & Kegiatan */}
        <Route path="/program-desa" element={<Program />} />
        <Route path="/laporan-kegiatan" element={<LaporanKegiatan />} />
        <Route path="/pembuatan-surat" element={<PembuatanSurat />} />

        {/* Dashboard Monitoring */}
        <Route path="/surat" element={<SuratDiproses />} />

        <Route path="/anggaran" element={<Anggaran />} />
        <Route path="/penduduk" element={<Kependudukan />} />
        <Route path="/berita" element={<div>Berita</div>} />
=======
        <Route path="/bantuan-sosial" element={<BantuanSosial />} />

        {/* Informasi Publik Desa */}
        <Route path="/berita" element={<Berita />} />
        <Route path="/berita/:id" element={<BeritaDetail />} />
        <Route path="/penduduk" element={<Penduduk />} />
        <Route path="/struktur-organisasi" element={<StrukturOrganisasi />} />
        <Route path="/galeri" element={<Galeri />} />
        <Route path="/kontak" element={<Kontak />} />

        {/* Akun */}
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}