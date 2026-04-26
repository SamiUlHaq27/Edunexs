import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faFileAlt,
  faArrowLeft,
  faTrash,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  studentAssignmentService,
  type StudentSubmission,
} from "../../services";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingSubmission, setExistingSubmission] =
    useState<StudentSubmission | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

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
    typeof location.state?.maxGrade === "number"
      ? location.state.maxGrade
      : null;
  const instructions =
    typeof location.state?.instructions === "string"
      ? location.state.instructions
      : "Upload your assignment file. PDF, DOCX, or JPG supported.";

  // Load existing submission on mount
  useEffect(() => {
    if (!assignmentId) return;

    const loadSubmission = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const submission =
          await studentAssignmentService.getMySubmission(assignmentId);
        setExistingSubmission(submission);
      } catch (err) {
        // No existing submission is fine, don't error
        setExistingSubmission({ submission: null, hasSubmission: false });
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubmission();
  }, [assignmentId]);

  const handleDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleRemoveExisting = async () => {
    if (!assignmentId) return;

    if (!window.confirm("Are you sure you want to remove this submission?")) {
      return;
    }

    try {
      setIsRemoving(true);
      setError(null);
      setSuccess(null);

      await studentAssignmentService.removeSubmission(assignmentId);
      setSuccess("Submission removed successfully.");
      setExistingSubmission({ submission: null, hasSubmission: false });
      setFile(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsRemoving(false);
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
      setFile(null);

      // Reload submission to reflect changes
      const updated =
        await studentAssignmentService.getMySubmission(assignmentId);
      setExistingSubmission(updated);
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

      {/* Show existing submission if present */}
      {!isLoading &&
        existingSubmission?.hasSubmission &&
        existingSubmission.submission && (
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              padding: "1.2rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <FontAwesomeIcon icon={faCheck} size="2x" color="#10b981" />
              <div>
                <h4 style={{ margin: 0, color: "#166534" }}>
                  Current Submission
                </h4>
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    color: "#059669",
                    fontSize: "0.9rem",
                  }}
                >
                  Submitted{" "}
                  {new Date(
                    existingSubmission.submission.submittedAt,
                  ).toLocaleString()}
                  {existingSubmission.submission.isLate && " (Late)"}
                </p>
              </div>
            </div>

            {existingSubmission.submission.file && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  background: "#fff",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              >
                <FontAwesomeIcon icon={faFileAlt} color="#0066ff" size="lg" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: "#111827" }}>
                    {existingSubmission.submission.file.fileName}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {(
                      existingSubmission.submission.file.sizeOriginal / 1024
                    ).toFixed(2)}{" "}
                    KB
                  </div>
                </div>
                <a
                  href={existingSubmission.submission.file.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                  style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "none",
                  }}
                >
                  View
                </a>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn"
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "none",
                  flex: 1,
                }}
                onClick={() => void handleRemoveExisting()}
                disabled={isRemoving}
              >
                <FontAwesomeIcon icon={faTrash} />{" "}
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>

            <p
              style={{
                color: "#059669",
                fontSize: "0.9rem",
                marginTop: "1rem",
                marginBottom: 0,
              }}
            >
              💡 You can replace this submission by uploading a new file below.
            </p>
          </div>
        )}

      <h4 style={{ marginBottom: "1rem" }}>
        {existingSubmission?.hasSubmission
          ? "Upload New File to Replace"
          : "Your Submission"}
      </h4>
      <div className="upload-zone">
        <input
          type="file"
          id="file-upload"
          style={{ display: "none" }}
          onChange={handleDrop}
          disabled={isSubmitting || isRemoving}
        />
        {file ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <FontAwesomeIcon icon={faFileAlt} size="2x" color="#0066ff" />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: "bold" }}>{file.name}</div>
              <div style={{ fontSize: "0.8rem" }}>
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <button
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
              }}
              style={{ color: "red" }}
              disabled={isSubmitting || isRemoving}
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            style={{
              cursor: isSubmitting || isRemoving ? "not-allowed" : "pointer",
              display: "block",
            }}
          >
            <FontAwesomeIcon
              icon={faCloudUploadAlt}
              size="3x"
              style={{ marginBottom: "1rem", color: "#9ca3af" }}
            />
            <p style={{ fontWeight: "bold", color: "#374151" }}>
              Click to upload assignment
            </p>
            <p style={{ fontSize: "0.8rem" }}>PDF, DOCX, or JPG</p>
          </label>
        )}
      </div>

      {error && <p style={{ color: "#b91c1c", marginTop: "1rem" }}>{error}</p>}
      {success && (
        <p style={{ color: "#166534", marginTop: "1rem" }}>{success}</p>
      )}

      <div style={{ marginTop: "2rem", textAlign: "right" }}>
        <button
          className="btn btn-primary"
          disabled={!file || isSubmitting || isRemoving}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? "Submitting..." : "Turn In Assignment"}
        </button>
      </div>
    </div>
  );
}
