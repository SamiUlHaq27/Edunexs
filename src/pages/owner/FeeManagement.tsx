import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faPlus,
  faFileInvoiceDollar,
  faCheckCircle,
  faClock,
  faExclamationCircle,
  faTimes,
  faEllipsisV,
  faTrash,
  faEdit,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  feeService,
  institutionService,
  studentGroupService,
  studentService,
} from "../../services";
import type { FeeInvoice, FeeStatus } from "../../services/fee.service";
import type { Student } from "../../services/student.service";
import type { StudentGroup } from "../../services/student-group.service";
import ConfirmActionModal from "../../components/ConfirmActionModal";
import { toastService } from "../../services/toast.service";
import "../../styles/owner.css";

type StatusFilter = "All" | "Paid" | "Pending" | "Overdue";

type FeeFormState = {
  feeId?: number;
  title: string;
  amount: number | "";
  dueDate: string;
  status: FeeStatus;
  paidAt: string;
  studentProfileIds: number[];
  studentGroupIds: number[];
  studentProfileId: number | "";
};

const emptyFeeForm: FeeFormState = {
  title: "",
  amount: "",
  dueDate: "",
  status: "PENDING",
  paidAt: "",
  studentProfileIds: [],
  studentGroupIds: [],
  studentProfileId: "",
};

const statusToLabel = (status: FeeStatus): "Paid" | "Pending" | "Overdue" => {
  if (status === "PAID") return "Paid";
  if (status === "OVERDUE") return "Overdue";
  return "Pending";
};

const labelToStatus = (status: StatusFilter): FeeStatus | undefined => {
  if (status === "All") return undefined;
  if (status === "Paid") return "PAID";
  if (status === "Overdue") return "OVERDUE";
  return "PENDING";
};

