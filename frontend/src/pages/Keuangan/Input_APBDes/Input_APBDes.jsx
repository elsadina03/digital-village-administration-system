import { useState, useMemo } from "react";
import "./input-apbdes.css";

const commonIncome = [
  "Dana Desa",
  "Alokasi Dana Desa",
  "Bantuan Provinsi",
  "Pendapatan Asli Desa",
];

const commonExpense = [
  "Belanja Pegawai",
  "Belanja Barang dan Jasa",
  "Belanja Modal",
  "Bantuan Sosial",
];

function formatRupiah(v) {
  if (v === "" || v == null) return "";
  const n = Number(v) || 0;
  return n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

function CurrencyInput({ value, onChange, placeholder }) {
  return (
    <div className="apb-field-currency">
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        className="apb-input apb-input--large"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder={placeholder}
      />
      <div className="apb-currencyPreview">{formatRupiah(value)}</div>
    </div>
  );
}

export default function Input_APBDes() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [villageName, setVillageName] = useState("");

  const [pendapatan, setPendapatan] = useState(
    commonIncome.map((k) => ({ key: k, value: "" }))
  );

  const [belanja, setBelanja] = useState(
    commonExpense.map((k) => ({ key: k, value: "" }))
  );

  const [pembiayaan, setPembiayaan] = useState({ penerimaan: "", pengeluaran: "" });
  const [note, setNote] = useState("");

  const totalPendapatan = useMemo(
    () => pendapatan.reduce((s, p) => s + (Number(p.value) || 0), 0),
    [pendapatan]
  );
  const totalBelanja = useMemo(
    () => belanja.reduce((s, b) => s + (Number(b.value) || 0), 0),
    [belanja]
  );
  const totalPembiayaan = useMemo(
    () => (Number(pembiayaan.penerimaan) || 0) - (Number(pembiayaan.pengeluaran) || 0),
    [pembiayaan]
  );

  function updateItem(list, setList, idx, key, val) {
    const copy = [...list];
    copy[idx] = { ...copy[idx], [key]: val };
    setList(copy);
  }

  function addRow(list, setList) {
    setList([...list, { key: "(Isi nama)", value: "" }]);
  }

  function removeRow(list, setList, idx) {
    const copy = list.filter((_, i) => i !== idx);
    setList(copy);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      year,
      villageName,
      pendapatan,
      belanja,
      pembiayaan,
      totals: { totalPendapatan, totalBelanja, totalPembiayaan },
      note,
    };

    console.log("APBDes Payload:", payload);
    alert("Data APBDes tersimpan (demo). Lihat console untuk payload.");
  }

  return (
    <div className="apb-page">
      <header className="apb-top">
        <div className="apb-title">Input APBDes — Formulir Mudah & Ramah Orang Tua</div>
        <div className="apb-sub">Panduan singkat tersedia di setiap bagian</div>
      </header>

      <form className="apb-shell" onSubmit={handleSubmit}>
        <main className="apb-main">
          <section className="apb-card">
            <h3 className="apb-h">Informasi Dasar</h3>

            <label className="apb-label">Nama Desa</label>
            <input className="apb-input" value={villageName} onChange={(e) => setVillageName(e.target.value)} placeholder="Contoh: Desa Sukamaju" />

            <label className="apb-label">Tahun Anggaran</label>
            <input type="number" className="apb-input" value={year} onChange={(e) => setYear(Number(e.target.value || 0))} />

            <div className="apb-help">Contoh komponen APBDes: Pendapatan (Dana Desa, Alokasi, PAD), Belanja (Pegawai, Barang/Jasa, Modal), Pembiayaan.</div>
          </section>

          <section className="apb-card">
            <h3 className="apb-h">Pendapatan Desa</h3>
            <div className="apb-grid">
              {pendapatan.map((p, i) => (
                <div key={i} className="apb-row">
                  <input className="apb-input apb-input--name" value={p.key} onChange={(e) => updateItem(pendapatan, setPendapatan, i, 'key', e.target.value)} />
                  <CurrencyInput value={p.value} onChange={(v) => updateItem(pendapatan, setPendapatan, i, 'value', v)} placeholder="0" />
                  <button type="button" className="apb-minor" onClick={() => removeRow(pendapatan, setPendapatan, i)}>Hapus</button>
                </div>
              ))}
            </div>

            <div className="apb-actions">
              <button type="button" className="apb-action" onClick={() => addRow(pendapatan, setPendapatan)}>Tambah Jenis Pendapatan</button>
              <div className="apb-total">Total Pendapatan: <strong>{formatRupiah(totalPendapatan)}</strong></div>
            </div>
          </section>

          <section className="apb-card">
            <h3 className="apb-h">Belanja Desa</h3>

            <div className="apb-grid">
              {belanja.map((b, i) => (
                <div key={i} className="apb-row">
                  <input className="apb-input apb-input--name" value={b.key} onChange={(e) => updateItem(belanja, setBelanja, i, 'key', e.target.value)} />
                  <CurrencyInput value={b.value} onChange={(v) => updateItem(belanja, setBelanja, i, 'value', v)} placeholder="0" />
                  <button type="button" className="apb-minor" onClick={() => removeRow(belanja, setBelanja, i)}>Hapus</button>
                </div>
              ))}
            </div>

            <div className="apb-actions">
              <button type="button" className="apb-action" onClick={() => addRow(belanja, setBelanja)}>Tambah Jenis Belanja</button>
              <div className="apb-total">Total Belanja: <strong>{formatRupiah(totalBelanja)}</strong></div>
            </div>
          </section>

          <section className="apb-card">
            <h3 className="apb-h">Pembiayaan</h3>
            <label className="apb-label">Penerimaan Pembiayaan</label>
            <CurrencyInput value={pembiayaan.penerimaan} onChange={(v) => setPembiayaan({ ...pembiayaan, penerimaan: v })} />

            <label className="apb-label">Pengeluaran Pembiayaan</label>
            <CurrencyInput value={pembiayaan.pengeluaran} onChange={(v) => setPembiayaan({ ...pembiayaan, pengeluaran: v })} />

            <div className="apb-help">Pembiayaan biasanya berisi sisa dana tahun sebelumnya dan transaksi non-operasional.</div>
            <div className="apb-actions">
              <div className="apb-total">Nett Pembiayaan: <strong>{formatRupiah(totalPembiayaan)}</strong></div>
            </div>
          </section>

          <section className="apb-card">
            <h3 className="apb-h">Catatan &amp; Simpan</h3>
            <label className="apb-label">Catatan singkat</label>
            <textarea className="apb-input apb-input--textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Keterangan tambahan untuk APBDes..." />

            <div className="apb-actions apb-actions--end">
              <button type="submit" className="apb-submit">Simpan APBDes</button>
              <button type="button" className="apb-secondary" onClick={() => {
                // reset minimal
                setNote(""); setVillageName("");
              }}>Bersihkan</button>
            </div>
          </section>
        </main>

        <aside className="apb-side">
          <div className="apb-sideCard">
            <div className="apb-sideTitle">Ringkasan Cepat</div>
            <div className="apb-sideRow">Desa: <strong>{villageName || '—'}</strong></div>
            <div className="apb-sideRow">Tahun: <strong>{year}</strong></div>
            <hr />
            <div className="apb-sideRow">Total Pendapatan: <strong>{formatRupiah(totalPendapatan)}</strong></div>
            <div className="apb-sideRow">Total Belanja: <strong>{formatRupiah(totalBelanja)}</strong></div>
            <div className="apb-sideRow">Pembiayaan Nett: <strong>{formatRupiah(totalPembiayaan)}</strong></div>

            <div className="apb-sideNote">Tips: Cek kembali pemasukan utama seperti Dana Desa dan PAD sebelum menyimpan.</div>
          </div>
        </aside>
      </form>
    </div>
  );
}
