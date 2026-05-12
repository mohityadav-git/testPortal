const express = require("express");
const router = express.Router();
const { sql, getPool } = require("../config/db");
const { verifyToken } = require("../utils/authMiddleware");

/* ---------------- GET all tests ---------------- */
router.get("/", verifyToken, async (req, res) => {
  let teacherClass = null;
  if (req.user?.role === "teacher") {
    teacherClass = req.user.className || "";
    if (!teacherClass) {
      try {
        const pool = await getPool();
        const r = await pool.request().input("Id", sql.Int, req.user.id).query("SELECT ClassName FROM Teachers WHERE Id = @Id");
        teacherClass = r.recordset[0]?.ClassName || "";
      } catch {}
    }
    if (!teacherClass) teacherClass = null; // no class assigned = show nothing restricted
  }
  try {
    const pool = await getPool();
    const query = `
      SELECT
        Id, Subject, ClassName, SubjectsJson, QuestionIdsJson,
        Date, Time, StartAt, EndAt, LinkExpiresAt,
        DurationMinutes, NumQuestions,
        ShuffleQuestions, ShuffleOptions,
        Type, Difficulty, Status
      FROM Tests
      ${teacherClass ? "WHERE LOWER(ClassName) = LOWER(@ClassName)" : ""}
    `;
    const request = pool.request();
    if (teacherClass) request.input("ClassName", sql.NVarChar(50), teacherClass);
    const result = await request.query(query);

    const mapped = (result.recordset || []).map((row) => {
      let subjects = [];
      let questionIds = [];

      if (row.SubjectsJson) {
        try {
          subjects = JSON.parse(row.SubjectsJson) || [];
        } catch {}
      }
      if (row.QuestionIdsJson) {
        try {
          questionIds = JSON.parse(row.QuestionIdsJson) || [];
        } catch {}
      }

      return {
        Id: row.Id,
        Subject: row.Subject,
        ClassName: row.ClassName,
        Subjects: subjects,
        QuestionIds: questionIds,
        Date: row.Date,
        Time: row.Time,
        StartAt: row.StartAt,
        EndAt: row.EndAt,
        LinkExpiresAt: row.LinkExpiresAt,
        DurationMinutes: row.DurationMinutes,
        NumQuestions: row.NumQuestions,
        ShuffleQuestions: row.ShuffleQuestions,
        ShuffleOptions: row.ShuffleOptions,
        Type: row.Type,
        Difficulty: row.Difficulty,
        Status: row.Status,
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error("Error fetching tests", err);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

/* ---------------- CREATE test ---------------- */
router.post("/", verifyToken, async (req, res) => {
  const {
    subject,
    className,
    subjects = [],
    date,
    time,
    durationMinutes,
    numQuestions,
    shuffleQuestions,
    shuffleOptions,
    type = "Objective",
    difficulty,
    status,
    startAt,
    endAt,
    linkExpiresAt,
    questionIds = [],
  } = req.body || {};

  if (!subject || !className || !date || !time) {
    return res.status(400).json({ error: "subject, className, date, time are required" });
  }

  // Teachers can only create tests for their own class
  if (req.user?.role === "teacher" && req.user.className) {
    if (req.user.className.toLowerCase() !== className.toLowerCase()) {
      return res.status(403).json({ error: "You can only create tests for your assigned class" });
    }
  }

  const subjectsJson =
    Array.isArray(subjects) && subjects.length
      ? JSON.stringify(subjects)
      : null;

  const questionIdsJson =
    Array.isArray(questionIds) && questionIds.length
      ? JSON.stringify(questionIds)
      : null;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("Subject", sql.NVarChar(200), subject)
      .input("ClassName", sql.NVarChar(50), className)
      .input("SubjectsJson", sql.NVarChar(sql.MAX), subjectsJson)
      .input("QuestionIdsJson", sql.NVarChar(sql.MAX), questionIdsJson)
      .input("Date", sql.Date, date)
      .input("Time", sql.VarChar(10), time)
      .input("StartAt", sql.DateTime, startAt || null)
      .input("EndAt", sql.DateTime, endAt || null)
      .input("LinkExpiresAt", sql.DateTime, linkExpiresAt || null)
      .input("DurationMinutes", sql.Int, durationMinutes || 30)
      .input("NumQuestions", sql.Int, numQuestions || null)
      .input("ShuffleQuestions", sql.Bit, shuffleQuestions ? 1 : 0)
      .input("ShuffleOptions", sql.Bit, shuffleOptions ? 1 : 0)
      .input("Type", sql.NVarChar(50), type || "Objective")
      .input("Difficulty", sql.NVarChar(50), difficulty || "Easy")
      .input("Status", sql.NVarChar(50), status || "Scheduled")
      .query(`
        INSERT INTO Tests
        (Subject, ClassName, SubjectsJson, QuestionIdsJson, Date, Time,
         StartAt, EndAt, LinkExpiresAt,
         DurationMinutes, NumQuestions,
         ShuffleQuestions, ShuffleOptions,
         Type, Difficulty, Status)
        OUTPUT INSERTED.Id
        VALUES
        (@Subject, @ClassName, @SubjectsJson, @QuestionIdsJson, @Date, @Time,
         @StartAt, @EndAt, @LinkExpiresAt,
         @DurationMinutes, @NumQuestions,
         @ShuffleQuestions, @ShuffleOptions,
         @Type, @Difficulty, @Status)
      `);

    res.status(201).json({
      message: "Test created",
      id: result.recordset?.[0]?.Id,
    });
  } catch (err) {
    console.error("Error creating test", err);
    res.status(500).json({ error: "Failed to create test" });
  }
});

/* ---------------- UPDATE test status ---------------- */
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("Id", sql.Int, Number(id))
      .input("Status", sql.NVarChar(50), status)
      .query("UPDATE Tests SET Status = @Status WHERE Id = @Id");

    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("Error updating test status", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

/* ---------------- DELETE test ---------------- */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    // Delete the test
    const result = await pool
      .request()
      .input("Id", sql.Int, Number(id))
      .query("DELETE FROM Tests WHERE Id = @Id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Test not found" });
    }

    res.json({ message: "Test deleted" });
  } catch (err) {
    console.error("Error deleting test", err);
    res.status(500).json({ error: "Failed to delete test" });
  }
});

module.exports = router;
