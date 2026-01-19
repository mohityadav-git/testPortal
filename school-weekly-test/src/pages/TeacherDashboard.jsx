
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import saraswatiMaa from "../assets/saraswati-maa.jpg";
import { buildDateTime } from "./teacher/constants";
import TeacherHomePanel from "./teacher/TeacherHomePanel";
import TeacherTestsPanel from "./teacher/TeacherTestsPanel";
import TeacherQuestionsPanel from "./teacher/TeacherQuestionsPanel";
import TeacherMaterialsPanel from "./teacher/TeacherMaterialsPanel";
import TeacherResultsPanel from "./teacher/TeacherResultsPanel";
import TeacherPerformancePanel from "./teacher/TeacherPerformancePanel";
import TeacherStudentsPanel from "./teacher/TeacherStudentsPanel";
import TeacherRightPanel from "./teacher/TeacherRightPanel";

function TeacherDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const teacherClass = useMemo(() => (user?.className || "").trim(), [user]);
  const [activePanel, setActivePanel] = useState("home");
  const [isNarrow, setIsNarrow] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [students, setStudents] = useState([]);

  const [testsError, setTestsError] = useState(null);
  const [questionsError, setQuestionsError] = useState(null);
  const [resultsError, setResultsError] = useState(null);
  const [studyMaterialsError, setStudyMaterialsError] = useState(null);
  const [studentsError, setStudentsError] = useState(null);

  const [isTestsLoading, setIsTestsLoading] = useState(false);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);

  const [testSubject, setTestSubject] = useState("");
  const [testClass, setTestClass] = useState("");
  const [testDate, setTestDate] = useState("");
  const [testTime, setTestTime] = useState("");
  const [testDuration, setTestDuration] = useState(30);
  const [testDifficulty, setTestDifficulty] = useState("Easy");
  const [testNumQuestions, setTestNumQuestions] = useState("");
  const [questionPicking, setQuestionPicking] = useState("random");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [showTestForm, setShowTestForm] = useState(true);

  const [questionSubject, setQuestionSubject] = useState("");
  const [questionClass, setQuestionClass] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionSection, setQuestionSection] = useState("");
  const [questionMarks, setQuestionMarks] = useState(1);
  const [questionDifficulty, setQuestionDifficulty] = useState("Easy");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [optionAImage, setOptionAImage] = useState(null);
  const [optionBImage, setOptionBImage] = useState(null);
  const [optionCImage, setOptionCImage] = useState(null);
  const [optionDImage, setOptionDImage] = useState(null);
  const [correctOption, setCorrectOption] = useState("A");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [questionImages, setQuestionImages] = useState([]);
  const [isQuestionImageUploading, setIsQuestionImageUploading] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("Study material");
  const [materialSubject, setMaterialSubject] = useState("");
  const [materialClass, setMaterialClass] = useState("");
  const [materialFile, setMaterialFile] = useState(null);
  const [materialFileKey, setMaterialFileKey] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [studentRollNumber, setStudentRollNumber] = useState("");
  const [studentMobileNumber, setStudentMobileNumber] = useState("");
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentRoll, setEditStudentRoll] = useState("");
  const [editStudentMobile, setEditStudentMobile] = useState("");

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (teacherClass) {
      setTestClass(teacherClass);
      setQuestionClass(teacherClass);
      setMaterialClass(teacherClass);
    }
  }, [teacherClass]);

  useEffect(() => {
    if (questionPicking === "manual") {
      setTestDifficulty("Easy");
      setSelectedQuestionIds([]);
    }
  }, [questionPicking]);

  useEffect(() => {
    if (questionPicking === "manual") {
      setSelectedQuestionIds([]);
    }
  }, [questionPicking, testSubject, testClass]);

  const loadTests = async () => {
    setIsTestsLoading(true);
    try {
      const data = await api.getTests();
      const mapped = Array.isArray(data)
        ? data.map((t) => ({
            id: t.Id,
            subject: t.Subject,
            className: t.ClassName,
            date: t.Date?.slice(0, 10) || t.Date,
            time: t.Time,
            durationMinutes: t.DurationMinutes,
            numQuestions: t.NumQuestions,
            questionIds: t.QuestionIds || [],
            difficulty: t.Difficulty,
            status: t.Status,
            shuffleQuestions: t.ShuffleQuestions,
          }))
        : [];
      setTests(mapped);
      setTestsError(null);
    } catch (err) {
      console.warn("Load tests failed", err?.message);
      setTestsError("Could not load tests");
    } finally {
      setIsTestsLoading(false);
    }
  };
  const loadQuestions = async () => {
    setIsQuestionsLoading(true);
    try {
      const params = teacherClass ? { className: teacherClass } : {};
      const data = await api.getQuestions(params);
      const mapped = Array.isArray(data)
        ? data.map((q) => ({
            id: q.Id,
            subject: q.Subject,
            className: q.ClassName,
            questionText: q.QuestionText,
            section: q.Section,
            marks: q.Marks,
            difficulty: q.Difficulty,
            options: q.Options || q.options || [],
            correctIndex: q.CorrectIndex,
            imageUrl: q.ImageUrl,
          }))
        : [];
      setQuestions(mapped);
      setQuestionsError(null);
    } catch (err) {
      console.warn("Load questions failed", err?.message);
      setQuestionsError("Could not load questions");
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const loadResults = async () => {
    setIsResultsLoading(true);
    try {
      const params = teacherClass ? { className: teacherClass } : {};
      const data = await api.getResults(params);
      const mapped = Array.isArray(data)
        ? data.map((r) => ({
            id: r.Id,
            testId: r.TestId,
            studentName: r.StudentName,
            className: r.ClassName,
            subject: r.Subject,
            score: r.Score,
            outOf: r.OutOf,
            submittedAt: r.SubmittedAt,
            answers: r.AnswersJson,
          }))
        : [];
      setResults(mapped);
      setResultsError(null);
    } catch (err) {
      console.warn("Load results failed", err?.message);
      setResultsError("Could not load results");
    } finally {
      setIsResultsLoading(false);
    }
  };

  const loadMaterials = async () => {
    setIsMaterialsLoading(true);
    try {
      const params = {};
      if (materialSubject) params.subject = materialSubject;
      if (materialClass) params.className = materialClass;
      const data = await api.getStudyMaterials(params);
      setStudyMaterials(Array.isArray(data) ? data : []);
      setStudyMaterialsError(null);
    } catch (err) {
      console.warn("Load study materials failed", err?.message);
      setStudyMaterialsError("Could not load study materials");
    } finally {
      setIsMaterialsLoading(false);
    }
  };

  const loadStudents = async () => {
    setIsStudentsLoading(true);
    try {
      const params = teacherClass ? { className: teacherClass } : {};
      const data = await api.getStudents(params);
      setStudents(Array.isArray(data) ? data : []);
      setStudentsError(null);
    } catch (err) {
      console.warn("Load students failed", err?.message);
      setStudentsError("Could not load students");
    } finally {
      setIsStudentsLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
    loadQuestions();
    loadResults();
  }, [teacherClass]);

  useEffect(() => {
    if (activePanel !== "materials") return;
    loadMaterials();
  }, [activePanel, materialSubject, materialClass]);

  useEffect(() => {
    if (activePanel !== "students") return;
    loadStudents();
  }, [activePanel, teacherClass]);

  const filteredTests = useMemo(() => {
    if (!teacherClass) return tests;
    const target = teacherClass.toLowerCase();
    return tests.filter((t) => (t.className || "").trim().toLowerCase() === target);
  }, [tests, teacherClass]);

  const filteredQuestions = useMemo(() => {
    if (!teacherClass) return questions;
    const target = teacherClass.toLowerCase();
    return questions.filter((q) => (q.className || "").trim().toLowerCase() === target);
  }, [questions, teacherClass]);

  const eligibleQuestions = useMemo(() => {
    if (questionPicking !== "manual") return [];
    let list = filteredQuestions;
    if (testSubject && testSubject !== "All Subjects") {
      const subjectKey = testSubject.trim().toLowerCase();
      list = list.filter((q) => (q.subject || "").trim().toLowerCase() === subjectKey);
    }
    return list;
  }, [filteredQuestions, questionPicking, testSubject]);

  const filteredResults = useMemo(() => {
    if (!teacherClass) return results;
    const target = teacherClass.toLowerCase();
    return results.filter((r) => (r.className || "").trim().toLowerCase() === target);
  }, [results, teacherClass]);

  const classPerformance = useMemo(() => {
    const totals = filteredResults.reduce(
      (acc, row) => {
        acc.score += Number(row.score || 0);
        acc.outOf += Number(row.outOf || 0);
        acc.count += 1;
        return acc;
      },
      { score: 0, outOf: 0, count: 0 }
    );
    const percent = totals.outOf ? (totals.score / totals.outOf) * 100 : 0;
    return {
      ...totals,
      percent: Number.isFinite(percent) ? percent : 0,
    };
  }, [filteredResults]);

  const studentSummaries = useMemo(() => {
    const map = new Map();
    filteredResults.forEach((row) => {
      const key = (row.studentName || "Unknown").trim();
      if (!map.has(key)) {
        map.set(key, { student: key, score: 0, outOf: 0, attempts: 0 });
      }
      const entry = map.get(key);
      entry.score += Number(row.score || 0);
      entry.outOf += Number(row.outOf || 0);
      entry.attempts += 1;
    });
    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        percent: entry.outOf ? (entry.score / entry.outOf) * 100 : 0,
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [filteredResults]);

  const filteredStudentSummary = useMemo(() => {
    const term = (studentSearch || "").trim().toLowerCase();
    if (!term) return null;
    return studentSummaries.find((s) => s.student.toLowerCase().includes(term)) || null;
  }, [studentSearch, studentSummaries]);

  const nextTest = useMemo(() => {
    const list = [...filteredTests].filter((t) => t.date && t.time);
    list.sort((a, b) => {
      const aTime = buildDateTime(a.date, a.time)?.getTime() || 0;
      const bTime = buildDateTime(b.date, b.time)?.getTime() || 0;
      return aTime - bTime;
    });
    return list[0] || null;
  }, [filteredTests]);

  const toggleQuestionSelection = (id) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!testSubject || !testClass || !testDate || !testTime) return;
    if (questionPicking === "manual" && selectedQuestionIds.length === 0) {
      setTestsError("Select questions from the question bank for manual picking");
      return;
    }
    try {
      const response = await api.createTest({
        subject: testSubject,
        className: testClass,
        date: testDate,
        time: testTime,
        durationMinutes: Number(testDuration) || 30,
        numQuestions:
          questionPicking === "manual"
            ? selectedQuestionIds.length
            : testNumQuestions
              ? Number(testNumQuestions)
              : null,
        questionIds: questionPicking === "manual" ? selectedQuestionIds : [],
        difficulty: testDifficulty,
        shuffleQuestions: questionPicking === "random",
      });
      if (questionPicking === "manual") {
        const selectedQuestions = questions
          .filter((q) => selectedQuestionIds.includes(q.id))
          .map((q) => ({
            id: q.id,
            question: q.questionText,
            options: q.options,
            correctIndex: q.correctIndex ?? 0,
            marks: q.marks ?? 1,
            imageUrl: q.imageUrl || null,
          }));
        const stored = JSON.parse(localStorage.getItem("teacherQuestions") || "{}");
        const key = response?.id ?? response?.Id;
        if (key != null) {
          stored[key] = selectedQuestions;
          localStorage.setItem("teacherQuestions", JSON.stringify(stored));
        }
      }
      setTestSubject("");
      setTestDate("");
      setTestTime("");
      setTestDuration(30);
      setTestDifficulty("Easy");
      setTestNumQuestions("");
      setQuestionPicking("random");
      setSelectedQuestionIds([]);
      loadTests();
    } catch (err) {
      console.warn("Create test failed", err?.message);
      setTestsError("Could not create test");
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!questionSubject || !questionClass || !questionText) return;
    const indexMap = { A: 0, B: 1, C: 2, D: 3 };
    const optionEntries = [
      { key: "A", text: optionA, file: optionAImage },
      { key: "B", text: optionB, file: optionBImage },
      { key: "C", text: optionC, file: optionCImage },
      { key: "D", text: optionD, file: optionDImage },
    ];
    let optionImageUrls = {};
    const optionsWithContent = optionEntries.filter(
      (entry) => String(entry.text || "").trim() || entry.file
    );
    if (optionsWithContent.length < 2) {
      setQuestionsError("Add at least two options");
      return;
    }
    const selectedIndex = optionsWithContent.findIndex((entry) => entry.key === correctOption);
    if (selectedIndex === -1) {
      setQuestionsError("Correct option must have text or an image");
      return;
    }
    let imageUrl = null;
    if (questionImages.length > 0 || optionsWithContent.some((entry) => entry.file)) {
      setIsQuestionImageUploading(true);
      try {
        const questionUploads = await Promise.all(
          questionImages.map((file) => api.uploadImage(file))
        );
        const questionUrls = questionUploads.map((res) => res?.url).filter(Boolean);
        if (optionsWithContent.some((entry) => entry.file)) {
          const optionUploads = await Promise.all(
            optionsWithContent.map((entry) =>
              entry.file ? api.uploadImage(entry.file) : Promise.resolve(null)
            )
          );
          optionImageUrls = optionsWithContent.reduce((acc, entry, idx) => {
            const uploaded = optionUploads[idx];
            if (uploaded?.url) {
              acc[entry.key] = uploaded.url;
            }
            return acc;
          }, {});
        }
        if (questionUrls.length === 1) {
          imageUrl = questionUrls[0];
        } else if (questionUrls.length > 1) {
          imageUrl = JSON.stringify(questionUrls);
        }
      } catch (err) {
        console.warn("Image upload failed", err?.message);
        setQuestionsError("Could not upload question images");
        setIsQuestionImageUploading(false);
        return;
      }
      setIsQuestionImageUploading(false);
    }
    try {
      const options = optionsWithContent.map((entry) => ({
        text: String(entry.text || "").trim(),
        imageUrl: optionImageUrls[entry.key] || null,
      }));
      await api.createQuestion({
        subject: questionSubject,
        className: questionClass,
        questionText,
        section: questionSection || null,
        marks: Number(questionMarks) || 1,
        difficulty: questionDifficulty,
        options,
        correctIndex: selectedIndex,
        imageUrl,
      });
      setQuestionText("");
      setQuestionSection("");
      setQuestionMarks(1);
      setQuestionDifficulty("Easy");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectOption("A");
      setOptionAImage(null);
      setOptionBImage(null);
      setOptionCImage(null);
      setOptionDImage(null);
      setQuestionImages([]);
      loadQuestions();
    } catch (err) {
      console.warn("Create question failed", err?.message);
      setQuestionsError("Could not create question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!questionId) return;
    const ok = window.confirm("Delete this question? This cannot be undone.");
    if (!ok) return;
    try {
      await api.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setQuestionsError(null);
    } catch (err) {
      console.warn("Delete question failed", err?.message);
      setQuestionsError("Could not delete question");
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialSubject || !materialClass || !materialFile) {
      setStudyMaterialsError("Subject, class, and file are required");
      return;
    }
    const formData = new FormData();
    formData.append("title", materialTitle || "Study material");
    formData.append("subject", materialSubject);
    formData.append("className", materialClass);
    if (user?.name) formData.append("teacherName", user.name);
    formData.append("file", materialFile);
    try {
      await api.createStudyMaterial(formData);
      setMaterialTitle("Study material");
      setMaterialFile(null);
      setMaterialFileKey((prev) => prev + 1);
      setStudyMaterialsError(null);
      loadMaterials();
    } catch (err) {
      console.warn("Upload study material failed", err?.message);
      setStudyMaterialsError("Could not upload study material");
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentName || !teacherClass) {
      setStudentsError("Student name and class are required");
      return;
    }
    try {
      await api.createStudent({
        studentName: studentName.trim(),
        className: teacherClass,
        rollNumber: studentRollNumber.trim() || null,
        mobileNumber: studentMobileNumber.trim() || null,
      });
      setStudentName("");
      setStudentRollNumber("");
      setStudentMobileNumber("");
      setStudentsError(null);
      loadStudents();
    } catch (err) {
      console.warn("Create student failed", err?.message);
      setStudentsError("Could not add student");
    }
  };

  const startEditStudent = (student) => {
    if (!student) return;
    setEditingStudentId(student.Id);
    setEditStudentName(student.StudentName || "");
    setEditStudentRoll(student.RollNumber || "");
    setEditStudentMobile(student.MobileNumber || "");
  };

  const cancelEditStudent = () => {
    setEditingStudentId(null);
    setEditStudentName("");
    setEditStudentRoll("");
    setEditStudentMobile("");
  };

  const handleUpdateStudent = async (studentId) => {
    if (!studentId) return;
    try {
      await api.updateStudent(studentId, {
        studentName: editStudentName.trim(),
        rollNumber: editStudentRoll.trim() || null,
        mobileNumber: editStudentMobile.trim() || null,
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.Id === studentId
            ? {
                ...s,
                StudentName: editStudentName.trim(),
                RollNumber: editStudentRoll.trim() || null,
                MobileNumber: editStudentMobile.trim() || null,
              }
            : s
        )
      );
      cancelEditStudent();
      setStudentsError(null);
    } catch (err) {
      console.warn("Update student failed", err?.message);
      setStudentsError("Could not update student");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!studentId) return;
    const ok = window.confirm("Delete this student? This cannot be undone.");
    if (!ok) return;
    try {
      await api.deleteStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.Id !== studentId));
      if (editingStudentId === studentId) cancelEditStudent();
      setStudentsError(null);
    } catch (err) {
      console.warn("Delete student failed", err?.message);
      setStudentsError("Could not delete student");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navButtonStyle = (active) => ({
    border: "none",
    background: "transparent",
    color: active ? "#eb1d82" : "#4b5563",
    fontWeight: active ? 700 : 600,
  });

  const openTestsPanel = (showForm = true) => {
    setShowTestForm(showForm);
    setActivePanel("tests");
  };

  const downloadResult = (row) => {
    if (!row) return;
    const lines = [
      `Student: ${row.studentName || "-"}`,
      `Class: ${row.className || "-"}`,
      `Subject: ${row.subject || "-"}`,
      `Score: ${row.score ?? "-"} / ${row.outOf ?? "-"}`,
      `Submitted: ${row.submittedAt ? String(row.submittedAt) : "-"}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(row.studentName || "student").replace(/\s+/g, "_")}_${(row.subject || "result").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container teacher-page teacher-dashboard">
      <header
        className="dashboard-nav"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          padding: "8px 16px",
          background: "#f5f7fb",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          marginBottom: 0,
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
            <div style={{ fontSize: 12, color: "#555" }}>Teacher Dashboard</div>
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
                style={navButtonStyle(activePanel === "tests")}
                onClick={() => openTestsPanel(true)}
              >
                Tests
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "questions")}
                onClick={() => setActivePanel("questions")}
              >
                Questions
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "materials")}
                onClick={() => setActivePanel("materials")}
              >
                Study material
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "results")}
                onClick={() => setActivePanel("results")}
              >
                Results
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "performance")}
                onClick={() => setActivePanel("performance")}
              >
                Performance
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={navButtonStyle(activePanel === "students")}
                onClick={() => setActivePanel("students")}
              >
                Students
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
                  openTestsPanel(true);
                  setShowMenu(false);
                }}
              >
                Tests
              </button>
              <button
                type="button"
                className="link-btn side-menu-btn"
                onClick={() => {
                  setActivePanel("questions");
                  setShowMenu(false);
                }}
              >
                Questions
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
              <button
                type="button"
                className="link-btn side-menu-btn"
                onClick={() => {
                  setActivePanel("results");
                  setShowMenu(false);
                }}
              >
                Results
              </button>
              <button
                type="button"
                className="link-btn side-menu-btn"
                onClick={() => {
                  setActivePanel("performance");
                  setShowMenu(false);
                }}
              >
                Performance
              </button>
              <button
                type="button"
                className="link-btn side-menu-btn"
                onClick={() => {
                  setActivePanel("students");
                  setShowMenu(false);
                }}
              >
                Students
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
            <button
              className={`link-btn side-menu-btn ${activePanel === "tests" ? "active" : ""}`}
              onClick={() => openTestsPanel(true)}
            >
              Tests
            </button>
            <button
              className={`link-btn side-menu-btn ${activePanel === "questions" ? "active" : ""}`}
              onClick={() => setActivePanel("questions")}
            >
              Questions
            </button>
            <button
              className={`link-btn side-menu-btn ${activePanel === "materials" ? "active" : ""}`}
              onClick={() => setActivePanel("materials")}
            >
              Study material
            </button>
            <button
              className={`link-btn side-menu-btn ${activePanel === "results" ? "active" : ""}`}
              onClick={() => setActivePanel("results")}
            >
              Results
            </button>
            <button
              className={`link-btn side-menu-btn ${activePanel === "performance" ? "active" : ""}`}
              onClick={() => setActivePanel("performance")}
            >
              Performance
            </button>
            <button
              className={`link-btn side-menu-btn ${activePanel === "students" ? "active" : ""}`}
              onClick={() => setActivePanel("students")}
            >
              Students
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
            <TeacherHomePanel
              teacherClass={teacherClass}
              user={user}
              filteredTests={filteredTests}
              filteredQuestions={filteredQuestions}
              filteredResults={filteredResults}
              nextTest={nextTest}
              studyMaterials={studyMaterials}
              students={students}
              activePanel={activePanel}
              openTestsPanel={openTestsPanel}
              setActivePanel={setActivePanel}
            />
          )}
          {activePanel === "tests" && (
            <TeacherTestsPanel
              showTestForm={showTestForm}
              testSubject={testSubject}
              setTestSubject={setTestSubject}
              testClass={testClass}
              setTestClass={setTestClass}
              testDate={testDate}
              setTestDate={setTestDate}
              testTime={testTime}
              setTestTime={setTestTime}
              testDuration={testDuration}
              setTestDuration={setTestDuration}
              testNumQuestions={testNumQuestions}
              setTestNumQuestions={setTestNumQuestions}
              questionPicking={questionPicking}
              setQuestionPicking={setQuestionPicking}
              testDifficulty={testDifficulty}
              setTestDifficulty={setTestDifficulty}
              selectedQuestionIds={selectedQuestionIds}
              eligibleQuestions={eligibleQuestions}
              isQuestionsLoading={isQuestionsLoading}
              toggleQuestionSelection={toggleQuestionSelection}
              handleCreateTest={handleCreateTest}
              loadTests={loadTests}
              isTestsLoading={isTestsLoading}
              testsError={testsError}
              filteredTests={filteredTests}
            />
          )}
          {activePanel === "questions" && (
            <TeacherQuestionsPanel
              questionSubject={questionSubject}
              setQuestionSubject={setQuestionSubject}
              questionClass={questionClass}
              setQuestionClass={setQuestionClass}
              questionText={questionText}
              setQuestionText={setQuestionText}
              questionImages={questionImages}
              setQuestionImages={setQuestionImages}
              questionSection={questionSection}
              setQuestionSection={setQuestionSection}
              questionMarks={questionMarks}
              setQuestionMarks={setQuestionMarks}
              questionDifficulty={questionDifficulty}
              setQuestionDifficulty={setQuestionDifficulty}
              optionA={optionA}
              setOptionA={setOptionA}
              optionB={optionB}
              setOptionB={setOptionB}
              optionC={optionC}
              setOptionC={setOptionC}
              optionD={optionD}
              setOptionD={setOptionD}
              setOptionAImage={setOptionAImage}
              setOptionBImage={setOptionBImage}
              setOptionCImage={setOptionCImage}
              setOptionDImage={setOptionDImage}
              correctOption={correctOption}
              setCorrectOption={setCorrectOption}
              isQuestionImageUploading={isQuestionImageUploading}
              handleCreateQuestion={handleCreateQuestion}
              loadQuestions={loadQuestions}
              isQuestionsLoading={isQuestionsLoading}
              questionsError={questionsError}
              filteredQuestions={filteredQuestions}
              handleDeleteQuestion={handleDeleteQuestion}
            />
          )}
          {activePanel === "materials" && (
            <TeacherMaterialsPanel
              materialTitle={materialTitle}
              setMaterialTitle={setMaterialTitle}
              materialSubject={materialSubject}
              setMaterialSubject={setMaterialSubject}
              materialClass={materialClass}
              setMaterialClass={setMaterialClass}
              materialFileKey={materialFileKey}
              setMaterialFile={setMaterialFile}
              handleUploadMaterial={handleUploadMaterial}
              studyMaterialsError={studyMaterialsError}
              isMaterialsLoading={isMaterialsLoading}
              studyMaterials={studyMaterials}
              loadMaterials={loadMaterials}
            />
          )}
          {activePanel === "results" && (
            <TeacherResultsPanel
              isResultsLoading={isResultsLoading}
              resultsError={resultsError}
              filteredResults={filteredResults}
              selectedResult={selectedResult}
              setSelectedResult={setSelectedResult}
              loadResults={loadResults}
            />
          )}
          {activePanel === "performance" && (
            <TeacherPerformancePanel
              classPerformance={classPerformance}
              studentSummaries={studentSummaries}
              studentSearch={studentSearch}
              setStudentSearch={setStudentSearch}
              filteredStudentSummary={filteredStudentSummary}
              filteredResults={filteredResults}
              loadResults={loadResults}
            />
          )}
          {activePanel === "students" && (
            <TeacherStudentsPanel
              studentName={studentName}
              setStudentName={setStudentName}
              studentRollNumber={studentRollNumber}
              setStudentRollNumber={setStudentRollNumber}
              studentMobileNumber={studentMobileNumber}
              setStudentMobileNumber={setStudentMobileNumber}
              teacherClass={teacherClass}
              handleAddStudent={handleAddStudent}
              studentsError={studentsError}
              isStudentsLoading={isStudentsLoading}
              students={students}
              editingStudentId={editingStudentId}
              editStudentName={editStudentName}
              setEditStudentName={setEditStudentName}
              editStudentRoll={editStudentRoll}
              setEditStudentRoll={setEditStudentRoll}
              editStudentMobile={editStudentMobile}
              setEditStudentMobile={setEditStudentMobile}
              handleUpdateStudent={handleUpdateStudent}
              cancelEditStudent={cancelEditStudent}
              startEditStudent={startEditStudent}
              handleDeleteStudent={handleDeleteStudent}
              loadStudents={loadStudents}
            />
          )}
        </div>

        <TeacherRightPanel
          filteredTests={filteredTests}
          filteredQuestions={filteredQuestions}
          filteredResults={filteredResults}
        />

      </div>
    </div>
  );
}

export default TeacherDashboard;
