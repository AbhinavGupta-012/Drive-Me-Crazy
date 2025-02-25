import React from "react";
import "./footer.css"; // Import CSS file for styling
import 'bootstrap-icons/font/bootstrap-icons.css';


function Footer() {
  return (
    <footer className="foot">
      <div className="one">
        <div className='icon'>
        <i className="bi bi-facebook"></i>
        <i className="bi bi-twitter"></i>
        <i className="bi bi-instagram"></i>
        </div>
        <div className="first">
          <p>Drive Me Crazy</p>
          <li>Visit Help Center</li>
          <li>Company</li>
          <li>About Us</li>
          <li>Our Offerings</li>
          <li>Careers</li>
        </div>
        <div className="second">
          <p >Explore</p>
          <li>Products</li>
          <li>Ride</li>
          <li>Drive</li>
          <li>Deliver</li>
          <li>Business</li>
        </div>
        <div className="third">
          <p >Travel</p>
          <li>Blog</li>
          <li>Reserve</li>
          <li>Airport</li>
          <li>Cities</li>
        </div>
      </div>
      <div className="two">
        <p>&copy; Copyright & Services</p>
      </div>
    </footer>
  );
}

export default Footer;
