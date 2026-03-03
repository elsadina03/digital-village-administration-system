import { useState, useEffect, useContext } from "react";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import "./kependudukan.css";

export default function Kependudukan() {
    const [citizens, setCitizens] = useState([]);
    const [stats, setStats] = useState({ total: 0, laki_laki: 0, perempuan: 0 });
    const [loading, setLoading] = useState(true);
    const [importFile, setImportFile] = useState(null);

    const { isAdmin, hasRole } = useContext(AuthContext);
    const canImport = isAdmin() || hasRole("Kepala Desa");

    const fetchCitizens = async () => {
        try {
            const [listRes, statsRes] = await Promise.all([
                api.get("/citizens"),
                api.get("/citizens/stats")
            ]);
            setCitizens(listRes.data.data ? listRes.data.data : listRes.data);

            // Format the stats to match the state
            const beStats = statsRes.data.data ? statsRes.data.data : statsRes.data;
            let mCount = 0;
            let fCount = 0;

            if (beStats.gender_stats) {
                beStats.gender_stats.forEach(g => {
                    if (g.gender === 'Laki-laki' || g.gender === 'L') mCount += g.count;
                    if (g.gender === 'Perempuan' || g.gender === 'P') fCount += g.count;
                });
            }

            setStats({
                total: beStats.total_citizens || 0,
                laki_laki: mCount,
                perempuan: fCount
            });
        } catch (err) {
            console.error("Gagal memuat data penduduk", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCitizens();
    }, []);

    const handleExport = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/citizens/export", {
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "data-penduduk.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Gagal mengexport data", err);
            alert("Gagal mengexport data.");
        }
    };

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) return;

        const formData = new FormData();
        formData.append("file", importFile);

        try {
            await api.post("/citizens/import", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Data berhasil diimport!");
            setImportFile(null);
            fetchCitizens();
        } catch (err) {
            alert("Gagal mengimport data Excel.");
            console.error(err);
        }
    };

    if (loading) return <div className="kependudukan-container">Loading data...</div>;

    return (
        <div className="kependudukan-container">
            <div className="kependudukan-header">
                <div>
                    <h2>Data Kependudukan Desa</h2>
                    <p>Manajemen dan rekapitulasi jumlah penduduk aktif</p>
                </div>
                <div className="header-actions">
                    <button className="btn-export" onClick={handleExport}>
                        📥 Export Excel
                    </button>
                </div>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon total-icon">👥</div>
                    <div className="stat-info">
                        <p>Total Penduduk</p>
                        <h3>{stats.total} <span>Jiwa</span></h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon m-icon">👨</div>
                    <div className="stat-info">
                        <p>Laki-Laki</p>
                        <h3>{stats.laki_laki} <span>Orang</span></h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon f-icon">👩</div>
                    <div className="stat-info">
                        <p>Perempuan</p>
                        <h3>{stats.perempuan} <span>Orang</span></h3>
                    </div>
                </div>
            </div>

            {canImport && (
                <div className="import-section">
                    <h3>Import Data dari Excel</h3>
                    <form className="import-form" onSubmit={handleImport}>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={(e) => setImportFile(e.target.files[0])}
                        />
                        <button type="submit" className="btn-import" disabled={!importFile}>
                            Upload & Import
                        </button>
                    </form>
                    <small className="help-text">Format didukung: .xls, .xlsx. Pastikan header kolom sesuai (nik, nama, jk, dsb).</small>
                </div>
            )}

            <div className="table-card">
                <h3>Daftar Warga Terdaftar</h3>
                <div className="table-responsive">
                    <table className="citizen-table">
                        <thead>
                            <tr>
                                <th>NIK</th>
                                <th>Nama Lengkap</th>
                                <th>Tempat, Tgl Lahir</th>
                                <th>Jenis Kelamin</th>
                                <th>Alamat</th>
                                <th>Pekerjaan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citizens.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center empty-state">Belum ada data penduduk. Silakan import dari Excel.</td>
                                </tr>
                            ) : (
                                citizens.map((c) => (
                                    <tr key={c.id}>
                                        <td className="font-mono">{c.nik}</td>
                                        <td className="font-medium">{c.nama}</td>
                                        <td>{c.tempat_lahir}, {c.tanggal_lahir}</td>
                                        <td>
                                            <span className={`badge-jk ${c.jk === 'L' ? 'badge-m' : 'badge-f'}`}>
                                                {c.jk === 'L' ? 'Laki-laki' : 'Perempuan'}
                                            </span>
                                        </td>
                                        <td>{c.alamat}</td>
                                        <td>{c.pekerjaan || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
