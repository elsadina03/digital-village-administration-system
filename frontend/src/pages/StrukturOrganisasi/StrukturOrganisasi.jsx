import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import img1 from "../../assets/IMG_3050.JPG";
import img2 from "../../assets/Three Simple Steps to Empowered Word-Learning - Peers and Pedagogy.jpeg";
import "./struktur-organisasi.css";
import { AuthContext } from "../../context/AuthContext";

const initialMembers = [
  { id: 1,  nama: "Budi Hermawan",     jabatan: "Kepala Desa",         level: 1, img: img1 },
  { id: 2,  nama: "Dwi Nur Atika",     jabatan: "Sekretaris Desa",     level: 2, img: img2 },
  { id: 3,  nama: "Siti Aminah",       jabatan: "Bendahara Desa",      level: 2, img: img1 },
  { id: 4,  nama: "Ahmad Sutanto",     jabatan: "Kasi Pemerintahan",   level: 3, img: img2 },
  { id: 5,  nama: "Rina Marlina",      jabatan: "Kasi Kesejahteraan",  level: 3, img: img1 },
  { id: 6,  nama: "Yusuf Hidayat",     jabatan: "Kasi Pelayanan",      level: 3, img: img2 },
  { id: 7,  nama: "Hendra Saputra",    jabatan: "Kadus Sejahtera",     level: 4, img: img1 },
  { id: 8,  nama: "Dewi Rahayu",       jabatan: "Kadus Makmur",        level: 4, img: img2 },
  { id: 9,  nama: "Wulandari",         jabatan: "Kadus Damai",         level: 4, img: img1 },
];

const levelLabels = {
  1: "Kepala Desa",
  2: "Perangkat Utama",
  3: "Kasi & Urusan",
  4: "Kepala Dusun",
};

const levelColors = {
  1: "#0b5346",
  2: "#1fa18a",
  3: "#0fa78d",
  4: "#5ec4b3",
};

export default function StrukturOrganisasi() {
  const { isAdmin } = useContext(AuthContext);
  const canEdit = isAdmin();
  const navigate    = useNavigate();
  const [members, setMembers] = useState(initialMembers);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState({ nama: "", jabatan: "", level: 3 });

  const levels = [1, 2, 3, 4];

  const handleDelete = (id) => {
    if (window.confirm("Hapus anggota ini dari struktur organisasi?")) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleEdit = (m) => {
    setEditId(m.id);
    setForm({ nama: m.nama, jabatan: m.jabatan, level: m.level });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nama || !form.jabatan) return;
    if (editId) {
      setMembers(prev => prev.map(m => m.id === editId ? { ...m, ...form, level: Number(form.level) } : m));
    } else {
      const newMember = { id: Date.now(), nama: form.nama, jabatan: form.jabatan, level: Number(form.level), img: img1 };
      setMembers(prev => [...prev, newMember]);
    }
    setForm({ nama: "", jabatan: "", level: 3 });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="so-root">
      <div className="so-container">

        {/* Page header */}
        <div className="so-header">
          <div>
            <h1 className="so-title">🏛️ Struktur Organisasi Desa Bahagia</h1>
            <p className="so-subtitle">
              {canEdit
                ? "Kelola susunan perangkat dan aparatur Desa Bahagia."
                : "Susunan perangkat dan aparatur Desa Bahagia periode 2022\u20132029."}
            </p>
          </div>
        </div>

        {/* Admin toolbar */}
        {canEdit && (
          <div className="so-admin-bar">
            <span className="so-admin-badge">🔧 Mode Admin</span>
            <button className="btn" onClick={() => { setEditId(null); setForm({ nama: "", jabatan: "", level: 3 }); setShowForm(v => !v); }}>
              {showForm && !editId ? "✕ Batal" : "＋ Tambah Anggota"}
            </button>
          </div>
        )}

        {/* Add/Edit form (admin only) */}
        {canEdit && showForm && (
          <form className="so-form" onSubmit={handleSubmit}>
            <h4>{editId ? "Edit Anggota" : "Tambah Anggota Baru"}</h4>
            <div className="so-form-grid">
              <div className="form-field">
                <label>Nama Lengkap</label>
                <input placeholder="Nama lengkap" value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label>Jabatan</label>
                <input placeholder="Jabatan / fungsi" value={form.jabatan} onChange={e => setForm(p => ({ ...p, jabatan: e.target.value }))} required />
              </div>
              <div className="form-field">
                <label>Level / Tingkatan</label>
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                  {levels.map(l => <option key={l} value={l}>{l} — {levelLabels[l]}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" type="submit">{editId ? "Simpan Perubahan" : "Tambah"}</button>
              {editId && (
                <button type="button" className="btn-cancel" onClick={() => { setEditId(null); setShowForm(false); }}>Batal Edit</button>
              )}
            </div>
          </form>
        )}

        {/* Org chart by level */}
        {levels.map(lvl => {
          const group = members.filter(m => m.level === lvl);
          if (group.length === 0) return null;
          return (
            <section className="so-level-section" key={lvl}>
              <div className="so-level-badge" style={{ background: levelColors[lvl] }}>
                Level {lvl} — {levelLabels[lvl]}
              </div>
              <div className="so-cards">
                {group.map(m => (
                  <div className="so-card" key={m.id}>
                    <div className="so-card-accent" style={{ background: levelColors[lvl] }} />
                    <img src={m.img} alt={m.nama} className="so-card-img" />
                    <div className="so-card-body">
                      <div className="so-card-name">{m.nama}</div>
                      <div className="so-card-jabatan" style={{ color: levelColors[lvl] }}>{m.jabatan}</div>
                    </div>
                    {canEdit && (
                      <div className="so-card-actions">
                        <button className="tbs-edit" onClick={() => handleEdit(m)}>✏️</button>
                        <button className="tbs-del" onClick={() => handleDelete(m.id)}>🗑️</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Hierarchy note */}
        <section className="so-legend">
          <h3>Keterangan Tingkatan</h3>
          <div className="so-legend-grid">
            {levels.map(l => (
              <div className="so-legend-item" key={l}>
                <div className="so-legend-dot" style={{ background: levelColors[l] }} />
                <div>
                  <div className="so-legend-lvl">Level {l}</div>
                  <div className="so-legend-desc">{levelLabels[l]}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!canEdit && (
          <div className="so-public-note">
            <strong>Catatan:</strong> Data yang ditampilkan merupakan informasi publik. Login sebagai admin untuk mengelola susunan perangkat desa.
          </div>
        )}
      </div>
    </div>
  );
}
