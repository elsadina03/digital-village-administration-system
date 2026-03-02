import { useState } from "react";
import "./laporan-dana-desa.css";

function rupiah(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

const TAHUN_LIST = ["2025", "2024", "2023"];

const laporanData = {
  "2025": {
    total: 850000000,
    terealisasi: 612000000,
    sisa: 238000000,
    sumber: [
      { nama: "DD (Dana Desa) APBN", jumlah: 450000000 },
      { nama: "ADD (Alokasi Dana Desa)", jumlah: 250000000 },
      { nama: "Bagi Hasil Pajak & Retribusi", jumlah: 100000000 },
      { nama: "Bantuan Keuangan Provinsi", jumlah: 50000000 },
    ],
    realisasi: [
      { bidang: "Penyelenggaraan Pemerintahan", anggaran: 180000000, realisasi: 165000000 },
      { bidang: "Pembangunan Desa", anggaran: 350000000, realisasi: 240000000 },
      { bidang: "Pembinaan Kemasyarakatan", anggaran: 120000000, realisasi: 95000000 },
      { bidang: "Pemberdayaan Masyarakat", anggaran: 150000000, realisasi: 82000000 },
      { bidang: "Penanggulangan Bencana", anggaran: 50000000, realisasi: 30000000 },
    ],
  },
  "2024": {
    total: 780000000,
    terealisasi: 760000000,
    sisa: 20000000,
    sumber: [
      { nama: "DD (Dana Desa) APBN", jumlah: 420000000 },
      { nama: "ADD (Alokasi Dana Desa)", jumlah: 220000000 },
      { nama: "Bagi Hasil Pajak & Retribusi", jumlah: 90000000 },
      { nama: "Bantuan Keuangan Provinsi", jumlah: 50000000 },
    ],
    realisasi: [
      { bidang: "Penyelenggaraan Pemerintahan", anggaran: 160000000, realisasi: 158000000 },
      { bidang: "Pembangunan Desa", anggaran: 320000000, realisasi: 315000000 },
      { bidang: "Pembinaan Kemasyarakatan", anggaran: 110000000, realisasi: 107000000 },
      { bidang: "Pemberdayaan Masyarakat", anggaran: 140000000, realisasi: 135000000 },
      { bidang: "Penanggulangan Bencana", anggaran: 50000000, realisasi: 45000000 },
    ],
  },
  "2023": {
    total: 700000000,
    terealisasi: 690000000,
    sisa: 10000000,
    sumber: [
      { nama: "DD (Dana Desa) APBN", jumlah: 380000000 },
      { nama: "ADD (Alokasi Dana Desa)", jumlah: 200000000 },
      { nama: "Bagi Hasil Pajak & Retribusi", jumlah: 80000000 },
      { nama: "Bantuan Keuangan Provinsi", jumlah: 40000000 },
    ],
    realisasi: [
      { bidang: "Penyelenggaraan Pemerintahan", anggaran: 140000000, realisasi: 138000000 },
      { bidang: "Pembangunan Desa", anggaran: 290000000, realisasi: 285000000 },
      { bidang: "Pembinaan Kemasyarakatan", anggaran: 100000000, realisasi: 99000000 },
      { bidang: "Pemberdayaan Masyarakat", anggaran: 120000000, realisasi: 118000000 },
      { bidang: "Penanggulangan Bencana", anggaran: 50000000, realisasi: 50000000 },
    ],
  },
};

export default function LaporanDanaDesa() {
  const [tahun, setTahun] = useState("2025");
  const d = laporanData[tahun];
  const persen = Math.round((d.terealisasi / d.total) * 100);

  return (
    <div className="laporan-root">
      <div className="laporan-container">

        {/* Header */}
        <div className="laporan-header">
          <div>
            <h1 className="laporan-title">📑 Laporan Dana Desa</h1>
            <p className="laporan-subtitle">Transparansi penggunaan dana desa Bahagia kepada masyarakat.</p>
          </div>
          <div className="laporan-tahun-selector">
            <span className="selector-label">Tahun Anggaran:</span>
            {TAHUN_LIST.map((t) => (
              <button
                key={t}
                className={`tahun-btn ${tahun === t ? "active" : ""}`}
                onClick={() => setTahun(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Ringkasan */}
        <div className="laporan-summary">
          <div className="summary-card" style={{ borderTop: "4px solid #0fa78d" }}>
            <div className="summary-label">Total Anggaran</div>
            <div className="summary-value green">{rupiah(d.total)}</div>
          </div>
          <div className="summary-card" style={{ borderTop: "4px solid #3b82f6" }}>
            <div className="summary-label">Terealisasi</div>
            <div className="summary-value blue">{rupiah(d.terealisasi)}</div>
          </div>
          <div className="summary-card" style={{ borderTop: "4px solid #f59e0b" }}>
            <div className="summary-label">Sisa Anggaran</div>
            <div className="summary-value yellow">{rupiah(d.sisa)}</div>
          </div>
          <div className="summary-card" style={{ borderTop: "4px solid #8b5cf6" }}>
            <div className="summary-label">Persentase Realisasi</div>
            <div className="summary-value purple">{persen}%</div>
          </div>
        </div>

        {/* Progress bar realisasi */}
        <div className="laporan-progress-card">
          <div className="prog-header">
            <span>Realisasi Anggaran {tahun}</span>
            <strong>{persen}%</strong>
          </div>
          <div className="prog-track">
            <div className="prog-fill" style={{ width: `${persen}%` }} />
          </div>
          <div className="prog-footer">
            <span>{rupiah(d.terealisasi)} dari {rupiah(d.total)}</span>
          </div>
        </div>

        {/* 2 kolom: sumber & distribusi */}
        <div className="laporan-two-col">

          {/* Sumber Dana */}
          <div className="laporan-card">
            <h3>💰 Sumber Dana</h3>
            <table className="laporan-table">
              <thead>
                <tr>
                  <th>Sumber</th>
                  <th className="right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {d.sumber.map((s) => (
                  <tr key={s.nama}>
                    <td>{s.nama}</td>
                    <td className="right green-text">{rupiah(s.jumlah)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td className="right"><strong>{rupiah(d.total)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Realisasi per Bidang */}
          <div className="laporan-card">
            <h3>📊 Realisasi per Bidang</h3>
            <table className="laporan-table">
              <thead>
                <tr>
                  <th>Bidang</th>
                  <th className="right">Anggaran</th>
                  <th className="right">Realisasi</th>
                  <th className="right">%</th>
                </tr>
              </thead>
              <tbody>
                {d.realisasi.map((r) => {
                  const p = Math.round((r.realisasi / r.anggaran) * 100);
                  return (
                    <tr key={r.bidang}>
                      <td>{r.bidang}</td>
                      <td className="right">{rupiah(r.anggaran)}</td>
                      <td className="right blue-text">{rupiah(r.realisasi)}</td>
                      <td className="right">
                        <span className={`persen-badge ${p >= 80 ? "good" : p >= 50 ? "mid" : "low"}`}>{p}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bar chart visual anggaran vs realisasi */}
        <div className="laporan-card">
          <h3>📈 Grafik Anggaran vs Realisasi per Bidang ({tahun})</h3>
          <div className="chart-wrapper">
            {d.realisasi.map((r) => {
              const pAnggaran = 100;
              const pRealisasi = Math.round((r.realisasi / r.anggaran) * 100);
              return (
                <div className="chart-row" key={r.bidang}>
                  <div className="chart-label">{r.bidang}</div>
                  <div className="chart-bars">
                    <div className="bar-group">
                      <div className="bar anggaran-bar" style={{ width: `${pAnggaran}%` }}>
                        <span>{rupiah(r.anggaran)}</span>
                      </div>
                    </div>
                    <div className="bar-group">
                      <div className={`bar realisasi-bar ${pRealisasi < 50 ? "low" : ""}`} style={{ width: `${pRealisasi}%` }}>
                        <span>{rupiah(r.realisasi)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="chart-legend">
              <span className="legend-box anggaran-color"></span> Anggaran &nbsp;
              <span className="legend-box realisasi-color"></span> Realisasi
            </div>
          </div>
        </div>

        {/* Tombol export dummy */}
        <div className="laporan-actions">
          <button className="export-btn" onClick={() => alert("Fitur export PDF akan tersedia setelah integrasi backend.")}>
            📄 Export PDF
          </button>
          <button className="export-btn export-xl" onClick={() => alert("Fitur export Excel akan tersedia setelah integrasi backend.")}>
            📊 Export Excel
          </button>
        </div>

      </div>
    </div>
  );
}
