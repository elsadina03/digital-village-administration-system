import { useMemo, useState, useEffect, useContext } from "react";
import "./Program.css";
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle, FiSearch } from "react-icons/fi";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";

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
  const { canAccessProgram, isAdmin } = useContext(AuthContext);
  const canEdit = canAccessProgram();

  const [showForm, setShowForm] = useState(false);
  const [q, setQ] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua Kategori");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [anggaran, setAnggaran] = useState("");
  const [pj, setPj] = useState("");
  const [pjId, setPjId] = useState(null);
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [viewMode, setViewMode] = useState("table");
  const [tablePage, setTablePage] = useState(1);
  const [timelinePage, setTimelinePage] = useState(1);

  // â”€â”€ Fetch programs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/programs");
      const data = res.data.data ?? res.data;
      // Map API fields to local field names
      setItems(data.map(p => ({
        id: p.id,
        nama: p.nama,
        kategori: p.kategori,
        deskripsi: p.deskripsi,
        tglMulai: p.tanggal_mulai,
        tglSelesai: p.tanggal_selesai,
        anggaran: p.anggaran,
        pj: p.penanggung_jawab,
        pjId: p.penanggung_jawab_id,
        status: statusFromDates(p.tanggal_mulai, p.tanggal_selesai),
      })));
    } catch (err) {
      console.error("Gagal memuat program", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    api.get("/users").then(res => {
      const data = res.data.data ?? res.data;
      setUsers(Array.isArray(data) ? data : []);
    }).catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((x) => {
      const matchQ = !q.trim() || x.nama.toLowerCase().includes(q.toLowerCase()) || (x.pj || "").toLowerCase().includes(q.toLowerCase());
      const matchKat = filterKategori === "Semua Kategori" || x.kategori === filterKategori;
      return matchQ && matchKat;
    });
  }, [items, q, filterKategori]);

  const ITEMS_PER_PAGE = 10;
  const tableTotalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeTablePage = Math.min(Math.max(1, tablePage), tableTotalPages);
  const pagedFiltered = filtered.slice((safeTablePage - 1) * ITEMS_PER_PAGE, safeTablePage * ITEMS_PER_PAGE);

  function resetForm() {
    setNama(""); setKategori(""); setDeskripsi(""); setTglMulai(""); setTglSelesai(""); setAnggaran(""); setPj(""); setPjId(null); setEditId(null);
  }

  function openAdd() { resetForm(); setShowForm(true); }

  function openEdit(row) {
    setEditId(row.id); setNama(row.nama); setKategori(row.kategori); setDeskripsi(row.deskripsi);
    setTglMulai(row.tglMulai); setTglSelesai(row.tglSelesai); setAnggaran(String(row.anggaran || "")); setPj(row.pj); setPjId(row.pjId ?? null);
    setShowForm(true);
  }

  function formatYMD(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function addDaysToYMD(ymd, delta) {
    const d = new Date(ymd); if (Number.isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + delta); return formatYMD(d);
  }
  function handleTglMulaiChange(val) {
    setTglMulai(val);
    if (!val) return;
    if (!tglSelesai || new Date(tglSelesai) <= new Date(val)) setTglSelesai(addDaysToYMD(val, 1));
  }
  function handleTglSelesaiChange(val) {
    setTglSelesai(val);
    if (!val) return;
    if (!tglMulai || new Date(val) <= new Date(tglMulai)) setTglMulai(addDaysToYMD(val, -1));
  }

  async function handleSave() {
    if (!nama.trim() || !kategori || !tglMulai || !anggaran.trim() || !pjId) {
      alert("Lengkapi field wajib: Nama, Kategori, Tanggal Mulai, Total Anggaran, Penanggung Jawab.");
      return;
    }
    const payload = {
      nama, kategori, deskripsi,
      tanggal_mulai: tglMulai,
      tanggal_selesai: tglSelesai,
      anggaran: Number(String(anggaran).replace(/[^\d]/g, "")) || 0,
      penanggung_jawab: pj,
      penanggung_jawab_id: pjId,
    };
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/programs/${editId}`, payload);
      } else {
        await api.post("/programs", payload);
      }
      setShowForm(false);
      resetForm();
      fetchPrograms();
    } catch (err) {
      alert("Gagal menyimpan program.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus program ini?")) return;
    try {
      await api.delete(`/programs/${id}`);
      setItems(prev => prev.filter(x => x.id !== id));
    } catch {
      alert("Gagal menghapus program.");
    }
  }

  function badgeClass(st) {
    if (st === "Selesai") return "st st--ok";
    if (st === "Menunggu") return "st st--wait";
    return "st st--run";
  }

  const isEmpty = items.length === 0 && !showForm;
  const hasAny = Boolean(nama.trim() || kategori || deskripsi.trim() || tglMulai || tglSelesai || anggaran.trim() || pjId);

  const timelineItems = useMemo(() => {
    const statusOrder = { Menunggu: 0, Berlangsung: 1, Selesai: 2 };
    return filtered.map(it => ({ ...it, _start: it.tglMulai ? new Date(it.tglMulai) : new Date(0) }))
      .sort((a, b) => {
        const sa = statusOrder[a.status] ?? 3;
        const sb = statusOrder[b.status] ?? 3;
        if (sa !== sb) return sa - sb;
        return (b._start?.getTime() ?? 0) - (a._start?.getTime() ?? 0);
      });
  }, [filtered]);

  const timelineTotalPages = Math.max(1, Math.ceil(timelineItems.length / ITEMS_PER_PAGE));
  const safeTimelinePage = Math.min(Math.max(1, timelinePage), timelineTotalPages);
  const pagedTimeline = timelineItems.slice((safeTimelinePage - 1) * ITEMS_PER_PAGE, safeTimelinePage * ITEMS_PER_PAGE);

  function statusClass(status) {
    if (status === "Selesai") return "ok";
    if (status === "Menunggu") return "wait";
    return "run";
  }

  if (loading) return <div className="prWrap"><div className="prBox"><p>Memuat data program...</p></div></div>;

  return (
    <div className="prWrap">
      <div className="prBox">
        {/* Top bar */}
        <div className="prTop">
          {!showForm && (
            <>
              <div className="prSearch">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari Program" />
                <span className="prSearchIcon"><FiSearch size={15} /></span>
              </div>
              <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
                {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </>
          )}
          {!showForm && (
            <div className="prTopRight">
              {canEdit && !isEmpty && (
                <button className={"btnAdd " + (hasAny ? "elevated" : "")} type="button" onClick={openAdd}>
                  <FiPlus /> Tambah Program
                </button>
              )}
              {items.length > 0 && (
                <div className="viewToggle">
                  <button className={"viewBtn " + (viewMode === "table" ? "active" : "")} type="button" title="Tabel" onClick={() => setViewMode("table")}><FiGrid /></button>
                  <button className={"viewBtn " + (viewMode === "timeline" ? "active" : "")} type="button" title="Timeline" onClick={() => setViewMode("timeline")}><FiCalendar /></button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="prEmpty">
            <div className="prEmptyText">Belum ada kegiatan yang diinputkan</div>
            {canEdit && (
              <button className="btnAdd" type="button" onClick={openAdd}><FiPlus /> Tambah Program</button>
            )}
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
                        <div><div className="tlMetaLabel">Mulai</div><div className="tlMetaVal">{it.tglMulai ? new Date(it.tglMulai).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</div></div>
                        <div><div className="tlMetaLabel">Selesai</div><div className="tlMetaVal">{it.tglSelesai ? new Date(it.tglSelesai).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</div></div>
                        <div><div className="tlMetaLabel">Anggaran</div><div className="tlMetaVal">{rupiah(it.anggaran)}</div></div>
                        <div><div className="tlMetaLabel">Penanggung Jawab</div><div className="tlMetaVal" title={it.pj}>{it.pj}</div></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pagerMini">
              <button type="button" className="pagerMiniBtn" onClick={() => setTimelinePage(Math.max(1, safeTimelinePage - 1))} disabled={safeTimelinePage <= 1}>Â«</button>
              {Array.from({ length: timelineTotalPages }).map((_, i) => (
                <button type="button" key={i} className={"pagerMiniNum " + (safeTimelinePage === i + 1 ? "active" : "")} onClick={() => setTimelinePage(i + 1)}>{i + 1}</button>
              ))}
              <button type="button" className="pagerMiniBtn" onClick={() => setTimelinePage(Math.min(timelineTotalPages, safeTimelinePage + 1))} disabled={safeTimelinePage >= timelineTotalPages}>Â»</button>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="prForm">
            <div className="prGrid2">
              <div className="field">
                <label>Nama Program</label>
                <input maxLength={50} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan Nama Program" />
                <div className={"charCount " + (nama.length === 50 ? "warn" : "")}>{nama.length}/50</div>
              </div>
              <div className="field">
                <label>Kategori Program</label>
                <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                  <option value="">Pilih Kategori Program</option>
                  {KATEGORI.filter((x) => x !== "Semua Kategori").map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="field prSpan2">
                <label>Deskripsi Program</label>
                <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Masukkan Deskripsi Program" rows={3} />
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
                <input value={anggaran} onChange={(e) => setAnggaran(e.target.value)} placeholder="Rp 0,-" inputMode="numeric" />
              </div>
              <div className="field">
                <label>Penanggung Jawab</label>
                <select value={pjId ?? ""} onChange={(e) => {
                  const uid = e.target.value;
                  const u = users.find(u => String(u.id) === uid);
                  setPjId(uid ? Number(uid) : null);
                  setPj(u?.name ?? "");
                }}>
                  <option value="">Pilih Penanggung Jawab</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}{u.role?.name ? ` – ${u.role.name}` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="prActions">
              <button type="button" className="btnCancel" onClick={() => { setShowForm(false); resetForm(); }}>Batal</button>
              <button type="button" className={"btnSave " + (hasAny ? "elevated" : "")} onClick={handleSave} disabled={!hasAny || saving}>{saving ? "Menyimpan..." : "Simpan Program"}</button>
            </div>
          </div>
        )}

        {/* Table view */}
        {!showForm && items.length > 0 && viewMode === "table" && (
          <div className="prTableWrap">
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
                    {canEdit && <th style={{ width: 110 }}>AKSI</th>}
                  </tr>
                </thead>
                <tbody>
                  {pagedFiltered.map((x, idx) => (
                    <tr key={x.id}>
                      <td>{(safeTablePage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                      <td className="tdBold">{x.nama}</td>
                      <td>{monthYear(x.tglMulai)}</td>
                      <td>{x.tglSelesai ? monthYear(x.tglSelesai) : "-"}</td>
                      <td className="tdBold">{rupiah(x.anggaran)}</td>
                      <td>{x.pj}</td>
                      <td><span className={badgeClass(x.status)}>{x.status}</span></td>
                      {canEdit && (
                        <td>
                          <button className="act actEdit" type="button" onClick={() => openEdit(x)} title="Edit"><FiEdit2 /></button>
                          {isAdmin() && <button className="act actDel" type="button" onClick={() => handleDelete(x.id)} title="Hapus"><FiTrash2 /></button>}
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={canEdit ? 8 : 7} className="tdEmpty">Tidak ada data yang cocok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagerMini">
              <button type="button" className="pagerMiniBtn" onClick={() => setTablePage(Math.max(1, safeTablePage - 1))} disabled={safeTablePage <= 1}>Â«</button>
              {Array.from({ length: tableTotalPages }).map((_, i) => (
                <button key={i} type="button" className={"pagerMiniNum " + (safeTablePage === i + 1 ? "active" : "")} onClick={() => setTablePage(i + 1)}>{i + 1}</button>
              ))}
              <button type="button" className="pagerMiniBtn" onClick={() => setTablePage(Math.min(tableTotalPages, safeTablePage + 1))} disabled={safeTablePage >= tableTotalPages}>Â»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
