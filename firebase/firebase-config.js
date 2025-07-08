// Import Firebase modules (include this via CDN in HTML or install via npm if using bundlers)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAoHnGWZ0v3Uww8bgAIaGlP0PUCi5pZFUg",
  authDomain: "student-teacher-booking-54ea4.firebaseapp.com",
  projectId: "student-teacher-booking-54ea4",
  storageBucket: "student-teacher-booking-54ea4.firebasestorage.app",
  messagingSenderId: "568549194346",
  appId: "1:568549194346:web:ecb0025c59df6bbe80a813",
  measurementId: "G-E259EVN0NP"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
