import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      alert('Password and confirmation do not match');
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/register", {
        name,
        email,
        nik,
        password,
        password_confirmation: confirm
      });
      alert('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registrasi gagal. Pastikan form diisi dengan benar.');
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-left">
          <h1>REGISTER</h1>
        </div>

        <div className="auth-right">
          <div className="auth-logo">
            <img src="/logo192.png" alt="logo" style={{ height: 48 }} />
          </div>

          <div className="auth-form">
            <form onSubmit={handleSubmit}>
              <label>Nama*</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama lengkap Anda" />

              <label>NIK*</label>
              <input value={nik} onChange={(e) => setNik(e.target.value)} placeholder="Masukkan nama NIK Anda" />

              <label>Email*</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />

              <label>Password</label>
              <div className="input-with-icon">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                <button type="button" className="icon-btn" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a20.8 20.8 0 013.12-4.06" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 3l18 18" stroke="#0b5a45" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.88 9.88A3 3 0 0014.12 14.12" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </button>
              </div>

              <label>Konfirmasi Password</label>
              <div className="input-with-icon">
                <input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••" />
                <button type="button" className="icon-btn" onClick={() => setShowConfirm(s => !s)} aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}>
                  {showConfirm ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a20.8 20.8 0 013.12-4.06" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 3l18 18" stroke="#0b5a45" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.88 9.88A3 3 0 0014.12 14.12" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </button>
              </div>

              <button className="btn" type="submit">Register</button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link className="small-link" to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
