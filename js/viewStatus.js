import { auth, db } from "../firebase/firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const statusList = document.getElementById("statusList");
const statusFilter = document.getElementById("statusFilter");

let allAppointments = [];

// ✅ Cancel Appointment
async function cancelAppointment(apptId) {
  const confirmCancel = confirm(
    "Are you sure you want to cancel this appointment?"
  );
  if (!confirmCancel) return;

  try {
    await deleteDoc(doc(db, "appointments", apptId));
    alert("Appointment cancelled successfully.");
    const user = auth.currentUser;
    if (user) loadAppointments(user.uid);
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    alert("Something went wrong.");
  }
}

// ✅ Load Appointments
async function loadAppointments(studentId) {
  const q = query(
    collection(db, "appointments"),
    where("studentId", "==", studentId)
  );
  const snapshot = await getDocs(q);

  allAppointments = [];

  if (snapshot.empty) {
    statusList.innerHTML = "<p>No appointments found.</p>";
    return;
  }

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    data.id = docSnap.id;

    const teacherRef = doc(db, "users", data.teacherId);
    const teacherSnap = await getDoc(teacherRef);

    if (teacherSnap.exists()) {
      const teacherData = teacherSnap.data();
      data.teacherName = teacherData.name || "Unknown";
      data.teacherSubject = teacherData.subject || "Not specified";
    } else {
      data.teacherName = "Unknown";
      data.teacherSubject = "Not specified";
    }

    allAppointments.push(data);
  }

  renderAppointments(statusFilter.value);
}

// ✅ Render Appointments
function renderAppointments(filter) {
  statusList.innerHTML = "";

  const filtered =
    filter === "all"
      ? allAppointments
      : allAppointments.filter((appt) => appt.status === filter);

  if (filtered.length === 0) {
    statusList.innerHTML = "<p>No appointments match the selected filter.</p>";
    return;
  }

  filtered.forEach((appt) => {
    const box = document.createElement("div");
    box.className = "status-box";

    box.innerHTML = `
      <p><strong>Teacher:</strong> ${appt.teacherName}</p>
      <p><strong>Subject:</strong> ${appt.teacherSubject}</p>
      <p><strong>Date:</strong> ${appt.date}</p>
      <p><strong>Message:</strong> ${appt.message || "No message"}</p>
      <p><strong>Status:</strong> <span class="${appt.status}">${
      appt.status
    }</span></p>
    `;

    if (appt.status === "pending") {
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel Appointment";
      cancelBtn.className = "btn-cancel";
      cancelBtn.onclick = () => cancelAppointment(appt.id);
      box.appendChild(cancelBtn);
    }

    box.appendChild(document.createElement("hr"));
    statusList.appendChild(box);
  });
}

// ✅ Filter Change
statusFilter.addEventListener("change", () => {
  renderAppointments(statusFilter.value);
});

// ✅ Auth Check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (userSnap.exists() && userSnap.data().role === "student") {
    loadAppointments(user.uid);
  } else {
    alert("Access denied.");
    window.location.href = "login.html";
  }
});
