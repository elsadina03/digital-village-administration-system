import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./penduduk.css";

const dummyData = [
  { id: 1, nik: "3515010101010001", nama: "Budi Hermawan",    dusun: "Dusun Sejahtera", jenisKelamin: "Laki-laki",   usia: 45, status: "Kawin" },
  { id: 2, nik: "3515010101010002", nama: "Siti Aminah",      dusun: "Dusun Makmur",   jenisKelamin: "Perempuan", usia: 38, status: "Kawin" },
  { id: 3, nik: "3515010101010003", nama: "Ahmad Sutanto",    dusun: "Dusun Sejahtera", jenisKelamin: "Laki-laki",   usia: 52, status: "Kawin" },
  { id: 4, nik: "3515010101010004", nama: "Rina Marlina",     dusun: "Dusun Damai",    jenisKelamin: "Perempuan", usia: 29, status: "Belum Kawin" },
  { id: 5, nik: "3515010101010005", nama: "Yusuf Hidayat",    dusun: "Dusun Makmur",   jenisKelamin: "Laki-laki",   usia: 33, status: "Kawin" },
  { id: 6, nik: "3515010101010006", nama: "Dewi Rahayu",      dusun: "Dusun Damai",    jenisKelamin: "Perempuan", usia: 24, status: "Belum Kawin" },
  { id: 7, nik: "3515010101010007", nama: "Hendra Saputra",   dusun: "Dusun Sejahtera", jenisKelamin: "Laki-laki",   usia: 41, status: "Kawin" },
  { id: 8, nik: "3515010101010008", nama: "Wulandari",        dusun: "Dusun Makmur",   jenisKelamin: "Perempuan", usia: 17, status: "Belum Kawin" },
];

const stats = [
  { label: "Total Penduduk", value: "345", color: "#0fa78d" },
  { label: "Laki-laki",      value: "172", color: "#3b82f6" },
  { label: "Perempuan",      value: "173", color: "#ec4899" },
  { label: "Jumlah KK",      value: "98",  color: "#f59e0b" },
];

