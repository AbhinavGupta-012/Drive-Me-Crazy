import React from "react";
import { Link } from "react-router-dom"; // Keep only Link
import "./header.css"; // Import CSS file

function Header() {
  return (
    <nav className="nav">
      <ul>
        <li>Ride</li>
        <li>Drive</li>
        <li>Business</li>
        <li>About</li>
        <li>Help</li>
      </ul>
      <div className="auth-buttons">
        <Link to="/signup"><button>Sign In</button></Link>
        <Link to="/signup"><button>Register</button></Link>
      </div>
    </nav>
  );
}

export default Header;
