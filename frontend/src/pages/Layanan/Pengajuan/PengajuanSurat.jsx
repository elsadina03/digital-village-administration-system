import { useEffect, useMemo, useRef, useState, useContext } from "react";
import api from "../../../services/api";
import { AuthContext, STAFF_ROLES } from "../../../context/AuthContext";
import { LuPrinter, LuTrash2 } from "react-icons/lu";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import ttdImg from "../../../assets/ttd_taza.png";
import "./PengajuanSurat.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SURAT_OPTIONS = [
  "Surat Usaha",
  "Surat Keterangan Domisili",
  "Surat Keterangan Beasiswa",
  "Surat Tidak Mampu",
];

/* ================= STATUS ================= */
const STATUS_BADGE = {
  pending: { label: "Menunggu Diproses", cls: "badge--wait" },
  diproses: { label: "Sedang Diproses", cls: "badge--process" },
  menunggu_kepdes: { label: "Menunggu Kepala Desa", cls: "badge--review" },
  selesai: { label: "Selesai / Disetujui", cls: "badge--done" },
  ditolak: { label: "Ditolak", cls: "badge--reject" },
};

/* ================= PDF HELPER ================= */
const KEPDES_NAME = "Bapak Kepala Desa";
const KEPDES_NIP = "19750318 200312 1 002";

