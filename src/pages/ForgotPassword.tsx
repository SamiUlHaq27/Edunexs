import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ASSETS } from "../config/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faLock, 
  faArrowLeft,
  faEye, 
  faEyeSlash,
  faCheckCircle,
  faCircle
} from "@fortawesome/free-solid-svg-icons";
import AuthSidebar from "../components/AuthSidebar";

export default function ForgotPassword(): React.JSX.Element {
  // Step 1: Email, Step 2: OTP & Reset
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");

  // Step 2 State
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // --- Real-time Validation Logic ---
  const checks = {
    length: newPassword.length >= 8,
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    capital: /[A-Z]/.test(newPassword) // Added Capital Letter check
  };
  
  // All requirements must be met to show Confirm Field
  const isPasswordValid = Object.values(checks).every(Boolean);
  
  // Button is enabled only if Password is valid AND matches confirmation
  const canSubmit = isPasswordValid && confirmPassword.length > 0 && newPassword === confirmPassword;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`OTP sent to ${email}`);
    setStep(2);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) {
      // Fallback alert if user somehow triggers it
      alert("Please fulfill all password requirements and ensure passwords match.");
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      alert("Please enter the full 6-digit code.");
      return;
    }

    alert(`Password reset successfully!\nOTP: ${otpCode}`);
  };

  // --- OTP Handlers ---
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every(char => !isNaN(Number(char)))) {
       const newOtp = [...otp];
       pastedData.forEach((char, i) => { if (i < 6) newOtp[i] = char; });
       setOtp(newOtp);
       const focusIndex = Math.min(pastedData.length, 5);
       otpRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-split">
        <div className="auth-card">
          <img src={ASSETS.logo} alt={ASSETS.alt} className="auth-logo" loading="lazy" />
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            {step === 1 
              ? "Enter your email to receive a reset code" 
              : "Enter the code and set your new password"}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <label className="auth-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
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
              <button type="submit" className="btn btn-primary auth-submit">Send OTP</button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="auth-form">
              {/* OTP Section */}
              <label className="auth-label">Verification Code</label>
              <div className="otp-container" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    placeholder="-"
                  />
                ))}
              </div>

              {/* New Password */}
              <label className="auth-label" htmlFor="new-password">New Password</label>
              <div className="input-with-icon has-right">
                <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
                <input
                  id="new-password"
                  type={showNewPass ? "text" : "password"}
                  className="auth-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-right-icon"
                  onClick={() => setShowNewPass(!showNewPass)}
                  tabIndex={-1}
                >
                  <FontAwesomeIcon icon={showNewPass ? faEyeSlash : faEye} />
                </button>
              </div>

              {/* Requirement Indicators */}
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
                       At least 1 special character (!@#$%)
                    </li>
                 </ul>
              </div>

              {/* Confirm Password - Hidden until requirements met */}
              {isPasswordValid && (
                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                  <label className="auth-label" htmlFor="confirm-password">Confirm Password</label>
                  <div className="input-with-icon has-right">
                    <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
                    <input
                      id="confirm-password"
                      type={showConfirmPass ? "text" : "password"}
                      className="auth-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-right-icon"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      tabIndex={-1}
                    >
                      <FontAwesomeIcon icon={showConfirmPass ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary auth-submit"
                disabled={!canSubmit}
                title={!canSubmit ? "Please meet all password requirements first" : ""}
              >
                Reset Password
              </button>
            </form>
          )}

          <p className="auth-switch">
            <Link to="/login" className="link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
               <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
            </Link>
          </p>
        </div>
        <AuthSidebar />
      </div>
    </div>
  );
}