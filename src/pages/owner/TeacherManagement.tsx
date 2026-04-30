// src/pages/owner/TeacherManagement.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { teacherService, institutionService } from "../../services";
import { ASSETS } from "../../config/assets";
import { toastService } from "../../services/toast.service";
import ConfirmActionModal from "../../components/ConfirmActionModal";
import "../../styles/owner.css";
import "../../styles/forms.css";

// Teacher type from service
import type {
  Teacher,
  CreateTeacherDto,
  UpdateTeacherDto,
} from "../../services/teacher.service";

export default function TeacherManagement() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [institution, setInstitution] = useState<any>(null);

  // Loading & Error State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);
  const [pendingDeleteTeacherId, setPendingDeleteTeacherId] = useState<
    number | null
  >(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null,
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>(
    "/dummy/teacher-dummy-profile-picture.png",
  );

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    profilePictureFileId: undefined as string | undefined,
  });

  // Form Validation State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Validation Rules
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Full name must not exceed 50 characters";
    }

    if (!formData.username.trim()) {
      errors.username = "Employee ID is required";
    } else if (formData.username.trim().length < 3) {
      errors.username = "Employee ID must be at least 3 characters";
    } else if (formData.username.trim().length > 30) {
      errors.username = "Employee ID must not exceed 30 characters";
    }

    if (!editingTeacherId && !formData.password) {
      errors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (formData.password && formData.password.length > 30) {
      errors.password = "Password must not exceed 30 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      formData.name.trim().length <= 50 &&
      formData.username.trim().length >= 3 &&
      formData.username.trim().length <= 30 &&
      (editingTeacherId || (formData.password && formData.password.length >= 6))
    );
  };

  // Institution Context Guard & Data Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Load Institution
        const inst = await institutionService.getMyInstitution();
        if (!inst) {
          navigate("/create-institution", { replace: true });
          return;
        }
        setInstitution(inst);

        // Load Teachers
        const response = await teacherService.getTeachers();
        setTeachers(response.data || []);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to load data";
        toastService.error(errorMessage);
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Load teachers list
  const loadTeachers = async () => {
    try {
      const response = await teacherService.getTeachers();
      setTeachers(response.data || []);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load teachers";
      toastService.error(errorMessage);
      console.error("Error loading teachers:", err);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- Helpers ---
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.recoveryEmail
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false);
    const matchesFilter =
      filterStatus === "All" ||
      (teacher.isActive ? "Active" : "Inactive") === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // --- Handlers ---
  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFilterOpen(false);

    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      const button = e.currentTarget as HTMLButtonElement;
      const rect = button.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 140,
      });
      setOpenMenuId(id);
    }
  };

  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setIsFilterOpen(!isFilterOpen);
  };

  const handleOpenModal = (teacher?: Teacher) => {
    setError("");

    if (teacher) {
      // Edit Mode
      setFormData({
        name: teacher.name,
        username: teacher.username || "",
        password: "",
        profilePictureFileId: teacher.profilePictureFileId,
      });
      setProfilePicturePreview(
        teacher.profilePicture?.publicUrl ||
          "/dummy/teacher-dummy-profile-picture.png",
      );
      setEditingTeacherId(teacher.id);
    } else {
      // Create Mode
      setFormData({
        name: "",
        username: "",
        password: "",
        profilePictureFileId: undefined,
      });
      setProfilePicturePreview("/dummy/teacher-dummy-profile-picture.png");
      setEditingTeacherId(null);
    }
    setProfilePictureFile(null);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError("");
    setFormData({
      name: "",
      username: "",
      password: "",
      profilePictureFileId: undefined,
    });
    setProfilePictureFile(null);
    setProfilePicturePreview("/dummy/teacher-dummy-profile-picture.png");
    setEditingTeacherId(null);
    setFormErrors({});
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicturePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      if (editingTeacherId) {
        // Update Mode
        const updateData: UpdateTeacherDto = {
          teacherId: editingTeacherId,
          name: formData.name.trim(),
          username: formData.username.trim(),
          ...(formData.password && { password: formData.password }),
          ...(profilePictureFile && { profilePicture: profilePictureFile }),
        };

        await teacherService.updateTeacher(updateData);
        toastService.success("Teacher updated successfully!");
        handleCloseModal();
        await loadTeachers();
      } else {
        // Create Mode
        const createData: CreateTeacherDto = {
          name: formData.name.trim(),
          username: formData.username.trim(),
          password: formData.password,
          ...(profilePictureFile && { profilePicture: profilePictureFile }),
        };

        await teacherService.createTeacher(createData);
        toastService.success("Teacher created successfully!");
        handleCloseModal();
        await loadTeachers();
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save teacher";
      toastService.error(errorMessage);
      console.error("Error saving teacher:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (teacher: Teacher) => {
    try {
      const newStatus = !teacher.isActive;

      if (newStatus) {
        // Reactivate
        await teacherService.activateTeacher(teacher.id);
        toastService.success("Teacher reactivated!");
      } else {
        // Deactivate (Soft Delete)
        await teacherService.deactivateTeacher(teacher.id);
        toastService.success("Teacher deactivated!");
      }

      // Refresh teacher list from backend
      await loadTeachers();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update teacher status";
      toastService.error(errorMessage);
      console.error("Error toggling teacher status:", err);
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleDeleteRequest = (teacherId: number) => {
    setPendingDeleteTeacherId(teacherId);
  };

  const handleDelete = async () => {
    if (!pendingDeleteTeacherId) {
      return;
    }

    try {
      await teacherService.deleteTeacher(pendingDeleteTeacherId);
      toastService.success("Teacher removed!");
      // Refresh teacher list from backend
      await loadTeachers();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete teacher";
      toastService.error(errorMessage);
      console.error("Error deleting teacher:", err);
    } finally {
      setPendingDeleteTeacherId(null);
      setOpenMenuId(null);
    }
  };

  if (isLoading) {
    return (
      <div
        className="admin-page-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="2x"
            style={{ color: "#1e3a8a", marginBottom: "1rem" }}
          />
          <p style={{ color: "#6b7280" }}>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
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
          Teaching Staff
        </h2>
        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#1e3a8a" }}
          onClick={() => handleOpenModal()}
        >
          Add New Teacher
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
          Directory
        </h3>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            marginBottom: "1rem",
            position: "relative",
          }}
        >
          <div
            className="input-with-icon"
            style={{ margin: 0, width: "250px" }}
          >
            <span className="input-icon">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              className="auth-input"
              placeholder="Search by name or recovery email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: "38px", fontSize: "0.9rem" }}
            />
          </div>

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
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-profile">Profile</th>
                <th className="col-name">Name</th>
                <th className="col-status">Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="col-profile">
                      <img
                        src={
                          teacher.profilePicture?.publicUrl ||
                          "/dummy/teacher-dummy-profile-picture.png"
                        }
                        alt={teacher.name}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    <td className="col-name">
                      <div style={{ fontWeight: "500", color: "#111827" }}>
                        {teacher.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {teacher.username}
                      </div>
                    </td>
                    <td className="col-status">
                      <span
                        className={`status-pill ${teacher.isActive ? "status-active" : "status-inactive"}`}
                      >
                        {teacher.isActive ? "Active" : "Inactive"}
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
                          onClick={(e) => toggleMenu(teacher.id, e)}
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
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "3rem 1rem",
                      color: "#6b7280",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      size="2x"
                      style={{ marginBottom: "1rem", color: "#d1d5db" }}
                    />
                    <p>No teachers found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
              const teacher = teachers.find((t) => t.id === openMenuId);
              return teacher ? (
                <>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      handleOpenModal(teacher);
                      setOpenMenuId(null);
                    }}
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
                      handleToggleStatus(teacher);
                      setOpenMenuId(null);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPowerOff}
                      style={{ color: "#6b7280", width: "16px" }}
                    />
                    {teacher.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                  <button
                    className="dropdown-item danger"
                    onClick={() => {
                      handleDeleteRequest(teacher.id);
                      setOpenMenuId(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} style={{ width: "16px" }} />{" "}
                    Remove
                  </button>
                </>
              ) : null;
            })()}
          </div>
        )}

        {/* Footer Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
            color: "#6b7280",
            fontSize: "0.85rem",
          }}
        >
          <span>
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </span>
        </div>
      </div>

      {/* --- Modal: Add/Edit Teacher --- */}
      {isModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: "500px" }}>
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
                {editingTeacherId ? "Edit Teacher" : "Add New Teacher"}
              </h3>
              <button
                onClick={handleCloseModal}
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

            <form onSubmit={handleSave}>
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
                    src={profilePicturePreview}
                    alt="Profile preview"
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
                    onClick={handleUploadClick}
                    style={{
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faCamera} /> Upload Photo
                  </button>
                </div>
              </div>

              <div className="owner-modal-body modal-form-grid">
                {error && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "0.75rem 1rem",
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: "6px",
                      color: "#991b1b",
                      fontSize: "0.9rem",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      style={{ marginRight: "0.5rem" }}
                    />
                    {error}
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="auth-label">Full Name *</label>
                  <input
                    className="auth-input"
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    style={{
                      borderColor: formErrors.name ? "#ef4444" : undefined,
                      borderWidth: formErrors.name ? "1px" : undefined,
                    }}
                  />
                  {formErrors.name && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {formErrors.name}
                    </div>
                  )}
                </div>

                {/* Employee ID / Username */}
                <div>
                  <label className="auth-label">Employee ID (Username) *</label>
                  <input
                    className="auth-input"
                    placeholder="e.g. TEACH001"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    style={{
                      borderColor: formErrors.username ? "#ef4444" : undefined,
                      borderWidth: formErrors.username ? "1px" : undefined,
                    }}
                  />
                  {formErrors.username && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {formErrors.username}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="auth-label">
                    Password{" "}
                    {editingTeacherId && "(Leave blank to keep current)"}
                  </label>
                  <div
                    className="input-with-icon has-right"
                    style={{ margin: 0 }}
                  >
                    <input
                      type={showPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder={
                        editingTeacherId
                          ? "Leave blank to keep current"
                          : "Create password"
                      }
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editingTeacherId}
                      style={{
                        paddingLeft: "1rem",
                        borderColor: formErrors.password
                          ? "#ef4444"
                          : undefined,
                        borderWidth: formErrors.password ? "1px" : undefined,
                      }}
                    />
                    <button
                      type="button"
                      className="input-right-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>
                  {formErrors.password && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {formErrors.password}
                    </div>
                  )}
                </div>
              </div>

              <div className="owner-modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={handleCloseModal}
                  style={{ background: "white", border: "1px solid #d1d5db" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "#1e3a8a",
                    opacity: isSaving || !isFormValid() ? 0.6 : 1,
                    cursor:
                      isSaving || !isFormValid() ? "not-allowed" : "pointer",
                  }}
                  disabled={isSaving || !isFormValid()}
                >
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        style={{ marginRight: "0.5rem" }}
                      />
                      Saving...
                    </>
                  ) : editingTeacherId ? (
                    "Save Changes"
                  ) : (
                    "Add Teacher"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={pendingDeleteTeacherId !== null}
        title="Remove Teacher"
        message={
          <>
            Are you sure you want to permanently remove this teacher? This
            action cannot be undone.
          </>
        }
        confirmLabel="Remove Teacher"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteTeacherId(null)}
      />
    </div>
  );
}
