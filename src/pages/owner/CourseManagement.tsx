import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBookOpen,
  faCheck,
  faEdit,
  faEllipsisH,
  faFilter,
  faPlus,
  faPowerOff,
  faSearch,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { courseService, institutionService } from "../../services";
import { toastService } from "../../services/toast.service";
import type { Course } from "../../services/course.service";
import type { Institution } from "../../types";
import "../../styles/owner.css";

type CourseFilter = "All" | "Active" | "Inactive";

type CourseFormState = {
  code: string;
  title: string;
  description: string;
  isActive: boolean;
};

const emptyFormState: CourseFormState = {
  code: "",
  title: "",
  description: "",
  isActive: true,
};

export default function CourseManagement(): React.JSX.Element {
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<CourseFilter>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<CourseFormState>(emptyFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadCourses = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      setError("");
      const response = await courseService.getCourses({
        page: 1,
        size: 100,
        filters: {},
      });
      setCourses(response.data || []);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load courses";
      setError(errorMessage);
      console.error("Error loading courses:", err);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchInstitutionAndCourses = async () => {
      try {
        setIsLoading(true);
        setError("");

        const inst = await institutionService.getMyInstitution();
        if (!inst) {
          navigate("/create-institution", { replace: true });
          return;
        }

        setInstitution(inst);
        await loadCourses(true);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load course management data";
        setError(errorMessage);
        console.error("Error loading course management data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInstitutionAndCourses();
  }, [loadCourses, navigate]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const code = courseForm.code.trim();
    const title = courseForm.title.trim();
    const description = courseForm.description.trim();

    if (!code) {
      errors.code = "Course code is required";
    } else if (code.length < 2) {
      errors.code = "Course code must be at least 2 characters";
    } else if (code.length > 30) {
      errors.code = "Course code must not exceed 30 characters";
    }

    if (!title) {
      errors.title = "Course title is required";
    } else if (title.length < 2) {
      errors.title = "Course title must be at least 2 characters";
    } else if (title.length > 150) {
      errors.title = "Course title must not exceed 150 characters";
    }

    if (description.length > 1500) {
      errors.description = "Description must not exceed 1500 characters";
    }

    const duplicateCode = courses.find(
      (course) =>
        course.code.toLowerCase() === code.toLowerCase() &&
        course.id !== editingCourseId,
    );

    if (duplicateCode) {
      errors.code = "Course code already exists in your institution";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setCourseForm(emptyFormState);
    setEditingCourseId(null);
    setFormErrors({});
  };

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setCourseForm({
        code: course.code,
        title: course.title,
        description: course.description || "",
        isActive: course.isActive,
      });
      setEditingCourseId(course.id);
    } else {
      setCourseForm(emptyFormState);
      setEditingCourseId(null);
    }

    setFormErrors({});
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      if (editingCourseId) {
        await courseService.updateCourse(editingCourseId, {
          code: courseForm.code.trim(),
          title: courseForm.title.trim(),
          description: courseForm.description.trim() || undefined,
          isActive: courseForm.isActive,
        });

        setSuccessMessage("Course updated successfully!");
      } else {
        await courseService.createCourse({
          code: courseForm.code.trim(),
          title: courseForm.title.trim(),
          description: courseForm.description.trim() || undefined,
        });

        setSuccessMessage("Course created successfully!");
      }

      handleCloseModal();
      await loadCourses(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to save course";
      setError(errorMessage);
      console.error("Error saving course:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (course: Course) => {
    try {
      setError("");
      await courseService.updateCourse(course.id, {
        isActive: !course.isActive,
      });

      setSuccessMessage(
        course.isActive ? "Course deactivated!" : "Course reactivated!",
      );
      await loadCourses(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update course status";
      setError(errorMessage);
      console.error("Error updating course status:", err);
    } finally {
      setOpenMenuId(null);
    }
  };

  const toggleCourseMenu = (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFilterOpen(false);

    if (openMenuId === courseId) {
      setOpenMenuId(null);
      return;
    }

    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    const menuWidth = 170;
    const menuHeight = 92;
    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const top =
      spaceBelow >= menuHeight
        ? rect.bottom + 8
        : Math.max(8, rect.top - menuHeight - 8);

    setMenuPosition({ top, left });
    setOpenMenuId(courseId);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);

    const matchesFilter =
      filterStatus === "All" ||
      (course.isActive ? "Active" : "Inactive") === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const statusStyle = (isActive: boolean) =>
    isActive
      ? { backgroundColor: "#dcfce7", color: "#166534" }
      : { backgroundColor: "#f3f4f6", color: "#374151" };

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "4rem 0",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="2x"
              style={{ color: "#1e3a8a", marginBottom: "1rem" }}
            />
            <p style={{ color: "#6b7280" }}>Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "bold",
              color: "#111827",
              margin: 0,
            }}
          >
            Courses
          </h2>
          <p style={{ margin: "0.35rem 0 0", color: "#6b7280" }}>
            Manage curriculum for {institution?.name || "your institution"}
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#1e3a8a" }}
          onClick={() => handleOpenModal()}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "0.5rem" }} />
          Create New Course
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            padding: "0.9rem 1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            background: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
            padding: "0.9rem 1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {successMessage}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          marginBottom: "1.5rem",
          position: "relative",
          flexWrap: "wrap",
        }}
      >
        <div className="input-with-icon" style={{ margin: 0, width: "300px" }}>
          <span className="input-icon">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            className="auth-input"
            placeholder="Search courses..."
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
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(null);
              setIsFilterOpen(!isFilterOpen);
            }}
          >
            {filterStatus === "All" ? "Filter" : filterStatus}
            <FontAwesomeIcon icon={faFilter} />
          </button>

          {isFilterOpen && (
            <div
              className="filter-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              {["All", "Active", "Inactive"].map((status) => (
                <button
                  key={status}
                  className="dropdown-item"
                  onClick={() => {
                    setFilterStatus(status as CourseFilter);
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="card"
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
                borderTop: "4px solid var(--color-primary-500)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {course.title}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginTop: "0.4rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        fontWeight: 600,
                        fontFamily: "monospace",
                      }}
                    >
                      {course.code}
                    </span>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        ...statusStyle(course.isActive),
                      }}
                    >
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="action-btn-wrapper">
                  <button
                    className="btn action-btn"
                    onClick={(e) => toggleCourseMenu(course.id, e)}
                  >
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>

                  {openMenuId === course.id && (
                    <div
                      className="action-menu-dropdown"
                      style={{
                        position: "fixed",
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        zIndex: 1000,
                      }}
                    >
                      <button
                        className="dropdown-item"
                        onClick={() => handleOpenModal(course)}
                      >
                        <FontAwesomeIcon icon={faEdit} fixedWidth /> Edit Course
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() => handleToggleStatus(course)}
                      >
                        <FontAwesomeIcon icon={faPowerOff} fixedWidth />
                        {course.isActive
                          ? "Deactivate Course"
                          : "Reactivate Course"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "1rem",
                  flexGrow: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: "#4b5563",
                    textTransform: "uppercase",
                    marginBottom: "0.4rem",
                    letterSpacing: "0.06em",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <FontAwesomeIcon icon={faBookOpen} /> Description
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#4b5563",
                    lineHeight: 1.6,
                  }}
                >
                  {course.description || "No description provided."}
                </div>
              </div>

              <button
                className="btn"
                style={{
                  width: "100%",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  border: "none",
                  fontWeight: 600,
                  justifyContent: "center",
                  padding: "0.6rem 1rem",
                  borderRadius: "6px",
                }}
                onClick={() => handleOpenModal(course)}
              >
                Manage Course
              </button>
            </div>
          ))
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "3rem",
              color: "#6b7280",
              background: "white",
              borderRadius: "12px",
              border: "1px dashed #d1d5db",
            }}
          >
            <FontAwesomeIcon
              icon={faBook}
              size="3x"
              style={{ color: "#e5e7eb", marginBottom: "1rem" }}
            />
            <p>
              No courses found. Adjust your filters or click "Create New Course"
              to get started.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="owner-modal-overlay">
          <div
            className="owner-modal"
            style={{
              width: "720px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="owner-modal-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <h3 style={{ margin: 0 }}>
                {editingCourseId ? "Edit Course" : "Create New Course"}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" />
              </button>
            </div>

            <form
              onSubmit={handleSaveCourse}
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                className="owner-modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                  background: "#f9fafb",
                  overflowY: "auto",
                  padding: "1.5rem",
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
                  <label className="auth-label">Course Code *</label>
                  <input
                    className="auth-input"
                    value={courseForm.code}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, code: e.target.value })
                    }
                    placeholder="e.g. CS-101"
                    maxLength={30}
                    style={{
                      fontFamily: "monospace",
                      borderColor: formErrors.code ? "#ef4444" : undefined,
                    }}
                    required
                  />
                  {formErrors.code && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        marginTop: "0.35rem",
                      }}
                    >
                      {formErrors.code}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <label className="auth-label">Course Title *</label>
                  <input
                    className="auth-input"
                    value={courseForm.title}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, title: e.target.value })
                    }
                    placeholder="e.g. Introduction to Computer Science"
                    maxLength={150}
                    style={{
                      borderColor: formErrors.title ? "#ef4444" : undefined,
                    }}
                    required
                  />
                  {formErrors.title && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        marginTop: "0.35rem",
                      }}
                    >
                      {formErrors.title}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <label className="auth-label">Description</label>
                  <textarea
                    className="auth-input"
                    rows={5}
                    value={courseForm.description}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Provide a brief overview of the course syllabus..."
                    maxLength={1500}
                    style={{
                      resize: "vertical",
                      borderColor: formErrors.description
                        ? "#ef4444"
                        : undefined,
                    }}
                  />
                  {formErrors.description && (
                    <div
                      style={{
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        marginTop: "0.35rem",
                      }}
                    >
                      {formErrors.description}
                    </div>
                  )}
                </div>

                {editingCourseId && (
                  <div
                    style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <label className="auth-label">Status</label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          setCourseForm({
                            ...courseForm,
                            isActive: !courseForm.isActive,
                          })
                        }
                        style={{
                          background: courseForm.isActive
                            ? "#dcfce7"
                            : "#f3f4f6",
                          color: courseForm.isActive ? "#166534" : "#374151",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {courseForm.isActive ? "Active" : "Inactive"}
                      </button>
                      <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                        Toggle this if you want to deactivate or reactivate the
                        course.
                      </span>
                    </div>
                  </div>
                )}

                {!editingCourseId && (
                  <div
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      padding: "0.85rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid #bfdbfe",
                      fontSize: "0.9rem",
                    }}
                  >
                    New courses are created as active by default.
                  </div>
                )}
              </div>

              <div className="owner-modal-footer" style={{ flexShrink: 0 }}>
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
                  style={{ backgroundColor: "#1e3a8a" }}
                  disabled={isSaving}
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
                  ) : editingCourseId ? (
                    "Save Changes"
                  ) : (
                    "Create Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
