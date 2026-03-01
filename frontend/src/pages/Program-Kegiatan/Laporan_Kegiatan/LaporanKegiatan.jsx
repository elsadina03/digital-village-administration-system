import React, { useMemo, useState, useRef, useEffect } from "react";
import "./LaporanKegiatan.css";

import img1 from "../../../assets/IMG_3050.JPG";
import img2 from "../../../assets/1399369597_Modorima.jpeg";
import img3 from "../../../assets/Three Simple Steps to Empowered Word-Learning - Peers and Pedagogy.jpeg";

export default function LaporanKegiatan() {
  const [query, setQuery] = useState("");
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef(null);

  const data = useMemo(
    () => [
      {
        no: 1,
        nama: "Pembangunan Mushalla",
        tanggal: "15/02/2026",
        laporan: "Feb 2023",
        hasil: "Rp 360 juta",
        anggaran: "Rp 360 juta",
        penanggung: "Tim Infrastruktur",
        kendala: "Cuaca",
        progress: "50%",
      },
      {
        no: 2,
        nama: "Pembangunan Irigasi",
        tanggal: "15/02/2026",
        laporan: "Feb 2023",
        hasil: "Rp 250 juta",
        anggaran: "Rp 250 juta",
        penanggung: "Tim Infrastruktur",
        kendala: "Hambatan Cuaca",
        progress: "50%",
      },
      {
        no: 3,
        nama: "Bantuan Provinsi",
        tanggal: "15/02/2026",
        laporan: "Feb 2023",
        hasil: "Rp 170 juta",
        anggaran: "Rp 170 juta",
        penanggung: "Bantuan Provinsi",
        kendala: "Distribusi",
        progress: "50%",
      },
      ...Array.from({ length: 8 }).map((_, i) => ({
        no: 4 + i,
        nama: `Retribusi Pasar Desa ${i + 1}`,
        tanggal: "15/02/2026",
        laporan: "Feb 2023",
        hasil: "Rp 100 juta",
        anggaran: "Rp 100 juta",
        penanggung: "Retribusi Pasar Desa",
        kendala: "-",
        progress: "50%",
      })),
    ],
    []
  );

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
        [
          "NO",
          "NAMA PROGRAM",
          "TANGGAL LAPORAN",
          "HASIL",
          "ANGGARAN",
          "PENANGGUNG JAWAB",
          "KENDALA",
          "PROGRESS",
        ],
        ...filtered.map((r) => [r.no, r.nama, r.tanggal, r.hasil, r.anggaran, r.penanggung, r.kendala, r.progress]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Kegiatan");
      XLSX.writeFile(wb, "laporan-kegiatan.xlsx");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Paket 'xlsx' belum terpasang. Jalankan: npm install xlsx --save");
    }
  }

  async function exportPDF() {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape" });
      const columns = [
        "NO",
        "NAMA PROGRAM",
        "TANGGAL LAPORAN",
        "HASIL",
        "ANGGARAN",
        "PENANGGUNG JAWAB",
        "KENDALA",
        "PROGRESS",
      ];
      const rows = filtered.map((r) => [r.no, r.nama, r.tanggal, r.hasil, r.anggaran, r.penanggung, r.kendala, r.progress]);
      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 10,
      });
      doc.save("laporan-kegiatan.pdf");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("Paket 'jspdf' dan/atau 'jspdf-autotable' belum terpasang. Jalankan: npm install jspdf jspdf-autotable --save");
    }
  }

  const docCategories = [
    { title: "Kunjungan blablabla", images: [img1, img1, img1, img1, img1] },
    { title: "Pembangunan Infrastruktur", images: [img2, img2, img2, img2, img2] },
    { title: "Penyuluhan Narkoba dan Kenakalan Remaja", images: [img3, img3] },
  ];

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
            <button
              className="btn-export-main"
              onClick={() => setShowExport((s) => !s)}
            >
              <span className="icon">📤</span>
              <span>Export Laporan</span>
              <span className="caret">▾</span>
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
                <th style={{ minWidth: 100 }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.no}>
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
                  <td>
                    <button className="action edit">✏️</button>
                    <button className="action del">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="doc-section">
        <h4>Dokumentasi Kegiatan</h4>
        {docCategories.map((cat) => (
          <div className="doc-category" key={cat.title}>
            <div className="doc-title">{cat.title}</div>
            <div className="doc-gallery">
              {cat.images.map((src, idx) => (
                <div className="doc-item" key={idx}>
                  <img src={src} alt="doc" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