export default function Penduduk() {
  const isLoggedIn = localStorage.getItem("isAuth") === "true";
  const navigate = useNavigate();

  const [data, setData]         = useState(dummyData);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ nik: "", nama: "", dusun: "Dusun Sejahtera", jenisKelamin: "Laki-laki", usia: "", status: "Belum Kawin" });

  const filtered = data.filter(d =>
    d.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.nik.includes(search)
  );

  const handleDelete = (id) => {
    if (window.confirm("Hapus data penduduk ini?")) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nik || !form.nama || !form.usia) return;
    setData(prev => [...prev, { ...form, id: Date.now(), usia: Number(form.usia) }]);
    setForm({ nik: "", nama: "", dusun: "Dusun Sejahtera", jenisKelamin: "Laki-laki", usia: "", status: "Belum Kawin" });
    setShowForm(false);
  };

  return (
    <div className="penduduk-root">
      <div className="penduduk-container">

        {/* Page header */}
        <div className="penduduk-header">
          <div>
            <h1 className="penduduk-title">👥 Data Kependudukan Desa Bahagia</h1>
            <p className="penduduk-subtitle">
              {isLoggedIn
                ? "Kelola dan pantau data kependudukan desa secara menyeluruh."
                : "Informasi kependudukan Desa Bahagia. Login untuk mengelola data."}
            </p>
          </div>
          {!isLoggedIn && (
            <button className="btn" onClick={() => navigate("/login")}>Login untuk Kelola</button>
          )}
        </div>

        {/* Stats cards */}
        <div className="penduduk-stats">
          {stats.map(s => (
            <div className="penduduk-stat-card" key={s.label} style={{ borderTop: `4px solid ${s.color}` }}>
              <div className="pstat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="pstat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart visual (simple CSS bars) */}
        <section className="penduduk-chart-section">
          <h3>Persebaran per Dusun</h3>
          <div className="penduduk-bars">
            {[
              { dusun: "Dusun Sejahtera", persen: 45 },
              { dusun: "Dusun Makmur",    persen: 35 },
              { dusun: "Dusun Damai",     persen: 20 },
            ].map(d => (
              <div className="pbar-row" key={d.dusun}>
                <div className="pbar-label">{d.dusun}</div>
                <div className="pbar-track">
                  <div className="pbar-fill" style={{ width: `${d.persen}%` }} />
                </div>
                <div className="pbar-pct">{d.persen}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin toolbar (login only) */}
        {isLoggedIn && (
          <div className="penduduk-admin-bar">
            <span className="admin-badge">🔧 Mode Admin</span>
            <button className="btn" onClick={() => setShowForm(v => !v)}>
              {showForm ? "✕ Batal" : "＋ Tambah Penduduk"}
            </button>
          </div>
        )}

        {/* Add form (login only) */}
        {isLoggedIn && showForm && (
          <form className="penduduk-form" onSubmit={handleSubmit}>
            <h4>Tambah Data Penduduk</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>NIK</label>
                <input placeholder="16 digit NIK" value={form.nik} onChange={e => setForm(p=>({...p, nik: e.target.value}))} required />
              </div>
              <div className="form-field">
                <label>Nama Lengkap</label>
                <input placeholder="Nama lengkap" value={form.nama} onChange={e => setForm(p=>({...p, nama: e.target.value}))} required />
              </div>
              <div className="form-field">
                <label>Dusun</label>
                <select value={form.dusun} onChange={e => setForm(p=>({...p, dusun: e.target.value}))}>
                  <option>Dusun Sejahtera</option>
                  <option>Dusun Makmur</option>
                  <option>Dusun Damai</option>
                </select>
              </div>
              <div className="form-field">
                <label>Jenis Kelamin</label>
                <select value={form.jenisKelamin} onChange={e => setForm(p=>({...p, jenisKelamin: e.target.value}))}>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </div>
              <div className="form-field">
                <label>Usia</label>
                <input type="number" placeholder="Usia" min={0} max={120} value={form.usia} onChange={e => setForm(p=>({...p, usia: e.target.value}))} required />
              </div>
              <div className="form-field">
                <label>Status Perkawinan</label>
                <select value={form.status} onChange={e => setForm(p=>({...p, status: e.target.value}))}>
                  <option>Belum Kawin</option>
                  <option>Kawin</option>
                  <option>Cerai Hidup</option>
                  <option>Cerai Mati</option>
                </select>
              </div>
            </div>
            <button className="btn" type="submit">Simpan Data</button>
          </form>
        )}

        {/* Public: aggregate demographic info only */}
        {!isLoggedIn && (
          <>
            <section className="penduduk-demografi-section">
              <h3>Kelompok Usia</h3>
              <div className="penduduk-bars">
                {[
                  { label: "Anak-anak (< 17 th)",   persen: 18 },
                  { label: "Dewasa (17 – 55 th)",    persen: 61 },
                  { label: "Lansia (> 55 th)",       persen: 21 },
                ].map(d => (
                  <div className="pbar-row" key={d.label}>
                    <div className="pbar-label">{d.label}</div>
                    <div className="pbar-track">
                      <div className="pbar-fill" style={{ width: `${d.persen}%` }} />
                    </div>
                    <div className="pbar-pct">{d.persen}%</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="penduduk-demografi-section">
              <h3>Status Perkawinan (Agregat)</h3>
              <div className="penduduk-bars">
                {[
                  { label: "Kawin",        persen: 58 },
                  { label: "Belum Kawin",  persen: 35 },
                  { label: "Cerai / Janda / Duda", persen: 7 },
                ].map(d => (
                  <div className="pbar-row" key={d.label}>
                    <div className="pbar-label">{d.label}</div>
                    <div className="pbar-track">
                      <div className="pbar-fill" style={{ width: `${d.persen}%` }} />
                    </div>
                    <div className="pbar-pct">{d.persen}%</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="penduduk-public-note">
              🔒 <strong>Data individu bersifat rahasia.</strong> Informasi detail seperti NIK, nama warga, dan data pribadi lainnya hanya dapat diakses oleh petugas desa yang telah login.
            </div>
          </>
        )}

        {/* Admin only: search + full table */}
        {isLoggedIn && (
          <>
            <div className="penduduk-search-row">
              <input
                className="penduduk-search"
                placeholder="🔍 Cari nama atau NIK..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="penduduk-count">Menampilkan {filtered.length} dari {data.length} data</span>
            </div>

            <div className="penduduk-table-wrap">
              <table className="penduduk-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIK</th>
                    <th>Nama Lengkap</th>
                    <th>Dusun</th>
                    <th>Jenis Kelamin</th>
                    <th>Usia</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <tr key={d.id}>
                      <td>{i + 1}</td>
                      <td className="nik-cell">{d.nik}</td>
                      <td>{d.nama}</td>
                      <td>{d.dusun}</td>
                      <td>
                        <span className={`jk-badge ${d.jenisKelamin === "Laki-laki" ? "jk-l" : "jk-p"}`}>
                          {d.jenisKelamin}
                        </span>
                      </td>
                      <td>{d.usia}</td>
                      <td>{d.status}</td>
                      <td className="action-cell">
                        <button className="table-btn-edit-sm">✏️</button>
                        <button className="table-btn-delete-sm" onClick={() => handleDelete(d.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="empty-row">Tidak ada data yang cocok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
