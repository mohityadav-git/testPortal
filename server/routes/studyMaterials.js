const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { pool, sql, poolConnect } = require("../config/db");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "study_material", ext).replace(/[^a-z0-9-_]/gi, "_");
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `${base}_${unique}${ext}`);
  },
});

const allowedMimes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && allowedMimes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or Word documents are allowed."));
    }
  },
});

const toIsoDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const getWeekStart = (value) => {
  const base = value ? new Date(value) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  const day = base.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diff);
  return toIsoDate(start);
};

router.get("/", async (req, res) => {
  const { subject, className, weekStart } = req.query || {};
  const safeWeekStart = getWeekStart(weekStart);
  const subjectKey = subject ? String(subject).trim() : null;
  const classKey = className ? String(className).trim() : null;
  try {
    await poolConnect;
    const result = await pool
      .request()
      .input("Subject", sql.NVarChar(200), subjectKey || null)
      .input("ClassName", sql.NVarChar(50), classKey || null)
      .input("WeekStart", sql.Date, safeWeekStart)
      .query(
        `
          SELECT Id, Title, Subject, ClassName, WeekStart, FileUrl, FileName, TeacherName, UploadedAt
          FROM StudyMaterials
          WHERE (@Subject IS NULL OR LOWER(Subject) = LOWER(@Subject))
            AND (@ClassName IS NULL OR LOWER(REPLACE(ClassName, ' ', '')) = LOWER(REPLACE(@ClassName, ' ', '')))
            AND (
              @WeekStart IS NULL
              OR WeekStart = @WeekStart
              OR (WeekStart >= @WeekStart AND WeekStart < DATEADD(day, 7, @WeekStart))
              OR (WeekStart IS NULL AND UploadedAt >= @WeekStart AND UploadedAt < DATEADD(day, 7, @WeekStart))
            )
          ORDER BY UploadedAt DESC
        `
      );
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Error fetching study materials", err);
    res.status(500).json({ error: "Failed to fetch study materials" });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  const { title, subject, className, weekStart, teacherName } = req.body || {};
  if (!subject || !className) {
    return res.status(400).json({ error: "subject and className are required" });
  }
  if (!req.file) {
    return res.status(400).json({ error: "file is required" });
  }
  const host = `${req.protocol}://${req.get("host")}`;
  const fileUrl = `${host}/uploads/${req.file.filename}`;
  const safeWeekStart = getWeekStart(weekStart);
  try {
    await poolConnect;
    const result = await pool
      .request()
      .input("Title", sql.NVarChar(200), title || "Study material")
      .input("Subject", sql.NVarChar(200), subject)
      .input("ClassName", sql.NVarChar(50), className)
      .input("WeekStart", sql.Date, safeWeekStart)
      .input("FileUrl", sql.NVarChar(sql.MAX), fileUrl)
      .input("FileName", sql.NVarChar(260), req.file.originalname || req.file.filename)
      .input("TeacherName", sql.NVarChar(200), teacherName || null)
      .query(
        `
          INSERT INTO StudyMaterials (Title, Subject, ClassName, WeekStart, FileUrl, FileName, TeacherName)
          OUTPUT INSERTED.Id
          VALUES (@Title, @Subject, @ClassName, @WeekStart, @FileUrl, @FileName, @TeacherName)
        `
      );
    const insertedId = result.recordset?.[0]?.Id;
    res.status(201).json({
      message: "Study material uploaded",
      id: insertedId,
      fileUrl,
      weekStart: safeWeekStart,
    });
  } catch (err) {
    console.error("Error creating study material", err);
    res.status(500).json({ error: "Failed to upload study material" });
  }
});

module.exports = router;
