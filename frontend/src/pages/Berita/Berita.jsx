import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./berita.css";
import api from "../../services/api";
import { AuthContext, ROLES, STAFF_ROLES } from "../../context/AuthContext";

export default function Berita() {
  const { isAdmin, hasRole } = useContext(AuthContext);
  const canManage      = isAdmin() || hasRole(ROLES.SEKRETARIS);
  const canSeeAnggaran = hasRole(...STAFF_ROLES);

  const getExcerpt = (content) => {
    if (!content) return "";
    const filtered = content
      .split("\n")
      .filter(line => canSeeAnggaran || !line.trim().startsWith("Anggaran"))
      .join(" ")
      .trim();
    return filtered.length > 120 ? filtered.substring(0, 120) + "..." : filtered;
  };
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image: null });
  const [saving, setSaving] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/news");
      const data = res.data.data ?? res.data;
      setArticles(data);
    } catch (err) {
      console.error("Gagal memuat berita", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const recent  = [...articles].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const popular = [...articles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 3);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus berita ini?")) return;
    try {
      await api.delete(`/news/${id}`);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch {
      alert("Gagal menghapus berita.");
    }
  };

  const handleAddBerita = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert("Judul dan konten wajib diisi.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      if (form.image) formData.append("image", form.image);

      await api.post("/news", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ title: "", content: "", image: null });
      setShowForm(false);
      fetchNews();
    } catch {
      alert("Gagal menyimpan berita.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="berita-page container">
      <header className="berita-hero">
        <h1>Berita Desa</h1>
        <p>Kumpulan berita terkini dan populer dari Desa Bahagia</p>
      </header>

      {/* ====== ADMIN TOOLBAR (admin only) ====== */}
      {canManage && (
        <div className="berita-admin-bar">
          <span className="berita-admin-badge">🔧 Mode Kelola</span>
          <button className="btn berita-add-btn" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Batal" : "＋ Tambah Berita"}
          </button>
        </div>
      )}

      {/* Add berita form (admin only) */}
      {canManage && showForm && (
        <form className="berita-add-form" onSubmit={handleAddBerita}>
          <input
            className="berita-add-input"
            placeholder="Judul berita..."
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="berita-add-input"
            placeholder="Konten berita..."
            rows={4}
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setForm({ ...form, image: e.target.files[0] })}
          />
          <button className="btn" type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </form>
      )}

      {loading ? (
        <p style={{ textAlign: "center", padding: "2rem" }}>Memuat berita...</p>
      ) : (
        <div className="berita-grid">
          <main className="berita-main">
            <h2>Berita Terkini</h2>
            <div className="news-list">
              {recent.length === 0 ? (
                <p className="empty-state">Belum ada berita.</p>
              ) : (
                recent.map(n => (
                  <article key={n.id} className="news-card">
                    {n.image_path
                      ? <img src={`http://127.0.0.1:8000/storage/${n.image_path}`} alt={n.title} />
                      : <div className="news-img-placeholder">📰</div>
                    }
                    <div className="news-body">
                      <h3><Link to={`/berita/${n.id}`}>{n.title}</Link></h3>
                      <p className="meta">{n.created_at?.split("T")[0]} • {n.author?.name ?? "Admin"}</p>
                      <p className="excerpt">{getExcerpt(n.content)}</p>
                      {canManage && (
                        <div className="news-admin-actions">
                          <button className="table-btn-delete-sm" onClick={() => handleDelete(n.id)}>🗑️ Hapus</button>
                        </div>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </main>

          <aside className="berita-aside">
            <section>
              <h3>Terbaru</h3>
              <ul className="popular-list">
                {popular.map(p => (
                  <li key={p.id}><Link to={`/berita/${p.id}`}>{p.title}</Link></li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
