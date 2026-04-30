import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ASSETS } from "../config/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faBuilding,
  faIdBadge,
} from "@fortawesome/free-solid-svg-icons";
import AuthSidebar from "../components/AuthSidebar";
import { authService } from "../services/auth.service";
import { institutionService } from "../services/institution.service";
import { UserRole } from "../types";

export default function Login(): React.JSX.Element {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"email" | "username">("email");

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRoleDashboard = (role: UserRole): string => {
    switch (role) {
      case UserRole.SYSTEM_ADMIN:
        return "/system-admin/dashboard";
      case UserRole.INSTITUTION_OWNER:
        return "/owner/dashboard";
      case UserRole.INSTITUTION_ADMIN:
        return "/owner/dashboard";
      case UserRole.TEACHER:
        return "/teacher/dashboard";
      case UserRole.STUDENT:
        return "/student/dashboard";
      case UserRole.PARENT:
        return "/parent/dashboard";
      default:
        return "/";
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      // Validate that either email or username is provided
      if (loginMode === "email" && !email.trim()) {
        setError("Please enter your email address");
        setIsLoading(false);
        return;
      }

      if (loginMode === "username") {
        if (!institutionId.trim()) {
          setError("Please enter your institution id");
          setIsLoading(false);
          return;
        }
        if (!usernameInput.trim()) {
          setError("Please enter your username");
          setIsLoading(false);
          return;
        }
      }

      if (!password.trim()) {
        setError("Please enter your password");
        setIsLoading(false);
        return;
      }

      const response = await authService.login({
        ...(loginMode === "email"
          ? { email }
          : { username: usernameInput, institutionId: Number(institutionId) }),
        password,
      });

      // Check if institution owner needs to create institution
      if (response.user.role === UserRole.INSTITUTION_OWNER) {
        try {
          const institution = await institutionService.getMyInstitution();

          if (!institution) {
            // No institution found, redirect to create institution
            navigate("/create-institution");
            setIsLoading(false);
            return;
          }
        } catch (institutionError) {
          // Institution check failed, silently redirect to create institution
          // This handles cases where the API returns any error (404, 500, etc.)
          navigate("/create-institution");
          setIsLoading(false);
          return;
        }
      }

      // Redirect based on user role
      const dashboard = getRoleDashboard(response.user.role);
      navigate(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-split">
        <div className="auth-card">
          <img
            src={ASSETS.logo}
            alt={ASSETS.alt}
            className="auth-logo"
            loading="lazy"
          />
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          <div className="tabs">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `tab${isActive ? " tab-active" : ""}`
              }
            >
              Sign In
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `tab${isActive ? " tab-active" : ""}`
              }
            >
              Signup
            </NavLink>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                borderRadius: "0.5rem",
                color: "#c33",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="auth-form">
            {/* Login Mode Toggle */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--color-border-muted)",
              }}
            >
              <button
                type="button"
                onClick={() => setLoginMode("email")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: loginMode === "email" ? "600" : "500",
                  color: loginMode === "email" ? "#1e3a8a" : "#6b7280",
                  borderBottom:
                    loginMode === "email"
                      ? "2px solid #1e3a8a"
                      : "2px solid transparent",
                  marginBottom: "-1px",
                }}
                disabled={isLoading}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("username")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: loginMode === "username" ? "600" : "500",
                  color: loginMode === "username" ? "#1e3a8a" : "#6b7280",
                  borderBottom:
                    loginMode === "username"
                      ? "2px solid #1e3a8a"
                      : "2px solid transparent",
                  marginBottom: "-1px",
                }}
                disabled={isLoading}
              >
                Username
              </button>
            </div>

            {/* Email Input */}
            {loginMode === "email" && (
              <>
                <label className="auth-label" htmlFor="email">
                  Email
                </label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden>
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {/* Username Input - Split into Institution and Username */}
            {loginMode === "username" && (
              <>
                <div className="auth-username-split">
                  <div className="auth-username-field">
                    <label className="auth-label" htmlFor="institutionId">
                      Institution ID
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon" aria-hidden>
                        <FontAwesomeIcon icon={faBuilding} />
                      </span>
                      <input
                        id="institutionId"
                        type="number"
                        className="auth-input"
                        placeholder="123"
                        value={institutionId}
                        onChange={(e) => setInstitutionId(e.target.value)}
                        disabled={isLoading}
                        min={1}
                      />
                    </div>
                  </div>

                  {/* Username Input */}
                  <div className="auth-username-field">
                    <label className="auth-label" htmlFor="username">
                      Username
                    </label>
                    <div className="input-with-icon">
                      <span className="input-icon" aria-hidden>
                        <FontAwesomeIcon icon={faIdBadge} />
                      </span>
                      <input
                        id="username"
                        type="text"
                        className="auth-input"
                        placeholder="EDU001"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon has-right">
              <span className="input-icon" aria-hidden>
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="input-right-icon"
                onClick={() => setShowPassword((v) => !v)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {/* Forgot Password Link */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "1rem",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-secondary-500)",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup" className="link">
              Create one
            </Link>
          </p>
        </div>
        <AuthSidebar />
      </div>
    </div>
  );
}
