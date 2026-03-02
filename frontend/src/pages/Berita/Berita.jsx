import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./berita.css";
import news from "../../data/news";

export default function Berita() {
  const isLoggedIn = localStorage.getItem("isAuth") === "true";
  const navigate = useNavigate();

  // Dummy state for admin add/delete simulation
  const [articles, setArticles] = useState(news);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // show many items on berita page; recent sorts by date (most recent first)
  const recent = [...articles].sort((a,b)=> b.date.localeCompare(a.date)).slice(0, 6);
  const popular = [...articles].sort((a,b)=>b.views-a.views).slice(0,3);

  const handleDelete = (id) => {
    if (window.confirm("Hapus berita ini?")) {
      setArticles(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleAddBerita = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem = {
      id: Date.now(),
      title: newTitle,
      date: new Date().toISOString().split("T")[0],
      author: "Admin",
      excerpt: "Klik untuk membaca selengkapnya...",
      views: 0,
      img: "",
    };
    setArticles(prev => [newItem, ...prev]);
    setNewTitle("");
    setShowForm(false);
  };

  return (
    <div className="berita-page container">
      <header className="berita-hero">
        <h1>Berita Desa</h1>
        <p>Kumpulan berita terkini dan populer dari Desa Bahagia</p>
      </header>

      {/* ====== ADMIN TOOLBAR (login only) ====== */}
      {isLoggedIn && (
        <div className="berita-admin-bar">
          <span className="berita-admin-badge">🔧 Mode Admin</span>
          <button className="btn berita-add-btn" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Batal" : "＋ Tambah Berita"}
          </button>
        </div>
      )}

      {/* Add berita form (login only) */}
      {isLoggedIn && showForm && (
        <form className="berita-add-form" onSubmit={handleAddBerita}>
          <input
            className="berita-add-input"
            placeholder="Judul berita baru..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button className="btn" type="submit">Simpan</button>
        </form>
      )}

      <div className="berita-grid">
        <main className="berita-main">
          <h2>Berita Terkini</h2>
          <div className="news-list">
            {recent.map(n => (
              <article key={n.id} className="news-card">
                {n.img && <img src={n.img} alt={n.title} />}
                {!n.img && isLoggedIn && <div className="news-img-placeholder">📰</div>}
                <div className="news-body">
                  <h3><Link to={`/berita/${n.id}`}>{n.title}</Link></h3>
                  <p className="meta">{n.date} • {n.author}</p>
                  <p className="excerpt">{n.excerpt}</p>
                  {/* Admin actions */}
                  {isLoggedIn && (
                    <div className="news-admin-actions">
                      <button className="table-btn-edit-sm">✏️ Edit</button>
                      <button className="table-btn-delete-sm" onClick={() => handleDelete(n.id)}>🗑️ Hapus</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="berita-aside">
          <section>
            <h3>Populer</h3>
            <ul className="popular-list">
              {popular.map(p => (
                <li key={p.id}><Link to={`/berita/${p.id}`}>{p.title}</Link></li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Kategori (dummy)</h3>
            <ul className="cat-list">
              <li>Pengumuman</li>
              <li>Kegiatan</li>
              <li>Keuangan</li>
            </ul>
          </section>

          {/* Login prompt for public users */}
          {!isLoggedIn && (
            <section className="berita-login-cta">
              <p>Ingin mengelola berita desa?</p>
              <button className="btn" onClick={() => navigate("/login")}>Login</button>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
