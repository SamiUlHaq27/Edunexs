import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import CreateInstitution from "./pages/CreateInstitution";

// System Admin Pages
import SystemAdminLayout from "./pages/system-admin/SystemAdminLayout";
import SystemAdminDashboard from "./pages/system-admin/SystemAdminDashboard";
import SystemAdminInstitutions from "./pages/system-admin/SystemAdminInstitutions";

// Owner Pages (also used for Institution Admin)
import OwnerLayout from "./pages/owner/OwnerLayout";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import InstitutionSettings from "./pages/owner/InstitutionSettings";
import AdminManagement from "./pages/owner/AdminManagement";
import TeacherManagement from "./pages/owner/TeacherManagement";
import StudentManagement from "./pages/owner/StudentManagement";
import ParentManagement from "./pages/owner/ParentManagement";
import CourseManagement from "./pages/owner/CourseManagement";
import ClassManagement from "./pages/owner/ClassManagement";
import FeeManagement from "./pages/owner/FeeManagement";

// Teacher Pages
import TeacherLayout from "./pages/teacher/TeacherLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherQuizzes from "./pages/teacher/TeacherQuizzes";
import TeacherGrades from "./pages/teacher/TeacherGrades";
import TeacherCourses from "./pages/teacher/TeacherCourses";

// Student Pages
import StudentLayout from "./pages/student/StudentLayout";
import StudentCourses from "./pages/student/StudentCourses";
import StudentQuizAttempt from "./pages/student/StudentQuizAttempt";
import StudentAssignmentSubmit from "./pages/student/StudentAssignmentSubmit";

// Parent Pages
import ParentLayout from "./pages/parent/ParentLayout";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentCourses from "./pages/parent/ParentCourses";
import ParentFees from "./pages/parent/ParentFees";

import Loader from "./components/Loader";
import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/auth.service";

export default function App(): React.JSX.Element {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Initialize session on app startup
    authService.initializeSession();

    // Simulate initial loading
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/create-institution"
          element={
            <ProtectedRoute>
              <CreateInstitution />
            </ProtectedRoute>
          }
        />

        {/* System Admin Routes */}
        <Route
          path="/system-admin"
          element={
            <ProtectedRoute>
              <SystemAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SystemAdminDashboard />} />
          <Route path="institutions" element={<SystemAdminInstitutions />} />
        </Route>

        {/* Institution Admin Routes → Redirected to Owner Layout */}
        <Route
          path="/institute-admin/*"
          element={<Navigate to="/owner" replace />}
        />

        {/* Owner Portal Routes (also used for Institution Admin) */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="institution" element={<InstitutionSettings />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="parents" element={<ParentManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="fees" element={<FeeManagement />} />
        </Route>

        {/* Teacher Portal Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="quizzes" element={<TeacherQuizzes />} />
          <Route path="grades" element={<TeacherGrades />} />
          <Route path="courses" element={<TeacherCourses />} />
          <Route path="courses/:courseId" element={<TeacherCourses />} />
        </Route>

        {/* Student Portal Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentCourses />} />
          <Route path="courses" element={<StudentCourses />} />
          {/* FIX: Path add kiya taaki sidebar se Fees click karne par StudentCourses load ho aur logout na ho */}
          <Route path="fees" element={<StudentCourses />} />
          <Route path="attempt-quiz" element={<StudentQuizAttempt />} />
          <Route
            path="submit-assignment"
            element={<StudentAssignmentSubmit />}
          />
        </Route>

        {/* Parent Portal Routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="courses" element={<ParentCourses />} />
          <Route path="fees" element={<ParentFees />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
