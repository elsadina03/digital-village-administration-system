import { useMemo, useRef, useState, useEffect, useContext } from "react";
import api from "../../../services/api";
import { AuthContext, STAFF_ROLES } from "../../../context/AuthContext";
import { LuSearch, LuTrash2, LuChevronDown } from "react-icons/lu";
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
  const { user } = useContext(AuthContext);
  const isStaff = STAFF_ROLES.includes(user?.role?.name);

  // tab: "pribadi" | "desa"
  const [tab, setTab] = useState("pribadi");

  // filter/search
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");

  // custom dropdown state
  const [showFilterDd, setShowFilterDd] = useState(false);
  const [showKategoriDd, setShowKategoriDd] = useState(false);
  const filterDdRef = useRef(null);
  const kategoriDdRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterDdRef.current && !filterDdRef.current.contains(e.target)) setShowFilterDd(false);
      if (kategoriDdRef.current && !kategoriDdRef.current.contains(e.target)) setShowKategoriDd(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await api.get("/archives");

      const allDocs = res.data.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category || "Lainnya",
        fileName: d.file_path ? d.file_path.split("/").pop() : "unknown",
        url: d.file_url,
        type: d.type, // 'pribadi' or 'desa'
        uploadedBy: d.uploaded_by,
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

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 4;
  // Sort newest first so page 1 = terbaru, page 2 = terlama
  const sortedDocs = [...filteredDocs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const totalPages = Math.max(1, Math.ceil(sortedDocs.length / pageSize));
  const pagedDocs = sortedDocs.slice((page - 1) * pageSize, page * pageSize);

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
      const formData = new FormData();
      formData.append("title", namaDokumen.trim());
      formData.append("type", tab);
      formData.append("category", kategori);
      formData.append("file", file);

      await api.post("/archives", formData, {
        headers: { "Content-Type": "multipart/form-data" }
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

  async function handleDelete(doc) {
    if (!window.confirm(`Hapus dokumen "${doc.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/archives/${doc.id}`);
      fetchArchives();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus dokumen");
    }
  }

  function canDelete(doc) {
    if (isStaff) return true;
    // Warga hanya bisa hapus dokumen pribadi milik sendiri
    return doc.type === "pribadi" && doc.uploadedBy === user?.id;
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
            <span className="icon"><LuSearch size={18} /></span>
          </div>

          <div className="ddWrap" ref={filterDdRef}>
            <button
              type="button"
              className="ddBtn"
              onClick={() => setShowFilterDd((s) => !s)}
            >
              <span>{filterKategori}</span>
              <LuChevronDown size={14} className={`ddCaret${showFilterDd ? " open" : ""}`} />
            </button>
            {showFilterDd && (
              <div className="ddMenu">
                {["Semua Kategori", ...KATEGORI].map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={filterKategori === k ? "active" : ""}
                    onClick={() => { setFilterKategori(k); setPage(1); setShowFilterDd(false); }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}
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
                  <div className="cardDate">
                    {d.createdAt
                      ? new Date(d.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </div>

                  <div className="cardActions">
                    <button className="btnOutline" onClick={() => handleOpen(d)}>
                      Lihat Dokumen
                    </button>
                    {canDelete(d) && (
                      <button className="btnDanger" onClick={() => handleDelete(d)} title="Hapus dokumen">
                        <LuTrash2 size={15} />
                      </button>
                    )}
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

      {/* Upload section — Pribadi tab: semua user; Desa tab: hanya staff */}
      {(tab === "pribadi" || isStaff) && (
        <>
          <h2 className="uploadTitle">
            {tab === "desa" ? "Upload & Arsip Dokumen Desa" : "Upload & Arsip Dokumen Pribadi"}
          </h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="grid2">
              <div className="field">
                <label>Kategori Dokumen*</label>
                <div className="ddWrap" ref={kategoriDdRef}>
                  <button
                    type="button"
                    className={`ddBtn ddBtnForm${!kategori ? " ddBtnPlaceholder" : ""}`}
                    onClick={() => setShowKategoriDd((s) => !s)}
                  >
                    <span>{kategori || "Pilih Kategori Dokumen"}</span>
                    <LuChevronDown size={14} className={`ddCaret${showKategoriDd ? " open" : ""}`} />
                  </button>
                  {showKategoriDd && (
                    <div className="ddMenu ddMenuForm">
                      {KATEGORI.map((k) => (
                        <button
                          key={k}
                          type="button"
                          className={kategori === k ? "active" : ""}
                          onClick={() => { setKategori(k); setShowKategoriDd(false); }}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}
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
        </>
      )}
    </div>
  );
}