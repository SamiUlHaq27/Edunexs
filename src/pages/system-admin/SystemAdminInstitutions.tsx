import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faEllipsisH,
  faExclamationTriangle,
  faFilter,
  faPaperPlane,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { ASSETS } from "../../config/assets";
import { institutionService } from "../../services/institution.service";
import { Institution } from "../../types";

export default function SystemAdminInstitutions(): React.JSX.Element {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "blocked" | "unblocked"
  >("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"block" | "unblock">("block");
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);
  const [blockMessage, setBlockMessage] = useState("");

  useEffect(() => {
    void fetchInstitutions();
  }, [page, filterStatus]);

  useEffect(() => {
    if (!successMessage && !error) return;

    const timer = setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [successMessage, error]);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await institutionService.getAllInstitutions({
        page,
        size: 10,
        filters:
          filterStatus === "all"
            ? {}
            : { isBlocked: filterStatus === "blocked" },
      });

      setInstitutions(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load institutions");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInstitution = useMemo(
    () =>
      institutions.find((institution) => institution.id === openMenuId) ?? null,
    [institutions, openMenuId],
  );

  const handleFilterChange = (status: "all" | "blocked" | "unblocked") => {
    setFilterStatus(status);
    setPage(1);
    setIsFilterOpen(false);
  };

  const toggleMenu = (
    institutionId: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setIsFilterOpen(false);

    if (openMenuId === institutionId) {
      setOpenMenuId(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right + window.scrollX - 150,
    });
    setOpenMenuId(institutionId);
  };

  const openActionModal = (
    institution: Institution,
    action: "block" | "unblock",
  ) => {
    setOpenMenuId(null);
    setSelectedInstitution(institution);
    setModalAction(action);
    setBlockMessage(action === "block" ? "" : "Institution has been unblocked");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInstitution(null);
    setBlockMessage("");
  };

  const confirmAction = async () => {
    if (!selectedInstitution) return;

    setIsLoading(true);
    setError(null);

    try {
      await institutionService.updateStatus({
        institutionId: selectedInstitution.id,
        isBlocked: modalAction === "block",
        message:
          blockMessage ||
          (modalAction === "unblock" ? "Institution has been unblocked" : ""),
      });

      setSuccessMessage(
        modalAction === "block"
          ? "Institution blocked successfully"
          : "Institution unblocked successfully",
      );

      closeModal();
      await fetchInstitutions();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || `Failed to ${modalAction} institution`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      onClick={() => {
        setOpenMenuId(null);
        setIsFilterOpen(false);
      }}
    >
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
            onClick={(event) => {
              event.stopPropagation();
              setIsFilterOpen((current) => !current);
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
          <div className="table-scroll">
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
                {institutions.map((institution) => (
                  <tr key={institution.id}>
                    <td>
                      <img
                        src={
                          institution.logo?.publicUrl ||
                          institution.logoUrl ||
                          ASSETS.logo
                        }
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
                      {institution.name}
                    </td>
                    <td style={{ fontFamily: "monospace", color: "#6b7280" }}>
                      {institution.prefix}
                    </td>
                    <td>
                      {institution.city}, {institution.country}
                    </td>
                    <td>{formatDate(institution.createdAt)}</td>
                    <td>
                      <span
                        className={`status-pill ${institution.isBlocked ? "status-blocked" : "status-unblocked"}`}
                      >
                        {institution.isBlocked ? "Blocked" : "Unblocked"}
                      </span>
                    </td>
                    <td>
                      <div
                        className="action-menu-wrapper"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          className="action-menu-btn"
                          onClick={(event) => toggleMenu(institution.id, event)}
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faEllipsisH} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {openMenuId !== null && filteredInstitution && (
        <div
          className="action-dropdown"
          style={{
            position: "fixed",
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            minWidth: "150px",
            zIndex: 1000,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {!filteredInstitution.isBlocked ? (
            <button
              className="dropdown-item"
              onClick={() => openActionModal(filteredInstitution, "block")}
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
              onClick={() => openActionModal(filteredInstitution, "unblock")}
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
            onClick={() => setPage((current) => Math.max(1, current - 1))}
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
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page === totalPages || isLoading}
            style={{ padding: "0.5rem 1rem" }}
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && selectedInstitution && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
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
                    <strong>{selectedInstitution.name}</strong>? This will
                    restrict access for all associated users.
                  </>
                ) : (
                  <>
                    Are you sure you want to unblock{" "}
                    <strong>{selectedInstitution.name}</strong>? This will
                    restore access for all associated users.
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
                onChange={(event) => setBlockMessage(event.target.value)}
                autoFocus
                rows={4}
              />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginTop: "0.5rem",
                }}
              >
                This message will be sent via email to the institution owner
                {selectedInstitution.owner?.email
                  ? ` (${selectedInstitution.owner.email})`
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
