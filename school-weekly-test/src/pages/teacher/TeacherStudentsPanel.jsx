import React, { useState } from "react";
import { api } from "../../services/api";
import { classOptions } from "../../data/localData";

function TeacherStudentsPanel({
  isAdmin,
  studentClass,
  setStudentClass,
  studentName,
  setStudentName,
  studentRollNumber,
  setStudentRollNumber,
  studentMobileNumber,
  setStudentMobileNumber,
  teacherClass,
  handleAddStudent,
  studentsError,
  isStudentsLoading,
  students,
  editingStudentId,
  editStudentName,
  setEditStudentName,
  editStudentRoll,
  setEditStudentRoll,
  editStudentMobile,
  setEditStudentMobile,
  handleUpdateStudent,
  cancelEditStudent,
  startEditStudent,
  handleDeleteStudent,
  loadStudents,
}) {
  const [settingPasswordId, setSettingPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ id: null, msg: "", ok: false });
  const [activeTab, setActiveTab] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(""); // admin-only class filter

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const cf = classFilter.toLowerCase().trim();
    if (cf && (!s.ClassName || s.ClassName.toLowerCase().trim() !== cf)) return false;
    if (!q) return true;
    return (
      (s.StudentName && s.StudentName.toLowerCase().includes(q)) ||
      (s.MobileNumber && s.MobileNumber.includes(q))
    );
  });

  const handleSetPassword = async (studentId) => {
    if (!newPassword || newPassword.length < 4) {
      setPwdMsg({ id: studentId, msg: "Min. 4 characters", ok: false });
      return;
    }
    try {
      await api.setStudentPassword(studentId, newPassword);
      setPwdMsg({ id: studentId, msg: "Password set ✅", ok: true });
      setNewPassword("");
      setSettingPasswordId(null);
      loadStudents(); // refresh so HasPassword flag updates
      setTimeout(() => setPwdMsg({ id: null, msg: "", ok: false }), 3000);
    } catch (err) {
      let msg = err.message || "Failed";
      try { msg = JSON.parse(msg).error || msg; } catch {}
      setPwdMsg({ id: studentId, msg, ok: false });
    }
  };

  return (
    <div className="card">
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="section-title">Students</div>
          <div className="section-sub">
            {activeTab === "list" ? `Total: ${students.length}` : "Manage class roster"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "add" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("add")}
          >
            Add Student
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "list" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("list")}
          >
            Student List
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => loadStudents()}>
            Refresh
          </button>
        </div>
      </div>

      {activeTab === "add" && (
        <>
          <form className="form-grid" onSubmit={(e) => {
            handleAddStudent(e);
            setActiveTab("list");
          }}>
            <label>
              <span>Name</span>
              <input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            </label>
            <label>
              <span>Roll number</span>
              <input value={studentRollNumber} onChange={(e) => setStudentRollNumber(e.target.value)} />
            </label>
            <label>
              <span>Mobile number</span>
              <input value={studentMobileNumber} onChange={(e) => setStudentMobileNumber(e.target.value)} />
            </label>
            <label>
              <span>Class</span>
              {isAdmin ? (
                <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)}>
                  {classOptions.map((c) => (
                    <option key={c.tag} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={teacherClass} readOnly />
              )}
            </label>
            <div style={{ gridColumn: "1 / -1", marginTop: 12 }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Add student
              </button>
            </div>
          </form>

          {studentsError && (
            <div className="section-sub" style={{ color: "#c23", marginTop: 8 }}>
              {studentsError}
            </div>
          )}
        </>
      )}

      {activeTab === "list" && (
        <div style={{ overflowX: "auto" }}>

          {/* Admin class filter + search — always visible */}
          <div style={{ margin: "12px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isAdmin && (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, minWidth: 140 }}
              >
                <option value="">All Classes</option>
                {classOptions.map((c) => (
                  <option key={c.tag} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              placeholder="Search by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }}
            />
            {searchQuery && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearchQuery("")}>✕ Clear</button>
            )}
          </div>

          {isStudentsLoading ? (
            <div className="section-sub" style={{ padding: "20px 0" }}>Loading students...</div>
          ) : studentsError ? (
            <div className="section-sub" style={{ color: "var(--danger)", padding: "20px 0" }}>{studentsError}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="section-sub" style={{ padding: "20px 0" }}>No students found for this class.</div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Roll</th>
                    <th>Mobile</th>
                    <th>Password</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.Id}>
                      <td>
                        {editingStudentId === s.Id ? (
                          <input value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} />
                        ) : (
                          s.StudentName
                        )}
                      </td>
                      <td>{s.ClassName}</td>
                      <td>
                        {editingStudentId === s.Id ? (
                          <input value={editStudentRoll} onChange={(e) => setEditStudentRoll(e.target.value)} style={{ width: 80 }} />
                        ) : (
                          s.RollNumber || "—"
                        )}
                      </td>
                      <td>
                        {editingStudentId === s.Id ? (
                          <input value={editStudentMobile} onChange={(e) => setEditStudentMobile(e.target.value)} style={{ width: 110 }} />
                        ) : (
                          s.MobileNumber || "—"
                        )}
                      </td>
                      <td style={{ minWidth: 180 }}>
                        {settingPasswordId === s.Id ? (
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input
                              type="password"
                              placeholder="New password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              style={{ width: 110, fontSize: 12, padding: "3px 6px" }}
                              autoFocus
                            />
                            <button type="button" className="btn btn-primary btn-sm" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => handleSetPassword(s.Id)}>Set</button>
                            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => { setSettingPasswordId(null); setNewPassword(""); setPwdMsg({ id: null, msg: "", ok: false }); }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: 11 }}
                              onClick={() => { setSettingPasswordId(s.Id); setNewPassword(""); setPwdMsg({ id: null, msg: "", ok: false }); }}
                            >
                              {s.HasPassword ? "Reset Password" : "Set Password"}
                            </button>
                            {pwdMsg.id === s.Id && (
                              <span style={{ fontSize: 11, color: pwdMsg.ok ? "#166534" : "#c23" }}>
                                {pwdMsg.msg}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {editingStudentId === s.Id ? (
                          <>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => handleUpdateStudent(s.Id)} style={{ marginRight: 6 }}>Save</button>
                            <button type="button" className="btn btn-outline btn-sm" onClick={cancelEditStudent}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => startEditStudent(s)} style={{ marginRight: 6 }}>Edit</button>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDeleteStudent(s.Id)}>Delete</button>
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
      )}
    </div>
  );
}

export default TeacherStudentsPanel;
