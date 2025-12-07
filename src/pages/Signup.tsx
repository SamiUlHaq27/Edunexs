import React, { useState, useRef } from "react";
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
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import AuthSidebar from "../components/AuthSidebar";

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

  // Step 2 State (OTP)
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Password Validation Logic ---
  const checks = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    capital: /[A-Z]/.test(password)
  };
  const isPasswordValid = Object.values(checks).every(Boolean);
  const canSubmitDetails = name && email && isPasswordValid && confirm && password === confirm;

  // --- Handlers ---

  const onDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitDetails) return;
    
    // Simulate API call to send OTP
    // console.log(`Sending OTP to ${email}...`);
    alert(`Verification code sent to ${email}`);
    setStep(2);
  };

  const onVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      alert("Please enter the complete 6-digit code.");
      return;
    }

    // Simulate final signup success
    // alert(`Account successfully created for ${name}!`);
    
    // Redirect to Create Institution Page
    navigate("/create-institution");
  };

  // --- OTP Input Handlers (Reused) ---
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

              <div className="tabs">
                <NavLink to="/login" className={({ isActive }) => `tab${isActive ? " tab-active" : ""}`}>
                  Sign In
                </NavLink>
                <NavLink to="/signup" className={({ isActive }) => `tab${isActive ? " tab-active" : ""}`}>
                  Signup
                </NavLink>
              </div>

              <div className="auth-main">
                <form onSubmit={onDetailsSubmit} className="auth-form">
                  {/* Name */}
                  <label className="auth-label" htmlFor="name">Full name</label>
                  <div className="input-with-icon">
                    <span className="input-icon"><FontAwesomeIcon icon={faUser} /></span>
                    <input
                      id="name" type="text" className="auth-input" placeholder="Ahmad Raza"
                      value={name} onChange={(e) => setName(e.target.value)} required
                    />
                  </div>

                  {/* Email */}
                  <label className="auth-label" htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <span className="input-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
                    <input
                      id="email" type="email" className="auth-input" placeholder="you@example.com"
                      value={email} onChange={(e) => setEmail(e.target.value)} required
                    />
                  </div>

                  {/* Password */}
                  <label className="auth-label" htmlFor="password">Password</label>
                  <div className="input-with-icon has-right">
                    <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
                    <input
                      id="password" type={showPassword ? "text" : "password"} className="auth-input" placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)} required
                    />
                    <button type="button" className="input-right-icon" onClick={() => setShowPassword((v) => !v)}>
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>

                  {/* Requirements */}
                  <div className="password-requirements">
                     <p>Password requirements:</p>
                     <ul className="requirements-list">
                        <li className={checks.length ? "valid" : ""}>At least 8 characters</li>
                        <li className={checks.capital ? "valid" : ""}>At least 1 capital letter (A-Z)</li>
                        <li className={checks.number ? "valid" : ""}>At least 1 number (0-9)</li>
                        <li className={checks.special ? "valid" : ""}>At least 1 special character</li>
                     </ul>
                  </div>

                  {/* Confirm Password */}
                  {isPasswordValid && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                      <label className="auth-label" htmlFor="confirm">Confirm password</label>
                      <div className="input-with-icon has-right">
                        <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
                        <input
                          id="confirm" type={showConfirm ? "text" : "password"} className="auth-input" placeholder="••••••••"
                          value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                        />
                        <button type="button" className="input-right-icon" onClick={() => setShowConfirm((v) => !v)}>
                          <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                        </button>
                      </div>
                      {confirm && password !== confirm && (
                        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="btn btn-primary auth-submit"
                    disabled={!canSubmitDetails}
                  >
                    Continue <FontAwesomeIcon icon={faPaperPlane} style={{ marginLeft: '0.5rem' }}/>
                  </button>
                </form>
                
                <p className="auth-switch">
                  Already have an account? <Link to="/login" className="link">Sign in</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Verification Screen */}
              <h2 className="auth-title">Verify Email</h2>
              <p className="auth-subtitle">
                Enter the 6-digit code sent to <br/>
                <strong>{email}</strong>
              </p>

              <form onSubmit={onVerifySubmit} className="auth-form">
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
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary auth-submit"
                  disabled={otp.join("").length < 6}
                >
                  Verify & Create Account
                </button>
              </form>

              <div className="auth-switch" style={{ marginTop: '1.5rem' }}>
                <button 
                  onClick={() => setStep(1)} 
                  className="link" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}
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