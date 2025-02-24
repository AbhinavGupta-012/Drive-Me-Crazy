import admin from "./firebaseAdmin.js";

async function verifyIdToken(idToken) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log("Decoded Token:", decodedToken);
    } catch (error) {
        console.error("Error verifying token:", error.message);
    }
}

const testToken = "";
verifyIdToken(testToken);
