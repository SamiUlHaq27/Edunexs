import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ASSETS } from "../config/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import AuthSidebar from "../components/AuthSidebar";

export default function VerifyEmail(): React.JSX.Element {
  const [otp, setOtp] = useState("");

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Verifying code: ${otp}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-split">
        <div className="auth-card">
          <img src={ASSETS.logo} alt={ASSETS.alt} className="auth-logo" loading="lazy" />
          <h2 className="auth-title">Verify Email</h2>
          <p className="auth-subtitle">
            Please enter the code sent to your email address.
          </p>

          <form onSubmit={onVerify} className="auth-form">
            <label className="auth-label" htmlFor="otp">Verification Code</label>
            <div className="input-with-icon">
              <span className="input-icon"><FontAwesomeIcon icon={faKey} /></span>
              <input
                id="otp"
                type="text"
                className="auth-input"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit">Verify Account</button>
          </form>

          <p className="auth-switch">
            Didn't receive code? <button className="link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>Resend</button>
          </p>
          
           <p className="auth-switch" style={{ marginTop: '1rem' }}>
             <Link to="/login" className="link">Back to Login</Link>
          </p>
        </div>
        <AuthSidebar />
      </div>
    </div>
  );
}