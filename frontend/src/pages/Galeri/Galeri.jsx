import { useMemo, useState } from "react";
import "./galeri.css";

// Pakai placeholder gambar dari picsum.photos agar terlihat nyata
const galeriData = [
  { id: 1, judul: "Gotong Royong Jalan RT 03", tanggal: "2025-01-15", kategori: "Kegiatan", url: "https://picsum.photos/seed/gotong/400/300" },
  { id: 2, judul: "Penyerahan Bantuan PKH", tanggal: "2025-02-10", kategori: "Bantuan Sosial", url: "https://picsum.photos/seed/pkh/400/300" },
  { id: 3, judul: "Musyawarah Desa 2025", tanggal: "2025-02-20", kategori: "Pemerintahan", url: "https://picsum.photos/seed/musdes/400/300" },
  { id: 4, judul: "Renovasi Balai Desa", tanggal: "2025-03-05", kategori: "Pembangunan", url: "https://picsum.photos/seed/balai/400/300" },
  { id: 5, judul: "Pelatihan UMKM Warga Desa", tanggal: "2025-03-25", kategori: "Kegiatan", url: "https://picsum.photos/seed/umkm/400/300" },
  { id: 6, judul: "Posyandu Balita Maret 2025", tanggal: "2025-03-28", kategori: "Kesehatan", url: "https://picsum.photos/seed/posyandu/400/300" },
  { id: 7, judul: "Pembangunan Drainase RT 01", tanggal: "2025-04-10", kategori: "Pembangunan", url: "https://picsum.photos/seed/drainase/400/300" },
  { id: 8, judul: "BLT Dana Desa Tahap 1", tanggal: "2025-04-20", kategori: "Bantuan Sosial", url: "https://picsum.photos/seed/blt2025/400/300" },
  { id: 9, judul: "Kegiatan HUT RI ke-80", tanggal: "2025-08-17", kategori: "Kegiatan", url: "https://picsum.photos/seed/hutri/400/300" },
  { id: 10, judul: "Rapat Koordinasi Kepala Dusun", tanggal: "2025-05-12", kategori: "Pemerintahan", url: "https://picsum.photos/seed/rakor/400/300" },
  { id: 11, judul: "Pemasangan CCTV Desa", tanggal: "2025-06-08", kategori: "Keamanan", url: "https://picsum.photos/seed/cctv/400/300" },
  { id: 12, judul: "Panen Raya Padi Dusun Makmur", tanggal: "2025-06-25", kategori: "Kegiatan", url: "https://picsum.photos/seed/panen/400/300" },
];

const KATEGORI_ALL = ["Semua", ...new Set(galeriData.map((g) => g.kategori))];

export default function Galeri() {
  const [kategori, setKategori] = useState("Semua");
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState(null); // item yang sedang dibuka

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return galeriData.filter((g) => {
      const matchKat = kategori === "Semua" || g.kategori === kategori;
      const matchQ = !q || g.judul.toLowerCase().includes(q);
      return matchKat && matchQ;
    });
  }, [kategori, search]);

  const handlePrev = () => {
    const idx = filtered.findIndex((g) => g.id === lightbox.id);
    if (idx > 0) setLightbox(filtered[idx - 1]);
  };
  const handleNext = () => {
    const idx = filtered.findIndex((g) => g.id === lightbox.id);
    if (idx < filtered.length - 1) setLightbox(filtered[idx + 1]);
  };

  return (
    <div className="galeri-root">
      <div className="galeri-container">

        {/* Header */}
        <div className="galeri-header">
          <h1 className="galeri-title">🖼️ Galeri Desa Bahagia</h1>
          <p className="galeri-subtitle">Dokumentasi kegiatan, pembangunan, dan momen penting Desa Bahagia.</p>
        </div>

        {/* Toolbar */}
        <div className="galeri-toolbar">
          <input
            className="galeri-search"
            placeholder="🔍 Cari foto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

        {/* Grid Foto */}
        {filtered.length === 0 ? (
          <div className="galeri-empty">Tidak ada foto yang ditemukan.</div>
        ) : (
          <div className="galeri-grid">
            {filtered.map((g) => (
              <div className="galeri-item" key={g.id} onClick={() => setLightbox(g)}>
                <img src={g.url} alt={g.judul} loading="lazy" />
                <div className="galeri-overlay">
                  <span className="galeri-tag">{g.kategori}</span>
                  <p className="galeri-judul">{g.judul}</p>
                  <span className="galeri-tgl">{g.tanggal}</span>
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
                <img src={lightbox.url} alt={lightbox.judul} />
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
