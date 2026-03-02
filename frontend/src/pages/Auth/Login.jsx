import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: hook to auth API
    console.log("sign in", { email, password });
    // simple demo auth: mark as authenticated and redirect to dashboard
    try {
      localStorage.setItem("isAuth", "true");
    } catch (err) {
      /* ignore */
    }
    navigate('/');
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
              <label>Email</label>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="example@gmail.com" />

              <label>Password</label>
              <div className="input-with-icon">
                <input type={showPassword?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" className="icon-btn" onClick={()=>setShowPassword(s=>!s)} aria-label={showPassword?"Hide password":"Show password"}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a20.8 20.8 0 013.12-4.06" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 3l18 18" stroke="#0b5a45" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.88 9.88A3 3 0 0014.12 14.12" stroke="#0b5a45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              </div>

              <button className="btn" type="submit">Sign in</button>
            </form>

            <div className="auth-footer">
              Don't have an account yet? <Link className="small-link" to="/register">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
