import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faImage,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { authService } from "../../services/auth.service";
import { institutionAdminService } from "../../services/institution-admin.service";
import { OtpType } from "../../types";

export default function InstitutionAdminSettings(): React.JSX.Element {
  const currentUser = authService.getUser();
  const [email, setEmail] = useState(currentUser?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(
    currentUser?.profilePicture?.publicUrl ||
      "/dummy/institution-admin-dummy-profile-picture.jpg",
  );

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSendOtp = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError("Please enter a recovery email first.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSendingOtp(true);

    try {
      // Backend currently validates profile-email OTP against SIGNUP type.
      await authService.sendOtp({ email: targetEmail, type: OtpType.SIGNUP });
      setSuccess(`OTP sent to ${targetEmail}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setProfileFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const payload: {
      email?: string;
      otp?: string;
      password?: string;
    } = {};

    const normalizedEmail = email.trim();
    const originalEmail = currentUser?.email || "";
    if (normalizedEmail && normalizedEmail !== originalEmail) {
      if (!otp || otp.length !== 6) {
        setError("Please enter the 6-digit OTP to verify the new email.");
        return;
      }
      payload.email = normalizedEmail;
      payload.otp = otp;
    }

    if (password) {
      payload.password = password;
    }

    if (!payload.email && !payload.password && !profileFile) {
      setError("Please change at least one field before saving.");
      return;
    }

    setIsSaving(true);

    try {
      await institutionAdminService.updateMyProfile(
        payload,
        profileFile || undefined,
      );

      // Refresh local user to keep header/profile in sync.
      const refreshedUser = await authService.getCurrentUser();
      authService.setUser(refreshedUser);

      setSuccess("Profile updated successfully.");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      setProfileFile(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: 700 }}>
        Account Settings
      </h2>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Update your profile picture, recovery email, and password.
      </p>

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

      {success && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            backgroundColor: "#efe",
            border: "1px solid #cfc",
            borderRadius: "0.5rem",
            color: "#166534",
            fontSize: "0.875rem",
          }}
        >
          {success}
        </div>
      )}

      <form
        onSubmit={handleSave}
        style={{
          background: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "1.5rem",
          maxWidth: "760px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1.25rem",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <img
            src={preview}
            alt="Profile"
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSelectFile}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "1px solid #d1d5db",
                background: "#f9fafb",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.85rem",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faImage} /> Change Picture
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "0.45rem",
            }}
          >
            Recovery Email
          </label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <FontAwesomeIcon
                icon={faEnvelope}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "0.8rem",
                  color: "#9ca3af",
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.75rem 0.65rem 2.2rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp}
              style={{
                border: "none",
                background: "#1d4ed8",
                color: "white",
                borderRadius: "0.5rem",
                padding: "0.65rem 0.9rem",
                cursor: isSendingOtp ? "not-allowed" : "pointer",
              }}
            >
              {isSendingOtp ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "0.45rem",
            }}
          >
            OTP (required when changing email)
          </label>
          <div style={{ position: "relative" }}>
            <FontAwesomeIcon
              icon={faKey}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "0.8rem",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit OTP"
              style={{
                width: "100%",
                padding: "0.65rem 0.75rem 0.65rem 2.2rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.45rem",
              }}
            >
              New Password (optional)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                  width: "100%",
                  padding: "0.65rem 2.3rem 0.65rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "0.6rem",
                  top: "0.55rem",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.45rem",
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{
                  width: "100%",
                  padding: "0.65rem 2.3rem 0.65rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "0.6rem",
                  top: "0.55rem",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={isSaving}
            style={{
              border: "none",
              background: "#1d4ed8",
              color: "white",
              borderRadius: "0.5rem",
              padding: "0.7rem 1.1rem",
              cursor: isSaving ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
