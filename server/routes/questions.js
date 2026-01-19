const express = require("express");
const router = express.Router();
const { pool, sql, poolConnect } = require("../config/db");

// Get questions by subject/class (optional filters)
router.get("/", async (req, res) => {
  const { subject, className, ids } = req.query;
  let query =
    "SELECT Id, Subject, ClassName, QuestionText, Section, Marks, OptionsJson, CorrectIndex, Difficulty, ImageUrl FROM Questions";
  const filters = [];
  if (subject) filters.push(`Subject = @Subject`);
  if (className) filters.push(`ClassName = @ClassName`);
  const hasIdsParam = ids !== undefined && ids !== null && String(ids).trim() !== "";
  const idList = hasIdsParam
    ? String(ids)
        .split(",")
        .map((val) => Number(String(val).trim()))
        .filter((val) => Number.isFinite(val))
    : [];
  if (hasIdsParam && idList.length === 0) {
    return res.json([]);
  }
  if (idList.length > 0) {
    const tokens = idList.map((_, idx) => `@Id${idx}`);
    filters.push(`Id IN (${tokens.join(", ")})`);
  }
  if (filters.length) query += " WHERE " + filters.join(" AND ");

  try {
    await poolConnect;
    const request = pool.request();
    if (subject) request.input("Subject", sql.NVarChar(200), subject);
    if (className) request.input("ClassName", sql.NVarChar(50), className);
    idList.forEach((id, idx) => {
      request.input(`Id${idx}`, sql.Int, id);
    });
    const result = await request.query(query);
    const mapped = result.recordset.map((row) => {
      let options = [];
      if (row.OptionsJson) {
        try {
          options = JSON.parse(row.OptionsJson) || [];
        } catch (err) {
          console.warn("Could not parse OptionsJson", err?.message);
          options = [];
        }
      }
      return {
        Id: row.Id,
        Subject: row.Subject,
        ClassName: row.ClassName,
        QuestionText: row.QuestionText,
        Section: row.Section,
        Marks: row.Marks,
        Options: options,
        CorrectIndex: row.CorrectIndex,
        Difficulty: row.Difficulty,
        ImageUrl: row.ImageUrl,
      };
    });
    res.json(mapped);
  } catch (err) {
    console.error("Error fetching questions", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Create a question
router.post("/", async (req, res) => {
  const {
    subject,
    className,
    questionText,
    difficulty,
    options = [],
    correctIndex = 0,
    section = null,
    imageUrl = null,
    marks = 1,
  } = req.body || {};
  if (!subject || !className || !questionText) {
    return res.status(400).json({ error: "subject, className, questionText are required" });
  }

  const optionsJson =
    Array.isArray(options) && options.length > 0 ? JSON.stringify(options) : null;
  const safeCorrectIndex =
    Array.isArray(options) && options.length > 0
      ? Math.min(Math.max(Number(correctIndex) || 0, 0), options.length - 1)
      : null;

  try {
    await poolConnect;
    await pool
      .request()
      .input("Subject", sql.NVarChar(200), subject)
      .input("ClassName", sql.NVarChar(50), className)
      .input("QuestionText", sql.NVarChar(sql.MAX), questionText)
      .input("Section", sql.NVarChar(200), section)
      .input("ImageUrl", sql.NVarChar(sql.MAX), imageUrl)
      .input("Marks", sql.Int, Number(marks) || 1)
      .input("OptionsJson", sql.NVarChar(sql.MAX), optionsJson)
      .input("CorrectIndex", sql.Int, safeCorrectIndex)
      .input("Difficulty", sql.NVarChar(50), difficulty || "Easy")
      .query(`
        INSERT INTO Questions (Subject, ClassName, QuestionText, Section, ImageUrl, Marks, OptionsJson, CorrectIndex, Difficulty)
        VALUES (@Subject, @ClassName, @QuestionText, @Section, @ImageUrl, @Marks, @OptionsJson, @CorrectIndex, @Difficulty)
      `);
    res.status(201).json({ message: "Question created" });
  } catch (err) {
    console.error("Error creating question", err);
    res.status(500).json({ error: "Failed to create question" });
  }
});

// Update a question (difficulty/marks/section)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { difficulty, marks, section } = req.body || {};
  const updates = [];
  if (difficulty !== undefined) updates.push("Difficulty = @Difficulty");
  if (marks !== undefined) updates.push("Marks = @Marks");
  if (section !== undefined) updates.push("Section = @Section");
  if (updates.length === 0) {
    return res.status(400).json({ error: "No updatable fields provided" });
  }

  try {
    await poolConnect;
    const request = pool.request().input("Id", sql.Int, Number(id));
    if (difficulty !== undefined) {
      request.input("Difficulty", sql.NVarChar(50), difficulty || "Easy");
    }
    if (marks !== undefined) {
      request.input("Marks", sql.Int, Number(marks) || 1);
    }
    if (section !== undefined) {
      request.input("Section", sql.NVarChar(200), section || null);
    }
    await request.query(`UPDATE Questions SET ${updates.join(", ")} WHERE Id = @Id`);
    res.json({ message: "Question updated" });
  } catch (err) {
    console.error("Error updating question", err);
    res.status(500).json({ error: "Failed to update question" });
  }
});

// Delete a question
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    await pool.request().input("Id", sql.Int, Number(id)).query("DELETE FROM Questions WHERE Id = @Id");
    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error("Error deleting question", err);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

module.exports = router;
