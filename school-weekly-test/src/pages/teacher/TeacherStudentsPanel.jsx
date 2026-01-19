import React from "react";

function TeacherStudentsPanel({
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
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Students</div>
          <div className="section-sub">Class roster and contact list</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadStudents}>
          Refresh
        </button>
      </div>
      <form className="form-grid" onSubmit={handleAddStudent}>
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
          <input value={teacherClass} readOnly />
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
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

      <div className="section-header" style={{ marginTop: 16 }}>
        <div>
          <div className="section-title">Class students</div>
          <div className="section-sub">Total: {students.length}</div>
        </div>
      </div>
      {isStudentsLoading ? (
        <div className="section-sub">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="section-sub">No students added yet.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Roll</th>
              <th>Mobile</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.Id}>
                <td>
                  {editingStudentId === s.Id ? (
                    <input
                      value={editStudentName}
                      onChange={(e) => setEditStudentName(e.target.value)}
                    />
                  ) : (
                    s.StudentName
                  )}
                </td>
                <td>{s.ClassName}</td>
                <td>
                  {editingStudentId === s.Id ? (
                    <input
                      value={editStudentRoll}
                      onChange={(e) => setEditStudentRoll(e.target.value)}
                    />
                  ) : (
                    s.RollNumber || "-"
                  )}
                </td>
                <td>
                  {editingStudentId === s.Id ? (
                    <input
                      value={editStudentMobile}
                      onChange={(e) => setEditStudentMobile(e.target.value)}
                    />
                  ) : (
                    s.MobileNumber || "-"
                  )}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {editingStudentId === s.Id ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleUpdateStudent(s.Id)}
                        style={{ marginRight: 6 }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={cancelEditStudent}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => startEditStudent(s)}
                        style={{ marginRight: 6 }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDeleteStudent(s.Id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeacherStudentsPanel;
