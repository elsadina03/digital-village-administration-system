import { useMemo, useState } from "react";
import "./Program.css";
import { FiPlus, FiEdit2, FiTrash2, FiGrid } from "react-icons/fi";

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

  return (
    <div className="prWrap">
      <div className="prBox">
        {/* Top bar (Search + Filter) */}
        <div className="prTop">
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

          {!showForm && (
            <div className="prTopRight">
              {!isEmpty && (
                <button className="btnAdd" type="button" onClick={openAdd}>
                  <FiPlus /> Tambah Program
                </button>
              )}
              {!isEmpty && (
                <button className="btnIcon" type="button" title="Tampilan tabel">
                  <FiGrid />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isEmpty && (
          <div className="prEmpty">
            <div className="prEmptyText">Belum ada kegiatan yang diinputkan</div>
            <button className="btnAdd" type="button" onClick={openAdd}>
              <FiPlus /> Tambah Program
            </button>
          </div>
        )}

        {showForm && (
          <div className="prForm">
            <div className="prGrid2">
              <div className="field">
                <label>Nama Program</label>
                <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan Nama Program" />
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
                <input type="date" value={tglMulai} onChange={(e) => setTglMulai(e.target.value)} />
              </div>

              <div className="field">
                <label>Tanggal Selesai</label>
                <input type="date" value={tglSelesai} onChange={(e) => setTglSelesai(e.target.value)} />
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
                <input value={pj} onChange={(e) => setPj(e.target.value)} placeholder="Nama Penanggung Jawab" />
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
              <button type="button" className="btnSave" onClick={handleSave}>
                Simpan Program
              </button>
            </div>
          </div>
        )}

        {!showForm && items.length > 0 && (
          <div className="prTableWrap">
            <div className="prTableHead">
              <div className="prTableActions">
                <button className="btnAdd" type="button" onClick={openAdd}>
                  <FiPlus /> Tambah Program
                </button>
                <button className="btnIcon" type="button" title="Tampilan tabel">
                  <FiGrid />
                </button>
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
                  {filtered.map((x, idx) => (
                    <tr key={x.id}>
                      <td>{idx + 1}</td>
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

            {/* pager dummy (biar mirip UI kamu) */}
            <div className="pagerMini">
              <button className="pagerMiniBtn">«</button>
              <button className="pagerMiniNum active">1</button>
              <button className="pagerMiniNum">2</button>
              <button className="pagerMiniNum">3</button>
              <button className="pagerMiniBtn">»</button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline (dummy section bawah, biar mirip gambar) */}
      <h2 className="tlTitle">Timeline Kegiatan</h2>
      <div className="tlEmpty">Belum ada kegiatan yang diinputkan</div>
    </div>
  );
}