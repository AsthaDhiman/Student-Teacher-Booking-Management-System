// Import Firebase modules via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Dummy Firebase config – safe for public upload
const firebaseConfig = {
  apiKey: "AIzaSyDUMMY-KEY-HERE123456",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:dummyid123456",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

//⚠️ This project uses a dummy Firebase config.
//To make it work, replace the config in `firebase-config.js` with your own Firebase project's credentials.
