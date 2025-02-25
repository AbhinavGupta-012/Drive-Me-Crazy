// auth.js - Handles authentication and API requests

// Base URL of the backend
const BASE_URL = 'http://localhost:5000/api';

// Helper function to get stored token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to set token
function setAuthToken(token) {
    localStorage.setItem('token', token);
}

// Helper function to remove token (logout)
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Register user
async function registerUser(fullName, email, password) {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
    });
    const data = await response.json();
    if (response.ok) {
        setAuthToken(data.token);
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message);
    }
}

// Login user
async function loginUser(email, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
        setAuthToken(data.token);
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message);
    }
}

// Fetch user profile
async function fetchUserProfile() {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';
    
    const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
        document.getElementById('user-name').innerText = data.user.fullName;
        document.getElementById('user-email').innerText = data.user.email;
    } else {
        alert(data.message);
    }
}

// Fetch ride history
async function fetchRideHistory() {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';
    
    const response = await fetch(`${BASE_URL}/rides`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
        let rideList = document.getElementById('ride-list');
        rideList.innerHTML = '';
        data.rides.forEach(ride => {
            rideList.innerHTML += `<li>${ride.pickupLocation.address} → ${ride.dropoffLocation.address} (${ride.status})</li>`;
        });
    } else {
        alert(data.message);
    }
}

// Ensure user is authenticated before accessing dashboard
function checkAuth() {
    if (!getAuthToken()) {
        window.location.href = 'login.html';
    }
}

// Event Listeners
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        registerUser(fullName, email, password);
    });
}

if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        loginUser(email, password);
    });
}

document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();  // ⛔ Prevent page reload

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log("Login Response:", data);

        if (response.ok) {
            localStorage.setItem("token", data.token); // ✅ Save Token
            window.location.href = "dashboard.html";   // ✅ Redirect to Dashboard
        } else {
            alert(data.message || "Login failed");  // ❌ Show error if login fails
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
    }
});



if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// Run authentication checks when necessary
if (document.getElementById('dashboard')) {
    checkAuth();
    fetchUserProfile();
}

if (document.getElementById('ride-history')) {
    fetchRideHistory();
}
