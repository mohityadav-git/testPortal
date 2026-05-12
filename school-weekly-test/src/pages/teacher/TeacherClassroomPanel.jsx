import React, { useState } from "react";

function TeacherClassroomPanel({ students, isStudentsLoading, loadStudents, teacherClass, tests = [], results = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.StudentName && s.StudentName.toLowerCase().includes(q)) ||
      (s.RollNumber && s.RollNumber.toLowerCase().includes(q)) ||
      (s.MobileNumber && s.MobileNumber.includes(q))
    );
  });

  // Compute stats for a given student
  const getStudentStats = (student) => {
    const name = student.StudentName?.toLowerCase().trim();
    const submitted = results.filter(
      (r) => (r.studentName || r.StudentName || "").toLowerCase().trim() === name
    );
    const submittedTestIds = new Set(
      submitted.map((r) => String(r.testId || r.TestId || ""))
    );
    const pending = tests.filter(
      (t) => !submittedTestIds.has(String(t.id || t.Id || ""))
    );
    return { submitted, pending };
  };

  if (selectedStudent) {
    const { submitted, pending } = getStudentStats(selectedStudent);
    return (
      <div className="card">
        {/* Back button + header */}
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setSelectedStudent(null)}
              style={{ fontSize: 18, padding: "2px 10px" }}
            >
              ←
            </button>
            <div>
              <div className="section-title">{selectedStudent.StudentName}</div>
              <div className="section-sub">
                {selectedStudent.ClassName} {selectedStudent.RollNumber ? `· Roll ${selectedStudent.RollNumber}` : ""}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              background: "#dcfce7", color: "#166534",
              borderRadius: 10, padding: "8px 18px", textAlign: "center", minWidth: 90
            }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{submitted.length}</div>
              <div style={{ fontSize: 12 }}>Submitted</div>
            </div>
            <div style={{
              background: "#fef9c3", color: "#854d0e",
              borderRadius: 10, padding: "8px 18px", textAlign: "center", minWidth: 90
            }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{pending.length}</div>
              <div style={{ fontSize: 12 }}>Pending</div>
            </div>
            <div style={{
              background: "#e0e7ff", color: "#3730a3",
              borderRadius: 10, padding: "8px 18px", textAlign: "center", minWidth: 90
            }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{tests.length}</div>
              <div style={{ fontSize: 12 }}>Total Tests</div>
            </div>
          </div>
        </div>

        {/* Submitted tests */}
        <div className="section-title" style={{ marginBottom: 8 }}>✅ Submitted Tests ({submitted.length})</div>
        {submitted.length === 0 ? (
          <div className="section-sub" style={{ marginBottom: 16 }}>No tests submitted yet.</div>
        ) : (
          <div style={{ overflowX: "auto", marginBottom: 24 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submitted.map((r, i) => {
                  const score = r.score ?? r.Score ?? 0;
                  const outOf = r.outOf ?? r.OutOf ?? 0;
                  const pct = outOf > 0 ? Math.round((score / outOf) * 100) : 0;
                  return (
                    <tr key={r.Id || r.id || i}>
                      <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.subject || r.Subject}</td>
                      <td>
                        <span style={{
                          background: pct >= 60 ? "#dcfce7" : "#fee2e2",
                          color: pct >= 60 ? "#166534" : "#991b1b",
                          borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700
                        }}>
                          {score}/{outOf} ({pct}%)
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>
                        {r.submittedAt || r.SubmittedAt
                          ? new Date(r.submittedAt || r.SubmittedAt).toLocaleString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pending tests */}
        <div className="section-title" style={{ marginBottom: 8 }}>⏳ Pending Tests ({pending.length})</div>
        {pending.length === 0 ? (
          <div className="section-sub">All tests submitted!</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((t, i) => {
                  const testDate = new Date(t.date || t.Date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  testDate.setHours(0, 0, 0, 0);
                  const isPast = testDate < today;
                  return (
                    <tr key={t.Id || t.id || i}>
                      <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{t.subject || t.Subject}</td>
                      <td style={{ fontSize: 12 }}>
                        {testDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        <span style={{
                          background: isPast ? "#fee2e2" : "#fef9c3",
                          color: isPast ? "#991b1b" : "#854d0e",
                          borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600
                        }}>
                          {isPast ? "Missed" : "Upcoming"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="section-title">🏫 Classroom</div>
          <div className="section-sub">
            {teacherClass ? `${teacherClass} — ` : ""}
            {students.length} student{students.length !== 1 ? "s" : ""}
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>
              Click a student to see their test activity
            </span>
          </div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadStudents}>
          Refresh
        </button>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name, roll number or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1, padding: "8px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 8, fontSize: 14, outline: "none",
          }}
        />
        {searchQuery && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearchQuery("")}>
            ✕ Clear
          </button>
        )}
      </div>

      {isStudentsLoading ? (
        <div className="section-sub">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="section-sub" style={{ textAlign: "center", padding: "32px 0" }}>
          No students added yet for this class.
        </div>
      ) : filtered.length === 0 ? (
        <div className="section-sub">No students match your search.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Roll No.</th>
                <th>Mobile</th>
                <th>Submitted</th>
                <th>Pending</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const { submitted, pending } = getStudentStats(s);
                return (
                  <tr
                    key={s.Id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedStudent(s)}
                  >
                    <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: "#3730a3" }}>{s.StudentName}</td>
                    <td>{s.RollNumber || <span style={{ color: "#9ca3af" }}>—</span>}</td>
                    <td>{s.MobileNumber || <span style={{ color: "#9ca3af" }}>—</span>}</td>
                    <td>
                      <span style={{
                        background: "#dcfce7", color: "#166534",
                        borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700
                      }}>
                        {submitted.length}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: pending.length > 0 ? "#fef9c3" : "#f0fdf4",
                        color: pending.length > 0 ? "#854d0e" : "#166534",
                        borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700
                      }}>
                        {pending.length}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: s.HasPassword ? "#dcfce7" : "#fef9c3",
                        color: s.HasPassword ? "#166534" : "#854d0e",
                        borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600
                      }}>
                        {s.HasPassword ? "✅ Active" : "⏳ Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeacherClassroomPanel;
