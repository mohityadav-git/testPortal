import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

function Login() {
  const [mode, setMode] = useState("student");
  const [slideIndex, setSlideIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentError, setStudentError] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [teacherError, setTeacherError] = useState("");

  const { loginStudent, loginTeacher } = useAuth();
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

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStudentError("");
    setStudentName("");
    setStudentPassword("");
    setTeacherName("");
    setTeacherCode("");
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setStudentError("");
    const name = studentName.trim();
    const pass = studentPassword.trim();
    if (!name || !pass) {
      setStudentError("Please enter name and password.");
      return;
    }

    const [clsRaw, roll] = pass.split("@");
    if (!clsRaw || !roll) {
      setStudentError("Password format must be class@rollnumber (e.g., 8@21).");
      return;
    }
    const classNumber = clsRaw.replace(/^class\s*/i, "").trim();
    const normalizedClass = classNumber ? `Class ${classNumber}` : "";
    try {
      const matches = await api.getStudents({
        className: normalizedClass,
        rollNumber: roll,
        studentName: name,
      });
      if (!Array.isArray(matches) || matches.length === 0) {
        setStudentError("Student not found. Please contact your teacher.");
        return;
      }
      loginStudent(name, normalizedClass, roll);
      navigate("/student");
    } catch (err) {
      console.warn("Student lookup failed", err?.message);
      setStudentError("Could not verify student. Try again.");
    }
  };

  const handleTeacherLogin = (e) => {
    e.preventDefault();
    setTeacherError("");
    if (!teacherName || !teacherCode) {
      setTeacherError("Enter name and class code.");
      return;
    }

    const codeMap = {
      "1@99": "Class 1",
      "2@99": "Class 2",
      "3@99": "Class 3",
      "4@99": "Class 4",
      "5@99": "Class 5",
      "6@99": "Class 6",
      "7@99": "Class 7",
      "8@99": "Class 8",
      "9@99": "Class 9",
      "10@99": "Class 10",
      "11@99": "Class 11",
      "12@99": "Class 12",
      "class1@99": "Class 1",
      "class2@99": "Class 2",
      "class3@99": "Class 3",
      "class4@99": "Class 4",
      "class5@99": "Class 5",
      "class6@99": "Class 6",
      "class7@99": "Class 7",
      "class8@99": "Class 8",
      "class9@99": "Class 9",
      "class10@99": "Class 10",
      "class11@99": "Class 11",
      "class12@99": "Class 12",
    };

    const code = teacherCode.trim().toLowerCase();
    const matchedClass = codeMap[code];
    if (!matchedClass) {
      setTeacherError("Invalid class code. Please check with admin.");
      return;
    }

    loginTeacher(teacherName, matchedClass);
    navigate("/teacher");
  };

  const isStudent = mode === "student";

  return (
    <div className="login-shell">
      <div className="login-illustration">
        {prevIndex !== null && (
          <div
            className="login-illustration-layer fade-out"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(243, 250, 255, 0.3)), url('${loginImages[prevIndex]}')`,
            }}
          />
        )}
        <div
          className="login-illustration-layer"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(243, 250, 255, 0.3)), url('${loginImages[slideIndex]}')`,
          }}
        />
        <div className="login-illustration-layout">
          <div className="login-illustration-content">
            <span
              className="brand-icon large login-logo"
              aria-label="Saraswati Maa playing veena logo"
              style={{ backgroundImage: "url('/saraswati-maa.jpg')" }}
            >
              <span className="brand-fallback">M</span>
            </span>
            <div className="login-illustration-title">MDDM Inter College</div>
            <div className="login-illustration-sub">
              Build focus, confidence, and strong weekly performance.
              <br />
              Weekly tests for smarter learning.
            </div>
          </div>

          <div className="login-panel">
            <div className="login-help-top">Need help?</div>
            <div className="login-brand-center">
              <span
                className="brand-icon large login-logo"
                aria-label="Saraswati Maa playing veena logo"
                style={{ backgroundImage: "url('/saraswati-maa.jpg')" }}
              >
                <span className="brand-fallback">M</span>
              </span>
              <div className="login-brand-title">MDDM Inter College</div>
              <div className="login-brand-sub">Where every mind shines</div>
            </div>

            <div className="login-heading">
              <h2>Log in</h2>
              <p>Welcome back! Please log in to your account.</p>
            </div>

            <div className="auth-toggle login-toggle">
              <button
                className={`toggle-btn ${isStudent ? "active" : ""}`}
                onClick={() => handleModeChange("student")}
                type="button"
              >
                Student Login
              </button>
              <button
                className={`toggle-btn ${!isStudent ? "active" : ""}`}
                onClick={() => handleModeChange("teacher")}
                type="button"
              >
                Teacher Login
              </button>
            </div>

            {isStudent ? (
              <form className="login-form" onSubmit={handleStudentLogin}>
                <label>
                  User ID
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="e.g. 8@21"
                  />
                </label>
                {studentError && <div className="error-text">{studentError}</div>}
                <div className="login-actions">
                  <button
                    type="button"
                    className="login-link"
                    onClick={() => alert("Please contact admin for password reset.")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <button type="submit" className="btn login-btn">
                  LOGIN
                </button>
              </form>
            ) : (
              <form className="login-form" onSubmit={handleTeacherLogin}>
                <label>
                  User ID
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    placeholder="Enter teacher code"
                  />
                </label>
                {teacherError && <div className="error-text">{teacherError}</div>}
                <div className="login-actions">
                  <button
                    type="button"
                    className="login-link"
                    onClick={() => alert("Please contact admin for password reset.")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <button type="submit" className="btn login-btn">
                  LOGIN
                </button>
              </form>
            )}

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

export default Login;
