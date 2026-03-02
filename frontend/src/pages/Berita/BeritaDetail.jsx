import { useParams, Link } from "react-router-dom";
import "./berita.css";
import news from "../../data/news";

export default function BeritaDetail(){
  const { id } = useParams();
  const item = news.find(n=>n.id===id);

  if(!item){
    return (
      <div className="container berita-page">
        <h2>Berita tidak ditemukan</h2>
        <Link to="/berita">Kembali ke Berita</Link>
      </div>
    );
  }

  return (
    <div className="container berita-page">
      <article className="news-detail">
        <h1>{item.title}</h1>
        <p className="meta">{item.date} • {item.author}</p>
        <img className="detail-img" src={item.img} alt={item.title} />
        <div className="content">
          <p>{item.content}</p>
          <p>-- isi berita lengkap di sini (dummy) --</p>
        </div>
        <div style={{marginTop:20}}><Link to="/berita">← Kembali</Link></div>
      </article>
    </div>
  );
}
