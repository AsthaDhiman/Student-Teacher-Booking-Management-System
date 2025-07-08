import { auth, db } from "../firebase/firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const appointmentsList = document.getElementById("appointmentsList");

async function loadAppointments(currentTeacherId) {
  const q = query(
    collection(db, "appointments"),
    where("teacherId", "==", currentTeacherId)
  );
  const snapshot = await getDocs(q);

  if (!appointmentsList) {
    console.warn("#appointmentsList element not found.");
    return;
  }

  appointmentsList.innerHTML = "";

  if (snapshot.empty) {
    appointmentsList.innerHTML = "<p>No appointments yet.</p>";
    return;
  }

  for (const docSnap of snapshot.docs) {
    const appt = docSnap.data();

    const studentSnap = await getDoc(doc(db, "users", appt.studentId));
    const student = studentSnap.exists()
      ? studentSnap.data()
      : { name: "Unknown" };

    const teacherSnap = await getDoc(doc(db, "users", appt.teacherId));
    const teacher = teacherSnap.exists()
      ? teacherSnap.data()
      : { department: "N/A", subject: "N/A" };

    const apptDiv = document.createElement("div");
    apptDiv.className = "appointment-box";

    apptDiv.innerHTML = `
      <p><strong>Student:</strong> ${student.name}</p>
      <p><strong>Subject:</strong> ${teacher.subject || "Not specified"}</p>
      <p><strong>Department:</strong> ${teacher.department || "N/A"}</p>
      <p><strong>Date:</strong> ${appt.date}</p>
      <p><strong>Message:</strong> ${appt.message || "No message"}</p>
      <p><strong>Status:</strong> 
        <span id="status-${docSnap.id}" class="status ${appt.status}">
          ${appt.status}
        </span>
      </p>
      ${
        appt.status === "pending"
          ? `<div class="dashboard-buttons">
               <button class="approveBtn" onclick="handleDecision('${docSnap.id}', 'approved')">✅ Approve</button>
               <button class="rejectBtn" onclick="handleDecision('${docSnap.id}', 'rejected')">❌ Reject</button>
             </div>`
          : ""
      }
      <hr/>
    `;

    appointmentsList.appendChild(apptDiv);
  }
}

window.handleDecision = async (id, decision) => {
  await updateDoc(doc(db, "appointments", id), { status: decision });

  const statusSpan = document.getElementById("status-" + id);
  if (statusSpan) statusSpan.textContent = decision;

  alert("Appointment " + decision);
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const docSnap = await getDoc(doc(db, "users", user.uid));
  if (docSnap.exists() && docSnap.data().role === "teacher") {
    loadAppointments(user.uid);
  } else {
    alert("Access denied.");
    window.location.href = "login.html";
  }
});
