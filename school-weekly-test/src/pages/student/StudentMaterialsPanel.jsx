import React from "react";
import { classOptions, subjectOptions } from "./constants";

function StudentMaterialsPanel({
  materialSubject,
  setMaterialSubject,
  materialClass,
  setMaterialClass,
  studyMaterialsError,
  isMaterialsLoading,
  studyMaterials,
}) {
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Study material</div>
          <div className="section-sub">Materials for your class (use filters if needed)</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        <div className="form-grid">
          <label>
            <span>Subject</span>
            <select value={materialSubject} onChange={(e) => setMaterialSubject(e.target.value)}>
              <option value="">Select subject</option>
              {subjectOptions.map((subjectName) => (
                <option key={subjectName} value={subjectName}>
                  {subjectName}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Class</span>
            <select value={materialClass} onChange={(e) => setMaterialClass(e.target.value)}>
              <option value="">Select class</option>
              {classOptions.map((classNameOption) => (
                <option key={classNameOption} value={classNameOption}>
                  {classNameOption}
                </option>
              ))}
            </select>
          </label>
        </div>

        {studyMaterialsError && (
          <div className="section-sub" style={{ color: "#c23" }}>
            {studyMaterialsError}
          </div>
        )}

        {!materialClass ? (
          <div className="section-sub">Select class to view study material.</div>
        ) : isMaterialsLoading ? (
          <div className="section-sub">Loading study materials...</div>
        ) : studyMaterials.length === 0 ? (
          <div className="section-sub">No study material shared for this week.</div>
        ) : (
          <ul className="question-list">
            {studyMaterials.map((item) => (
              <li key={item.Id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.Title || "Study material"}</div>
                  <div className="section-sub">
                    {item.Subject} - {item.ClassName}
                    {item.WeekStart ? ` - Week of ${String(item.WeekStart).slice(0, 10)}` : ""}
                  </div>
                </div>
                <a className="btn btn-outline btn-sm" href={item.FileUrl} target="_blank" rel="noreferrer">
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default StudentMaterialsPanel;
