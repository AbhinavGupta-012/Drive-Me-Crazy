import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap Icons
import "./sign.css"; // Import CSS file

function Sign() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Invalid email format");
      return;
    }

    setError("");
    alert("Sign-in successful!");
    navigate("/");
  };

  return (
    <div className="sign-container">
      <div className="sign-box">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}

          <div className="input-group">
            <i className="bi bi-person"></i> {/* Bootstrap Icon */}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="bi bi-lock"></i> {/* Bootstrap Icon */}
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit">Sign In</button>
        </form>

        <p className="register-link">
          Don't have an account? <a href="/signup">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Sign;
