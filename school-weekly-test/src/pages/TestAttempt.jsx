import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentMockTests } from "../data/localData";
import { api } from "../services/api";

const fallbackQuestions = [
  {
    id: 1,
    question: "Which of the following Table Tennis World Championship events was held in India?",
    options: [
      "19th World Championships, 1952",
      "17th World Championships, 1950",
      "20th World Championships, 1953",
      "18th World Championships, 1951",
    ],
    correctIndex: 0,
    marks: 1,
    type: "Objective",
  },
  {
    id: 2,
    question: "Mathematics sample 1 for Class 3: What is 2 + 3?",
    options: ["5", "6", "4", "7"],
    correctIndex: 0,
    marks: 1,
    type: "Objective",
  },
  {
    id: 3,
    question: "Mathematics sample 2 for Class 3: What is 3 + 4?",
    options: ["7", "8", "6", "9"],
    correctIndex: 1,
    marks: 1,
    type: "Objective",
  },
  {
    id: 4,
    question: "Mathematics sample 3 for Class 3: What is 4 + 5?",
    options: ["9", "10", "8", "11"],
    correctIndex: 0,
    marks: 1,
    type: "Objective",
  },
];

const TEST_DURATION_MIN = 30;
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, "");

function TestAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentKey = useMemo(
    () => `${user?.name || "guest"}|${user?.className || "unknown"}`,
    [user]
  );
  const studentName = user?.name || "Student";

  const [testMeta, setTestMeta] = useState(null);
  const [questions, setQuestions] = useState(fallbackQuestions);

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

  const normalizeImageUrls = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => resolveImageUrl(item)).filter(Boolean);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.map((item) => resolveImageUrl(item)).filter(Boolean);
          }
        } catch {
          /* noop */
        }
      }
      const single = resolveImageUrl(trimmed);
      return single ? [single] : [];
    }
    return [];
  };

  // load test meta and questions from API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const tests = await api.getTests();
        const match = (tests || []).find((t) => String(t.Id) === String(testId) || String(t.id) === String(testId));
        if (mounted && match) {
          let questionIds = [];
          if (Array.isArray(match.QuestionIds)) {
            questionIds = match.QuestionIds;
          } else if (typeof match.QuestionIdsJson === "string") {
            try {
              questionIds = JSON.parse(match.QuestionIdsJson) || [];
            } catch {
              questionIds = [];
            }
          }
          setTestMeta({
            id: match.Id || match.id || testId,
            subject: match.Subject || match.subject,
            className: match.ClassName || match.className,
            date: match.Date || match.date,
            time: match.Time || match.time,
            startAt: match.StartAt || match.startAt || null,
            endAt: match.EndAt || match.endAt || null,
            linkExpiresAt: match.LinkExpiresAt || match.linkExpiresAt || null,
            durationMinutes: match.DurationMinutes || match.durationMinutes,
            numQuestions: match.NumQuestions || match.numQuestions,
            shuffleQuestions: !!(match.ShuffleQuestions || match.shuffleQuestions),
            shuffleOptions: !!(match.ShuffleOptions || match.shuffleOptions),
            type: match.Type || match.type || "Objective",
          });
          const effectiveDuration = Number(match.DurationMinutes || match.durationMinutes || TEST_DURATION_MIN);
          setSecondsLeft(effectiveDuration * 60);
          const storedRaw = localStorage.getItem("teacherQuestions");
          if (storedRaw) {
            try {
              const stored = JSON.parse(storedRaw);
              const storedList =
                stored?.[match.Id] ||
                stored?.[match.id] ||
                stored?.[testId] ||
                stored?.[String(testId)];
              if (Array.isArray(storedList) && storedList.length > 0) {
                const mappedStored = storedList.map((q, idx) => ({
                  id: q.id || idx + 1,
                  question: q.question || q.QuestionText,
                  options: (q.options || q.Options || []).map((opt) => {
                    if (opt && typeof opt === "object") {
                      return { ...opt, imageUrl: resolveImageUrl(opt.imageUrl || opt.ImageUrl) };
                    }
                    return opt;
                  }),
                  correctIndex:
                    typeof q.correctIndex === "number"
                      ? q.correctIndex
                      : typeof q.CorrectIndex === "number"
                        ? q.CorrectIndex
                        : 0,
                  type: q.type || q.Type || "Objective",
                  marks: Number(q.marks || q.Marks || 1),
                  imageUrls: normalizeImageUrls(q.imageUrl || q.ImageUrl),
                }));
                const shouldShuffleQuestions = match.ShuffleQuestions ?? match.shuffleQuestions;
                const shouldShuffleOptions = match.ShuffleOptions ?? match.shuffleOptions;
                const ordered = shouldShuffleQuestions !== false
                  ? shuffleArray(mappedStored)
                  : mappedStored;
                const finalStored = ordered.map((q) =>
                  shouldShuffleOptions !== false && Array.isArray(q.options) && q.options.length > 0
                    ? { ...q, options: shuffleArray(q.options) }
                    : q
                );
                setQuestions(finalStored);
                return;
              }
            } catch {
              /* noop */
            }
          }
          const idsFromTest = (questionIds || [])
            .map((val) => Number(val))
            .filter((val) => Number.isFinite(val));
          if (idsFromTest.length > 0) {
            const qs = await api.getQuestions({ ids: idsFromTest.join(",") });
            if (mounted && Array.isArray(qs) && qs.length > 0) {
              const mapped = qs.map((q, idx) => ({
                id: q.Id || idx + 1,
                question: q.QuestionText || q.question,
                imageUrls: normalizeImageUrls(q.ImageUrl || q.imageUrl),
                options: (() => {
                  if (Array.isArray(q.Options)) return q.Options;
                  if (Array.isArray(q.options)) return q.options;
                  if (q.OptionsJson) {
                    try {
                      return JSON.parse(q.OptionsJson) || [];
                    } catch {
                      return [];
                    }
                  }
                  return [];
                })().map((opt) => {
                  if (opt && typeof opt === "object") {
                    return { ...opt, imageUrl: resolveImageUrl(opt.imageUrl || opt.ImageUrl) };
                  }
                  return opt;
                }),
                correctIndex: typeof q.CorrectIndex === "number" ? q.CorrectIndex : q.correctIndex || 0,
                type: q.Type || q.type || "Objective",
                marks: Number(q.Marks || q.marks || 1),
              }));
              const shouldShuffleQuestions = match.ShuffleQuestions ?? match.shuffleQuestions;
              const shouldShuffleOptions = match.ShuffleOptions ?? match.shuffleOptions;
              const ordered = shouldShuffleQuestions !== false ? shuffleArray(mapped) : mapped;
              const finalQuestions = ordered.map((q) =>
                shouldShuffleOptions !== false && Array.isArray(q.options) && q.options.length > 0
                  ? { ...q, options: shuffleArray(q.options) }
                  : q
              );
              setQuestions(finalQuestions);
              return;
            }
          }
          // fetch questions by subject/class
          const qs = await api.getQuestions({ subject: match.Subject || match.subject, className: match.ClassName || match.className });
          if (mounted && Array.isArray(qs) && qs.length > 0) {
            const mapped = qs.map((q, idx) => ({
              id: q.Id || idx + 1,
              question: q.QuestionText || q.question,
              imageUrls: normalizeImageUrls(q.ImageUrl || q.imageUrl),
              options: (() => {
                if (Array.isArray(q.Options)) return q.Options;
                if (Array.isArray(q.options)) return q.options;
                if (q.OptionsJson) {
                  try {
                    return JSON.parse(q.OptionsJson) || [];
                  } catch {
                    return [];
                  }
                }
                return [];
              })().map((opt) => {
                if (opt && typeof opt === "object") {
                  return { ...opt, imageUrl: resolveImageUrl(opt.imageUrl || opt.ImageUrl) };
                }
                return opt;
              }),
              correctIndex: typeof q.CorrectIndex === "number" ? q.CorrectIndex : q.correctIndex || 0,
              type: q.Type || q.type || "Objective",
              marks: Number(q.Marks || q.marks || 1),
            }));
            // Ensure consistent question set for all students before shuffling order.
            const shouldShuffleQuestions = match.ShuffleQuestions ?? match.shuffleQuestions;
            const shouldShuffleOptions = match.ShuffleOptions ?? match.shuffleOptions;
            const sorted = [...mapped].sort((a, b) => {
              const aNum = Number(a.id);
              const bNum = Number(b.id);
              if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum;
              return String(a.id).localeCompare(String(b.id));
            });
            const sized =
              match.NumQuestions || match.numQuestions
                ? sorted.slice(0, match.NumQuestions || match.numQuestions)
                : sorted;
            const ordered = shouldShuffleQuestions !== false ? shuffleArray(sized) : sized;
            const finalQuestions = ordered.map((q) =>
              shouldShuffleOptions !== false && Array.isArray(q.options) && q.options.length > 0
                ? { ...q, options: shuffleArray(q.options) }
                : q
            );
            setQuestions(finalQuestions);
          }
        } else if (mounted) {
          const fallback = studentMockTests.find((t) => String(t.id) === String(testId)) || null;
          const shuffledFallback = shuffleArray(fallbackQuestions).map((q) =>
            Array.isArray(q.options) && q.options.length > 0
              ? { ...q, options: shuffleArray(q.options) }
              : q
          );
          setTestMeta(fallback);
          setQuestions(shuffledFallback);
        }
      } catch {
        if (mounted) {
          const fallback = studentMockTests.find((t) => String(t.id) === String(testId)) || null;
          const shuffledFallback = shuffleArray(fallbackQuestions).map((q) =>
            Array.isArray(q.options) && q.options.length > 0
              ? { ...q, options: shuffleArray(q.options) }
              : q
          );
          setTestMeta(fallback);
          setQuestions(shuffledFallback);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [testId]);

  const [answers, setAnswers] = useState({});
  const [answerTexts, setAnswerTexts] = useState({});
  const [reviewMarks, setReviewMarks] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION_MIN * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const accessStatus = useMemo(() => {
    if (!testMeta) return { status: "loading", message: "" };
    const now = Date.now();
    const startAt = testMeta.startAt ? new Date(testMeta.startAt).getTime() : null;
    const endAt = testMeta.endAt ? new Date(testMeta.endAt).getTime() : null;
    const linkExpiry = testMeta.linkExpiresAt
      ? new Date(testMeta.linkExpiresAt).getTime()
      : null;
    if (linkExpiry && !Number.isNaN(linkExpiry) && now > linkExpiry) {
      return { status: "expired", message: "This test link has expired." };
    }
    if (endAt && !Number.isNaN(endAt) && now > endAt) {
      return { status: "closed", message: "This test window is closed." };
    }
    if (startAt && !Number.isNaN(startAt) && now < startAt) {
      return { status: "not_started", message: "This test has not started yet." };
    }
    return { status: "open", message: "" };
  }, [testMeta, secondsLeft]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (submitted) return;
    if (accessStatus.status === "closed" || accessStatus.status === "expired") {
      handleSubmit();
      return;
    }
    if (accessStatus.status !== "open") return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, submitted, accessStatus.status]);

  const handleChange = (qId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
    setReviewMarks((prev) => ({ ...prev, [qId]: false }));
  };

  const handleTextChange = (qId, text) => {
    setAnswerTexts((prev) => ({ ...prev, [qId]: text }));
    setReviewMarks((prev) => ({ ...prev, [qId]: false }));
  };

  const goTo = (idx) => {
    const next = Math.min(Math.max(idx, 0), questions.length - 1);
    setCurrentIndex(next);
  };

  const handleReviewNext = () => {
    const q = questions[currentIndex];
    setReviewMarks((prev) => ({ ...prev, [q.id]: true }));
    goTo(currentIndex + 1);
  };

  const handleSaveNext = () => {
    if (currentIndex === questions.length - 1) {
      handleSubmit();
    } else {
      goTo(currentIndex + 1);
    }
  };

  const handleSubmit = () => {
    if (submitted) return;

    let sc = 0;
    let totalMarks = 0;
    questions.forEach((q) => {
      const isSubjective = (q.type || testMeta?.type) === "Subjective";
      if (isSubjective) return;
      const marks = Number(q.marks || 1);
      totalMarks += marks;
      if (answers[q.id] === q.correctIndex) sc += marks;
    });
    if (totalMarks === 0) {
      totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 1), 0);
    }
    setScore(sc);
    setSubmitted(true);

    const answerSheet = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      selectedIndex: answers[q.id],
      selectedText: answerTexts[q.id],
      correctIndex: q.correctIndex,
      type: q.type || testMeta?.type || "Objective",
      marks: Number(q.marks || 1),
    }));

    const completion = {
      id: testMeta?.id || testId,
      subject: testMeta?.subject || "Unknown",
      className: testMeta?.className || user?.className || "",
      date: testMeta?.date || new Date().toISOString().slice(0, 10),
      time: testMeta?.time || "",
      durationMinutes: testMeta?.durationMinutes || 0,
      score: sc,
      outOf: totalMarks || questions.length,
      submittedAt: new Date().toISOString(),
      answers: answerSheet,
    };

    // push to backend only
    api
      .createResult({
        testId: completion.id,
        studentName: studentName,
        className: completion.className,
        subject: completion.subject,
        score: completion.score,
        outOf: completion.outOf,
        submittedAt: completion.submittedAt,
        answers: answerSheet,
      })
      .catch((err) => console.warn("API save result failed", err.message));
    // persist locally so teacher dashboard can still show it if server insert is delayed
    try {
      const stored = JSON.parse(localStorage.getItem("localResults") || "[]");
      const next = [
        {
          id: completion.id,
          testId: completion.id,
          student: studentName,
          className: completion.className,
          subject: completion.subject,
          date: completion.date,
          submittedAt: completion.submittedAt,
          score: completion.score,
          outOf: completion.outOf,
          percent: completion.outOf ? ((completion.score / completion.outOf) * 100).toFixed(1) : "0.0",
          answers: answerSheet,
        },
        ...stored.filter((r) => r.testId !== completion.id || r.student !== studentName),
      ];
      localStorage.setItem("localResults", JSON.stringify(next));
    } catch (e) {
      console.warn("Could not cache local result", e?.message);
    }

    setTimeout(() => {
      navigate("/student", { state: { newResult: completion } });
    }, 2000);
  };

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  const currentQuestion = questions[currentIndex];
  const currentDisplayNumber = currentIndex + 1;
  const currentType = currentQuestion?.type || testMeta?.type || "Objective";
  const optionImageStyle = {
    width: 180,
    height: 180,
    objectFit: "contain",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
  };
  const questionImageStyle = {
    width: 360,
    height: 360,
    objectFit: "contain",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
  };

  useEffect(() => {
    if (testMeta?.durationMinutes) {
      setSecondsLeft(Number(testMeta.durationMinutes) * 60);
    }
  }, [testMeta?.durationMinutes]);

  const paletteStatus = (q, idx) => {
    if (idx === currentIndex) return "current";
    if (reviewMarks[q.id]) return "review";
    const isSubjective = (q.type || testMeta?.type) === "Subjective";
    if (!isSubjective && answers[q.id] !== undefined) return "answered";
    if (isSubjective && (answerTexts[q.id] || "").trim() !== "") return "answered";
    return "unanswered";
  };

  const subjectLabel = testMeta?.subject || "General Awareness";

  if (accessStatus.status === "loading") {
    return (
      <div className="page-container" style={{ padding: 24 }}>
        <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="section-title" style={{ marginBottom: 6 }}>Loading test</div>
          <div className="section-sub">Please wait while we fetch your questions.</div>
        </div>
      </div>
    );
  }

  if (accessStatus.status !== "open" && !submitted) {
    return (
      <div className="page-container" style={{ padding: 24 }}>
        <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="section-title" style={{ marginBottom: 6 }}>Test not available</div>
          <div className="section-sub" style={{ marginBottom: 16 }}>
            {accessStatus.message || "This test is not available right now."}
          </div>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/student")}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mock-layout">
      <div className="mock-banner">
        <span className="mock-note">Good luck, {studentName}!</span>
        <div className="mock-badges">
          <span className="mock-badge">Duration: {testMeta?.durationMinutes || TEST_DURATION_MIN} min</span>
          <span className="mock-badge warning">
            Time Left: {mm}:{ss}
          </span>
        </div>
      </div>

      <div className="mock-body">
        <aside className="mock-sidebar">
          <div className="mock-section-title">{subjectLabel}</div>
          <div className="mock-palette">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                className={`mock-palette-btn ${paletteStatus(q, idx)}`}
                onClick={() => goTo(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </aside>

        <section className="mock-main">
          <div className="mock-toolbar">
            <div className="mock-question-label">
              Question : {currentDisplayNumber}
            </div>
            <div className="mock-actions">
              <button
                type="button"
                className="mock-btn secondary"
                onClick={handleReviewNext}
                disabled={submitted}
              >
                Mark for Review & Next
              </button>
              <button
                type="button"
                className="mock-btn primary"
                onClick={handleSaveNext}
                disabled={submitted}
              >
                Save & Next
              </button>
            </div>
          </div>

          <div className="mock-question-card">
            <p className="mock-question-text">{currentQuestion.question}</p>
            {Array.isArray(currentQuestion.imageUrls) && currentQuestion.imageUrls.length > 0 && (
              <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 10 }}>
                {currentQuestion.imageUrls.map((src, idx) => (
                  <img
                    key={`${currentQuestion.id}-img-${idx}`}
                    src={src}
                    alt={`Question visual ${idx + 1}`}
                    style={questionImageStyle}
                  />
                ))}
              </div>
            )}
            {currentType === "Subjective" || !currentQuestion.options || currentQuestion.options.length === 0 ? (
              <textarea
                rows={4}
                style={{ width: "100%", borderRadius: 8, padding: 10, border: "1px solid #d9dbe0" }}
                placeholder="Write your answer here"
                disabled={submitted}
                value={answerTexts[currentQuestion.id] || ""}
                onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
              />
            ) : (
              <div className="mock-options">
                {currentQuestion.options.map((opt, idx) => {
                  const label = typeof opt === "string" ? opt : opt.text;
                  const img = typeof opt === "object" ? opt.imageUrl : null;
                  return (
                    <label key={idx} className="mock-option-row" style={{ alignItems: "flex-start", gap: 10 }}>
                      <input
                        type="radio"
                        name={`q-${currentQuestion.id}`}
                        value={idx}
                        disabled={submitted}
                        checked={answers[currentQuestion.id] === idx}
                        onChange={() => handleChange(currentQuestion.id, idx)}
                        style={{ marginTop: 6 }}
                      />
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {img && <img src={img} alt={`Option ${idx + 1}`} style={optionImageStyle} />}
                        <span>{label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {submitted && (
        <div className="result-banner" style={{ maxWidth: "1120px", margin: "10px auto 0" }}>
          Your score: {score}/{questions.length}. Redirecting to dashboard...
        </div>
      )}
    </div>
  );
}

export default TestAttempt;

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
