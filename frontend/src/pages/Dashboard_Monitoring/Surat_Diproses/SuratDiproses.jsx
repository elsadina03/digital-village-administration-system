import { useEffect, useState, useContext } from "react";
import "./suratdiproses.css";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";

const STATUS_LABELS = {
  menunggu: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export default function SuratDiproses() {
  const { canProcessLetters } = useContext(AuthContext);
  const canProcess = canProcessLetters();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await api.get("/letters");
      const data = res.data.data ?? res.data;
      // Filter only processed letters (status: diproses or selesai)
      setItems(data.filter(l => l.status === "diproses" || l.status === "selesai"));
    } catch (err) {
      console.error("Gagal memuat surat diproses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLetters(); }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/letters/${id}/status`, { status: newStatus });
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: newStatus } : it));
    } catch {
      alert("Gagal memperbarui status surat.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="surat-page"><p>Memuat data surat...</p></div>;

  return (
    <div className="surat-page">
      <h2>Surat Diproses</h2>
      <p className="muted">Daftar surat yang sudah diproses dan menunggu pengiriman/arsip.</p>

      {items.length === 0 ? (
        <div className="empty">Belum ada surat yang diproses.</div>
      ) : (
        <div className="list">
          {items.map((it) => (
            <div key={it.id} className="card">
              <div className="card-left">
                <div className="no">{it.nomor_surat || `#${it.id}`}</div>
                <div className="meta">{it.citizen?.nama_lengkap ?? it.nama ?? "-"}</div>
                <div className="meta small">{it.letter_type?.name ?? it.jenis_surat ?? "-"}</div>
                <div className="meta small">Tgl: {it.tanggal_pengajuan ?? it.created_at?.split("T")[0] ?? "-"}</div>
              </div>
              <div className="card-right">
                <div className="status">{STATUS_LABELS[it.status] ?? it.status}</div>
                {canProcess && it.status === "diproses" && (
                  <div className="actions">
                    <button
                      className="btn primary"
                      onClick={() => updateStatus(it.id, "selesai")}
                      disabled={updatingId === it.id}
                    >
                      {updatingId === it.id ? "..." : "Tandai Selesai"}
                    </button>
                    <button
                      className="btn"
                      onClick={() => updateStatus(it.id, "ditolak")}
                      disabled={updatingId === it.id}
                      style={{ marginLeft: "0.5rem", background: "#ef4444", color: "#fff" }}
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
