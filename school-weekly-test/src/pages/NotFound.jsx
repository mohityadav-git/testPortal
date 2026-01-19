import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page-container">
      <h1>404 - Page Not Found</h1>
      <p className="subtitle">
        The page you are looking for does not exist. Go back to login.
      </p>
      <Link to="/" className="btn btn-primary">
        Go to Login
      </Link>
    </div>
  );
}

export default NotFound;
