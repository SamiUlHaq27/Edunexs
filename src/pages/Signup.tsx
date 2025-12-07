import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ASSETS } from "../config/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowLeft,
  faPaperPlane,
  faUpload,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import AuthSidebar from "../components/AuthSidebar";
import { authService } from "../services/auth.service";
import { OtpType, UserRole } from "../types";

export default function Signup(): React.JSX.Element {
  const navigate = useNavigate(); // Initialize navigation

  // Steps: 1 = Details, 2 = Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const rolePlaceholder = (role: UserRole): string => {
    const map: Record<UserRole, string> = {
      [UserRole.INSTITUTION_OWNER]:
        "/dummy/institution-owner-dummy-profile-picture.png",
      [UserRole.INSTITUTION_ADMIN]:
        "/dummy/institution-admin-dummy-profile-picture.jpg",
      [UserRole.SYSTEM_ADMIN]: "/dummy/system-admin-dummy-profile-picture.jpg",
      [UserRole.TEACHER]: "/dummy/teacher-dummy-profile-picture.png",
      [UserRole.STUDENT]: "/dummy/student-dummy-profile-picture.png",
      [UserRole.PARENT]: "/dummy/student-dummy-profile-picture.png",
    };
    return map[role] || map[UserRole.INSTITUTION_OWNER];
  };

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    rolePlaceholder(UserRole.INSTITUTION_OWNER)
  );
  const [selectedRole] = useState<UserRole>(UserRole.INSTITUTION_OWNER);

  // Step 2 State (OTP)
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profilePicture) {
      const url = URL.createObjectURL(profilePicture);
      setProfilePreview(url);
      return () => URL.revokeObjectURL(url);
    }

    // Fallback to role-based dummy asset when no file is selected
    setProfilePreview(rolePlaceholder(selectedRole));
    return undefined;
  }, [profilePicture, selectedRole]);

  // --- Password Validation Logic ---
  const checks = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    capital: /[A-Z]/.test(password),
  };
  const isPasswordValid = Object.values(checks).every(Boolean);
  const canSubmitDetails =
    name && email && isPasswordValid && confirm && password === confirm;

  // --- Handlers ---

  const onDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitDetails) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await authService.sendOtp({
        email,
        type: OtpType.SIGNUP,
      });

      setSuccessMessage(`Verification code sent to ${email}`);
      setTimeout(() => {
        setStep(2);
        setSuccessMessage(null);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.signup(
        {
          name,
          email,
          password,
          otp: code,
        },
        profilePicture || undefined
      );

      setSuccessMessage("Account created successfully!");

      // Redirect to Create Institution Page after a short delay
      setTimeout(() => {
        navigate("/create-institution");
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  // --- OTP Input Handlers (Reused) ---
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every((char) => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-split">
        {/* Auth Card */}
        <div className="auth-card">
          <img
            src={ASSETS.logo}
            alt={ASSETS.alt}
            className="auth-logo"
            loading="lazy"
          />

          {step === 1 ? (
            <>
              <h2 className="auth-title">Create your account</h2>
              <p className="auth-subtitle">It only takes a minute</p>

              <div className="tabs" style={{ marginBottom: "1.25rem" }}>
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "50%",
                    background: "#f3f4f6",
                    border: "2px dashed #d1d5db",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      style={{ fontSize: "2.8rem", color: "#9ca3af" }}
                    />
                  )}
                </div>
                <label
                  htmlFor="profilePicture"
                  className="link"
                  style={{
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "0.95rem",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  <FontAwesomeIcon icon={faUpload} /> Upload picture
                </label>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProfilePicture(e.target.files[0]);
                    }
                  }}
                  style={{ display: "none" }}
                  disabled={isLoading}
                />
              </div>

              <div className="auth-main">
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

                {/* Success Message */}
                {successMessage && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      marginBottom: "1rem",
                      backgroundColor: "#efe",
                      border: "1px solid #cfc",
                      borderRadius: "0.5rem",
                      color: "#383",
                      fontSize: "0.875rem",
                    }}
                  >
                    {successMessage}
                  </div>
                )}

                <form onSubmit={onDetailsSubmit} className="auth-form">
                  {/* Name */}
                  <label className="auth-label" htmlFor="name">
                    Full name
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <input
                      id="name"
                      type="text"
                      className="auth-input"
                      placeholder="Ahmad Raza"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email */}
                  <label className="auth-label" htmlFor="email">
                    Email
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      className="auth-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <label className="auth-label" htmlFor="password">
                    Password
                  </label>
                  <div className="input-with-icon has-right">
                    <span className="input-icon">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-right-icon"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>

                  {/* Requirements */}
                  <div className="password-requirements">
                    <p>Password requirements:</p>
                    <ul className="requirements-list">
                      <li className={checks.length ? "valid" : ""}>
                        At least 8 characters
                      </li>
                      <li className={checks.capital ? "valid" : ""}>
                        At least 1 capital letter (A-Z)
                      </li>
                      <li className={checks.number ? "valid" : ""}>
                        At least 1 number (0-9)
                      </li>
                      <li className={checks.special ? "valid" : ""}>
                        At least 1 special character
                      </li>
                    </ul>
                  </div>

                  {/* Confirm Password */}
                  {isPasswordValid && (
                    <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
                      <label className="auth-label" htmlFor="confirm">
                        Confirm password
                      </label>
                      <div className="input-with-icon has-right">
                        <span className="input-icon">
                          <FontAwesomeIcon icon={faLock} />
                        </span>
                        <input
                          id="confirm"
                          type={showConfirm ? "text" : "password"}
                          className="auth-input"
                          placeholder="••••••••"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="input-right-icon"
                          onClick={() => setShowConfirm((v) => !v)}
                        >
                          <FontAwesomeIcon
                            icon={showConfirm ? faEyeSlash : faEye}
                          />
                        </button>
                      </div>
                      {confirm && password !== confirm && (
                        <p
                          style={{
                            color: "#ef4444",
                            fontSize: "0.8rem",
                            marginTop: "-0.5rem",
                            marginBottom: "1rem",
                          }}
                        >
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary auth-submit"
                    disabled={!canSubmitDetails || isLoading}
                  >
                    {isLoading ? "Sending..." : "Continue"}
                    {!isLoading && (
                      <FontAwesomeIcon
                        icon={faPaperPlane}
                        style={{ marginLeft: "0.5rem" }}
                      />
                    )}
                  </button>
                </form>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <Link to="/login" className="link">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Verification Screen */}
              <h2 className="auth-title">Verify Email</h2>
              <p className="auth-subtitle">
                Enter the 6-digit code sent to <br />
                <strong>{email}</strong>
              </p>

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

              {/* Success Message */}
              {successMessage && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                    backgroundColor: "#efe",
                    border: "1px solid #cfc",
                    borderRadius: "0.5rem",
                    color: "#383",
                    fontSize: "0.875rem",
                  }}
                >
                  {successMessage}
                </div>
              )}

              <form onSubmit={onVerifySubmit} className="auth-form">
                <div className="otp-container" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      autoFocus={index === 0}
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit"
                  disabled={otp.join("").length < 6 || isLoading}
                >
                  {isLoading
                    ? "Creating Account..."
                    : "Verify & Create Account"}
                </button>
              </form>

              <div className="auth-switch" style={{ marginTop: "1.5rem" }}>
                <button
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setOtp(new Array(6).fill(""));
                  }}
                  className="link"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "inherit",
                  }}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Change Email
                </button>
              </div>
            </>
          )}
        </div>

        <AuthSidebar />
      </div>
    </div>
  );
}
