import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faClock,
  faGlobe,
  faMapMarkerAlt,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner.css";
import { ASSETS } from "../../config/assets";
import { institutionService } from "../../services/institution.service";
import { Institution } from "../../types";

export default function InstitutionSettings(): React.JSX.Element {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<Institution | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchInstitution = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const inst = await institutionService.getMyInstitution();
        if (!mounted) return;
        setInstitution(inst);
        setFormData(inst);
      } catch (err) {
        if (!mounted) return;
        setError("Unable to load institution right now.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchInstitution();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  const renderStatusPill = (inst: Institution) => {
    const blocked = inst.isBlocked;
    return (
      <span
        style={{
          display: "inline-block",
          padding: "0.35rem 0.75rem",
          borderRadius: "999px",
          fontWeight: 600,
          background: blocked ? "#fef2f2" : "#ecfdf3",
          color: blocked ? "#b91c1c" : "#166534",
          border: `1px solid ${blocked ? "#fee2e2" : "#bbf7d0"}`,
        }}
      >
        {blocked ? "Blocked" : "Active"}
      </span>
    );
  };

  const renderCard = () => {
    if (isLoading) {
      return (
        <div className="inst-profile-card">
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
            Loading institution details…
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="inst-profile-card">
          <p style={{ margin: 0, color: "#b91c1c" }}>{error}</p>
        </div>
      );
    }

    if (!institution) {
      return (
        <div className="inst-profile-card">
          <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
            No institution found. Create one to see details here.
          </p>
        </div>
      );
    }

    const logo =
      (institution as any)?.logo?.publicUrl ||
      institution.logoUrl ||
      "/dummy/institution-dummy-logo-picture.png";
    const createdDate = institution.createdAt
      ? new Date(institution.createdAt).toLocaleDateString()
      : "-";

    return (
      <div className="inst-profile-card">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <img src={logo} alt="Logo" className="inst-logo-large" />
          {renderStatusPill(institution)}
        </div>

        <div className="inst-info">
          <h3
            className="inst-name"
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              letterSpacing: "1px",
              marginBottom: "0.25rem",
            }}
          >
            {institution.name}
          </h3>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "0.75rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {institution.prefix && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.7rem",
                  borderRadius: "999px",
                  background: "#eef2ff",
                  color: "#4338ca",
                  fontWeight: 600,
                }}
              >
                <FontAwesomeIcon icon={faShieldAlt} /> {institution.prefix}
              </span>
            )}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <FontAwesomeIcon icon={faClock} /> Created {createdDate}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} /> {institution.address}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FontAwesomeIcon icon={faGlobe} /> {institution.city},{" "}
              {institution.country}
            </span>
          </div>
        </div>

        <div style={{ alignSelf: "center" }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setIsEditOpen(true)}
          >
            Edit Details
          </button>
        </div>
      </div>
    );
  };

  const handleFormChange = (field: keyof Institution, value: string) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsSaving(true);
    setError(null);

    let nextLogoUrl = formData.logoUrl;
    if (logoFile) {
      try {
        await institutionService.uploadLogo(logoFile);
        nextLogoUrl = logoPreview || formData.logoUrl;
      } catch (err) {
        setError("Logo upload failed. Keeping existing logo.");
      }
    }

    try {
      const updated = await institutionService.updateInstitution({
        name: formData.name,
        city: formData.city,
        country: formData.country,
        address: formData.address,
      });

      const updatedInstitution = { ...updated, logoUrl: nextLogoUrl };
      setInstitution(updatedInstitution);
      setFormData(updatedInstitution);
      setLogoFile(null);
      setIsEditOpen(false);
      setSuccessMessage("Institution details updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update institution details.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const triggerLogoSelect = () => {
    fileInputRef.current?.click();
  };

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <h2
        style={{
          marginBottom: "1.5rem",
          fontSize: "1.75rem",
          fontWeight: "bold",
        }}
      >
        Institution Details
      </h2>
      {successMessage && (
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
          {successMessage}
        </div>
      )}
      {renderCard()}

      <div className="inst-bottom-grid">
        <div className="inst-events-panel">
          <h3 style={{ marginBottom: "1.5rem", fontWeight: "bold" }}>
            Upcoming Events & Calendar
          </h3>
          <div className="event-list">
            <div className="event-item">
              <span className="event-date">Dec 10 - Faculty Meeting</span>
            </div>
            <div className="event-item">
              <span className="event-date">Dec 15 - End of Semester Exam</span>
            </div>
            <div className="event-item" style={{ borderBottom: "none" }}>
              <span className="event-date">Dec 20 - Winter Break Begins</span>
            </div>
          </div>
        </div>

        <div className="inst-calendar-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <button className="btn btn-icon" style={{ padding: 0 }}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span style={{ fontWeight: "bold" }}>December 2025</span>
            <button className="btn btn-icon" style={{ padding: 0 }}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className="mini-calendar-grid">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="mini-cal-header">
                {d}
              </div>
            ))}
            <div />
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                className={`mini-cal-day ${
                  day === 10 || day === 15 || day === 20 ? "today" : ""
                } ${day === 10 ? "active" : ""}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isEditOpen && formData && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ maxWidth: "520px" }}>
            <div
              className="owner-modal-header"
              style={{ marginBottom: "0.5rem" }}
            >
              <h3 style={{ margin: 0 }}>Edit Institution Details</h3>
            </div>
            <div
              className="owner-modal-body"
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div>
                  <img
                    src={
                      logoPreview ||
                      (formData as any)?.logo?.publicUrl ||
                      formData.logoUrl ||
                      "/dummy/institution-dummy-logo-picture.png"
                    }
                    alt="Logo preview"
                    className="inst-logo-large"
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "12px",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleLogoInput}
                  />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={triggerLogoSelect}
                  >
                    Change Logo
                  </button>
                </div>
              </div>
              <div>
                <label className="auth-label">Prefix</label>
                <input
                  className="auth-input"
                  value={formData.prefix}
                  disabled
                />
              </div>
              <div>
                <label className="auth-label">Name</label>
                <input
                  className="auth-input"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label className="auth-label">City</label>
                  <input
                    className="auth-input"
                    value={formData.city}
                    onChange={(e) => handleFormChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="auth-label">Country</label>
                  <input
                    className="auth-input"
                    value={formData.country}
                    onChange={(e) =>
                      handleFormChange("country", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <label className="auth-label">Address</label>
                <textarea
                  className="auth-input"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  style={{ fontFamily: "inherit" }}
                />
              </div>
            </div>
            <div
              className="owner-modal-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <button
                className="btn"
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
                style={{ background: "white", border: "1px solid #d1d5db" }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
