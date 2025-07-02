import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
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

const appointmentsList = document.getElementById("appointmentsList");

// Load appointments for this teacher
async function loadAppointments(currentTeacherId) {
  const q = query(
    collection(db, "appointments"),
    where("teacherId", "==", currentTeacherId)
  );
  const snapshot = await getDocs(q);

  appointmentsList.innerHTML = "";

  if (snapshot.empty) {
    appointmentsList.innerHTML = "<p>No appointments yet.</p>";
    return;
  }

  for (const docSnap of snapshot.docs) {
    const appt = docSnap.data();
    const studentRef = doc(db, "users", appt.studentId);
    const studentSnap = await getDoc(studentRef);
    const student = studentSnap.exists()
      ? studentSnap.data()
      : { name: "Unknown" };

    const apptDiv = document.createElement("div");
    apptDiv.className = "appointment-box";

    apptDiv.innerHTML = `
      <p><strong>Student:</strong> ${student.name}</p>
      <p><strong>Date:</strong> ${appt.date}</p>
      <p><strong>Message:</strong> ${appt.message || "No message"}</p>
      <p><strong>Status:</strong> <span id="status-${docSnap.id}">${
      appt.status
    }</span></p>
${
  appt.status === "pending"
    ? `
  <div class="dashboard-buttons">
    <button class="approveBtn" onclick="handleDecision('${docSnap.id}', 'approved')">✅ Approve</button>
    <button class="rejectBtn" onclick="handleDecision('${docSnap.id}', 'rejected')">❌ Reject</button>
  </div>
`
    : ""
}

      <hr/>
    `;

    appointmentsList.appendChild(apptDiv);
  }
}

window.handleDecision = async (id, decision) => {
  const apptRef = doc(db, "appointments", id);
  await updateDoc(apptRef, { status: decision });

  const statusSpan = document.getElementById("status-" + id);
  if (statusSpan) statusSpan.textContent = decision;

  alert("Appointment " + decision);
};

let currentTeacherUid = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const docSnap = await getDoc(doc(db, "users", user.uid));
  if (docSnap.exists() && docSnap.data().role === "teacher") {
    currentTeacherUid = user.uid;
    loadAppointments(currentTeacherUid);
  } else {
    alert("Access denied.");
    window.location.href = "login.html";
  }
});
