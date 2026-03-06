import { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useContext(AuthContext);

  const emptyForm = { name: "", phone: "", email: "" };
  const [savedUser, setSavedUser] = useState(emptyForm);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        const u = res.data.data || res.data;
        const initial = { 
          name: u.name || "", 
          phone: u.phone || "", 
          email: u.email || "" 
        };
        setSavedUser(initial);
        setForm(initial);
      } catch (err) {
        console.error("Gagal memuat profil", err);
        // Fallback to AuthContext user data if API fails
        if (authUser) {
          const fallback = {
            name: authUser.name || "",
            phone: authUser.phone || "",
            email: authUser.email || ""
          };
          setSavedUser(fallback);
          setForm(fallback);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [authUser]);

  const dirty = useMemo(() => {
    return Object.keys(savedUser).some(k => savedUser[k] !== form[k]);
  }, [savedUser, form]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  }

  async function onSave() {
    try {
      await api.put("/profile", { name: form.name, phone: form.phone });
      setSaved(true);
      setSavedUser(form);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan.");
    }
  }

  function onSecondary() {
    if (dirty) {
      setForm(savedUser);
      setSaved(false);
      return;
    }
    if (!window.confirm("Apakah Anda yakin ingin keluar?")) return;
    logout?.();
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="profile-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div style={{ textAlign: "center", color: "#666" }}>
          <div style={{ marginBottom: "10px" }}>⏳</div>
          <div>Memuat profil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h2>Hi ({form.name})!</h2>

      <div className="profile-card">
        <div className="profile-left">
          <div className="avatarLarge" />
          <div className="username">{form.name}</div>
          <div className="userrole">{authUser?.role?.name || "—"}</div>
        </div>

        <div className="profile-right">
          <div className="row">
            <div className="col">
              <label>Nama</label>
              <input name="name" value={form.name} onChange={onChange} />
            </div>
            <div className="col">
              <label>Email</label>
              <input name="email" value={form.email} onChange={onChange} readOnly />
            </div>
          </div>

          <div className="row">
            <div className="col">
              <label>No. WhatsApp Aktif</label>
              <input name="phone" value={form.phone} onChange={onChange} placeholder="Masukkan no. WhatsApp" />
            </div>
          </div>

          <div className="controls">
            <button className="btn btn-primary" onClick={onSave} disabled={!dirty}>Simpan</button>
            <button className={"btn "+(dirty?"btn-cancel":"btn-logout")} onClick={onSecondary}>
              {dirty ? 'Batal' : 'Keluar'}
            </button>
          </div>

          <div className="note">{saved ? "Perubahan tersimpan." : "Simpan akan aktif jika ada perubahan."}</div>
        </div>
      </div>
    </div>
  );
}
