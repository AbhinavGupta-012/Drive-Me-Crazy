const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function getIdToken(uid) {
  try {
    const token = await admin.auth().createCustomToken(uid);
    console.log("Firebase ID Token:", token);
  } catch (error) {
    console.error("Error generating token:", error);
  }
}

getIdToken("YOUR_FIREBASE_USER_UID");

admin.auth().getUserByEmail("johndoe@example.com")
  .then(userRecord => console.log("User UID:", userRecord.uid))
  .catch(error => console.error("Error:", error));