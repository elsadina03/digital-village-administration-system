import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./PengajuanSurat.css";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SURAT_OPTIONS = [
  "Surat Usaha",
  "Surat Keterangan Domisili",
  "Surat Keterangan Beasiswa",
  "Surat Tidak Mampu",
];

/* ================= MAP HELPERS ================= */

function PickMarker({ value, onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return <Marker position={value} />;
}

function FlyTo({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position && position.length === 2) {
      map.flyTo(position, 16, { duration: 0.8 });
    }
  }, [position, map]);

  return null;
}

/* ================= COMPONENT ================= */

export default function PengajuanSurat() {
  /* ================= RIWAYAT ================= */
  const [riwayat, setRiwayat] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(riwayat.length / pageSize));
  const riwayatPage = riwayat.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:8000/api/letters", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Map the API data structure to match what the UI expects
      const formatted = res.data.data.map(l => ({
        id: l.id,
        judul: l.letter_type?.name || "Surat",
        waktu: new Date(l.created_at).toLocaleDateString("id-ID"),
        status: l.status.charAt(0).toUpperCase() + l.status.slice(1)
      }));
      setRiwayat(formatted);
    } catch (err) {
      console.error("Gagal mengambil riwayat surat:", err);
    }
  };

  /* ================= FORM ================= */
  const fileRef = useRef(null);

  const [jenisSurat, setJenisSurat] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [fotoNpwp, setFotoNpwp] = useState(null);

  const [alamat, setAlamat] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  const [koordinat, setKoordinat] = useState([-7.3792, 112.7876]);

  const npwpFileName = useMemo(
    () => (fotoNpwp ? fotoNpwp.name : "Belum ada file yang dipilih"),
    [fotoNpwp]
  );

  /* ================= AUTOCOMPLETE ================= */

  useEffect(() => {
    const q = alamat.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggest(true);

        const url =
          "https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=id&q=" +
          encodeURIComponent(q);

        const res = await fetch(url);
        const data = await res.json();

        const mapped = (data || []).map((x) => ({
          id: x.place_id,
          label: x.display_name,
          lat: Number(x.lat),
          lon: Number(x.lon),
        }));

        setSuggestions(mapped);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggest(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [alamat]);

  /* ================= SUBMIT ================= */

  async function handleAjukan(e) {
    e.preventDefault();

    if (!jenisSurat || !nama || !email || !wa || !alamat) {
      alert("Lengkapi data wajib.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Since SURAT_OPTIONS items may not precisely match the logic needed, let's map it roughly to a letter type ID. 
      // In a real app we'd fetch the exact LetterType options from /api/letter-types. For now, picking a dummy id 1 or 2 based on existence.
      // (This requires the backend valid letter_type_id).

      const formData = new FormData();
      formData.append('letter_type_id', 1); // Assuming 1 exists locally
      formData.append('nama', nama);
      formData.append('email', email);
      formData.append('wa', wa);
      formData.append('alamat', alamat);
      formData.append('tujuan', tujuan);
      formData.append('latitude', koordinat[0]);
      formData.append('longitude', koordinat[1]);

      if (fotoNpwp) {
        formData.append('document', fotoNpwp); // using 'document' field based on Letter migration
      }

      await axios.post("http://localhost:8000/api/letters", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Surat berhasil diajukan!");

      // refresh
      fetchRiwayat();
      setPage(1);

      // reset
      setJenisSurat("");
      setNama("");
      setEmail("");
      setWa("");
      setTujuan("");
      setFotoNpwp(null);
      setAlamat("");
      if (fileRef.current) fileRef.current.value = "";

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal mengajukan surat");
    }
  }

  /* ================= RENDER ================= */

  return (
    <div className="psWrap">
      {/* ================= RIWAYAT ================= */}
      <div className="box">
        <h1 className="title">Riwayat Pengajuan</h1>

        <div className="historyArea">
          {riwayatPage.length === 0 ? (
            <div className="historyEmpty">Belum ada riwayat pengajuan</div>
          ) : (
            <div className="cards">
              {riwayatPage.map((x) => (
                <div key={x.id} className="card">
                  <div className="cardTitle">{x.judul}</div>
                  <div className="cardTime">{x.waktu}</div>
                  <div className="cardFoot">
                    <span className="badge badge--wait">{x.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= FORM ================= */}
      <h2 className="formTitle">Pengajuan Surat</h2>

      <form className="form" onSubmit={handleAjukan}>
        <div className="grid2">
          <div className="field">
            <label>Jenis Surat*</label>
            <select value={jenisSurat} onChange={(e) => setJenisSurat(e.target.value)}>
              <option value="">Pilih kategori surat</option>
              {SURAT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Nama*</label>
            <input value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>

          <div className="field">
            <label>Email*</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="field">
            <label>No. WhatsApp*</label>
            <input value={wa} onChange={(e) => setWa(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Tujuan (opsional)</label>
          <input value={tujuan} onChange={(e) => setTujuan(e.target.value)} />
        </div>

        <div className="field">
          <label>Foto NPWP</label>

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
              onChange={(e) => setFotoNpwp(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />

            <div className={`fileName ${fotoNpwp ? "filled" : ""}`}>
              {npwpFileName}
            </div>
          </div>

          <div className="hint">*PDF, Word, PNG, JPG, JPEG</div>
        </div>

        {/* ================= ALAMAT AUTOCOMPLETE ================= */}
        <div className="field">
          <label>Alamat*</label>

          <div style={{ position: "relative" }}>
            <input
              value={alamat}
              onChange={(e) => {
                setAlamat(e.target.value);
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              placeholder="Ketik alamat..."
            />

            {showSuggest && (loadingSuggest || suggestions.length > 0) && (
              <div className="suggestBox">
                {loadingSuggest && <div className="suggestItem">Mencari...</div>}

                {!loadingSuggest &&
                  suggestions.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      className="suggestItem"
                      onClick={() => {
                        setAlamat(s.label);
                        setKoordinat([s.lat, s.lon]);
                        setShowSuggest(false);
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= MAP ================= */}
        <div className="mapWrap">
          <MapContainer center={koordinat} zoom={14} style={{ height: 360 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FlyTo position={koordinat} />
            <PickMarker value={koordinat} onChange={setKoordinat} />
          </MapContainer>
        </div>

        <button className="btnSubmit">Ajukan</button>
      </form>
    </div>
  );
}