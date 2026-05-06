import React, { useState, useEffect } from "react";
import { api } from "../services/api";

const AdminDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      const data = await api.getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.createTeacher({ teacherName, mobileNumber, password });
      setSuccess(`Teacher "${teacherName}" registered successfully! They can now log in with mobile: ${mobileNumber}`);
      setTeacherName("");
      setMobileNumber("");
      setPassword("");
      fetchTeachers();
    } catch (err) {
      setError(err.message || "Failed to register teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    setError("");
    try {
      await api.deleteTeacher(id);
      setSuccess(`Teacher "${name}" removed.`);
      fetchTeachers();
    } catch (err) {
      setError(err.message || "Failed to delete teacher");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#e0e0e0"
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#fff" }}>
            🏫 Admin Portal
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#aaa" }}>MDDM Inter College</p>
        </div>
        <button onClick={handleLogout} style={{
          padding: "8px 20px",
          background: "rgba(231,76,60,0.2)",
          color: "#e74c3c",
          border: "1px solid rgba(231,76,60,0.4)",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "14px",
          transition: "all 0.2s"
        }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(231,76,60,0.35)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(231,76,60,0.2)"}
        >
          Logout
        </button>
      </div>

      <div style={{ maxWidth: "860px", margin: "40px auto", padding: "0 24px" }}>

        {/* Register Teacher Form */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "32px",
          backdropFilter: "blur(10px)"
        }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "18px", color: "#fff" }}>➕ Register New Teacher</h2>
          <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#aaa" }}>
            Fill in the details below. The teacher will use the mobile number and password to log in.
          </p>

          {error && (
            <div style={{ background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.4)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#e74c3c", fontSize: "14px" }}>
              ❌ {error}
            </div>
          )}
          {success && (
            <div style={{ background: "rgba(46,213,115,0.12)", border: "1px solid rgba(46,213,115,0.35)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#2ed573", fontSize: "14px" }}>
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleAddTeacher}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#aaa", fontWeight: 600 }}>
                  Teacher Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)",
                    color: "#fff", fontSize: "14px", boxSizing: "border-box", outline: "none"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#aaa", fontWeight: 600 }}>
                  Mobile Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)",
                    color: "#fff", fontSize: "14px", boxSizing: "border-box", outline: "none"
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#aaa", fontWeight: 600 }}>
                Initial Password *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Set a login password for the teacher"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "10px 40px 10px 14px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)",
                    color: "#fff", fontSize: "14px", boxSizing: "border-box", outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "16px"
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 28px",
                background: loading ? "rgba(52,152,219,0.3)" : "linear-gradient(135deg, #3498db, #2980b9)",
                color: "#fff", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: "15px", width: "100%", transition: "all 0.2s"
              }}
            >
              {loading ? "Registering..." : "✅ Register Teacher"}
            </button>
          </form>
        </div>

        {/* Teachers List */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "28px",
          backdropFilter: "blur(10px)"
        }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "18px", color: "#fff" }}>
            👨‍🏫 Registered Teachers <span style={{ fontSize: "14px", color: "#aaa", fontWeight: 400 }}>({teachers.length})</span>
          </h2>

          {teachers.length === 0 ? (
            <div style={{ textAlign: "center", color: "#555", padding: "40px 0", fontSize: "15px" }}>
              No teachers registered yet. Add one above.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {teachers.map((t) => (
                <div key={t.Id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px", padding: "14px 18px"
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#fff" }}>👤 {t.TeacherName}</div>
                    <div style={{ fontSize: "13px", color: "#aaa", marginTop: "3px" }}>📱 {t.MobileNumber}</div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                      Registered: {new Date(t.CreatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTeacher(t.Id, t.TeacherName)}
                    style={{
                      padding: "7px 16px",
                      background: "rgba(231,76,60,0.15)", color: "#e74c3c",
                      border: "1px solid rgba(231,76,60,0.3)", borderRadius: "7px",
                      cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(231,76,60,0.3)"}
                    onMouseOut={e => e.currentTarget.style.background = "rgba(231,76,60,0.15)"}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
