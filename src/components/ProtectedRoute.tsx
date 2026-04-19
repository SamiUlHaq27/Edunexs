import React from "react";
import { Navigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: UserRole | UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      // Redirect to user's default dashboard
      const dashboardMap: Record<UserRole, string> = {
        [UserRole.SYSTEM_ADMIN]: "/system-admin/dashboard",
        [UserRole.INSTITUTION_OWNER]: "/owner/dashboard",
        [UserRole.INSTITUTION_ADMIN]: "/institute-admin/dashboard",
        [UserRole.TEACHER]: "/teacher/dashboard",
        [UserRole.STUDENT]: "/student/dashboard",
        [UserRole.PARENT]: "/parent/dashboard",
      };
      return <Navigate to={dashboardMap[user.role]} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
