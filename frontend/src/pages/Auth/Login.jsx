import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import "./auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      const { access_token, user } = response.data;
      
      login(access_token, user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-left">
          <h1>LOGIN</h1>
        </div>

        <div className="auth-right">
          <div className="auth-logo">
            <img src="/logo192.png" alt="logo" style={{height:48}} />
          </div>

          <div className="auth-form">
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: "12px",
                  marginBottom: "16px",
                  backgroundColor: "#fee",
                  border: "1px solid #fcc",
                  borderRadius: "4px",
                  color: "#c33",
                  fontSize: "14px"
                }}>
                  {error}
                </div>
              )}

              <label>Email</label>
              <input 
                type="email"
                value={email} 
                onChange={(e)=>setEmail(e.target.value)} 
                placeholder="admin1@desa.id"
                required
                disabled={loading}
              />

              <label>Password</label>
              <div className="input-with-icon">
                <input 
                  type={showPassword?"text":"password"} 
                  value={password} 
                  onChange={(e)=>setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button type="button" className="icon-btn" onClick={()=>setShowPassword(s=>!s)} aria-label={showPassword?"Hide password":"Show password"}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a20.8 20.8 0 013.12-4.06" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 3l18 18" stroke="#0b5a45" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.88 9.88A3 3 0 0014.12 14.12" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              </div>

              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Memproses..." : "Sign in"}
              </button>
            </form>

            <div className="auth-footer">
              Belum punya akun? Hubungi petugas administrasi desa untuk mendapatkan akses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
