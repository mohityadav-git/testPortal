import React from "react";
import { formatRichText, toDangerousHtml } from "../../utils/textFormat";
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
  editingQuestionId,
  existingQuestionImageUrls,
  existingOptionImageUrls,
  isQuestionImageUploading,
  handleCreateQuestion,
  handleUpdateQuestion,
  loadQuestions,
  isQuestionsLoading,
  questionsError,
  filteredQuestions,
  handleDeleteQuestion,
  startEditQuestion,
  cancelEditQuestion,
  isAdmin,
  teacherClass,
}) {
  const [previewingQuestion, setPreviewingQuestion] = React.useState(null);
  const isEditing = Boolean(editingQuestionId);
  const existingQuestionCount = Array.isArray(existingQuestionImageUrls)
    ? existingQuestionImageUrls.length
    : 0;
  const isMathSubject = /math/i.test(questionSubject || "");
  const [activeTab, setActiveTab] = React.useState("add");
  const [activeField, setActiveField] = React.useState("questionText");
  const questionEditorRef = React.useRef(null);
  const optionARef = React.useRef(null);
  const optionBRef = React.useRef(null);
  const optionCRef = React.useRef(null);
  const optionDRef = React.useRef(null);
  const [isBoldActive, setIsBoldActive] = React.useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = React.useState(false);
  const lastAppliedTokensRef = React.useRef("");
  const mathSymbols = [
    "±",
    "×",
    "÷",
    "√",
    "π",
    "θ",
    "α",
    "β",
    "γ",
    "Δ",
    "∑",
    "∏",
    "∞",
    "≠",
    "≤",
    "≥",
    "≈",
    "°",
    "∠",
    "∥",
    "⊥",
    "∈",
    "∉",
    "∩",
    "∪",
    "⊂",
    "⊃",
    "⊆",
    "⊇",
    "→",
    "←",
    "↔",
    "²",
    "³",
    "½",
    "¼",
    "¾",
  ];

  const htmlToTokens = (html) => {
    if (typeof document === "undefined") return html || "";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html || "";
    const serialize = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue || "";
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }
      const tag = node.tagName.toLowerCase();
      if (tag === "br") return "\n";
      const inner = Array.from(node.childNodes).map(serialize).join("");
      if (tag === "strong" || tag === "b") return `**${inner}**`;
      if (tag === "u") return `__${inner}__`;
      return inner;
    };
    return Array.from(wrapper.childNodes).map(serialize).join("");
  };

  const syncQuestionFromEditor = () => {
    const editor = questionEditorRef.current;
    if (!editor) return;
    const tokens = htmlToTokens(editor.innerHTML);
    lastAppliedTokensRef.current = tokens;
    setQuestionText(tokens);
  };

  const updateActiveStates = () => {
    if (typeof document === "undefined") return;
    try {
      setIsBoldActive(Boolean(document.queryCommandState("bold")));
      setIsUnderlineActive(Boolean(document.queryCommandState("underline")));
    } catch (err) {
      // Ignore unsupported browser command states.
    }
  };

  React.useEffect(() => {
    const editor = questionEditorRef.current;
    if (!editor) return;
    const tokens = questionText || "";
    if (tokens === lastAppliedTokensRef.current) return;
    editor.innerHTML = formatRichText(tokens);
    lastAppliedTokensRef.current = tokens;
  }, [questionText]);

  React.useEffect(() => {
    const handleSelection = () => updateActiveStates();
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const insertSymbol = (symbol) => {
    if (!symbol) return;
    switch (activeField) {
      case "optionA":
        setOptionA((prev) => `${prev}${symbol}`);
        break;
      case "optionB":
        setOptionB((prev) => `${prev}${symbol}`);
        break;
      case "optionC":
        setOptionC((prev) => `${prev}${symbol}`);
        break;
      case "optionD":
        setOptionD((prev) => `${prev}${symbol}`);
        break;
      default:
        if (questionEditorRef.current && typeof document !== "undefined") {
          questionEditorRef.current.focus();
          document.execCommand("insertText", false, symbol);
          syncQuestionFromEditor();
        } else {
          setQuestionText((prev) => `${prev}${symbol}`);
        }
    }
  };

  const toggleInlineStyle = (command) => {
    const editor = questionEditorRef.current;
    if (!editor || typeof document === "undefined") return;
    editor.focus();
    document.execCommand(command, false);
    syncQuestionFromEditor();
    updateActiveStates();
  };

  const questionEditorStyles = {
    width: "100%",
    minHeight: 40,
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "10px 12px",
    marginTop: 6,
    outline: "none",
    background: "#fff",
  };

  const activeButtonStyle = {
    background: "var(--turquoise)",
    color: "#fff",
    borderColor: "var(--turquoise)",
  };
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <div className="section-title">Question bank</div>
          <div className="section-sub">
            {isEditing ? "Editing selected question" : "Create and review questions"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "add" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setActiveTab("add")}
          >
            {isEditing ? "Edit Question" : "Add Question"}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === "view" ? "btn-primary" : "btn-outline"}`}
            onClick={() => {
              setActiveTab("view");
              loadQuestions();
            }}
          >
            View Questions
          </button>
        </div>
      </div>
      
      {activeTab === "add" && (
      <form className="form-grid" onSubmit={isEditing ? handleUpdateQuestion : handleCreateQuestion}>
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
          <select 
            value={questionClass} 
            onChange={(e) => setQuestionClass(e.target.value)}
            disabled={!isAdmin && teacherClass}
          >
            {!isAdmin && teacherClass ? (
              <option value={teacherClass}>{teacherClass}</option>
            ) : (
              <>
                <option value="">Select class</option>
                {classOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          <span>Question</span>
          <div
            ref={questionEditorRef}
            role="textbox"
            aria-label="Question"
            aria-multiline="false"
            contentEditable
            suppressContentEditableWarning
            onInput={syncQuestionFromEditor}
            onFocus={() => setActiveField("questionText")}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            style={questionEditorStyles}
          />
        </label>
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => toggleInlineStyle("bold")}
            style={isBoldActive ? activeButtonStyle : undefined}
          >
            Bold
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => toggleInlineStyle("underline")}
            style={isUnderlineActive ? activeButtonStyle : undefined}
          >
            Underline
          </button>
          <span className="section-sub">Select text and click a style.</span>
        </div>
        {isMathSubject && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="section-sub" style={{ marginBottom: 6 }}>
              Math keyboard (click to insert)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {mathSymbols.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => insertSymbol(symbol)}
                  aria-label={`Insert ${symbol}`}
                  style={{ minWidth: 32, padding: "4px 8px" }}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        )}
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
        {isEditing && existingQuestionCount > 0 && (
          <div className="section-sub" style={{ gridColumn: "1 / -1" }}>
            Existing question images: {existingQuestionCount} (kept unless you upload new images)
          </div>
        )}
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
            <input
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              onFocus={() => setActiveField("optionA")}
              ref={optionARef}
            />
          </label>
          <label>
            <span>Option A image</span>
            <input type="file" accept="image/*" onChange={(e) => setOptionAImage(e.target.files?.[0] || null)} />
            {isEditing && existingOptionImageUrls?.A && !optionA && (
              <span className="section-sub">Existing image attached</span>
            )}
          </label>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <label>
            <span>Option B</span>
            <input
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              onFocus={() => setActiveField("optionB")}
              ref={optionBRef}
            />
          </label>
          <label>
            <span>Option B image</span>
            <input type="file" accept="image/*" onChange={(e) => setOptionBImage(e.target.files?.[0] || null)} />
            {isEditing && existingOptionImageUrls?.B && !optionB && (
              <span className="section-sub">Existing image attached</span>
            )}
          </label>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <label>
            <span>Option C</span>
            <input
              value={optionC}
              onChange={(e) => setOptionC(e.target.value)}
              onFocus={() => setActiveField("optionC")}
              ref={optionCRef}
            />
          </label>
          <label>
            <span>Option C image</span>
            <input type="file" accept="image/*" onChange={(e) => setOptionCImage(e.target.files?.[0] || null)} />
            {isEditing && existingOptionImageUrls?.C && !optionC && (
              <span className="section-sub">Existing image attached</span>
            )}
          </label>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <label>
            <span>Option D</span>
            <input
              value={optionD}
              onChange={(e) => setOptionD(e.target.value)}
              onFocus={() => setActiveField("optionD")}
              ref={optionDRef}
            />
          </label>
          <label>
            <span>Option D image</span>
            <input type="file" accept="image/*" onChange={(e) => setOptionDImage(e.target.files?.[0] || null)} />
            {isEditing && existingOptionImageUrls?.D && !optionD && (
              <span className="section-sub">Existing image attached</span>
            )}
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isQuestionImageUploading}>
              {isQuestionImageUploading
                ? "Uploading images..."
                : isEditing
                  ? "Update question"
                  : "Save question"}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-outline btn-sm" onClick={cancelEditQuestion}>
                Cancel edit
              </button>
            )}
          </div>
        </div>
      </form>
      )}

      {activeTab === "view" && (
        <>
          <div className="section-header" style={{ marginTop: 16 }}>
            <div>
              <div className="section-title">Saved questions</div>
              <div className="section-sub">Latest questions for your class</div>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadQuestions}>
              Refresh
            </button>
          </div>
      {isQuestionsLoading ? (
        <div className="section-sub" style={{ padding: "20px 0" }}>Loading questions...</div>
      ) : questionsError ? (
        <div className="section-sub" style={{ color: "var(--danger)", padding: "20px 0" }}>{questionsError}</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="section-sub" style={{ padding: "20px 0" }}>No questions saved.</div>
      ) : (
        <div className="table-container">
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
                <td 
                  style={{ minWidth: 200, cursor: "pointer" }}
                  onClick={() => setPreviewingQuestion(q)}
                  title="Click to preview full question"
                >
                  <span dangerouslySetInnerHTML={toDangerousHtml(q.questionText)} />
                  {q.imageUrl && (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(Array.isArray(q.imageUrl) 
                        ? q.imageUrl 
                        : (() => { try { const p = JSON.parse(q.imageUrl); return Array.isArray(p) ? p : [q.imageUrl]; } catch { return [q.imageUrl]; } })()
                      ).filter(Boolean).map((url, idx) => (
                        <img 
                          key={idx} 
                          src={url.startsWith("http") ? url : `http://localhost:5000${url}`} 
                          alt={`Q-${idx}`} 
                          style={{ height: 32, width: 32, objectFit: "cover", borderRadius: 4, border: "1px solid #e5e7eb" }} 
                        />
                      ))}
                    </div>
                  )}
                </td>
                <td>{q.subject}</td>
                <td>{q.className}</td>
                <td>{q.section || "-"}</td>
                <td>{q.marks}</td>
                <td>{q.difficulty}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      startEditQuestion(q);
                      setActiveTab("add");
                    }}
                    style={{ marginRight: 6 }}
                  >
                    Edit
                  </button>
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
        </div>
          )}
        </>
      )}

      {/* Full Question Preview Modal */}
      {previewingQuestion && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }} onClick={() => setPreviewingQuestion(null)}>
          <div style={{
            background: "#fff",
            width: "100%",
            maxWidth: 700,
            maxHeight: "90vh",
            borderRadius: 16,
            overflowY: "auto",
            position: "relative",
            padding: 24,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }} onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setPreviewingQuestion(null)}
              style={{ position: "absolute", top: 16, right: 16, border: "none", background: "none", fontSize: 24, cursor: "pointer", color: "#9ca3af" }}
            >✕</button>
            
            <div className="section-sub" style={{ marginBottom: 12, display: "flex", gap: 12 }}>
              <span>{previewingQuestion.subject}</span>
              <span>•</span>
              <span>{previewingQuestion.className}</span>
              <span>•</span>
              <span>{previewingQuestion.difficulty}</span>
            </div>

            <div style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
              <div dangerouslySetInnerHTML={toDangerousHtml(previewingQuestion.questionText)} />
            </div>

            {/* Question Images */}
            {previewingQuestion.imageUrl && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                {(Array.isArray(previewingQuestion.imageUrl) 
                  ? previewingQuestion.imageUrl 
                  : (() => { try { const p = JSON.parse(previewingQuestion.imageUrl); return Array.isArray(p) ? p : [previewingQuestion.imageUrl]; } catch { return [previewingQuestion.imageUrl]; } })()
                ).filter(Boolean).map((url, idx) => (
                  <img 
                    key={idx} 
                    src={url.startsWith("http") ? url : `http://localhost:5000${url}`} 
                    alt={`Question image ${idx + 1}`} 
                    style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, border: "1px solid #e5e7eb" }} 
                  />
                ))}
              </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              {(Array.isArray(previewingQuestion.options) ? previewingQuestion.options : []).map((opt, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isCorrect = idx === Number(previewingQuestion.correctIndex);
                return (
                  <div key={idx} style={{ 
                    padding: 16, 
                    borderRadius: 12, 
                    border: isCorrect ? "2px solid #10b981" : "1px solid #e5e7eb",
                    background: isCorrect ? "#f0fdf4" : "#fff"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: opt.imageUrl ? 8 : 0 }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <strong style={{ color: isCorrect ? "#059669" : "#6b7280" }}>{label}</strong>
                        <div dangerouslySetInnerHTML={toDangerousHtml(typeof opt === 'object' ? opt.text : opt)} />
                      </div>
                      {isCorrect && <span style={{ color: "#059669", fontSize: 12, fontWeight: 700 }}>CORRECT ANSWER</span>}
                    </div>
                    {opt.imageUrl && (
                      <img 
                        src={opt.imageUrl.startsWith("http") ? opt.imageUrl : `http://localhost:5000${opt.imageUrl}`} 
                        alt={`Option ${label}`} 
                        style={{ maxWidth: 200, maxHeight: 150, borderRadius: 6, marginTop: 8 }} 
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline" onClick={() => setPreviewingQuestion(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherQuestionsPanel;
