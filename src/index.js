import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import Register from "./Pages/Regsiter";
import Home from "./Pages/Home";
import Services from "./Pages/Services";
import About from "./Pages/About";
import ResetPassword from "./Pages/ResetPassword";


import ParentDashboard from "./Dashboards/ParentDashboard";
import StudentDashboard from "./Dashboards/StudentDashboard";
import TeacherDashboard from "./Dashboards/TeacherDashboard";
import AdminDashboard from "./Dashboards/AdminDashboard";

import ManageUsers from "./Admin/ManageUsers";
import ManageClasses from "./Admin/ManageClasses";
import ManageUnits from "./Admin/ManageUnits";
import AddUser from "./Admin/AddUser";
import EditUser from "./Admin/EditUser";
import UserDetails from "./Admin/UserDetails";
import AddUnit from "./Admin/AddUnit";
import EditUnit from "./Admin/EditUnit";
import UnitDetails from "./Admin/UnitDeatils";
import AddClass from "./Admin/AddClasse";
import EditClasse from "./Admin/EditClasse";
import ClasseDetails from "./Admin/ClasseDetails";
import ManagePendingUsers from "./Admin/ManagePendingUsers";

import GestionLecon from "./Enseignant/GestionLecon";
import GestionQuiz from "./Enseignant/GestionQuiz";
import GestionVocab from "./Enseignant/GestionVocab";
import GestionCategories from "./Enseignant/GestionCategory";
import GestionTest from "./Enseignant/GestionTest";
import GestionJeu from "./Enseignant/GestionJeu";
import Evaluation from "./Enseignant/Evaluation";
import ProgressionEleve from "./Enseignant/TeacherStudentProgress";
import TeacherTest from "./Enseignant/TeacherTest";
import NotifTeacher from "./Enseignant/NotifTeacher";
import SuivreScore from "./Enseignant/SuivreScore";

import StudentLesson from "./Student/StudentLesson";
import StudentVocab from "./Student/StudentVocab";
import StudentCategorie from "./Student/StudentCategorie";
import StudentTest from "./Student/StudentTest";
import StudentJeu from "./Student/StudentJeu";
import QuizPlayer from "./Student/QuizPlayer";
import StudentQuiz from "./Student/StudentQuiz";
import StudentResult from "./Student/StudentResult";
import NotifStudent from "./Student/NotifStudent";
import ScoreGame from "./Student/ScoreGame";

import ProgresEnfant from "./Parent/ProgressEnfant";
import NotifParent from "./Parent/NotifParent";

import Messages from "./Components/Messages";
import AboutUs from './Pages/About';
import RootLayout from './layout/root';
import ServiceDetails from './Pages/service-details';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public routes
      {
        element: <RootLayout />, // Applique Header/Footer
        children: [
          { path: "/", element: <Home /> },
          { path: "/aboutus", element: <AboutUs /> },
          { path: "/services", element: <Services /> },
          { path: "/service-details", element: <ServiceDetails /> },

          { path: "/contact", element: <Contact /> },
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
          { path: "/reset-password", element: <ResetPassword /> },
          { path: "/reset-password/:token", element: <ResetPassword /> },
        

        ],
      },


      // Dashboards
      { path: "/admin-dashboard", element: <AdminDashboard /> },
      { path: "/teacher-dashboard", element: <TeacherDashboard /> },
      { path: "/student-dashboard", element: <StudentDashboard /> },
      { path: "/parent-dashboard", element: <ParentDashboard /> },

      // Admin routes
      { path: "/manage-users", element: <ManageUsers /> },
      { path: "/manage-classes", element: <ManageClasses /> },
      { path: "/manage-units", element: <ManageUnits /> },
      { path: "/manage-pending-users", element: <ManagePendingUsers /> },
      { path: "/add-user", element: <AddUser /> },
      { path: "/edit-user/:id", element: <EditUser /> },
      { path: "/user-details/:userId", element: <UserDetails /> },
      { path: "/add-unit", element: <AddUnit /> },
      { path: "/edit-unit/:id", element: <EditUnit /> },
      { path: "/unit-details/:id", element: <UnitDetails /> },
      { path: "/add-class", element: <AddClass /> },
      { path: "/edit-class/:id", element: <EditClasse /> },
      { path: "/class-details/:id", element: <ClasseDetails /> },

      // Enseignant routes
      { path: "/teacher/lessons", element: <GestionLecon /> },
      { path: "/teacher/quizzes", element: <GestionQuiz /> },
      { path: "/teacher/vocab", element: <GestionVocab /> },
      { path: "/teacher/categories", element: <GestionCategories /> },
      { path: "/teacher/tests", element: <GestionTest /> },
      { path: "/teacher/test-submissions", element: <TeacherTest /> },
      { path: "/teacher/jeux", element: <GestionJeu /> },
      { path: "/teacher/evaluations", element: <Evaluation /> },
      { path: "/teacher/progress", element: <ProgressionEleve /> },
      { path: "/teacher/notifications", element: <NotifTeacher /> },
      { path: "/teacher/messages", element: <Messages /> },
      { path: "/suivre-scores", element: <SuivreScore /> },

      // Étudiant routes
      { path: "/student/lessons", element: <StudentLesson /> },
      { path: "/student/categorie", element: <StudentCategorie /> },
      { path: "/student/vocab/:categorieId", element: <StudentVocab /> },
      { path: "/student/tests", element: <StudentTest /> },
      { path: "/student/quizs", element: <StudentQuiz /> },
      { path: "/student/quizs/play/:quizId", element: <QuizPlayer /> },
      { path: "/student/results", element: <StudentResult /> },
      { path: "/student/games", element: <StudentJeu /> },
      { path: "/student/notifications", element: <NotifStudent /> },
      { path: "/student/messages", element: <Messages /> },
      { path: "/mes-scores", element: <ScoreGame /> },

      // Parent routes
      { path: "/parent/progress", element: <ProgresEnfant /> },
      { path: "/parent/notifications", element: <NotifParent /> },
      { path: "/parent/messages", element: <Messages /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
