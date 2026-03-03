import { useEffect, useState } from "react";
import api from "../../services/api";
import "./publicPenduduk.css";

export default function PublicPenduduk() {
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/stats")
      .then(res => setTotal(res.data.total_penduduk))
      .catch(() => setTotal("—"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pubpend-root">
      <div className="pubpend-hero">
        <h1>👥 Data Kependudukan</h1>
        <p>Informasi jumlah penduduk terdaftar di Desa Bahagia</p>
      </div>

      <div className="pubpend-container">
        <div className="pubpend-card">
          <div className="pubpend-icon">👤</div>
          <div className="pubpend-value">{loading ? "…" : total}</div>
          <div className="pubpend-label">Total Penduduk Terdaftar</div>
        </div>

        <div className="pubpend-info">
          <h2>Tentang Data Penduduk</h2>
          <p>
            Data kependudukan Desa Bahagia dikelola oleh petugas administrasi desa.
            Informasi detail seperti nama, alamat, dan NIK hanya dapat diakses oleh
            petugas yang memiliki akun resmi.
          </p>
          <p>
            Jika kamu adalah warga Desa Bahagia dan ingin mengakses layanan administrasi,
            silakan login menggunakan akun yang telah diberikan oleh petugas desa.
          </p>
          <a href="/login" className="pubpend-login-btn">
            🔐 Login sebagai Warga Desa
          </a>
        </div>
      </div>
    </div>
  );
}
