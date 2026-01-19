require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, poolConnect, sql } = require("./config/db");

const testsRouter = require("./routes/tests");
const questionsRouter = require("./routes/questions");
const resultsRouter = require("./routes/results");
const studentsRouter = require("./routes/students");
const uploadsRouter = require("./routes/uploads");
const studyMaterialsRouter = require("./routes/studyMaterials");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", async (_req, res) => {
  try {
    await poolConnect;
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.use("/api/tests", testsRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/results", resultsRouter);
app.use("/api/students", studentsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/study-materials", studyMaterialsRouter);

const ensureColumn = async (table, column, definition) => {
  const result = await pool
    .request()
    .input("TableName", sql.NVarChar(128), table)
    .input("ColumnName", sql.NVarChar(128), column)
    .query(
      `
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @TableName AND COLUMN_NAME = @ColumnName
      `
    );
  if (result.recordset.length === 0) {
    await pool.request().query(`ALTER TABLE ${table} ADD ${column} ${definition}`);
    console.log(`Added ${column} column to ${table} table.`);
  }
};

const ensureTable = async (table, createSql) => {
  const result = await pool
    .request()
    .input("TableName", sql.NVarChar(128), table)
    .query(
      `
        SELECT 1
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = @TableName
      `
    );
  if (result.recordset.length === 0) {
    await pool.request().query(createSql);
    console.log(`Created ${table} table.`);
  }
};

const ensureSchema = async () => {
  try {
    await poolConnect;
    await ensureColumn("Questions", "ImageUrl", "NVARCHAR(MAX) NULL");
    await ensureColumn("Tests", "QuestionIdsJson", "NVARCHAR(MAX) NULL");
    await ensureColumn("Tests", "StartAt", "DATETIME NULL");
    await ensureColumn("Tests", "EndAt", "DATETIME NULL");
    await ensureColumn("Tests", "LinkExpiresAt", "DATETIME NULL");
    await ensureTable(
      "StudyMaterials",
      `
        CREATE TABLE StudyMaterials (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          Title NVARCHAR(200) NOT NULL DEFAULT 'Study material',
          Subject NVARCHAR(200) NOT NULL,
          ClassName NVARCHAR(50) NOT NULL,
          WeekStart DATE NULL,
          FileUrl NVARCHAR(MAX) NOT NULL,
          FileName NVARCHAR(260) NULL,
          TeacherName NVARCHAR(200) NULL,
          UploadedAt DATETIME NOT NULL DEFAULT GETDATE()
        )
      `
    );
    await ensureTable(
      "Students",
      `
        CREATE TABLE Students (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          StudentName NVARCHAR(200) NOT NULL,
          ClassName NVARCHAR(50) NOT NULL,
          RollNumber NVARCHAR(50) NULL,
          MobileNumber NVARCHAR(20) NULL,
          CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
        )
      `
    );
  } catch (err) {
    console.warn("Schema check failed", err?.message);
  }
};

ensureSchema();

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
