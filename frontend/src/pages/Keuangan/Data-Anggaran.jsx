import { useContext, useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Data-Anggaran.css";
import { LuLandmark, LuSearch, LuClipboardList, LuBanknote, LuTrendingUp, LuCalendar, LuCircleCheck } from "react-icons/lu";

const BULAN_LIST = ["Semua Bulan","Januari","Februari","Maret","April","Mei","Juni",
                    "Juli","Agustus","September","Oktober","November","Desember"];
const KATEGORI_LIST = ["Pemasukan","Belanja Desa","Belanja Modal","Belanja Pegawai","Lainnya"];

function rupiah(n) {
    if (!n && n !== 0) return "Rp -";
    return "Rp " + Number(n).toLocaleString("id-ID");
}

function Pill({ kind, children }) {
    return <span className={`kw-pill kw-pill--${kind}`}>{children}</span>;
}

function pillKind(k) {
    if (k === "Pemasukan") return "green";
    if (k === "Belanja Modal") return "amber";
    return "mint";
}

export default function DataAnggaran() {
    const { isAdmin, canAccessFinance } = useContext(AuthContext);

    const [budgets,  setBudgets]  = useState([]);
    const [summary,  setSummary]  = useState({});
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);

    const [tab,    setTab]    = useState("pemasukan");
    const [q,      setQ]      = useState("");
    const [year,   setYear]   = useState(String(new Date().getFullYear()));
    const [month,  setMonth]  = useState("Semua Bulan");
    const [page,   setPage]   = useState(1);
    const PER_PAGE = 10;

    // ... Modal tambah / edit ...
    const [showForm, setShowForm]   = useState(false);
    const [editId,   setEditId]     = useState(null);
    const [form,     setForm]       = useState({
        tahun: String(new Date().getFullYear()),
        kategori: "Pemasukan", deskripsi: "", bulan: "Januari",
        sumber_dana: "", nominal_anggaran: "", nominal_realisasi: "0", keterangan: "",
    });

    const years = useMemo(() => {
        const set = new Set(budgets.map(b => b.tahun));
        set.add(String(new Date().getFullYear()));
        return [...set].sort((a, b) => b - a);
    }, [budgets]);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const params = {};
            if (year)                  params.tahun = year;
            if (month !== "Semua Bulan") params.bulan = month;
            const res = await api.get("/budgets", { params });
            setBudgets(res.data.data || []);
            setSummary(res.data.summary || {});
        } catch (e) {
            setError("Gagal memuat data anggaran.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBudgets(); }, [year, month]); // eslint-disable-line

    const rows = useMemo(() => {
        const s = q.trim().toLowerCase();
        let list = budgets;
        if (s) list = list.filter(b => (b.deskripsi + " " + b.sumber_dana + " " + b.kategori).toLowerCase().includes(s));
        if (tab === "pemasukan")   list = list.filter(b => b.kategori === "Pemasukan");
        if (tab === "pengeluaran") list = list.filter(b => b.kategori !== "Pemasukan");
        return list;
    }, [budgets, q, tab]);

    const paginated = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));

    // ... CRUD handlers ...
    const openAdd  = () => { setEditId(null); setForm({ tahun: year, kategori: "Pemasukan", deskripsi: "", bulan: "Januari", sumber_dana: "", nominal_anggaran: "", nominal_realisasi: "0", keterangan: "" }); setShowForm(true); };
    const openEdit = (b) => { setEditId(b.id); setForm({ tahun: b.tahun, kategori: b.kategori ?? "Pemasukan", deskripsi: b.deskripsi ?? "", bulan: b.bulan ?? "Januari", sumber_dana: b.sumber_dana, nominal_anggaran: b.nominal_anggaran, nominal_realisasi: b.nominal_realisasi, keterangan: b.keterangan ?? "" }); setShowForm(true); };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/budgets/${editId}`, form);
            } else {
                await api.post("/budgets", form);
            }
            setShowForm(false);
            fetchBudgets();
        } catch {
            alert("Gagal menyimpan data.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus data anggaran ini?")) return;
        try {
            await api.delete(`/budgets/${id}`);
            fetchBudgets();
        } catch { alert("Gagal menghapus."); }
    };

    return (
        <div className="kw-page">
            {/* Topbar */}
            <header className="kw-topbar">
                <div className="kw-brand">
                    <span className="kw-logo"><LuLandmark size={22} /></span>
                    <div className="kw-title">Manajemen Keuangan Desa</div>
                </div>
                <div className="kw-actions">
                    <div className="kw-search">
                        <span className="kw-search-ico"><LuSearch size={16} /></span>
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari deskripsi / sumber dana" />
                    </div>
                    {canAccessFinance() && (
                        <button className="kw-export" type="button" onClick={openAdd}>
                            + Tambah Data
                        </button>
                    )}
                </div>
            </header>

            {showForm && (
                <div className="kw-modal-overlay" onClick={() => setShowForm(false)}>
                    <form className="kw-modal" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
                        <div className="kw-modal-title">{editId ? "Edit Data Anggaran" : "Tambah Data Anggaran"}</div>
                        <div className="kw-form-grid">
                            <label>Tahun<input className="kw-input" value={form.tahun} onChange={e => setForm(p => ({...p, tahun: e.target.value}))} required /></label>
                            <label>Bulan
                                <select className="kw-input" value={form.bulan} onChange={e => setForm(p => ({...p, bulan: e.target.value}))}>
                                    {BULAN_LIST.slice(1).map(b => <option key={b}>{b}</option>)}
                                </select>
                            </label>
                            <label>Kategori
                                <select className="kw-input" value={form.kategori} onChange={e => setForm(p => ({...p, kategori: e.target.value}))}>
                                    {KATEGORI_LIST.map(k => <option key={k}>{k}</option>)}
                                </select>
                            </label>
                            <label>Sumber Dana<input className="kw-input" value={form.sumber_dana} onChange={e => setForm(p => ({...p, sumber_dana: e.target.value}))} required /></label>
                            <label className="kw-form-full">Deskripsi<input className="kw-input" value={form.deskripsi} onChange={e => setForm(p => ({...p, deskripsi: e.target.value}))} /></label>
                            <label>Nominal Anggaran (Rp)<input type="number" className="kw-input" value={form.nominal_anggaran} onChange={e => setForm(p => ({...p, nominal_anggaran: e.target.value}))} required /></label>
                            <label>Realisasi (Rp)<input type="number" className="kw-input" value={form.nominal_realisasi} onChange={e => setForm(p => ({...p, nominal_realisasi: e.target.value}))} /></label>
                            <label className="kw-form-full">Keterangan<textarea className="kw-input" value={form.keterangan} onChange={e => setForm(p => ({...p, keterangan: e.target.value}))} /></label>
                        </div>
                        <div className="kw-modal-actions">
                            <button type="button" className="kw-btn-cancel" onClick={() => setShowForm(false)}>Batal</button>
                            <button type="submit" className="kw-btn-save">Simpan</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="kw-shell">
                <main className="kw-main">
                    {/* Stat cards */}
                    <section className="kw-cards">
                        <div className="kw-card">
                            <div className="kw-card-ico"><LuLandmark size={24} /></div>
                            <div><div className="kw-card-k">Total APBDes</div><div className="kw-card-v">{rupiah(summary.total_anggaran)}</div></div>
                        </div>
                        <div className="kw-card">
                            <div className="kw-card-ico"><LuClipboardList size={24} /></div>
                            <div><div className="kw-card-k">Realisasi Anggaran</div><div className="kw-card-v">{rupiah(summary.total_realisasi)}</div></div>
                        </div>
                        <div className="kw-card">
                            <div className="kw-card-ico"><LuBanknote size={24} /></div>
                            <div><div className="kw-card-k">Sisa Anggaran</div><div className="kw-card-v">{rupiah(summary.sisa_anggaran)}</div></div>
                        </div>
                        <div className="kw-card">
                            <div className="kw-card-ico"><LuTrendingUp size={24} /></div>
                            <div><div className="kw-card-k">% Realisasi</div><div className="kw-card-v">{summary.persentase_realisasi?.toFixed(1) ?? 0}%</div></div>
                        </div>
                    </section>

                    <section className="kw-panel">
                        <div className="kw-panel-head">
                            <div className="kw-panel-title">Monitoring Pemasukan &amp; Pengeluaran</div>
                        </div>

                        <div className="kw-tabs">
                            {["pemasukan","pengeluaran","laporan"].map(t => (
                                <button key={t} className={`kw-tab ${tab === t ? "is-active" : ""}`} onClick={() => { setTab(t); setPage(1); }} type="button">
                                    {t === "pemasukan" ? "Pemasukan" : t === "pengeluaran" ? "Pengeluaran" : "Semua"}
                                </button>
                            ))}
                        </div>

                        {loading ? <div style={{padding:"1rem"}}>Memuat data...</div> : error ? <div style={{padding:"1rem",color:"red"}}>{error}</div> : (
                        <div className="kw-tableWrap">
                            <table className="kw-table">
                                <thead>
                                    <tr>
                                        <th>BULAN/TAHUN</th>
                                        <th>DESKRIPSI</th>
                                        <th>KATEGORI</th>
                                        <th>ANGGARAN</th>
                                        <th>REALISASI</th>
                                        {canAccessFinance() && <th>AKSI</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr><td colSpan="6" style={{textAlign:"center",padding:"1.5rem",color:"#999"}}>Tidak ada data</td></tr>
                                    ) : paginated.map((b) => (
                                        <tr key={b.id}>
                                            <td className="kw-muted">{b.bulan ? `${b.bulan} ${b.tahun}` : b.tahun}</td>
                                            <td className="kw-strong">{b.deskripsi || b.sumber_dana}</td>
                                            <td><Pill kind={pillKind(b.kategori)}>{b.kategori}</Pill></td>
                                            <td className="kw-muted">{rupiah(b.nominal_anggaran)}</td>
                                            <td className="kw-strong">{rupiah(b.nominal_realisasi)}</td>
                                            {canAccessFinance() && (
                                                <td>
                                                    <button className="kw-detail" type="button" onClick={() => openEdit(b)}>Edit</button>
                                                    {isAdmin() && <button className="kw-detail kw-detail--del" type="button" onClick={() => handleDelete(b.id)}>Hapus</button>}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="kw-pager">
                                {Array.from({length: totalPages}, (_, i) => i+1).map(p => (
                                    <button key={p} type="button" className={`kw-pageBtn ${page === p ? "is-active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                                ))}
                            </div>
                        </div>
                        )}
                    </section>
                </main>

                {/* Right sidebar filter */}
                <aside className="kw-side">
                    <div className="kw-sideCard">
                        <div className="kw-sideTitle"><LuCalendar size={14} /> Tahun</div>
                        <div className="kw-radioList">
                            {years.map(y => (
                                <label key={y} className={`kw-radio ${year === y ? "is-active" : ""}`}>
                                    <input type="radio" checked={year === y} onChange={() => setYear(y)} />
                                    <span>{y}</span>
                                </label>
                            ))}
                        </div>
                        <hr className="kw-sep" />
                        <div className="kw-sideTitle"><LuCircleCheck size={14} /> Bulan</div>
                        <div className="kw-radioList">
                            {BULAN_LIST.map(m => (
                                <label key={m} className={`kw-radio ${month === m ? "is-active" : ""}`}>
                                    <input type="radio" checked={month === m} onChange={() => setMonth(m)} />
                                    <span>{m}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="kw-sideCard">
                        <div className="kw-sideTitle">Ringkasan</div>
                        <div className="kw-statList">
                            <div className="kw-statItem">Pemasukan: {rupiah(summary.total_pemasukan)}</div>
                            <div className="kw-statItem">Pengeluaran: {rupiah(summary.total_pengeluaran)}</div>
                            <div className="kw-statItem">Sisa: {rupiah(summary.sisa_anggaran)}</div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
