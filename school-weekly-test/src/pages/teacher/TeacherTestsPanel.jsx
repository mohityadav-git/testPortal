import React from "react";
import {
  classOptions,
  difficultyOptions,
  questionPickingOptions,
  subjectOptions,
} from "./constants";

function TeacherTestsPanel({
  showTestForm,
  testSubject,
  setTestSubject,
  testClass,
  setTestClass,
  testDate,
  setTestDate,
  testTime,
  setTestTime,
  testDuration,
  setTestDuration,
  testNumQuestions,
  setTestNumQuestions,
  questionPicking,
  setQuestionPicking,
  testDifficulty,
  setTestDifficulty,
  selectedQuestionIds,
  eligibleQuestions,
  isQuestionsLoading,
  toggleQuestionSelection,
  handleCreateTest,
  loadTests,
  isTestsLoading,
  testsError,
  filteredTests,
}) {
  const shareTestWhatsApp = (test) => {
    if (!test) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/test/${test.id}`;
    const message = `Weekly test link for ${test.subject || "your subject"} (${test.className || "class"}): ${link}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="card">
      {showTestForm && (
        <>
          <div className="section-header">
            <div>
              <div className="section-title">Create test</div>
              <div className="section-sub">Schedule a new weekly test</div>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleCreateTest}>
            <label>
              <span>Subject</span>
              <select value={testSubject} onChange={(e) => setTestSubject(e.target.value)}>
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
              <select value={testClass} onChange={(e) => setTestClass(e.target.value)}>
                <option value="">Select class</option>
                {classOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
            </label>
            <label>
              <span>Time</span>
              <input type="time" value={testTime} onChange={(e) => setTestTime(e.target.value)} />
            </label>
            <label>
              <span>Duration (minutes)</span>
              <input
                type="number"
                min="5"
                value={testDuration}
                onChange={(e) => setTestDuration(e.target.value)}
              />
            </label>
            {questionPicking !== "manual" ? (
              <label>
                <span>Number of questions</span>
                <input
                  type="number"
                  min="1"
                  value={testNumQuestions}
                  onChange={(e) => setTestNumQuestions(e.target.value)}
                />
              </label>
            ) : (
              <label>
                <span>Selected questions</span>
                <input type="text" value={`${selectedQuestionIds.length}`} readOnly />
              </label>
            )}
            <label>
              <span>Question picking</span>
              <select value={questionPicking} onChange={(e) => setQuestionPicking(e.target.value)}>
                {questionPickingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            {questionPicking !== "manual" && (
              <label>
                <span>Difficulty</span>
                <select value={testDifficulty} onChange={(e) => setTestDifficulty(e.target.value)}>
                  {difficultyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Create test
              </button>
            </div>
          </form>

          {questionPicking === "manual" && (
            <div style={{ marginTop: 16 }}>
              <div className="section-header">
                <div>
                  <div className="section-title">Pick questions</div>
                  <div className="section-sub">Choose from your question bank</div>
                </div>
                <div className="section-sub">Selected: {selectedQuestionIds.length}</div>
              </div>
              {!testSubject ? (
                <div className="section-sub">Select a subject to filter the question bank.</div>
              ) : isQuestionsLoading ? (
                <div className="section-sub">Loading questions...</div>
              ) : eligibleQuestions.length === 0 ? (
                <div className="section-sub">No questions found for this subject.</div>
              ) : (
                <ul className="question-list">
                  {eligibleQuestions.map((q) => (
                    <li key={q.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.includes(q.id)}
                        onChange={() => toggleQuestionSelection(q.id)}
                        style={{ marginTop: 4 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{q.questionText}</div>
                        <div className="section-sub">
                          {q.subject} - {q.className}  {q.marks || 1} marks
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <div className="section-header" style={{ marginTop: showTestForm ? 16 : 0 }}>
        <div>
          <div className="section-title">Scheduled tests</div>
          <div className="section-sub">Tests for your class</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadTests}>
          Refresh
        </button>
      </div>
      {isTestsLoading ? (
        <div className="section-sub">Loading tests...</div>
      ) : testsError ? (
        <div className="section-sub" style={{ color: "#c23" }}>{testsError}</div>
      ) : filteredTests.length === 0 ? (
        <div className="section-sub">No tests scheduled.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Class</th>
              <th>Questions</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Picking</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.map((t) => (
              <tr key={t.id}>
                <td>{t.subject}</td>
                <td>{t.className}</td>
                <td>{t.numQuestions || "-"}</td>
                <td>{t.date}</td>
                <td>{t.time}</td>
                <td>{t.durationMinutes} min</td>
                <td>{t.shuffleQuestions ? "Random" : "Manual"}</td>
                <td>{t.difficulty}</td>
                <td>{t.status}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => shareTestWhatsApp(t)}
                  >
                    Share
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

export default TeacherTestsPanel;
