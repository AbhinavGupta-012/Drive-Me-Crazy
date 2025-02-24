# DriveMe Crazy - Ride Booking Platform

## Introduction

DriveMe Crazy is a comprehensive ride-booking web application designed to connect riders with drivers efficiently and securely. This project aims to provide a seamless transportation experience with features like real-time ride booking, user authentication, ride history tracking, and an admin dashboard for user management. The application is built using a modern tech stack, including Node.js, Express, MongoDB, and React (HTML, CSS, JavaScript).

This README will guide you through setting up the backend, provide a description of each page, and outline the project structure.

## Setting up the Backend

To set up the backend of the DriveMe Crazy application, follow these steps:

1.  **Navigate to the Backend Folder:**

    ```bash
    cd backend
    ```

2.  **Initialize a New Node.js Project:**

    ```bash
    npm init -y
    ```

    This command initializes a new `package.json` file with default settings.

3.  **Install Required Dependencies:**

    ```bash
    npm install express mongoose dotenv cors socket.io jsonwebtoken bcryptjs firebase-admin mongodb
    ```

    These dependencies are crucial for the backend functionality:

    * `express`: Web framework for Node.js.
    * `mongoose`: MongoDB object modeling tool.
    * `dotenv`: Loads environment variables from a `.env` file.
    * `cors`: Enables Cross-Origin Resource Sharing.
    * `socket.io`: Enables real-time, bidirectional, and event-based communication.
    * `jsonwebtoken`: JSON Web Token implementation for authentication.
    * `bcryptjs`: Library for hashing passwords.
    * `firebase-admin`: Firebase Admin SDK to interact with firebase services.
    * `mongodb`: Mongodb driver.

4.  **Install Development Dependencies:**

    ```bash
    npm install -D nodemon
    ```

    * `nodemon`: Automatically restarts the server when file changes are detected.

## Page Descriptions

### 1. Main Page (Booking Form)

* **Purpose:** This is the landing page where users can book a ride.
* **Features:**
    * Displays a hero image and a brief introduction to the service.
    * Includes a booking form with fields for pickup and drop-off locations, date, time, and ride type selection.
    * Provides tabs for "Ride Now," "Schedule," and "Share Ride" options.
    * Presents a "Why Choose Us" section highlighting key features.
    * Includes a testimonial slider for social proof.
* **Functionality:** Users can enter their ride details and initiate a ride request.

### 2. Registration Page (Sign Up)

* **Purpose:** Allows new users to create an account.
* **Features:**
    * Includes fields for Full Name, Email, Password, and Confirm Password.
    * Provides a "Sign Up" button and a link to the sign-in page.
    * A background image.
* **Functionality:** Users can register an account by entering their details.

### 3. Ride History Page

* **Purpose:** Displays the user's past ride records.
* **Features:**
    * Lists ride details, including Date, Pickup, Dropoff, and Fare.
    * Presents each ride in a structured format.
* **Functionality:** Users can review their ride history.

### 4. Admin Dashboard

* **Purpose:** Provides administrative access for user management.
* **Features:**
    * Displays a user list with Full Name, Email, and Role.
    * Includes a form to add new users with fields for Full Name, Email, and Role.
    * Sidebar navigation for dashboard sections.
* **Functionality:** Administrators can manage user accounts.

## Frontend Setup

The frontend is built using standard HTML, CSS, and JavaScript. No `npm install` is required for the frontend. Simply open the HTML files in a web browser.

## Running the Backend

To start the backend server in development mode, use the following command:

```bash
npm run dev #Assuming you have added a "dev" script to your package.json.
