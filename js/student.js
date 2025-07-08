import { auth, db } from "../firebase/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM elements (some may not exist depending on the page)
const studentNameEl = document.getElementById("studentName");
const studentEmailEl = document.getElementById("studentEmail");
const studentRoleEl = document.getElementById("studentRole");
const teacherSelect = document.getElementById("teacherSelect");
const dateEl = document.getElementById("appointmentDate");
const msgEl = document.getElementById("message");
const form = document.getElementById("appointmentForm");
const out = document.getElementById("appointmentMessage");

// Load teacher list (only on book-appointment.html)
async function loadTeachers() {
  if (!teacherSelect) return; // prevent crash if element doesn't exist

  const snaps = await getDocs(collection(db, "users"));
  teacherSelect.innerHTML = '<option value="">Select a teacher</option>';
  snaps.forEach((d) => {
    const u = d.data();
    if (u.role === "teacher") {
      teacherSelect.innerHTML += `<option value="${d.id}" data-dept="${u.department}" data-subj="${u.subject}">${u.name} — ${u.department} / ${u.subject}</option>`;
    }
  });
}

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User data not found.");
      return;
    }

    const userData = userSnap.data();

    if (userData.role !== "student") {
      alert("Access denied. You are not a student.");
      await signOut(auth);
      window.location.href = "login.html";
      return;
    }

    // Fill student details on student.html
    if (studentNameEl) studentNameEl.textContent = userData.name || "Unknown";
    if (studentEmailEl) studentEmailEl.textContent = userData.email || user.email;
    if (studentRoleEl) studentRoleEl.textContent = userData.role || "N/A";

    // Load teacher dropdown if on book-appointment.html
    await loadTeachers();
  } catch (error) {
    console.error("Error fetching student data:", error);
    alert("Something went wrong.");
  }
});
