import { useState, useEffect, useContext } from "react";
import "./kontak.css";
import { AuthContext, ROLES } from "../../context/AuthContext";
import api from "../../services/api";

const INIT_INFO = {
  alamat:  "Jl. Raya Desa Bahagia No. 1, Kecamatan Sejahtera, Kabupaten Makmur, Jawa Timur 64184",
  telepon: "(0321) 123-4567",
  wa:      "0812-3456-7890",
  email:   "desabahagia@mail.desa.id",
  website: "www.desabahagia.desa.id",
};

const JAM_OPERASIONAL = [
  { hari: "Senin – Kamis", jam: "07.30 – 15.30 WIB" },
  { hari: "Jumat",         jam: "07.30 – 11.30 WIB" },
  { hari: "Sabtu",         jam: "08.00 – 12.00 WIB" },
  { hari: "Minggu & Hari Libur", jam: "Tutup" },
];

const PERANGKAT_ROLE_EXT = {
  "Kepala Desa":     "",
  "Sekretaris Desa": "Administrasi & Surat",
  "Bendahara Desa":  "Keuangan & Anggaran",
};

export default function Kontak() {
  const { hasRole } = useContext(AuthContext);
  const canEdit = hasRole(ROLES.ADMIN, ROLES.KEPDES);

  const [perangkat, setPerangkat] = useState([]);

  useEffect(() => {
    api.get("/public/staff")
      .then(res => setPerangkat(res.data.data ?? []))
      .catch(() => setPerangkat([]));
  }, []);

  // Data info kantor (nanti diganti fetch dari backend)
  const [info, setInfo]       = useState(INIT_INFO);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft]     = useState(INIT_INFO);
  const [saved, setSaved]     = useState(false);

  function handleEdit() {
    setDraft({ ...info });
    setEditMode(true);
    setSaved(false);
  }

  function handleCancel() {
    setEditMode(false);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!draft.alamat.trim() || !draft.telepon.trim()) {
      alert("Alamat dan Telepon wajib diisi.");
      return;
    }
    setInfo({ ...draft });
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Bangun array tampilan dari state
  const infoList = [
    { icon: "📍", label: "Alamat",    value: info.alamat,  href: null },
    { icon: "📞", label: "Telepon",   value: info.telepon, href: null },
    { icon: "📱", label: "WhatsApp",  value: info.wa,      href: `https://wa.me/62${info.wa.replace(/\D/g,"").replace(/^0/,"")}`  },
    { icon: "📧", label: "Email",     value: info.email,   href: `mailto:${info.email}` },
    { icon: "🌐", label: "Website",   value: info.website, href: info.website.startsWith("http") ? info.website : `https://${info.website}` },
  ];

  return (
    <div className="kontak-root">
      <div className="kontak-container">

        {/* Header */}
        <div className="kontak-header">
          <div>
            <h1 className="kontak-title">📞 Kontak & Lokasi</h1>
            <p className="kontak-subtitle">
              Hubungi kami untuk pertanyaan, pengaduan, atau kebutuhan layanan administrasi Desa Bahagia.
            </p>
          </div>
          {canEdit && !editMode && (
            <button className="btn-edit-info" onClick={handleEdit}>
              ✏️ Edit Info Kantor
            </button>
          )}
        </div>

        {/* Notifikasi simpan berhasil */}
        {saved && (
          <div className="kontak-toast">✅ Informasi kantor berhasil diperbarui!</div>
        )}

        {/* ===== FORM EDIT (hanya admin, saat editMode) ===== */}
        {canEdit && editMode && (
          <div className="kontak-card edit-card">
            <div className="edit-card-header">
              <h3>✏️ Edit Informasi Kantor</h3>
              <span className="edit-badge">Mode Edit</span>
            </div>
            <form className="edit-form" onSubmit={handleSave}>
              <div className="edit-field">
                <label>📍 Alamat <span className="req">*</span></label>
                <textarea
                  rows={2}
                  value={draft.alamat}
                  onChange={(e) => setDraft({ ...draft, alamat: e.target.value })}
                  placeholder="Alamat lengkap kantor desa"
                />
              </div>
              <div className="edit-row">
                <div className="edit-field">
                  <label>📞 Telepon <span className="req">*</span></label>
                  <input
                    type="text"
                    value={draft.telepon}
                    onChange={(e) => setDraft({ ...draft, telepon: e.target.value })}
                    placeholder="Contoh: (0321) 123-4567"
                  />
                </div>
                <div className="edit-field">
                  <label>📱 WhatsApp</label>
                  <input
                    type="text"
                    value={draft.wa}
                    onChange={(e) => setDraft({ ...draft, wa: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                  />
                </div>
              </div>
              <div className="edit-row">
                <div className="edit-field">
                  <label>📧 Email</label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    placeholder="Contoh: desa@mail.desa.id"
                  />
                </div>
                <div className="edit-field">
                  <label>🌐 Website</label>
                  <input
                    type="text"
                    value={draft.website}
                    onChange={(e) => setDraft({ ...draft, website: e.target.value })}
                    placeholder="Contoh: www.desabahagia.desa.id"
                  />
                </div>
              </div>
              <div className="edit-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel}>Batal</button>
                <button type="submit" className="btn-save">💾 Simpan Perubahan</button>
              </div>
            </form>
          </div>
        )}

        {/* Grid utama */}
        <div className="kontak-grid">

          {/* Kiri: Informasi Kontak */}
          <div className="kontak-col">

            <div className="kontak-card">
              <h3>📌 Informasi Kantor</h3>
              <ul className="kontak-list">
                {infoList.map((k) => (
                  <li key={k.label} className="kontak-item">
                    <span className="kontak-icon">{k.icon}</span>
                    <div>
                      <div className="kontak-label">{k.label}</div>
                      {k.href ? (
                        <a href={k.href} target="_blank" rel="noopener noreferrer" className="kontak-link">
                          {k.value}
                        </a>
                      ) : (
                        <span className="kontak-value">{k.value}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="kontak-card">
              <h3>⏰ Jam Operasional</h3>
              <table className="jam-table">
                <tbody>
                  {JAM_OPERASIONAL.map((j) => (
                    <tr key={j.hari} className={j.jam === "Tutup" ? "tutup" : ""}>
                      <td className="hari">{j.hari}</td>
                      <td className="jam">{j.jam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Kanan: Peta + Kontak Perangkat */}
          <div className="kontak-col">

            {/* Peta (embed Google Maps dummy / placeholder) */}
            <div className="kontak-card">
              <h3>🗺️ Lokasi Kantor Desa</h3>
              <div className="map-placeholder">
                <iframe
                  title="Lokasi Desa Bahagia"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.298!2d112.1774926!3d-7.614529!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMzYnNTIuMyJTIDExMsKwMTAnMzkuMCJF!5e0!3m2!1sid!2sid!4v1699999999999!5m2!1sid!2sid"
                  width="100%"
                  height="250"
                  style={{ border: 0, borderRadius: "8px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <p className="map-note">
                  📍 Jika peta tidak muncul, klik{" "}
                  <a
                    href="https://maps.google.com/?q=Jawa+Timur+Desa+Bahagia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kontak-link"
                  >
                    di sini
                  </a>{" "}
                  untuk membuka Google Maps.
                </p>
              </div>
            </div>

            <div className="kontak-card">
              <h3>👥 Kontak Perangkat Desa</h3>
              <div className="perangkat-list">
                {perangkat.map((p) => {
                  const ext = PERANGKAT_ROLE_EXT[p.role] ?? "";
                  const waHref = p.phone
                    ? `https://wa.me/62${p.phone.replace(/\D/g, "").replace(/^0/, "")}`
                    : null;
                  return (
                    <div className="perangkat-item" key={p.id}>
                      <div className="perangkat-avatar">{p.name.charAt(0)}</div>
                      <div className="perangkat-info">
                        <div className="perangkat-nama">{p.name}</div>
                        <div className="perangkat-jabatan">{p.role}</div>
                        {ext && <div className="perangkat-ext">{ext}</div>}
                        {waHref && (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wa-btn"
                          >
                            💬 {p.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* CTA Pengaduan */}
        <div className="kontak-cta">
          <div className="cta-content">
            <h3>Punya Keluhan atau Masukan?</h3>
            <p>Kami siap mendengar. Kirimkan pengaduan kamu melalui halaman pengaduan online.</p>
          </div>
          <a href="/pengaduan" className="cta-btn">📝 Kirim Pengaduan</a>
        </div>

      </div>
    </div>
  );
}
