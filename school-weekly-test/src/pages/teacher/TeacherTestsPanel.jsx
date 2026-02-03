import React from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { toDangerousHtml } from "../../utils/textFormat";
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
  filteredQuestions,
  isQuestionsLoading,
  toggleQuestionSelection,
  handleCreateTest,
  loadTests,
  isTestsLoading,
  testsError,
  filteredTests,
}) {
  const [questionSearch, setQuestionSearch] = React.useState("");
  const [bankSubjectFilter, setBankSubjectFilter] = React.useState("all");
  const [bankDifficultyFilter, setBankDifficultyFilter] = React.useState("all");
  const [bankSectionFilter, setBankSectionFilter] = React.useState("all");

  const availableSubjects = React.useMemo(() => {
    const values = Array.from(
      new Set((eligibleQuestions || []).map((q) => (q.subject || "").trim()).filter(Boolean))
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [eligibleQuestions]);

  const availableDifficulties = React.useMemo(() => {
    const values = Array.from(
      new Set((eligibleQuestions || []).map((q) => (q.difficulty || "").trim()).filter(Boolean))
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [eligibleQuestions]);

  const availableSections = React.useMemo(() => {
    const values = Array.from(
      new Set((eligibleQuestions || []).map((q) => (q.section || "").trim()).filter(Boolean))
    );
    return values.sort((a, b) => a.localeCompare(b));
  }, [eligibleQuestions]);

  const normalizedSearch = questionSearch.trim().toLowerCase();
  const visibleQuestions = React.useMemo(() => {
    return eligibleQuestions.filter((q) => {
      if (bankSubjectFilter !== "all" && (q.subject || "").trim() !== bankSubjectFilter) {
        return false;
      }
      if (bankDifficultyFilter !== "all" && (q.difficulty || "").trim() !== bankDifficultyFilter) {
        return false;
      }
      if (bankSectionFilter !== "all" && (q.section || "").trim() !== bankSectionFilter) {
        return false;
      }
      if (!normalizedSearch) return true;
      const haystack = [q.questionText, q.subject, q.difficulty, q.className, q.section]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [
    eligibleQuestions,
    bankSubjectFilter,
    bankDifficultyFilter,
    bankSectionFilter,
    normalizedSearch,
  ]);
  const questionLookup = React.useMemo(() => {
    const pairs = Array.isArray(filteredQuestions)
      ? filteredQuestions.map((q) => [String(q.id), q])
      : [];
    return new Map(pairs);
  }, [filteredQuestions]);

  const stripTokens = (value) =>
    String(value || "")
      .replace(/\*\*/g, "")
      .replace(/__/g, "");

  const downloadTestDocx = async (test) => {
    if (!test) return;
    const blocks = [];
    blocks.push(new Paragraph({ children: [new TextRun({ text: "Test Details", bold: true })] }));
    blocks.push(new Paragraph(`Subject: ${test.subject || "-"}`));
    blocks.push(new Paragraph(`Class: ${test.className || "-"}`));
    blocks.push(new Paragraph(`Date: ${test.date || "-"}`));
    blocks.push(new Paragraph(`Time: ${test.time || "-"}`));
    blocks.push(new Paragraph(`Duration: ${test.durationMinutes || "-"} min`));
    blocks.push(new Paragraph(`Difficulty: ${test.difficulty || "-"}`));
    blocks.push(new Paragraph(`Picking: ${test.shuffleQuestions ? "Random" : "Manual"}`));
    blocks.push(new Paragraph(" "));
    blocks.push(new Paragraph({ children: [new TextRun({ text: "Questions", bold: true })] }));

    const ids = Array.isArray(test.questionIds) ? test.questionIds : [];
    if (!ids.length) {
      blocks.push(new Paragraph("Question list is unavailable for random picking."));
    } else {
      ids.forEach((id, index) => {
        const q = questionLookup.get(String(id));
        const options = Array.isArray(q?.options) ? q.options : [];
        blocks.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${stripTokens(q?.questionText || `Question ${index + 1}`)}`,
              }),
            ],
          })
        );
        options.forEach((opt, optIndex) => {
          const label = String.fromCharCode(65 + optIndex);
          const text = stripTokens(opt?.text || "");
          if (text) {
            blocks.push(new Paragraph(`   ${label}) ${text}`));
          }
        });
        if (q?.marks) {
          blocks.push(new Paragraph(`   Marks: ${q.marks}`));
        }
        blocks.push(new Paragraph(" "));
      });
    }

    const doc = new Document({
      sections: [{ children: blocks }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const nameBase = `${(test.subject || "test").replace(/\s+/g, "_")}_${(test.className || "class").replace(/\s+/g, "_")}`;
    link.href = url;
    link.download = `${nameBase}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
            <label>
              <span>Difficulty</span>
              <select value={testDifficulty} onChange={(e) => setTestDifficulty(e.target.value)}>
                {difficultyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {questionPicking === "manual" && (
                <div className="section-sub">Applies to the created test (question bank filters are below).</div>
              )}
            </label>
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
                  <div className="section-sub">
                    Choose from your question bank with subject, difficulty, and section filters
                  </div>
                </div>
                <div className="section-sub">Selected: {selectedQuestionIds.length}</div>
              </div>
              {isQuestionsLoading ? (
                <div className="section-sub">Loading questions...</div>
              ) : eligibleQuestions.length === 0 ? (
                <div className="section-sub">No questions found in your question bank.</div>
              ) : (
                <>
                  <div className="form-grid" style={{ marginBottom: 10 }}>
                    <label>
                      <span>Filter subject</span>
                      <select
                        value={bankSubjectFilter}
                        onChange={(e) => setBankSubjectFilter(e.target.value)}
                      >
                        <option value="all">All subjects</option>
                        {availableSubjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Filter difficulty</span>
                      <select
                        value={bankDifficultyFilter}
                        onChange={(e) => setBankDifficultyFilter(e.target.value)}
                      >
                        <option value="all">All levels</option>
                        {availableDifficulties.map((difficulty) => (
                          <option key={difficulty} value={difficulty}>
                            {difficulty}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Filter section</span>
                      <select
                        value={bankSectionFilter}
                        onChange={(e) => setBankSectionFilter(e.target.value)}
                      >
                        <option value="all">All sections</option>
                        {availableSections.map((section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      className="question-search-input"
                      placeholder="Search questions..."
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                    />
                  </div>
                  {visibleQuestions.length === 0 ? (
                    <div className="section-sub">No questions match your search.</div>
                  ) : (
                    <ul className="question-list">
                      {visibleQuestions.map((q) => (
                        <li key={q.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <input
                            type="checkbox"
                            checked={selectedQuestionIds.includes(q.id)}
                            onChange={() => toggleQuestionSelection(q.id)}
                            style={{ marginTop: 4 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{ fontWeight: 700 }}
                              dangerouslySetInnerHTML={toDangerousHtml(q.questionText)}
                            />
                            <div className="section-sub">
                              {q.subject} - {q.className} - {q.difficulty || "-"}
                              {q.section ? ` - ${q.section}` : ""} - {q.marks || 1} marks
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
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
                  <div className="table-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => shareTestWhatsApp(t)}
                    >
                      Share
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => downloadTestDocx(t)}
                    >
                      Download
                    </button>
                  </div>
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
