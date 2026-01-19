import React from "react";
import { classOptions, difficultyOptions, subjectOptions } from "./constants";

function TeacherQuestionsPanel({
  questionSubject,
  setQuestionSubject,
  questionClass,
  setQuestionClass,
  questionText,
  setQuestionText,
  questionImages,
  setQuestionImages,
  questionSection,
  setQuestionSection,
  questionMarks,
  setQuestionMarks,
  questionDifficulty,
  setQuestionDifficulty,
  optionA,
  setOptionA,
  optionB,
  setOptionB,
  optionC,
  setOptionC,
  optionD,
  setOptionD,
  setOptionAImage,
  setOptionBImage,
  setOptionCImage,
  setOptionDImage,
  correctOption,
  setCorrectOption,
  isQuestionImageUploading,
  handleCreateQuestion,
  loadQuestions,
  isQuestionsLoading,
  questionsError,
  filteredQuestions,
  handleDeleteQuestion,
}) {
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Question bank</div>
          <div className="section-sub">Create and review questions</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadQuestions}>
          Refresh
        </button>
      </div>
      <form className="form-grid" onSubmit={handleCreateQuestion}>
        <label>
          <span>Subject</span>
          <select value={questionSubject} onChange={(e) => setQuestionSubject(e.target.value)}>
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
          <select value={questionClass} onChange={(e) => setQuestionClass(e.target.value)}>
            <option value="">Select class</option>
            {classOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          <span>Question</span>
          <input value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          <span>Question images (optional)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const picked = Array.from(e.target.files || []);
              if (picked.length === 0) return;
              setQuestionImages((prev) => {
                const seen = new Set(prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
                const merged = [...prev];
                picked.forEach((file) => {
                  const key = `${file.name}-${file.size}-${file.lastModified}`;
                  if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(file);
                  }
                });
                return merged;
              });
              e.target.value = "";
            }}
          />
        </label>
        {questionImages.length > 0 && (
          <div className="section-sub" style={{ gridColumn: "1 / -1" }}>
            Selected images: {questionImages.length}
            <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
              {questionImages.map((file, idx) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}-${idx}`}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span>{idx + 1}. {file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionImages((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      border: "1px solid #f0b4b4",
                      background: "#fff5f5",
                      color: "#b42318",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                    aria-label={`Remove ${file.name}`}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <label>
          <span>Section</span>
          <input value={questionSection} onChange={(e) => setQuestionSection(e.target.value)} />
        </label>
        <label>
          <span>Marks</span>
          <input
            type="number"
            min="1"
            value={questionMarks}
            onChange={(e) => setQuestionMarks(e.target.value)}
          />
        </label>
        <label>
          <span>Difficulty</span>
          <select
            value={questionDifficulty}
            onChange={(e) => setQuestionDifficulty(e.target.value)}
          >
            {difficultyOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <label>
            <span>Option A</span>
            <input value={optionA} onChange={(e) => setOptionA(e.target.value)} />
          </label>
          <label>
            <span>Option A image</span>
            <input type="file" accept="image/*" onChange={(e) => setOptionAImage(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <label>
            <span>Option B</span>
            <input value={optionB} onChange={(e) => setOptionB(e.target.value)} />
          </label>
          <label>
            <span>Option B image</span>
            <input type="file" accept="image/*" onChange={(e) => setOptionBImage(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <label>
            <span>Option C</span>
            <input value={optionC} onChange={(e) => setOptionC(e.target.value)} />
          </label>
          <label>
            <span>Option C image</span>
            <input type="file" accept="image/*" onChange={(e) => setOptionCImage(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <label>
            <span>Option D</span>
            <input value={optionD} onChange={(e) => setOptionD(e.target.value)} />
          </label>
          <label>
            <span>Option D image</span>
            <input type="file" accept="image/*" onChange={(e) => setOptionDImage(e.target.files?.[0] || null)} />
          </label>
        </div>
        <label>
          <span>Correct option</span>
          <select value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isQuestionImageUploading}>
            {isQuestionImageUploading ? "Uploading images..." : "Save question"}
          </button>
        </div>
      </form>

      <div className="section-header" style={{ marginTop: 16 }}>
        <div>
          <div className="section-title">Saved questions</div>
          <div className="section-sub">Latest questions for your class</div>
        </div>
      </div>
      {isQuestionsLoading ? (
        <div className="section-sub">Loading questions...</div>
      ) : questionsError ? (
        <div className="section-sub" style={{ color: "#c23" }}>{questionsError}</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="section-sub">No questions saved.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Section</th>
              <th>Marks</th>
              <th>Difficulty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.id}>
                <td>{q.questionText}</td>
                <td>{q.subject}</td>
                <td>{q.className}</td>
                <td>{q.section || "-"}</td>
                <td>{q.marks}</td>
                <td>{q.difficulty}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeacherQuestionsPanel;
