import React from "react";

function StudentHomePanel({
  user,
  upcomingCount,
  pastCount,
  upcomingSummary,
  pastSummary,
  pastTests,
  avgPercent,
  bestScore,
  performanceChartData,
  activePanel,
  setActivePanel,
}) {
  return (
    <>
      <div className="student-hero-card">
        <div className="hero-copy">
          <div className="hero-tags">
            {user?.className && <span className="pill hero-pill">Class {user.className}</span>}
            {user?.rollNumber && <span className="pill hero-pill">Roll {user.rollNumber}</span>}
          </div>
          <h1>Hi, {user?.name || "Student"}</h1>
          <p className="subtitle">Track your weekly progress and jump into the next task.</p>
          <div className="hero-stats-grid">
            <div className="hero-stat">
              <span className="stat-label">Upcoming tests</span>
              <span className="stat-value">{upcomingCount}</span>
              <span className="stat-sub">Scheduled</span>
            </div>
            <div className="hero-stat">
              <span className="stat-label">Past results</span>
              <span className="stat-value">{pastCount}</span>
              <span className="stat-sub">Completed</span>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-label">Weekly overview</div>
          <div className="panel-bubble">
            <div className="bubble-icon" aria-hidden="true">T</div>
            <div>
              <div className="bubble-title">Next test</div>
              <div className="bubble-sub">
                {upcomingSummary
                  ? `${upcomingSummary.subject} - ${upcomingSummary.date}`
                  : "Nothing scheduled"}
              </div>
            </div>
          </div>
          <div className="panel-bubble">
            <div className="bubble-icon" aria-hidden="true">R</div>
            <div>
              <div className="bubble-title">Latest result</div>
              <div className="bubble-sub">
                {pastSummary
                  ? `${pastSummary.subject} - ${pastSummary.score}/${pastSummary.outOf}`
                  : "Not attempted yet"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-header">
          <div>
            <div className="section-title">Performance Dashboard</div>
            <div className="section-sub">Total tests, average score, and best score</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-sub">Total tests completed</div>
            <div className="perf-value" style={{ fontSize: 34, fontWeight: 800, color: "#1f2d3d" }}>
              {pastTests.length}
            </div>
          </div>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-sub">Average score</div>
            <div className="perf-value" style={{ fontSize: 34, fontWeight: 800, color: "#1f2d3d" }}>
              {avgPercent.toFixed(1)}%
            </div>
          </div>
          <div className="mini-card" style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14 }}>
            <div className="section-sub">Highest score</div>
            <div className="perf-value" style={{ fontSize: 34, fontWeight: 800, color: "#1f2d3d" }}>
              {bestScore.toFixed(1)}%
            </div>
          </div>
        </div>
        <div
          className="mini-card score-trend-card"
          style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 14, marginTop: 12 }}
        >
          <div className="section-title" style={{ marginBottom: 6 }}>Score trend</div>
          <div className="section-sub" style={{ marginBottom: 12 }}>Latest test performance</div>
          {performanceChartData.length === 0 ? (
            <div className="section-sub">No results yet.</div>
          ) : (
            <div className="score-trend-chart" style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 170 }}>
              {performanceChartData.map((row, idx) => (
                <div key={`${row.label}-${idx}`} style={{ flex: 1, display: "grid", gap: 6 }}>
                  <div style={{ height: 120, display: "flex", alignItems: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${Math.max(6, row.percent)}%`,
                        background: "linear-gradient(180deg, #6aaed6, #18b8b5)",
                        borderRadius: 10,
                        transition: "height 0.3s ease",
                      }}
                    />
                  </div>
                          <div style={{ fontSize: 11, color: "#4b5563", textAlign: "center" }}>{row.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                            {row.percent.toFixed(0)}%
                          </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="card student-action-card">
        <div className="section-header">
          <div>
            <div className="section-title">Quick actions</div>
            <div className="section-sub">Jump straight to your tests</div>
          </div>
          <span className="mini-pill">Updated daily</span>
        </div>
        <div className="student-action-grid">
          <button
            type="button"
            className={`action-tile ${activePanel === "upcoming" ? "active" : ""}`}
            onClick={() => setActivePanel("upcoming")}
          >
            <span className="tile-icon upcoming" aria-hidden="true">U</span>
            <div className="tile-body">
              <div className="tile-title">Upcoming Tests</div>
              <div className="tile-sub">Start or review schedule</div>
            </div>
            <span className="tile-chip">{upcomingCount}</span>
          </button>
          <button
            type="button"
            className={`action-tile ${activePanel === "past" ? "active" : ""}`}
            onClick={() => setActivePanel("past")}
          >
            <span className="tile-icon results" aria-hidden="true">P</span>
            <div className="tile-body">
              <div className="tile-title">Past Results</div>
              <div className="tile-sub">See scores and percentages</div>
            </div>
            <span className="tile-chip">{pastCount}</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default StudentHomePanel;
