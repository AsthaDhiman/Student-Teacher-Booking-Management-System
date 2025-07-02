📚 STUDENT-TEACHER BOOKING MANAGEMENT SYSTEM

A web-based platform that allows to book appointments with teachers. Includes role-based dashboards for Admin, Teacher, and Student users using Firebase Authentication and Firestore.

✨ Features
1. Authentication System(Login/Register with roles)
2. Student Dashboard
   2.1 Book appointment with a teacher
   2.2 View appointment status
3. Teacher Dashboard
   3.1 View incoming appointment requests
   3.2 Approve or reject requests
4. Admin Dashboard
   4.1 View total student and teachers
   4.2 Monitor pending and approved appointments
5. Password visibilty toggle
6. Role based access control
7. Real time data from Firebase

🧑‍💻 Tech Stack
Frontend: HTML, CSS, JavaScript
Backend: Firebase
        Authentication
        Firestore Database

📁 Folder Structure
/project-root
|
|--index.html
|--login.html
|--register.html
|--student.html
|--teacher.html
|--admin.html
|--book-appointment.html
|--view-status.html
|--view-appointments.html
|--all-appointments.html
|--all-users.html
|--appointments-log.html
|
|--css/
    |--style.css
|--js/
    |--app.js   #shared logic
    |--student.js
    |--teacher.js
    |--admin.js
    |--view-appointments.js
    |--view-status.js
    |--appointments.js
    |--all-appointments.js
    |--all-users.js
    |--appointments-log.js
|--firebase
    |--firebase-config.js     


🔧 Setup Instructions
1. Clone or download this repository.
2. Replace the Firebase config in firebase-config.js with your own.
3. Make sure Firebase and Authentication are enabled in Firebase.
4. Open index.html or login.html in your browser.

📷 Screenshots

### First View
![Front Page after running application](assets/first-view.png)

### Register
![Register Page](assets/register.png)

### Login
![Login Page](assets/login.png)

### Student View
![Student Page](assets/student-view.png)

### Teacher View
![Teacher Page](assets/teacher-view.png)

### Admin View
![Admin Page](assets/admin-view.png)


📌 Future Enhancements
1. Add notification or emails on appointments approval
2. Filter or search appointments
3. Export reports for admin
