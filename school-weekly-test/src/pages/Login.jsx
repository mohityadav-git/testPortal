import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import saraswatiMaa from "../assets/saraswati-maa.jpg";

// mode: "student" | "teacher" | "admin"
function LoginPage({ mode = "student" }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  // Student fields
  const [studentRoll, setStudentRoll] = useState("");
  const [studentMobile, setStudentMobile] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Teacher fields
  const [teacherMobile, setTeacherMobile] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");

  // Admin fields
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginImages = [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => {
        setPrevIndex(prev);
        return (prev + 1) % loginImages.length;
      });
    }, 9000);
    return () => clearInterval(timer);
  }, [loginImages.length]);

  useEffect(() => {
    if (prevIndex === null) return;
    const timer = setTimeout(() => setPrevIndex(null), 900);
    return () => clearTimeout(timer);
  }, [prevIndex]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let data;
      if (mode === "admin") {
        data = await api.adminLogin({ username: adminUsername, password: adminPassword });
      } else if (mode === "teacher") {
        data = await api.teacherLogin({ mobileNumber: teacherMobile, password: teacherPassword });
      } else {
        data = await api.studentLogin({ rollNumber: studentRoll, mobileNumber: studentMobile, password: studentPassword });
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("authUser", JSON.stringify({
        name: data.name || data.username || "Admin",
        role: data.role,
        className: data.className || "",
      }));

      window.location.href = data.role === "admin" ? "/admin" : data.role === "teacher" ? "/teacher" : "/student";
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    student: { heading: "Student Login", sub: "Enter your roll number, mobile and password to continue." },
    teacher: { heading: "Teacher Login", sub: "Enter your registered mobile number and password." },
    admin: { heading: "Admin Login", sub: "Restricted access. Authorised personnel only." },
  };

  return (
    <div className="login-shell">
      <div className="login-illustration">
        {prevIndex !== null && (
          <div
            className="login-illustration-layer fade-out"
            style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.35), rgba(243,250,255,0.3)), url('${loginImages[prevIndex]}')` }}
          />
        )}
        <div
          className="login-illustration-layer"
          style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.35), rgba(243,250,255,0.3)), url('${loginImages[slideIndex]}')` }}
        />
        <div className="login-illustration-layout">
          <div className="login-illustration-content">
            <span className="brand-icon large login-logo" style={{ backgroundImage: `url('${saraswatiMaa}')` }}>
              <span className="brand-fallback">M</span>
            </span>
            <div className="login-illustration-title">MDDM Inter College</div>
            <div className="login-illustration-sub">
              Build focus, confidence, and strong weekly performance.<br />
              Weekly tests for smarter learning.
            </div>
          </div>

          <div className="login-panel">
            <div className="login-help-top">Need help?</div>
            <div className="login-brand-center">
              <span className="brand-icon large login-logo" style={{ backgroundImage: `url('${saraswatiMaa}')` }}>
                <span className="brand-fallback">M</span>
              </span>
              <div className="login-brand-title">MDDM Inter College</div>
              <div className="login-brand-sub">Where every mind shines</div>
            </div>

            <div className="login-heading">
              <h2>{titles[mode].heading}</h2>
              <p>{titles[mode].sub}</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              {mode === "student" && (
                <>
                  <label>
                    Roll Number
                    <input type="text" value={studentRoll} onChange={(e) => setStudentRoll(e.target.value)} placeholder="Enter your roll number" required />
                  </label>
                  <label>
                    Mobile Number
                    <input type="text" value={studentMobile} onChange={(e) => setStudentMobile(e.target.value)} placeholder="Registered mobile number" required />
                  </label>
                  <label>
                    Password
                    <input type="password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} placeholder="Enter password" required />
                  </label>
                </>
              )}

              {mode === "teacher" && (
                <>
                  <label>
                    Mobile Number
                    <input type="text" value={teacherMobile} onChange={(e) => setTeacherMobile(e.target.value)} placeholder="Registered mobile number" required />
                  </label>
                  <label>
                    Password
                    <input type="password" value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} placeholder="Enter password" required />
                  </label>
                </>
              )}

              {mode === "admin" && (
                <>
                  <label>
                    Username
                    <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="Admin username" required />
                  </label>
                  <label>
                    Password
                    <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Enter password" required />
                  </label>
                </>
              )}

              {error && <div className="error-text" style={{ color: "red" }}>{error}</div>}

              <button type="submit" className="btn login-btn" disabled={loading}>
                {loading ? "Logging in..." : "LOGIN"}
              </button>
            </form>

            <div className="login-help">
              <div>Helpline: +91 7065465400</div>
              <div>parents@mddmcollege.edu</div>
              <div>(9:00 AM to 5:30 PM, Monday - Saturday)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
