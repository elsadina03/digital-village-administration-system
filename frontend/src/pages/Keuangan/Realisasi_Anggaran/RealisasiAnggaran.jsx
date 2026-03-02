import { useState } from "react";
import "./realisasi-anggaran.css";

function rupiah(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

// Data dummy per bulan (kumulatif)
const dataRealisasi2025 = [
  { bulan: "Jan", pendapatan: 70000000,  pengeluaran: 55000000 },
  { bulan: "Feb", pendapatan: 135000000, pengeluaran: 110000000 },
  { bulan: "Mar", pendapatan: 210000000, pengeluaran: 162000000 },
  { bulan: "Apr", pendapatan: 280000000, pengeluaran: 215000000 },
  { bulan: "Mei", pendapatan: 350000000, pengeluaran: 270000000 },
  { bulan: "Jun", pendapatan: 430000000, pengeluaran: 320000000 },
];

const detailPengeluaran = [
  { id: 1, tanggal: "2025-01-05", uraian: "Gaji Perangkat Desa - Januari", bidang: "Pemerintahan", jumlah: 18000000, status: "Disetujui" },
  { id: 2, tanggal: "2025-01-20", uraian: "Pemeliharaan Jalan Desa RT 03", bidang: "Pembangunan", jumlah: 35000000, status: "Disetujui" },
  { id: 3, tanggal: "2025-02-03", uraian: "Kegiatan Posyandu Balita", bidang: "Pembinaan", jumlah: 5000000, status: "Disetujui" },
  { id: 4, tanggal: "2025-02-15", uraian: "Pengadaan Alat Tulis Kantor", bidang: "Pemerintahan", jumlah: 2500000, status: "Disetujui" },
  { id: 5, tanggal: "2025-03-10", uraian: "Pembangunan Drainase RT 01", bidang: "Pembangunan", jumlah: 45000000, status: "Disetujui" },
  { id: 6, tanggal: "2025-03-25", uraian: "Pelatihan UMKM Warga Desa", bidang: "Pemberdayaan", jumlah: 8000000, status: "Disetujui" },
  { id: 7, tanggal: "2025-04-12", uraian: "BLT Dana Desa Tahap 1", bidang: "Pemberdayaan", jumlah: 24000000, status: "Disetujui" },
  { id: 8, tanggal: "2025-05-05", uraian: "Renovasi Balai Desa", bidang: "Pembangunan", jumlah: 60000000, status: "Proses" },
  { id: 9, tanggal: "2025-06-07", uraian: "Kegiatan HUT RI ke-80", bidang: "Pembinaan", jumlah: 7500000, status: "Proses" },
  { id: 10, tanggal: "2025-06-20", uraian: "Pengadaan CCTV Desa", bidang: "Pemerintahan", jumlah: 12000000, status: "Menunggu" },
];

const BIDANG_LIST = ["Semua", "Pemerintahan", "Pembangunan", "Pembinaan", "Pemberdayaan"];
const STATUS_LIST = ["Semua", "Disetujui", "Proses", "Menunggu"];

const BADGE_STATUS = {
  "Disetujui": "badge-green",
  "Proses": "badge-blue",
  "Menunggu": "badge-yellow",
};

const maxVal = Math.max(...dataRealisasi2025.map((d) => d.pendapatan));

export default function RealisasiAnggaran() {
  const [filterBidang, setFilterBidang] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");

  const totalPendapatan = 850000000;
  const totalPengeluaranReal = detailPengeluaran
    .filter(d => d.status === "Disetujui")
    .reduce((acc, d) => acc + d.jumlah, 0);

  const filteredDetail = detailPengeluaran.filter((d) => {
    const matchBidang = filterBidang === "Semua" || d.bidang === filterBidang;
    const matchStatus = filterStatus === "Semua" || d.status === filterStatus;
    const matchQ = !search.trim() || d.uraian.toLowerCase().includes(search.toLowerCase());
    return matchBidang && matchStatus && matchQ;
  });

  return (
    <div className="realisasi-root">
      <div className="realisasi-container">

        {/* Header */}
        <div className="realisasi-header">
          <h1 className="realisasi-title">📉 Realisasi Anggaran Desa Bahagia</h1>
          <p className="realisasi-subtitle">Monitoring pemasukan dan pengeluaran anggaran desa secara real-time.</p>
        </div>

        {/* Stat Cards */}
        <div className="realisasi-stats">
          <div className="rs-card" style={{ borderTop: "4px solid #0fa78d" }}>
            <div className="rs-icon">💰</div>
            <div>
              <div className="rs-label">Total APBDes</div>
              <div className="rs-value green-text">{rupiah(totalPendapatan)}</div>
            </div>
          </div>
          <div className="rs-card" style={{ borderTop: "4px solid #3b82f6" }}>
            <div className="rs-icon">📤</div>
            <div>
              <div className="rs-label">Sudah Direalisasi</div>
              <div className="rs-value blue-text">{rupiah(totalPengeluaranReal)}</div>
            </div>
          </div>
          <div className="rs-card" style={{ borderTop: "4px solid #f59e0b" }}>
            <div className="rs-icon">💼</div>
            <div>
              <div className="rs-label">Sisa Anggaran</div>
              <div className="rs-value yellow-text">{rupiah(totalPendapatan - totalPengeluaranReal)}</div>
            </div>
          </div>
          <div className="rs-card" style={{ borderTop: "4px solid #8b5cf6" }}>
            <div className="rs-icon">📊</div>
            <div>
              <div className="rs-label">% Realisasi</div>
              <div className="rs-value purple-text">{Math.round((totalPengeluaranReal / totalPendapatan) * 100)}%</div>
            </div>
          </div>
        </div>

        {/* Grafik Bulanan */}
        <div className="realisasi-card">
          <h3>📅 Grafik Realisasi Bulanan Tahun 2025</h3>
          <div className="bar-chart">
            {dataRealisasi2025.map((d) => (
              <div className="bc-col" key={d.bulan}>
                <div className="bc-bars">
                  <div
                    className="bc-bar income"
                    style={{ height: `${(d.pendapatan / maxVal) * 140}px` }}
                    title={`Pendapatan: ${rupiah(d.pendapatan)}`}
                  />
                  <div
                    className="bc-bar expense"
                    style={{ height: `${(d.pengeluaran / maxVal) * 140}px` }}
                    title={`Pengeluaran: ${rupiah(d.pengeluaran)}`}
                  />
                </div>
                <div className="bc-label">{d.bulan}</div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span className="legend-box income-color"></span> Pendapatan &nbsp;
            <span className="legend-box expense-color"></span> Pengeluaran
          </div>
        </div>

        {/* Detail Pengeluaran */}
        <div className="realisasi-card">
          <h3>🧾 Rincian Transaksi Anggaran</h3>
          <div className="realisasi-toolbar">
            <input
              className="realisasi-search"
              placeholder="🔍 Cari uraian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="realisasi-select" value={filterBidang} onChange={(e) => setFilterBidang(e.target.value)}>
              {BIDANG_LIST.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select className="realisasi-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="realisasi-table-wrapper">
            <table className="realisasi-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tanggal</th>
                  <th>Uraian Kegiatan</th>
                  <th>Bidang</th>
                  <th className="right">Jumlah</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetail.map((d, i) => (
                  <tr key={d.id}>
                    <td>{i + 1}</td>
                    <td>{d.tanggal}</td>
                    <td>{d.uraian}</td>
                    <td><span className="bidang-tag">{d.bidang}</span></td>
                    <td className="right">{rupiah(d.jumlah)}</td>
                    <td><span className={`badge ${BADGE_STATUS[d.status]}`}>{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export */}
        <div className="laporan-actions">
          <button className="export-btn" onClick={() => alert("Export PDF tersedia setelah integrasi backend.")}>
            📄 Export PDF
          </button>
          <button className="export-btn export-xl" onClick={() => alert("Export Excel tersedia setelah integrasi backend.")}>
            📊 Export Excel
          </button>
        </div>

      </div>
    </div>
  );
}
