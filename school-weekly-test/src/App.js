import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TestAttempt from "./pages/TestAttempt";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Routes>
          {/* Separate login pages per role - students only see student login */}
          <Route path="/" element={<Login mode="student" />} />
          <Route path="/login" element={<Login mode="student" />} />
          <Route path="/teacher-login" element={<Login mode="teacher" />} />
          <Route path="/admin-login" element={<Login mode="admin" />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <TeacherDashboard isAdmin={true} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/test/:testId"
            element={
              <ProtectedRoute role="student">
                <TestAttempt />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
