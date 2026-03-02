import { useState } from "react";
import "./PembuatanSurat.css";

function generateNomor() {
  const t = new Date();
  const year = t.getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `DESA/${year}/${seq}`;
}

export default function PembuatanSurat() {
  const [nama, setNama] = useState("");
  const [tipe, setTipe] = useState("");
  const [nomor, setNomor] = useState("");
  const [filePreview, setFilePreview] = useState("");

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFilePreview(url);
  };

  const submit = (e) => {
    e.preventDefault();
    const item = { nama, tipe, nomor: nomor || generateNomor(), file: filePreview, status: "Diproses oleh Sekretaris" };
    const raw = localStorage.getItem("suratDiproses") || "[]";
    const arr = JSON.parse(raw);
    arr.unshift(item);
    localStorage.setItem("suratDiproses", JSON.stringify(arr));
    // reset
    setNama("");
    setTipe("");
    setNomor("");
    setFilePreview("");
    alert("Surat disimpan ke daftar proses (mock). Akan tampil di Surat Diproses.");
  };

  return (
    <div className="pembuatan-page">
      <h2>Pembuatan Surat</h2>
      <p className="muted">Halaman sekretaris untuk membuat/men-generate nomor surat dan mengupload file surat final.</p>

      <form className="form" onSubmit={submit}>
        <label>Nama Pemohon</label>
        <input value={nama} onChange={(e) => setNama(e.target.value)} required />

        <label>Jenis Surat</label>
        <input value={tipe} onChange={(e) => setTipe(e.target.value)} placeholder="Contoh: Surat Keterangan" required />

        <div className="row">
          <div>
            <label>Nomor Surat (auto)</label>
            <input value={nomor} onChange={(e) => setNomor(e.target.value)} placeholder="Klik generate atau isi manual" />
          </div>
          <button type="button" className="btn gen" onClick={() => setNomor(generateNomor())}>
            Generate Nomor
          </button>
        </div>

        <label>Upload File Surat (PDF / gambar) — mock</label>
        <input type="file" accept="application/pdf,image/*" onChange={handleFile} />

        {filePreview && (
          <div className="preview">Preview: <a href={filePreview} target="_blank" rel="noreferrer">Lihat</a></div>
        )}

        <div style={{ marginTop: 12 }}>
          <button className="btn primary" type="submit">Simpan & Kirim ke Daftar Proses</button>
        </div>
      </form>
    </div>
  );
}
