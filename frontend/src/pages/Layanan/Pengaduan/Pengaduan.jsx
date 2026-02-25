import { useMemo, useRef, useState } from "react";
import "./Pengaduan.css";
import { FiHeadphones } from "react-icons/fi";

const KATEGORI = ["Infrastruktur", "Pelayanan", "Kesehatan", "Keamanan", "Kebersihan", "Lainnya"];

export default function Pengaduan() {
  const fileRef = useRef(null);

  const [nama, setNama] = useState("");
  const [wa, setWa] = useState("");
  const [kategori, setKategori] = useState("Infrastruktur");
  const [alasan, setAlasan] = useState("");
  const [file, setFile] = useState(null);

  const fileName = useMemo(() => (file ? file.name : "Belum ada dokumen yang dipilih"), [file]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!nama.trim() || !wa.trim() || !kategori || !alasan.trim()) {
      alert("Lengkapi data wajib ya.");
      return;
    }

    // TODO: nanti kirim ke backend pakai FormData
    console.log({ nama, wa, kategori, alasan, file });

    alert("Pengaduan terkirim (dummy).");
    setNama("");
    setWa("");
    setKategori("Infrastruktur");
    setAlasan("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
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
            <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
              {KATEGORI.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
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

          <button className="btnSend" type="submit">
            Kirim
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