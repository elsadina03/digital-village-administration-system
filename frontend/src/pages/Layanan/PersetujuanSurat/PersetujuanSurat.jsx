import { useEffect, useState } from "react";
import api from "../../../services/api";
import "./PersetujuanSurat.css";

const STORAGE_URL = "http://127.0.0.1:8000/storage/";

const STATUS_BADGE = {
  pending:         { label: "Menunggu",             cls: "badge-pending" },
  menunggu_kepdes: { label: "Menunggu Persetujuan", cls: "badge-review" },
  diproses:        { label: "Diproses",             cls: "badge-process" },
  selesai:         { label: "Disetujui",            cls: "badge-done" },
  ditolak:         { label: "Ditolak",              cls: "badge-reject" },
};

export default function PersetujuanSurat() {
  const [letters, setLetters]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("menunggu_kepdes");

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

  const openModal  = (l) => setSelected(l);
  const closeModal = () => setSelected(null);

  /* ── Setujui ── */
  const handleSetujui = async () => {
    setSubmitLoading(true);
    try {
      await api.patch(`/letters/${selected.id}`, { status: "selesai" });
      alert("Surat disetujui! Notifikasi WA dikirim ke pemohon.");
      const updated = { ...selected, status: "selesai" };
      setSelected(updated);
      fetchLetters();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyetujui surat.");
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ── Tolak ── */
  const handleTolak = async () => {
    const note = window.prompt("Masukkan alasan penolakan:");
    if (note === null) return;
    setSubmitLoading(true);
    try {
      await api.patch(`/letters/${selected.id}`, {
        status:         "ditolak",
        rejection_note: note,
      });
      alert("Surat ditolak. Notifikasi WA dikirim ke pemohon.");
      const updated = { ...selected, status: "ditolak", rejection_note: note };
      setSelected(updated);
      fetchLetters();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menolak surat.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="ps-wrap">
      <div className="ps-header">
        <div>
          <h2 className="ps-title">Persetujuan Surat</h2>
          <p className="ps-sub">Tinjau surat yang dikirim Sekretaris, setujui atau tolak, lalu ekspor PDF.</p>
        </div>

        <div className="ps-filter">
          {["semua", "menunggu_kepdes", "selesai", "ditolak"].map(s => (
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
        <div className="ps-empty">Memuat data surat…</div>
      ) : filtered.length === 0 ? (
        <div className="ps-empty">Tidak ada surat dengan status ini.</div>
      ) : (
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tanggal</th>
                <th>Nama Pemohon</th>
                <th>Jenis Surat</th>
                <th>No. Surat</th>
                <th>Diproses Oleh</th>
                <th>Status</th>
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
                    <td>{l.letter_number || <span className="muted">—</span>}</td>
                    <td>{l.processed_by || <span className="muted">—</span>}</td>
                    <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>
                      <button className="btn-detail" onClick={() => openModal(l)}>
                        Tinjau
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
              <h3>Tinjauan Surat — {selected.letter_type?.name}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Info pemohon */}
              <div className="info-grid">
                <InfoRow label="Nama"          value={selected.nama} />
                <InfoRow label="Email"         value={selected.email} />
                <InfoRow label="No. WA"        value={selected.wa} />
                <InfoRow label="Alamat"        value={selected.alamat} />
                {selected.tujuan && <InfoRow label="Tujuan" value={selected.tujuan} />}
                <InfoRow label="Tgl Pengajuan" value={selected.created_at?.split("T")[0]} />
                <InfoRow label="No. Surat"     value={selected.letter_number || "—"} />
                <InfoRow label="Diproses Oleh" value={selected.processed_by || "—"} />
                <InfoRow label="Status"
                  value={<span className={`badge ${STATUS_BADGE[selected.status]?.cls}`}>
                    {STATUS_BADGE[selected.status]?.label || selected.status}
                  </span>}
                />
              </div>

              {/* Documents */}
              <div className="docs-row">
                {selected.foto_npwp && (
                  <a
                    href={STORAGE_URL + selected.foto_npwp}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-card"
                  >
                    📎 Dokumen Pemohon (NPWP)
                  </a>
                )}
                {selected.document_path && (
                  <a
                    href={STORAGE_URL + selected.document_path}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-card"
                  >
                    📄 Surat dari Sekretaris
                  </a>
                )}
              </div>

              {/* Rejection note if ditolak */}
              {selected.status === "ditolak" && selected.rejection_note && (
                <div className="info-notice danger">
                  ❌ Alasan Penolakan: {selected.rejection_note}
                </div>
              )}

              {/* selesai notice */}
              {selected.status === "selesai" && (
                <div className="info-notice">
                  ✅ Surat telah disetujui dan notifikasi WA sudah dikirim ke pemohon.
                </div>
              )}

              {/* Actions */}
              <div className="modal-actions">
                {/* Approve & reject — only if still waiting */}
                {selected.status === "menunggu_kepdes" && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={handleSetujui}
                      disabled={submitLoading}
                    >
                      {submitLoading ? "Memproses…" : "✅ Setujui Surat"}
                    </button>
                    <button
                      className="btn-danger"
                      onClick={handleTolak}
                      disabled={submitLoading}
                    >
                      ❌ Tolak
                    </button>
                  </>
                )}
              </div>
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
