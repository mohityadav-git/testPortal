import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });
  // user = { name, role, className }

  const loginStudent = (name, className, rollNumber) => {
    setUser({ name, role: "student", className, rollNumber });
  };

  const loginTeacher = (name, className = "") => {
    setUser({ name, role: "teacher", className });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loginStudent, loginTeacher, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
