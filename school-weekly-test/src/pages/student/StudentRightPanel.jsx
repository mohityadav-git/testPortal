import React from "react";

function StudentRightPanel({ pastTests, avgPercent, bestScore }) {
  return (
    <div className="right-panel">
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <div>
            <div className="section-title">Performance Snapshot</div>
            <div className="section-sub">Your progress at a glance</div>
          </div>
        </div>
        <div className="snapshot-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-sub">Total tests completed</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1f2d3d" }}>{pastTests.length}</div>
          </div>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-sub">Average score</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1f2d3d" }}>{avgPercent.toFixed(1)}%</div>
          </div>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-sub">Highest score</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1f2d3d" }}>{bestScore.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentRightPanel;
