import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAoHnGWZ0v3Uww8bgAIaGlP0PUCi5pZFUg",
  authDomain: "student-teacher-booking-54ea4.firebaseapp.com",
  projectId: "student-teacher-booking-54ea4",
  storageBucket: "student-teacher-booking-54ea4.appspot.com",
  messagingSenderId: "568549194346",
  appId: "1:568549194346:web:ecb0025c59df6bbe80a813",
  measurementId: "G-E259EVN0NP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const userList = document.getElementById("userList");

let currentAdminUid = null;

// Fetch and render users
async function fetchAndRenderUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  userList.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    const userId = docSnap.id;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        ${
          userId !== currentAdminUid
            ? `<button class="btn-cancel" onclick="deleteUser('${userId}')">Delete</button>`
            : `<em style="color: gray;">Admin</em>`
        }
      </td>
    `;
    userList.appendChild(row);
  });
}

// Delete user
window.deleteUser = async function (userId) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "users", userId));
    alert("User deleted successfully!");
    fetchAndRenderUsers(); // reload list
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("Failed to delete user.");
  }
};

// Only allow if admin is logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const tokenResult = await user.getIdTokenResult();
  const role = tokenResult.claims.role || "admin"; // or get from Firestore

  if (role === "admin") {
    currentAdminUid = user.uid;
    fetchAndRenderUsers();
  } else {
    alert("Access denied. Admins only.");
    window.location.href = "login.html";
  }
});
