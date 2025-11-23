import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import CreateInstitution from "./pages/CreateInstitution";

// Owner Pages
import OwnerLayout from "./pages/owner/OwnerLayout";
import OwnerDashboard from "./pages/owner/OwnerDashboard"; // Import the new dashboard
import InstitutionSettings from "./pages/owner/InstitutionSettings";
import AdminManagement from "./pages/owner/AdminManagement";
import TeacherManagement from "./pages/owner/TeacherManagement";
import StudentManagement from "./pages/owner/StudentManagement";
import CourseManagement from "./pages/owner/CourseManagement";
import ClassManagement from "./pages/owner/ClassManagement";

export default function App(): React.JSX.Element {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app">
            <h1>Welcome to Edunexs</h1>
            <p style={{ marginTop: "0.5rem" }}>
              Explore the UI: <Link to="/login">Login</Link> •{" "}
              <Link to="/signup">Signup</Link> •{" "}
              <Link to="/admin/dashboard">Admin Dashboard</Link> •{" "}
              <Link to="/forgot-password">Forgot Password</Link> •{" "}
              <Link to="/verify-email">Verify Email</Link> •{" "}
              <Link to="/owner/institution">Owner Institution</Link> •{" "}
              <Link to="/owner/staff">Owner Staff</Link> •{" "}
              <Link to="/owner/roles">Owner Roles</Link> •{" "}
              <Link to="/create-institution">Create Institution</Link>


              
              
            </p>
          </div>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/create-institution" element={<CreateInstitution />} />
      

    
      <Route path="*" element={<Navigate to="/" replace />} />


       {/* Owner Portal Routes */}
      <Route path="/owner" element={<OwnerLayout />}>
        {/* Default to Dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="institution" element={<InstitutionSettings />} />
        <Route path="admins" element={<AdminManagement />} />
        <Route path="teachers" element={<TeacherManagement />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="classes" element={<ClassManagement />} />
      </Route>

    </Routes>
  );
}
