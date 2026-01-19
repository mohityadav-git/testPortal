const express = require("express");
const router = express.Router();
const { pool, sql, poolConnect } = require("../config/db");

// Get students (optionally by class)
router.get("/", async (req, res) => {
  const { className, rollNumber, studentName } = req.query || {};
  let query =
    "SELECT Id, StudentName, ClassName, RollNumber, MobileNumber, CreatedAt FROM Students";
  const filters = [];
  if (className) filters.push("LOWER(ClassName) = LOWER(@ClassName)");
  if (rollNumber) filters.push("LOWER(RollNumber) = LOWER(@RollNumber)");
  if (studentName) filters.push("LOWER(StudentName) = LOWER(@StudentName)");
  if (filters.length) query += " WHERE " + filters.join(" AND ");
  query += " ORDER BY StudentName ASC";

  try {
    await poolConnect;
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

// Create a student
router.post("/", async (req, res) => {
  const { studentName, className, rollNumber, mobileNumber } = req.body || {};
  if (!studentName || !className) {
    return res.status(400).json({ error: "studentName and className are required" });
  }
  try {
    await poolConnect;
    const result = await pool
      .request()
      .input("StudentName", sql.NVarChar(200), studentName)
      .input("ClassName", sql.NVarChar(50), className)
      .input("RollNumber", sql.NVarChar(50), rollNumber || null)
      .input("MobileNumber", sql.NVarChar(20), mobileNumber || null)
      .query(
        `
          INSERT INTO Students (StudentName, ClassName, RollNumber, MobileNumber)
          OUTPUT INSERTED.Id
          VALUES (@StudentName, @ClassName, @RollNumber, @MobileNumber)
        `
      );
    res.status(201).json({ message: "Student created", id: result.recordset?.[0]?.Id });
  } catch (err) {
    console.error("Error creating student", err);
    res.status(500).json({ error: "Failed to create student" });
  }
});

// Update a student
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { studentName, rollNumber, mobileNumber } = req.body || {};
  const updates = [];
  if (studentName !== undefined) updates.push("StudentName = @StudentName");
  if (rollNumber !== undefined) updates.push("RollNumber = @RollNumber");
  if (mobileNumber !== undefined) updates.push("MobileNumber = @MobileNumber");
  if (updates.length === 0) {
    return res.status(400).json({ error: "No updatable fields provided" });
  }
  try {
    await poolConnect;
    const request = pool.request().input("Id", sql.Int, Number(id));
    if (studentName !== undefined) request.input("StudentName", sql.NVarChar(200), studentName);
    if (rollNumber !== undefined) request.input("RollNumber", sql.NVarChar(50), rollNumber || null);
    if (mobileNumber !== undefined) request.input("MobileNumber", sql.NVarChar(20), mobileNumber || null);
    await request.query(`UPDATE Students SET ${updates.join(", ")} WHERE Id = @Id`);
    res.json({ message: "Student updated" });
  } catch (err) {
    console.error("Error updating student", err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

// Delete a student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await poolConnect;
    await pool.request().input("Id", sql.Int, Number(id)).query("DELETE FROM Students WHERE Id = @Id");
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("Error deleting student", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;
