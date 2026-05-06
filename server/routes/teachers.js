const express = require("express");
const router = express.Router();
const { sql, getPool } = require("../config/db");
const { verifyToken, requireAdmin } = require("../utils/authMiddleware");
const bcrypt = require("bcryptjs");

// All routes here should ideally be protected.
// For now, we apply requireAdmin to POST (creating teachers)
// and maybe just verifyToken to GET (so admins or other teachers can see).

/* ---------------- GET teachers ---------------- */
router.get("/", verifyToken, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT Id, TeacherName, MobileNumber, CreatedAt FROM Teachers ORDER BY TeacherName ASC");
    res.json(result.recordset || []);
  } catch (err) {
    console.error("Error fetching teachers", err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

/* ---------------- CREATE teacher (Admin only) ---------------- */
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  const { teacherName, mobileNumber, password } = req.body || {};

  if (!teacherName || !mobileNumber || !password) {
    return res.status(400).json({ error: "TeacherName, MobileNumber, and Password are required" });
  }

  try {
    const pool = await getPool();
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input("TeacherName", sql.NVarChar(200), teacherName)
      .input("MobileNumber", sql.NVarChar(20), mobileNumber)
      .input("PasswordHash", sql.NVarChar, passwordHash)
      .query(`
        INSERT INTO Teachers (TeacherName, MobileNumber, PasswordHash)
        OUTPUT INSERTED.Id
        VALUES (@TeacherName, @MobileNumber, @PasswordHash)
      `);

    res.status(201).json({
      message: "Teacher registered successfully",
      id: result.recordset[0].Id
    });
  } catch (err) {
    console.error("Error creating teacher", err);
    if (err.message.includes("UNIQUE KEY constraint")) {
       return res.status(400).json({ error: "Mobile number already registered" });
    }
    res.status(500).json({ error: "Failed to register teacher" });
  }
});

/* ---------------- DELETE teacher (Admin only) ---------------- */
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input("Id", sql.Int, Number(id))
      .query("DELETE FROM Teachers WHERE Id = @Id");
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    console.error("Error deleting teacher", err);
    res.status(500).json({ error: "Failed to delete teacher" });
  }
});

module.exports = router;
