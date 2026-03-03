import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import "./berita.css";
import api from "../../services/api";
import { AuthContext, STAFF_ROLES } from "../../context/AuthContext";

export default function BeritaDetail() {
  const { id } = useParams();
  const { hasRole } = useContext(AuthContext);
  const canSeeAnggaran = hasRole(...STAFF_ROLES);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/news/${id}`)
      .then(res => setItem(res.data.data ?? res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container berita-page"><p>Memuat berita...</p></div>;

  if (notFound || !item) {
    return (
      <div className="container berita-page">
        <h2>Berita tidak ditemukan</h2>
        <Link to="/berita">← Kembali ke Berita</Link>
      </div>
    );
  }

  return (
    <div className="container berita-page">
      <article className="news-detail">
        <h1>{item.title}</h1>
        <p className="meta">{item.created_at?.split("T")[0]} • {item.author?.name ?? "Admin"}</p>
        {item.image_path && (
          <img className="detail-img" src={`http://127.0.0.1:8000/storage/${item.image_path}`} alt={item.title} />
        )}
        <div className="content">
          {item.content?.split("\n")
            .filter(para => canSeeAnggaran || !para.trim().startsWith("Anggaran"))
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
        <div style={{ marginTop: 20 }}><Link to="/berita">← Kembali</Link></div>
      </article>
    </div>
  );
}
