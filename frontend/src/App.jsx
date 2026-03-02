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
import LaporanKegiatan from "./pages/Program-Kegiatan/Laporan_Kegiatan/LaporanKegiatan";
import SuratDiproses from "./pages/Dashboard_Monitoring/Surat_Diproses/SuratDiproses";
import PembuatanSurat from "./pages/Program-Kegiatan/Pembuatan_Surat/PembuatanSurat";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pengajuan" element={<PengajuanSurat />} />
        <Route path="/arsip" element={<ArsipDokumen />} />
        <Route path="/data-anggaran" element={<Keuangan />} />

        {/* Tambahan route */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/pengaduan" element={<Pengaduan />} />
        <Route path="/program-desa" element={<Program />} />
        <Route path="/laporan-kegiatan" element={<LaporanKegiatan />} />
        <Route path="/pembuatan-surat" element={<PembuatanSurat />} />
        <Route path="/surat" element={<SuratDiproses />} />
        <Route path="/berita" element={<div>Berita</div>} />

        <Route path="/payment/overview" element={<div>Payment Overview</div>} />
        <Route path="/payment/details" element={<div>Payment Details</div>} />
        <Route path="/payment/bundles" element={<div>Resource Bundles</div>} />
        <Route path="/payment/export" element={<div>Export Receipts</div>} />
      </Route>
    </Routes>
  );
}