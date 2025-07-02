import { auth, db } from "../firebase/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// When the user is authenticated...
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

    if (userData.role !== "student") {
      alert("Access denied. You are not a student.");
      await signOut(auth);
      window.location.href = "login.html";
      return;
    }

    // Display student info
    document.getElementById("studentName").textContent = userData.name;
    document.getElementById("studentEmail").textContent = userData.email;
    document.getElementById("studentRole").textContent = userData.role;
  } catch (error) {
    console.error("Error fetching student data:", error);
    alert("Something went wrong.");
  }
});
