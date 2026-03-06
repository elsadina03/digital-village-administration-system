import React, { useMemo, useState, useRef, useEffect } from "react";
import "./LaporanKegiatan.css";
import api from "../../../services/api";
import { LuUpload, LuChevronDown } from "react-icons/lu";

function rupiah(n) {
  if (!n) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function LaporanKegiatan() {
  const [query, setQuery] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const exportRef = useRef(null);

  useEffect(() => {
    api.get("/laporan-kegiatan")
      .then(res => {
        const raw = res.data.data ?? res.data ?? [];
        setData(raw.map((p, i) => ({
          no: i + 1,
          id: p.id,
          nama: p.nama,
          tanggal: p.tanggal_mulai,
          hasil: p.realisasi_anggaran ? rupiah(p.realisasi_anggaran) : "-",
          anggaran: rupiah(p.anggaran),
          penanggung: p.penanggung_jawab,
          kendala: p.kendala ?? "-",
          progress: p.progress ?? (p.status === "Selesai" ? "100%" : p.status === "Berlangsung" ? "50%" : "0%"),
          status: p.status,
        })));
      })
      .catch(err => {
        console.error("Gagal memuat laporan kegiatan", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, query]);

  useEffect(() => {
    function handleClick(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) setShowExport(false);
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  async function exportExcel() {
    try {
      const XLSX = await import("xlsx");
      const wsData = [
        ["NO", "NAMA PROGRAM", "TANGGAL LAPORAN", "HASIL", "ANGGARAN", "PENANGGUNG JAWAB", "KENDALA", "PROGRESS"],
        ...filtered.map((r) => [r.no, r.nama, r.tanggal, r.hasil, r.anggaran, r.penanggung, r.kendala, r.progress]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Kegiatan");
      XLSX.writeFile(wb, "laporan-kegiatan.xlsx");
    } catch (err) {
      console.error(err);
      alert("Paket 'xlsx' belum terpasang. Jalankan: npm install xlsx --save");
    }
  }

  async function exportPDF() {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape" });
      const columns = ["NO", "NAMA PROGRAM", "TANGGAL LAPORAN", "HASIL", "ANGGARAN", "PENANGGUNG JAWAB", "KENDALA", "PROGRESS"];
      const rows = filtered.map((r) => [r.no, r.nama, r.tanggal, r.hasil, r.anggaran, r.penanggung, r.kendala, r.progress]);
      autoTable(doc, { head: [columns], body: rows, startY: 10 });
      doc.save("laporan-kegiatan.pdf");
    } catch (err) {
      console.error(err);
      alert("Paket 'jspdf' dan/atau 'jspdf-autotable' belum terpasang. Jalankan: npm install jspdf jspdf-autotable --save");
    }
  }

  if (loading) return <div className="laporan-page"><div className="card laporan-card"><p>Memuat laporan kegiatan...</p></div></div>;

  return (
    <div className="laporan-page">
      <div className="card laporan-card">
        <div className="card-header">
          <div className="title-and-search">
            <h3>Laporan Kegiatan</h3>
            <input
              placeholder="Cari Program"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="laporan-search"
            />
          </div>

          <div className="export-wrap" ref={exportRef}>
            <button className="btn-export-main" onClick={() => setShowExport((s) => !s)}>
              <span className="icon"><LuUpload size={15} /></span>
              <span>Export Laporan</span>
              <span className="caret"><LuChevronDown size={14} /></span>
            </button>
            {showExport && (
              <div className="export-menu">
                <button onClick={exportExcel}>Export to Excel</button>
                <button onClick={exportPDF}>Export to PDF</button>
              </div>
            )}
          </div>
        </div>

        <div className="table-container">
          <table className="laporan-table">
            <thead>
              <tr>
                <th style={{ minWidth: 60 }}>NO</th>
                <th style={{ minWidth: 220 }}>NAMA PROGRAM</th>
                <th style={{ minWidth: 160 }}>TANGGAL LAPORAN</th>
                <th style={{ minWidth: 120 }}>HASIL</th>
                <th style={{ minWidth: 120 }}>ANGGARAN</th>
                <th style={{ minWidth: 180 }}>PENANGGUNG JAWAB</th>
                <th style={{ minWidth: 160 }}>KENDALA</th>
                <th style={{ minWidth: 140 }}>PROGRESS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>Belum ada data laporan kegiatan.</td></tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id ?? row.no}>
                    <td>{row.no}</td>
                    <td>{row.nama}</td>
                    <td>{row.tanggal}</td>
                    <td className="strong">{row.hasil}</td>
                    <td className="strong">{row.anggaran}</td>
                    <td>{row.penanggung}</td>
                    <td>{row.kendala}</td>
                    <td>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: row.progress }} />
                      </div>
                      <div className="progress-label">{row.progress}</div>
                    </td>
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
