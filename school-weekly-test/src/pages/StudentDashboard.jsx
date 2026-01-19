import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { studentMockTests } from "../data/localData";
import { api } from "../services/api";
import saraswatiMaa from "../assets/saraswati-maa.jpg";
import StudentHomePanel from "./student/StudentHomePanel";
import StudentUpcomingPanel from "./student/StudentUpcomingPanel";
import StudentMaterialsPanel from "./student/StudentMaterialsPanel";
import StudentPastResultsPanel from "./student/StudentPastResultsPanel";
import StudentRightPanel from "./student/StudentRightPanel";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState("home");
  const [isNarrow, setIsNarrow] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [studyMaterialsError, setStudyMaterialsError] = useState(null);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [materialSubject, setMaterialSubject] = useState("");
  const [materialClass, setMaterialClass] = useState("");

  const [teacherTests, setTeacherTests] = useState(studentMockTests);
  const [studentResults, setStudentResults] = useState([]);
  const [localResults, setLocalResults] = useState([]);
  const [testsError, setTestsError] = useState(null);
  const [resultsError, setResultsError] = useState(null);

  // fetch tests from API
  useEffect(() => {
    let mounted = true;
    api
      .getTests()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const mapped = data.map((t) => {
          const questionIds = Array.isArray(t.QuestionIds) ? t.QuestionIds : [];
          return {
            id: t.Id,
            subject: t.Subject,
            subjects: t.Subjects || [],
            className: t.ClassName,
            date: t.Date?.slice(0, 10) || t.Date,
            time: t.Time,
            startAt: t.StartAt,
            endAt: t.EndAt,
            linkExpiresAt: t.LinkExpiresAt,
            durationMinutes: t.DurationMinutes,
            numQuestions: t.NumQuestions ?? (questionIds.length ? questionIds.length : null),
            questionIds,
            shuffleQuestions: t.ShuffleQuestions,
            shuffleOptions: t.ShuffleOptions,
            type: t.Type || "Objective",
            difficulty: t.Difficulty,
            status: t.Status,
          };
        });
        setTeacherTests(mapped.length ? mapped : studentMockTests);
        setTestsError(null);
      })
      .catch((err) => {
        if (mounted) setTestsError("Could not load tests");
        console.warn("Load tests failed", err?.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // fetch student results from API
  useEffect(() => {
    let mounted = true;
    if (!user?.name) return;
    api
      .getResults({ studentName: user.name })
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        setStudentResults(
          data.map((r) => ({
            id: r.Id,
            testId: r.TestId,
            student: r.StudentName || user?.name || "",
            studentName: r.StudentName,
            subject: r.Subject,
            className: r.ClassName,
            score: r.Score,
            outOf: r.OutOf,
            submittedAt: r.SubmittedAt,
          }))
        );
        setResultsError(null);
      })
      .catch((err) => {
        // Only surface the error if there are no cached/local results to show
        if (mounted && studentResults.length === 0 && localResults.length === 0) {
          setResultsError("Could not load results");
        } else if (mounted) {
          setResultsError(null);
        }
        console.warn("Load results failed", err?.message);
      });
    return () => {
      mounted = false;
    };
  }, [user, studentResults.length, localResults.length]);

  // load locally cached results (e.g., just submitted) for this student
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("localResults") || "[]");
      if (Array.isArray(stored)) {
        const filtered = stored.filter((r) => r.student === user?.name);
        setLocalResults(filtered);
      }
    } catch {
      setLocalResults([]);
    }
  }, [user]);

  const mergedResults = useMemo(() => {
    const key = (r) => {
      const studentKey = (r.studentName || r.student || user?.name || "unknown").trim().toLowerCase();
      const testId = r.testId || r.id;
      if (testId !== undefined && testId !== null && testId !== "") {
        return `${testId}|${r.subject || ""}|${studentKey}`;
      }
      const dateKey = r.submittedAt || r.date || "";
      return `${dateKey}|${r.subject || ""}|${studentKey}`;
    };
    const map = new Map();
    [...localResults, ...studentResults].forEach((r) => {
      map.set(key(r), r);
    });
    return Array.from(map.values());
  }, [localResults, studentResults, user?.name]);

  // Clear stale error once we have any results to show
  useEffect(() => {
    if ((mergedResults || []).length > 0 && resultsError) {
      setResultsError(null);
    }
  }, [mergedResults, resultsError]);

  // Merge a freshly completed test passed via navigation state so the UI updates even if the API insert is delayed.
  useEffect(() => {
    const recent = location.state?.newResult;
    if (!recent) return;
    setStudentResults((prev) => {
      const exists = prev.some((r) => String(r.id) === String(recent.id) || String(r.testId) === String(recent.id));
      return exists ? prev : [recent, ...prev];
    });
    // clear the navigation state to avoid duplicates on refresh
    if (location.state?.newResult) {
      navigate(".", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!materialClass && user?.className) {
      setMaterialClass(user.className);
    }
  }, [materialClass, user]);

  useEffect(() => {
    if (activePanel !== "materials") return;
    if (!materialClass) return;
    setIsMaterialsLoading(true);
    api
      .getStudyMaterials({
        subject: materialSubject || undefined,
        className: materialClass,
      })
      .then((data) => {
        setStudyMaterials(Array.isArray(data) ? data : []);
        setStudyMaterialsError(null);
      })
      .catch((err) => {
        console.warn("Load study materials failed", err?.message);
        setStudyMaterialsError("Could not load study materials");
      })
      .finally(() => {
        setIsMaterialsLoading(false);
      });
  }, [activePanel, materialSubject, materialClass]);

  const relevantTests = useMemo(() => {
    const classNorm = (user?.className || "").trim().toLowerCase();
    const filtered = teacherTests.filter((t) => {
      if (!t.className || !classNorm) return true;
      return t.className.trim().toLowerCase() === classNorm;
    });
    // If nothing matched the class filter, fall back to all tests so students still see scheduled items.
    return filtered.length > 0 ? filtered : teacherTests;
  }, [teacherTests, user]);

  const completedIds = useMemo(() => {
    const ids = new Set();
    (mergedResults || []).forEach((t) => {
      const key = t.testId ?? t.id;
      if (key !== undefined && key !== null && key !== "") {
        ids.add(String(key));
      }
    });
    return ids;
  }, [mergedResults]);

  const isExpired = (test) => {
    const now = Date.now();
    const endAt = test?.endAt ? new Date(test.endAt).getTime() : null;
    const linkExpiry = test?.linkExpiresAt ? new Date(test.linkExpiresAt).getTime() : null;
    if (linkExpiry && !Number.isNaN(linkExpiry)) return now > linkExpiry;
    if (endAt && !Number.isNaN(endAt)) return now > endAt;
    const start = new Date(`${test.date || ""}T${test.time || "00:00"}`).getTime();
    if (Number.isNaN(start)) return false;
    const twoHours = 2 * 60 * 60 * 1000;
    return now > start + twoHours;
  };

  const isNotStarted = (test) => {
    const startAt = test?.startAt ? new Date(test.startAt).getTime() : null;
    if (startAt && !Number.isNaN(startAt)) return Date.now() < startAt;
    return false;
  };

  const navButtonStyle = (active) => ({
    border: "none",
    background: "transparent",
    color: active ? "#eb1d82" : "#4b5563",
    fontWeight: active ? 700 : 600,
  });

  // Show any test that isn't already completed by the student.
  // This avoids hiding scheduled tests when the backend uses different status labels.
  const upcomingTests = useMemo(
    () =>
      relevantTests.filter((t, idx) => {
        const rawId = t.id ?? t.testId;
        const idKey = rawId !== undefined && rawId !== null && rawId !== "" ? String(rawId) : `idx-${idx}`;
        const status = String(t.status || "").trim().toLowerCase();
        const blocked = status === "completed" || status === "closed" || status === "cancelled" || status === "expired";
        if (blocked || isExpired(t)) return false;
        return !completedIds.has(idKey);
      }),
    [relevantTests, completedIds]
  );

  const pastTests = useMemo(() => {
    const list = mergedResults || [];
    return [...list].sort((a, b) => {
      const aDate = new Date(a.submittedAt || 0).getTime();
      const bDate = new Date(b.submittedAt || 0).getTime();
      return bDate - aDate;
    });
  }, [mergedResults]);

  const marksGraphData = useMemo(
    () =>
      pastTests.map((t, idx) => ({
        label: t.subject || `Test ${idx + 1}`,
        percent: t.outOf ? (t.score / t.outOf) * 100 : 0,
        submittedAt: t.submittedAt,
        date: t.submittedAt ? t.submittedAt.slice(0, 10) : t.date,
      })),
    [pastTests]
  );

  const submissionOrderGraphData = useMemo(() => {
    const sorted = [...marksGraphData].sort((a, b) => {
      if (b.percent !== a.percent) return b.percent - a.percent;
      const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return aTime - bTime;
    });
    return sorted;
  }, [marksGraphData]);

  const bestScore = useMemo(() => {
    if (pastTests.length === 0) return 0;
    return Math.max(...pastTests.map((t) => (t.outOf ? (t.score / t.outOf) * 100 : 0)));
  }, [pastTests]);

  const performanceChartData = useMemo(() => {
    const items = [...marksGraphData].slice(0, 8);
    return items.map((row, idx) => ({
      label: row.label || `Test ${idx + 1}`,
      percent: Math.max(0, Math.min(100, row.percent || 0)),
    }));
  }, [marksGraphData]);

  const handleStartTest = (id) => {
    navigate(`/test/${id}`);
  };

  const upcomingCount = upcomingTests.length;
  const pastCount = pastTests.length;
  const upcomingSummary = upcomingTests[0];
  const pastSummary = pastTests[0];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avgPercent =
    pastTests.length > 0
      ? pastTests.reduce((sum, t) => sum + (t.outOf ? (t.score / t.outOf) * 100 : 0), 0) /
        pastTests.length
      : 0;

  return (
    <div className="page-container student-page student-dashboard">
      <header
        className="dashboard-nav"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          padding: "10px 16px",
          background: "#f5f7fb",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          marginBottom: 12,
          position: "sticky",
          top: 0,
          zIndex: 40,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="brand-icon"
            aria-label="Saraswati Maa playing veena logo"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundImage: `url('${saraswatiMaa}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            <span className="brand-fallback"></span>
          </span>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700 }}>MDDM Inter College</div>
            <div style={{ fontSize: 12, color: "#555" }}>Student Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", justifyContent: "center" }}>
          {!isNarrow && (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "home")}
                onClick={() => setActivePanel("home")}
              >
                Home
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "upcoming")}
                onClick={() => setActivePanel("upcoming")}
              >
                Upcoming
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "past")}
                onClick={() => setActivePanel("past")}
              >
                Results
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "materials")}
                onClick={() => setActivePanel("materials")}
              >
                Study material
              </button>
            </div>
          )}
          {isNarrow && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              aria-label="Open menu"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              ...
            </button>
          )}
        </div>
        <div style={{ position: "relative", justifySelf: "end" }}>
          {isNarrow && showMenu && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 6,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 8,
                boxShadow: "0 10px 20px rgba(15, 23, 42, 0.08)",
                display: "grid",
                gap: 6,
                zIndex: 60,
                minWidth: 160,
              }}
            >
              <button
                type="button"
                className="link-btn side-menu-btn"
                onClick={() => {
                  setActivePanel("home");
                  setShowMenu(false);
                }}
              >
                Home
              </button>
              <button
                type="button"
                className="link-btn side-menu-btn"
                onClick={() => {
                  setActivePanel("upcoming");
                  setShowMenu(false);
                }}
              >
                Upcoming Tests
              </button>
              <button
                type="button"
                className="link-btn side-menu-btn"
                onClick={() => {
                  setActivePanel("past");
                  setShowMenu(false);
                }}
              >
                Past Results
              </button>
              <button
                type="button"
                className="link-btn side-menu-btn"
                onClick={() => {
                  setActivePanel("materials");
                  setShowMenu(false);
                }}
              >
                Study material
              </button>
            </div>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="student-body">
        <aside className="side-menu">
          <div className="side-menu-heading">Main</div>
          <nav className="side-menu-list">
            <button
              className={`link-btn side-menu-btn ${activePanel === "home" ? "active" : ""}`}
              onClick={() => setActivePanel("home")}
            >
              Home
            </button>
            <button className={`link-btn side-menu-btn ${activePanel === "upcoming" ? "active" : ""}`} onClick={() => setActivePanel("upcoming")}>
              Upcoming Tests
            </button>
            <button className={`link-btn side-menu-btn ${activePanel === "past" ? "active" : ""}`} onClick={() => setActivePanel("past")}>
              Past Results
            </button>
            <button
              className={`link-btn side-menu-btn ${activePanel === "materials" ? "active" : ""}`}
              onClick={() => setActivePanel("materials")}
            >
              Study material
            </button>
          </nav>
          <div className="side-menu-heading" style={{ marginTop: 10 }}>
            Other
          </div>
          <nav className="side-menu-list">
            <button className="link-btn side-menu-btn" onClick={() => alert("Settings coming soon")}>
              Settings
            </button>
            <button className="link-btn side-menu-btn" onClick={() => alert("Help coming soon")}>
              Help
            </button>
          </nav>
        </aside>

        <div style={{ minWidth: 0 }}>
          {activePanel === "home" && (
            <StudentHomePanel
              user={user}
              upcomingCount={upcomingCount}
              pastCount={pastCount}
              upcomingSummary={upcomingSummary}
              pastSummary={pastSummary}
              pastTests={pastTests}
              avgPercent={avgPercent}
              bestScore={bestScore}
              performanceChartData={performanceChartData}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
            />
          )}

          {activePanel === "upcoming" && (
            <StudentUpcomingPanel
              testsError={testsError}
              upcomingTests={upcomingTests}
              isExpired={isExpired}
              isNotStarted={isNotStarted}
              onStartTest={handleStartTest}
            />
          )}

          {activePanel === "materials" && (
            <StudentMaterialsPanel
              materialSubject={materialSubject}
              setMaterialSubject={setMaterialSubject}
              materialClass={materialClass}
              setMaterialClass={setMaterialClass}
              studyMaterialsError={studyMaterialsError}
              isMaterialsLoading={isMaterialsLoading}
              studyMaterials={studyMaterials}
            />
          )}

          {activePanel === "past" && (
            <StudentPastResultsPanel
              pastTests={pastTests}
              resultsError={resultsError}
              marksGraphData={marksGraphData}
              submissionOrderGraphData={submissionOrderGraphData}
            />
          )}

        </div>

        <StudentRightPanel
          pastTests={pastTests}
          avgPercent={avgPercent}
          bestScore={bestScore}
        />
      </div>

    </div>
  );
}

export default StudentDashboard;
