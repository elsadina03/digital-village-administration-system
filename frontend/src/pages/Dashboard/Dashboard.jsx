import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './dashboard.css'
import hero from '../../assets/1399369597_Modorima.jpeg'
import img1 from '../../assets/IMG_3050.JPG'
import img2 from '../../assets/Three Simple Steps to Empowered Word-Learning - Peers and Pedagogy.jpeg'

import news from '../../data/news'

const dummyNews = [...news].sort((a,b)=>b.views-a.views).slice(0,3)

const team = [
  { id: 1, name: 'Budi Hermawan', role: 'Kepala Desa', img: img1 },
  { id: 2, name: 'Dwi Nur Atika', role: 'Sekretaris Desa', img: img2 },
  { id: 3, name: 'Siti Aminah', role: 'Bendahara Desa', img: img1 },
]

const adminStats = [
  { label: 'Total Penduduk', value: '345', icon: '👥', to: '/penduduk' },
  { label: 'Surat Diproses', value: '12', icon: '📄', to: '/surat' },
  { label: 'Total Anggaran', value: 'Rp 450 Jt', icon: '💰', to: '/data-anggaran' },
  { label: 'Program Aktif', value: '5', icon: '📋', to: '/program-desa' },
]

export default function Dashboard() {
  const isLoggedIn = localStorage.getItem('isAuth') === 'true'
  const navigate = useNavigate()

  return (
    <div className="dashboard-root">

      {/* ====== ADMIN PANEL (login only) ====== */}
      {isLoggedIn && (
        <section className="admin-panel container">
          <div className="admin-panel-header">
            <h2>Panel Admin Desa Bahagia</h2>
            <p className="admin-subtitle">Selamat datang kembali, kelola data desa dari sini.</p>
          </div>
          <div className="admin-stats-grid">
            {adminStats.map(s => (
              <Link to={s.to} key={s.label} className="admin-stat-card">
                <span className="admin-stat-icon">{s.icon}</span>
                <div>
                  <div className="admin-stat-value">{s.value}</div>
                  <div className="admin-stat-label">{s.label}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="admin-quick-actions">
            <button className="admin-action-btn" onClick={() => navigate('/pengajuan')}>📝 Kelola Surat</button>
            <button className="admin-action-btn" onClick={() => navigate('/berita')}>📰 Kelola Berita</button>
            <button className="admin-action-btn" onClick={() => navigate('/input-apbdes')}>💳 Input APBDes</button>
            <button className="admin-action-btn" onClick={() => navigate('/struktur-organisasi')}>🏛️ Struktur Organisasi</button>
          </div>
        </section>
      )}

      <header className="dashboard-hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="overlay" />
        <div className="hero-content">
          <h1>Selamat Datang di Website Desa Bahagia</h1>
          <p>Sistem Digitalisasi Kepengurusan Desa</p>
        </div>
      </header>

      <section className="sambutan container">
        <div className="sambutan-img">
          <img src={img1} alt="kepala-desa" />
        </div>
        <div className="sambutan-text">
          <h3>KEPALA DESA BAHAGIA</h3>
          <h2>Budi Hermawan</h2>
          <p className="lead">Kepala Desa Bahagia Periode 2022 - 2029</p>
          <p>
            Desa Bahagia adalah komunitas yang fokus pada pembangunan berkelanjutan dan layanan publik yang mudah diakses. Kami memadukan tradisi lokal dengan inovasi digital untuk meningkatkan kualitas hidup warga.
          </p>
        </div>
      </section>

      <section className="visi-misi container">
        <h2 className="section-title">Visi Misi Desa Bahagia</h2>
        <div className="capsule">
          <div className="capsule-left">
            <h3>Visi</h3>
            <p>Menyelenggarakan Pemerintahan Yang Bersih, Transparan, Amanah, Santun, Dan Bertanggungjawab Untuk Mewujudkan Perubahan Yang Lebih Baik</p>
          </div>
          <div className="capsule-right">
            <h3>Misi</h3>
            <ol>
              <li>Meningkatkan dan memperluas jaringan kerjasama Pemerintah dan Non Pemerintah.</li>
              <li>Meningkatkan kemitraan Pemerintah dan Lembaga Kemasyarakatan dalam upaya mewujudkan Pembangunan Desa yang berkelanjutan.</li>
              <li>Meningkatkan jalinan Kerjasama dengan tokoh agama, tokoh masyarakat, tokoh adat, dan tokoh pemuda.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="berita container">
        <div className="section-title-row">
          <h2 className="section-title">Berita Desa</h2>
          {isLoggedIn
            ? <button className="table-btn-edit" onClick={() => navigate('/berita')}>✏️ Kelola Berita</button>
            : <Link to="/berita" className="detail-link">Lihat Semua Berita →</Link>
          }
        </div>
        <div className="news-grid">
          {dummyNews.map(n => (
            <article key={n.id} className="news-card">
              <img src={n.img} alt={n.title} />
              <div className="news-body">
                <h4>{n.title}</h4>
                <p className="meta">{n.date} • {n.author}</p>
                <p className="excerpt">{n.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="profile container">
        <div className="section-title-row">
          <h2 className="section-title">Profil Desa</h2>
          {isLoggedIn
            ? <button className="table-btn-edit" onClick={() => navigate('/penduduk')}>👥 Data Penduduk</button>
            : <Link to="/penduduk" className="detail-link">Lihat Data Penduduk →</Link>
          }
        </div>
        <div className="profile-stats">
          <div className="stat">345<br/><span>Penduduk</span></div>
          <div className="stat">12,4 km²<br/><span>Luas</span></div>
          <div className="stat">69213<br/><span>Kode Pos</span></div>
        </div>
        <p className="profile-desc">Desa Bahagia berkomitmen pada pelayanan publik, pembangunan yang berkelanjutan, dan pemberdayaan masyarakat.</p>
      </section>

      <section className="organization container">
        <div className="section-title-row">
          <h2 className="section-title">Struktur Organisasi dan Tata Kerja Desa</h2>
          {isLoggedIn
            ? <button className="table-btn-edit" onClick={() => navigate('/struktur-organisasi')}>✏️ Kelola Struktur</button>
            : <Link to="/struktur-organisasi" className="detail-link">Lihat Selengkapnya →</Link>
          }
        </div>
        <div className="org-row" role="list">
          {team.map(p => (
            <div className="org-card" key={p.id} role="listitem">
              <img src={p.img} alt={p.name} />
              <div className="org-body">
                <h4>{p.name}</h4>
                <p className="role">{p.role}</p>
              </div>
            </div>
          ))}
          {/* Add more placeholder positions to demonstrate horizontal scroll */}
          <div className="org-card">
            <img src={img2} alt="Placeholder" />
            <div className="org-body"><h4>Ahmad Sutanto</h4><p className="role">Kasi Pemerintahan</p></div>
          </div>
          <div className="org-card">
            <img src={img1} alt="Placeholder" />
            <div className="org-body"><h4>Rina Marlina</h4><p className="role">Kasi Kesejahteraan</p></div>
          </div>
          <div className="org-card">
            <img src={img2} alt="Placeholder" />
            <div className="org-body"><h4>Yusuf Hidayat</h4><p className="role">Kasi Pelayanan</p></div>
          </div>
        </div>
      </section>

      {/* ====== PUBLIC CTA (non-login only) ====== */}
      {!isLoggedIn && (
        <section className="public-cta container">
          <div className="public-cta-content">
            <h3>Butuh layanan administrasi desa?</h3>
            <p>Login untuk mengakses pengajuan surat, laporan kegiatan, data keuangan, dan fitur lengkap lainnya.</p>
            <button className="btn" onClick={() => navigate('/login')}>Login Sekarang</button>
          </div>
        </section>
      )}

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h4>Kontak</h4>
            <p>Telepon: +62 812 3456 7890</p>
            <p>Email: desa@bahagia.example</p>
          </div>
          <div>
            <h4>Lokasi</h4>
            <p>Bandara Juanda, Sidoarjo, Jawa Timur, Indonesia</p>
          </div>
          <div>
            <h4>Alamat Kantor</h4>
            <p>Jl. Merdeka No.1, Desa Bahagia</p>
          </div>
        </div>
        <div className="copyright">© {new Date().getFullYear()} Pemerintah Desa Bahagia</div>
      </footer>
    </div>
  )
}
