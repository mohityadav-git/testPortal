import React, { useState } from "react";
import { api } from "../services/api";

const SetupPassword = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Enter details & Send OTP, 2: Enter OTP & Set Password
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.studentSendOtp({ rollNumber, mobileNumber });
      setSuccess("OTP sent! Check your mobile number.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Student not found with this Roll Number and Mobile Number.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await api.studentSetup({ rollNumber, mobileNumber, otp, newPassword });
      setSuccess("Password set successfully! You can now log in.");
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to set password. Check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.07)",
    color: "#fff",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    color: "#aaa",
    fontWeight: 600,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "20px",
        padding: "36px",
        backdropFilter: "blur(12px)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔑</div>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "22px", fontWeight: 700 }}>
            Set Up Password
          </h2>
          <p style={{ margin: "6px 0 0", color: "#aaa", fontSize: "13px" }}>
            {step === 1 ? "Enter your Roll Number and Mobile to receive an OTP" : "Enter the OTP and create your new password"}
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px", gap: "8px" }}>
          <div style={{
            flex: 1, height: "4px", borderRadius: "2px",
            background: "linear-gradient(90deg, #3498db, #2980b9)"
          }} />
          <div style={{
            flex: 1, height: "4px", borderRadius: "2px",
            background: step === 2 ? "linear-gradient(90deg, #3498db, #2980b9)" : "rgba(255,255,255,0.1)"
          }} />
        </div>

        {error && (
          <div style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.4)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#e74c3c", fontSize: "13px" }}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(46,213,115,0.12)", border: "1px solid rgba(46,213,115,0.35)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#2ed573", fontSize: "13px" }}>
            ✅ {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Roll Number</label>
              <input type="text" placeholder="e.g. 21" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mobile Number</label>
              <input type="text" placeholder="e.g. 9876543210" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: "12px", borderRadius: "8px",
              background: "linear-gradient(135deg, #3498db, #2980b9)",
              color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: "15px", marginTop: "6px", opacity: loading ? 0.7 : 1
            }}>
              {loading ? "Sending OTP..." : "Send OTP →"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSetupPassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "rgba(52,152,219,0.1)", border: "1px solid rgba(52,152,219,0.25)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#74b9ff" }}>
              📱 OTP sent to {mobileNumber} for Roll No. <strong>{rollNumber}</strong>
              <span style={{ fontSize: "12px", color: "#aaa", display: "block", marginTop: "3px" }}>(Check server console for mock OTP)</span>
            </div>
            <div>
              <label style={labelStyle}>OTP</label>
              <input type="text" placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} style={{ ...inputStyle, letterSpacing: "6px", fontSize: "18px", textAlign: "center" }} />
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" placeholder="Min. 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: "12px", borderRadius: "8px",
              background: "linear-gradient(135deg, #27ae60, #229954)",
              color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700, fontSize: "15px", marginTop: "6px", opacity: loading ? 0.7 : 1
            }}>
              {loading ? "Setting Password..." : "✅ Set Password"}
            </button>
            <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); setSuccess(""); }} style={{
              padding: "10px", borderRadius: "8px",
              background: "transparent", color: "#aaa",
              border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "13px"
            }}>
              ← Back
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#666" }}>
          Already have a password?{" "}
          <a href="/login" style={{ color: "#3498db", textDecoration: "none", fontWeight: 600 }}>Log in</a>
        </p>
      </div>
    </div>
  );
};

export default SetupPassword;
