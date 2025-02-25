import React from "react";
import Header from "./header"; // Import Header component
import Footer from "./footer"; // Import Footer component (if needed)
import "./App.css";
import img1 from "./images/img1.jpg";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sign from "./sign";

function App() {
  return (
    <Router>
    <div>
      <Header /> {/* Display the Navbar */}

      <Routes>
        <Route path="/signup" element={<Sign />} />
      </Routes>

      <main className="hero">
        <div className="overlay">
          <h1>Book Your Ride with Us</h1>
          <p>Reliable, Safe, and Affordable Rides Anytime</p>

          {/* Booking Form */}
          <div className="booking-form">
            <input type="text" placeholder="Enter Pickup Location" />
            <input type="text" placeholder="Enter Drop-off Location" />
            <button>Book a Ride</button>
          </div>
        </div>
        <div className="image">
          <img src={img1} alt="taxi" />
        </div>
      </main>

      <section className="services">
        <div className="service-card">
          <h2>Reserve</h2>
          <p>Plan your ride in advance for a worry-free trip.</p>
        </div>
        <div className="service-card">
          <h2>Eco-Friendly</h2>
          <p>Opt for sustainable ride options with electric vehicles.</p>
        </div>
        <div className="service-card">
          <h2>Airport Rides</h2>
          <p>Seamless airport pickups and drop-offs.</p>
        </div>
      </section>
      <section className="why-choose-us">
          <div className="why-choose-us-content">
            <h2>Why Choose Us?</h2>
            <ul>
              <li><strong>24/7 Availability:</strong> We're here for you anytime, anywhere.</li>
              <li><strong>Professional Drivers:</strong> Experienced and courteous drivers.</li>
              <li><strong>Transparent Pricing:</strong> No hidden fees, know your fare upfront.</li>
              <li><strong>Safe and Reliable:</strong> Your safety is our top priority.</li>
            </ul>
          </div>
        </section>

      <Footer />
    </div>
  </Router>
  );
}

export default App;