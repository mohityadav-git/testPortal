require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getPool, sql } = require("./config/db");

const testsRouter = require("./routes/tests");
const questionsRouter = require("./routes/questions");
const resultsRouter = require("./routes/results");
const studentsRouter = require("./routes/students");
const uploadsRouter = require("./routes/uploads");
const studyMaterialsRouter = require("./routes/studyMaterials");
const authRouter = require("./routes/auth");
const teachersRouter = require("./routes/teachers");
const path = require("path");

const app = express();

// CORS: allow localhost in dev, production domain in prod
const allowedOrigins = [
  "http://localhost:3000",
  "https://mddmcollege.com",
  "https://www.mddmcollege.com",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded files (question images, study materials)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve React production build (populated by running npm run build in school-weekly-test/)
const buildPath = path.join(__dirname, "public");
app.use(express.static(buildPath));

app.get("/health", async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.use("/tests", testsRouter);
app.use("/questions", questionsRouter);
app.use("/results", resultsRouter);
app.use("/students", studentsRouter);
app.use("/uploads", uploadsRouter);
app.use("/study-materials", studyMaterialsRouter);
app.use("/auth", authRouter);
app.use("/teachers", teachersRouter);

const ensureColumn = async (table, column, definition) => {
  const pool = await getPool();
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
  const pool = await getPool();
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
    await getPool();
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
          PasswordHash NVARCHAR(MAX) NULL,
          CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
        )
      `
    );
    await ensureColumn("Students", "PasswordHash", "NVARCHAR(MAX) NULL");
    
    await ensureTable(
      "Teachers",
      `
        CREATE TABLE Teachers (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          TeacherName NVARCHAR(200) NOT NULL,
          MobileNumber NVARCHAR(20) NOT NULL UNIQUE,
          PasswordHash NVARCHAR(MAX) NULL,
          CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
        )
      `
    );
    await ensureColumn("Teachers", "ClassName", "NVARCHAR(50) NULL");
    
    await ensureTable(
      "Admins",
      `
        CREATE TABLE Admins (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          Username NVARCHAR(50) NOT NULL UNIQUE,
          PasswordHash NVARCHAR(MAX) NOT NULL,
          CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
        )
      `
    );
  } catch (err) {
    console.warn("Schema check failed", err?.message);
  }
};

ensureSchema();

// Catch-all: serve React app for any route not matched by the API
// This MUST be after all API routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});