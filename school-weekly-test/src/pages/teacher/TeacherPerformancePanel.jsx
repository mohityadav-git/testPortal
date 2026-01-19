import React from "react";

function TeacherPerformancePanel({
  classPerformance,
  studentSummaries,
  studentSearch,
  setStudentSearch,
  filteredStudentSummary,
  filteredResults,
  loadResults,
}) {
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Performance dashboard</div>
          <div className="section-sub">Overall class and individual performance</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadResults}>
          Refresh
        </button>
      </div>
      <div className="card performance-dashboard" style={{ marginBottom: 12 }}>
        <div className="performance-grid">
          <div className="mini-card">
            <div className="section-sub">Class average</div>
            <div className="performance-value">
              {classPerformance.percent.toFixed(1)}%
            </div>
            <div className="section-sub">
              {classPerformance.score}/{classPerformance.outOf} points
            </div>
          </div>
          <div className="mini-card">
            <div className="section-sub">Total attempts</div>
            <div className="performance-value">{classPerformance.count}</div>
            <div className="section-sub">All submissions</div>
          </div>
          <div className="mini-card">
            <div className="section-sub">Top performer</div>
            <div className="performance-name">
              {studentSummaries[0]?.student || "N/A"}
            </div>
            <div className="section-sub">
              {studentSummaries[0] ? `${studentSummaries[0].percent.toFixed(1)}%` : "-"}
            </div>
          </div>
        </div>
        <div className="performance-search">
          <label className="performance-search-label">
            <span>Search student</span>
            <input
              placeholder="Type student name"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </label>
          {studentSearch && (
            <div className="performance-result">
              {filteredStudentSummary ? (
                <div className="mini-card">
                  <div className="performance-name">{filteredStudentSummary.student}</div>
                  <div className="section-sub">
                    Attempts: {filteredStudentSummary.attempts}
                  </div>
                  <div className="section-sub">
                    Score: {filteredStudentSummary.score}/{filteredStudentSummary.outOf}
                  </div>
                  <div className="performance-value">
                    {filteredStudentSummary.percent.toFixed(1)}%
                  </div>
                </div>
              ) : (
                <div className="section-sub">No matching student found.</div>
              )}
            </div>
          )}
        </div>
      </div>
      {filteredResults.length === 0 ? (
        <div className="section-sub">No results yet.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Out of</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((r) => (
              <tr key={`${r.id}-${r.subject}-summary`}>
                <td>{r.studentName}</td>
                <td>{r.subject}</td>
                <td>{r.score}</td>
                <td>{r.outOf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeacherPerformancePanel;
