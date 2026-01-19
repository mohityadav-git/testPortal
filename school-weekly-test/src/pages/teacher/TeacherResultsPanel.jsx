import React from "react";

function TeacherResultsPanel({
  isResultsLoading,
  resultsError,
  filteredResults,
  selectedResult,
  setSelectedResult,
  loadResults,
}) {
  const parseAnswers = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const downloadAnswerSheet = (row) => {
    if (!row) return;
    const answers = parseAnswers(row.answers);
    const header = [
      `Student: ${row.studentName || "-"}`,
      `Class: ${row.className || "-"}`,
      `Subject: ${row.subject || "-"}`,
      `Score: ${row.score ?? "-"} / ${row.outOf ?? "-"}`,
      `Submitted: ${row.submittedAt ? String(row.submittedAt) : "-"}`,
      "",
    ];
    const body = answers.length
      ? answers.map((a, idx) => {
          const qText = a.question || a.QuestionText || "-";
          const selectedIndex =
            a.selectedIndex !== undefined && a.selectedIndex !== null ? a.selectedIndex : "-";
          const selectedText = a.selectedText ? ` (${a.selectedText})` : "";
          const correctIndex =
            a.correctIndex !== undefined && a.correctIndex !== null ? a.correctIndex : "-";
          const options = Array.isArray(a.options) ? a.options : [];
          const optionLines = options.length
            ? options.map((opt, optIdx) => {
                const label = typeof opt === "string" ? opt : opt.text || opt.imageUrl || "-";
                const selectedMark = optIdx === a.selectedIndex ? " [selected]" : "";
                const correctMark = optIdx === a.correctIndex ? " [correct]" : "";
                return `  ${optIdx + 1}: ${label}${selectedMark}${correctMark}`;
              })
            : ["  (no options recorded)"];
          return [
            `Q${idx + 1}: ${qText}`,
            ...optionLines,
            `Selected: ${selectedIndex}${selectedText}`,
            `Correct: ${correctIndex}`,
            `Marks: ${a.marks ?? "-"}`,
            "",
          ].join("\n");
        })
      : ["No answers recorded."];
    const blob = new Blob([header.join("\n") + body.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(row.studentName || "student").replace(/\s+/g, "_")}_${(row.subject || "answers").replace(/\s+/g, "_")}_answers.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Student results</div>
          <div className="section-sub">Latest submissions</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadResults}>
          Refresh
        </button>
      </div>
      {isResultsLoading ? (
        <div className="section-sub">Loading results...</div>
      ) : resultsError ? (
        <div className="section-sub" style={{ color: "#c23" }}>{resultsError}</div>
      ) : filteredResults.length === 0 ? (
        <div className="section-sub">No results yet.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Out of</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(selectedResult ? [selectedResult] : filteredResults).map((r) => (
              <tr key={`${r.id}-${r.subject}`}>
                <td>{r.studentName}</td>
                <td>{r.className}</td>
                <td>{r.subject}</td>
                <td>{r.score}</td>
                <td>{r.outOf}</td>
                <td>{r.submittedAt ? String(r.submittedAt).slice(0, 10) : "-"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelectedResult(r)}
                    style={{ marginRight: 6 }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedResult && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="section-header">
            <div>
              <div className="section-title">
                Answer sheet: {selectedResult.studentName || "Student"}
              </div>
              <div className="section-sub">
                {selectedResult.subject} ú {selectedResult.className} ú{" "}
                {selectedResult.submittedAt ? String(selectedResult.submittedAt).slice(0, 10) : "-"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => downloadAnswerSheet(selectedResult)}
              >
                Download answers
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedResult(null)}
              >
                Close
              </button>
            </div>
          </div>
          {parseAnswers(selectedResult.answers).length === 0 ? (
            <div className="section-sub">No answers recorded for this test.</div>
          ) : (
            <ul className="question-list">
              {parseAnswers(selectedResult.answers).map((a, idx) => (
                <li key={`${selectedResult.id}-ans-${idx}`} style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontWeight: 700 }}>Q{idx + 1}: {a.question || a.QuestionText || "-"}</div>
                  {Array.isArray(a.options) && a.options.length > 0 ? (
                    <ul className="question-list" style={{ margin: 0 }}>
                      {a.options.map((opt, optIdx) => {
                        const label = typeof opt === "string" ? opt : opt.text || opt.imageUrl || "-";
                        const isSelected = optIdx === a.selectedIndex;
                        const isCorrect = optIdx === a.correctIndex;
                        return (
                          <li
                            key={`${selectedResult.id}-ans-${idx}-opt-${optIdx}`}
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              fontWeight: isSelected ? 700 : 600,
                              color: isSelected ? "#0f172a" : "#374151",
                            }}
                          >
                            <span>{optIdx + 1}.</span>
                            <span>{label}</span>
                            {isSelected && <span className="section-sub">(selected)</span>}
                            {!isSelected && isCorrect && <span className="section-sub">(correct)</span>}
                            {isSelected && isCorrect && <span className="section-sub">(correct)</span>}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="section-sub">Options not recorded.</div>
                  )}
                  <div className="section-sub">
                    Selected:{" "}
                    {a.selectedIndex !== undefined && a.selectedIndex !== null ? a.selectedIndex : "-"}
                    {a.selectedText ? ` (${a.selectedText})` : ""}
                  </div>
                  <div className="section-sub">
                    Correct:{" "}
                    {a.correctIndex !== undefined && a.correctIndex !== null ? a.correctIndex : "-"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default TeacherResultsPanel;
