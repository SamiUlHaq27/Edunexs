import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onCancel}
      role="presentation"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onConfirm();
        }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-action-modal-title"
        style={{
          width: "min(100%, 520px)",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            background: "#fff7ed",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                background: "#ffedd5",
                color: "#c2410c",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3
              id="confirm-action-modal-title"
              style={{ margin: 0, color: "#111827" }}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Close dialog"
            style={{
              border: "none",
              background: "transparent",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <div style={{ color: "#334155", lineHeight: 1.6 }}>{message}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            padding: "1rem 1.5rem 1.5rem",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            style={{
              padding: "0.7rem 1.1rem",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            style={{
              padding: "0.7rem 1.1rem",
              borderRadius: "10px",
              border: "none",
              background: "#dc2626",
              color: "#fff",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isProcessing ? <FontAwesomeIcon icon={faSpinner} spin /> : null}
            {isProcessing ? "Processing..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
