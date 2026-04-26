import React, { useState, useRef, useEffect } from "react";
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
  faUserGraduate,
  faUsers,
  faPlus,
  faAddressBook,
  faLayerGroup,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  studentService,
  studentGroupService,
  authService,
  Student as ApiStudent,
  StudentGroup as ApiStudentGroup,
} from "../../services";
import { OtpType } from "../../types";
import "../../styles/owner.css";

export default function StudentManagement() {
  const [activeTab, setActiveTab] = useState<"students" | "groups">("students");
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [groups, setGroups] = useState<ApiStudentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [studentMenuPosition, setStudentMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  // --- Modal States ---
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>(
    "/dummy/teacher-dummy-profile-picture.png",
  );
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  // Form States
  const [studentForm, setStudentForm] = useState({
    id: 0,
    studentProfileId: 0,
    rollNo: "",
    name: "",
    recoveryEmail: "",
    otp: "",
    grade: "",
    password: "",
  });

  const [groupForm, setGroupForm] = useState({
    id: 0,
    name: "",
    studentProfileIds: [] as number[],
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [studentsResponse, groupsResponse] = await Promise.all([
        studentService.getStudents({ page: 1, size: 100, filters: {} }),
        studentGroupService.getStudentGroups({
          page: 1,
          size: 100,
          filters: {},
        }),
      ]);
      setStudents(studentsResponse.data || []);
      setGroups(groupsResponse.data || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to load data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "All" ||
      (filterStatus === "Active" && student.isActive) ||
      (filterStatus === "Inactive" && !student.isActive);
    return matchesSearch && matchesFilter;
  });

  // Get group name for a student
  const getStudentGroup = (studentId: number) => {
    const group = groups.find((g) => g.studentIds.includes(studentId));
    return group ? group.name : "Unassigned";
  };

  const toggleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleStudentMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
      return;
    }

    const button = e.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    setStudentMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right + window.scrollX - 140,
    });
    setOpenMenuId(id);
  };

  // --- Handlers: Students ---
  const handleOpenStudentModal = (student?: ApiStudent) => {
    if (student) {
      setStudentForm({
        id: student.id,
        studentProfileId: student.studentProfileId,
        rollNo: student.rollNo,
        name: student.name,
        recoveryEmail: student.recoveryEmail || "",
        otp: "",
        grade: student.grade,
        password: "",
      });
      setProfilePhotoPreview(
        student.profilePicture?.publicUrl ||
          "/dummy/teacher-dummy-profile-picture.png",
      );
    } else {
      setStudentForm({
        id: 0,
        studentProfileId: 0,
        rollNo: "",
        name: "",
        recoveryEmail: "",
        otp: "",
        grade: "",
        password: "",
      });
      setProfilePhotoPreview("/dummy/teacher-dummy-profile-picture.png");
    }
    setProfilePhotoFile(null);
    setIsStudentModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const rollNo = studentForm.rollNo.trim();

    if (
      studentForm.id === 0 &&
      studentForm.recoveryEmail.trim() &&
      studentForm.otp.trim().length < 6
    ) {
      setError("OTP is required when email is provided");
      return;
    }

    try {
      setIsSaving(true);
      if (studentForm.id !== 0) {
        await studentService.updateStudent({
          studentId: studentForm.id,
          name: studentForm.name,
          rollNo,
          grade: studentForm.grade,
          recoveryEmail: studentForm.recoveryEmail || undefined,
          ...(studentForm.password && { password: studentForm.password }),
          ...(profilePhotoFile && { profilePicture: profilePhotoFile }),
        });
        setSuccessMessage("Student updated successfully!");
      } else {
        await studentService.createStudent({
          name: studentForm.name,
          rollNo,
          grade: studentForm.grade,
          password: studentForm.password,
          recoveryEmail: studentForm.recoveryEmail || undefined,
          otp: studentForm.otp || undefined,
          ...(profilePhotoFile && { profilePicture: profilePhotoFile }),
        });
        setSuccessMessage("Student created successfully!");
      }
      await loadData();
      setIsStudentModalOpen(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save student",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOtp = async () => {
    const email = studentForm.recoveryEmail.trim();
    if (!email) {
      setError("Please enter an email address first");
      return;
    }

    setIsSendingOtp(true);
    setError("");
    setSuccessMessage("");

    try {
      await authService.sendOtp({ email, type: OtpType.EMAIL_VERIFICATION });
      setSuccessMessage(`OTP sent successfully to ${email}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to send OTP",
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("Remove this student?")) return;
    try {
      setError("");
      await studentService.deleteStudent(id);
      setSuccessMessage("Student removed successfully!");
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to remove student",
      );
    }
    setOpenMenuId(null);
  };

  const toggleStudentStatus = async (student: ApiStudent) => {
    try {
      setError("");
      await studentService.updateStudent({
        studentId: student.id,
        isActive: !student.isActive,
      });
      setSuccessMessage(
        `Student ${student.isActive ? "deactivated" : "activated"} successfully!`,
      );
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update student status",
      );
    }
    setOpenMenuId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    setProfilePhotoFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target?.result as string;
      setProfilePhotoPreview(previewUrl);
    };
    reader.readAsDataURL(file);
  };

  // --- Handlers: Groups ---
  const handleOpenGroupModal = (group?: ApiStudentGroup) => {
    if (group) {
      setGroupForm({
        id: group.id,
        name: group.name,
        studentProfileIds: group.studentProfileIds || [],
      });
    } else {
      setGroupForm({ id: 0, name: "", studentProfileIds: [] });
    }
    setIsGroupModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setIsSaving(true);
      if (groupForm.id !== 0) {
        await studentGroupService.updateStudentGroup({
          groupId: groupForm.id,
          name: groupForm.name,
          studentProfileIds: groupForm.studentProfileIds,
        });
        setSuccessMessage("Group updated successfully!");
      } else {
        await studentGroupService.createStudentGroup({
          name: groupForm.name,
          studentProfileIds: groupForm.studentProfileIds,
        });
        setSuccessMessage("Group created successfully!");
      }
      await loadData();
      setIsGroupModalOpen(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to save group",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (
      !window.confirm(
        "Delete this group? Students will remain in the directory.",
      )
    ) {
      return;
    }
    try {
      setError("");
      await studentGroupService.deleteStudentGroup(id);
      setSuccessMessage("Group deleted successfully!");
      await loadData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete group",
      );
    }
    setOpenMenuId(null);
  };

  const toggleGroupStudent = (studentProfileId: number) => {
    setGroupForm((prev) => ({
      ...prev,
      studentProfileIds: prev.studentProfileIds.includes(studentProfileId)
        ? prev.studentProfileIds.filter((id) => id !== studentProfileId)
        : [...prev.studentProfileIds, studentProfileId],
    }));
  };

  return (
    <div className="admin-page-container">
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

      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            marginBottom: "1rem",
            color: "#6b7280",
            gap: "0.5rem",
          }}
        >
          <FontAwesomeIcon icon={faSpinner} spin />
          Loading students and groups...
        </div>
      )}

      {/* --- Page Header & Action Buttons --- */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              color: "#111827",
              margin: 0,
            }}
          >
            Student Management
          </h2>

          {/* Contextual Top-Right Action Button */}
          {activeTab === "students" ? (
            <button
              className="btn btn-primary"
              style={{ backgroundColor: "#1e3a8a" }}
              onClick={() => handleOpenStudentModal()}
            >
              <FontAwesomeIcon icon={faPlus} /> Register Student
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ backgroundColor: "#1e3a8a" }}
              onClick={() => handleOpenGroupModal()}
            >
              <FontAwesomeIcon icon={faPlus} /> Create New Group
            </button>
          )}
        </div>

        {/* Professional Tabs */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <button
            style={{
              padding: "0.75rem 0",
              border: "none",
              background: "none",
              borderBottom:
                activeTab === "students"
                  ? "2px solid var(--color-primary-500)"
                  : "2px solid transparent",
              color:
                activeTab === "students"
                  ? "var(--color-primary-500)"
                  : "#6b7280",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              marginBottom: "-2px",
              transition: "all 0.2s",
            }}
            onClick={() => setActiveTab("students")}
          >
            <FontAwesomeIcon icon={faAddressBook} /> Student Directory
          </button>
          <button
            style={{
              padding: "0.75rem 0",
              border: "none",
              background: "none",
              borderBottom:
                activeTab === "groups"
                  ? "2px solid var(--color-primary-500)"
                  : "2px solid transparent",
              color:
                activeTab === "groups" ? "var(--color-primary-500)" : "#6b7280",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              marginBottom: "-2px",
              transition: "all 0.2s",
            }}
            onClick={() => setActiveTab("groups")}
          >
            <FontAwesomeIcon icon={faLayerGroup} /> Groups
          </button>
        </div>
      </div>

      {/* --- TAB: STUDENTS --- */}
      {activeTab === "students" && (
        <div
          className="card"
          style={{ padding: "1.5rem", minHeight: "400px", border: "none" }}
        >
          {/* Search & Filter Bar (Right Aligned) */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "1rem",
              marginBottom: "1.5rem",
              position: "relative",
            }}
          >
            <div
              className="input-with-icon"
              style={{ margin: 0, width: "300px" }}
            >
              <span className="input-icon">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                className="auth-input"
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: "38px", fontSize: "0.9rem" }}
              />
            </div>

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

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="col-profile">Profile</th>
                  <th className="col-name">Student Info</th>
                  <th>Grade & Group</th>
                  <th>Contact Info</th>
                  <th className="col-status">Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="col-profile">
                        <img
                          src={
                            student.profilePicture?.publicUrl ||
                            "/dummy/teacher-dummy-profile-picture.png"
                          }
                          alt="Profile"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td className="col-name">
                        <div style={{ fontWeight: "600", color: "#111827" }}>
                          {student.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            fontFamily: "monospace",
                          }}
                        >
                          {student.rollNo}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            color: "#374151",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                          }}
                        >
                          {student.grade}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#8b5cf6",
                            fontWeight: "bold",
                          }}
                        >
                          {getStudentGroup(student.id)}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: "#4b5563", fontSize: "0.85rem" }}>
                          {student.recoveryEmail || "-"}
                        </div>
                        {student.recoveryEmail && (
                          <div
                            style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                          >
                            Recovery Email
                          </div>
                        )}
                      </td>
                      <td className="col-status">
                        <span
                          className={`status-pill ${student.isActive ? "status-active" : "status-inactive"}`}
                        >
                          {student.isActive ? "Active" : "Inactive"}
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
                            onClick={(e) => toggleStudentMenu(student.id, e)}
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
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "3rem 1rem",
                        color: "#6b7280",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUserGraduate}
                        size="2x"
                        style={{ marginBottom: "1rem", color: "#d1d5db" }}
                      />
                      <p>No students found in the directory.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {openMenuId !== null && (
            <div
              className="action-menu-dropdown"
              style={{
                position: "fixed",
                top: `${studentMenuPosition.top}px`,
                left: `${studentMenuPosition.left}px`,
                zIndex: 1000,
              }}
            >
              {(() => {
                const selectedStudent = students.find(
                  (s) => s.id === openMenuId,
                );
                if (!selectedStudent) return null;
                return (
                  <>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        handleOpenStudentModal(selectedStudent);
                        setOpenMenuId(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} fixedWidth /> Edit Details
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        toggleStudentStatus(selectedStudent);
                        setOpenMenuId(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faPowerOff} fixedWidth />{" "}
                      {selectedStudent.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="dropdown-item danger"
                      onClick={() => {
                        handleDeleteStudent(selectedStudent.id);
                        setOpenMenuId(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} fixedWidth /> Remove
                    </button>
                  </>
                );
              })()}
            </div>
          )}

          {/* Pagination Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.5rem",
              color: "#6b7280",
              fontSize: "0.85rem",
            }}
          >
            <span>
              Showing {filteredStudents.length} of {students.length} students
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn"
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.85rem",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  cursor: "not-allowed",
                  color: "#9ca3af",
                }}
                disabled
              >
                Previous
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
              >
                1
              </button>
              <button
                className="btn"
                style={{
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.85rem",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  cursor: "not-allowed",
                  color: "#9ca3af",
                }}
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: GROUPS --- */}
      {activeTab === "groups" && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {groups.map((group) => (
              <div
                key={group.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  borderTop: "4px solid var(--color-primary-500)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Group Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      {group.name}
                    </h3>
                    <p
                      style={{
                        margin: "0.35rem 0 0 0",
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        fontWeight: "500",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUsers}
                        style={{ marginRight: "0.25rem" }}
                      />{" "}
                      {group.studentIds?.length || 0} Students Enrolled
                    </p>
                  </div>
                  <div className="action-btn-wrapper">
                    <button
                      className="btn action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === group.id ? null : group.id,
                        );
                      }}
                    >
                      <FontAwesomeIcon icon={faEllipsisH} />
                    </button>
                    {openMenuId === group.id && (
                      <div className="action-menu-dropdown">
                        <button
                          className="dropdown-item"
                          onClick={() => handleOpenGroupModal(group)}
                        >
                          <FontAwesomeIcon icon={faEdit} fixedWidth /> Edit
                          Group
                        </button>
                        <button
                          className="dropdown-item danger"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} fixedWidth /> Delete
                          Group
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spacer to push button down if needed */}
                <div style={{ flexGrow: 1 }}></div>

                {/* Manage Button */}
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    background: "#e0e7ff",
                    color: "#4338ca",
                    border: "none",
                    fontWeight: "600",
                    justifyContent: "center",
                    padding: "0.6rem 1rem",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#c7d2fe")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#e0e7ff")
                  }
                  onClick={() => handleOpenGroupModal(group)}
                >
                  Manage Group
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL: STUDENT REGISTRATION --- */}
      {isStudentModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: "650px" }}>
            <div
              className="owner-modal-header"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <h3 style={{ margin: 0 }}>
                {studentForm.id === 0
                  ? "Register Student"
                  : "Edit Student Details"}
              </h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" />
              </button>
            </div>
            <form onSubmit={handleSaveStudent}>
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
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #e5e7eb",
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
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem",
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                    }}
                  >
                    <FontAwesomeIcon icon={faCamera} /> Upload Photo
                  </button>
                </div>
              </div>

              <div className="owner-modal-body modal-form-grid">
                <div className="password-row">
                  <div>
                    <label className="auth-label">Full Name</label>
                    <input
                      className="auth-input"
                      required
                      value={studentForm.name}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, name: e.target.value })
                      }
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="auth-label">Roll Number</label>
                    <input
                      className="auth-input"
                      required
                      value={studentForm.rollNo}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          rollNo: e.target.value,
                        })
                      }
                      placeholder="e.g. STD-001"
                    />
                  </div>
                </div>

                <div className="password-row">
                  <div>
                    <label className="auth-label">Primary Email</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="email"
                        className="auth-input"
                        value={studentForm.recoveryEmail}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            recoveryEmail: e.target.value,
                          })
                        }
                        placeholder="parent@gmail.com"
                      />
                      {studentForm.id === 0 && (
                        <button
                          type="button"
                          className="btn"
                          onClick={handleSendOtp}
                          disabled={
                            isSendingOtp ||
                            !studentForm.recoveryEmail.trim() ||
                            isSaving
                          }
                          style={{
                            background: "#fff",
                            border: "1px solid #d1d5db",
                            whiteSpace: "nowrap",
                            height: "40px",
                          }}
                        >
                          {isSendingOtp ? "Sending..." : "Send OTP"}
                        </button>
                      )}
                    </div>
                  </div>
                  {studentForm.id === 0 && studentForm.recoveryEmail.trim() && (
                    <div>
                      <label className="auth-label">Email OTP *</label>
                      <input
                        className="auth-input"
                        value={studentForm.otp}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            otp: e.target.value,
                          })
                        }
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="password-row">
                  <div>
                    <label className="auth-label">Grade / Class Level</label>
                    <input
                      className="auth-input"
                      required
                      value={studentForm.grade}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          grade: e.target.value,
                        })
                      }
                      placeholder="e.g. 10th Grade"
                    />
                  </div>
                  <div>
                    <label className="auth-label">
                      Temporary Password {studentForm.id !== 0 && "(Optional)"}
                    </label>
                    <div
                      className="input-with-icon has-right"
                      style={{ margin: 0 }}
                    >
                      <input
                        type={showPassword ? "text" : "password"}
                        className="auth-input"
                        required={studentForm.id === 0}
                        value={studentForm.password}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        style={{ paddingLeft: "1rem" }}
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
                  </div>
                </div>
              </div>
              <div className="owner-modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsStudentModalOpen(false)}
                  style={{ background: "white", border: "1px solid #d1d5db" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ backgroundColor: "#1e3a8a" }}
                >
                  {isSaving
                    ? "Saving..."
                    : studentForm.id === 0
                      ? "Register Student"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: GROUP MANAGEMENT --- */}
      {isGroupModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: "550px" }}>
            <div
              className="owner-modal-header"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <h3 style={{ margin: 0 }}>
                {groupForm.id === 0 ? "Create Student Group" : "Manage Group"}
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup}>
              <div
                className="owner-modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  background: "#f9fafb",
                }}
              >
                <div
                  style={{
                    background: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <label className="auth-label">Group Name</label>
                  <input
                    className="auth-input"
                    required
                    value={groupForm.name}
                    onChange={(e) =>
                      setGroupForm({ ...groupForm, name: e.target.value })
                    }
                    placeholder="e.g. Science Batch A"
                  />
                </div>

                {/* Add/Remove Students from Group */}
                <div
                  style={{
                    background: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <label
                    className="auth-label"
                    style={{ display: "block", marginBottom: "0.5rem" }}
                  >
                    Select Students for Group (
                    {groupForm.studentProfileIds.length} Selected)
                  </label>
                  <div
                    style={{
                      maxHeight: "250px",
                      overflowY: "auto",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  >
                    {students.map((student) => (
                      <label
                        key={student.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.6rem 1rem",
                          borderBottom: "1px solid #f3f4f6",
                          cursor: "pointer",
                          margin: 0,
                          transition: "background 0.2s",
                        }}
                        className="hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={groupForm.studentProfileIds.includes(
                            student.studentProfileId,
                          )}
                          onChange={() =>
                            toggleGroupStudent(student.studentProfileId)
                          }
                        />
                        <img
                          src={
                            student.profilePicture?.publicUrl ||
                            "/dummy/teacher-dummy-profile-picture.png"
                          }
                          alt="Pfp"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              color: "#111827",
                            }}
                          >
                            {student.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              fontFamily: "monospace",
                            }}
                          >
                            {student.rollNo}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="owner-modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsGroupModalOpen(false)}
                  style={{ background: "white", border: "1px solid #d1d5db" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ backgroundColor: "#1e3a8a" }}
                >
                  {isSaving
                    ? "Saving..."
                    : groupForm.id === 0
                      ? "Create Group"
                      : "Save Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
