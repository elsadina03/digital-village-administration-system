import { useMemo, useState, useEffect, useContext } from "react";
import "./galeri.css";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { LuSearch } from "react-icons/lu";

export default function Galeri() {
  const { isAdmin } = useContext(AuthContext);
  const canManage = isAdmin();

  const [galeriData, setGaleriData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState("Semua");
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState(null);

  // Upload form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ judul: "", kategori: "Kegiatan", tanggal: "", image: null });
  const [saving, setSaving] = useState(false);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get("/gallery");
      const data = res.data.data ?? res.data;
      setGaleriData(data);
    } catch (err) {
      console.error("Gagal memuat galeri", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGallery(); }, []);

  const KATEGORI_ALL = useMemo(() => {
    const cats = [...new Set(galeriData.map(g => g.kategori).filter(Boolean))];
    return ["Semua", ...cats];
  }, [galeriData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return galeriData.filter((g) => {
      const matchKat = kategori === "Semua" || g.kategori === kategori;
      const matchQ = !q || (g.judul || "").toLowerCase().includes(q);
      return matchKat && matchQ;
    });
  }, [galeriData, kategori, search]);

  const handlePrev = () => {
    const idx = filtered.findIndex(g => g.id === lightbox.id);
    if (idx > 0) setLightbox(filtered[idx - 1]);
  };
  const handleNext = () => {
    const idx = filtered.findIndex(g => g.id === lightbox.id);
    if (idx < filtered.length - 1) setLightbox(filtered[idx + 1]);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Hapus foto ini dari galeri?")) return;
    try {
      await api.delete(`/gallery/${id}`);
      setGaleriData(prev => prev.filter(g => g.id !== id));
      if (lightbox?.id === id) setLightbox(null);
    } catch {
      alert("Gagal menghapus foto.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.image) { alert("Pilih gambar terlebih dahulu."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("judul", form.judul);
      fd.append("kategori", form.kategori);
      fd.append("tanggal", form.tanggal);
      fd.append("image", form.image);
      await api.post("/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm({ judul: "", kategori: "Kegiatan", tanggal: "", image: null });
      setShowForm(false);
      fetchGallery();
    } catch {
      alert("Gagal mengupload foto.");
    } finally {
      setSaving(false);
    }
  };

  const imgUrl = (g) => {
    if (g.image_url) return g.image_url;
    if (g.url) return g.url;
    if (g.image_path) {
      return g.image_path.startsWith('http')
        ? g.image_path
        : `http://127.0.0.1:8000/storage/${g.image_path}`;
    }
    if (g.image) return `http://127.0.0.1:8000/storage/${g.image}`;
    return "";
  };

  if (loading) return <div className="galeri-root"><div className="galeri-container"><p>Memuat galeri...</p></div></div>;

  return (
    <div className="galeri-root">
      <div className="galeri-container">

        {/* Header */}
        <div className="galeri-header">
          <h1 className="galeri-title">🖼️ Galeri Desa Bahagia</h1>
          <p className="galeri-subtitle">Dokumentasi kegiatan, pembangunan, dan momen penting Desa Bahagia.</p>
        </div>

        {/* Admin upload */}
        {canManage && (
          <div style={{ marginBottom: "1rem" }}>
            <button className="kat-btn active" onClick={() => setShowForm(v => !v)}>
              {showForm ? "✕ Batal" : "＋ Upload Foto"}
            </button>
          </div>
        )}
        {canManage && showForm && (
          <form onSubmit={handleUpload} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label>Judul Foto</label><br />
                <input value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} placeholder="Judul foto" style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc" }} />
              </div>
              <div>
                <label>Kategori</label><br />
                <select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc" }}>
                  {["Kegiatan", "Bantuan Sosial", "Pemerintahan", "Pembangunan", "Kesehatan", "Keamanan"].map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label>Tanggal</label><br />
                <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} style={{ width: "100%", padding: "0.4rem", borderRadius: "4px", border: "1px solid #ccc" }} />
              </div>
              <div>
                <label>File Gambar <span style={{ color: "red" }}>*</span></label><br />
                <input type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files[0] })} />
              </div>
            </div>
            <button type="submit" className="kat-btn active" disabled={saving}>{saving ? "Mengupload..." : "Simpan"}</button>
          </form>
        )}

        {/* Toolbar */}
        <div className="galeri-toolbar">
          <div className="galeri-search-wrapper">
            <LuSearch className="galeri-search-icon" />
            <input
              className="galeri-search"
              placeholder="Cari foto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="galeri-filter">
            {KATEGORI_ALL.map((k) => (
              <button
                key={k}
                className={`kat-btn ${kategori === k ? "active" : ""}`}
                onClick={() => setKategori(k)}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="galeri-empty">Tidak ada foto yang ditemukan.</div>
        ) : (
          <div className="galeri-grid">
            {filtered.map((g) => (
              <div className="galeri-item" key={g.id} onClick={() => setLightbox(g)}>
                <img src={imgUrl(g)} alt={g.judul} loading="lazy" />
                <div className="galeri-overlay">
                  <span className="galeri-tag">{g.kategori}</span>
                  <p className="galeri-judul">{g.judul}</p>
                  <span className="galeri-tgl">{g.tanggal}</span>
                  {canManage && (
                    <button
                      style={{ marginTop: "0.4rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.75rem" }}
                      onClick={(e) => handleDelete(g.id, e)}
                    >
                      🗑️ Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
              <button className="lb-nav lb-prev" onClick={handlePrev}>‹</button>
              <div className="lb-img-wrap">
                <img src={imgUrl(lightbox)} alt={lightbox.judul} />
              </div>
              <button className="lb-nav lb-next" onClick={handleNext}>›</button>
              <div className="lb-info">
                <span className="lb-kat">{lightbox.kategori}</span>
                <h3>{lightbox.judul}</h3>
                <p>📅 {lightbox.tanggal}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
