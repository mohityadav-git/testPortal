import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand-inline">
            <span className="brand-icon small" aria-hidden="true" />
            <div>
              <div className="brand-name">MDDM Inter College</div>
              <div className="brand-caption">Where every mind shines</div>
            </div>
          </div>
          <p className="footer-text">
            Nurturing curiosity and excellence with a blend of academics and creativity.
          </p>
        </div>

        <div>
          <h4 className="footer-title">Explore</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/student">Student Dashboard</Link>
            </li>
            <li>
              <Link to="/teacher">Teacher Dashboard</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="footer-title">Contact</h4>
          <ul className="footer-links">
            <li>Email: info@mddmcollege.edu</li>
            <li>Phone: +91-90000-12345</li>
            <li>Address: MDDM Inter College Campus</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MDDM Inter College. All rights reserved.</span>
        <div className="footer-actions">
          <button type="button" className="btn btn-outline btn-sm">
            Apply Now
          </button>
          <button type="button" className="btn btn-primary btn-sm">
            Get Prospectus
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
