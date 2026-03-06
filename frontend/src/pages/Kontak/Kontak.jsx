import { useState, useEffect, useContext } from "react";
import "./kontak.css";
import { AuthContext, ROLES } from "../../context/AuthContext";
import api from "../../services/api";

import {
  LuMapPin, LuPhone, LuSmartphone, LuMail, LuGlobe,
  LuPin, LuClock, LuUsers, LuMap, LuMessageCircle,
  LuPencil, LuCircleCheck, LuSave, LuSend,
} from "react-icons/lu";

const JUANDA_COORDS = [-7.3798, 112.7869];

const INIT_INFO = {
  alamat:  "Bandar Udara Internasional Juanda, Jl. Raya Juanda, Semambung, Kec. Gedangan, Kabupaten Sidoarjo, Jawa Timur 61253",
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
    { icon: <LuMapPin size={18} />, label: "Alamat",    value: info.alamat,  href: null },
    { icon: <LuPhone size={18} />, label: "Telepon",   value: info.telepon, href: null },
    { icon: <LuSmartphone size={18} />, label: "WhatsApp",  value: info.wa,      href: `https://wa.me/62${info.wa.replace(/\D/g,"").replace(/^0/,"")}`  },
    { icon: <LuMail size={18} />, label: "Email",     value: info.email,   href: `mailto:${info.email}` },
    { icon: <LuGlobe size={18} />, label: "Website",   value: info.website, href: info.website.startsWith("http") ? info.website : `https://${info.website}` },
  ];

  return (
    <div className="kontak-root">
      <div className="kontak-container">

        {/* Header */}
        <div className="kontak-header">
          <div>
            <h1 className="kontak-title"><LuPhone size={24} /> Kontak & Lokasi</h1>
            <p className="kontak-subtitle">
              Hubungi kami untuk pertanyaan, pengaduan, atau kebutuhan layanan administrasi Desa Bahagia.
            </p>
          </div>
          {canEdit && !editMode && (
            <button className="btn-edit-info" onClick={handleEdit}>
              <LuPencil size={16} /> Edit Info Kantor
            </button>
          )}
        </div>

        {/* Notifikasi simpan berhasil */}
        {saved && (
          <div className="kontak-toast"><LuCircleCheck size={18} /> Informasi kantor berhasil diperbarui!</div>
        )}

        {/* ===== FORM EDIT (hanya admin, saat editMode) ===== */}
        {canEdit && editMode && (
          <div className="kontak-card edit-card">
            <div className="edit-card-header">
              <h3><LuPencil size={18} /> Edit Informasi Kantor</h3>
              <span className="edit-badge">Mode Edit</span>
            </div>
            <form className="edit-form" onSubmit={handleSave}>
              <div className="edit-field">
                <label><LuMapPin size={16} /> Alamat <span className="req">*</span></label>
                <textarea
                  rows={2}
                  value={draft.alamat}
                  onChange={(e) => setDraft({ ...draft, alamat: e.target.value })}
                  placeholder="Alamat lengkap kantor desa"
                />
              </div>
              <div className="edit-row">
                <div className="edit-field">
                  <label><LuPhone size={16} /> Telepon <span className="req">*</span></label>
                  <input
                    type="text"
                    value={draft.telepon}
                    onChange={(e) => setDraft({ ...draft, telepon: e.target.value })}
                    placeholder="Contoh: (0321) 123-4567"
                  />
                </div>
                <div className="edit-field">
                  <label><LuSmartphone size={16} /> WhatsApp</label>
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
                  <label><LuMail size={16} /> Email</label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    placeholder="Contoh: desa@mail.desa.id"
                  />
                </div>
                <div className="edit-field">
                  <label><LuGlobe size={16} /> Website</label>
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
                <button type="submit" className="btn-save"><LuSave size={16} /> Simpan Perubahan</button>
              </div>
            </form>
          </div>
        )}

        {/* Grid utama */}
        <div className="kontak-grid">

          {/* Kiri: Informasi Kontak */}
          <div className="kontak-col">

            <div className="kontak-card">
              <h3><LuPin size={18} /> Informasi Kantor</h3>
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
              <h3><LuClock size={18} /> Jam Operasional</h3>
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

            {/* Peta (react-leaflet / OpenStreetMap) */}
            <div className="kontak-card">
              <h3><LuMap size={18} /> Lokasi Kantor Desa</h3>
              <div className="map-placeholder">
                <iframe
                  title="Lokasi Kantor Desa"
                  src={`https://maps.google.com/maps?q=${JUANDA_COORDS[0]},${JUANDA_COORDS[1]}&z=15&output=embed`}
                  style={{ width: "100%", height: "260px", border: 0, borderRadius: "10px", display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <p className="map-note">
                  <LuMapPin size={14} /> Bandar Udara Internasional Juanda, Jl. Raya Juanda, Sidoarjo, Jawa Timur
                </p>
              </div>
            </div>

            <div className="kontak-card">
              <h3><LuUsers size={18} /> Kontak Perangkat Desa</h3>
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
                            <LuMessageCircle size={14} /> {p.phone}
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
          <a href="/pengaduan" className="cta-btn"><LuSend size={16} /> Kirim Pengaduan</a>
        </div>

      </div>
    </div>
  );
}
