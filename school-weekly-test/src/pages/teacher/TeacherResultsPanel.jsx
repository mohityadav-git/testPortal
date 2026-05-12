import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { toDangerousHtml } from "../../utils/textFormat";
import schoolLogo from "../../assets/saraswati-maa.jpg";

function TeacherResultsPanel({
  isResultsLoading,
  resultsError,
  filteredResults,
  filteredTests,
  selectedResult,
  setSelectedResult,
  loadResults,
  students,
}) {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const ASSET_BASE = API_BASE.replace(/\/api\/?$/, "");

  // View state: null = test list, string testId = student list for that test, result = answer sheet
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");


  // Group results by testId
  const resultsByTestId = {};
  filteredResults.forEach((r) => {
    const tid = String(r.testId || r.TestId || "unknown");
    if (!resultsByTestId[tid]) resultsByTestId[tid] = [];
    resultsByTestId[tid].push(r);
  });

  // Get the selected test object
  const selectedTest = filteredTests?.find(
    (t) => String(t.id || t.Id) === String(selectedTestId)
  );

  // Results for the selected test
  const testResults = selectedTestId ? (resultsByTestId[String(selectedTestId)] || []) : [];
  const filteredTestResults = testResults.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (r.studentName || "").toLowerCase().includes(q);
  });

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

  const stripTokens = (value) =>
    String(value || "")
      .replace(/\*\*/g, "")
      .replace(/__/g, "");

  const resolveImageUrl = (value) => {
    const raw = typeof value === "string" ? value.trim() : "";
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
      return raw;
    }
    if (raw.startsWith("/uploads")) {
      return `${ASSET_BASE}${raw}`;
    }
    return raw;
  };

  // Convert any image URL to base64 so jsPDF can embed it
  const loadImageAsBase64 = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // Use 0.7 quality to save space
        } catch (e) {
          console.error("Canvas draw failed", e);
          resolve(null);
        }
      };
      img.onerror = (e) => {
        console.error("Image load failed", src, e);
        resolve(null);
      };
      // Add a timeout to prevent hanging
      setTimeout(() => resolve(null), 10000);
      img.src = src;
    });

  const downloadAnswerSheet = async (row) => {
    if (!row) return;
    const answers = parseAnswers(row.answers);
    
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
    doc.text(`Class: ${row.className || "-"}`, 105, yPos, { align: "center" });
    yPos += 7;
    doc.text(`Subject: ${row.subject || "-"}`, 105, yPos, { align: "center" });
    yPos += 12;

    // Student Details
    const matchedStudent = students?.find(
      (s) => s.name === row.studentName && s.className === row.className
    );
    const rollNumberToDisplay = matchedStudent?.rollNumber || "______________";

    doc.setFontSize(11);
    doc.text(`Student Name: ${row.studentName || "-"}`, 14, yPos);
    doc.text(`Roll Number: ${rollNumberToDisplay}`, 120, yPos);
    yPos += 8;
    doc.text(`Total Questions: ${answers.length}`, 14, yPos);
    yPos += 10;

    // Marks
    doc.text(`Total Marks: ${row.outOf ?? "-"}`, 14, yPos);
    doc.text(`Obtained Marks: ${row.score ?? "-"}`, 120, yPos);
    yPos += 10;

    // Divider
    doc.setLineWidth(0.5);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;

    // Questions
    if (!answers.length) {
      doc.text("No answers recorded.", 14, yPos);
    } else {
      for (const [idx, a] of answers.entries()) {
        if (yPos > 270) {
          doc.addPage();
          addWatermark();
          yPos = 20;
        }

        // Question image(s)
        let qImages = [];
        if (Array.isArray(a.imageUrls)) {
          qImages = a.imageUrls;
        } else if (a.imageUrl || a.ImageUrl) {
          qImages = [a.imageUrl || a.ImageUrl];
        }

        for (const rawSrc of qImages) {
          if (!rawSrc) continue;
          const imgSrc = resolveImageUrl(rawSrc);
          const b64 = await loadImageAsBase64(imgSrc);
          if (b64) {
            if (yPos > 240) {
              doc.addPage();
              addWatermark();
              yPos = 20;
            }
            doc.addImage(b64, "JPEG", 14, yPos, 60, 45);
            yPos += 50;
          }
        }

        const qText = `${idx + 1}. ${stripTokens(a.question || a.QuestionText || "-")}`;
        const splitText = doc.splitTextToSize(qText, 160);
        doc.setFont("helvetica", "bold");
        doc.text(splitText, 14, yPos);
        
        if (a.marks) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.text(`[${a.marks} Marks]`, 180, yPos);
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
        } else {
          doc.setFont("helvetica", "normal");
        }
        
        yPos += splitText.length * 6;

        const options = Array.isArray(a.options) ? a.options : [];
        for (const [optIdx, opt] of options.entries()) {
          const isObj = opt && typeof opt === "object";
          const imgSrc = isObj ? (opt.imageUrl || opt.ImageUrl) : null;
          const labelText = isObj ? (opt.text || "") : String(opt || "");
          const text = stripTokens(labelText);

          const prefix = `${String.fromCharCode(65 + optIdx)}) `;
          let suffix = "";
          if (optIdx === a.selectedIndex) suffix += " [SELECTED]";
          if (optIdx === a.correctIndex) suffix += " [CORRECT]";

          if (yPos > 270) {
            doc.addPage();
            addWatermark();
            yPos = 20;
          }

          // Set color for this option
          if (optIdx === a.selectedIndex && optIdx === a.correctIndex) {
            doc.setTextColor(0, 150, 0); // Solid green
          } else if (optIdx === a.selectedIndex) {
            doc.setTextColor(200, 0, 0); // Solid red
          } else if (optIdx === a.correctIndex) {
            doc.setTextColor(0, 120, 0); // Darker green
          } else {
            doc.setTextColor(0, 0, 0);
          }

          if (text || suffix) {
            doc.setFont("helvetica", "normal");
            const splitOpt = doc.splitTextToSize(`${prefix}${text}${suffix}`, 170);
            doc.text(splitOpt, 14, yPos);
            yPos += splitOpt.length * 6;
          }

          // Option image
          if (imgSrc) {
            const resolvedOptImg = resolveImageUrl(imgSrc);
            const b64 = await loadImageAsBase64(resolvedOptImg);
            if (b64) {
              if (yPos > 240) {
                doc.addPage();
                addWatermark();
                yPos = 20;
              }
              doc.addImage(b64, "JPEG", 20, yPos, 40, 30);
              yPos += 35;
            }
          }

          doc.setTextColor(0, 0, 0); // Reset color for next option
        }
        
        if (options.length === 0) {
          doc.setFontSize(10);
          doc.text(`Selected: ${a.selectedIndex !== undefined && a.selectedIndex !== null ? a.selectedIndex + 1 : "-"}`, 14, yPos);
          yPos += 5;
          doc.text(`Correct: ${a.correctIndex !== undefined && a.correctIndex !== null ? a.correctIndex + 1 : "-"}`, 14, yPos);
          yPos += 5;
          doc.setFontSize(11);
        }
        yPos += 8;
      }
    }

    const nameBase = `${(row.studentName || "student").replace(/\s+/g, "_")}_${(row.subject || "answers").replace(/\s+/g, "_")}`;
    doc.save(`${nameBase}_answers.pdf`);
  };

  // ─── LEVEL 3: Answer sheet ────────────────────────────────────────────────
  if (selectedResult) {
    return (
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">Answer sheet: {selectedResult.studentName || "Student"}</div>
            <div className="section-sub">
              {selectedResult.subject} · {selectedResult.className} ·{" "}
              {selectedResult.submittedAt ? String(selectedResult.submittedAt).slice(0, 10) : "-"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => downloadAnswerSheet(selectedResult)}>
              Download
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedResult(null)}>
              ← Back
            </button>
          </div>
        </div>
        {parseAnswers(selectedResult.answers).length === 0 ? (
          <div className="section-sub">No answers recorded for this test.</div>
        ) : (
          <ul className="question-list">
            {parseAnswers(selectedResult.answers).map((a, idx) => (
              <li key={`${selectedResult.id}-ans-${idx}`} style={{ display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 700 }}>
                  Q{idx + 1}:{" "}
                  <span dangerouslySetInnerHTML={toDangerousHtml(a.question || a.QuestionText || "-")} />
                </div>
                {/* Question Images */}
                {(a.imageUrl || a.ImageUrl) && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    {(Array.isArray(a.imageUrl || a.ImageUrl) 
                      ? (a.imageUrl || a.ImageUrl) 
                      : (() => { try { const p = JSON.parse(a.imageUrl || a.ImageUrl); return Array.isArray(p) ? p : [a.imageUrl || a.ImageUrl]; } catch { return [a.imageUrl || a.ImageUrl]; } })()
                    ).filter(Boolean).map((url, i) => (
                      <img 
                        key={i} 
                        src={url.startsWith("http") ? url : `http://localhost:5000${url}`} 
                        alt="" 
                        style={{ height: 60, borderRadius: 4, border: "1px solid #e5e7eb" }} 
                      />
                    ))}
                  </div>
                )}
                {Array.isArray(a.options) && a.options.length > 0 ? (
                  <ul className="question-list" style={{ margin: 0 }}>
                    {a.options.map((opt, optIdx) => {
                      const label = typeof opt === "string" ? opt : opt.text || opt.imageUrl || "-";
                      const isSelected = optIdx === a.selectedIndex;
                      const isCorrect = optIdx === a.correctIndex;
                      return (
                        <li key={`ans-${idx}-opt-${optIdx}`} style={{ display: "grid", gap: 4, padding: "4px 0" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: isSelected ? 700 : 600, color: isSelected ? "#0f172a" : "#374151" }}>
                            <span>{optIdx + 1}.</span>
                            <span dangerouslySetInnerHTML={toDangerousHtml(typeof opt === "string" ? opt : opt.text || "")} />
                            {isSelected && <span className="section-sub">(selected)</span>}
                            {!isSelected && isCorrect && <span className="section-sub">(correct)</span>}
                            {isSelected && isCorrect && <span className="section-sub">(correct)</span>}
                          </div>
                          {opt.imageUrl && (
                            <img 
                              src={opt.imageUrl.startsWith("http") ? opt.imageUrl : `http://localhost:5000${opt.imageUrl}`} 
                              alt="" 
                              style={{ height: 40, marginLeft: 24, borderRadius: 4, border: "1px solid #f3f4f6" }} 
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="section-sub">Options not recorded.</div>
                )}
                <div className="section-sub">
                  Selected: {a.selectedIndex != null ? a.selectedIndex + 1 : "-"}
                  {a.selectedText ? ` (${a.selectedText})` : ""}
                </div>
                <div className="section-sub">Correct: {a.correctIndex != null ? a.correctIndex + 1 : "-"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ─── LEVEL 2: Students who submitted a test ───────────────────────────────
  if (selectedTestId) {
    return (
      <div className="card">
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: 18, padding: "2px 10px" }}
              onClick={() => { setSelectedTestId(null); setSearchQuery(""); }}>
              ←
            </button>
            <div>
              <div className="section-title">{selectedTest?.subject || "Test"}</div>
              <div className="section-sub">
                {selectedTest?.date ? new Date(selectedTest.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""} · {testResults.length} submission{testResults.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={loadResults}>Refresh</button>
        </div>

        {/* Search */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }}
          />
          {searchQuery && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>

        {testResults.length === 0 ? (
          <div className="section-sub" style={{ textAlign: "center", padding: "24px 0" }}>No submissions yet for this test.</div>
        ) : filteredTestResults.length === 0 ? (
          <div className="section-sub" style={{ padding: "16px 0" }}>No students match your search.</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Submitted At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTestResults.map((r, i) => {
                  const pct = r.outOf > 0 ? Math.round((r.score / r.outOf) * 100) : 0;
                  return (
                    <tr key={r.id || i}>
                      <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.studentName}</td>
                      <td>
                        <span style={{
                          background: pct >= 60 ? "#dcfce7" : "#fee2e2",
                          color: pct >= 60 ? "#166534" : "#991b1b",
                          borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700
                        }}>
                          {r.score}/{r.outOf} ({pct}%)
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#6b7280" }}>
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleString("en-IN") : "-"}
                      </td>
                      <td>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedResult(r)}>
                          View Answers
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ─── LEVEL 1: Test list ───────────────────────────────────────────────────
  return (
    <div className="card">
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="section-title">Results</div>
          <div className="section-sub">Click a test to see who submitted it</div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadResults}>Refresh</button>
      </div>

      {isResultsLoading ? (
        <div className="section-sub" style={{ padding: "20px 0" }}>Loading results...</div>
      ) : resultsError ? (
        <div className="section-sub" style={{ color: "var(--danger)", padding: "20px 0" }}>{resultsError}</div>
      ) : !filteredTests || filteredTests.length === 0 ? (
        <div className="section-sub" style={{ padding: "20px 0" }}>No tests found.</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Submissions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((t, i) => {
                const tid = String(t.id || t.Id);
                const submissionCount = (resultsByTestId[tid] || []).length;
                const testDate = t.date ? new Date(t.date) : null;
                const today = new Date(); today.setHours(0, 0, 0, 0);
                if (testDate) testDate.setHours(0, 0, 0, 0);
                const isPast = testDate && testDate < today;
                return (
                  <tr key={tid} style={{ cursor: "pointer" }} onClick={() => { setSelectedTestId(tid); setSearchQuery(""); }}>
                    <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: "#3730a3" }}>{t.subject}</td>
                    <td style={{ fontSize: 13 }}>
                      {testDate ? testDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      <span style={{
                        marginLeft: 8, fontSize: 11, fontWeight: 600, borderRadius: 999,
                        padding: "1px 8px",
                        background: isPast ? "#fee2e2" : "#dcfce7",
                        color: isPast ? "#991b1b" : "#166534"
                      }}>
                        {isPast ? "Past" : "Upcoming"}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: submissionCount > 0 ? "#e0e7ff" : "#f3f4f6",
                        color: submissionCount > 0 ? "#3730a3" : "#6b7280",
                        borderRadius: 999, padding: "2px 12px", fontSize: 13, fontWeight: 700
                      }}>
                        {submissionCount} student{submissionCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-outline btn-sm">View →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TeacherResultsPanel;
