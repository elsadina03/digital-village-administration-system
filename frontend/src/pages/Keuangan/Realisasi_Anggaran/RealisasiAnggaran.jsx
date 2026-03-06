import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../../services/api";
import "./realisasi-anggaran.css";
import { LuBanknote, LuUpload, LuBriefcase, LuChartBar, LuCalendar, LuReceiptText, LuSearch } from "react-icons/lu";

function rupiah(n) {
    if (!n && n !== 0) return "Rp 0";
    return "Rp " + Number(n).toLocaleString("id-ID");
}

const BULAN_LIST = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const BULAN_FULL = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const KATEGORI_LIST = ["Semua","Pemasukan","Belanja Desa","Belanja Modal","Belanja Pegawai","Lainnya"];

export default function RealisasiAnggaran() {
    const [budgets,    setBudgets]    = useState([]);
    const [summary,    setSummary]    = useState({});
    const [loading,    setLoading]    = useState(true);
    const [year,       setYear]       = useState(String(new Date().getFullYear()));
    const [filterKat,  setFilterKat]  = useState("Semua");
    const [search,     setSearch]     = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await api.get("/budgets", { params: { tahun: year } });
                setBudgets(res.data.data || []);
                setSummary(res.data.summary || {});
            } finally {
                setLoading(false);
            }
        })();
    }, [year]);

    // Build monthly chart data from budgets
    const chartData = useMemo(() => {
        return BULAN_LIST.map((label, idx) => {
            const bulanFull = BULAN_FULL[idx];
            const bulanItems = budgets.filter(b => b.bulan === bulanFull);
            return {
                name: label,
                Anggaran:  bulanItems.reduce((s, b) => s + Number(b.nominal_anggaran || 0), 0),
                Realisasi: bulanItems.reduce((s, b) => s + Number(b.nominal_realisasi || 0), 0),
            };
        });
    }, [budgets]);

    const filtered = useMemo(() => {
        return budgets.filter(b => {
            const matchKat = filterKat === "Semua" || b.kategori === filterKat;
            const matchQ   = !search.trim() || (b.deskripsi + " " + b.sumber_dana).toLowerCase().includes(search.toLowerCase());
            return matchKat && matchQ;
        });
    }, [budgets, filterKat, search]);

    const years = useMemo(() => {
        const set = new Set(budgets.map(b => b.tahun));
        set.add(String(new Date().getFullYear()));
        return [...set].sort((a, b) => b - a);
    }, [budgets]);

    return (
        <div className="realisasi-root">
            <div className="realisasi-container">
                <div className="realisasi-header">
                    <h1 className="realisasi-title">Realisasi Anggaran</h1>
                    <p className="realisasi-subtitle">Monitoring pemasukan dan pengeluaran anggaran desa secara real-time.</p>
                </div>

                {/* Year selector */}
                <div style={{ marginBottom: "16px", display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {(years.length ? years : [String(new Date().getFullYear())]).map(y => (
                        <button key={y} type="button"
                            style={{ padding:"6px 16px", borderRadius:"20px", border:"1.5px solid #0fa78d",
                                background: year === y ? "#0fa78d" : "#fff",
                                color: year === y ? "#fff" : "#0fa78d", cursor:"pointer", fontWeight:600 }}
                            onClick={() => setYear(y)}>{y}
                        </button>
                    ))}
                </div>

                {/* Stat Cards */}
                <div className="realisasi-stats">
                    <div className="rs-card" style={{ borderTop: "4px solid #0fa78d" }}>
                        <div className="rs-icon"><LuBanknote size={24} /></div>
                        <div><div className="rs-label">Total APBDes</div><div className="rs-value green-text">{rupiah(summary.total_anggaran)}</div></div>
                    </div>
                    <div className="rs-card" style={{ borderTop: "4px solid #3b82f6" }}>
                        <div className="rs-icon"><LuUpload size={24} /></div>
                        <div><div className="rs-label">Sudah Direalisasi</div><div className="rs-value blue-text">{rupiah(summary.total_realisasi)}</div></div>
                    </div>
                    <div className="rs-card" style={{ borderTop: "4px solid #f59e0b" }}>
                        <div className="rs-icon"><LuBriefcase size={24} /></div>
                        <div><div className="rs-label">Sisa Anggaran</div><div className="rs-value yellow-text">{rupiah(summary.sisa_anggaran)}</div></div>
                    </div>
                    <div className="rs-card" style={{ borderTop: "4px solid #8b5cf6" }}>
                        <div className="rs-icon"><LuChartBar size={24} /></div>
                        <div><div className="rs-label">% Realisasi</div><div className="rs-value purple-text">{summary.persentase_realisasi?.toFixed(1) ?? 0}%</div></div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="realisasi-card">
                    <h3>Grafik Realisasi Bulanan Tahun {year}</h3>
                    {loading ? <div>Memuat chart...</div> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={v => `${(v/1e6).toFixed(0)}jt`} />
                                <Tooltip formatter={v => rupiah(v)} />
                                <Legend />
                                <Bar dataKey="Anggaran"  fill="#0fa78d" radius={[4,4,0,0]} />
                                <Bar dataKey="Realisasi" fill="#3b82f6" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Detail Table */}
                <div className="realisasi-card">
                    <h3>Rincian Data Anggaran</h3>
                    <div className="realisasi-toolbar">
                        <input className="realisasi-search" placeholder="Cari deskripsi..."
                            value={search} onChange={e => setSearch(e.target.value)} />
                        <select className="realisasi-select" value={filterKat} onChange={e => setFilterKat(e.target.value)}>
                            {KATEGORI_LIST.map(k => <option key={k}>{k}</option>)}
                        </select>
                    </div>

                    {loading ? <div style={{padding:"1rem"}}>Memuat data...</div> : (
                    <div className="realisasi-table-wrapper">
                        <table className="realisasi-table">
                            <thead>
                                <tr><th>#</th><th>Bulan/Tahun</th><th>Deskripsi</th><th>Sumber Dana</th><th>Kategori</th><th className="right">Anggaran</th><th className="right">Realisasi</th></tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="7" style={{textAlign:"center",padding:"1.5rem",color:"#999"}}>Tidak ada data</td></tr>
                                ) : filtered.map((b, i) => (
                                    <tr key={b.id}>
                                        <td>{i + 1}</td>
                                        <td>{b.bulan ? `${b.bulan} ${b.tahun}` : b.tahun}</td>
                                        <td>{b.deskripsi || "-"}</td>
                                        <td><span className="bidang-tag">{b.sumber_dana}</span></td>
                                        <td>{b.kategori}</td>
                                        <td className="right">{rupiah(b.nominal_anggaran)}</td>
                                        <td className="right">{rupiah(b.nominal_realisasi)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
