import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoHnGWZ0v3Uww8bgAIaGlP0PUCi5pZFUg",
  authDomain: "student-teacher-booking-54ea4.firebaseapp.com",
  projectId: "student-teacher-booking-54ea4",
  storageBucket: "student-teacher-booking-54ea4.appspot.com",
  messagingSenderId: "568549194346",
  appId: "1:568549194346:web:ecb0025c59df6bbe80a813",
  measurementId: "G-E259EVN0NP",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const teacherSelect = document.getElementById("teacherSelect");
const appointmentDate = document.getElementById("appointmentDate");
const message = document.getElementById("message");
const appointmentForm = document.getElementById("appointmentForm");
const appointmentMessage = document.getElementById("appointmentMessage");

// Load all teachers
async function loadTeachers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  teacherSelect.innerHTML = '<option value="">Select a teacher</option>';

  querySnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    if (user.role === "teacher") {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = user.name;
      teacherSelect.appendChild(option);
    }
  });
}

// On user auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  await loadTeachers();

  appointmentForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // ✅ Prevent page reload

    const teacherId = teacherSelect.value;
    const date = appointmentDate.value;
    const msg = message.value.trim();

    if (!teacherId || !date) {
      alert("Please select a teacher and date.");
      return;
    }

    try {
      await addDoc(collection(db, "appointments"), {
        studentId: user.uid,
        teacherId,
        date,
        message: msg,
        status: "pending",
        timestamp: new Date(),
      });

      appointmentMessage.innerHTML = `<p style="color: green; font-weight: bold;">Appointment requested successfully!</p>`;

      appointmentDate.value = "";
      message.value = "";
      teacherSelect.value = "";
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Something went wrong.");
    }
  });
});