export default function FeeManagement(): React.JSX.Element {
  const navigate = useNavigate();

  const [fees, setFees] = useState<FeeInvoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingDeleteFeeId, setPendingDeleteFeeId] = useState<number | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState<FeeFormState>(emptyFeeForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isEditing = feeForm.feeId !== undefined;

  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      setError("");

      const [feeResponse, studentResponse, groupResponse] = await Promise.all([
        feeService.getFees({
          page: 1,
          size: 200,
          filters: {
            search: searchQuery.trim() || undefined,
            status: labelToStatus(filterStatus),
          },
        }),
        studentService.getStudents({ page: 1, size: 200, filters: {} }),
        studentGroupService.getStudentGroups({
          page: 1,
          size: 200,
          filters: {},
        }),
      ]);

      setFees(feeResponse.data || []);
      setStudents(studentResponse.data || []);
      setStudentGroups(groupResponse.data || []);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load fee data";
      setError(message);
      console.error("Error loading fee data:", err);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const institution = await institutionService.getMyInstitution();
        if (!institution) {
          navigate("/create-institution", { replace: true });
          return;
        }
        await loadData(true);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData(true);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, filterStatus]);

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

  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const label = statusToLabel(fee.status);
      const matchesFilter = filterStatus === "All" || label === filterStatus;
      if (!matchesFilter) return false;

      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return (
        (fee.studentName || "").toLowerCase().includes(query) ||
        (fee.rollNo || "").toLowerCase().includes(query) ||
        fee.invoiceNo.toLowerCase().includes(query) ||
        fee.title.toLowerCase().includes(query)
      );
    });
  }, [fees, filterStatus, searchQuery]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!feeForm.title.trim()) {
      errors.title = "Fee title is required";
    }

    if (feeForm.amount === "" || Number(feeForm.amount) < 200) {
      errors.amount = "Amount must be at least Rs. 200";
    }

    if (!feeForm.dueDate) {
      errors.dueDate = "Due date is required";
    }

    if (
      !isEditing &&
      feeForm.studentProfileIds.length === 0 &&
      feeForm.studentGroupIds.length === 0
    ) {
      errors.recipients = "Select at least one student or one student group";
    }

    if (isEditing && feeForm.studentProfileId === "") {
      errors.studentProfileId = "Student is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getStatusBadge = (status: FeeStatus) => {
    if (status === "PAID") {
      return (
        <span
          style={{
            background: "#d1fae5",
            color: "#065f46",
            padding: "0.25rem 0.6rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <FontAwesomeIcon icon={faCheckCircle} /> Paid
        </span>
      );
    }

    if (status === "OVERDUE") {
      return (
        <span
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "0.25rem 0.6rem",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <FontAwesomeIcon icon={faExclamationCircle} /> Overdue
        </span>
      );
    }

    return (
      <span
        style={{
          background: "#fef3c7",
          color: "#92400e",
          padding: "0.25rem 0.6rem",
          borderRadius: "999px",
          fontSize: "0.75rem",
          fontWeight: "700",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <FontAwesomeIcon icon={faClock} /> Pending
      </span>
    );
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
  };

  const handleOpenModal = (fee?: FeeInvoice) => {
    if (fee) {
      setFeeForm({
        feeId: fee.id,
        title: fee.title,
        amount: fee.amount,
        dueDate: fee.dueDate,
        status: fee.status,
        paidAt: fee.paidAt
          ? new Date(fee.paidAt).toISOString().slice(0, 10)
          : "",
        studentProfileIds: [],
        studentGroupIds: [],
        studentProfileId: fee.studentProfileId,
      });
    } else {
      setFeeForm(emptyFeeForm);
    }

    setFormErrors({});
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const toggleFeeMenu = (
    feeId: number,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    setIsFilterOpen(false);

    if (openMenuId === feeId) {
      setOpenMenuId(null);
      return;
    }

    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    const menuWidth = 170;
    const menuHeight = 126;
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
    setOpenMenuId(feeId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFeeForm(emptyFeeForm);
    setFormErrors({});
  };

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      if (isEditing && feeForm.feeId) {
        await feeService.updateFee({
          feeId: feeForm.feeId,
          title: feeForm.title.trim(),
          amount: Number(feeForm.amount),
          dueDate: feeForm.dueDate,
          status: feeForm.status,
          paidAt: feeForm.paidAt || undefined,
          studentProfileId: Number(feeForm.studentProfileId),
        });
        setSuccessMessage("Invoice updated successfully!");
      } else {
        const created = await feeService.createFee({
          title: feeForm.title.trim(),
          amount: Number(feeForm.amount),
          dueDate: feeForm.dueDate,
          status: feeForm.status,
          paidAt: feeForm.paidAt || undefined,
          studentProfileIds: feeForm.studentProfileIds,
          studentGroupIds: feeForm.studentGroupIds,
        });

        setSuccessMessage(
          `Invoice generation complete: ${created.createdCount} invoice(s) created.`,
        );
      }

      handleCloseModal();
      await loadData(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save invoice";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const requestDeleteFee = (feeId: number) => {
    setPendingDeleteFeeId(feeId);
  };

  const handleDeleteFee = async () => {
    if (!pendingDeleteFeeId) {
      return;
    }

    try {
      setError("");
      await feeService.deleteFee(pendingDeleteFeeId);
      setSuccessMessage("Invoice deleted successfully!");
      await loadData(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete invoice";
      setError(message);
    } finally {
      setPendingDeleteFeeId(null);
      setOpenMenuId(null);
    }
  };

  const toggleFeeStatus = async (fee: FeeInvoice) => {
    const nextStatus: FeeStatus =
      fee.status === "PENDING"
        ? "PAID"
        : fee.status === "PAID"
          ? "OVERDUE"
          : "PENDING";

    try {
      setError("");
      await feeService.updateFee({
        feeId: fee.id,
        status: nextStatus,
      });
      setSuccessMessage(
        `Invoice status updated to ${statusToLabel(nextStatus)}.`,
      );
      await loadData(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update invoice status";
      setError(message);
    } finally {
      setOpenMenuId(null);
    }
  };

  const toggleStudentSelection = (studentProfileId: number) => {
    setFeeForm((prev) => ({
      ...prev,
      studentProfileIds: prev.studentProfileIds.includes(studentProfileId)
        ? prev.studentProfileIds.filter((id) => id !== studentProfileId)
        : [...prev.studentProfileIds, studentProfileId],
    }));
  };

  const toggleGroupSelection = (groupId: number) => {
    setFeeForm((prev) => ({
      ...prev,
      studentGroupIds: prev.studentGroupIds.includes(groupId)
        ? prev.studentGroupIds.filter((id) => id !== groupId)
        : [...prev.studentGroupIds, groupId],
    }));
  };

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
              style={{ color: "#10b981", marginBottom: "1rem" }}
            />
            <p style={{ color: "#6b7280" }}>Loading invoices...</p>
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
          marginBottom: "2.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "800",
              color: "#111827",
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            Fee & Invoice Management
          </h2>
          <p
            style={{
              margin: "0.4rem 0 0 0",
              color: "#6b7280",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            Generate student invoices, track payments, and monitor overdue
            accounts.
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{
            backgroundColor: "#10b981",
            height: "46px",
            padding: "0 1.5rem",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: "600",
            boxShadow:
              "0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2)",
          }}
          onClick={() => handleOpenModal()}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "0.5rem" }} />{" "}
          Generate Invoice
        </button>
      </div>
      onClick={() => requestDeleteFee(fee.id)}
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
        className="card"
        style={{
          padding: "1.5rem",
          minHeight: "500px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div
            className="input-with-icon"
            style={{ margin: 0, width: "350px" }}
          >
            <span className="input-icon">
              <FontAwesomeIcon icon={faSearch} color="#9ca3af" />
            </span>
            <input
              className="auth-input"
              placeholder="Search by student name, roll no, or invoice ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: "42px",
                fontSize: "0.9rem",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <button
              className="btn"
              style={{
                height: "42px",
                background: filterStatus !== "All" ? "#ecfdf5" : "#fff",
                color: filterStatus !== "All" ? "#059669" : "#4b5563",
                border:
                  filterStatus !== "All"
                    ? "1px solid #a7f3d0"
                    : "1px solid #d1d5db",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(null);
                setIsFilterOpen(!isFilterOpen);
              }}
            >
              <FontAwesomeIcon icon={faFilter} />{" "}
              {filterStatus === "All" ? "All Statuses" : filterStatus}
            </button>

            {isFilterOpen && (
              <div
                className="filter-dropdown"
                style={{
                  top: "48px",
                  right: 0,
                  width: "180px",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {["All", "Paid", "Pending", "Overdue"].map((status) => (
                  <button
                    key={status}
                    className="dropdown-item"
                    onClick={() => {
                      setFilterStatus(status as StatusFilter);
                      setIsFilterOpen(false);
                    }}
                    style={{
                      justifyContent: "space-between",
                      padding: "0.6rem 1rem",
                      background: filterStatus === status ? "#f3f4f6" : "white",
                      fontWeight: filterStatus === status ? "600" : "400",
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
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th>Invoice ID</th>
                <th>Student Details</th>
                <th>Fee Description</th>
                <th>Due / Created</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <tr key={fee.id}>
                    <td
                      style={{
                        fontWeight: "700",
                        color: "#4f46e5",
                        fontFamily: "monospace",
                        fontSize: "0.9rem",
                      }}
                    >
                      {fee.invoiceNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#111827" }}>
                        {fee.studentName || "-"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          fontFamily: "monospace",
                        }}
                      >
                        {fee.rollNo || "-"}
                      </div>
                    </td>
                    <td style={{ color: "#4b5563", fontSize: "0.9rem" }}>
                      {fee.title}
                    </td>
                    <td
                      style={{
                        color: "#4b5563",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                      }}
                    >
                      <div>Due: {formatDate(fee.dueDate)}</div>
                      <div style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                        Created: {formatDate(fee.createdAt)}
                      </div>
                    </td>
                    <td
                      style={{
                        fontWeight: "700",
                        color: "#111827",
                        fontSize: "1rem",
                      }}
                    >
                      Rs. {fee.amount.toLocaleString()}
                    </td>
                    <td>
                      {getStatusBadge(fee.status)}
                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "0.72rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        Paid At: {formatDate(fee.paidAt)}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div
                        className="action-btn-wrapper"
                        style={{ display: "inline-block" }}
                      >
                        <button
                          className="btn action-btn"
                          onClick={(e) => toggleFeeMenu(fee.id, e)}
                          style={{ padding: "0.4rem", color: "#9ca3af" }}
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        {openMenuId === fee.id && (
                          <div
                            className="action-menu-dropdown"
                            style={{
                              position: "fixed",
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                              zIndex: 1000,
                              minWidth: "170px",
                            }}
                          >
                            <button
                              className="dropdown-item"
                              onClick={() => handleOpenModal(fee)}
                            >
                              <FontAwesomeIcon
                                icon={faEdit}
                                fixedWidth
                                style={{ color: "#4b5563" }}
                              />{" "}
                              Edit Details
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => toggleFeeStatus(fee)}
                            >
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                fixedWidth
                                style={{ color: "#10b981" }}
                              />{" "}
                              Update Status
                            </button>
                            <div
                              style={{
                                height: "1px",
                                background: "#e5e7eb",
                                margin: "0.25rem 0",
                              }}
                            />
                            <button
                              className="dropdown-item danger"
                              onClick={() => handleDeleteFee(fee.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} fixedWidth />{" "}
                              Delete Invoice
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "4rem 1rem",
                      color: "#6b7280",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faFileInvoiceDollar}
                      size="3x"
                      style={{ marginBottom: "1rem", color: "#d1d5db" }}
                    />
                    <p
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      No invoices found.
                    </p>
                    <p style={{ fontSize: "0.9rem" }}>
                      Try adjusting your search filters or generate a new
                      invoice.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="owner-modal-overlay"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div
            className="owner-modal"
            style={{
              width: "840px",
              maxHeight: "90vh",
              height: "90vh",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="owner-modal-header"
              style={{
                padding: "1.5rem",
                background: "white",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "#d1fae5",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    style={{ color: "#059669", fontSize: "1.2rem" }}
                  />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.25rem",
                      fontWeight: "800",
                      color: "#111827",
                    }}
                  >
                    {isEditing
                      ? "Edit Invoice Details"
                      : "Generate Student Invoice"}
                  </h3>
                  <p
                    style={{
                      margin: "0.2rem 0 0 0",
                      fontSize: "0.85rem",
                      color: "#6b7280",
                    }}
                  >
                    {isEditing
                      ? "Update invoice fields for a student invoice."
                      : "Select students or groups to generate invoices in bulk."}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" color="#9ca3af" />
              </button>
            </div>

            <form
              onSubmit={handleSaveFee}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
              }}
            >
              <div
                className="owner-modal-body"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  background: "#f9fafb",
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
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
                  <label
                    className="auth-label"
                    style={{ fontWeight: "600", color: "#374151" }}
                  >
                    Fee Title
                  </label>
                  <input
                    className="auth-input"
                    required
                    value={feeForm.title}
                    onChange={(e) =>
                      setFeeForm({ ...feeForm, title: e.target.value })
                    }
                    placeholder="e.g. Tuition Fee - Spring 2026"
                    style={{
                      marginTop: "0.5rem",
                      height: "42px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                    }}
                  />
                  {formErrors.title && (
                    <div
                      style={{
                        color: "#b91c1c",
                        fontSize: "0.75rem",
                        marginTop: "0.35rem",
                      }}
                    >
                      {formErrors.title}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "1rem",
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
                    <label
                      className="auth-label"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="auth-input"
                      required
                      value={feeForm.amount}
                      onChange={(e) =>
                        setFeeForm({
                          ...feeForm,
                          amount:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      style={{
                        marginTop: "0.5rem",
                        height: "42px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                      }}
                    />
                    {formErrors.amount && (
                      <div
                        style={{
                          color: "#b91c1c",
                          fontSize: "0.75rem",
                          marginTop: "0.35rem",
                        }}
                      >
                        {formErrors.amount}
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
                    <label
                      className="auth-label"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="auth-input"
                      required
                      value={feeForm.dueDate}
                      onChange={(e) =>
                        setFeeForm({ ...feeForm, dueDate: e.target.value })
                      }
                      style={{
                        marginTop: "0.5rem",
                        height: "42px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: "white",
                      }}
                    />
                    {formErrors.dueDate && (
                      <div
                        style={{
                          color: "#b91c1c",
                          fontSize: "0.75rem",
                          marginTop: "0.35rem",
                        }}
                      >
                        {formErrors.dueDate}
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
                    <label
                      className="auth-label"
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      Status
                    </label>
                    <select
                      className="auth-input"
                      value={feeForm.status}
                      onChange={(e) =>
                        setFeeForm({
                          ...feeForm,
                          status: e.target.value as FeeStatus,
                        })
                      }
                      style={{
                        marginTop: "0.5rem",
                        height: "42px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>

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
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      Paid At
                    </label>
                    <input
                      type="date"
                      className="auth-input"
                      value={feeForm.paidAt}
                      onChange={(e) =>
                        setFeeForm({ ...feeForm, paidAt: e.target.value })
                      }
                      style={{
                        marginTop: "0.5rem",
                        height: "42px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: "white",
                      }}
                    />
                  </div>
                </div>

                {isEditing ? (
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
                      style={{ fontWeight: "600", color: "#374151" }}
                    >
                      Student
                    </label>
                    <select
                      className="auth-input"
                      value={feeForm.studentProfileId}
                      onChange={(e) =>
                        setFeeForm({
                          ...feeForm,
                          studentProfileId: Number(e.target.value) || "",
                        })
                      }
                      style={{
                        marginTop: "0.5rem",
                        height: "42px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option
                          key={student.studentProfileId}
                          value={student.studentProfileId}
                        >
                          {student.name} ({student.rollNo})
                        </option>
                      ))}
                    </select>
                    {formErrors.studentProfileId && (
                      <div
                        style={{
                          color: "#b91c1c",
                          fontSize: "0.75rem",
                          marginTop: "0.35rem",
                        }}
                      >
                        {formErrors.studentProfileId}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
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
                        <label
                          className="auth-label"
                          style={{ fontWeight: "600", color: "#374151" }}
                        >
                          Select Student Groups (
                          {feeForm.studentGroupIds.length})
                        </label>
                        <div
                          style={{
                            maxHeight: "220px",
                            overflowY: "auto",
                            marginTop: "0.5rem",
                          }}
                        >
                          {studentGroups.map((group) => (
                            <label
                              key={group.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.35rem 0",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={feeForm.studentGroupIds.includes(
                                  group.id,
                                )}
                                onChange={() => toggleGroupSelection(group.id)}
                              />
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#374151",
                                }}
                              >
                                {group.name} ({group.studentIds.length}{" "}
                                students)
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

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
                          style={{ fontWeight: "600", color: "#374151" }}
                        >
                          Select Individual Students (
                          {feeForm.studentProfileIds.length})
                        </label>
                        <div
                          style={{
                            maxHeight: "220px",
                            overflowY: "auto",
                            marginTop: "0.5rem",
                          }}
                        >
                          {students.map((student) => (
                            <label
                              key={student.studentProfileId}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.35rem 0",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={feeForm.studentProfileIds.includes(
                                  student.studentProfileId,
                                )}
                                onChange={() =>
                                  toggleStudentSelection(
                                    student.studentProfileId,
                                  )
                                }
                              />
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#374151",
                                }}
                              >
                                {student.name} ({student.rollNo})
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {formErrors.recipients && (
                      <div style={{ color: "#b91c1c", fontSize: "0.75rem" }}>
                        {formErrors.recipients}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div
                className="owner-modal-footer"
                style={{
                  padding: "1.25rem 1.5rem",
                  background: "white",
                  borderTop: "1px solid #f3f4f6",
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={handleCloseModal}
                  style={{
                    background: "white",
                    border: "1px solid #d1d5db",
                    color: "#374151",
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: "#10b981", fontWeight: "600" }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        style={{ marginRight: "0.4rem" }}
                      />{" "}
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Generate Invoice"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmActionModal
        isOpen={pendingDeleteFeeId !== null}
        title="Delete Invoice"
        message={
          <>
            Are you sure you want to delete this invoice record? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete Invoice"
        onConfirm={handleDeleteFee}
        onCancel={() => setPendingDeleteFeeId(null)}
      />
    </div>
  );
}
