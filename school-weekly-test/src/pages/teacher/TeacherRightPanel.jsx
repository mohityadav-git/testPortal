import React from "react";

function TeacherRightPanel({ filteredTests, filteredQuestions, filteredResults }) {
  return (
    <div className="right-panel">
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <div>
            <div className="section-title">Performance Snapshot</div>
            <div className="section-sub">At a glance</div>
          </div>
        </div>
        <div className="snapshot-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-title" style={{ marginBottom: 4 }}>Scheduled tests</div>
            <div className="section-sub">Total active</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1f2d3d" }}>{filteredTests.length}</div>
          </div>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-title" style={{ marginBottom: 4 }}>Questions</div>
            <div className="section-sub">Saved bank</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1f2d3d" }}>{filteredQuestions.length}</div>
          </div>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-title" style={{ marginBottom: 4 }}>Results</div>
            <div className="section-sub">Submissions</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1f2d3d" }}>{filteredResults.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherRightPanel;
