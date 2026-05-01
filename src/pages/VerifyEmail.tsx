import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ASSETS } from "../config/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import AuthSidebar from "../components/AuthSidebar";
import { toastService } from "../services/toast.service";

export default function VerifyEmail(): React.JSX.Element {
  // Email state - user should pass this from signup flow (or from URL if available)
  const [email, setEmail] = useState<string | null>(
    new URLSearchParams(window.location.search).get("email"),
  );

  // OTP state - 6-digit array
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // OTP change handler
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  // OTP backspace handler
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Paste OTP handler
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

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toastService.error("Email address is missing. Please start from signup.");
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toastService.error("Please enter the full 6-digit code.");
      return;
    }

    setIsLoading(true);

    // Simulate verification (replace with actual API call)
    setTimeout(() => {
      toastService.success("Email verified successfully!");
      setIsLoading(false);
      // Redirect to login after delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !email) return;

    setIsLoading(true);

    try {
      // Simulate resend OTP (replace with actual API call)
      setTimeout(() => {
        toastService.success(`New verification code sent to ${email}`);
        setIsLoading(false);
        setResendTimer(60); // 60-second cooldown
        setOtp(new Array(6).fill(""));
      }, 1000);
    } catch (err) {
      toastService.error(
        err instanceof Error ? err.message : "Failed to resend code",
      );
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
          <h2 className="auth-title">Verify Email</h2>
          <p className="auth-subtitle">
            {email
              ? `Please enter the code sent to ${email}`
              : "Please enter the code sent to your email address."}
          </p>

          <form onSubmit={onVerify} className="auth-form">
            <label className="auth-label">Verification Code</label>
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
                  placeholder="-"
                  disabled={isLoading}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Account"}
            </button>
          </form>

          <p className="auth-switch">
            Didn't receive code?{" "}
            <button
              type="button"
              className="link"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || isLoading}
              style={{
                background: "none",
                border: "none",
                cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                font: "inherit",
                color: resendTimer > 0 ? "#ccc" : "#1976d2",
              }}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
            </button>
          </p>

          <p className="auth-switch" style={{ marginTop: "1rem" }}>
            <Link to="/login" className="link">
              Back to Login
            </Link>
          </p>
        </div>
        <AuthSidebar />
      </div>
    </div>
  );
}
