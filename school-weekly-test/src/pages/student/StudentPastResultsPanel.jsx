import React, { useState } from "react";
import { toDangerousHtml } from "../../utils/textFormat";

function StudentPastResultsPanel({
  pastTests,
  resultsError,
}) {
  const [selectedResult, setSelectedResult] = useState(null);

  if (selectedResult) {
    const { subject, score, outOf, submittedAt, answers } = selectedResult;
    return (
      <div className="card">
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedResult(null)} style={{ marginBottom: 10 }}>
              &larr; Back to Results
            </button>
            <div className="section-title">{subject} - Detailed Review</div>
            <div className="section-sub">
              Submitted: {submittedAt ? new Date(submittedAt).toLocaleString() : "Unknown"} | Score: {score}/{outOf}
            </div>
          </div>
        </div>
        
        <div style={{ display: "grid", gap: 16 }}>
          {!answers || answers.length === 0 ? (
            <p className="section-sub">Detailed answers are not available for this test.</p>
          ) : (
            answers.map((ans, idx) => {
              const isCorrect = ans.selectedIndex === ans.correctIndex;
              
              const optionImageStyle = {
                width: 100,
                height: 100,
                objectFit: "contain",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                display: "block",
                marginTop: 6
              };

              const renderOption = (opt) => {
                if (opt && typeof opt === "object") {
                  return (
                    <div>
                      {opt.text && <span dangerouslySetInnerHTML={toDangerousHtml(opt.text)} />}
                      {opt.imageUrl && <img src={opt.imageUrl} alt="Option" style={optionImageStyle} />}
                    </div>
                  );
                }
                return <span dangerouslySetInnerHTML={toDangerousHtml(opt)} />;
              };
              
              return (
                <div key={idx} style={{ border: "1px solid #e6e9ef", borderRadius: 12, padding: 16, background: isCorrect ? "#f4fdf8" : "#fff5f5" }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: "#1d2b1f" }}>
                    Q{idx + 1}. <span dangerouslySetInnerHTML={toDangerousHtml(ans.question)} />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 13, color: "#6b7280", minWidth: 100, marginTop: 2 }}>Your Answer:</span>
                      <div style={{ fontWeight: 600, color: isCorrect ? "#10b981" : "#ef4444", flex: 1 }}>
                        {ans.selectedIndex !== undefined && ans.options && ans.options[ans.selectedIndex] !== undefined
                          ? renderOption(ans.options[ans.selectedIndex])
                          : "Not answered"}
                        <div style={{ marginTop: 4 }}>
                          {isCorrect && <span>✅ Correct</span>}
                          {!isCorrect && <span>❌ Incorrect</span>}
                        </div>
                      </div>
                    </div>
                    
                    {!isCorrect && (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                        <span style={{ fontSize: 13, color: "#6b7280", minWidth: 100, marginTop: 2 }}>Correct Answer:</span>
                        <div style={{ fontWeight: 600, color: "#10b981", flex: 1 }}>
                          {ans.correctIndex !== undefined && ans.options && ans.options[ans.correctIndex] !== undefined
                            ? renderOption(ans.options[ans.correctIndex])
                            : "Unknown"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="section-title">Past Results</div>
          <div className="section-sub">Scores and percentages of submitted tests</div>
        </div>
      </div>
      
      {resultsError && pastTests.length === 0 && (
        <p className="section-sub" style={{ color: "#c23" }}>{resultsError}</p>
      )}
      {pastTests.length === 0 ? (
        <p>No past test records yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pastTests.map((test) => (
                <tr key={test.id}>
                  <td>{test.subject}</td>
                  <td>{test.submittedAt ? new Date(test.submittedAt).toLocaleString() : ""}</td>
                  <td>
                    {test.score}/{test.outOf}
                  </td>
                  <td>
                    {test.outOf ? ((test.score / test.outOf) * 100).toFixed(1) : "0.0"}%
                  </td>
                  <td>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedResult(test)}
                    >
                      View Answers
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentPastResultsPanel;
