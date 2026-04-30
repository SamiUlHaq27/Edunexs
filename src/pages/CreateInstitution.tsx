import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faGlobe,
  faMapMarkerAlt,
  faUpload,
  faArrowRight,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../config/assets";
import AuthSidebar from "../components/AuthSidebar";
import { institutionService } from "../services/institution.service";
import { authService } from "../services/auth.service";
import { toastService } from "../services/toast.service";

export default function CreateInstitution(): React.JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    prefix: "",
    country: "",
    city: "",
    address: "",
    logo: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(
    "/dummy/institution-dummy-logo-picture.png",
  );

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, logo: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("/dummy/institution-dummy-logo-picture.png");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      // Step 1: Create institution
      await institutionService.createInstitution({
        prefix: formData.prefix,
        name: formData.name,
        city: formData.city,
        country: formData.country,
        address: formData.address,
      });

      // Step 2: Upload logo if provided (optional)
      if (formData.logo) {
        try {
          await institutionService.uploadLogo(formData.logo);
        } catch (logoError) {
          // Log logo upload error but don't block the flow
          console.error("Logo upload failed:", logoError);
        }
      }

      // Step 3: Show success, clear session, and redirect to login
      toastService.success(
        `Institution "${formData.name}" has been created. Please sign in again.`,
      );

      setTimeout(() => {
        authService.logout();
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      toastService.error(
        err instanceof Error ? err.message : "Failed to create institution",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-split">
        <div className="auth-card">
          <img src={ASSETS.logo} alt="Logo" className="auth-logo" />
          <h2 className="auth-title">Setup Institution</h2>
          <p className="auth-subtitle">
            Enter your institution's details to get started.
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

          <form onSubmit={handleSubmit} className="auth-form">
            {/* 1. Logo Upload */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    margin: "0 auto 1rem",
                    borderRadius: "50%",
                    background: "#f3f4f6",
                    border: "2px dashed #d1d5db",
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faBuilding}
                      style={{ fontSize: "2rem", color: "#9ca3af" }}
                    />
                  )}
                </div>
                <label
                  htmlFor="logo-upload"
                  className="link"
                  style={{
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "0.9rem",
                    opacity: isLoading ? 0.5 : 1,
                  }}
                >
                  <FontAwesomeIcon icon={faUpload} /> Upload Logo
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* 2. Section Prefix (Moved Up) */}
            <label className="auth-label" htmlFor="prefix">
              Prefix (ID)
            </label>
            <div className="input-with-icon">
              <span className="input-icon">
                <FontAwesomeIcon icon={faTag} />
              </span>
              <input
                id="prefix"
                type="text"
                className="auth-input"
                placeholder="e.g. EDU001"
                value={formData.prefix}
                onChange={handleChange}
                minLength={2}
                maxLength={10}
                disabled={isLoading}
                required
              />
            </div>

            {/* 3. Institution Name */}
            <label className="auth-label" htmlFor="name">
              Institution Name
            </label>
            <div className="input-with-icon">
              <span className="input-icon">
                <FontAwesomeIcon icon={faBuilding} />
              </span>
              <input
                id="name"
                type="text"
                className="auth-input"
                placeholder="e.g. Edunexs Academy"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            {/* 4. Country */}
            <label className="auth-label" htmlFor="country">
              Country
            </label>
            <div className="input-with-icon">
              <span className="input-icon">
                <FontAwesomeIcon icon={faGlobe} />
              </span>
              <input
                id="country"
                type="text"
                className="auth-input"
                placeholder="e.g. Pakistan"
                value={formData.country}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            {/* 5. City & Address */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label className="auth-label" htmlFor="city">
                  City
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </span>
                  <input
                    id="city"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Lahore"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="auth-label" htmlFor="address">
                  Address
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </span>
                  <input
                    id="address"
                    type="text"
                    className="auth-input"
                    placeholder="Street 123..."
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Institution..." : "Create & Continue"}
              {!isLoading && <FontAwesomeIcon icon={faArrowRight} />}
            </button>
          </form>
        </div>
        <AuthSidebar />
      </div>
    </div>
  );
}
