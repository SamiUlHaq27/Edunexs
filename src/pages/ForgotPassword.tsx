import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ASSETS } from "../config/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey, faLock, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import AuthSidebar from "../components/AuthSidebar";

export default function ForgotPassword(): React.JSX.Element {
  // Step 1: Email, Step 2: OTP & Reset
  const [step, setStep] = useState<1 | 2>(1);
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send OTP to email
    alert(`OTP sent to ${email}`);
    setStep(2);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to verify OTP and reset password
    alert("Password reset successfully!");
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
              : "Enter the code and your new password"}
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
              <label className="auth-label" htmlFor="otp">OTP Code</label>
              <div className="input-with-icon">
                <span className="input-icon"><FontAwesomeIcon icon={faKey} /></span>
                <input
                  id="otp"
                  type="text"
                  className="auth-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <label className="auth-label" htmlFor="new-password">New Password</label>
              <div className="input-with-icon">
                <span className="input-icon"><FontAwesomeIcon icon={faLock} /></span>
                <input
                  id="new-password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary auth-submit">Set New Password</button>
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