import { useMemo, useState } from "react";
import "./Data-Anggaran.css";

const years = [2024, 2023, 2022, 2021];
const months = ["Semua Bulan", "Januari", "Februari", "Maret"];

const dummyRows = [
  { tgl: "Feb 2023", desk: "Transfer Dana Desa", kategori: "Pemasukan", anggaran: "Rp 560 juta", realisasi: "Rp 360 juta" },
  { tgl: "Feb 2023", desk: "Pembangunan Irigasi", kategori: "Belanja Modal", anggaran: "Rp 700 juta", realisasi: "Rp 250 juta" },
  { tgl: "Feb 2023", desk: "Bantuan Provinsi", kategori: "Belanja Modal", anggaran: "Rp 370 juta", realisasi: "Rp 170 juta" },
  { tgl: "Feb 2023", desk: "Pengadaan Alat Pertanian", kategori: "Belanja Desa", anggaran: "Rp 120 juta", realisasi: "Rp 120 juta" },
  { tgl: "Feb 2023", desk: "Retribusi Pasar Desa", kategori: "Belanja Modal", anggaran: "Rp 160 juta", realisasi: "Rp 100 juta" },
];

function Pill({ kind, children }) {
  return <span className={`kw-pill kw-pill--${kind}`}>{children}</span>;
}

