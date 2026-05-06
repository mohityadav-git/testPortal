import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { toDangerousHtml } from "../../utils/textFormat";
import schoolLogo from "../../assets/saraswati-maa.jpg";

function TeacherResultsPanel({
  isResultsLoading,
  resultsError,
  filteredResults,
  selectedResult,
  setSelectedResult,
  loadResults,
  students,
}) {
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const ASSET_BASE = API_BASE.replace(/\/api\/?$/, "");

  const [filterDate, setFilterDate] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStudent, setFilterStudent] = useState("");

  const displayResults = filteredResults.filter((r) => {
    if (filterDate && r.submittedAt && !String(r.submittedAt).startsWith(filterDate)) return false;
    if (filterClass && (!r.className || !r.className.toLowerCase().includes(filterClass.toLowerCase()))) return false;
    if (filterSubject && (!r.subject || !r.subject.toLowerCase().includes(filterSubject.toLowerCase()))) return false;
    if (filterStudent && (!r.studentName || !r.studentName.toLowerCase().includes(filterStudent.toLowerCase()))) return false;
    return true;
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
      {!selectedResult && (
        <div className="form-grid" style={{ paddingBottom: 16, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
          <label>
            <span>Filter by Date</span>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </label>
          <label>
            <span>Filter by Class</span>
            <input type="text" placeholder="All classes..." value={filterClass} onChange={(e) => setFilterClass(e.target.value)} />
          </label>
          <label>
            <span>Filter by Subject</span>
            <input type="text" placeholder="All subjects..." value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} />
          </label>
          <label>
            <span>Filter by Student</span>
            <input type="text" placeholder="All students..." value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} />
          </label>
        </div>
      )}
      {isResultsLoading ? (
        <div className="section-sub">Loading results...</div>
      ) : resultsError ? (
        <div className="section-sub" style={{ color: "#c23" }}>{resultsError}</div>
      ) : displayResults.length === 0 ? (
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
            {(selectedResult ? [selectedResult] : displayResults).map((r) => (
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
                  <div style={{ fontWeight: 700 }}>
                    Q{idx + 1}:{" "}
                    <span
                      dangerouslySetInnerHTML={toDangerousHtml(a.question || a.QuestionText || "-")}
                    />
                  </div>
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
                            <span dangerouslySetInnerHTML={toDangerousHtml(label)} />
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
                    {a.selectedIndex !== undefined && a.selectedIndex !== null ? a.selectedIndex + 1 : "-"}
                    {a.selectedText ? ` (${a.selectedText})` : ""}
                  </div>
                  <div className="section-sub">
                    Correct:{" "}
                    {a.correctIndex !== undefined && a.correctIndex !== null ? a.correctIndex + 1 : "-"}
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
