import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faFilter,
  faEllipsisH,
  faEdit,
  faTrash,
  faPowerOff,
  faCamera,
  faEye,
  faEyeSlash,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import {
  institutionAdminService,
  InstitutionAdmin,
} from "../../services/institution-admin.service";
import {
  CreateInstitutionAdminDto,
  UpdateInstitutionAdminDto,
  OtpType,
} from "../../types";
import { institutionService } from "../../services/institution.service";
import { authService } from "../../services/auth.service";
import "../../styles/owner.css";

export default function AdminManagement() {
  // Data State
  const [admins, setAdmins] = useState<InstitutionAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [institutionPrefix, setInstitutionPrefix] = useState<string>("EDU");

  // UI State
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>(
    "/dummy/institution-admin-dummy-profile-picture.jpg",
  );
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
    otp: "",
  });

  // Fetch institution and admins on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const institution = await institutionService.getMyInstitution();
        if (institution?.prefix) {
          setInstitutionPrefix(institution.prefix);
        }
      } catch (err) {
        setError(
          "Unable to load institution context. Some fields may be unavailable.",
        );
      }
      fetchAdmins();
    };
    loadData();
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- Fetch Admins ---
  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await institutionAdminService.getAdmins();
      setAdmins(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch admins");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Helpers ---
  const filteredAdmins = admins.filter((admin) => {
    const matchesFilter =
      filterStatus === "All" ||
      (filterStatus === "Active" && admin.isActive) ||
      (filterStatus === "Inactive" && !admin.isActive);
    return matchesFilter;
  });

  // --- Handlers ---

  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFilterOpen(false);

    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      // Calculate position relative to button
      const button = e.currentTarget as HTMLButtonElement;
      const rect = button.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 140, // Align right edge with button
      });

      setOpenMenuId(id);
    }
  };

  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setIsFilterOpen(!isFilterOpen);
  };

  const handleOpenModal = (admin?: InstitutionAdmin) => {
    if (admin) {
      setFormData({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        password: "",
        confirm: "",
        otp: "",
      });
      // Set profile picture from admin data if available
      setProfilePhotoPreview(
        admin.profilePicture?.publicUrl ||
          `/dummy/institution-admin-dummy-profile-picture.jpg`,
      );
      setProfilePhotoFile(null);
      setIsEditing(true);
    } else {
      setFormData({
        id: 0,
        name: "",
        email: "",
        username: "",
        password: "",
        confirm: "",
        otp: "",
      });
      setProfilePhotoPreview(
        `/dummy/institution-admin-dummy-profile-picture.jpg`,
      );
      setProfilePhotoFile(null);
      setIsEditing(false);
    }
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      id: 0,
      name: "",
      email: "",
      username: "",
      password: "",
      confirm: "",
      otp: "",
    });
    setProfilePhotoFile(null);
    setProfilePhotoPreview(
      "/dummy/institution-admin-dummy-profile-picture.jpg",
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError("Please select a valid image file");
    }
  };

  const handleSendOtp = async () => {
    const email = formData.email?.trim();
    if (!email) {
      setError("Please enter an email address first");
      return;
    }

    setIsSendingOtp(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await authService.sendOtp({ email, type: OtpType.EMAIL_VERIFICATION });
      setSuccessMessage("OTP sent successfully to " + email);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password && formData.password !== formData.confirm) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        // Update
        const updateData: Partial<UpdateInstitutionAdminDto> = {
          name: formData.name,
        };
        // Only include email if provided
        if (formData.email) {
          updateData.email = formData.email;
        }
        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        // Only include otp if provided and has 6+ characters
        if (formData.otp && formData.otp.length >= 6) {
          updateData.otp = formData.otp;
        }
        // Include profile picture in the same multipart request when selected
        if (profilePhotoFile) {
          updateData.profilePicture = profilePhotoFile;
        }

        await institutionAdminService.updateAdmin(formData.id, updateData);
        setSuccessMessage("Administrator updated successfully!");
      } else {
        // Create
        const createData: CreateInstitutionAdminDto = {
          username: formData.username,
          password: formData.password,
          name: formData.name,
        };
        // Only include email if provided
        if (formData.email) {
          createData.email = formData.email;
        }
        // Only include otp if provided and has 6+ characters
        if (formData.otp && formData.otp.length >= 6) {
          createData.otp = formData.otp;
        }
        // Include profile picture in the same multipart request when selected
        if (profilePhotoFile) {
          createData.profilePicture = profilePhotoFile;
        }
        await institutionAdminService.createAdmin(createData);
        setSuccessMessage("Administrator added successfully!");
      }

      setTimeout(() => {
        setSuccessMessage(null);
        handleCloseModal();
        fetchAdmins();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save administrator",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await institutionAdminService.deleteAdmin(id);
      setSuccessMessage("Administrator deleted successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
        fetchAdmins();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete administrator",
      );
    } finally {
      setIsLoading(false);
      setOpenMenuId(null);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      await institutionAdminService.toggleStatus(id, !currentStatus);
      setSuccessMessage(
        `Administrator ${
          !currentStatus ? "activated" : "deactivated"
        } successfully!`,
      );
      setTimeout(() => {
        setSuccessMessage(null);
        fetchAdmins();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsLoading(false);
      setOpenMenuId(null);
    }
  };

  return (
    <div className="admin-page-container">
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

      {/* --- Header --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
          Institution Administrators
        </h2>
        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#1e3a8a" }}
          onClick={() => handleOpenModal()}
          disabled={isLoading}
        >
          Add New Admin
        </button>
      </div>

      {/* --- Main Card --- */}
      <div
        className="card"
        style={{ padding: "1.5rem", minHeight: "400px", width: "100%" }}
      >
        <h3
          className="card-title"
          style={{
            fontSize: "1.1rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
          }}
        >
          Registered Administrators
        </h3>

        {/* Filter Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
            position: "relative",
          }}
        >
          {/* Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              className="btn"
              style={{
                height: "38px",
                background: "#fff",
                border: "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
              }}
              onClick={toggleFilter}
              disabled={isLoading}
            >
              {filterStatus === "All" ? "Filter" : filterStatus}{" "}
              <FontAwesomeIcon icon={faFilter} />
            </button>

            {isFilterOpen && (
              <div className="filter-dropdown">
                {["All", "Active", "Inactive"].map((status) => (
                  <button
                    key={status}
                    className="dropdown-item"
                    onClick={() => {
                      setFilterStatus(status as any);
                      setIsFilterOpen(false);
                    }}
                    style={{
                      justifyContent: "space-between",
                      padding: "0.6rem 1rem",
                    }}
                  >
                    {status}
                    {filterStatus === status && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        style={{ color: "#10b981" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- Table --- */}
        {isLoading && !admins.length ? (
          <div
            style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}
          >
            Loading administrators...
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="col-profile">Profile</th>
                  <th className="col-name">Name</th>
                  <th className="col-email">Email</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="col-profile">
                        <img
                          src={
                            admin.profilePicture?.publicUrl ||
                            "/dummy/institution-admin-dummy-profile-picture.jpg"
                          }
                          alt={admin.name}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td className="col-name">
                        <div style={{ fontWeight: "500" }}>{admin.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                          {admin.username}
                        </div>
                      </td>
                      <td className="col-email" style={{ color: "#6b7280" }}>
                        {admin.email}
                      </td>
                      <td className="col-status">
                        <span
                          className={`status-pill ${
                            admin.isActive ? "status-active" : "status-inactive"
                          }`}
                        >
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="col-actions">
                        <div className="action-btn-wrapper">
                          <button
                            className="btn action-btn"
                            style={{
                              background: "transparent",
                              padding: "0.4rem",
                              color: "#6b7280",
                            }}
                            onClick={(e) => toggleMenu(admin.id, e)}
                            disabled={isLoading}
                          >
                            <FontAwesomeIcon icon={faEllipsisH} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#6b7280",
                      }}
                    >
                      No administrators found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Menu Dropdown - Rendered outside table for proper layering */}
        {openMenuId !== null && (
          <div
            className="action-menu-dropdown"
            style={{
              position: "fixed",
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              zIndex: 1000,
            }}
          >
            {(() => {
              const admin = admins.find((a) => a.id === openMenuId);
              return admin ? (
                <>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      handleOpenModal(admin);
                      setOpenMenuId(null);
                    }}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      style={{ color: "#6b7280", width: "16px" }}
                    />{" "}
                    Edit
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      toggleStatus(admin.id, admin.isActive);
                      setOpenMenuId(null);
                    }}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon
                      icon={faPowerOff}
                      style={{ color: "#6b7280", width: "16px" }}
                    />
                    {admin.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="dropdown-item danger"
                    onClick={() => {
                      handleDelete(admin.id);
                      setOpenMenuId(null);
                    }}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faTrash} style={{ width: "16px" }} />{" "}
                    Delete
                  </button>
                </>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* --- Modal: Add/Edit Admin --- */}
      {isModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: "550px" }}>
            <div
              className="owner-modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{ margin: 0, fontWeight: "bold", fontSize: "1.25rem" }}
              >
                {isEditing ? "Edit Administrator" : "Add New Administrator"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isLoading}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "#6b7280",
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Modal Error Message */}
            {error && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  margin: "1rem",
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

            <form onSubmit={handleSave}>
              {/* Profile Picture Section - Centered at Top */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "1.5rem 1.5rem 1rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <img
                    src={profilePhotoPreview}
                    alt="Profile"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      border: "3px solid #e5e7eb",
                      objectFit: "cover",
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <FontAwesomeIcon icon={faCamera} /> Upload Photo
                  </button>
                </div>
              </div>

              <div className="owner-modal-body modal-form-grid">
                {/* Employee ID */}
                <div>
                  <label className="auth-label">Employee ID</label>
                  <input
                    className="auth-input"
                    placeholder="Enter employee ID"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={isLoading || isEditing}
                    style={
                      isEditing ? { backgroundColor: "#f3f4f6" } : undefined
                    }
                    required
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="auth-label">Full Name</label>
                  <input
                    className="auth-input"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="auth-label">Email (optional)</label>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* Password Row */}
                <div className="password-row">
                  <div>
                    <label className="auth-label">
                      Password {isEditing && "(Optional)"}
                    </label>
                    <div
                      className="input-with-icon has-right"
                      style={{ margin: 0 }}
                    >
                      <input
                        type={showPassword ? "text" : "password"}
                        className="auth-input"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={isLoading}
                        required={!isEditing}
                        style={{ paddingLeft: "1rem" }}
                      />
                      <button
                        type="button"
                        className="input-right-icon"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="auth-label">Confirm Password</label>
                    <div
                      className="input-with-icon has-right"
                      style={{ margin: 0 }}
                    >
                      <input
                        type={showConfirm ? "text" : "password"}
                        className="auth-input"
                        placeholder="Confirm Password"
                        value={formData.confirm}
                        onChange={(e) =>
                          setFormData({ ...formData, confirm: e.target.value })
                        }
                        disabled={isLoading}
                        required={!isEditing && formData.password.length > 0}
                        style={{ paddingLeft: "1rem" }}
                      />
                      <button
                        type="button"
                        className="input-right-icon"
                        onClick={() => setShowConfirm(!showConfirm)}
                        disabled={isLoading}
                      >
                        <FontAwesomeIcon
                          icon={showConfirm ? faEyeSlash : faEye}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* OTP field (required when email is provided) */}
                {formData.email && (
                  <div>
                    <label className="auth-label">
                      {isEditing ? "OTP (if changing email)" : "OTP"}
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="6-digit OTP"
                        maxLength={6}
                        value={formData.otp}
                        onChange={(e) =>
                          setFormData({ ...formData, otp: e.target.value })
                        }
                        disabled={isLoading}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleSendOtp}
                        disabled={isLoading || isSendingOtp || !formData.email}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {isSendingOtp ? "Sending..." : "Send OTP"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="owner-modal-footer"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                  padding: "1.5rem",
                }}
              >
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: "#fff",
                    border: "1px solid #d1d5db",
                    padding: "0.6rem 1.2rem",
                  }}
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "#1e3a8a",
                    padding: "0.6rem 1.2rem",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
