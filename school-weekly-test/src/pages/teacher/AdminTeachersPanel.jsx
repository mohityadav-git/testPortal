import React, { useState, useEffect } from "react";
import { api } from "../../services/api";

function AdminTeachersPanel() {
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTeachers();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load teachers");
    } finally {
      setIsLoading(false);
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
      setSuccess(`Teacher "${teacherName}" registered successfully.`);
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
    if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return;
    setError("");
    setSuccess("");
    try {
      await api.deleteTeacher(id);
      setSuccess(`Teacher "${name}" removed.`);
      setTeachers((prev) => prev.filter((t) => t.Id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete teacher");
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">Teachers</div>
          <div className="section-sub">Register and manage teacher accounts</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={fetchTeachers}>
          Refresh
        </button>
      </div>

      {/* Register Form */}
      <form className="form-grid" onSubmit={handleAddTeacher}>
        <label>
          <span>Teacher Name</span>
          <input
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            required
          />
        </label>
        <label>
          <span>Mobile Number</span>
          <input
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="e.g. 9876543210"
            required
          />
        </label>
        <label style={{ position: "relative" }}>
          <span>Initial Password</span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Login password for the teacher"
            required
            style={{ paddingRight: 36 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            style={{
              position: "absolute",
              right: 8,
              bottom: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "#9ca3af",
              lineHeight: 1,
            }}
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? "Registering..." : "Register Teacher"}
          </button>
        </div>
      </form>

      {error && (
        <div className="section-sub" style={{ color: "#c23", marginTop: 8 }}>
          {error}
        </div>
      )}
      {success && (
        <div className="section-sub" style={{ color: "#166534", marginTop: 8 }}>
          ✅ {success}
        </div>
      )}

      {/* Teachers List */}
      <div className="section-header" style={{ marginTop: 16 }}>
        <div>
          <div className="section-title">Registered Teachers</div>
          <div className="section-sub">Total: {teachers.length}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="section-sub">Loading teachers...</div>
      ) : teachers.length === 0 ? (
        <div className="section-sub">No teachers registered yet.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Registered</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t.Id}>
                <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{t.TeacherName}</td>
                <td>{t.MobileNumber}</td>
                <td>
                  {new Date(t.CreatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                    onClick={() => handleDeleteTeacher(t.Id, t.TeacherName)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminTeachersPanel;
