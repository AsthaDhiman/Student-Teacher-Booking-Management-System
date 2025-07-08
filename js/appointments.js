// ✅ Import shared firebase setup
import { auth, db } from "../firebase/firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// DOM Elements
const teacherSelect = document.getElementById("teacherSelect");
const appointmentDate = document.getElementById("appointmentDate");
const message = document.getElementById("message");
const appointmentForm = document.getElementById("appointmentForm");
const appointmentMessage = document.getElementById("appointmentMessage");

// 🔁 Load all teachers with name, department, subject
async function loadTeachers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  teacherSelect.innerHTML = '<option value="">-- Select a Teacher --</option>';

  querySnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    if (user.role === "teacher") {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = `${user.name} - ${user.department} (${user.subject})`;
      teacherSelect.appendChild(option);
    }
  });
}

// 🔐 Auth Check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  await loadTeachers();

  // 📝 Book Appointment
  appointmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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
