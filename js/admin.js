import { auth, db } from "../firebase/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Authenticate and restrict access to admin only
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const uid = user.uid;
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User data not found.");
      return;
    }

    const userData = userSnap.data();

    if (userData.role !== "admin") {
      alert("Access denied. You are not an admin.");
      await signOut(auth);
      window.location.href = "login.html";
      return;
    }

    // Display admin info
    document.getElementById("adminName").textContent = userData.name;
    document.getElementById("adminEmail").textContent = userData.email;
    document.getElementById("adminRole").textContent = userData.role;

    // Load additional stats
    loadAdminStats();
  } catch (error) {
    console.error("Error loading admin data:", error);
  }
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

// 📊 Load admin statistics
async function loadAdminStats() {
  try {
    // Count Students
    const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
    const studentsSnap = await getDocs(studentsQuery);
    document.getElementById("totalStudents").textContent = studentsSnap.size;

    // Count Teachers
    const teachersQuery = query(collection(db, "users"), where("role", "==", "teacher"));
    const teachersSnap = await getDocs(teachersQuery);
    document.getElementById("totalTeachers").textContent = teachersSnap.size;

    // Count Appointment Statuses
    const appointmentsSnap = await getDocs(collection(db, "appointments"));
    let pending = 0, approved = 0, rejected = 0;

    appointmentsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.status === "pending") pending++;
      else if (data.status === "approved") approved++;
      else if (data.status === "rejected") rejected++;
    });

    document.getElementById("pendingRequests").textContent = pending;
    document.getElementById("approvedRequests").textContent = approved;
    document.getElementById("rejectedRequests").textContent = rejected;

  } catch (err) {
    console.error("Failed to load stats:", err);
  }
}
