const express = require("express");
const router = express.Router();
const { sql, getPool } = require("../config/db");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("../utils/authMiddleware");

/* ---------------- GET students ---------------- */
router.get("/", verifyToken, async (req, res) => {
  let { className, rollNumber, studentName } = req.query || {};

  // Teachers can only see students from their own class
  if (req.user?.role === "teacher") {
    let teacherClassName = req.user.className || "";
    // If className not in token (old sessions), look it up from DB
    if (!teacherClassName) {
      try {
        const pool = await getPool();
        const result = await pool.request()
          .input("Id", sql.Int, req.user.id)
          .query("SELECT ClassName FROM Teachers WHERE Id = @Id");
        teacherClassName = result.recordset[0]?.ClassName || "";
      } catch {}
    }
    if (teacherClassName) className = teacherClassName;
  }

  let query =
    "SELECT Id, StudentName, ClassName, RollNumber, MobileNumber, CreatedAt, CASE WHEN PasswordHash IS NOT NULL THEN 1 ELSE 0 END AS HasPassword FROM Students";

  const filters = [];
  if (className) filters.push("LOWER(ClassName) = LOWER(@ClassName)");
  if (rollNumber) filters.push("LOWER(RollNumber) = LOWER(@RollNumber)");
  if (studentName) filters.push("LOWER(StudentName) = LOWER(@StudentName)");
  if (filters.length) query += " WHERE " + filters.join(" AND ");
  query += " ORDER BY StudentName ASC";

  try {
    const pool = await getPool();
    const request = pool.request();

    if (className) request.input("ClassName", sql.NVarChar(50), className);
    if (rollNumber) request.input("RollNumber", sql.NVarChar(50), rollNumber);
    if (studentName) request.input("StudentName", sql.NVarChar(200), studentName);

    const result = await request.query(query);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Error fetching students", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

/* ---------------- CREATE student ---------------- */
router.post("/", async (req, res) => {
  const { studentName, className, rollNumber, mobileNumber } = req.body || {};

  if (!studentName || !className) {
    return res
      .status(400)
      .json({ error: "studentName and className are required" });
  }

  try {
    const pool = await getPool();

    // Check if roll number is unique within the class
    if (rollNumber) {
      const checkResult = await pool
        .request()
        .input("ClassName", sql.NVarChar(50), className)
        .input("RollNumber", sql.NVarChar(50), rollNumber)
        .query(`SELECT Id FROM Students WHERE ClassName = @ClassName AND RollNumber = @RollNumber`);

      if (checkResult.recordset.length > 0) {
        return res.status(400).json({ error: `Roll number ${rollNumber} already exists in ${className}` });
      }
    }

    const result = await pool
      .request()
      .input("StudentName", sql.NVarChar(200), studentName)
      .input("ClassName", sql.NVarChar(50), className)
      .input("RollNumber", sql.NVarChar(50), rollNumber || null)
      .input("MobileNumber", sql.NVarChar(20), mobileNumber || null)
      .query(`
        INSERT INTO Students (StudentName, ClassName, RollNumber, MobileNumber, CreatedAt)
        OUTPUT INSERTED.Id
        VALUES (@StudentName, @ClassName, @RollNumber, @MobileNumber, GETDATE())
      `);

    res.status(201).json({
      message: "Student created",
      id: result.recordset?.[0]?.Id,
    });
  } catch (err) {
    console.error("Error creating student", err);
    res.status(500).json({ error: "Failed to create student" });
  }
});

/* ---------------- UPDATE student ---------------- */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { studentName, rollNumber, mobileNumber } = req.body || {};

  try {
    const pool = await getPool();

    // If rollNumber is changing, check for uniqueness within the student's class
    if (rollNumber !== undefined && rollNumber !== null) {
      const studentInfo = await pool.request()
        .input("Id", sql.Int, id)
        .query("SELECT ClassName FROM Students WHERE Id = @Id");
      
      const className = studentInfo.recordset[0]?.ClassName;
      if (className) {
        const checkResult = await pool
          .request()
          .input("Id", sql.Int, id)
          .input("ClassName", sql.NVarChar(50), className)
          .input("RollNumber", sql.NVarChar(50), rollNumber)
          .query(`SELECT Id FROM Students WHERE ClassName = @ClassName AND RollNumber = @RollNumber AND Id <> @Id`);

        if (checkResult.recordset.length > 0) {
          return res.status(400).json({ error: `Roll number ${rollNumber} already exists in ${className}` });
        }
      }
    }

    const updates = [];
    const request = pool.request().input("Id", sql.Int, Number(id));

    if (studentName !== undefined) {
      updates.push("StudentName = @StudentName");
      request.input("StudentName", sql.NVarChar(200), studentName);
    }
    if (rollNumber !== undefined) {
      updates.push("RollNumber = @RollNumber");
      request.input("RollNumber", sql.NVarChar(50), rollNumber || null);
    }
    if (mobileNumber !== undefined) {
      updates.push("MobileNumber = @MobileNumber");
      request.input("MobileNumber", sql.NVarChar(20), mobileNumber || null);
    }

    if (!updates.length) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    await request.query(`UPDATE Students SET ${updates.join(", ")} WHERE Id = @Id`);

    res.json({ message: "Student updated" });
  } catch (err) {
    console.error("Error updating student", err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

/* ---------------- DELETE student ---------------- */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    await pool
      .request()
      .input("Id", sql.Int, Number(id))
      .query("DELETE FROM Students WHERE Id = @Id");

    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("Error deleting student", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

/* ---------------- SET student password (by teacher) ---------------- */
router.patch("/:id/set-password", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body || {};

  if (!password || password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }

  try {
    const pool = await getPool();
    const hash = await bcrypt.hash(password, 10);
    await pool
      .request()
      .input("Id", sql.Int, Number(id))
      .input("PasswordHash", sql.NVarChar, hash)
      .query("UPDATE Students SET PasswordHash = @PasswordHash WHERE Id = @Id");

    res.json({ message: "Password set successfully" });
  } catch (err) {
    console.error("Error setting student password", err);
    res.status(500).json({ error: "Failed to set password" });
  }
});

module.exports = router;
