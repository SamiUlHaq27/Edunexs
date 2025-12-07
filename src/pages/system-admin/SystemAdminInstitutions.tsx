import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faEllipsisH,
  faCheckCircle,
  faBan,
  faTimes,
  faPaperPlane,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import { institutionService } from "../../services/institution.service";
import { Institution } from "../../types";

export default function SystemAdminInstitutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "blocked" | "unblocked"
  >("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"block" | "unblock">("block");
  const [selectedInstPrefix, setSelectedInstPrefix] = useState<string | null>(
    null
  );
  const [blockMessage, setBlockMessage] = useState("");

  useEffect(() => {
    fetchInstitutions();
  }, [page, filterStatus]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters: any = {
        page,
        size: 10,
        filters: {},
      };

      if (filterStatus !== "all") {
        filters.filters.isBlocked = filterStatus === "blocked";
      }

      const response = await institutionService.getAllInstitutions(filters);
      setInstitutions(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load institutions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (prefix: string, action: "block" | "unblock") => {
    setOpenMenuId(null);
    setSelectedInstPrefix(prefix);
    setModalAction(action);

    if (action === "block") {
      setBlockMessage("");
    }

    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedInstPrefix) return;

    setIsLoading(true);
    setError(null);

    try {
      await institutionService.updateStatus({
        prefix: selectedInstPrefix,
        isBlocked: modalAction === "block",
        message:
          blockMessage ||
          (modalAction === "unblock" ? "Institution has been unblocked" : ""),
      });

      setSuccessMessage(
        modalAction === "block"
          ? "Institution blocked successfully"
          : "Institution unblocked successfully"
      );

      closeModal();
      fetchInstitutions();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || `Failed to ${modalAction} institution`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInstPrefix(null);
    setBlockMessage("");
  };

  const handleFilterChange = (status: "all" | "blocked" | "unblocked") => {
    setFilterStatus(status);
    setPage(1);
    setIsFilterOpen(false);
  };

  const selectedInst = institutions.find(
    (i) => i.prefix === selectedInstPrefix
  );
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={() => {
        setOpenMenuId(null);
        setIsFilterOpen(false);
      }}
    >
      {/* Success/Error Messages */}
      {successMessage && (
        <div
          className="alert alert-success"
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            backgroundColor: "#d1fae5",
            color: "#059669",
            borderRadius: "0.5rem",
          }}
        >
          {successMessage}
        </div>
      )}
      {error && (
        <div
          className="alert alert-error"
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "0.5rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Registered Institutions ({total})
        </h2>
        <div style={{ position: "relative" }}>
          <button
            className="btn"
            style={{
              height: "40px",
              background: "#fff",
              border: "1px solid #d1d5db",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsFilterOpen(!isFilterOpen);
            }}
          >
            Filter <FontAwesomeIcon icon={faFilter} />
          </button>
          {isFilterOpen && (
            <div
              className="action-dropdown"
              style={{ minWidth: "150px", right: 0 }}
            >
              <button
                className="dropdown-item"
                onClick={() => handleFilterChange("all")}
              >
                All {filterStatus === "all" && "✓"}
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleFilterChange("unblocked")}
              >
                Unblocked {filterStatus === "unblocked" && "✓"}
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleFilterChange("blocked")}
              >
                Blocked {filterStatus === "blocked" && "✓"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Loading...</div>
      ) : institutions.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}
        >
          No institutions found
        </div>
      ) : (
        <div className="card table-container">
          <table className="data-table sys-admin-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Institution Name</th>
                <th>Prefix</th>
                <th>Location</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <tr key={inst.prefix}>
                  <td>
                    <img
                      src={inst.logo?.publicUrl || inst.logoUrl || ASSETS.logo}
                      alt="Logo"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "1px solid #eee",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: "600", fontSize: "1rem" }}>
                    {inst.name}
                  </td>
                  <td style={{ fontFamily: "monospace", color: "#6b7280" }}>
                    {inst.prefix}
                  </td>
                  <td>
                    {inst.city}, {inst.country}
                  </td>
                  <td>{formatDate(inst.createdAt)}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        inst.isBlocked ? "status-blocked" : "status-unblocked"
                      }`}
                    >
                      {inst.isBlocked ? "Blocked" : "Unblocked"}
                    </span>
                  </td>
                  <td>
                    <div
                      className="action-menu-wrapper"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="action-menu-btn"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === inst.prefix ? null : inst.prefix
                          )
                        }
                        disabled={isLoading}
                      >
                        <FontAwesomeIcon icon={faEllipsisH} />
                      </button>

                      {openMenuId === inst.prefix && (
                        <div
                          className="action-dropdown"
                          style={{ minWidth: "150px" }}
                        >
                          {!inst.isBlocked ? (
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleActionClick(inst.prefix, "block")
                              }
                            >
                              <FontAwesomeIcon
                                icon={faBan}
                                style={{ color: "#dc2626" }}
                                fixedWidth
                              />
                              <span style={{ color: "#dc2626" }}>Block</span>
                            </button>
                          ) : (
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleActionClick(inst.prefix, "unblock")
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                style={{ color: "#059669" }}
                                fixedWidth
                              />
                              <span style={{ color: "#059669" }}>Unblock</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            className="btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            style={{ padding: "0.5rem 1rem" }}
          >
            Previous
          </button>
          <span style={{ color: "#6b7280" }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            style={{ padding: "0.5rem 1rem" }}
          >
            Next
          </button>
        </div>
      )}

      {/* --- Confirmation & Message Modal --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <FontAwesomeIcon
                  icon={
                    modalAction === "block"
                      ? faExclamationTriangle
                      : faCheckCircle
                  }
                  style={{
                    color: modalAction === "block" ? "#f59e0b" : "#059669",
                    marginRight: "0.5rem",
                  }}
                />
                {modalAction === "block"
                  ? "Block Institution"
                  : "Unblock Institution"}
              </h3>
              <button className="btn action-btn" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: "#374151", marginBottom: "1rem" }}>
                {modalAction === "block" ? (
                  <>
                    Are you sure you want to block{" "}
                    <strong>{selectedInst?.name}</strong>? This will restrict
                    access for all associated users.
                  </>
                ) : (
                  <>
                    Are you sure you want to unblock{" "}
                    <strong>{selectedInst?.name}</strong>? This will restore
                    access for all associated users.
                  </>
                )}
              </p>

              <label
                className="auth-label"
                style={{ display: "block", marginBottom: "0.25rem" }}
              >
                {modalAction === "block"
                  ? "Reason for blocking (Message to Owner)"
                  : "Message to Owner (Optional)"}
              </label>
              <textarea
                className="textarea-field"
                placeholder={
                  modalAction === "block"
                    ? "e.g. Violation of terms of service..."
                    : "e.g. Your institution has been unblocked..."
                }
                value={blockMessage}
                onChange={(e) => setBlockMessage(e.target.value)}
                autoFocus
                rows={4}
              ></textarea>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginTop: "0.5rem",
                }}
              >
                This message will be sent via email to the institution owner
                {selectedInst?.owner?.email
                  ? ` (${selectedInst.owner.email})`
                  : ""}
                .
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn"
                onClick={closeModal}
                style={{ background: "#fff", border: "1px solid #d1d5db" }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{
                  background: modalAction === "block" ? "#dc2626" : "#059669",
                  borderColor: modalAction === "block" ? "#dc2626" : "#059669",
                }}
                onClick={confirmAction}
                disabled={
                  isLoading || (modalAction === "block" && !blockMessage.trim())
                }
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} /> Confirm & Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
