import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faArrowLeft,
  faSave,
  faClock,
  faEye,
  faUserGraduate,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { teacherQuizService } from "../../services";
import type {
  CreateTeacherQuizDto,
  QuizAttempt,
  TeacherQuiz,
} from "../../services/teacher-quiz.service";

interface TeacherQuizzesProps {
  offeringId?: number;
}

type QuestionForm = {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
};

const buildEmptyQuestion = (id: number): QuestionForm => ({
  id,
  text: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
});

export default function TeacherQuizzes({ offeringId }: TeacherQuizzesProps) {
  const [view, setView] = useState<"list" | "create" | "submissions">("list");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [quizzes, setQuizzes] = useState<TeacherQuiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<TeacherQuiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    buildEmptyQuestion(Date.now()),
  ]);

  const canUseApi = useMemo(() => Number.isFinite(offeringId), [offeringId]);

  const loadQuizzes = async () => {
    if (!offeringId) {
      setQuizzes([]);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await teacherQuizService.listQuizzes({
        page: 1,
        size: 50,
        offeringId,
        isActive: true,
      });
      setQuizzes(response.data || []);
    } catch (error) {
      console.error("Failed to load quizzes", error);
      setErrorMessage("Could not load quizzes.");
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringId]);

  const loadSubmissions = async (quiz: TeacherQuiz) => {
    try {
      setIsLoading(true);
      setSelectedQuiz(quiz);
      setErrorMessage(null);

      const response = await teacherQuizService.listAttempts({
        quizId: quiz.id,
        page: 1,
        size: 100,
      });

      setAttempts(response.data || []);
      setView("submissions");
    } catch (error) {
      console.error("Failed to load quiz attempts", error);
      setErrorMessage("Could not load quiz submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, buildEmptyQuestion(Date.now())]);
  };

  const removeQuestion = (questionId: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const updateQuestion = (
    questionId: number,
    updater: (current: QuestionForm) => QuestionForm,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? updater(q) : q)),
    );
  };

  const handleCreateQuiz = async () => {
    if (!offeringId) return;

    const sanitizedQuestions = questions
      .map((q, index) => ({
        id: `q${index + 1}`,
        question: q.text.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctOptionIndex: q.correctOptionIndex,
      }))
      .filter((q) => q.question.length > 0);

    if (
      !title.trim() ||
      !startsAt ||
      !endsAt ||
      sanitizedQuestions.length === 0
    ) {
      setErrorMessage(
        "Please fill title, schedule, and at least one valid question.",
      );
      return;
    }

    if (sanitizedQuestions.some((q) => q.options.some((opt) => !opt))) {
      setErrorMessage("Each question must have all options filled.");
      return;
    }

    const payload: CreateTeacherQuizDto = {
      offeringId,
      title: title.trim(),
      startsAt,
      endsAt,
      maxAttempts,
      questions: sanitizedQuestions,
    };

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await teacherQuizService.createQuiz(payload);

      setTitle("");
      setStartsAt("");
      setEndsAt("");
      setMaxAttempts(1);
      setQuestions([buildEmptyQuestion(Date.now())]);
      setView("list");
      await loadQuizzes();
    } catch (error) {
      console.error("Failed to create quiz", error);
      setErrorMessage("Failed to create quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canUseApi) {
    return (
      <div className="card settings-container" style={{ padding: "1.2rem" }}>
        <p style={{ marginTop: 0 }}>Select a course to manage quizzes.</p>
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
            style={{ marginBottom: "1.2rem", background: "#f3f4f6" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Quizzes
          </button>

          <div
            className="card"
            style={{ padding: "1.4rem", borderLeft: "5px solid #0066ff" }}
          >
            <h3
              className="card-title"
              style={{ fontSize: "1.2rem", fontWeight: "bold" }}
            >
              Create MCQ Quiz
            </h3>

            <div style={{ margin: "1rem 0", display: "grid", gap: "0.9rem" }}>
              <div>
                <label className="auth-label">Quiz Title</label>
                <input
                  className="auth-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="password-row">
                <div>
                  <label className="auth-label">Starts At</label>
                  <input
                    className="auth-input"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="auth-label">Ends At</label>
                  <input
                    className="auth-input"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="auth-label">Max Attempts</label>
                  <input
                    className="auth-input"
                    type="number"
                    min={1}
                    value={maxAttempts}
                    onChange={(e) =>
                      setMaxAttempts(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </div>
              </div>
            </div>

            {questions.map((q, qIndex) => (
              <div
                key={q.id}
                className="question-block"
                style={{
                  background: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.8rem",
                  }}
                >
                  <h4 style={{ margin: 0, color: "#1e293b" }}>
                    Question {qIndex + 1}
                  </h4>
                  <button
                    className="btn"
                    style={{ color: "#ef4444", background: "none" }}
                    onClick={() => removeQuestion(q.id)}
                    disabled={questions.length === 1}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                <input
                  className="auth-input"
                  placeholder="Enter your question text"
                  value={q.text}
                  onChange={(e) =>
                    updateQuestion(q.id, (current) => ({
                      ...current,
                      text: e.target.value,
                    }))
                  }
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.8rem",
                    marginTop: "0.8rem",
                  }}
                >
                  {q.options.map((opt, oIndex) => (
                    <div
                      key={oIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "white",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <input
                        type="radio"
                        checked={q.correctOptionIndex === oIndex}
                        onChange={() =>
                          updateQuestion(q.id, (current) => ({
                            ...current,
                            correctOptionIndex: oIndex,
                          }))
                        }
                      />
                      <input
                        className="auth-input"
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) =>
                          updateQuestion(q.id, (current) => {
                            const nextOptions = [...current.options];
                            nextOptions[oIndex] = e.target.value;
                            return { ...current, options: nextOptions };
                          })
                        }
                        style={{
                          border: "none",
                          padding: "5px",
                          marginBottom: 0,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                gap: "0.8rem",
                marginTop: "1.3rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="btn"
                style={{ border: "1px solid #d1d5db" }}
                onClick={addQuestion}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Question
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateQuiz}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faSave} />{" "}
                {isSubmitting ? "Publishing..." : "Publish Quiz"}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "submissions" && selectedQuiz && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <button
              className="btn"
              onClick={() => setView("list")}
              style={{ background: "#fff", border: "1px solid #e5e7eb" }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
            <div style={{ textAlign: "right" }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: "#0f172a" }}>
                {selectedQuiz.title}
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.9rem",
                  margin: "4px 0 0",
                }}
              >
                Student Results Overview
              </p>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
          >
            {isLoading && <div>Loading submissions...</div>}

            {!isLoading &&
              attempts.map((res) => {
                const percentage = res.bestGrade?.percentage || 0;
                const status =
                  percentage >= 80
                    ? { color: "#10b981", bg: "#d1fae5", label: "Excellent" }
                    : percentage >= 50
                      ? { color: "#f59e0b", bg: "#fef3c7", label: "Average" }
                      : {
                          color: "#ef4444",
                          bg: "#fee2e2",
                          label: "Needs Improvement",
                        };

                return (
                  <div
                    key={res.attemptId}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem",
                      borderRadius: "12px",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUserGraduate}
                          style={{ marginRight: "8px" }}
                        />
                        {res.studentName || "Student"}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          marginTop: "4px",
                          fontSize: "0.82rem",
                          color: "#64748b",
                        }}
                      >
                        <span>{res.rollNo || "N/A"}</span>
                        <span>
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            style={{ marginRight: "5px" }}
                          />
                          {res.submittedAt
                            ? new Date(res.submittedAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          color: status.color,
                        }}
                      >
                        {res.bestGrade?.score ?? 0}
                        <span style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                          /
                          {res.bestGrade?.maxGrade ??
                            res.totalQuestionsSnapshot ??
                            0}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: status.bg,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </div>
                    </div>
                  </div>
                );
              })}

            {!isLoading && !attempts.length && (
              <div className="card" style={{ padding: "1rem" }}>
                No quiz submissions found yet.
              </div>
            )}
          </div>
        </div>
      )}

      {view === "list" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}
            >
              Available Quizzes
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => setView("create")}
            >
              <FontAwesomeIcon icon={faPlus} /> Create New Quiz
            </button>
          </div>

          <div className="activity-list">
            {isLoading && <div>Loading quizzes...</div>}

            {!isLoading &&
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1.1rem",
                    borderRadius: "12px",
                    background: "white",
                    border: "1px solid #f1f5f9",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: "1rem",
                        color: "#1e293b",
                      }}
                    >
                      {quiz.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.84rem",
                        color: "#64748b",
                        marginTop: "4px",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faClock}
                        style={{ marginRight: "5px" }}
                      />
                      {quiz.totalQuestions || 0} Questions •{" "}
                      {quiz.totalSubmissions || 0} Submissions
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => void loadSubmissions(quiz)}
                    style={{ borderRadius: "10px", padding: "0.6rem 1.1rem" }}
                  >
                    <FontAwesomeIcon icon={faEye} /> View Submissions
                  </button>
                </div>
              ))}

            {!isLoading && !quizzes.length && (
              <div className="card" style={{ padding: "1rem" }}>
                No quizzes found for this course yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
