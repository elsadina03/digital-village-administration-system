import { useMemo, useRef, useState, useEffect } from "react";
import axios from "axios";
import "./ArsipDokumen.css";

const KATEGORI = [
  "Identitas Keluarga",
  "Identitas Pribadi",
  "Pendidikan",
  "Kesehatan",
  "Keuangan",
  "Lainnya",
];

export default function ArsipDokumen() {
  const fileRef = useRef(null);

  // tab: "pribadi" | "desa"
  const [tab, setTab] = useState("pribadi");

  // filter/search
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");

  // form upload
  const [kategori, setKategori] = useState("");
  const [namaDokumen, setNamaDokumen] = useState("");
  const [file, setFile] = useState(null);

  // data arsip (local state)
  const [docsPribadi, setDocsPribadi] = useState([]); // {id, title, category, fileName, url, createdAt}
  const [docsDesa, setDocsDesa] = useState([]);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:8000/api/archives", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allDocs = res.data.data.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category || "Lainnya",
        fileName: d.file_path ? d.file_path.split("/").pop() : "unknown",
        url: d.file_url,
        type: d.type, // 'pribadi' or 'desa'
        createdAt: d.created_at
      }));

      setDocsPribadi(allDocs.filter(d => d.type === 'pribadi'));
      setDocsDesa(allDocs.filter(d => d.type === 'desa'));
    } catch (err) {
      console.error("Gagal memuat arsip:", err);
    }
  };

  const activeDocs = tab === "pribadi" ? docsPribadi : docsDesa;

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeDocs.filter((d) => {
      const matchQ =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q);

      const matchKategori =
        filterKategori === "Semua Kategori" ? true : d.category === filterKategori;

      return matchQ && matchKategori;
    });
  }, [activeDocs, search, filterKategori]);

  // pagination dummy
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const pagedDocs = filteredDocs.slice((page - 1) * pageSize, page * pageSize);

  function resetForm() {
    setKategori("");
    setNamaDokumen("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!kategori || !namaDokumen || !file) {
      alert("Lengkapi Kategori Dokumen, Nama Dokumen, dan File Dokumen.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", namaDokumen.trim());
      formData.append("type", tab);
      formData.append("category", kategori);
      formData.append("file", file);

      await axios.post("http://localhost:8000/api/archives", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Dokumen berhasil diarsip!");
      fetchArchives();
      setPage(1);
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengupload arsip dokumen");
    }
  }

  function handleOpen(doc) {
    window.open(doc.url, "_blank", "noopener,noreferrer");
  }

  function clampPage(next) {
    if (next < 1) return 1;
    if (next > totalPages) return totalPages;
    return next;
  }

  return (
    <div className="arsipWrap">
      {/* Top section: search + filter + tabs */}
      <div className="panel">
        <div className="panelTop">
          <div className="searchBox">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari Arsip Dokumen"
            />
            <span className="icon">🔍</span>
          </div>

          <div className="selectBox">
            <select
              value={filterKategori}
              onChange={(e) => {
                setFilterKategori(e.target.value);
                setPage(1);
              }}
            >
              <option>Semua Kategori</option>
              {KATEGORI.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="tabs">
            <button
              className={`tab ${tab === "pribadi" ? "active" : ""}`}
              onClick={() => setTab("pribadi")}
            >
              Pribadi
            </button>
            <button
              className={`tab ${tab === "desa" ? "active" : ""}`}
              onClick={() => setTab("desa")}
            >
              Arsip Desa
            </button>
          </div>
        </div>

        {/* Content area: empty state OR cards */}
        <div className="panelBody">
          {pagedDocs.length === 0 ? (
            <div className="emptyState">
              <div className="emptyText">Belum ada Dokumen yang Disimpan</div>
            </div>
          ) : (
            <div className="cards">
              {pagedDocs.map((d) => (
                <div key={d.id} className="card">
                  <div className="cardTitle">{d.title}</div>
                  <div className="cardSub">{d.category}</div>

                  <div className="cardActions">
                    <button className="btnOutline" onClick={() => handleOpen(d)}>
                      Lihat Dokumen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pager">
          <button
            className="pagerBtn"
            onClick={() => setPage((p) => clampPage(p - 1))}
            disabled={page <= 1}
            title="Prev"
          >
            «
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
            (n) => (
              <button
                key={n}
                className={`pagerNum ${n === page ? "active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            )
          )}

          <button
            className="pagerBtn"
            onClick={() => setPage((p) => clampPage(p + 1))}
            disabled={page >= totalPages}
            title="Next"
          >
            »
          </button>
        </div>
      </div>

      {/* Upload section */}
      <h2 className="uploadTitle">
        Upload & Arsip Dokumen {tab === "pribadi" ? "Pribadi" : "Desa"}
      </h2>

      <form className="form" onSubmit={handleSubmit}>
        <div className="grid2">
          <div className="field">
            <label>Kategori Dokumen*</label>
            {/* IMPORTANT: kasih class selectWrap biar arrow custom hanya untuk select */}
            <div className="inputWrap selectWrap">
              <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                <option value="">Pilih Kategori Dokumen</option>
                {KATEGORI.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Nama Dokumen*</label>
            <div className="inputWrap">
              <input
                value={namaDokumen}
                onChange={(e) => setNamaDokumen(e.target.value)}
                placeholder="Masukkan nama/judul dokumen"
              />
            </div>
          </div>
        </div>

        <div className="field">
          <label>File Dokumen*</label>
          <div className="fileRow">
            <button
              type="button"
              className="btnGhost"
              onClick={() => fileRef.current?.click()}
            >
              Pilih File
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
            <div className={`fileName ${file ? "filled" : ""}`}>
              {file ? file.name : "Belum ada file yang dipilih"}
            </div>
          </div>
          <div className="hint">*PDF, Word, PNG, JPG, JPEG.</div>
        </div>

        <button type="submit" className="btnPrimary">
          Arsip Dokumen
        </button>
      </form>
    </div>
  );
}