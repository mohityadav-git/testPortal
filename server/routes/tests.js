const express = require("express");
const router = express.Router();
const { pool, sql, poolConnect } = require("../config/db");

// Get all tests
router.get("/", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool
      .request()
      .query(
        "SELECT Id, Subject, ClassName, SubjectsJson, QuestionIdsJson, Date, Time, StartAt, EndAt, LinkExpiresAt, DurationMinutes, NumQuestions, ShuffleQuestions, ShuffleOptions, Type, Difficulty, Status FROM Tests"
      );
    const mapped = result.recordset.map((row) => {
      let subjects = [];
      if (row.SubjectsJson) {
        try {
          subjects = JSON.parse(row.SubjectsJson) || [];
        } catch {
          subjects = [];
        }
      }
      let questionIds = [];
      if (row.QuestionIdsJson) {
        try {
          questionIds = JSON.parse(row.QuestionIdsJson) || [];
        } catch {
          questionIds = [];
        }
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

// Create a test
router.post("/", async (req, res) => {
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
  try {
    await poolConnect;
    const subjectsJson =
      Array.isArray(subjects) && subjects.length > 0 ? JSON.stringify(subjects) : null;
    const questionIdsJson =
      Array.isArray(questionIds) && questionIds.length > 0 ? JSON.stringify(questionIds) : null;
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
        INSERT INTO Tests (Subject, ClassName, SubjectsJson, QuestionIdsJson, Date, Time, StartAt, EndAt, LinkExpiresAt, DurationMinutes, NumQuestions, ShuffleQuestions, ShuffleOptions, Type, Difficulty, Status)
        OUTPUT INSERTED.Id
        VALUES (@Subject, @ClassName, @SubjectsJson, @QuestionIdsJson, @Date, @Time, @StartAt, @EndAt, @LinkExpiresAt, @DurationMinutes, @NumQuestions, @ShuffleQuestions, @ShuffleOptions, @Type, @Difficulty, @Status)
      `);
    const insertedId = result.recordset?.[0]?.Id;
    res.status(201).json({ message: "Test created", id: insertedId });
  } catch (err) {
    console.error("Error creating test", err);
    res.status(500).json({ error: "Failed to create test" });
  }
});

// Update test status
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: "status is required" });
  try {
    await poolConnect;
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

module.exports = router;
