import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../../services/api";
import "./laporan-dana-desa.css";

function rupiah(n) {
    if (!n && n !== 0) return "Rp 0";
    return "Rp " + Number(n).toLocaleString("id-ID");
}

const COLORS = ["#0fa78d", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#10b981"];

export default function LaporanDanaDesa() {
    const [budgets,  setBudgets]  = useState([]);
    const [summary,  setSummary]  = useState({});
    const [loading,  setLoading]  = useState(true);
    const [year,     setYear]     = useState(String(new Date().getFullYear()));

    const years = useMemo(() => {
        const set = new Set(budgets.map(b => b.tahun));
        set.add(String(new Date().getFullYear()));
        return [...set].sort((a, b) => b - a);
    }, [budgets]);

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

    // Group by sumber_dana for pie chart
    const pieData = useMemo(() => {
        const map = {};
        budgets.forEach(b => {
            if (!map[b.sumber_dana]) map[b.sumber_dana] = 0;
            map[b.sumber_dana] += Number(b.nominal_anggaran) || 0;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [budgets]);

    // Group by kategori for realisasi table
    const byKategori = useMemo(() => {
        const map = {};
        budgets.forEach(b => {
            if (!map[b.kategori]) map[b.kategori] = { anggaran: 0, realisasi: 0 };
            map[b.kategori].anggaran  += Number(b.nominal_anggaran) || 0;
            map[b.kategori].realisasi += Number(b.nominal_realisasi) || 0;
        });
        return Object.entries(map).map(([kategori, d]) => ({ kategori, ...d }));
    }, [budgets]);

    const persen = summary.total_anggaran > 0
        ? Math.round((summary.total_realisasi / summary.total_anggaran) * 100) : 0;

    return (
        <div className="laporan-root">
            <div className="laporan-container">

                <div className="laporan-header">
                    <div>
                        <h1 className="laporan-title">Laporan Dana Desa</h1>
                        <p className="laporan-subtitle">Transparansi penggunaan dana desa kepada masyarakat.</p>
                    </div>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                        {(years.length ? years : [String(new Date().getFullYear())]).map(y => (
                            <button key={y} type="button"
                                style={{ padding:"8px 20px", borderRadius:"20px", border:"2px solid #0fa78d",
                                    background: year === y ? "#0fa78d" : "#fff",
                                    color: year === y ? "#fff" : "#0fa78d", cursor:"pointer", fontWeight:700 }}
                                onClick={() => setYear(y)}>Tahun {y}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? <div style={{padding:"2rem",textAlign:"center"}}>Memuat laporan...</div> : (
                <>
                    {/* Summary cards */}
                    <div className="laporan-stats">
                        <div className="ls-card">
                            <div className="ls-label">Total APBDes {year}</div>
                            <div className="ls-value green">{rupiah(summary.total_anggaran)}</div>
                        </div>
                        <div className="ls-card">
                            <div className="ls-label">Terealisasi</div>
                            <div className="ls-value blue">{rupiah(summary.total_realisasi)}</div>
                        </div>
                        <div className="ls-card">
                            <div className="ls-label">Sisa Anggaran</div>
                            <div className="ls-value yellow">{rupiah(summary.sisa_anggaran)}</div>
                        </div>
                        <div className="ls-card">
                            <div className="ls-label">% Realisasi</div>
                            <div className="ls-value purple">{persen}%</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="laporan-card">
                        <h3>Progress Realisasi Anggaran {year}</h3>
                        <div style={{ background:"#e5e7eb", borderRadius:"999px", height:"24px", overflow:"hidden", margin:"12px 0" }}>
                            <div style={{ width:`${persen}%`, background:"#0fa78d", height:"100%", borderRadius:"999px",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                color:"#fff", fontSize:"12px", fontWeight:700, minWidth:"40px" }}>
                                {persen}%
                            </div>
                        </div>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
                        {/* Pie Chart */}
                        <div className="laporan-card">
                            <h3>Distribusi Sumber Dana</h3>
                            {pieData.length === 0 ? <div style={{color:"#999",textAlign:"center",padding:"1rem"}}>Tidak ada data</div> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={v => rupiah(v)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Realisasi by kategori */}
                        <div className="laporan-card">
                            <h3>Realisasi per Kategori</h3>
                            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"14px" }}>
                                <thead><tr style={{ textAlign:"left", borderBottom:"2px solid #e5e7eb" }}>
                                    <th style={{padding:"8px 4px"}}>Kategori</th>
                                    <th style={{padding:"8px 4px",textAlign:"right"}}>Anggaran</th>
                                    <th style={{padding:"8px 4px",textAlign:"right"}}>Realisasi</th>
                                    <th style={{padding:"8px 4px",textAlign:"right"}}>%</th>
                                </tr></thead>
                                <tbody>
                                    {byKategori.length === 0 ? (
                                        <tr><td colSpan="4" style={{textAlign:"center",padding:"1rem",color:"#999"}}>Tidak ada data</td></tr>
                                    ) : byKategori.map((r, i) => (
                                        <tr key={i} style={{ borderBottom:"1px solid #f3f4f6" }}>
                                            <td style={{padding:"8px 4px"}}>{r.kategori}</td>
                                            <td style={{padding:"8px 4px",textAlign:"right"}}>{rupiah(r.anggaran)}</td>
                                            <td style={{padding:"8px 4px",textAlign:"right"}}>{rupiah(r.realisasi)}</td>
                                            <td style={{padding:"8px 4px",textAlign:"right",fontWeight:700,color:"#0fa78d"}}>
                                                {r.anggaran > 0 ? Math.round((r.realisasi / r.anggaran) * 100) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
                )}
            </div>
        </div>
    );
}
