const express = require("express");
const router = express.Router();
const { sql, getPool } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/authMiddleware");

// In-memory OTP store for testing purposes
// Key: "rollNumber:mobileNumber", Value: { otp, expiresAt }
const otpStore = new Map();

/* ---------------- ADMIN LOGIN ---------------- */
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("Username", sql.NVarChar(50), username)
      .query("SELECT * FROM Admins WHERE Username = @Username");

    const admin = result.recordset[0];
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.Id, role: "admin", username: admin.Username }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ message: "Login successful", token, role: "admin" });
  } catch (err) {
    console.error("Admin login error", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- TEACHER SETUP ---------------- */
router.post("/teacher/setup", async (req, res) => {
  const { mobileNumber, newPassword } = req.body || {};

  if (!mobileNumber || !newPassword) {
    return res.status(400).json({ error: "Mobile number and new password are required" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("MobileNumber", sql.NVarChar(20), mobileNumber)
      .query("SELECT * FROM Teachers WHERE MobileNumber = @MobileNumber");

    const teacher = result.recordset[0];
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    if (teacher.PasswordHash) {
      return res.status(400).json({ error: "Password already setup for this teacher" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input("Id", sql.Int, teacher.Id)
      .input("PasswordHash", sql.NVarChar, hash)
      .query("UPDATE Teachers SET PasswordHash = @PasswordHash WHERE Id = @Id");

    res.json({ message: "Password setup successful" });
  } catch (err) {
    console.error("Teacher setup error", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- TEACHER LOGIN ---------------- */
router.post("/teacher/login", async (req, res) => {
  const { mobileNumber, password } = req.body || {};

  if (!mobileNumber || !password) {
    return res.status(400).json({ error: "Mobile number and password are required" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("MobileNumber", sql.NVarChar(20), mobileNumber)
      .query("SELECT * FROM Teachers WHERE MobileNumber = @MobileNumber");

    const teacher = result.recordset[0];
    if (!teacher || !teacher.PasswordHash) {
      return res.status(401).json({ error: "Invalid credentials or password not set up" });
    }

    const isMatch = await bcrypt.compare(password, teacher.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: teacher.Id, role: "teacher", name: teacher.TeacherName, className: teacher.ClassName || "" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({
      message: "Login successful",
      token,
      role: "teacher",
      name: teacher.TeacherName,
      className: teacher.ClassName || "",
    });
  } catch (err) {
    console.error("Teacher login error", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- STUDENT OTP SEND ---------------- */
router.post("/student/send-otp", async (req, res) => {
  const { rollNumber, mobileNumber } = req.body || {};

  if (!rollNumber || !mobileNumber) {
    return res.status(400).json({ error: "Roll number and mobile number are required" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("RollNumber", sql.NVarChar(50), rollNumber)
      .input("MobileNumber", sql.NVarChar(20), mobileNumber)
      .query("SELECT * FROM Students WHERE RollNumber = @RollNumber AND MobileNumber = @MobileNumber");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Student not found with matching roll number and mobile number" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(`${rollNumber}:${mobileNumber}`, { otp, expiresAt });

    // In a real app, send OTP via SMS here
    console.log(`[MOCK SMS] OTP for Student ${rollNumber} (${mobileNumber}) is: ${otp}`);

    res.json({ message: "OTP sent successfully" }); // For testing, you could return the OTP in response if desired, but we logged it to the console.
  } catch (err) {
    console.error("Student send OTP error", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- STUDENT SETUP/UPDATE PASSWORD ---------------- */
router.post("/student/setup", async (req, res) => {
  const { rollNumber, mobileNumber, otp, newPassword } = req.body || {};

  if (!rollNumber || !mobileNumber || !otp || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const storedOtpData = otpStore.get(`${rollNumber}:${mobileNumber}`);
  if (!storedOtpData) {
    return res.status(400).json({ error: "OTP not requested or expired" });
  }

  if (Date.now() > storedOtpData.expiresAt) {
    otpStore.delete(`${rollNumber}:${mobileNumber}`);
    return res.status(400).json({ error: "OTP expired" });
  }

  if (storedOtpData.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  try {
    const pool = await getPool();
    const hash = await bcrypt.hash(newPassword, 10);
    
    await pool.request()
      .input("RollNumber", sql.NVarChar(50), rollNumber)
      .input("MobileNumber", sql.NVarChar(20), mobileNumber)
      .input("PasswordHash", sql.NVarChar, hash)
      .query("UPDATE Students SET PasswordHash = @PasswordHash WHERE RollNumber = @RollNumber AND MobileNumber = @MobileNumber");

    // Clear OTP after successful use
    otpStore.delete(`${rollNumber}:${mobileNumber}`);

    res.json({ message: "Password set successfully" });
  } catch (err) {
    console.error("Student setup error", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- STUDENT LOGIN ---------------- */
router.post("/student/login", async (req, res) => {
  const { rollNumber, mobileNumber, password } = req.body || {};

  if (!rollNumber || !mobileNumber || !password) {
    return res.status(400).json({ error: "Roll number, mobile number, and password are required" });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("RollNumber", sql.NVarChar(50), rollNumber)
      .input("MobileNumber", sql.NVarChar(20), mobileNumber)
      .query("SELECT * FROM Students WHERE RollNumber = @RollNumber AND MobileNumber = @MobileNumber");

    const student = result.recordset[0];
    if (!student || !student.PasswordHash) {
      return res.status(401).json({ error: "Invalid credentials or password not set up" });
    }

    const isMatch = await bcrypt.compare(password, student.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: student.Id, role: "student", name: student.StudentName }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ message: "Login successful", token, role: "student", name: student.StudentName });
  } catch (err) {
    console.error("Student login error", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
