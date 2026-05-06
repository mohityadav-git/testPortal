import React from "react";
import { jsPDF } from "jspdf";
import { toDangerousHtml } from "../../utils/textFormat";
import schoolLogo from "../../assets/saraswati-maa.jpg";
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
  handleDeleteTest,
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

  const downloadTestPdf = async (test) => {
    if (!test) return;
    
    // Load logo for watermark
    const imgObj = new Image();
    imgObj.src = schoolLogo;
    await new Promise((resolve) => {
      imgObj.onload = resolve;
      imgObj.onerror = resolve;
    });

    const doc = new jsPDF();
    
    const addWatermark = () => {
      try {
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.addImage(imgObj, "JPEG", 55, 100, 100, 100);
        doc.setGState(new doc.GState({ opacity: 1.0 }));
      } catch (e) {
        // Fallback if GState/addImage fails
      }
    };

    let yPos = 20;
    addWatermark();
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MDDM Inter College", 105, yPos, { align: "center" });
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Class: ${test.className || "-"}`, 105, yPos, { align: "center" });
    yPos += 7;
    doc.text(`Subject: ${test.subject || "-"}`, 105, yPos, { align: "center" });
    yPos += 12;

    // Student Details
    doc.setFontSize(11);
    doc.text("Student Name: ____________________________", 14, yPos);
    doc.text("Roll Number: ______________", 120, yPos);
    yPos += 10;
    
    // Marks
    const ids = Array.isArray(test.questionIds) ? test.questionIds : [];
    let totalMarks = 0;
    ids.forEach(id => {
      const q = questionLookup.get(String(id));
      if (q && q.marks) totalMarks += Number(q.marks);
    });
    
    doc.text(`Total Marks: ${totalMarks}`, 14, yPos);
    doc.text("Obtained Marks: ______________", 120, yPos);
    yPos += 10;
    
    // Divider
    doc.setLineWidth(0.5);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;
    
    // Questions
    if (!ids.length) {
      doc.text("Question list is unavailable for random picking.", 14, yPos);
    } else {
      ids.forEach((id, index) => {
        const q = questionLookup.get(String(id));
        if (!q) return;
        
        // Add page if near bottom
        if (yPos > 270) {
          doc.addPage();
          addWatermark();
          yPos = 20;
        }
        
        const qText = `${index + 1}. ${stripTokens(q.questionText || `Question ${index + 1}`)}`;
        const splitText = doc.splitTextToSize(qText, 160); // Width 160 to leave room for marks on the right
        doc.setFont("helvetica", "bold");
        doc.text(splitText, 14, yPos);
        
        if (q.marks) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.text(`[${q.marks} Marks]`, 180, yPos);
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
        } else {
          doc.setFont("helvetica", "normal");
        }
        
        yPos += splitText.length * 6;
        const options = Array.isArray(q.options) ? q.options : [];
        const isSubjective = options.length === 1 && options[0]?.isSubjective;
        
        if (isSubjective) {
           if (yPos > 250) {
             doc.addPage();
             addWatermark();
             yPos = 20;
           }
           yPos += 8;
           doc.setDrawColor(200, 200, 200);
           doc.line(20, yPos, 190, yPos);
           yPos += 10;
           doc.line(20, yPos, 190, yPos);
           yPos += 10;
           doc.line(20, yPos, 190, yPos);
           doc.setDrawColor(0, 0, 0); // reset
        } else {
          options.forEach((opt, optIndex) => {
            const label = String.fromCharCode(65 + optIndex);
            const text = stripTokens(opt?.text || "");
            if (text) {
               if (yPos > 280) {
                 doc.addPage();
                 addWatermark();
                 yPos = 20;
               }
               const splitOpt = doc.splitTextToSize(`   ${label}) ${text}`, 170);
               doc.text(splitOpt, 14, yPos);
               yPos += splitOpt.length * 6;
            }
          });
        }
        yPos += 4; // Space between questions
      });
    }
    
    const nameBase = `${(test.subject || "test").replace(/\s+/g, "_")}_${(test.className || "class").replace(/\s+/g, "_")}`;
    doc.save(`${nameBase}.pdf`);
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
                      onClick={() => downloadTestPdf(t)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDeleteTest(t.id)}
                      style={{ color: "#ef4444", borderColor: "#ef4444" }}
                    >
                      Delete
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
