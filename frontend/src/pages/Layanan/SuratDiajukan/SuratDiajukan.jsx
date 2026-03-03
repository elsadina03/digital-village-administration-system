import { useEffect, useState, useRef, useContext } from "react";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import "./SuratDiajukan.css";

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

const STATUS_BADGE = {
  pending:         { label: "Menunggu",           cls: "badge-pending" },
  menunggu_kepdes: { label: "Menunggu Kepala Desa", cls: "badge-review" },
  diproses:        { label: "Diproses",            cls: "badge-process" },
  selesai:         { label: "Selesai",             cls: "badge-done" },
  ditolak:         { label: "Ditolak",             cls: "badge-reject" },
};

export default function SuratDiajukan() {
  const { user } = useContext(AuthContext);

  const [letters, setLetters]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);   // letter yang dibuka di modal

  // form state for processing modal
  const [letterNumber, setLetterNumber]   = useState("");
  const [docFile, setDocFile]             = useState(null);
  const [genLoading, setGenLoading]       = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const docRef = useRef(null);

  // filter
  const [filterStatus, setFilterStatus] = useState("pending");

  const fetchLetters = async () => {
    setLoading(true);
    try {
      const res  = await api.get("/letters");
      const data = res.data.data ?? res.data;
      setLetters(data);
    } catch (err) {
      console.error("Gagal memuat surat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLetters(); }, []);

  const filtered = letters.filter(l =>
    filterStatus === "semua" ? true : l.status === filterStatus
  );

  /* ── Open modal ── */
  const openModal = (letter) => {
    setSelected(letter);
    setLetterNumber(letter.letter_number || "");
    setDocFile(null);
  };

  const closeModal = () => {
    setSelected(null);
    setLetterNumber("");
    setDocFile(null);
  };

  /* ── Auto-generate letter number ── */
  const handleGenerate = async () => {
    if (!selected) return;
    setGenLoading(true);
    try {
      const jenis = selected.letter_type?.name || "";
      const res   = await api.get(`/letters/generate-number?jenis=${encodeURIComponent(jenis)}`);
      setLetterNumber(res.data.letter_number);
    } catch {
      alert("Gagal generate nomor surat.");
    } finally {
      setGenLoading(false);
    }
  };

  /* ── Submit to KepDes ── */
  const handleKirimKepDes = async () => {
    if (!letterNumber.trim()) {
      alert("Nomor surat wajib diisi sebelum mengirim ke Kepala Desa.");
      return;
    }
    setSubmitLoading(true);
    try {
      if (docFile) {
        // PHP/Laravel tidak bisa parse multipart/form-data pada PATCH.
        // Gunakan POST + _method=PUT (method spoofing) agar file bisa terkirim.
        const fd = new FormData();
        fd.append("_method",       "PUT");
        fd.append("status",        "menunggu_kepdes");
        fd.append("letter_number", letterNumber);
        fd.append("processed_by",  user?.name || "Sekretaris");
        fd.append("document_path", docFile);
        await api.post(`/letters/${selected.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Tanpa file → kirim JSON biasa
        await api.patch(`/letters/${selected.id}`, {
          status:        "menunggu_kepdes",
          letter_number: letterNumber,
          processed_by:  user?.name || "Sekretaris",
        });
      }

      alert("Surat berhasil dikirim ke Kepala Desa!");
      closeModal();
      fetchLetters();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengirim surat.");
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ── Tolak dari sekretaris ── */
  const handleTolak = async () => {
    const note = window.prompt("Masukkan alasan penolakan:");
    if (note === null) return; // cancelled
    setSubmitLoading(true);
    try {
      await api.patch(`/letters/${selected.id}`, {
        status:         "ditolak",
        rejection_note: note,
        processed_by:   user?.name || "Sekretaris",
      });
      alert("Surat ditolak.");
      closeModal();
      fetchLetters();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menolak surat.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="sd-wrap">
      <div className="sd-header">
        <div>
          <h2 className="sd-title">Surat yang Diajukan</h2>
          <p className="sd-sub">Kelola pengajuan surat warga, buat nomor surat, dan kirim ke Kepala Desa.</p>
        </div>

        <div className="sd-filter">
          {["semua", "pending", "menunggu_kepdes", "selesai", "ditolak"].map(s => (
            <button
              key={s}
              className={`filter-btn ${filterStatus === s ? "active" : ""}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "semua" ? "Semua" : STATUS_BADGE[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="sd-empty">Memuat data surat…</div>
      ) : filtered.length === 0 ? (
        <div className="sd-empty">Tidak ada surat dengan status ini.</div>
      ) : (
        <div className="sd-table-wrap">
          <table className="sd-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tanggal</th>
                <th>Nama Pemohon</th>
                <th>Jenis Surat</th>
                <th>No. WA</th>
                <th>Status</th>
                <th>No. Surat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, idx) => {
                const badge = STATUS_BADGE[l.status] || { label: l.status, cls: "badge-pending" };
                return (
                  <tr key={l.id}>
                    <td>{idx + 1}</td>
                    <td>{l.created_at?.split("T")[0] ?? "-"}</td>
                    <td>{l.nama}</td>
                    <td>{l.letter_type?.name ?? "-"}</td>
                    <td>{l.wa}</td>
                    <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>{l.letter_number || <span className="muted">—</span>}</td>
                    <td>
                      <button className="btn-detail" onClick={() => openModal(l)}>
                        Proses
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Detail Pengajuan Surat</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Applicant info */}
              <div className="info-grid">
                <InfoRow label="Jenis Surat"  value={selected.letter_type?.name ?? "-"} />
                <InfoRow label="Nama"         value={selected.nama} />
                <InfoRow label="Email"        value={selected.email} />
                <InfoRow label="No. WA"       value={selected.wa} />
                <InfoRow label="Alamat"       value={selected.alamat} />
                {selected.tujuan && <InfoRow label="Tujuan" value={selected.tujuan} />}
                <InfoRow label="Tgl Pengajuan" value={selected.created_at?.split("T")[0]} />
                <InfoRow label="Status"
                  value={<span className={`badge ${STATUS_BADGE[selected.status]?.cls}`}>
                    {STATUS_BADGE[selected.status]?.label || selected.status}
                  </span>}
                />
              </div>

              {/* NPWP Photo */}
              {selected.foto_npwp && (
                <div className="attachment-row">
                  <span className="attachment-label">Foto NPWP / Dokumen Pemohon:</span>
                  <a
                    href={STORAGE_URL + selected.foto_npwp}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-link"
                  >
                    Lihat Dokumen
                  </a>
                </div>
              )}

              {/* Processed document (if already uploaded) */}
              {selected.document_path && (
                <div className="attachment-row">
                  <span className="attachment-label">Surat yang Sudah Dibuat:</span>
                  <a
                    href={STORAGE_URL + selected.document_path}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-link"
                  >
                    Lihat Surat
                  </a>
                </div>
              )}

              {/* Processing form — only show if still in processable state */}
              {(selected.status === "pending" || selected.status === "diproses") && (
                <div className="process-form">
                  <hr />
                  <h4>Proses Surat</h4>

                  {/* Letter number */}
                  <div className="form-row">
                    <label>Nomor Surat*</label>
                    <div className="input-with-btn">
                      <input
                        value={letterNumber}
                        onChange={e => setLetterNumber(e.target.value)}
                        placeholder="Contoh: 001/SKD/DS/III/2026"
                      />
                      <button
                        type="button"
                        className="btn-gen"
                        onClick={handleGenerate}
                        disabled={genLoading}
                      >
                        {genLoading ? "…" : "Auto"}
                      </button>
                    </div>
                  </div>

                  {/* Upload processed document */}
                  <div className="form-row">
                    <label>Upload Surat yang Sudah Dibuat</label>
                    <div className="file-row">
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => docRef.current?.click()}
                      >
                        Pilih File
                      </button>
                      <span className="file-name">
                        {docFile ? docFile.name : "Belum ada file (PDF, Word)"}
                      </span>
                      <input
                        ref={docRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        style={{ display: "none" }}
                        onChange={e => setDocFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                    <p className="hint">*PDF, Word, PNG, JPG, JPEG</p>
                  </div>

                  {/* Action buttons */}
                  <div className="modal-actions">
                    <button
                      className="btn-primary"
                      onClick={handleKirimKepDes}
                      disabled={submitLoading}
                    >
                      {submitLoading ? "Mengirim…" : "Kirim ke Kepala Desa"}
                    </button>
                    <button
                      className="btn-danger"
                      onClick={handleTolak}
                      disabled={submitLoading}
                    >
                      Tolak Pengajuan
                    </button>
                  </div>
                </div>
              )}

              {/* Already sent to KepDes */}
              {selected.status === "menunggu_kepdes" && (
                <div className="info-notice">
                  ✅ Surat sudah dikirim ke Kepala Desa dan menunggu persetujuan.
                  {selected.processed_by && <span> Diproses oleh: <b>{selected.processed_by}</b></span>}
                </div>
              )}

              {/* Rejected info */}
              {selected.status === "ditolak" && selected.rejection_note && (
                <div className="info-notice danger">
                  ❌ Ditolak — {selected.rejection_note}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
