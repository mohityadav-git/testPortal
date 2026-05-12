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
  isAdmin,
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
            onClick={() => openTestsPanel(true)}
          >
            <span className="tile-icon results" aria-hidden="true">P</span>
            <div className="tile-body">
              <div className="tile-title">Past Tests</div>
              <div className="tile-sub">Completed exams</div>
            </div>
            <span className="tile-chip">
              {filteredTests.filter((t) => {
                const testDate = new Date(t.date);
                testDate.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return testDate < today;
              }).length}
            </span>
          </button>
          <button
            type="button"
            className={`action-tile ${activePanel === "tests" ? "active" : ""}`}
            onClick={() => openTestsPanel(true)}
          >
            <span className="tile-icon upcoming" aria-hidden="true">C</span>
            <div className="tile-body">
              <div className="tile-title">Current Test</div>
              <div className="tile-sub">Live &amp; scheduled</div>
            </div>
            <span className="tile-chip">
              {filteredTests.filter((t) => {
                const testDate = new Date(t.date);
                testDate.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return testDate >= today;
              }).length}
            </span>
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

          {isAdmin && (
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
          )}

          {!isAdmin && (
            <button
              type="button"
              className={`action-tile ${activePanel === "classroom" ? "active" : ""}`}
              onClick={() => setActivePanel("classroom")}
            >
              <span className="tile-icon upcoming" aria-hidden="true">🏫</span>
              <div className="tile-body">
                <div className="tile-title">Classroom</div>
                <div className="tile-sub">Your class students</div>
              </div>
              <span className="tile-chip">{students.length}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default TeacherHomePanel;
