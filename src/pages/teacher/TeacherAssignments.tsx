import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faPlus,
  faArrowLeft,
  faEye,
  faCloudUploadAlt,
  faSave,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import { teacherAssignmentService } from "../../services";
import type {
  CreateTeacherAssignmentDto,
  TeacherAssignment,
} from "../../services/teacher-assignment.service";

interface TeacherAssignmentsProps {
  offeringId?: number;
}

interface AssignmentSubmissionRow {
  submissionId: number;
  studentProfileId: number;
  studentName?: string;
  rollNo?: string;
  status: string;
  submittedAt?: string;
  grade?: {
    score: number;
    feedback?: string;
  } | null;
}

export default function TeacherAssignments({
  offeringId,
}: TeacherAssignmentsProps) {
  const [view, setView] = useState<"list" | "create" | "submissions" | "grade">(
    "list",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<TeacherAssignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionRow[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmissionRow | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: string;
    maxGrade: number;
  }>({
    title: "",
    description: "",
    dueDate: "",
    maxGrade: 100,
  });

  const [gradeData, setGradeData] = useState<{
    score: number;
    feedback: string;
  }>({
    score: 0,
    feedback: "",
  });

  const canUseApi = useMemo(() => Number.isFinite(offeringId), [offeringId]);

  const loadAssignments = async () => {
    if (!offeringId) {
      setAssignments([]);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await teacherAssignmentService.listAssignments({
        page: 1,
        size: 50,
        offeringId,
        isActive: true,
      });
      setAssignments(response.data || []);
    } catch (error) {
      console.error("Failed to load assignments", error);
      setErrorMessage("Could not load assignments.");
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringId]);

  const loadSubmissions = async (assignment: TeacherAssignment) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSelectedAssignment(assignment);
      const response = await teacherAssignmentService.listSubmissions({
        assignmentId: assignment.id,
        page: 1,
        size: 100,
      });

      setSubmissions((response.data as AssignmentSubmissionRow[]) || []);
      setView("submissions");
    } catch (error) {
      console.error("Failed to load submissions", error);
      setErrorMessage("Could not load assignment submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!offeringId) {
      return;
    }

    if (!formData.title.trim() || !formData.dueDate || formData.maxGrade <= 0) {
      setErrorMessage("Please fill title, due date, and valid max grade.");
      return;
    }

    const payload: CreateTeacherAssignmentDto = {
      offeringId,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      dueDate: formData.dueDate,
      maxGrade: formData.maxGrade,
      assessmentType: "assignment",
    };

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await teacherAssignmentService.createAssignment(payload, files);

      setFormData({ title: "", description: "", dueDate: "", maxGrade: 100 });
      setFiles([]);
      setView("list");
      await loadAssignments();
    } catch (error) {
      console.error("Failed to create assignment", error);
      setErrorMessage("Failed to create assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startGrade = (submission: AssignmentSubmissionRow) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.grade?.score || 0,
      feedback: submission.grade?.feedback || "",
    });
    setView("grade");
  };

  const handleSaveGrade = async () => {
    if (!selectedAssignment || !selectedSubmission) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await teacherAssignmentService.gradeSubmission({
        assignmentId: selectedAssignment.id,
        studentProfileId: selectedSubmission.studentProfileId,
        score: Number(gradeData.score),
        feedback: gradeData.feedback.trim() || undefined,
      });

      await loadSubmissions(selectedAssignment);
      setView("submissions");
      await loadAssignments();
    } catch (error) {
      console.error("Failed to grade submission", error);
      setErrorMessage("Failed to save grade.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canUseApi) {
    return (
      <div className="card settings-container" style={{ padding: "1.2rem" }}>
        <p style={{ marginTop: 0 }}>Select a course to manage assignments.</p>
        <Link
          to="/teacher/courses"
          style={{ color: "#1d4ed8", fontWeight: 700 }}
        >
          Open My Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      {errorMessage && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "0.7rem 0.9rem",
            marginBottom: "1rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      {view === "create" && (
        <div>
          <button
            className="btn"
            onClick={() => setView("list")}
            style={{ marginBottom: "1rem" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to List
          </button>

          <h3 className="card-title" style={{ marginBottom: "1.2rem" }}>
            Publish New Assignment
          </h3>

          <div className="modal-form-grid" style={{ marginBottom: "1.2rem" }}>
            <div style={{ marginBottom: "0.9rem" }}>
              <label className="auth-label">Assignment Title</label>
              <input
                className="auth-input"
                placeholder="e.g. Final Research Project"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div style={{ marginBottom: "0.9rem" }}>
              <label className="auth-label">Description / Instructions</label>
              <textarea
                className="auth-input"
                placeholder="Write detailed instructions for students"
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                style={{
                  padding: "12px",
                  lineHeight: "1.5",
                  resize: "vertical",
                }}
              />
            </div>

            <div className="password-row" style={{ marginTop: "0.4rem" }}>
              <div>
                <label className="auth-label">Total Marks</label>
                <input
                  className="auth-input"
                  type="number"
                  value={formData.maxGrade}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxGrade: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <label className="auth-label">Due Date</label>
                <input
                  className="auth-input"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <h4 style={{ marginBottom: "0.8rem" }}>Upload Reference Material</h4>
          <div className="upload-zone" style={{ marginBottom: "1.2rem" }}>
            <input
              type="file"
              id="assignment-file-upload"
              style={{ display: "none" }}
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <label
              htmlFor="assignment-file-upload"
              style={{ cursor: "pointer", display: "block" }}
            >
              <FontAwesomeIcon
                icon={faCloudUploadAlt}
                size="3x"
                style={{ marginBottom: "1rem", color: "#9ca3af" }}
              />
              <p style={{ fontWeight: "bold" }}>
                {files.length
                  ? `${files.length} file(s) selected`
                  : "Click to upload reference files"}
              </p>
              <p style={{ fontSize: "0.8rem" }}>
                PDF, DOCX, or Images (max 5MB each)
              </p>
            </label>
          </div>

          <div style={{ textAlign: "right" }}>
            <button
              className="btn btn-primary"
              onClick={handleCreateAssignment}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faSave} />{" "}
              {isSubmitting ? "Publishing..." : "Create Assignment"}
            </button>
          </div>
        </div>
      )}

      {view === "submissions" && selectedAssignment && (
        <div>
          <button
            className="btn"
            onClick={() => setView("list")}
            style={{ marginBottom: "1rem" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Assignments
          </button>

          <div
            className="student-header-card"
            style={{
              background: "#f8fafc",
              color: "#1e293b",
              border: "1px solid #e2e8f0",
              marginBottom: "1.1rem",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Submissions: {selectedAssignment.title}
            </h3>
            <p style={{ marginTop: "0.45rem" }}>
              Max Grade: {selectedAssignment.maxGrade}
            </p>
          </div>

          {isLoading ? (
            <div>Loading submissions...</div>
          ) : (
            <div className="activity-list">
              {submissions.map((submission) => (
                <div
                  key={submission.submissionId}
                  className="activity-item"
                  style={{ alignItems: "center" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>
                      {submission.studentName || "Student"}
                      {submission.rollNo ? (
                        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                          {" "}
                          ({submission.rollNo})
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: "0.84rem", color: "#64748b" }}>
                      Status: {submission.status}
                      {submission.submittedAt
                        ? ` • ${new Date(submission.submittedAt).toLocaleString()}`
                        : ""}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => startGrade(submission)}
                  >
                    <FontAwesomeIcon icon={faEye} /> Grade
                  </button>
                </div>
              ))}
              {!submissions.length && (
                <div>No submissions found for this assignment.</div>
              )}
            </div>
          )}
        </div>
      )}

      {view === "grade" && selectedAssignment && selectedSubmission && (
        <div>
          <button
            className="btn"
            onClick={() => setView("submissions")}
            style={{ marginBottom: "1rem" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Submissions
          </button>

          <div
            className="student-header-card"
            style={{
              background: "#f8fafc",
              color: "#1e293b",
              border: "1px solid #e2e8f0",
              marginBottom: "1.1rem",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Grading: {selectedSubmission.studentName || "Student"}
            </h3>
            <p style={{ marginTop: "0.45rem" }}>
              Assignment: {selectedAssignment.title} • Max Grade:{" "}
              {selectedAssignment.maxGrade}
            </p>
          </div>

          <div className="modal-form-grid">
            <div style={{ marginBottom: "1rem" }}>
              <label className="auth-label">Obtained Marks</label>
              <input
                type="number"
                className="auth-input"
                value={gradeData.score}
                onChange={(e) =>
                  setGradeData((prev) => ({
                    ...prev,
                    score: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label className="auth-label">Feedback / Remarks</label>
              <textarea
                className="auth-input"
                rows={4}
                value={gradeData.feedback}
                onChange={(e) =>
                  setGradeData((prev) => ({
                    ...prev,
                    feedback: e.target.value,
                  }))
                }
                style={{ padding: "12px" }}
              />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <button
              className="btn btn-primary"
              onClick={handleSaveGrade}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faSave} />{" "}
              {isSubmitting ? "Saving..." : "Save Grade"}
            </button>
          </div>
        </div>
      )}

      {view === "list" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h4 className="card-title">Assignments</h4>
            <button
              className="btn btn-primary"
              onClick={() => setView("create")}
            >
              <FontAwesomeIcon icon={faPlus} /> Create New
            </button>
          </div>

          {isLoading ? (
            <div>Loading assignments...</div>
          ) : (
            <div className="activity-list">
              {assignments.map((assignment: any) => (
                <div
                  key={assignment.id}
                  className="activity-item"
                  style={{ alignItems: "center" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>
                      <FontAwesomeIcon
                        icon={faFileAlt}
                        style={{ marginRight: "0.5rem" }}
                      />
                      {assignment.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.84rem",
                        color: "#64748b",
                        marginTop: "0.25rem",
                      }}
                    >
                      Due:{" "}
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleString()
                        : "N/A"}
                      {" • "}
                      Max: {assignment.maxGrade}
                      {" • "}
                      Submissions: {assignment.submissionCount || 0}
                    </div>
                  </div>
                  <button
                    className="btn"
                    style={{ border: "1px solid #d1d5db" }}
                    onClick={() => void loadSubmissions(assignment)}
                  >
                    <FontAwesomeIcon icon={faListCheck} /> Submissions
                  </button>
                </div>
              ))}
              {!assignments.length && (
                <div>No assignments found for this course yet.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
