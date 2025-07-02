// js/allAppointments.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  getDocs,
  doc,
  getDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoHnGWZ0v3Uww8bgAIaGlP0PUCi5pZFUg",
  authDomain: "student-teacher-booking-54ea4.firebaseapp.com",
  projectId: "student-teacher-booking-54ea4",
  storageBucket: "student-teacher-booking-54ea4.appspot.com",
  messagingSenderId: "568549194346",
  appId: "1:568549194346:web:ecb0025c59df6bbe80a813"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const allAppointmentsList = document.getElementById("allAppointmentsList");

async function loadAllAppointments() {
  const snapshot = await getDocs(collection(db, "appointments"));

  allAppointmentsList.innerHTML = "";

  if (snapshot.empty) {
    allAppointmentsList.innerHTML = "<p>No appointments found.</p>";
    return;
  }

  for (const docSnap of snapshot.docs) {
    const appt = docSnap.data();

    // Get student and teacher names
    const studentRef = doc(db, "users", appt.studentId);
    const teacherRef = doc(db, "users", appt.teacherId);

    const [studentSnap, teacherSnap] = await Promise.all([
      getDoc(studentRef),
      getDoc(teacherRef)
    ]);

    const studentName = studentSnap.exists() ? studentSnap.data().name : "Unknown";
    const teacherName = teacherSnap.exists() ? teacherSnap.data().name : "Unknown";

    const apptDiv = document.createElement("div");
    apptDiv.className = "appointment-box";

    apptDiv.innerHTML = `
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Teacher:</strong> ${teacherName}</p>
      <p><strong>Date:</strong> ${appt.date}</p>
      <p><strong>Message:</strong> ${appt.message || "No message"}</p>
      <p><strong>Status:</strong> <span class="${appt.status}">${appt.status}</span></p>
      <hr/>
    `;

    allAppointmentsList.appendChild(apptDiv);
  }
}

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (userSnap.exists() && userSnap.data().role === "admin") {
    loadAllAppointments();
  } else {
    alert("Access denied.");
    window.location.href = "login.html";
  }
});
