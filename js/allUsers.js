// ✅ Use central Firebase config
import { auth, db } from "../firebase/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const userList = document.getElementById("userList");
let currentAdminUid = null;

// 🔁 Fetch and render users
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

// 🗑️ Delete user
window.deleteUser = async function (userId) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "users", userId));
    alert("User deleted successfully!");
    fetchAndRenderUsers();
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("Failed to delete user.");
  }
};

// 🔐 Only allow if admin is logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userDoc = await getDocs(doc(db, "users", user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
  const role = userData.role || "student";

  if (role === "admin") {
    currentAdminUid = user.uid;
    fetchAndRenderUsers();
  } else {
    alert("Access denied. Admins only.");
    window.location.href = "login.html";
  }
});
