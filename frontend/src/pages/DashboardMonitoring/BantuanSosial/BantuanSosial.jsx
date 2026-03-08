import { useMemo, useState, useEffect, useContext } from "react";
import "./bantuan-sosial.css";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";

const STATUS_COLOR = {
  "Layak": "badge-green",
  "Perlu Verifikasi": "badge-yellow",
  "Tidak Layak": "badge-red",
};

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n || 0);

export default function BantuanSosial() {
  const { isAdmin } = useContext(AuthContext);
  const canManage = isAdmin();

  // Data state
  const [recipients, setRecipients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState({ total_penerima: 0, jenis_bantuan: 0, total_distribusi: 0, perlu_verifikasi: 0 });
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("Semua");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    citizen_id: "", social_assistance_id: "", nominal: "", tanggal_terima: "", status: "Layak",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, progRes] = await Promise.all([
        api.get("/assistance-recipients"),
        api.get("/social-assistances"),
      ]);
      const recData = recRes.data.data ?? recRes.data;
      const progData = progRes.data.data ?? progRes.data;
      setRecipients(recData);
      setPrograms(progData);

      // compute stats
      const totalPenerima = recData.length;
      const jenisBantuan = progData.length;
      const totalDistribusi = recData.reduce((s, r) => s + Number(r.nominal || 0), 0);
      const perluVerifikasi = recData.filter(r => r.status === "Perlu Verifikasi").length;
      setStats({ total_penerima: totalPenerima, jenis_bantuan: jenisBantuan, total_distribusi: totalDistribusi, perlu_verifikasi: perluVerifikasi });
    } catch (err) {
      console.error("Gagal memuat data bantuan sosial", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const programNames = ["Semua", ...programs.map(p => p.nama)];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recipients.filter((r) => {
      const nama = (r.citizen?.nama_lengkap || r.nama || "").toLowerCase();
      const nik  = r.citizen?.nik || r.nik || "";
      const prog = r.social_assistance?.nama || r.program_name || "";
      const matchQ = !q || nama.includes(q) || nik.includes(q);
      const matchProg = filterProgram === "Semua" || prog === filterProgram;
      return matchQ && matchProg;
    });
  }, [recipients, search, filterProgram]);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data penerima bantuan ini?")) return;
    try {
      await api.delete(`/assistance-recipients/${id}`);
      setRecipients(prev => prev.filter(r => r.id !== id));
      setStats(prev => ({ ...prev, total_penerima: prev.total_penerima - 1 }));
    } catch {
      alert("Gagal menghapus data.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.social_assistance_id || !form.nominal || !form.tanggal_terima) {
      alert("Lengkapi semua data wajib.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/assistance-recipients", form);
      const newRec = res.data.data ?? res.data;
      setRecipients(prev => [newRec, ...prev]);
      setForm({ citizen_id: "", social_assistance_id: "", nominal: "", tanggal_terima: "", status: "Layak" });
      setShowForm(false);
      fetchData();
    } catch {
      alert("Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { label: "Total Penerima", value: stats.total_penerima, icon: "👥", color: "#0fa78d" },
    { label: "Jenis Bantuan",  value: stats.jenis_bantuan,  icon: "📦", color: "#3b82f6" },
    { label: "Total Distribusi", value: formatRupiah(stats.total_distribusi), icon: "💰", color: "#f59e0b" },
    { label: "Perlu Verifikasi", value: stats.perlu_verifikasi, icon: "⚠️", color: "#ef4444" },
  ];

  if (loading) return <div className="bansos-root"><div className="bansos-container"><p>Memuat data bantuan sosial...</p></div></div>;

  return (
    <div className="bansos-root">
      <div className="bansos-container">

        {/* Header */}
        <div className="bansos-header">
          <div>
            <h1 className="bansos-title">🤝 Data Bantuan Sosial Desa Bahagia</h1>
            <p className="bansos-subtitle">
              {canManage
                ? "Kelola data penerima dan distribusi bantuan sosial desa."
                : "Informasi bantuan sosial Desa Bahagia."}
            </p>
          </div>
          {canManage && (
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
        {canManage && showForm && (
          <div className="bansos-form-card">
            <h3>Tambah Penerima Bantuan</h3>
            <form className="bansos-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Program Bantuan <span className="required">*</span></label>
                  <select value={form.social_assistance_id} onChange={(e) => setForm({ ...form, social_assistance_id: e.target.value })}>
                    <option value="">-- Pilih Program --</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>ID Warga (Citizen ID)</label>
                  <input value={form.citizen_id} onChange={(e) => setForm({ ...form, citizen_id: e.target.value })} placeholder="ID warga (opsional)" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nominal Bantuan (Rp) <span className="required">*</span></label>
                  <input type="number" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} placeholder="Contoh: 300000" />
                </div>
                <div className="form-group">
                  <label>Tanggal Terima <span className="required">*</span></label>
                  <input type="date" value={form.tanggal_terima} onChange={(e) => setForm({ ...form, tanggal_terima: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status Kelayakan</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="Layak">Layak</option>
                    <option value="Perlu Verifikasi">Perlu Verifikasi</option>
                    <option value="Tidak Layak">Tidak Layak</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
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
            {programNames.map((p) => (
              <button
                key={p}
                className={`jenis-btn ${filterProgram === p ? "active" : ""}`}
                onClick={() => setFilterProgram(p)}
              >
                {p}
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
                  <th>Program Bantuan</th>
                  <th>Nominal</th>
                  <th>Tgl Terima</th>
                  <th>Status</th>
                  {canManage && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const nama = r.citizen?.nama_lengkap || r.nama || "-";
                  const nik  = r.citizen?.nik || r.nik || "-";
                  const prog = r.social_assistance?.nama || r.program_name || "-";
                  return (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td className="nik-cell">{nik}</td>
                      <td>{nama}</td>
                      <td><span className="jenis-tag">{prog}</span></td>
                      <td>{formatRupiah(r.nominal)}</td>
                      <td>{r.tanggal_terima}</td>
                      <td><span className={`badge ${STATUS_COLOR[r.status] ?? ""}`}>{r.status}</span></td>
                      {canManage && (
                        <td>
                          <button className="btn-del" onClick={() => handleDelete(r.id)}>🗑️ Hapus</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Info distribusi */}
        <div className="bansos-info-box">
          <h4>📋 Catatan Distribusi</h4>
          <ul>
            <li>Data penerima divalidasi setiap 3 bulan sekali.</li>
            <li>Penerima dengan status <strong>Perlu Verifikasi</strong> harus dikonfirmasi ulang oleh Kepala Dusun.</li>
            <li>Penerima berstatus <strong>Tidak Layak</strong> tidak berhak menerima bantuan periode berikutnya.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
