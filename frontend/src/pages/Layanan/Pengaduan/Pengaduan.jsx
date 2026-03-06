import { useMemo, useRef, useState, useEffect } from "react";
import api from "../../../services/api";
import "./Pengaduan.css";
import { FiHeadphones } from "react-icons/fi";
import { LuChevronDown } from "react-icons/lu";

const KATEGORI = ["Infrastruktur", "Pelayanan", "Kesehatan", "Keamanan", "Kebersihan", "Lainnya"];

export default function Pengaduan() {
  const fileRef = useRef(null);

  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");
  const [kategori, setKategori] = useState("Infrastruktur");
  const [alasan, setAlasan] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // custom dropdown
  const [showKategoriDd, setShowKategoriDd] = useState(false);
  const kategoriDdRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (kategoriDdRef.current && !kategoriDdRef.current.contains(e.target)) setShowKategoriDd(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fileName = useMemo(() => (file ? file.name : "Belum ada dokumen yang dipilih"), [file]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nama.trim() || !wa.trim() || !kategori || !alasan.trim()) {
      alert("Lengkapi data wajib ya.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nama", nama);
      formData.append("wa", wa);
      formData.append("title", `[${kategori}] ${alasan.substring(0, 100)}`);
      formData.append("description", alasan);
      if (file) formData.append("file", file);

      await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Pengaduan berhasil dikirim!");
      setNama("");
      setWa("");
      setKategori("Infrastruktur");
      setAlasan("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim pengaduan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleHelpClick() {
    alert("Bantuan/Chat (dummy). Nanti bisa kamu sambungin ke WhatsApp atau halaman help.");
  }

  return (
    <div className="pgWrap">
      <div className="pgCard">
        <form className="pgForm" onSubmit={handleSubmit}>
          <div className="field">
            <label>Nama</label>
            <div className="inputIcon">
              <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan Nama Anda" />
            </div>
          </div>

          <div className="field">
            <label>No. WhatsApp Aktif</label>
            <div className="inputIcon">
              <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="Masukkan no. WhatsApp" />
            </div>
          </div>

          <div className="field">
            <label>Kategori Pengaduan</label>
            <div className="pgDdWrap" ref={kategoriDdRef}>
              <button
                type="button"
                className="pgDdBtn"
                onClick={() => setShowKategoriDd((s) => !s)}
              >
                <span>{kategori}</span>
                <LuChevronDown size={14} className={`pgDdCaret${showKategoriDd ? " open" : ""}`} />
              </button>
              {showKategoriDd && (
                <div className="pgDdMenu">
                  {KATEGORI.map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={kategori === k ? "active" : ""}
                      onClick={() => { setKategori(k); setShowKategoriDd(false); }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="field">
            <label>Alasan Pengaduan</label>
            <div className="inputIcon">
              <input value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Masukkan Alasan Pengaduan" />
            </div>
          </div>

          <div className="field">
            <label>Lampiran</label>
            <div className="fileRow">
              <button type="button" className="btnGhost" onClick={() => fileRef.current?.click()}>
                Pilih File
              </button>

              <input
                ref={fileRef}
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{ display: "none" }}
              />

              <div className={`fileName ${file ? "filled" : ""}`}>{fileName}</div>
            </div>

            <div className="hint">*PNG, JPG, PDF, Word; max 10MB</div>
          </div>

          <button className="btnSend" type="submit" disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim"}
          </button>
        </form>
      </div>

      {/* Floating Help Button */}
        <button className="helpFab" onClick={handleHelpClick} aria-label="Bantuan">
        <FiHeadphones size={24} />
        </button>
    </div>
  );
}