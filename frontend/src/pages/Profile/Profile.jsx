import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  const initialUser = useMemo(() => ({
    nama: "Hariyanto",
    nik: "3123600003",
    whatsapp: "081234567890",
    kk: "",
    statusKeluarga: "",
    alamat: "Jalan Raya Bandara Juanda",
  }), []);

  const [form, setForm] = useState(initialUser);
  const [saved, setSaved] = useState(false);

  const dirty = useMemo(() => {
    return Object.keys(initialUser).some(k => initialUser[k] !== form[k]);
  }, [initialUser, form]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  }

  function onSave() {
    // placeholder: call API to save
    console.log("Saving", form);
    setSaved(true);
  }

  function onCancel() {
    // revert changes
    setForm(initialUser);
    setSaved(false);
    navigate(-1);
  }

  return (
    <div className="profile-page">
      <h2>Hi ({form.nama})!</h2>

      <div className="profile-card">
        <div className="profile-left">
          <div className="avatarLarge" />
          <div className="username">{form.nama}</div>
          <div className="userrole">Warga</div>
        </div>

        <div className="profile-right">
          <div className="row">
            <div className="col">
              <label>Nama</label>
              <input name="nama" value={form.nama} onChange={onChange} />
            </div>
            <div className="col">
              <label>No. WhatsApp Aktif</label>
              <input name="whatsapp" value={form.whatsapp} onChange={onChange} />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <label>NIK</label>
              <input name="nik" value={form.nik} onChange={onChange} />
            </div>
            <div className="col">
              <label>No. Kartu Keluarga</label>
              <input name="kk" value={form.kk} onChange={onChange} placeholder="Masukkan nomor KK" />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <label>Status Keluarga</label>
              <select name="statusKeluarga" value={form.statusKeluarga} onChange={onChange}>
                <option value="">Input no.KK terlebih dahulu</option>
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
              </select>
            </div>
            <div className="col">
              <label>Alamat</label>
              <input name="alamat" value={form.alamat} onChange={onChange} />
            </div>
          </div>

          <div className="controls">
            <button className="btn btn-primary" onClick={onSave} disabled={!dirty}>Simpan</button>
            <button className="btn btn-cancel" onClick={onCancel}>Batal</button>
          </div>

          <div className="note">{saved ? "Perubahan tersimpan." : "Simpan akan aktif jika ada perubahan."}</div>
        </div>
      </div>
    </div>
  );
}
