import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// const userEmail = "johndoe@test.com";
// const userPassword = "SecurePass123";
const userEmail = "driver@example.com"; 
const userPassword = "DriverPass123";


async function getIdToken() {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
        const idToken = await userCredential.user.getIdToken();
        
        console.log("✅ Generated Firebase ID Token:");
        console.log(idToken);
    } catch (error) {
        console.error("❌ Error generating ID token:", error.message);
    }
}

getIdToken();
