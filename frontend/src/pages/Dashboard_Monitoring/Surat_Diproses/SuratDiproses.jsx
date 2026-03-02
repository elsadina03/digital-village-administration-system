import { useEffect, useState } from "react";
import "./suratdiproses.css";

export default function SuratDiproses() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("suratDiproses") || "[]";
      setItems(JSON.parse(raw));
    } catch (e) {
      setItems([]);
    }
  }, []);

  const markDelivered = (idx) => {
    const next = [...items];
    next[idx] = { ...next[idx], status: "Selesai - Dikirim ke Warga" };
    setItems(next);
    localStorage.setItem("suratDiproses", JSON.stringify(next));
  };

  return (
    <div className="surat-page">
      <h2>Surat Diproses</h2>
      <p className="muted">Daftar surat yang sudah diproses oleh sekretaris dan menunggu pengiriman/arsip.</p>

      {items.length === 0 ? (
        <div className="empty">Belum ada surat yang diproses.</div>
      ) : (
        <div className="list">
          {items.map((it, i) => (
            <div key={i} className="card">
              <div className="card-left">
                <div className="no">{it.nomor || "-"}</div>
                <div className="meta">{it.nama}</div>
                <div className="meta small">{it.tipe}</div>
              </div>
              <div className="card-right">
                <div className="status">{it.status || "Menunggu"}</div>
                <div className="actions">
                  {it.file ? (
                    <a className="btn" href={it.file} target="_blank" rel="noreferrer">Lihat File</a>
                  ) : (
                    <span className="muted">Belum ada file</span>
                  )}
                  <button className="btn primary" onClick={() => markDelivered(i)}>
                    Tandai Selesai
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
