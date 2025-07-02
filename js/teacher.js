import { auth, db } from "../firebase/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Auth check and profile loading
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("User data not found.");
      return;
    }

    const userData = docSnap.data();

    if (userData.role !== "teacher") {
      alert("Access denied. You are not a teacher.");
      await signOut(auth);
      window.location.href = "login.html";
      return;
    }

    // Display teacher profile
    document.getElementById("teacherName").textContent = userData.name;
    document.getElementById("teacherEmail").textContent = userData.email;
    document.getElementById("teacherRole").textContent = userData.role;

    // Load appointments
    loadAppointments(uid);
  } catch (error) {
    console.error("Error loading teacher data:", error);
  }
});

// Load appointments for the logged-in teacher
async function loadAppointments(teacherId) {
  const appointmentsRef = collection(db, "appointments");
  const q = query(appointmentsRef, where("teacherId", "==", teacherId));
  const snapshot = await getDocs(q);
  const container = document.getElementById("appointmentList");

  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<p>No appointments yet.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("appointment-box");

    div.innerHTML = `
      <p><strong>Student ID:</strong> ${data.studentId}</p>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Message:</strong> ${data.message || "No message"}</p>
      <p><strong>Status:</strong> <span class="status">${data.status}</span></p>
      ${
        data.status === "pending"
          ? `<div class="action-buttons">
           <button class="approveBtn" data-id="${docSnap.id}">Approve</button>
           <button class="rejectBtn" data-id="${docSnap.id}">Reject</button>
         </div>`
          : ""
      }
    `;

    container.appendChild(div);
  });

  // Handle approve/reject
  container.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-id");
    if (!id) return;

    const newStatus = e.target.classList.contains("approveBtn")
      ? "approved"
      : e.target.classList.contains("rejectBtn")
      ? "rejected"
      : null;

    if (newStatus) {
      const ref = doc(db, "appointments", id);
      await updateDoc(ref, { status: newStatus });
      loadAppointments(teacherId); // refresh list
    }
  });
}
