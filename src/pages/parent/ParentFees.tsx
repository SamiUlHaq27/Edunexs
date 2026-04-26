import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoiceDollar,
  faCreditCard,
  faDownload,
  faHistory,
  faCalendarAlt,
  faCheckCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { feeService, type FeeInvoice } from "../../services/fee.service";
import StripePaymentModal from "../../components/StripePaymentModal";
import { useOutletContext } from "react-router-dom";

interface ParentOutletContext {
  selectedStudent: { id: number; name: string } | null;
}

export default function ParentFees() {
  const { selectedStudent } = useOutletContext<ParentOutletContext>();
  const [fees, setFees] = useState<FeeInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeeForPayment, setSelectedFeeForPayment] =
    useState<FeeInvoice | null>(null);

  useEffect(() => {
    if (!selectedStudent) return;

    const loadFees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await feeService.getStudentFees({
          page: 1,
          size: 50,
          filters: { studentProfileId: selectedStudent.id },
        });
        setFees(response.data || []);
      } catch (err) {
        setError(
          err && typeof err === "object" && "message" in err
            ? (err as Error).message
            : "Failed to load fees",
        );
        setFees([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadFees();
  }, [selectedStudent]);

  const pendingFee = fees.find((f) => f.status === "PENDING");
  const paidFees = fees.filter((f) => f.status === "PAID");
  const totalPending = pendingFee ? pendingFee.amount : 0;

  const handlePaymentSuccess = () => {
    setSelectedFeeForPayment(null);
    // Reload fees to reflect payment
    if (selectedStudent) {
      const loadFees = async () => {
        try {
          const response = await feeService.getStudentFees({
            page: 1,
            size: 50,
            filters: { studentProfileId: selectedStudent.id },
          });
          setFees(response.data || []);
        } catch (err) {
          console.error("Failed to reload fees", err);
        }
      };
      void loadFees();
    }
  };

  if (!selectedStudent) {
    return (
      <div className="parent-fees-container hd-theme">
        <h3 className="card-title-hd">Fee & Invoices</h3>
        <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
          Please select a student to view fees.
        </div>
      </div>
    );
  }

  return (
    <div className="parent-fees-container hd-theme">
      <h3 className="card-title-hd">
        Fee & Invoices for {selectedStudent.name}
      </h3>

      {isLoading && (
        <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
          Loading fees...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Summary Cards */}
          <div className="fees-grid-hd">
            <div className="fee-card-hd pending-border">
              <div className="fee-info-hd">
                <p className="fee-label">Current Due</p>
                <div className="fee-amount-hd text-danger">
                  Rs {totalPending.toFixed(2)}
                </div>
                {pendingFee && (
                  <p className="fee-date-hd">
                    <FontAwesomeIcon icon={faClock} /> Due:{" "}
                    {new Date(pendingFee.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                className="pay-now-btn-main"
                onClick={() =>
                  pendingFee && setSelectedFeeForPayment(pendingFee)
                }
                disabled={!pendingFee}
              >
                <FontAwesomeIcon icon={faCreditCard} /> <span>Pay Now</span>
              </button>
            </div>

            {paidFees.length > 0 && (
              <div className="fee-card-hd paid-border">
                <div className="fee-info-hd">
                  <p className="fee-label">Last Payment</p>
                  <div className="fee-amount-hd text-success">
                    Rs {paidFees[0].amount.toFixed(2)}
                  </div>
                  {paidFees[0].paidAt && (
                    <p className="fee-date-hd text-success">
                      <FontAwesomeIcon icon={faCheckCircle} /> Paid on:{" "}
                      {new Date(paidFees[0].paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="fee-icon-blob">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} />
                </div>
              </div>
            )}
          </div>

          {/* History Table */}
          <div className="history-card-hd">
            <div className="card-header-hd">
              <h4 className="table-title">
                <FontAwesomeIcon icon={faHistory} /> Payment History
              </h4>
              <span className="entries-count">{fees.length} Invoices</span>
            </div>

            {fees.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                No fees found for this student.
              </div>
            ) : (
              <div className="table-responsive-hd">
                <table className="modern-data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee.id}>
                        <td className="inv-id">{fee.invoiceNo}</td>
                        <td>
                          <div style={{ fontSize: "0.9rem", color: "#374151" }}>
                            {fee.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#9ca3af",
                              marginTop: "0.25rem",
                            }}
                          >
                            Due: {new Date(fee.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="inv-amount">
                          Rs {fee.amount.toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              fee.status === "PENDING"
                                ? "warning-pill"
                                : "active-pill"
                            }`}
                          >
                            {fee.status}
                          </span>
                        </td>
                        <td>
                          {fee.status === "PENDING" ? (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "#eff6ff",
                                color: "#2563eb",
                                border: "none",
                              }}
                              onClick={() => setSelectedFeeForPayment(fee)}
                            >
                              <FontAwesomeIcon icon={faCreditCard} /> Pay
                            </button>
                          ) : (
                            <button
                              className="download-btn-hd"
                              style={{ cursor: "not-allowed", opacity: 0.5 }}
                            >
                              <FontAwesomeIcon icon={faDownload} /> PDF
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Stripe Payment Modal */}
      {selectedFeeForPayment && (
        <StripePaymentModal
          isOpen={!!selectedFeeForPayment}
          feeId={selectedFeeForPayment.id}
          amount={selectedFeeForPayment.amount}
          invoiceNo={selectedFeeForPayment.invoiceNo}
          title={selectedFeeForPayment.title}
          onClose={() => setSelectedFeeForPayment(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
