import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Firebase Web App Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY, // Your Firebase Web API Key
  authDomain: process.env.FIREBASE_AUTH_DOMAIN, // Your Firebase Auth Domain
};

// 🔹 Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 User Credentials (Change if needed)
const userEmail = "johndoe@test.com";  // Replace with a real test user email
const userPassword = "SecurePass123";    // Replace with correct password

async function getIdToken() {
    try {
        // 🔹 Sign in the user
        const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
        const idToken = await userCredential.user.getIdToken();
        
        console.log("✅ Generated Firebase ID Token:");
        console.log(idToken);
    } catch (error) {
        console.error("❌ Error generating ID token:", error.message);
    }
}

getIdToken();
