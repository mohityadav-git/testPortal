const express = require("express");
const router = express.Router();
const { sql, getPool } = require("../config/db");

/* ---------------- GET results ---------------- */
router.get("/", async (req, res) => {
  const { className, subject, studentName } = req.query;

  let query =
    "SELECT Id, TestId, StudentName, ClassName, Subject, Score, OutOf, SubmittedAt, AnswersJson FROM Results";

  const filters = [];
  if (className) filters.push("ClassName = @ClassName");
  if (subject) filters.push("Subject = @Subject");
  if (studentName) filters.push("StudentName = @StudentName");
  if (filters.length) query += " WHERE " + filters.join(" AND ");

  try {
    const pool = await getPool();
    const request = pool.request();

    if (className)
      request.input("ClassName", sql.NVarChar(50), className);
    if (subject)
      request.input("Subject", sql.NVarChar(200), subject);
    if (studentName)
      request.input("StudentName", sql.NVarChar(200), studentName);

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Error fetching results", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

/* ---------------- CREATE result ---------------- */
router.post("/", async (req, res) => {
  const {
    testId,
    studentName,
    className,
    subject,
    score,
    outOf,
    submittedAt,
    answers,
  } = req.body || {};

  if (!studentName || !className || !subject || score == null || outOf == null) {
    return res.status(400).json({
      error: "studentName, className, subject, score, outOf are required",
    });
  }

  const safeTestId = testId == null ? null : String(testId).slice(0, 50);

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("TestId", sql.NVarChar(50), safeTestId)
      .input("StudentName", sql.NVarChar(200), studentName)
      .input("ClassName", sql.NVarChar(50), className)
      .input("Subject", sql.NVarChar(200), subject)
      .input("Score", sql.Int, Number(score))
      .input("OutOf", sql.Int, Number(outOf))
      .input("SubmittedAt", sql.DateTime, submittedAt || new Date())
      .input(
        "AnswersJson",
        sql.NVarChar(sql.MAX),
        answers ? JSON.stringify(answers) : null
      )
      .query(`
        INSERT INTO Results
        (TestId, StudentName, ClassName, Subject, Score, OutOf, SubmittedAt, AnswersJson)
        VALUES
        (@TestId, @StudentName, @ClassName, @Subject, @Score, @OutOf, @SubmittedAt, @AnswersJson)
      `);

    res.status(201).json({ message: "Result recorded" });
  } catch (err) {
    console.error("Error saving result", err);
    res.status(500).json({ error: "Failed to save result" });
  }
});

module.exports = router;