export default function Keuangan() {
  const [tab, setTab] = useState("pemasukan"); // pemasukan | pengeluaran | laporan
  const [q, setQ] = useState("");
  const [year, setYear] = useState(2023);
  const [month, setMonth] = useState("Semua Bulan");
  const [page, setPage] = useState(2);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = !s
      ? dummyRows
      : dummyRows.filter((r) => (r.desk + " " + r.kategori).toLowerCase().includes(s));

    // contoh: tab filter
    if (tab === "pemasukan") return filtered.filter((r) => r.kategori === "Pemasukan");
    if (tab === "pengeluaran") return filtered.filter((r) => r.kategori !== "Pemasukan");
    return filtered;
  }, [q, tab]);

  return (
    <div className="kw-page">
      {/* Topbar */}
      <header className="kw-topbar">
        <div className="kw-brand">
          <span className="kw-logo">🏛️</span>
          <div className="kw-title">Manajemen Keuangan Desa</div>
        </div>

        <div className="kw-actions">
          <div className="kw-search">
            <span className="kw-search-ico">🔎</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari MK / Nama" />
          </div>

          <button className="kw-export" type="button">
            ⬇ Export PDF / Excel
          </button>
        </div>
      </header>

      <div className="kw-shell">
        {/* Left */}
        <main className="kw-main">
          {/* Stat cards */}
          <section className="kw-cards">
            <div className="kw-card">
              <div className="kw-card-ico">🏦</div>
              <div>
                <div className="kw-card-k">APBDes Anggaran</div>
                <div className="kw-card-v">Rp 3,1 M</div>
              </div>
              <div className="kw-card-water">💳</div>
            </div>

            <div className="kw-card">
              <div className="kw-card-ico">📋</div>
              <div>
                <div className="kw-card-k">Realisasi Anggaran</div>
                <div className="kw-card-v">Rp 1,1 M</div>
              </div>
              <div className="kw-card-water">✅</div>
            </div>

            <div className="kw-card">
              <div className="kw-card-ico">💰</div>
              <div>
                <div className="kw-card-k">Sisa Anggaran</div>
                <div className="kw-card-v">Rp 2,0 M</div>
              </div>
              <div className="kw-card-water">🧾</div>
            </div>
          </section>

          {/* Table Card */}
          <section className="kw-panel">
            <div className="kw-panel-head">
              <div className="kw-panel-title">Monitoring Pemasukan &amp; Pengeluaran</div>
              <button className="kw-link" type="button">Export PDF / Excel ›</button>
            </div>

            <div className="kw-tabs">
              <button className={`kw-tab ${tab === "pemasukan" ? "is-active" : ""}`} onClick={() => setTab("pemasukan")} type="button">
                ● Pemasukan
              </button>
              <button className={`kw-tab ${tab === "pengeluaran" ? "is-active" : ""}`} onClick={() => setTab("pengeluaran")} type="button">
                ○ Pengeluaran
              </button>
              <button className={`kw-tab ${tab === "laporan" ? "is-active" : ""}`} onClick={() => setTab("laporan")} type="button">
                📄 Laporan
              </button>
            </div>

            <div className="kw-tableWrap">
              <table className="kw-table">
                <thead>
                  <tr>
                    <th>TANGGAL</th>
                    <th>DESKRIPSI</th>
                    <th>KATEGORI</th>
                    <th>ANGGARAN</th>
                    <th>REALISASI</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td className="kw-muted">{r.tgl}</td>
                      <td className="kw-strong">{r.desk}</td>
                      <td>
                        {r.kategori === "Pemasukan" ? (
                          <Pill kind="green">Pemasukan</Pill>
                        ) : r.kategori === "Belanja Modal" ? (
                          <Pill kind="amber">Belanja Modal</Pill>
                        ) : (
                          <Pill kind="mint">Belanja Desa</Pill>
                        )}
                      </td>
                      <td className="kw-muted">{r.anggaran}</td>
                      <td className="kw-strong">{r.realisasi}</td>
                      <td>
                        <button className="kw-detail" type="button">Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="kw-pager">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`kw-pageBtn ${page === p ? "is-active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom small stats */}
          <section className="kw-strip">
            <div className="kw-strip-item">
              <div className="kw-strip-big">Rp 560 <span className="kw-strip-unit">juta</span></div>
              <div className="kw-strip-sub">—</div>
            </div>
            <div className="kw-strip-item kw-strip-right">
              <div className="kw-strip-big">Rp 117 <span className="kw-strip-unit">juta</span></div>
              <div className="kw-strip-sub">Total Pemasukan Desa</div>
            </div>
          </section>

          {/* Charts placeholder */}
          <section className="kw-bottom">
            <div className="kw-chartCard">
              <div className="kw-chartTitle">Distribusi Belanja Desa</div>
              <div className="kw-chartPlaceholder">Pie Chart (dummy)</div>
              <div className="kw-chartFoot">
                <div className="kw-chartFootBig">Rp 857 <span className="kw-strip-unit">juta</span></div>
                <div className="kw-muted">TOTAL PENGGUNAAN</div>
              </div>
            </div>

            <div className="kw-chartCard">
              <div className="kw-chartTitle">Grafik Penggunaan Anggaran</div>
              <div className="kw-chartPlaceholder">Line Chart (dummy)</div>
              <div className="kw-chartFoot">
                <div className="kw-chartFootBig">Rp 350 <span className="kw-strip-unit">juta</span></div>
                <div className="kw-muted">TOTAL PEMASUKAN DESA</div>
              </div>
            </div>
          </section>
        </main>

        {/* Right sidebar */}
        <aside className="kw-side">
          <div className="kw-sideCard">
            <div className="kw-sideTitle">📅 Tahun Keuangan</div>

            <div className="kw-radioList">
              {years.map((y) => (
                <label key={y} className={`kw-radio ${year === y ? "is-active" : ""}`}>
                  <input type="radio" checked={year === y} onChange={() => setYear(y)} />
                  <span>{y}</span>
                </label>
              ))}
            </div>

            <hr className="kw-sep" />

            <div className="kw-sideTitle">✅ Bulan</div>
            <div className="kw-radioList">
              {months.map((m) => (
                <label key={m} className={`kw-radio ${month === m ? "is-active" : ""}`}>
                  <input type="radio" checked={month === m} onChange={() => setMonth(m)} />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="kw-sideCard">
            <div className="kw-sideTitle">Statistik Pendapatan</div>
            <div className="kw-statList">
              <div className="kw-statItem">💵 Dana Desa</div>
              <div className="kw-statItem">🛵 Pendapatan Asli Desa</div>
              <div className="kw-statItem">🏢 Bantuan Provinsi</div>
            </div>
          </div>

          <div className="kw-sideCard kw-gauge">
            <div className="kw-sideTitle">Statistik Pendapatan</div>
            <div className="kw-gaugeRing">
              <div className="kw-gaugeVal">857<span> juta</span></div>
            </div>
            <div className="kw-muted">Total Pemasukan Desa</div>
          </div>
        </aside>
      </div>
    </div>
  );
}