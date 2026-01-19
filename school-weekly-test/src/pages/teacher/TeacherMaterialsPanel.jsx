import React from "react";
import { classOptions, subjectOptions } from "./constants";

function TeacherMaterialsPanel({
  materialTitle,
  setMaterialTitle,
  materialSubject,
  setMaterialSubject,
  materialClass,
  setMaterialClass,
  materialFileKey,
  setMaterialFile,
  handleUploadMaterial,
  studyMaterialsError,
  isMaterialsLoading,
  studyMaterials,
  loadMaterials,
}) {
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Study material</div>
          <div className="section-sub">Upload documents for your class</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadMaterials}>
          Refresh
        </button>
      </div>
      <form className="form-grid" onSubmit={handleUploadMaterial}>
        <label>
          <span>Title</span>
          <input value={materialTitle} onChange={(e) => setMaterialTitle(e.target.value)} />
        </label>
        <label>
          <span>Subject</span>
          <select value={materialSubject} onChange={(e) => setMaterialSubject(e.target.value)}>
            <option value="">Select subject</option>
            {subjectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Class</span>
          <select value={materialClass} onChange={(e) => setMaterialClass(e.target.value)}>
            <option value="">Select class</option>
            {classOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          <span>Upload file (PDF or Word)</span>
          <input
            key={materialFileKey}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
          />
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="btn btn-primary btn-sm">
            Upload material
          </button>
        </div>
      </form>

      {studyMaterialsError && (
        <div className="section-sub" style={{ color: "#c23", marginTop: 8 }}>
          {studyMaterialsError}
        </div>
      )}

      <div className="section-header" style={{ marginTop: 16 }}>
        <div>
          <div className="section-title">Uploaded materials</div>
          <div className="section-sub">Latest uploads for your class</div>
        </div>
      </div>
      {!materialClass ? (
        <div className="section-sub">Select a class to view study materials.</div>
      ) : isMaterialsLoading ? (
        <div className="section-sub">Loading study materials...</div>
      ) : studyMaterials.length === 0 ? (
        <div className="section-sub">No study material shared yet.</div>
      ) : (
        <ul className="question-list">
          {studyMaterials.map((item) => (
            <li key={item.Id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.Title || "Study material"}</div>
                <div className="section-sub">
                  {item.Subject} - {item.ClassName}
                </div>
                {item.FileName && <div className="section-sub">{item.FileName}</div>}
              </div>
              <a className="btn btn-outline btn-sm" href={item.FileUrl} target="_blank" rel="noreferrer">
                Open
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TeacherMaterialsPanel;
