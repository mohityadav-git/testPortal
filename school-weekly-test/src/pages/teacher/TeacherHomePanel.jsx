import React from "react";

function TeacherHomePanel({
  teacherClass,
  user,
  filteredTests,
  filteredQuestions,
  filteredResults,
  nextTest,
  studyMaterials,
  students,
  activePanel,
  openTestsPanel,
  setActivePanel,
}) {
  return (
    <>
      <div className="teacher-hero-card">
        <div className="hero-copy">
          <div className="hero-tags">
            {teacherClass && <span className="pill hero-pill">Class {teacherClass}</span>}
          </div>
          <h1>Welcome, {user?.name || "Teacher"}</h1>
          <p className="subtitle">Plan tests, manage questions, and track results.</p>
          <div className="hero-stats-grid">
            <div className="hero-stat">
              <span className="stat-label">Scheduled tests</span>
              <span className="stat-value">{filteredTests.length}</span>
              <span className="stat-sub">This term</span>
            </div>
            <div className="hero-stat">
              <span className="stat-label">Question bank</span>
              <span className="stat-value">{filteredQuestions.length}</span>
              <span className="stat-sub">Saved items</span>
            </div>
            <div className="hero-stat">
              <span className="stat-label">Results</span>
              <span className="stat-value">{filteredResults.length}</span>
              <span className="stat-sub">Submissions</span>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-label">Next test</div>
          <div className="panel-bubble">
            <div className="bubble-icon" aria-hidden="true">T</div>
            <div>
              <div className="bubble-title">Upcoming</div>
              <div className="bubble-sub">
                {nextTest
                  ? `${nextTest.subject} - ${nextTest.date} ${nextTest.time}`
                  : "No tests scheduled"}
              </div>
            </div>
          </div>
          <div className="panel-bubble">
            <div className="bubble-icon" aria-hidden="true">R</div>
            <div>
              <div className="bubble-title">Latest result</div>
              <div className="bubble-sub">
                {filteredResults[0]
                  ? `${filteredResults[0].studentName} - ${filteredResults[0].subject}`
                  : "No results yet"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card teacher-action-card">
        <div className="section-header">
          <div>
            <div className="section-title">Quick actions</div>
            <div className="section-sub">Jump to key tasks</div>
          </div>
          <span className="mini-pill">Updated daily</span>
        </div>
        <div className="teacher-action-grid">
          <button
            type="button"
            className={`action-tile ${activePanel === "tests" ? "active" : ""}`}
            onClick={() => openTestsPanel(false)}
          >
            <span className="tile-icon upcoming" aria-hidden="true">S</span>
            <div className="tile-body">
              <div className="tile-title">Schedule test</div>
              <div className="tile-sub">Plan the next exam</div>
            </div>
            <span className="tile-chip">{filteredTests.length}</span>
          </button>
          <button
            type="button"
            className={`action-tile ${activePanel === "tests" ? "active" : ""}`}
            onClick={() => openTestsPanel(true)}
          >
            <span className="tile-icon upcoming" aria-hidden="true">T</span>
            <div className="tile-body">
              <div className="tile-title">Create tests</div>
              <div className="tile-sub">Schedule weekly exams</div>
            </div>
            <span className="tile-chip">{filteredTests.length}</span>
          </button>
          <button
            type="button"
            className={`action-tile ${activePanel === "questions" ? "active" : ""}`}
            onClick={() => setActivePanel("questions")}
          >
            <span className="tile-icon results" aria-hidden="true">Q</span>
            <div className="tile-body">
              <div className="tile-title">Question bank</div>
              <div className="tile-sub">Add new questions</div>
            </div>
            <span className="tile-chip">{filteredQuestions.length}</span>
          </button>
          <button
            type="button"
            className={`action-tile ${activePanel === "materials" ? "active" : ""}`}
            onClick={() => setActivePanel("materials")}
          >
            <span className="tile-icon upcoming" aria-hidden="true">M</span>
            <div className="tile-body">
              <div className="tile-title">Study material</div>
              <div className="tile-sub">Upload weekly notes</div>
            </div>
            <span className="tile-chip">{studyMaterials.length}</span>
          </button>
          <button
            type="button"
            className={`action-tile ${activePanel === "results" ? "active" : ""}`}
            onClick={() => setActivePanel("results")}
          >
            <span className="tile-icon results" aria-hidden="true">R</span>
            <div className="tile-body">
              <div className="tile-title">Results</div>
              <div className="tile-sub">Track submissions</div>
            </div>
            <span className="tile-chip">{filteredResults.length}</span>
          </button>
          <button
            type="button"
            className={`action-tile ${activePanel === "performance" ? "active" : ""}`}
            onClick={() => setActivePanel("performance")}
          >
            <span className="tile-icon homework" aria-hidden="true">P</span>
            <div className="tile-body">
              <div className="tile-title">Performance</div>
              <div className="tile-sub">Class insights</div>
            </div>
            <span className="tile-chip">{filteredResults.length}</span>
          </button>
          <button
            type="button"
            className={`action-tile ${activePanel === "students" ? "active" : ""}`}
            onClick={() => setActivePanel("students")}
          >
            <span className="tile-icon upcoming" aria-hidden="true">S</span>
            <div className="tile-body">
              <div className="tile-title">Students</div>
              <div className="tile-sub">Class roster</div>
            </div>
            <span className="tile-chip">{students.length}</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default TeacherHomePanel;
