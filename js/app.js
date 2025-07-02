import { auth, db } from "../firebase/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Get current page name
const page = window.location.pathname.split("/").pop();

// ----------------------
// 🔐 Login Page Logic
// ----------------------
if (page === "login.html") {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const role = document.getElementById("role").value;
      const messageBox = document.getElementById("loginMessage");

      messageBox.textContent = "Logging in...";

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();

          if (userData.role === role) {
            if (role === "student") window.location.href = "student.html";
            else if (role === "teacher") window.location.href = "teacher.html";
            else if (role === "admin") window.location.href = "admin.html";
          } else {
            messageBox.textContent =
              "Selected role doesn't match your account.";
            await signOut(auth);
          }
        } else {
          messageBox.textContent = "User data not found.";
        }
      } catch (error) {
        messageBox.textContent = error.message;
      }
    });
  }

  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const resetMessage = document.getElementById("resetMessage");

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();

      if (!email) {
        resetMessage.textContent = "Please enter your email above first.";
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        resetMessage.style.color = "green";
        resetMessage.textContent = "Password reset email sent!";
      } catch (error) {
        resetMessage.style.color = "red";
        resetMessage.textContent = "Error: " + error.message;
      }
    });
  }
}

// ----------------------
// 📝 Register Page Logic
// ----------------------
if (page === "register.html") {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const role = document.getElementById("role").value;
      const messageBox = document.getElementById("registerMessage");

      if (!role) {
        messageBox.textContent = "Please select a role.";
        return;
      }

      messageBox.textContent = "Registering...";

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          role,
          createdAt: new Date(),
        });

        messageBox.textContent =
          "Registration successful! Redirecting to login...";
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (error) {
        messageBox.textContent = error.message;
      }
    });
  }
}

// ----------------------
// 👁️ Password Toggle
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".toggle-password");

  toggles.forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = icon.closest(".input-group").querySelector("input");
      if (input) {
        input.type = input.type === "password" ? "text" : "password";
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  });
});

// ----------------------
// 🚪 Universal Logout
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      });
    });
  }
});
