import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faEllipsisH,
  faEdit,
  faTrash,
  faTimes,
  faPlus,
  faCheck,
  faSpinner,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { parentService, studentService, Parent, Student } from "../../services";
import ConfirmActionModal from "../../components/ConfirmActionModal";
import "../../styles/owner.css";

export default function ParentManagement() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
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
  const [parentMenuPosition, setParentMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  // --- Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageStudentsOpen, setIsManageStudentsOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [pendingDeleteParentId, setPendingDeleteParentId] = useState<
    number | null
  >(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Form States
  const [form, setForm] = useState({
    id: 0,
    name: "",
    username: "",
    password: "",
    studentProfileIds: [] as number[],
    isEnabled: true,
  });

  const [manageStudentsForm, setManageStudentsForm] = useState({
    selectedStudentIds: [] as number[],
  });

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [parentsResponse, studentsResponse] = await Promise.all([
        parentService.listParents(1, 100),
        studentService.getStudents({ page: 1, size: 1000, filters: {} }),
      ]);
      setParents(parentsResponse.data || []);
      setStudents(studentsResponse.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filtered parents
  const filteredParents = parents.filter((parent) => {
    const matchesSearch =
      parent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && parent.isActive) ||
      (filterStatus === "Inactive" && !parent.isActive);
    return matchesSearch && matchesStatus;
  });

  // Handle create/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      if (modalMode === "create") {
        await parentService.createParent({
          name: form.name,
          username: form.username,
          password: form.password,
          studentProfileIds: form.studentProfileIds,
          isEnabled: form.isEnabled,
        });
        setSuccessMessage("Parent created successfully");
      } else {
        await parentService.updateParent(form.id, {
          name: form.name,
          isEnabled: form.isEnabled,
        });
        setSuccessMessage("Parent updated successfully");
      }

      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      const rawMessage = err?.response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : typeof rawMessage === "string"
          ? rawMessage
          : err?.message || "Failed to save parent";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const requestDeleteParent = (parentId: number) => {
    setPendingDeleteParentId(parentId);
  };

  const handleDelete = async () => {
    if (!pendingDeleteParentId) return;

    setIsSaving(true);
    setError("");

    try {
      await parentService.deleteParent(pendingDeleteParentId);
      setSuccessMessage("Parent deleted successfully");
      setOpenMenuId(null);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete parent");
    } finally {
      setIsSaving(false);
      setPendingDeleteParentId(null);
    }
  };

  // Handle manage students
  const handleManageStudents = async (parentId: number) => {
    setSelectedParentId(parentId);
    try {
      const linkedStudents = await parentService.getLinkedStudents(parentId);
      setManageStudentsForm({
        selectedStudentIds: linkedStudents.linkedStudents.map(
          (s) => s.studentProfileId,
        ),
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load linked students",
      );
    }
    setIsManageStudentsOpen(true);
  };

  const toggleParentMenu = (parentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openMenuId === parentId) {
      setOpenMenuId(null);
      return;
    }

    const button = e.currentTarget as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    setParentMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right + window.scrollX - 180,
    });
    setOpenMenuId(parentId);
  };

  // Handle add/remove students
  const handleManageStudentsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId) return;

    setIsSaving(true);
    setError("");

    try {
      const currentParent = parents.find((p) => p.id === selectedParentId);
      const currentLinkedIds = currentParent?.linkedStudentIds || [];

      // Find students to add and remove
      const toAdd = manageStudentsForm.selectedStudentIds.filter(
        (id) => !currentLinkedIds.includes(id),
      );
      const toRemove = currentLinkedIds.filter(
        (id) => !manageStudentsForm.selectedStudentIds.includes(id),
      );

      // Execute operations
      if (toAdd.length > 0) {
        await parentService.addStudents(selectedParentId, {
          studentProfileIds: toAdd,
        });
      }

      if (toRemove.length > 0) {
        await parentService.removeStudents(selectedParentId, {
          studentProfileIds: toRemove,
        });
      }

      setSuccessMessage("Students updated successfully");
      setIsManageStudentsOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update students");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: 0,
      name: "",
      username: "",
      password: "",
      studentProfileIds: [],
      isEnabled: true,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (parent: Parent) => {
    setForm({
      id: parent.id,
      name: parent.name,
      username: parent.username,
      password: "",
      studentProfileIds: parent.linkedStudentIds || [],
      isEnabled: parent.isActive,
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="management-page">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p>Loading parents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      {/* Header */}
      <div className="management-header">
        <h1>
          <FontAwesomeIcon icon={faUsers} /> Parent Management
        </h1>
        <button
          className="btn btn-primary"
          onClick={openCreateModal}
          disabled={isSaving}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Parent
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError("")}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage("")}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="management-filters">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          className={`filter-btn ${isFilterOpen ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsFilterOpen(!isFilterOpen);
          }}
        >
          <FontAwesomeIcon icon={faFilter} /> Filter
        </button>

        {isFilterOpen && (
          <div className="filter-dropdown">
            <div className="filter-option">
              <label>Status</label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "All" | "Active" | "Inactive",
                  )
                }
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Parents List */}
      <div className="management-table-container">
        {filteredParents.length === 0 ? (
          <div className="no-data">
            <p>No parents found</p>
          </div>
        ) : (
          <table className="management-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Status</th>
                <th>Linked Students</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.map((parent) => (
                <tr key={parent.id}>
                  <td>{parent.name}</td>
                  <td>{parent.username}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        parent.isActive ? "active" : "inactive"
                      }`}
                    >
                      {parent.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{parent.linkedStudentCount}</td>
                  <td>{new Date(parent.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btn-wrapper">
                      <button
                        className="btn action-btn"
                        style={{
                          background: "transparent",
                          padding: "0.4rem",
                          color: "#6b7280",
                        }}
                        onClick={(e) => toggleParentMenu(parent.id, e)}
                        disabled={isSaving}
                      >
                        <FontAwesomeIcon icon={faEllipsisH} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {openMenuId !== null && (
        <div
          className="action-menu-dropdown"
          style={{
            position: "fixed",
            top: `${parentMenuPosition.top}px`,
            left: `${parentMenuPosition.left}px`,
            zIndex: 1000,
            width: "180px",
          }}
        >
          {(() => {
            const selectedParent = parents.find((p) => p.id === openMenuId);
            if (!selectedParent) return null;
            return (
              <>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleManageStudents(selectedParent.id);
                    setOpenMenuId(null);
                  }}
                  disabled={isSaving}
                >
                  <FontAwesomeIcon icon={faUsers} fixedWidth /> Manage Students
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    openEditModal(selectedParent);
                    setOpenMenuId(null);
                  }}
                  disabled={isSaving}
                >
                  <FontAwesomeIcon icon={faEdit} fixedWidth /> Edit Parent
                </button>
                <button
                  className="dropdown-item danger"
                  onClick={() => {
                    requestDeleteParent(selectedParent.id);
                    setOpenMenuId(null);
                  }}
                  disabled={isSaving}
                >
                  <FontAwesomeIcon icon={faTrash} fixedWidth /> Delete Parent
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => !isSaving && setIsModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === "create" ? "Add Parent" : "Edit Parent"}</h2>
              <button
                className="close-btn"
                onClick={() => !isSaving && setIsModalOpen(false)}
                disabled={isSaving}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Parent name"
                  disabled={isSaving}
                />
              </div>

              {modalMode === "create" && (
                <>
                  <div className="form-group">
                    <label htmlFor="username">Username *</label>
                    <input
                      id="username"
                      type="text"
                      required
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                      placeholder="Unique username"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="Minimum 6 characters"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="students">Link Students *</label>
                    <div className="multi-select">
                      {students.length === 0 ? (
                        <p className="text-muted">No students available</p>
                      ) : (
                        students.map((student) => (
                          <label
                            key={student.studentProfileId}
                            className="checkbox-label"
                          >
                            <input
                              type="checkbox"
                              checked={form.studentProfileIds.includes(
                                student.studentProfileId,
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setForm({
                                    ...form,
                                    studentProfileIds: [
                                      ...form.studentProfileIds,
                                      student.studentProfileId,
                                    ],
                                  });
                                } else {
                                  setForm({
                                    ...form,
                                    studentProfileIds:
                                      form.studentProfileIds.filter(
                                        (id) => id !== student.studentProfileId,
                                      ),
                                  });
                                }
                              }}
                              disabled={isSaving}
                            />
                            {student.name} ({student.username})
                          </label>
                        ))
                      )}
                    </div>
                    {form.studentProfileIds.length === 0 && (
                      <p className="text-error">
                        At least one student is required
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="isEnabled" className="checkbox-label">
                  <input
                    id="isEnabled"
                    type="checkbox"
                    checked={form.isEnabled}
                    onChange={(e) =>
                      setForm({ ...form, isEnabled: e.target.checked })
                    }
                    disabled={isSaving}
                  />
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => !isSaving && setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    isSaving ||
                    !form.name ||
                    (modalMode === "create" &&
                      (!form.username ||
                        !form.password ||
                        form.studentProfileIds.length === 0))
                  }
                >
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} /> Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Students Modal */}
      {isManageStudentsOpen && (
        <div
          className="modal-overlay"
          onClick={() => !isSaving && setIsManageStudentsOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Linked Students</h2>
              <button
                className="close-btn"
                onClick={() => !isSaving && setIsManageStudentsOpen(false)}
                disabled={isSaving}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleManageStudentsSubmit} className="modal-form">
              <div className="form-group">
                <label>Select Students</label>
                <div className="multi-select">
                  {students.length === 0 ? (
                    <p className="text-muted">No students available</p>
                  ) : (
                    students.map((student) => (
                      <label
                        key={student.studentProfileId}
                        className="checkbox-label"
                      >
                        <input
                          type="checkbox"
                          checked={manageStudentsForm.selectedStudentIds.includes(
                            student.studentProfileId,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setManageStudentsForm({
                                ...manageStudentsForm,
                                selectedStudentIds: [
                                  ...manageStudentsForm.selectedStudentIds,
                                  student.studentProfileId,
                                ],
                              });
                            } else {
                              setManageStudentsForm({
                                ...manageStudentsForm,
                                selectedStudentIds:
                                  manageStudentsForm.selectedStudentIds.filter(
                                    (id) => id !== student.studentProfileId,
                                  ),
                              });
                            }
                          }}
                          disabled={isSaving}
                        />
                        {student.name} ({student.username})
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => !isSaving && setIsManageStudentsOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Updating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={pendingDeleteParentId !== null}
        title="Delete Parent"
        message={
          <>
            Are you sure you want to delete this parent? This action cannot be
            undone.
          </>
        }
        confirmLabel="Delete Parent"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteParentId(null)}
        isProcessing={isSaving}
      />
    </div>
  );
}
