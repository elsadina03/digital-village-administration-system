import { useMemo, useState } from "react";
import "./bantuan-sosial.css";

const JENIS_BANTUAN = ["Semua", "PKH", "BPNT", "BLT Dana Desa", "Bansos Sembako", "KIP"];

const dummyData = [
  { id: 1, nik: "3515010101010001", nama: "Siti Aminah",    dusun: "Dusun Makmur",    jenis: "PKH",            jumlah: "Rp 750.000", tglTerima: "2025-01-10", status: "Layak" },
  { id: 2, nik: "3515010101010003", nama: "Ahmad Sutanto",  dusun: "Dusun Sejahtera", jenis: "BPNT",           jumlah: "Rp 200.000", tglTerima: "2025-01-15", status: "Layak" },
  { id: 3, nik: "3515010101010004", nama: "Rina Marlina",   dusun: "Dusun Damai",     jenis: "BLT Dana Desa",  jumlah: "Rp 300.000", tglTerima: "2025-02-01", status: "Layak" },
  { id: 4, nik: "3515010101010006", nama: "Dewi Rahayu",    dusun: "Dusun Damai",     jenis: "Bansos Sembako", jumlah: "Rp 150.000", tglTerima: "2025-02-10", status: "Perlu Verifikasi" },
  { id: 5, nik: "3515010101010008", nama: "Wulandari",      dusun: "Dusun Makmur",    jenis: "KIP",            jumlah: "Rp 450.000", tglTerima: "2025-03-01", status: "Layak" },
  { id: 6, nik: "3515010101010010", nama: "Marsudi",        dusun: "Dusun Sejahtera", jenis: "PKH",            jumlah: "Rp 750.000", tglTerima: "2025-03-05", status: "Tidak Layak" },
];

const statCards = [
  { label: "Total Penerima", value: "86",        icon: "👥", color: "#0fa78d" },
  { label: "Jenis Bantuan",  value: "5",         icon: "📦", color: "#3b82f6" },
  { label: "Total Distribusi", value: "Rp 42 Jt", icon: "💰", color: "#f59e0b" },
  { label: "Perlu Verifikasi", value: "4",        icon: "⚠️", color: "#ef4444" },
];

const STATUS_COLOR = {
  "Layak": "badge-green",
  "Perlu Verifikasi": "badge-yellow",
  "Tidak Layak": "badge-red",
};

export default function BantuanSosial() {
  const isLoggedIn = localStorage.getItem("isAuth") === "true";

  const [data, setData] = useState(dummyData);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nik: "", nama: "", dusun: "Dusun Sejahtera",
    jenis: "PKH", jumlah: "", tglTerima: "", status: "Layak",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((d) => {
      const matchQ = !q || d.nama.toLowerCase().includes(q) || d.nik.includes(q);
      const matchJenis = filterJenis === "Semua" || d.jenis === filterJenis;
      return matchQ && matchJenis;
    });
  }, [data, search, filterJenis]);

  const handleDelete = (id) => {
    if (window.confirm("Hapus data penerima bantuan ini?")) {
      setData((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nik || !form.nama || !form.jumlah || !form.tglTerima) {
      alert("Lengkapi semua data wajib.");
      return;
    }
    setData((prev) => [...prev, { ...form, id: Date.now() }]);
    setForm({ nik: "", nama: "", dusun: "Dusun Sejahtera", jenis: "PKH", jumlah: "", tglTerima: "", status: "Layak" });
    setShowForm(false);
  };

  return (
    <div className="bansos-root">
      <div className="bansos-container">

        {/* Header */}
        <div className="bansos-header">
          <div>
            <h1 className="bansos-title">🤝 Data Bantuan Sosial Desa Bahagia</h1>
            <p className="bansos-subtitle">
              {isLoggedIn
                ? "Kelola data penerima dan distribusi bantuan sosial desa."
                : "Informasi bantuan sosial Desa Bahagia."}
            </p>
          </div>
          {isLoggedIn && (
            <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "✕ Tutup Form" : "+ Tambah Penerima"}
            </button>
          )}
        </div>

        {/* Stat Cards */}
        <div className="bansos-stats">
          {statCards.map((s) => (
            <div className="bansos-stat-card" key={s.label} style={{ borderTop: `4px solid ${s.color}` }}>
              <span className="bstat-icon">{s.icon}</span>
              <div>
                <div className="bstat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="bstat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Tambah */}
        {isLoggedIn && showForm && (
          <div className="bansos-form-card">
            <h3>Tambah Penerima Bantuan</h3>
            <form className="bansos-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>NIK <span className="required">*</span></label>
                  <input value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} placeholder="16 digit NIK" maxLength={16} />
                </div>
                <div className="form-group">
                  <label>Nama Lengkap <span className="required">*</span></label>
                  <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama penerima" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Dusun</label>
                  <select value={form.dusun} onChange={(e) => setForm({ ...form, dusun: e.target.value })}>
                    <option>Dusun Sejahtera</option>
                    <option>Dusun Makmur</option>
                    <option>Dusun Damai</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Jenis Bantuan</label>
                  <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value })}>
                    {JENIS_BANTUAN.filter(j => j !== "Semua").map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nominal Bantuan <span className="required">*</span></label>
                  <input value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} placeholder="Contoh: Rp 300.000" />
                </div>
                <div className="form-group">
                  <label>Tanggal Terima <span className="required">*</span></label>
                  <input type="date" value={form.tglTerima} onChange={(e) => setForm({ ...form, tglTerima: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status Kelayakan</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Layak</option>
                    <option>Perlu Verifikasi</option>
                    <option>Tidak Layak</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                <button type="submit" className="btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="bansos-toolbar">
          <input
            className="bansos-search"
            placeholder="🔍 Cari nama atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="bansos-filter-jenis">
            {JENIS_BANTUAN.map((j) => (
              <button
                key={j}
                className={`jenis-btn ${filterJenis === j ? "active" : ""}`}
                onClick={() => setFilterJenis(j)}
              >
                {j}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel */}
        <div className="bansos-table-wrapper">
          {filtered.length === 0 ? (
            <div className="bansos-empty">
              <p>Belum ada data penerima bantuan.</p>
            </div>
          ) : (
            <table className="bansos-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>NIK</th>
                  <th>Nama</th>
                  <th>Dusun</th>
                  <th>Jenis Bantuan</th>
                  <th>Nominal</th>
                  <th>Tgl Terima</th>
                  <th>Status</th>
                  {isLoggedIn && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id}>
                    <td>{i + 1}</td>
                    <td className="nik-cell">{d.nik}</td>
                    <td>{d.nama}</td>
                    <td>{d.dusun}</td>
                    <td><span className="jenis-tag">{d.jenis}</span></td>
                    <td>{d.jumlah}</td>
                    <td>{d.tglTerima}</td>
                    <td><span className={`badge ${STATUS_COLOR[d.status] ?? ""}`}>{d.status}</span></td>
                    {isLoggedIn && (
                      <td>
                        <button className="btn-del" onClick={() => handleDelete(d.id)}>🗑️ Hapus</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info distribusi */}
        {isLoggedIn && (
          <div className="bansos-info-box">
            <h4>📋 Catatan Distribusi</h4>
            <ul>
              <li>Data penerima divalidasi setiap 3 bulan sekali.</li>
              <li>Penerima dengan status <strong>Perlu Verifikasi</strong> harus dikonfirmasi ulang oleh Kepala Dusun.</li>
              <li>Penerima berstatus <strong>Tidak Layak</strong> tidak berhak menerima bantuan periode berikutnya.</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
