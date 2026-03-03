import { useState, useMemo } from "react";
import api from "../../../services/api";
import "./input-apbdes.css";

const BULAN_LIST = ["Januari","Februari","Maret","April","Mei","Juni",
                    "Juli","Agustus","September","Oktober","November","Desember"];

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
    return Number(v).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

function CurrencyInput({ value, onChange, placeholder }) {
    return (
        <div className="apb-field-currency">
            <input inputMode="numeric" pattern="[0-9]*" className="apb-input apb-input--large"
                value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={placeholder} />
            <div className="apb-currencyPreview">{formatRupiah(value)}</div>
        </div>
    );
}

export default function Input_APBDes() {
    const [year,        setYear]        = useState(new Date().getFullYear());
    const [bulan,       setBulan]       = useState("Januari");
    const [villageName, setVillageName] = useState("");
    const [note,        setNote]        = useState("");
    const [saving,      setSaving]      = useState(false);
    const [saved,       setSaved]       = useState(false);

    const [pendapatan, setPendapatan] = useState(commonIncome.map(k => ({ key: k, value: "" })));
    const [belanja,    setBelanja]    = useState(commonExpense.map(k => ({ key: k, value: "" })));
    const [pembiayaan, setPembiayaan] = useState({ penerimaan: "", pengeluaran: "" });

    const totalPendapatan = useMemo(() => pendapatan.reduce((s, p) => s + (Number(p.value) || 0), 0), [pendapatan]);
    const totalBelanja    = useMemo(() => belanja.reduce((s, b) => s + (Number(b.value) || 0), 0), [belanja]);
    const totalPembiayaan = useMemo(() => (Number(pembiayaan.penerimaan) || 0) - (Number(pembiayaan.pengeluaran) || 0), [pembiayaan]);

    function updateItem(list, setList, idx, key, val) {
        const copy = [...list];
        copy[idx] = { ...copy[idx], [key]: val };
        setList(copy);
    }
    function addRow(list, setList)           { setList([...list, { key: "(Isi nama)", value: "" }]); }
    function removeRow(list, setList, idx)   { setList(list.filter((_, i) => i !== idx)); }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        // Buat baris APBDes: setiap item menjadi satu record budget
        const rows = [
            ...pendapatan.filter(p => p.value).map(p => ({
                tahun: String(year), bulan, kategori: "Pemasukan",
                sumber_dana: p.key, deskripsi: p.key,
                nominal_anggaran: Number(p.value), nominal_realisasi: 0,
                keterangan: `APBDes ${year} â€” ${villageName}`,
            })),
            ...belanja.filter(b => b.value).map(b => ({
                tahun: String(year), bulan, kategori: b.key.includes("Modal") ? "Belanja Modal" : "Belanja Desa",
                sumber_dana: "APBDes", deskripsi: b.key,
                nominal_anggaran: Number(b.value), nominal_realisasi: 0,
                keterangan: note || `APBDes ${year} â€” ${villageName}`,
            })),
        ];

        try {
            await Promise.all(rows.map(r => api.post("/budgets", r)));
            setSaved(true);
        } catch {
            alert("Gagal menyimpan APBDes ke server.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="apb-page">
            <header className="apb-top">
                <div className="apb-title">Input APBDes â€” Formulir Mudah &amp; Ramah Orang Tua</div>
                <div className="apb-sub">Data akan langsung tersimpan ke database desa</div>
            </header>

            {saved && (
                <div style={{ background:"#d1fae5", color:"#065f46", padding:"12px 24px", margin:"12px 24px", borderRadius:"10px", fontWeight:600 }}>
                    âœ… Data APBDes berhasil disimpan ke database!
                </div>
            )}

            <form className="apb-shell" onSubmit={handleSubmit}>
                <main className="apb-main">
                    <section className="apb-card">
                        <h3 className="apb-h">Informasi Dasar</h3>
                        <label className="apb-label">Nama Desa</label>
                        <input className="apb-input" value={villageName} onChange={e => setVillageName(e.target.value)} placeholder="Contoh: Desa Sukamaju" />
                        <label className="apb-label">Tahun Anggaran</label>
                        <input type="number" className="apb-input" value={year} onChange={e => setYear(Number(e.target.value || 0))} />
                        <label className="apb-label">Bulan</label>
                        <select className="apb-input" value={bulan} onChange={e => setBulan(e.target.value)}>
                            {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
                        </select>
                    </section>

                    <section className="apb-card">
                        <h3 className="apb-h">Pendapatan Desa</h3>
                        <div className="apb-grid">
                            {pendapatan.map((p, i) => (
                                <div key={i} className="apb-row">
                                    <input className="apb-input apb-input--name" value={p.key} onChange={e => updateItem(pendapatan, setPendapatan, i, 'key', e.target.value)} />
                                    <CurrencyInput value={p.value} onChange={v => updateItem(pendapatan, setPendapatan, i, 'value', v)} placeholder="0" />
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
                                    <input className="apb-input apb-input--name" value={b.key} onChange={e => updateItem(belanja, setBelanja, i, 'key', e.target.value)} />
                                    <CurrencyInput value={b.value} onChange={v => updateItem(belanja, setBelanja, i, 'value', v)} placeholder="0" />
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
                        <CurrencyInput value={pembiayaan.penerimaan} onChange={v => setPembiayaan({ ...pembiayaan, penerimaan: v })} />
                        <label className="apb-label">Pengeluaran Pembiayaan</label>
                        <CurrencyInput value={pembiayaan.pengeluaran} onChange={v => setPembiayaan({ ...pembiayaan, pengeluaran: v })} />
                        <div className="apb-actions">
                            <div className="apb-total">Nett Pembiayaan: <strong>{formatRupiah(totalPembiayaan)}</strong></div>
                        </div>
                    </section>

                    <section className="apb-card">
                        <h3 className="apb-h">Catatan &amp; Simpan</h3>
                        <label className="apb-label">Catatan singkat</label>
                        <textarea className="apb-input apb-input--textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Keterangan tambahan..." />
                        <div className="apb-actions apb-actions--end">
                            <button type="submit" className="apb-submit" disabled={saving}>{saving ? "Menyimpanâ€¦" : "Simpan APBDes"}</button>
                        </div>
                    </section>
                </main>

                <aside className="apb-side">
                    <div className="apb-sideCard">
                        <div className="apb-sideTitle">Ringkasan Cepat</div>
                        <div className="apb-sideRow">Desa: <strong>{villageName || 'â€”'}</strong></div>
                        <div className="apb-sideRow">Tahun: <strong>{year}</strong></div>
                        <div className="apb-sideRow">Bulan: <strong>{bulan}</strong></div>
                        <hr />
                        <div className="apb-sideRow">Total Pendapatan: <strong>{formatRupiah(totalPendapatan)}</strong></div>
                        <div className="apb-sideRow">Total Belanja: <strong>{formatRupiah(totalBelanja)}</strong></div>
                        <div className="apb-sideRow">Pembiayaan Nett: <strong>{formatRupiah(totalPembiayaan)}</strong></div>
                        <div className="apb-sideNote">Tips: Setiap baris pendapatan &amp; belanja akan tersimpan sebagai satu record di database.</div>
                    </div>
                </aside>
            </form>
        </div>
    );
}