function buildLetterHtml(letter, ttdUrl) {
  const jenis = letter.judul || "Surat Keterangan";
  const nomor = letter.letter_number || "___/___/___/___";
  const nama = letter.nama || "—";
  const alamat = letter.alamat || "—";
  const tujuan = letter.tujuan || "keperluan yang bersangkutan";
  const bln = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const d = new Date();
  const tanggal = `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()}`;
  const imgSrc = ttdUrl ? (window.location.origin + ttdUrl) : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>${jenis}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    * { box-sizing: border-box; }
    body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; }
    .header { display: flex; align-items: center; border-bottom: 3px double #000; padding-bottom: .5cm; margin-bottom: .6cm; }
    .header-text { flex: 1; text-align: center; }
    .header-text .inst { font-size: 14pt; font-weight: bold; text-transform: uppercase; }
    .header-text .addr { font-size: 10pt; margin-top: 2px; }
    .judul { text-align: center; margin: .8cm 0 .3cm; }
    .judul h2 { font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 0 0 .1cm; text-decoration: underline; }
    .judul .nomor { font-size: 11pt; }
    .body-text { margin-top: .6cm; line-height: 1.8; text-align: justify; }
    .body-text p { margin: 0 0 .4cm; }
    .dt { width: 100%; border-collapse: collapse; margin: .4cm 0; }
    .dt td { padding: 3px 6px; vertical-align: top; }
    .dt td:first-child { width: 38%; }
    .dt td:nth-child(2) { width: 4%; text-align: center; }
    .sign { margin-top: 1.5cm; display: flex; justify-content: flex-end; }
    .sign-box { text-align: center; width: 6cm; }
    .sign-img { width: 4cm; height: auto; display: block; margin: .3cm auto 0; }
    .sign-box .name { font-weight: bold; text-decoration: underline; margin-top: .2cm; }
    .sign-box .nip { font-size: 10pt; margin-top: 3px; }
    .footer { margin-top: 1cm; font-size: 9pt; color: #555; border-top: 1px solid #ccc; padding-top: .3cm; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-text">
      <div class="inst">Pemerintah Desa</div>
      <div class="inst">Kecamatan — Kabupaten</div>
      <div class="addr">Jl. Desa No. 1, Kode Pos 00000 | Telp. (0000) 00000</div>
    </div>
  </div>
  <div class="judul">
    <h2>${jenis}</h2>
    <div class="nomor">Nomor: ${nomor}</div>
  </div>
  <div class="body-text">
    <p>Yang bertanda tangan di bawah ini, Kepala Desa, menerangkan bahwa:</p>
    <table class="dt">
      <tr><td>Nama Lengkap</td><td>:</td><td><b>${nama}</b></td></tr>
      <tr><td>Alamat</td><td>:</td><td>${alamat}</td></tr>
    </table>
    <p>Adalah benar warga yang berdomisili di wilayah desa kami dan memerlukan keterangan ini untuk <b>${tujuan}</b>.</p>
    <p>Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
  </div>
  <div class="sign">
    <div class="sign-box">
      <div>${tanggal}</div>
      <div style="margin-top:.4cm">Kepala Desa,</div>
      ${imgSrc ? `<img src="${imgSrc}" class="sign-img" alt="TTD" />` : "<div style='margin-top:1.8cm'></div>"}
      <div class="name">${KEPDES_NAME}</div>
      <div class="nip">NIP. ${KEPDES_NIP}</div>
    </div>
  </div>
  <div class="footer">* Dokumen ini dicetak secara otomatis oleh Sistem Administrasi Digital Desa *</div>
</body>
</html>`;
}

function handleExportPDF(letter) {
  const html = buildLetterHtml(letter, ttdImg);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Pop-up diblokir. Harap izinkan pop-up di browser untuk fitur cetak."); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
}

/* ================= LEAFLET HELPERS ================= */
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 16);
  }, [position, map]);
  return null;
}

function PickMarker({ value, onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return value ? <Marker position={value} /> : null;
}

/* ================= COMPONENT ================= */

export default function PengajuanSurat() {
  const { user } = useContext(AuthContext);
  const isStaff = STAFF_ROLES.includes(user?.role?.name);

  /* ================= RIWAYAT ================= */
  const [riwayat, setRiwayat] = useState([]);
  const [riwayatError, setRiwayatError] = useState(null);
  const [riwayatLoading, setRiwayatLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(riwayat.length / pageSize));
  const riwayatPage = riwayat.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    setRiwayatLoading(true);
    setRiwayatError(null);
    try {
      const res = await api.get("/letters");
      const raw = res.data?.data ?? res.data ?? [];
      if (!Array.isArray(raw)) {
        setRiwayatError("Gagal memuat riwayat: format data tidak valid.");
        return;
      }
      const formatted = raw.map(l => ({
        id: l.id,
        judul: l.letter_type?.name || "Surat",
        waktu: new Date(l.created_at).toLocaleDateString("id-ID"),
        status: l.status,
        nama: l.nama,
        alamat: l.alamat,
        tujuan: l.tujuan,
        wa: l.wa,
        letter_number: l.letter_number,
        rejection_note: l.rejection_note,
        user_id: l.user_id,
      }));
      setRiwayat(formatted);
    } catch (err) {
      console.error("Gagal mengambil riwayat surat:", err);
      const status = err.response?.status;
      if (status === 401) {
        setRiwayatError("Sesi habis. Silakan logout lalu login kembali.");
      } else if (status === 403) {
        setRiwayatError("Akses ditolak. Akun tidak memiliki izin untuk melihat riwayat.");
      } else if (!err.response) {
        setRiwayatError("Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.");
      } else {
        setRiwayatError(`Gagal memuat riwayat (error ${status ?? "?"}).`);
      }
    } finally {
      setRiwayatLoading(false);
    }
  };

  /* ================= FORM ================= */
  const fileRef = useRef(null);

  const [jenisSurat, setJenisSurat] = useState("");
  const [nama, setNama] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [wa, setWa] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [fotoNpwp, setFotoNpwp] = useState(null);

  const [alamat, setAlamat] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  const [koordinat, setKoordinat] = useState([-7.3798, 112.7869]);

  const npwpFileName = useMemo(
    () => (fotoNpwp ? fotoNpwp.name : "Belum ada file yang dipilih..."),
    [fotoNpwp]
  );

  /* ================= AUTOCOMPLETE ================= */

  useEffect(() => {
    const q = alamat.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggest(true);

        const url =
          "https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=id&q=" +
          encodeURIComponent(q);

        const res = await fetch(url);
        const data = await res.json();

        const mapped = (data || []).map((x) => ({
          id: x.place_id,
          label: x.display_name,
          lat: Number(x.lat),
          lon: Number(x.lon),
        }));

        setSuggestions(mapped);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggest(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [alamat]);

  /* ================= SUBMIT ================= */

  async function handleDelete(x) {
    if (!window.confirm(`Hapus pengajuan "${x.judul}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/letters/${x.id}`);
      fetchRiwayat();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus pengajuan surat.");
    }
  }

  function canDelete(x) {
    if (isStaff) return true;
    return x.status === "pending" || x.status === "ditolak";
  }

  async function handleAjukan(e) {
    e.preventDefault();

    if (!jenisSurat || !nama || !email || !wa || !alamat) {
      alert("Lengkapi data wajib (*).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('jenis_surat', jenisSurat);
      formData.append('nama', nama);
      formData.append('email', email);
      formData.append('wa', wa);
      formData.append('alamat', alamat);
      formData.append('tujuan', tujuan);
      formData.append('koordinat_lat', koordinat[0]);
      formData.append('koordinat_lon', koordinat[1]);

      if (fotoNpwp) {
        formData.append('foto_npwp', fotoNpwp);
      }

      await api.post("/letters", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Surat berhasil diajukan!");

      fetchRiwayat();
      setPage(1);

      setJenisSurat("");
      setTujuan("");
      setFotoNpwp(null);
      setAlamat("");
      if (fileRef.current) fileRef.current.value = "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengajukan surat");
    }
  }

  /* ================= RENDER ================= */

  return (
    <div className="container-fluid px-4 pb-4">
      <h1 className="mt-4">Pengajuan Surat Online</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item active">Layanan / Pengajuan Surat</li>
      </ol>

      {/* ================= RIWAYAT ================= */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header fw-bold">
          <i className="fas fa-history me-1"></i>
          Riwayat Pengajuan
        </div>
        <div className="card-body">
          {riwayatLoading ? (
            <div className="text-center py-4">Memuat riwayat…</div>
          ) : riwayatError ? (
            <div className="alert alert-danger">
              {riwayatError} <button className="btn btn-sm btn-outline-danger ms-2" onClick={fetchRiwayat}>Coba lagi</button>
            </div>
          ) : riwayatPage.length === 0 ? (
            <div className="alert alert-light text-center text-muted border border-dashed py-4 mb-0">
              Belum ada riwayat pengajuan surat.
            </div>
          ) : (
            <div className="row g-3">
              {riwayatPage.map((x) => {
                const badge = STATUS_BADGE[x.status] || { label: x.status, cls: "badge--wait" };
                return (
                  <div key={x.id} className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100 bg-light">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title fw-bold mb-0">{x.judul}</h6>
                          {canDelete(x) && (
                            <button className="btn btn-sm text-danger p-0" onClick={() => handleDelete(x)} title="Hapus">
                              <LuTrash2 size={16} />
                            </button>
                          )}
                        </div>
                        {x.letter_number && <p className="small text-primary mb-1">No: {x.letter_number}</p>}
                        <p className="card-text text-muted small mb-2">{x.waktu}</p>

                        {x.status === "ditolak" && x.rejection_note && (
                          <div className="alert alert-danger p-2 small mb-2">{x.rejection_note}</div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <span className={`badge ${badge.cls.replace('badge--', 'bg-')}`}>{badge.label}</span>
                          {x.status === "selesai" && (
                            <button className="btn btn-sm btn-primary" onClick={() => handleExportPDF(x)}>
                              <LuPrinter size={13} className="me-1" /> Cetak
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {riwayat.length > pageSize && (
            <nav className="mt-4">
              <ul className="pagination pagination-sm justify-content-center">
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header fw-bold">
          <i className="fas fa-edit me-1"></i>
          Formulis Pengajuan Surat Baru
        </div>
        <div className="card-body">
          <form onSubmit={handleAjukan}>
            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-bold">Jenis Surat*</label>
                <select className="form-select" value={jenisSurat} onChange={(e) => setJenisSurat(e.target.value)}>
                  <option value="">Pilih kategori surat</option>
                  {SURAT_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Nama Pemohon*</label>
                <input className="form-control" placeholder="Nama Lengkap" value={nama} onChange={(e) => setNama(e.target.value)} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3 mb-md-0">
                <label className="form-label fw-bold">Email*</label>
                <input type="email" className="form-control" placeholder="Email aktif" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">No. WhatsApp*</label>
                <input type="tel" className="form-control" placeholder="08xx xxxx xxxx" value={wa} onChange={(e) => setWa(e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Tujuan Pengajuan (opsional)</label>
              <input className="form-control" placeholder="Keperluan surat..." value={tujuan} onChange={(e) => setTujuan(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Foto NPWP / Bukti Pendukung</label>
              <div className="input-group">
                <button type="button" className="btn btn-outline-secondary" onClick={() => fileRef.current?.click()}>
                  <i className="fas fa-upload me-1"></i> Pilih File
                </button>
                <input type="text" className="form-control bg-light" readOnly value={npwpFileName} />
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setFotoNpwp(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
              <div className="form-text text-danger mt-1 small">*PDF, Word, PNG, JPG, JPEG</div>
            </div>

            <div className="mb-3 position-relative">
              <label className="form-label fw-bold">Alamat Lengkap*</label>
              <input
                className="form-control"
                value={alamat}
                onChange={(e) => {
                  setAlamat(e.target.value);
                  setShowSuggest(true);
                }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
                placeholder="Ketik alamat domisili Anda..."
              />
              {showSuggest && (loadingSuggest || suggestions.length > 0) && (
                <ul className="list-group position-absolute w-100 shadow mt-1" style={{ zIndex: 1050 }}>
                  {loadingSuggest && <li className="list-group-item text-muted text-center py-2">Mencari alamat...</li>}
                  {!loadingSuggest &&
                    suggestions.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        className="list-group-item list-group-item-action py-2 lh-sm px-3"
                        onClick={() => {
                          setAlamat(s.label);
                          setKoordinat([s.lat, s.lon]);
                          setShowSuggest(false);
                        }}
                      >
                        <small>{s.label}</small>
                      </button>
                    ))}
                </ul>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold mb-2">Tandai Lokasi Rumah di Peta</label>
              <div className="rounded overflow-hidden border shadow-sm">
                <MapContainer center={koordinat} zoom={14} style={{ height: 360, width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <FlyTo position={koordinat} />
                  <PickMarker value={koordinat} onChange={setKoordinat} />
                </MapContainer>
              </div>
            </div>

            <div className="d-grid mt-4">
              <button className="btn btn-primary btn-lg" type="submit">
                <i className="fas fa-paper-plane me-2"></i> Ajukan Surat Sekarang
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}