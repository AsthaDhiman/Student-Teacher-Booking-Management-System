import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoHnGWZ0v3Uww8bgAIaGlP0PUCi5pZFUg",
  authDomain: "student-teacher-booking-54ea4.firebaseapp.com",
  projectId: "student-teacher-booking-54ea4",
  storageBucket: "student-teacher-booking-54ea4.appspot.com",
  messagingSenderId: "568549194346",
  appId: "1:568549194346:web:ecb0025c59df6bbe80a813",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const logList = document.getElementById("logList");

async function loadAllAppointments() {
  const apptSnap = await getDocs(collection(db, "appointments"));
  logList.innerHTML = "";

  if (apptSnap.empty) {
    logList.innerHTML = "<p>No appointments found.</p>";
    return;
  }

  for (const docSnap of apptSnap.docs) {
    const appt = docSnap.data();

    const studentRef = doc(db, "users", appt.studentId);
    const teacherRef = doc(db, "users", appt.teacherId);

    const [studentSnap, teacherSnap] = await Promise.all([
      getDoc(studentRef),
      getDoc(teacherRef),
    ]);

    const student = studentSnap.exists() ? studentSnap.data().name : "Unknown";
    const teacher = teacherSnap.exists() ? teacherSnap.data().name : "Unknown";

    const box = document.createElement("div");
    box.className = "appointment-box";
    box.innerHTML = `
      <p><strong>Student:</strong> ${student}</p>
      <p><strong>Teacher:</strong> ${teacher}</p>
      <p><strong>Date:</strong> ${appt.date}</p>
      <p><strong>Status:</strong> <span class="${appt.status}">${appt.status}</span></p>
      <p><strong>Message:</strong> ${appt.message || "No message"}</p>
      <hr />
    `;

    logList.appendChild(box);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (userSnap.exists() && userSnap.data().role === "admin") {
    loadAllAppointments();
  } else {
    alert("Access denied.");
    window.location.href = "login.html";
  }
});
