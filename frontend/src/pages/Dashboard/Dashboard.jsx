import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './dashboard.css'
import api from '../../services/api'
import { AuthContext, ROLES } from '../../context/AuthContext'
import {
  LuUsers, LuFileText, LuBanknote, LuClipboardList,
  LuFilePen, LuNewspaper, LuCreditCard, LuLandmark, LuPencil,
} from 'react-icons/lu'

// HD village images from Unsplash (free to use)
const HERO_IMG = 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1920&q=80'
// Portrait photos — male & female from Unsplash (free to use)
const PHOTO_MALE = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
]
const PHOTO_FEMALE = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
]

const team = [
  { id: 1, name: 'Budi Hermawan', role: 'Kepala Desa', img: PHOTO_MALE[0] },
  { id: 2, name: 'Dwi Nur Atika', role: 'Sekretaris Desa', img: PHOTO_FEMALE[0] },
  { id: 3, name: 'Siti Aminah', role: 'Bendahara Desa', img: PHOTO_FEMALE[1] },
]

export default function Dashboard() {
  const { user, isAdmin, canAccessFinance, canAccessProgram } = useContext(AuthContext)
  const isLoggedIn = !!user
  const navigate = useNavigate()

  const [news, setNews] = useState([])
  const [stats, setStats] = useState({ penduduk: '-', surat: '-', anggaran: '-', program: '-' })
  const [loadingNews, setLoadingNews] = useState(true)

  useEffect(() => {
    // Fetch berita publik (no auth required)
    api.get('/news').then(res => {
      const data = res.data.data ?? res.data
      const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setNews(sorted.slice(0, 3))
    }).catch(() => {}).finally(() => setLoadingNews(false))

    // Fetch stats (only if logged in)
    if (isLoggedIn) {
      Promise.all([
        api.get('/users/count').catch(() => null),
        api.get('/letters?status=menunggu').catch(() => null),
        api.get('/budgets?tahun=' + new Date().getFullYear()).catch(() => null),
        api.get('/programs').catch(() => null),
      ]).then(([citRes, letRes, budRes, progRes]) => {
        const penduduk = citRes?.data?.total ?? citRes?.data?.data?.length ?? '-'
        const surat = letRes?.data?.total ?? letRes?.data?.data?.length ?? '-'
        const totalAnggaran = budRes?.data?.summary?.total_anggaran
        const anggaran = totalAnggaran
          ? 'Rp ' + (totalAnggaran / 1_000_000).toFixed(0) + ' Jt'
          : '-'
        const program = progRes?.data?.total ?? progRes?.data?.data?.length ?? '-'
        setStats({ penduduk, surat, anggaran, program })
      })
    }
  }, [isLoggedIn])

  const adminStats = [
    { label: 'Total Penduduk', value: stats.penduduk, icon: <LuUsers size={22} />, to: '/warga' },
    { label: 'Surat Diproses', value: stats.surat,    icon: <LuFileText size={22} />, to: '/surat' },
    { label: 'Total Anggaran', value: stats.anggaran, icon: <LuBanknote size={22} />, to: '/data-anggaran' },
    { label: 'Program Aktif',  value: stats.program,  icon: <LuClipboardList size={22} />, to: '/program-desa' },
  ].filter(s => {
    // Hidupkan hanya menu yg boleh diakses role ini
    if (s.to === '/data-anggaran') return canAccessFinance()
    if (s.to === '/program-desa') return canAccessProgram()
    return true
  })

  return (
    <div className="dashboard-root">

      {/* ====== ADMIN/STAFF PANEL (login only) ====== */}
      {isLoggedIn && (
        <section className="admin-panel container">
          <div className="admin-panel-header">
            <h2>Panel {user?.role?.name ?? 'Pengguna'} — {user?.name ?? ''}</h2>
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
            {canAccessProgram() && (
              <button className="admin-action-btn" onClick={() => navigate('/pengajuan')}><LuFilePen size={16} /> Kelola Surat</button>
            )}
            {isAdmin() && (
              <button className="admin-action-btn" onClick={() => navigate('/berita')}><LuNewspaper size={16} /> Kelola Berita</button>
            )}
            {canAccessFinance() && (
              <button className="admin-action-btn" onClick={() => navigate('/input-apbdes')}><LuCreditCard size={16} /> Input APBDes</button>
            )}
            <button className="admin-action-btn" onClick={() => navigate('/struktur-organisasi')}><LuLandmark size={16} /> Struktur Organisasi</button>
          </div>
        </section>
      )}

      <header className="dashboard-hero" style={{ backgroundImage: `url(${HERO_IMG})` }}>
        <div className="overlay" />
        <div className="hero-content">
          <h1>Selamat Datang di Website Desa Bahagia</h1>
          <p>Sistem Digitalisasi Kepengurusan Desa</p>
        </div>
      </header>

      <section className="sambutan container">
        <div className="sambutan-img">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" alt="kepala-desa" />
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
            ? <button className="table-btn-edit" onClick={() => navigate('/berita')}><LuPencil size={14} /> Kelola Berita</button>
            : <Link to="/berita" className="detail-link">Lihat Semua Berita →</Link>
          }
        </div>
        <div className="news-grid">
          {loadingNews ? (
            <p>Memuat berita...</p>
          ) : news.length === 0 ? (
            <p>Belum ada berita.</p>
          ) : (
            news.map(n => (
              <article key={n.id} className="news-card">
                {n.image_path && <img src={`http://127.0.0.1:8000/storage/${n.image_path}`} alt={n.title} />}
                <div className="news-body">
                  <h4>{n.title}</h4>
                  <p className="meta">{n.created_at?.split('T')[0]} • {n.author?.name ?? 'Admin'}</p>
                  <p className="excerpt">{n.content?.substring(0, 100)}...</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="profile container">
        <div className="section-title-row">
          <h2 className="section-title">Profil Desa</h2>
          {isLoggedIn
            ? <button className="table-btn-edit" onClick={() => navigate('/warga')}><LuUsers size={14} /> Data Penduduk</button>
            : <Link to="/warga" className="detail-link">Lihat Data Penduduk →</Link>
          }
        </div>
        <div className="profile-stats">
          <div className="stat">{stats.penduduk}<br/><span>Penduduk</span></div>
          <div className="stat">12,4 km²<br/><span>Luas</span></div>
          <div className="stat">69213<br/><span>Kode Pos</span></div>
        </div>
        <p className="profile-desc">Desa Bahagia berkomitmen pada pelayanan publik, pembangunan yang berkelanjutan, dan pemberdayaan masyarakat.</p>
      </section>

      <section className="organization container">
        <div className="section-title-row">
          <h2 className="section-title">Struktur Organisasi dan Tata Kerja Desa</h2>
          {isLoggedIn
            ? <button className="table-btn-edit" onClick={() => navigate('/struktur-organisasi')}><LuPencil size={14} /> Kelola Struktur</button>
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
            <img src={PHOTO_MALE[1]} alt="Ahmad Sutanto" />
            <div className="org-body"><h4>Ahmad Sutanto</h4><p className="role">Kasi Pemerintahan</p></div>
          </div>
          <div className="org-card">
            <img src={PHOTO_FEMALE[2]} alt="Rina Marlina" />
            <div className="org-body"><h4>Rina Marlina</h4><p className="role">Kasi Kesejahteraan</p></div>
          </div>
          <div className="org-card">
            <img src={PHOTO_MALE[2]} alt="Yusuf Hidayat" />
            <div className="org-body"><h4>Yusuf Hidayat</h4><p className="role">Kasi Pelayanan</p></div>
          </div>
        </div>
      </section>

      {/* ====== LOGIN CTA (public, before footer) ====== */}
      {!isLoggedIn && (
        <section className="public-cta container">
          <div className="public-cta-text">
            <span>🏡 Warga Desa Bahagia?</span>
            <p>Login untuk mengakses layanan administrasi desa — pengajuan surat, pengaduan, dan lainnya.</p>
          </div>
          <button className="public-cta-btn" onClick={() => navigate('/login')}>
            🔐 Login sebagai Warga
          </button>
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
