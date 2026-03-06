import { useEffect, useMemo, useRef, useState, useContext } from "react";
import api from "../../../services/api";
import { AuthContext, STAFF_ROLES } from "../../../context/AuthContext";
import { LuPrinter, LuTrash2 } from "react-icons/lu";
import "./PengajuanSurat.css";
import ttdImg from "../../../assets/ttd_taza.png";



const SURAT_OPTIONS = [
  "Surat Usaha",
  "Surat Keterangan Domisili",
  "Surat Keterangan Beasiswa",
  "Surat Tidak Mampu",
];

/* ================= STATUS ================= */
const STATUS_BADGE = {
  pending:         { label: "Menunggu Diproses",   cls: "badge--wait" },
  diproses:        { label: "Sedang Diproses",      cls: "badge--process" },
  menunggu_kepdes: { label: "Menunggu Kepala Desa", cls: "badge--review" },
  selesai:         { label: "Selesai / Disetujui",  cls: "badge--done" },
  ditolak:         { label: "Ditolak",              cls: "badge--reject" },
};

/* ================= PDF HELPER ================= */
const KEPDES_NAME = "Bapak Kepala Desa";
const KEPDES_NIP  = "19750318 200312 1 002";

function buildLetterHtml(letter, ttdUrl) {
  const jenis   = letter.judul        || "Surat Keterangan";
  const nomor   = letter.letter_number || "___/___/___/___";
  const nama    = letter.nama          || "—";
  const alamat  = letter.alamat        || "—";
  const tujuan  = letter.tujuan        || "keperluan yang bersangkutan";
  const bln     = ["Januari","Februari","Maret","April","Mei","Juni",
                   "Juli","Agustus","September","Oktober","November","Desember"];
  const d       = new Date();
  const tanggal = `${d.getDate()} ${bln[d.getMonth()]} ${d.getFullYear()}`;
  // Absolute URL so the popup window (same origin) can load the image
  const imgSrc  = ttdUrl ? (window.location.origin + ttdUrl) : "";

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
  const win  = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Pop-up diblokir. Harap izinkan pop-up di browser untuk fitur cetak."); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
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
        id:             l.id,
        judul:          l.letter_type?.name || "Surat",
        waktu:          new Date(l.created_at).toLocaleDateString("id-ID"),
        status:         l.status,
        nama:           l.nama,
        alamat:         l.alamat,
        tujuan:         l.tujuan,
        wa:             l.wa,
        letter_number:  l.letter_number,
        rejection_note: l.rejection_note,
        user_id:        l.user_id,
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
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [fotoNpwp, setFotoNpwp] = useState(null);

  const [alamat, setAlamat] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  const [koordinat, setKoordinat] = useState([-7.3798, 112.7869]);

  const npwpFileName = useMemo(
    () => (fotoNpwp ? fotoNpwp.name : "Belum ada file yang dipilih"),
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
    // Warga hanya bisa hapus surat miliknya sendiri yang masih pending atau ditolak
    return x.status === "pending" || x.status === "ditolak";
  }

  async function handleAjukan(e) {
    e.preventDefault();

    if (!jenisSurat || !nama || !email || !wa || !alamat) {
      alert("Lengkapi data wajib.");
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

      // refresh
      fetchRiwayat();
      setPage(1);

      // reset
      setJenisSurat("");
      setNama("");
      setEmail("");
      setWa("");
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
    <div className="psWrap">
      {/* ================= RIWAYAT ================= */}
      <div className="box">
        <h1 className="title">Riwayat Pengajuan</h1>

        <div className="historyArea">
          {riwayatLoading ? (
            <div className="historyEmpty">Memuat riwayat…</div>
          ) : riwayatError ? (
            <div className="historyEmpty" style={{ color: "#ef4444" }}>
              {riwayatError}
              <br />
              <button
                onClick={fetchRiwayat}
                style={{ marginTop: "0.75rem", padding: "0.4rem 1rem", cursor: "pointer", border: "1px solid #ef4444", borderRadius: "6px", background: "transparent", color: "#ef4444", fontSize: "0.85rem" }}
              >
                Coba lagi
              </button>
            </div>
          ) : riwayatPage.length === 0 ? (
            <div className="historyEmpty">Belum ada riwayat pengajuan untuk akun ini.</div>
          ) : (
            <div className="cards">
              {riwayatPage.map((x) => {
                const badge = STATUS_BADGE[x.status] || { label: x.status, cls: "badge--wait" };
                return (
                  <div key={x.id} className="card">
                    <div className="cardTitle">{x.judul}</div>
                    {x.letter_number && (
                      <div className="cardNomor">No: {x.letter_number}</div>
                    )}
                    <div className="cardTime">{x.waktu}</div>
                    {x.status === "ditolak" && x.rejection_note && (
                      <div className="cardReject">{x.rejection_note}</div>
                    )}
                    <div className="cardFoot">
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      {x.status === "selesai" && (
                        <button
                          className="btnExportPdf"
                          onClick={() => handleExportPDF(x)}
                          title="Cetak / Simpan surat sebagai PDF"
                        >
                          <LuPrinter size={13} /> Cetak PDF
                        </button>
                      )}
                      {canDelete(x) && (
                        <button
                          className="btnDeleteCard"
                          onClick={() => handleDelete(x)}
                          title="Hapus pengajuan"
                        >
                          <LuTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================= FORM ================= */}
      <h2 className="formTitle">Pengajuan Surat</h2>

      <form className="form" onSubmit={handleAjukan}>
        <div className="grid2">
          <div className="field">
            <label>Jenis Surat*</label>
            <select value={jenisSurat} onChange={(e) => setJenisSurat(e.target.value)}>
              <option value="">Pilih kategori surat</option>
              {SURAT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Nama*</label>
            <input value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>

          <div className="field">
            <label>Email*</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="field">
            <label>No. WhatsApp*</label>
            <input value={wa} onChange={(e) => setWa(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Tujuan (opsional)</label>
          <input value={tujuan} onChange={(e) => setTujuan(e.target.value)} />
        </div>

        <div className="field">
          <label>Foto NPWP</label>

          <div className="fileRow">
            <button
              type="button"
              className="btnGhost"
              onClick={() => fileRef.current?.click()}
            >
              Pilih File
            </button>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => setFotoNpwp(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />

            <div className={`fileName ${fotoNpwp ? "filled" : ""}`}>
              {npwpFileName}
            </div>
          </div>

          <div className="hint">*PDF, Word, PNG, JPG, JPEG</div>
        </div>

        {/* ================= ALAMAT AUTOCOMPLETE ================= */}
        <div className="field">
          <label>Alamat*</label>

          <div style={{ position: "relative" }}>
            <input
              value={alamat}
              onChange={(e) => {
                setAlamat(e.target.value);
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              placeholder="Ketik alamat..."
            />

            {showSuggest && (loadingSuggest || suggestions.length > 0) && (
              <div className="suggestBox">
                {loadingSuggest && <div className="suggestItem">Mencari...</div>}

                {!loadingSuggest &&
                  suggestions.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      className="suggestItem"
                      onClick={() => {
                        setAlamat(s.label);
                        setKoordinat([s.lat, s.lon]);
                        setShowSuggest(false);
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= MAP ================= */}
        <div className="mapWrap">
          <iframe
            title="Lokasi Alamat"
            src={`https://maps.google.com/maps?q=${koordinat[0]},${koordinat[1]}&z=15&output=embed`}
            style={{ width: "100%", height: 360, border: 0, borderRadius: 12, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <button className="btnSubmit">Ajukan</button>
      </form>
    </div>
  );
}