import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { teacherGradebookService } from "../../services";

interface TeacherGradesProps {
  offeringId?: number;
}

interface GradebookRow {
  studentProfileId: number;
  studentId?: number | null;
  studentName: string;
  rollNo: string;
  percentage: number | null;
  gradeCount: number;
  gradedCount?: number;
  pendingCount?: number;
  assignmentCount: number;
  quizCount: number;
  customCount: number;
}

interface GradeEntry {
  gradeId: number | null;
  gradeType: "assignment" | "quiz" | "custom";
  assessmentId: number | null;
  title: string;
  score: number | null;
  maxGrade: number | null;
  percentage: number | null;
  feedback: string | null;
  gradedAt?: string | null;
  editable: boolean;
  isGraded: boolean;
}

export default function TeacherGradebook({ offeringId }: TeacherGradesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<GradebookRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<GradebookRow | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<GradeEntry[]>([]);
  const [editingGradeKey, setEditingGradeKey] = useState<string | null>(null);
  const [scoreDraft, setScoreDraft] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customGradeTitle, setCustomGradeTitle] = useState("");
  const [customGradeMaxMarks, setCustomGradeMaxMarks] = useState("100");
  const [customGradeEntries, setCustomGradeEntries] = useState<
    Array<{
      studentProfileId: number;
      studentName: string;
      rollNo: string;
      score: string;
    }>
  >([]);

  const canUseApi = useMemo(() => Number.isFinite(offeringId), [offeringId]);
  const getGradeKey = (grade: GradeEntry) =>
    grade.gradeId !== null
      ? `grade:${grade.gradeId}`
      : `pending:${grade.gradeType}:${grade.assessmentId ?? "na"}:${grade.title}`;

  const closeStudentDialog = () => {
    setSelectedRow(null);
    setSelectedGrades([]);
    setEditingGradeKey(null);
    setScoreDraft("");
    setFeedbackDraft("");
  };

  const openCustomGradeDialog = () => {
    setCustomGradeTitle("");
    setCustomGradeMaxMarks("100");
    setCustomGradeEntries(
      rows.map((student) => ({
        studentProfileId: student.studentProfileId,
        studentName: student.studentName,
        rollNo: student.rollNo,
        score: "0",
      })),
    );
    setIsCustomDialogOpen(true);
  };

  const closeCustomGradeDialog = () => {
    setIsCustomDialogOpen(false);
    setCustomGradeTitle("");
    setCustomGradeMaxMarks("100");
    setCustomGradeEntries([]);
  };

  const saveCustomGrades = async () => {
    if (!offeringId) return;

    const maxGrade = Number(customGradeMaxMarks);
    if (
      !customGradeTitle.trim() ||
      !Number.isFinite(maxGrade) ||
      maxGrade <= 0
    ) {
      setErrorMessage("Enter a custom grade title and valid total marks.");
      return;
    }

    if (!customGradeEntries.length) {
      setErrorMessage("Load students before creating a custom grade.");
      return;
    }

    const grades = customGradeEntries.map((entry) => ({
      studentProfileId: entry.studentProfileId,
      score: Number(entry.score),
    }));

    if (
      grades.some((entry) => !Number.isFinite(entry.score) || entry.score < 0)
    ) {
      setErrorMessage("Enter valid scores for all students before saving.");
      return;
    }

    if (grades.some((entry) => entry.score > maxGrade)) {
      setErrorMessage("A score cannot exceed the total marks.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      await teacherGradebookService.createCustomGrades({
        offeringId,
        title: customGradeTitle.trim(),
        maxGrade,
        grades,
      });

      closeCustomGradeDialog();
      const refreshed = await teacherGradebookService.getGradebook(offeringId);
      setRows(refreshed.data || []);
      if (selectedRow) {
        const refreshedSelected =
          refreshed.data.find(
            (row) => row.studentProfileId === selectedRow.studentProfileId,
          ) || selectedRow;
        await loadStudentGrades(refreshedSelected);
      }
    } catch (error) {
      console.error("Failed to create custom grades", error);
      setErrorMessage("Could not create custom grades.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadGradebook = async () => {
      if (!offeringId) {
        setRows([]);
        closeStudentDialog();
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await teacherGradebookService.getGradebook(offeringId);
        setRows(response.data || []);
        closeStudentDialog();
      } catch (error) {
        console.error("Failed to load gradebook", error);
        setErrorMessage("Could not load gradebook data.");
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadGradebook();
  }, [offeringId]);

  const filteredRows = rows.filter(
    (row) =>
      row.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.rollNo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const loadStudentGrades = async (row: GradebookRow) => {
    if (!offeringId) return;

    try {
      setSelectedRow(row);
      setIsDetailLoading(true);
      setErrorMessage(null);

      const response = await teacherGradebookService.getStudentGrades(
        offeringId,
        row.studentProfileId,
      );

      const grades = response.data || [];
      setSelectedGrades(grades);
      setEditingGradeKey(null);
      setScoreDraft("");
      setFeedbackDraft("");
    } catch (error) {
      console.error("Failed to load student grades", error);
      setErrorMessage("Could not load student grades.");
      setSelectedGrades([]);
      setEditingGradeKey(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const startInlineEdit = (grade: GradeEntry) => {
    setEditingGradeKey(getGradeKey(grade));
    setScoreDraft(
      grade.score === null || Number.isNaN(grade.score) ? "" : String(grade.score),
    );
    setFeedbackDraft(grade.feedback ?? "");
  };

  const cancelInlineEdit = () => {
    setEditingGradeKey(null);
    setScoreDraft("");
    setFeedbackDraft("");
  };

  const saveGrade = async (grade: GradeEntry) => {
    if (!offeringId || !selectedRow) return;

    const score = Number(scoreDraft);
    if (!Number.isFinite(score) || score < 0) {
      setErrorMessage("Enter a valid score before saving.");
      return;
    }
    if (grade.maxGrade !== null && score > grade.maxGrade) {
      setErrorMessage("Score cannot exceed max marks.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      if (grade.gradeType === "custom") {
        if (grade.gradeId !== null) {
          await teacherGradebookService.updateGrade({
            gradeId: grade.gradeId,
            score,
            feedback: feedbackDraft.trim() || undefined,
          });
        } else {
          await teacherGradebookService.createCustomGrade({
            offeringId,
            studentProfileId: selectedRow.studentProfileId,
            score,
            feedback: feedbackDraft.trim() || undefined,
          });
        }
      } else {
        if (grade.gradeId === null) {
          setErrorMessage("This assessment has no grade yet.");
          return;
        }
        await teacherGradebookService.updateGrade({
          gradeId: grade.gradeId,
          score,
          feedback: feedbackDraft.trim() || undefined,
        });
      }

      await loadStudentGrades(selectedRow);
      const refreshed = await teacherGradebookService.getGradebook(offeringId);
      setRows(refreshed.data || []);
      cancelInlineEdit();
    } catch (error) {
      console.error("Failed to save grade", error);
      setErrorMessage("Could not save grade changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const percentageLabel = (value: number | null) => {
    if (value === null) return "-";
    return `${value.toFixed(2)}%`;
  };

  const gradeLabel = (total: number | null) => {
    if (total === null) return "-";
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    return "D";
  };

  if (!canUseApi) {
    return (
      <div className="card settings-container" style={{ padding: "1.2rem" }}>
        <p style={{ marginTop: 0 }}>Select a course to view gradebook.</p>
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
      {errorMessage && !isCustomDialogOpen && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "0.7rem 0.9rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} />
          {errorMessage}
        </div>
      )}

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
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
            }}
          >
            Gradebook
          </h2>
          <p style={{ color: "#64748b", marginTop: "4px" }}>
            Click a student to open grades and edit score or feedback.
          </p>
        </div>

        <button
          onClick={() => void openCustomGradeDialog()}
          style={{
            background: "#0f172a",
            border: "1px solid #0f172a",
            borderRadius: "12px",
            fontWeight: "bold",
            color: "white",
            cursor: "pointer",
            padding: "10px 14px",
          }}
        >
          Create Custom Grade
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <FontAwesomeIcon
          icon={faSearch}
          style={{
            position: "absolute",
            left: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#94a3b8",
          }}
        />
        <input
          type="text"
          placeholder="Search student names or roll numbers..."
          style={{
            width: "100%",
            padding: "12px 12px 12px 45px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            outline: "none",
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <div
          className="card"
          style={{ borderRadius: "12px", overflow: "hidden" }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={{ textAlign: "left", padding: "10px" }}>Student</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Roll No</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Marks %</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Graded</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Pending</th>
                <th style={{ textAlign: "left", padding: "10px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} style={{ padding: "12px" }}>
                    Loading gradebook...
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredRows.map((student) => {
                  return (
                    <tr
                      key={student.studentProfileId}
                      onClick={() => void loadStudentGrades(student)}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        {student.studentName}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        {student.rollNo}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f1f5f9",
                          fontWeight: 800,
                        }}
                      >
                        {percentageLabel(student.percentage)}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        {student.gradedCount ?? student.gradeCount}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        {student.pendingCount ?? "-"}
                      </td>
                      <td
                        style={{
                          padding: "10px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        <span style={{ color: "#2563eb", fontWeight: 700 }}>
                          View
                        </span>
                      </td>
                    </tr>
                  );
                })}

              {!isLoading && !filteredRows.length && (
                <tr>
                  <td colSpan={6} style={{ padding: "12px" }}>
                    No grade records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCustomDialogOpen && (
        <div
          className="teacher-modal-overlay"
          onClick={closeCustomGradeDialog}
          role="presentation"
        >
          <div
            className="teacher-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-grade-dialog-title"
            style={{ width: "min(920px, 94vw)" }}
          >
            <div className="teacher-modal-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "start",
                }}
              >
                <div>
                  <h3
                    id="custom-grade-dialog-title"
                    style={{ margin: 0, color: "#0f172a" }}
                  >
                    Create Custom Grade
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                    Enter the shared title, total marks, then set each
                    student&apos;s score.
                  </p>
                </div>

                <button
                  onClick={closeCustomGradeDialog}
                  style={{
                    border: "none",
                    background: "#f8fafc",
                    borderRadius: "999px",
                    padding: "0.5rem 0.7rem",
                    cursor: "pointer",
                    color: "#475569",
                  }}
                  aria-label="Close custom grade dialog"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>

            <div className="teacher-modal-body">
              {errorMessage && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    padding: "0.7rem 0.9rem",
                    marginBottom: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  {errorMessage}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 2fr) minmax(160px, 0.7fr)",
                  gap: "0.9rem",
                }}
              >
                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "#475569" }}>
                    Grade Title
                  </span>
                  <input
                    type="text"
                    value={customGradeTitle}
                    onChange={(e) => setCustomGradeTitle(e.target.value)}
                    placeholder="e.g. Midterm Project"
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.8rem",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "0.35rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "#475569" }}>
                    Total Marks
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customGradeMaxMarks}
                    onChange={(e) => setCustomGradeMaxMarks(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.8rem",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                    }}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {customGradeEntries.map((entry, index) => (
                  <div
                    key={entry.studentProfileId}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "0.85rem",
                      background: "#fff",
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 160px",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>
                        {entry.studentName}
                      </div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "0.9rem",
                          marginTop: "4px",
                        }}
                      >
                        Roll No: {entry.rollNo}
                      </div>
                    </div>

                    <label style={{ display: "grid", gap: "0.35rem" }}>
                      <span style={{ fontSize: "0.9rem", color: "#475569" }}>
                        Obtained Marks
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.score}
                        onChange={(e) => {
                          const nextScore = e.target.value;
                          setCustomGradeEntries((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, score: nextScore }
                                : item,
                            ),
                          );
                        }}
                        style={{
                          width: "100%",
                          padding: "0.7rem 0.8rem",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                        }}
                      />
                    </label>
                  </div>
                ))}

                {!customGradeEntries.length && (
                  <div style={{ color: "#64748b" }}>
                    No students are available for custom grading.
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={closeCustomGradeDialog}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: "white",
                    color: "#334155",
                    borderRadius: "10px",
                    padding: "0.7rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={() => void saveCustomGrades()}
                  disabled={isSaving || !customGradeEntries.length}
                  style={{
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    borderRadius: "10px",
                    padding: "0.7rem 1rem",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {isSaving ? "Saving..." : "Save Custom Grade"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRow && (
        <div
          className="teacher-modal-overlay"
          onClick={closeStudentDialog}
          role="presentation"
        >
          <div
            className="teacher-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-grades-dialog-title"
            style={{ width: "min(760px, 92vw)" }}
          >
            <div className="teacher-modal-header">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "start",
                }}
              >
                <div>
                  <h3
                    id="student-grades-dialog-title"
                    style={{ margin: 0, color: "#0f172a" }}
                  >
                    {selectedRow.studentName}
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                    Roll No: {selectedRow.rollNo}
                  </p>
                  <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                    Overall: {percentageLabel(selectedRow.percentage)} ·{" "}
                    {gradeLabel(selectedRow.percentage)}
                  </p>
                </div>

                <button
                  onClick={closeStudentDialog}
                  style={{
                    border: "none",
                    background: "#f8fafc",
                    borderRadius: "999px",
                    padding: "0.5rem 0.7rem",
                    cursor: "pointer",
                    color: "#475569",
                  }}
                  aria-label="Close student grade dialog"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>

            <div className="teacher-modal-body">
              {isDetailLoading && <div>Loading student grades...</div>}

              {!isDetailLoading && (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {selectedGrades.map((grade) => {
                    const key = getGradeKey(grade);
                    const isEditing = editingGradeKey === key;
                    const canCreatePendingCustom =
                      grade.gradeType === "custom" && grade.gradeId === null;
                    const canEdit =
                      grade.gradeId !== null || canCreatePendingCustom;

                    return (
                      <div
                        key={key}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "0.9rem",
                          background: "white",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "1rem",
                            alignItems: "start",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>
                              {grade.title}
                            </div>
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: "0.92rem",
                                marginTop: "4px",
                              }}
                            >
                              {grade.gradeType.toUpperCase()} ·{" "}
                              {grade.isGraded
                                ? `Score ${grade.score}${
                                    grade.maxGrade !== null
                                      ? ` / ${grade.maxGrade}`
                                      : ""
                                  }`
                                : "Pending"}
                              {grade.percentage !== null
                                ? ` · ${grade.percentage.toFixed(2)}%`
                                : ""}
                            </div>
                            {!isEditing && grade.feedback && (
                              <div style={{ marginTop: "0.5rem", color: "#334155" }}>
                                {grade.feedback}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() =>
                              isEditing ? cancelInlineEdit() : startInlineEdit(grade)
                            }
                            disabled={!canEdit}
                            style={{
                              border: "1px solid #cbd5e1",
                              background: isEditing ? "#dbeafe" : "white",
                              color: canEdit ? "#1d4ed8" : "#94a3b8",
                              borderRadius: "10px",
                              padding: "0.55rem 0.8rem",
                              cursor: canEdit ? "pointer" : "not-allowed",
                              fontWeight: 700,
                            }}
                          >
                            {isEditing ? "Cancel" : canEdit ? "Edit" : "Not Graded"}
                          </button>
                        </div>

                        {isEditing && (
                          <div
                            style={{
                              marginTop: "0.75rem",
                              display: "grid",
                              gap: "0.65rem",
                            }}
                          >
                            <label style={{ display: "grid", gap: "0.3rem" }}>
                              <span style={{ fontSize: "0.88rem", color: "#475569" }}>
                                Score
                              </span>
                              <input
                                type="number"
                                min="0"
                                max={grade.maxGrade ?? undefined}
                                step="0.01"
                                value={scoreDraft}
                                onChange={(event) => setScoreDraft(event.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "0.65rem 0.8rem",
                                  borderRadius: "10px",
                                  border: "1px solid #cbd5e1",
                                }}
                              />
                            </label>
                            <label style={{ display: "grid", gap: "0.3rem" }}>
                              <span style={{ fontSize: "0.88rem", color: "#475569" }}>
                                Feedback
                              </span>
                              <textarea
                                rows={2}
                                value={feedbackDraft}
                                onChange={(event) =>
                                  setFeedbackDraft(event.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "0.65rem 0.8rem",
                                  borderRadius: "10px",
                                  border: "1px solid #cbd5e1",
                                  resize: "vertical",
                                }}
                              />
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => void saveGrade(grade)}
                                disabled={isSaving}
                                style={{
                                  border: "none",
                                  background: "#2563eb",
                                  color: "white",
                                  borderRadius: "10px",
                                  padding: "0.65rem 0.9rem",
                                  cursor: "pointer",
                                  fontWeight: 700,
                                }}
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={cancelInlineEdit}
                                style={{
                                  border: "1px solid #cbd5e1",
                                  background: "white",
                                  color: "#334155",
                                  borderRadius: "10px",
                                  padding: "0.65rem 0.9rem",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!selectedGrades.length && (
                    <div style={{ color: "#64748b" }}>
                      No grades found for this student.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
