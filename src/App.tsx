import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AdminDashboard from "./pages/AdminDashboard";

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
              <Link to="/verify-email">Verify Email</Link>
              
            </p>
          </div>
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
