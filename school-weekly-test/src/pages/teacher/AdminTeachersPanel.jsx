import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { classOptions } from "../../data/localData";

function AdminTeachersPanel() {
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [className, setClassName] = useState("Class 1");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editClass, setEditClass] = useState("Class 1");

  // Password state
  const [pwdId, setPwdId] = useState(null);
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ id: null, msg: "", ok: false });

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
      await api.createTeacher({ teacherName, mobileNumber, password, className });
      setSuccess(`Teacher "${teacherName}" registered successfully.`);
      setTeacherName("");
      setMobileNumber("");
      setPassword("");
      setClassName("Class 1");
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

  const startEdit = (t) => {
    setEditingId(t.Id);
    setEditName(t.TeacherName);
    setEditMobile(t.MobileNumber);
    setEditClass(t.ClassName || "Class 1");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => setEditingId(null);

  const handleUpdateTeacher = async (id) => {
    setError("");
    setSuccess("");
    try {
      await api.updateTeacher(id, { teacherName: editName, mobileNumber: editMobile, className: editClass });
      setTeachers((prev) =>
        prev.map((t) =>
          t.Id === id
            ? { ...t, TeacherName: editName, MobileNumber: editMobile, ClassName: editClass }
            : t
        )
      );
      setSuccess("Teacher updated.");
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Failed to update teacher");
    }
  };

  const handleSetTeacherPassword = async (id) => {
    if (!newPwd || newPwd.length < 4) {
      setPwdMsg({ id, msg: "Min. 4 characters", ok: false });
      return;
    }
    try {
      await api.setTeacherPassword(id, newPwd);
      setTeachers((prev) =>
        prev.map((t) => (t.Id === id ? { ...t, HasPassword: 1 } : t))
      );
      setPwdMsg({ id, msg: "Password updated ✅", ok: true });
      setNewPwd("");
      setPwdId(null);
      setTimeout(() => setPwdMsg({ id: null, msg: "", ok: false }), 3000);
    } catch (err) {
      let msg = err.message || "Failed";
      try { msg = JSON.parse(msg).error || msg; } catch {}
      setPwdMsg({ id, msg, ok: false });
    }
  };

  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Teachers</div>
          <div className="section-sub">Register and manage teacher accounts</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={fetchTeachers}>
          Refresh
        </button>
      </div>

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
        <label>
          <span>Assigned Class</span>
          <select value={className} onChange={(e) => setClassName(e.target.value)}>
            {classOptions.map((c) => (
              <option key={c.tag} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
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
        <div className="section-sub" style={{ color: "var(--danger)", marginTop: 8 }}>
          {error}
        </div>
      )}
      {success && (
        <div className="section-sub" style={{ color: "var(--success)", marginTop: 8 }}>
          ✅ {success}
        </div>
      )}

      <div className="section-header" style={{ marginTop: 24 }}>
        <div>
          <div className="section-title">Registered Teachers</div>
          <div className="section-sub">Total: {teachers.length}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="section-sub" style={{ padding: "20px 0" }}>Loading teachers...</div>
      ) : teachers.length === 0 ? (
        <div className="section-sub" style={{ padding: "20px 0" }}>No teachers registered yet.</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Class</th>
                <th>Mobile</th>
                <th>Registered</th>
                <th>Password</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => (
                <tr key={t.Id}>
                  <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    {editingId === t.Id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ padding: "4px 8px", fontSize: 13, borderRadius: 6, border: "1px solid #e5e7eb", width: 140 }}
                      />
                    ) : t.TeacherName}
                  </td>
                  <td>
                    {editingId === t.Id ? (
                      <select
                        value={editClass}
                        onChange={(e) => setEditClass(e.target.value)}
                        style={{ padding: "4px 8px", fontSize: 13, borderRadius: 6, border: "1px solid #e5e7eb" }}
                      >
                        {classOptions.map((c) => (
                          <option key={c.tag} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    ) : (t.ClassName || <span style={{ color: "#9ca3af" }}>—</span>)}
                  </td>
                  <td>
                    {editingId === t.Id ? (
                      <input
                        value={editMobile}
                        onChange={(e) => setEditMobile(e.target.value)}
                        style={{ padding: "4px 8px", fontSize: 13, borderRadius: 6, border: "1px solid #e5e7eb", width: 120 }}
                      />
                    ) : t.MobileNumber}
                  </td>
                  <td>
                    {new Date(t.CreatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ minWidth: 180 }}>
                    {pwdId === t.Id ? (
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <input
                          type="password"
                          placeholder="New password"
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          style={{ width: 110, fontSize: 12, padding: "3px 6px", borderRadius: 6, border: "1px solid #e5e7eb" }}
                          autoFocus
                        />
                        <button type="button" className="btn btn-primary btn-sm" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => handleSetTeacherPassword(t.Id)}>Set</button>
                        <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => { setPwdId(null); setNewPwd(""); setPwdMsg({ id: null, msg: "", ok: false }); }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: 11 }} onClick={() => { setPwdId(t.Id); setNewPwd(""); setPwdMsg({ id: null, msg: "", ok: false }); }}>
                          {t.HasPassword ? "Reset Password" : "Set Password"}
                        </button>
                        {pwdMsg.id === t.Id && (
                          <span style={{ fontSize: 11, color: pwdMsg.ok ? "var(--success)" : "var(--danger)" }}>
                            {pwdMsg.msg}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap", display: "flex", gap: 6 }}>
                    {editingId === t.Id ? (
                      <>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => handleUpdateTeacher(t.Id)}>Save</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => startEdit(t)}>Edit</button>
                        <button type="button" className="btn btn-outline btn-sm" style={{ color: "var(--danger)", borderColor: "#fca5a5" }} onClick={() => handleDeleteTeacher(t.Id, t.TeacherName)}>Remove</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminTeachersPanel;
