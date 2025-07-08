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

    // Display teacher profile (safe checks for each element)
    const nameEl = document.getElementById("teacherName");
    const emailEl = document.getElementById("teacherEmail");
    const roleEl = document.getElementById("teacherRole");
    const deptEl = document.getElementById("teacherDepartment");
    const subjEl = document.getElementById("teacherSubject");

    if (nameEl) nameEl.textContent = userData.name;
    if (emailEl) emailEl.textContent = userData.email;
    if (roleEl) roleEl.textContent = userData.role;
    if (deptEl) deptEl.textContent = userData.department || "Not specified";
    if (subjEl) subjEl.textContent = userData.subject || "Not specified";

    // Load appointments
    loadAppointments(uid);
  } catch (error) {
    console.error("Error loading teacher data:", error);
    alert("Something went wrong while loading your profile.");
  }
});

// Load appointments for the logged-in teacher
async function loadAppointments(teacherId) {
  const container = document.getElementById("appointmentList");
  if (!container) {
    console.warn("No #appointmentList element found.");
    return;
  }

  container.innerHTML = "";

  const appointmentsRef = collection(db, "appointments");
  const q = query(appointmentsRef, where("teacherId", "==", teacherId));
  const snapshot = await getDocs(q);

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

  // Event delegation for approve/reject buttons
  container.addEventListener("click", async (e) => {
    const id = e.target.getAttribute("data-id");
    if (!id) return;

    const newStatus = e.target.classList.contains("approveBtn")
      ? "approved"
      : e.target.classList.contains("rejectBtn")
      ? "rejected"
      : null;

    if (newStatus) {
      try {
        const ref = doc(db, "appointments", id);
        await updateDoc(ref, { status: newStatus });
        loadAppointments(teacherId); // reload updated list
      } catch (err) {
        console.error("Error updating appointment status:", err);
        alert("Failed to update status.");
      }
    }
  });
}
