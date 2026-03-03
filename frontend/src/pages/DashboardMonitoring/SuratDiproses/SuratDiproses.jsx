import { useState, useEffect, useContext } from "react";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import "./suratDiproses.css";

export default function SuratDiproses() {
    const [suratList, setSuratList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { hasRole } = useContext(AuthContext);
    const isWarga = hasRole("Warga");

    useEffect(() => {
        fetchSurat();
    }, []);

    const fetchSurat = async () => {
        try {
            const response = await api.get("/letters");
            setSuratList(response.data.data);
        } catch (err) {
            setError("Gagal memuat data surat.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/letters/${id}`, { status: newStatus });
            fetchSurat();
            alert(`Status berhasil diubah menjadi: ${newStatus}`);
        } catch (err) {
            alert("Gagal mengupdate status surat");
        }
    };

    if (loading) return <div className="surat-container">Loading...</div>;
    if (error) return <div className="surat-container error">{error}</div>;

    return (
        <div className="surat-container">
            <div className="surat-header">
                <h2>{isWarga ? "Riwayat Surat Saya" : "Daftar Surat Masuk"}</h2>
                <p>
                    {isWarga
                        ? "Pantau status pengajuan surat yang telah Anda buat."
                        : "Monitor dan proses pengajuan surat dari warga."}
                </p>
            </div>

            <div className="surat-table-wrapper">
                <table className="surat-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama Pemohon</th>
                            <th>Jenis Surat</th>
                            <th>Tanggal Pengajuan</th>
                            <th>Status</th>
                            {!isWarga && <th>Aksi</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {suratList.length === 0 ? (
                            <tr>
                                <td colSpan={isWarga ? 5 : 6} className="text-center">
                                    Belum ada data surat.
                                </td>
                            </tr>
                        ) : (
                            suratList.map((surat) => (
                                <tr key={surat.id}>
                                    <td>#{surat.id}</td>
                                    <td>{surat.nama}</td>
                                    <td>{surat.letter_type?.name}</td>
                                    <td>{new Date(surat.created_at).toLocaleDateString("id-ID")}</td>
                                    <td>
                                        <span className={`status-badge status-${surat.status.toLowerCase()}`}>
                                            {surat.status}
                                        </span>
                                    </td>
                                    {!isWarga && (
                                        <td className="action-buttons">
                                            {surat.status === "pending" && (
                                                <button
                                                    className="btn-proses"
                                                    onClick={() => updateStatus(surat.id, "diproses")}
                                                >
                                                    Proses
                                                </button>
                                            )}
                                            {surat.status === "diproses" && (
                                                <button
                                                    className="btn-selesai"
                                                    onClick={() => updateStatus(surat.id, "selesai")}
                                                >
                                                    Selesai
                                                </button>
                                            )}
                                            {(surat.status === "pending" || surat.status === "diproses") && (
                                                <button
                                                    className="btn-tolak"
                                                    onClick={() => updateStatus(surat.id, "ditolak")}
                                                >
                                                    Tolak
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
