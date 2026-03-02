import { useState, useEffect } from "react";
import axios from "axios";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import "./anggaran.css";

export default function Anggaran() {
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState({
        total_anggaran: 0,
        total_realisasi: 0,
        persentase_realisasi: 0
    });
    const [loading, setLoading] = useState(true);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        tahun: new Date().getFullYear().toString(),
        sumber_dana: "Dana Desa (DD)",
        nominal_anggaran: "",
        nominal_realisasi: "0",
        keterangan: ""
    });

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const canAddData = ["Bendahara", "Admin Desa", "Kepala Desa"].includes(user.role);

    const fetchBudgets = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/api/budgets", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudgets(response.data.data);
            setSummary(response.data.summary);
        } catch (err) {
            console.error("Gagal memuat data anggaran", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8000/api/budgets", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Data anggaran berhasil ditambahkan!");
            setShowForm(false);
            setFormData({ ...formData, nominal_anggaran: "", keterangan: "", nominal_realisasi: "0" });
            fetchBudgets();
        } catch (err) {
            alert("Terjadi kesalahan saat menyimpan data.");
            console.error(err);
        }
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka || 0);
    };

    // Data for Charts
    const pieData = [
        { name: 'Terserap (Realisasi)', value: Number(summary.total_realisasi) },
        { name: 'Sisa Anggaran', value: Number(summary.total_anggaran) - Number(summary.total_realisasi) }
    ];
    const COLORS = ['#10b981', '#cbd5e1'];

    // Group by Sumber Dana for Bar Chart
    const sumberDanaMap = {};
    budgets.forEach(b => {
        if (!sumberDanaMap[b.sumber_dana]) {
            sumberDanaMap[b.sumber_dana] = { name: b.sumber_dana, Anggaran: 0, Realisasi: 0 };
        }
        sumberDanaMap[b.sumber_dana].Anggaran += Number(b.nominal_anggaran);
        sumberDanaMap[b.sumber_dana].Realisasi += Number(b.nominal_realisasi);
    });
    const barData = Object.values(sumberDanaMap);

    if (loading) return <div className="anggaran-container">Loading data...</div>;

    return (
        <div className="anggaran-container">
            <div className="anggaran-header">
                <div>
                    <h2>Monitoring Keuangan Desa</h2>
                    <p>Transparansi anggaran dan realisasi dana desa</p>
                </div>
                {canAddData && (
                    <button
                        className="btn-add-budget"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Tutup Form" : "+ Input Anggaran"}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="budget-form-card">
                    <h3>Input Data Anggaran Baru</h3>
                    <form onSubmit={handleSubmit} className="budget-form">
                        <div className="form-group">
                            <label>Tahun Anggaran</label>
                            <input type="text" value={formData.tahun} onChange={e => setFormData({ ...formData, tahun: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Sumber Dana</label>
                            <select value={formData.sumber_dana} onChange={e => setFormData({ ...formData, sumber_dana: e.target.value })}>
                                <option value="Dana Desa (DD)">Dana Desa (DD)</option>
                                <option value="Alokasi Dana Desa (ADD)">Alokasi Dana Desa (ADD)</option>
                                <option value="Pendapatan Asli Desa (PADes)">Pendapatan Asli Desa (PADes)</option>
                                <option value="Bantuan Provinsi">Bantuan Provinsi</option>
                                <option value="Lain-lain">Lain-lain</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nominal Anggaran (Rp)</label>
                            <input type="number" value={formData.nominal_anggaran} onChange={e => setFormData({ ...formData, nominal_anggaran: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Nominal Realisasi (Rp) - <i>Bisa nol (0)</i></label>
                            <input type="number" value={formData.nominal_realisasi} onChange={e => setFormData({ ...formData, nominal_realisasi: e.target.value })} />
                        </div>
                        <div className="form-group full-width">
                            <label>Keterangan Penggunaan</label>
                            <textarea value={formData.keterangan} onChange={e => setFormData({ ...formData, keterangan: e.target.value })} rows="3"></textarea>
                        </div>
                        <div className="form-actions full-width">
                            <button type="submit" className="btn-save">Simpan Data</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card budget-total">
                    <div className="card-icon">💰</div>
                    <div className="card-info">
                        <p>Total Anggaran</p>
                        <h3>{formatRupiah(summary.total_anggaran)}</h3>
                    </div>
                </div>
                <div className="summary-card budget-realisasi">
                    <div className="card-icon">📈</div>
                    <div className="card-info">
                        <p>Total Realisasi</p>
                        <h3>{formatRupiah(summary.total_realisasi)}</h3>
                    </div>
                </div>
                <div className="summary-card budget-persen">
                    <div className="card-icon">📊</div>
                    <div className="card-info">
                        <p>Persentase Penyerapan</p>
                        <h3>{summary.persentase_realisasi.toFixed(1)}%</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Visualisasi Penyerapan Dana</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatRupiah(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Anggaran per Sumber Dana</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(value) => `Rp ${value / 1000000}M`} width={80} />
                                <Tooltip formatter={(value) => formatRupiah(value)} />
                                <Legend />
                                <Bar dataKey="Anggaran" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Realisasi" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="budget-table-card">
                <h3>Rincian Data Anggaran</h3>
                <div className="table-responsive">
                    <table className="budget-table">
                        <thead>
                            <tr>
                                <th>Tahun</th>
                                <th>Sumber Dana</th>
                                <th>Keterangan</th>
                                <th className="text-right">Anggaran</th>
                                <th className="text-right">Realisasi</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.length === 0 ? (
                                <tr><td colSpan="6" className="text-center empty-state">Belum ada data anggaran yang diinput.</td></tr>
                            ) : (
                                budgets.map((b) => {
                                    const percent = b.nominal_anggaran > 0 ? (b.nominal_realisasi / b.nominal_anggaran) * 100 : 0;
                                    return (
                                        <tr key={b.id}>
                                            <td>{b.tahun}</td>
                                            <td><span className="source-badge">{b.sumber_dana}</span></td>
                                            <td>{b.keterangan || "-"}</td>
                                            <td className="text-right font-medium">{formatRupiah(b.nominal_anggaran)}</td>
                                            <td className="text-right text-green">{formatRupiah(b.nominal_realisasi)}</td>
                                            <td className="text-center">
                                                <div className="progress-bar-container">
                                                    <div className="progress-bar-fill" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                                </div>
                                                <span className="progress-text">{percent.toFixed(1)}%</span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
