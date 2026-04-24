import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faFileAlt,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { studentAssignmentService } from "../../services";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const maybeResponse = error as {
      response?: { data?: { message?: string | string[] } };
    };
    const message = maybeResponse.response?.data?.message;
    if (Array.isArray(message)) return message[0] || "Something went wrong";
    if (typeof message === "string") return message;
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export default function StudentAssignmentSubmit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const assignmentId =
    typeof location.state?.assignmentId === "number"
      ? location.state.assignmentId
      : null;
  const offeringId =
    typeof location.state?.offeringId === "number"
      ? location.state.offeringId
      : null;

  const assignmentTitle = useMemo(() => {
    if (typeof location.state?.assignmentTitle === "string") {
      return location.state.assignmentTitle;
    }
    return "Assignment Submission";
  }, [location.state]);

  const dueDate =
    typeof location.state?.dueDate === "string" ? location.state.dueDate : null;
  const maxGrade =
    typeof location.state?.maxGrade === "number" ? location.state.maxGrade : null;
  const instructions =
    typeof location.state?.instructions === "string"
      ? location.state.instructions
      : "Upload your assignment file. PDF, DOCX, or JPG supported.";

  const handleDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async () => {
    if (!assignmentId || !file) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await studentAssignmentService.submitAssignment({
        assignmentId,
        file,
      });

      setSuccess(response.message || "Assignment submitted successfully.");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignmentId) {
    return (
      <div className="card settings-container">
        <p style={{ color: "#b91c1c" }}>Assignment context is missing.</p>
        <button
          className="btn"
          onClick={() => navigate("/student/courses")}
          style={{ marginTop: "0.75rem" }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="card settings-container">
      <button
        className="btn"
        onClick={() =>
          navigate("/student/courses", {
            state: offeringId ? { offeringId } : undefined,
          })
        }
        style={{ marginBottom: "1rem" }}
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Courses
      </button>

      <div className="student-header-card">
        <h2 style={{ margin: 0 }}>{assignmentTitle}</h2>
        <p style={{ opacity: 0.9, marginTop: "0.5rem" }}>
          Due: {dueDate ? new Date(dueDate).toLocaleDateString() : "N/A"}
          {maxGrade ? ` • ${maxGrade} Marks` : ""}
        </p>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h4 style={{ marginBottom: "0.5rem" }}>Instructions</h4>
        <p style={{ color: "#4b5563", lineHeight: "1.6" }}>{instructions}</p>
      </div>

      <h4 style={{ marginBottom: "1rem" }}>Your Submission</h4>
      <div className="upload-zone">
        <input
          type="file"
          id="file-upload"
          style={{ display: "none" }}
          onChange={handleDrop}
          disabled={isSubmitting}
        />
        {file ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <FontAwesomeIcon icon={faFileAlt} size="2x" color="#0066ff" />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "bold" }}>{file.name}</div>
              <div style={{ fontSize: "0.8rem" }}>{(file.size / 1024).toFixed(2)} KB</div>
            </div>
            <button
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
              }}
              style={{ color: "red" }}
              disabled={isSubmitting}
            >
              Remove
            </button>
          </div>
        ) : (
          <label htmlFor="file-upload" style={{ cursor: isSubmitting ? "not-allowed" : "pointer", display: "block" }}>
            <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" style={{ marginBottom: "1rem", color: "#9ca3af" }} />
            <p style={{ fontWeight: "bold", color: "#374151" }}>Click to upload assignment</p>
            <p style={{ fontSize: "0.8rem" }}>PDF, DOCX, or JPG</p>
          </label>
        )}
      </div>

      {error && <p style={{ color: "#b91c1c", marginTop: "1rem" }}>{error}</p>}
      {success && <p style={{ color: "#166534", marginTop: "1rem" }}>{success}</p>}

      <div style={{ marginTop: "2rem", textAlign: "right" }}>
        <button
          className="btn btn-primary"
          disabled={!file || isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? "Submitting..." : "Turn In Assignment"}
        </button>
      </div>
    </div>
  );
}
