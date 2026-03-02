import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("email"); // Options: email, otp

    const handleSendOTP = (e) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Simulating API Call to send OTP
        setTimeout(() => {
            setLoading(false);
            setStep("otp");
        }, 1000);
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        setLoading(true);
        // TODO: Simulating API Call to verify OTP
        setTimeout(() => {
            setLoading(false);
            alert("OTP Verified. Implement Reset Password flow next!");
        }, 1000);
    };

    const handleOtpChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1);
        setOtp(newOtp);

        // Auto focus on next input
        if (value && index < 3) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Left Side (Mint Green) */}
                <div className="auth-card-left">
                    <h1>LUPA PASSWORD</h1>
                </div>

                {/* Right Side (Form) */}
                <div className="auth-card-right">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">S</div>
                        <div className="auth-logo-text">Shiftwave</div>
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "1.25rem", color: "#2d3748", marginBottom: "0.25rem", fontWeight: "700" }}>
                            Enter OTP
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "#718096" }}>
                            We have sent a OTP to your mobile number
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="auth-form">
                        <div className="auth-field">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <span className="input-icon">✉</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-field" style={{ marginTop: "0.25rem" }}>
                            <div className="otp-inputs" style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
                                {otp.map((digit, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                                        <input
                                            id={`otp-input-${i}`}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            style={{
                                                width: "100%",
                                                height: "50px",
                                                textAlign: "center",
                                                fontSize: "1.25rem",
                                                borderRadius: "6px",
                                                border: "1px solid #cbd5e0",
                                                outline: "none"
                                            }}
                                            required
                                        />
                                        {i < 3 && <span style={{ color: "#a0aec0" }}>-</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading || otp.join("").length < 4 || !email}>
                            {loading ? "Memverifikasi..." : "Verify"}
                        </button>

                        <div className="auth-footer" style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#4a5568" }}>
                            Tidak menerima kode OTP? <button type="button" onClick={handleSendOTP} style={{ background: "none", border: "none", color: "#127263", fontWeight: "700", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Kirim ulang OTP</button>
                        </div>
                        <div className="auth-footer" style={{ marginTop: "0.5rem" }}>
                            <Link to="/login">← Kembali ke Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
