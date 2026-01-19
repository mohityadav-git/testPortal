import React from "react";

function StudentPastResultsPanel({
  pastTests,
  resultsError,
  marksGraphData,
  submissionOrderGraphData,
}) {
  const graphRow = (label, percent, sub, color = "#18b8b5") => {
    const width = Math.max(0, Math.min(100, percent || 0));
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#4b5563" }}>
          <span style={{ fontWeight: 600, color: "#1f2d3d" }}>{label}</span>
          <span>{width.toFixed(1)}%</span>
        </div>
        <div style={{ position: "relative", height: 10, background: "#eef2f7", borderRadius: 999 }}>
          <div
            style={{
              width: `${width}%`,
              height: "100%",
              background: color,
              borderRadius: 999,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        {sub && <div className="section-sub" style={{ marginTop: 4 }}>{sub}</div>}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Past Results</div>
          <div className="section-sub">Scores and percentages</div>
        </div>
      </div>
      {pastTests.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginBottom: 12 }}>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 12 }}>
            <div className="section-title" style={{ marginBottom: 6 }}>Marks graph</div>
            <div className="section-sub" style={{ marginBottom: 8 }}>As per achieved marks</div>
            {marksGraphData.map((row, idx) => (
              <div key={`${row.label}-${idx}`}>
                {graphRow(row.label, row.percent, row.date || `Test ${idx + 1}`, "#18b8b5")}
              </div>
            ))}
          </div>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 12 }}>
            <div className="section-title" style={{ marginBottom: 6 }}>Submission-time graph</div>
            <div className="section-sub" style={{ marginBottom: 8 }}>If marks tie, earlier submission ranks higher</div>
            {submissionOrderGraphData.map((row, idx) => (
              <div key={`${row.label || "row"}-${idx}`}>
                {graphRow(
                  row.label || `Test ${idx + 1}`,
                  row.percent,
                  row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "Not recorded",
                  "#6aaed6"
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {resultsError && pastTests.length === 0 && (
        <p className="section-sub" style={{ color: "#c23" }}>{resultsError}</p>
      )}
      {pastTests.length === 0 ? (
        <p>No past test records yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Date</th>
              <th>Score</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {pastTests.map((test) => (
              <tr key={test.id}>
                <td>{test.subject}</td>
                <td>{test.submittedAt ? test.submittedAt.slice(0, 10) : ""}</td>
                <td>
                  {test.score}/{test.outOf}
                </td>
                <td>
                  {test.outOf ? ((test.score / test.outOf) * 100).toFixed(1) : "0.0"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentPastResultsPanel;
