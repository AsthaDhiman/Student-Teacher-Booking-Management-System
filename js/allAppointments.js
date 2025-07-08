// ✅ Reuse centralized Firebase config
import { auth, db } from "../firebase/firebase-config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const allAppointmentsList = document.getElementById("allAppointmentsList");

// 🔁 Load All Appointments for Admin
async function loadAllAppointments() {
  const snapshot = await getDocs(collection(db, "appointments"));
  allAppointmentsList.innerHTML = "";

  if (snapshot.empty) {
    allAppointmentsList.innerHTML = "<p>No appointments found.</p>";
    return;
  }

  for (const docSnap of snapshot.docs) {
    const appt = docSnap.data();

    // Get student info
    const studentRef = doc(db, "users", appt.studentId);
    const studentSnap = await getDoc(studentRef);
    const student = studentSnap.exists() ? studentSnap.data() : { name: "Unknown" };

    // Get teacher info
    const teacherRef = doc(db, "users", appt.teacherId);
    const teacherSnap = await getDoc(teacherRef);
    const teacher = teacherSnap.exists()
      ? teacherSnap.data()
      : { name: "Unknown", subject: "N/A", department: "N/A" };

    const apptDiv = document.createElement("div");
    apptDiv.className = "appointment-box";

    apptDiv.innerHTML = `
      <p><strong>Student:</strong> ${student.name}</p>
      <p><strong>Teacher:</strong> ${teacher.name}</p>
      <p><strong>Subject:</strong> ${teacher.subject}</p>
      <p><strong>Department:</strong> ${teacher.department}</p>
      <p><strong>Date:</strong> ${appt.date}</p>
      <p><strong>Message:</strong> ${appt.message || "No message"}</p>
      <p><strong>Status:</strong> <span class="status ${appt.status}">${appt.status}</span></p>
      <hr />
    `;

    allAppointmentsList.appendChild(apptDiv);
  }
}

// 🔐 Ensure Admin is Logged In
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const docSnap = await getDoc(doc(db, "users", user.uid));
  const role = docSnap.exists() ? docSnap.data().role : null;

  if (role !== "admin") {
    alert("Access denied. You are not an admin.");
    window.location.href = "login.html";
    return;
  }

  loadAllAppointments();
});
