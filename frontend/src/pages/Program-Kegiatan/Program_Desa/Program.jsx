import { useMemo, useState } from "react";
import "./Program.css";
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

const KATEGORI = ["Semua Kategori", "Infrastruktur", "Sosial", "Ekonomi", "Pendidikan", "Kesehatan"];

function rupiah(n) {
  if (!n) return "Rp 0";
  const num = Number(String(n).replace(/[^\d]/g, ""));
  return "Rp " + num.toLocaleString("id-ID");
}

function monthYear(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

function statusFromDates(start, end) {
  if (!start) return "Menunggu";
  const now = new Date();
  const s = new Date(start);
  const e = end ? new Date(end) : null;

  if (now < s) return "Menunggu";
  if (e && now > e) return "Selesai";
  return "Berlangsung";
}

export default function Program() {
  // mode: "empty" | "form" | "table"
  const [showForm, setShowForm] = useState(false);

  const [q, setQ] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");

  const [items, setItems] = useState([]); // isi program

  // form state
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [anggaran, setAnggaran] = useState("");
  const [pj, setPj] = useState("");

  const [editId, setEditId] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [tablePage, setTablePage] = useState(1);
  const [timelinePage, setTimelinePage] = useState(1);

  const filtered = useMemo(() => {
    return items.filter((x) => {
      const matchQ =
        !q.trim() ||
        x.nama.toLowerCase().includes(q.toLowerCase()) ||
        x.pj.toLowerCase().includes(q.toLowerCase());
      const matchKat = filterKategori === "Semua Kategori" || x.kategori === filterKategori;
      return matchQ && matchKat;
    });
  }, [items, q, filterKategori]);

  const ITEMS_PER_PAGE = 10;

  const tableTotalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeTablePage = Math.min(Math.max(1, tablePage), tableTotalPages);
  const pagedFiltered = filtered.slice((safeTablePage - 1) * ITEMS_PER_PAGE, safeTablePage * ITEMS_PER_PAGE);

  function resetForm() {
    setNama("");
    setKategori("");
    setDeskripsi("");
    setTglMulai("");
    setTglSelesai("");
    setAnggaran("");
    setPj("");
    setEditId(null);
  }

  function openAdd() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(row) {
    setEditId(row.id);
    setNama(row.nama);
    setKategori(row.kategori);
    setDeskripsi(row.deskripsi);
    setTglMulai(row.tglMulai);
    setTglSelesai(row.tglSelesai);
    setAnggaran(String(row.anggaran || ""));
    setPj(row.pj);
    setShowForm(true);
  }

  function formatYMD(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function addDaysToYMD(ymd, delta) {
    const d = new Date(ymd);
    if (Number.isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + delta);
    return formatYMD(d);
  }

  function handleTglMulaiChange(val) {
    setTglMulai(val);
    // if selesai is empty or not after start, set selesai = start + 1 day
    if (!val) return;
    if (!tglSelesai) {
      setTglSelesai(addDaysToYMD(val, 1));
      return;
    }
    const s = new Date(val);
    const e = new Date(tglSelesai);
    if (Number.isNaN(s.getTime())) return;
    if (Number.isNaN(e.getTime()) || e <= s) {
      setTglSelesai(addDaysToYMD(val, 1));
    }
  }

  function handleTglSelesaiChange(val) {
    setTglSelesai(val);
    // if mulai is empty or not before selesai, set mulai = selesai - 1 day
    if (!val) return;
    if (!tglMulai) {
      setTglMulai(addDaysToYMD(val, -1));
      return;
    }
    const s = new Date(tglMulai);
    const e = new Date(val);
    if (Number.isNaN(e.getTime())) return;
    if (Number.isNaN(s.getTime()) || e <= s) {
      setTglMulai(addDaysToYMD(val, -1));
    }
  }

  function handleSave() {
    if (!nama.trim() || !kategori || !tglMulai || !anggaran.trim() || !pj.trim()) {
      alert("Lengkapi field wajib: Nama, Kategori, Tanggal Mulai, Total Anggaran, Penanggung Jawab.");
      return;
    }

    const parsedAnggaran = Number(String(anggaran).replace(/[^\d]/g, "")) || 0;

    if (editId) {
      setItems((prev) =>
        prev.map((x) =>
          x.id === editId
            ? {
                ...x,
                nama,
                kategori,
                deskripsi,
                tglMulai,
                tglSelesai,
                anggaran: parsedAnggaran,
                pj,
                status: statusFromDates(tglMulai, tglSelesai),
              }
            : x
        )
      );
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        nama,
        kategori,
        deskripsi,
        tglMulai,
        tglSelesai,
        anggaran: parsedAnggaran,
        pj,
        status: statusFromDates(tglMulai, tglSelesai),
      };
      setItems((prev) => [newItem, ...prev]);
      setViewMode("table");
    }

    setShowForm(false);
    resetForm();
  }

  function handleDelete(id) {
    if (!confirm("Hapus program ini?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function badgeClass(st) {
    if (st === "Selesai") return "st st--ok";
    if (st === "Menunggu") return "st st--wait";
    return "st st--run";
  }

  const isEmpty = items.length === 0 && !showForm;
  const hasAny = Boolean(
    nama.trim() || kategori || deskripsi.trim() || tglMulai || tglSelesai || anggaran.trim() || pj.trim()
  );

  // Timeline items grouped by status: Menunggu -> Berlangsung -> Selesai
  // Apply the same search/category filters as the table by deriving from `filtered`.
  // Within each group, sort by start date descending (later start first)
  const timelineItems = useMemo(() => {
    const statusOrder = { Menunggu: 0, Berlangsung: 1, Selesai: 2 };
    return filtered
      .map((it) => ({ ...it, _start: it.tglMulai ? new Date(it.tglMulai) : it.tglSelesai ? new Date(it.tglSelesai) : new Date(0) }))
      .sort((a, b) => {
        const sa = statusOrder[a.status] ?? 3;
        const sb = statusOrder[b.status] ?? 3;
        if (sa !== sb) return sa - sb; // lower statusOrder first (Menunggu top)
        const ta = a._start ? a._start.getTime() : 0;
        const tb = b._start ? b._start.getTime() : 0;
        return tb - ta; // within group: later start first
      });
  }, [filtered]);

  const timelineTotalPages = Math.max(1, Math.ceil(timelineItems.length / ITEMS_PER_PAGE));
  const safeTimelinePage = Math.min(Math.max(1, timelinePage), timelineTotalPages);
  const pagedTimeline = timelineItems.slice((safeTimelinePage - 1) * ITEMS_PER_PAGE, safeTimelinePage * ITEMS_PER_PAGE);

  function statusClass(status) {
    if (status === "Selesai") return "ok";
    if (status === "Menunggu") return "wait";
    return "run"; // Berlangsung
  }

  return (
    <div className="prWrap">
      <div className="prBox">
        {/* Top bar (Search + Filter) */}
        <div className="prTop">
          {!showForm && (
            <>
              <div className="prSearch">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari Program" />
                <span className="prSearchIcon">🔍</span>
              </div>

              <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
                {KATEGORI.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </>
          )}

          {!showForm && (
            <div className="prTopRight">
              {!isEmpty && (
                <button className={"btnAdd " + (hasAny ? "elevated" : "")} type="button" onClick={openAdd}>
                  <FiPlus /> Tambah Program
                </button>
              )}
              {items.length > 0 && (
                <div className="viewToggle">
                  <button
                    className={"viewBtn " + (viewMode === "table" ? "active" : "")}
                    type="button"
                    title="Tabel"
                    onClick={() => setViewMode("table")}
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={"viewBtn " + (viewMode === "timeline" ? "active" : "")}
                    type="button"
                    title="Timeline"
                    onClick={() => setViewMode("timeline")}
                  >
                    <FiCalendar />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isEmpty && (
          <div className="prEmpty">
            <div className="prEmptyText">Belum ada kegiatan yang diinputkan</div>
            <button className={"btnAdd " + (hasAny ? "elevated" : "")} type="button" onClick={openAdd}>
              <FiPlus /> Tambah Program
            </button>
          </div>
        )}
        {/* Timeline view */}
        {!showForm && items.length > 0 && viewMode === "timeline" && (
          <div className="prTimeline">
            <h2 className="tlTitle">Timeline Kegiatan</h2>
            <div className="tlWrap">
              <div className="tlLine" />
              <div className="tlList">
                {pagedTimeline.map((it) => (
                  <div key={it.id} className="tlItem">
                    <div className={"tlDot tlDot--" + statusClass(it.status)}>
                      {it.status === "Selesai" ? <FiCheckCircle /> : it.status === "Berlangsung" ? <FiClock /> : <FiAlertCircle />}
                    </div>
                    <div className={"tlCard tlCard--" + statusClass(it.status)}>
                      <h3 className="tlName" title={it.nama}>{it.nama}</h3>
                      <div className="tlKat">{it.kategori}</div>
                      <p className="tlDesc">{it.deskripsi}</p>
                      <div className="tlMeta">
                        <div>
                          <div className="tlMetaLabel">Mulai</div>
                          <div className="tlMetaVal">{it.tglMulai ? new Date(it.tglMulai).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</div>
                        </div>
                        <div>
                          <div className="tlMetaLabel">Selesai</div>
                          <div className="tlMetaVal">{it.tglSelesai ? new Date(it.tglSelesai).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</div>
                        </div>
                        <div>
                          <div className="tlMetaLabel">Anggaran</div>
                          <div className="tlMetaVal">{rupiah(it.anggaran)}</div>
                        </div>
                        <div>
                          <div className="tlMetaLabel">Penanggung Jawab</div>
                          <div className="tlMetaVal" title={it.pj}>{it.pj}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* timeline pager */}
            <div className="pagerMini">
              <button
                type="button"
                className="pagerMiniBtn"
                onClick={() => setTimelinePage(Math.max(1, safeTimelinePage - 1))}
                disabled={safeTimelinePage <= 1}
              >
                «
              </button>
              {Array.from({ length: timelineTotalPages }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  className={"pagerMiniNum " + (safeTimelinePage === i + 1 ? "active" : "")}
                  onClick={() => setTimelinePage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="pagerMiniBtn"
                onClick={() => setTimelinePage(Math.min(timelineTotalPages, safeTimelinePage + 1))}
                disabled={safeTimelinePage >= timelineTotalPages}
              >
                »
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="prForm">
            <div className="prGrid2">
              <div className="field">
                <label>Nama Program</label>
                <input
                  maxLength={50}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan Nama Program"
                  title={nama.length === 50 ? "Maksimum 50 karakter" : ""}
                />
                <div className={"charCount " + (nama.length === 50 ? "warn" : "")}>{nama.length}/50</div>
              </div>

              <div className="field">
                <label>Kategori Program</label>
                <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                  <option value="">Pilih Kategori Program</option>
                  {KATEGORI.filter((x) => x !== "Semua Kategori").map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field prSpan2">
                <label>Deskripsi Program</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Masukkan Deskripsi Program"
                  rows={3}
                />
              </div>

              <div className="field">
                <label>Tanggal Mulai</label>
                <input type="date" value={tglMulai} onChange={(e) => handleTglMulaiChange(e.target.value)} />
              </div>

              <div className="field">
                <label>Tanggal Selesai</label>
                <input type="date" value={tglSelesai} onChange={(e) => handleTglSelesaiChange(e.target.value)} />
              </div>

              <div className="field">
                <label>Total Anggaran</label>
                <input
                  value={anggaran}
                  onChange={(e) => setAnggaran(e.target.value)}
                  placeholder="Rp 0,-"
                  inputMode="numeric"
                />
              </div>

              <div className="field">
                <label>Penanggung Jawab</label>
                <input
                  maxLength={50}
                  value={pj}
                  onChange={(e) => setPj(e.target.value)}
                  placeholder="Nama Penanggung Jawab"
                  title={pj.length === 50 ? "Maksimum 50 karakter" : ""}
                />
                <div className={"charCount " + (pj.length === 50 ? "warn" : "")}>{pj.length}/50</div>
              </div>
            </div>

            <div className="prActions">
              <button
                type="button"
                className="btnCancel"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Batal
              </button>
              <button
                type="button"
                className={"btnSave " + (hasAny ? "elevated" : "")}
                onClick={handleSave}
                disabled={!hasAny}
              >
                Simpan Program
              </button>
            </div>
          </div>
        )}

        {!showForm && items.length > 0 && viewMode === "table" && (
          <div className="prTableWrap">
            <div className="prTableHead">
              <div className="prTableActions">
                {/* <button className={"btnAdd " + (hasAny ? "elevated" : "")} type="button" onClick={openAdd}>
                  <FiPlus /> Tambah Program
                </button> */}
                {/* <button className="btnIcon" type="button" title="Tampilan tabel">
                  <FiGrid />
                </button> */}
              </div>
            </div>

            <div className="tableScroll">
              <table className="prTable">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>NO</th>
                    <th>NAMA PROGRAM</th>
                    <th>TANGGAL MULAI</th>
                    <th>TANGGAL SELESAI</th>
                    <th>ANGGARAN</th>
                    <th>PENANGGUNG JAWAB</th>
                    <th>STATUS</th>
                    <th style={{ width: 110 }}>AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedFiltered.map((x, idx) => (
                    <tr key={x.id}>
                      <td>{(safeTablePage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td className="tdBold">{x.nama}</td>
                      <td>{monthYear(x.tglMulai)}</td>
                      <td>{x.tglSelesai ? monthYear(x.tglSelesai) : "-"}</td>
                      <td className="tdBold">{rupiah(x.anggaran).replace("Rp ", "Rp ")}</td>
                      <td>{x.pj}</td>
                      <td>
                        <span className={badgeClass(x.status)}>{x.status}</span>
                      </td>
                      <td>
                        <button className="act actEdit" type="button" onClick={() => openEdit(x)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="act actDel" type="button" onClick={() => handleDelete(x.id)} title="Hapus">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="tdEmpty">
                        Tidak ada data yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagerMini">
              <button
                type="button"
                className="pagerMiniBtn"
                onClick={() => setTablePage(Math.max(1, safeTablePage - 1))}
                disabled={safeTablePage <= 1}
              >
                «
              </button>
              {Array.from({ length: tableTotalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={"pagerMiniNum " + (safeTablePage === i + 1 ? "active" : "")}
                  onClick={() => setTablePage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                className="pagerMiniBtn"
                onClick={() => setTablePage(Math.min(tableTotalPages, safeTablePage + 1))}
                disabled={safeTablePage >= tableTotalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline (dummy section bawah, biar mirip gambar)
      <h2 className="tlTitle">Timeline Kegiatan</h2>
      <div className="tlEmpty">Belum ada kegiatan yang diinputkan</div> */}
    </div>
  );
}