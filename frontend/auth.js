// Base URL of the backend
const BASE_URL = 'http://localhost:5000/api';

// Helper function to get stored token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Register Driver
async function registerDriver(fullName, email, phone, vehicle, license) {
    const response = await fetch(`${BASE_URL}/driver/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, vehicle, license, status: 'pending' })
    });

    const data = await response.json();
    if (response.ok) {
        alert("Your application has been submitted for approval.");
        window.location.href = 'driver-panel.html';
    } else {
        alert(data.message);
    }
}

// Fetch Pending Drivers (Admin)
async function fetchPendingDrivers() {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';

    const response = await fetch(`${BASE_URL}/admin/drivers`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (response.ok) {
        let driverList = document.getElementById('pending-drivers');
        driverList.innerHTML = '';
        data.drivers.forEach(driver => {
            driverList.innerHTML += `
                <li>
                    ${driver.fullName} - ${driver.email} - ${driver.vehicle}
                    <button onclick="approveDriver('${driver._id}')">Approve</button>
                    <button onclick="rejectDriver('${driver._id}')">Reject</button>
                </li>
            `;
        });
    } else {
        alert(data.message);
    }
}

// Approve Driver
async function approveDriver(driverId) {
    const response = await fetch(`${BASE_URL}/admin/approve-driver/${driverId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });

    const data = await response.json();
    if (response.ok) {
        alert("Driver approved successfully!");
        fetchPendingDrivers();
    } else {
        alert(data.message);
    }
}

// Reject Driver
async function rejectDriver(driverId) {
    const response = await fetch(`${BASE_URL}/admin/reject-driver/${driverId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });

    const data = await response.json();
    if (response.ok) {
        alert("Driver rejected.");
        fetchPendingDrivers();
    } else {
        alert(data.message);
    }
}

// Auto-fetch pending drivers if on admin panel
if (document.getElementById('admin-panel')) {
    fetchPendingDrivers();
}

// Event Listener for Driver Registration
if (document.getElementById('driver-register-form')) {
    document.getElementById('driver-register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const vehicle = document.getElementById('vehicle').value;
        const license = document.getElementById('license').value;
        registerDriver(fullName, email, phone, vehicle, license);
    });
}
