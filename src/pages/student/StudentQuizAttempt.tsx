import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { studentQuizService, type StudentQuizDetail } from "../../services";

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const maybeResponse = error as {
      response?: { data?: { message?: string | string[] } };
    };

    const message = maybeResponse.response?.data?.message;
    if (Array.isArray(message)) {
      return message[0] || "Something went wrong";
    }
    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

function formatCountdown(endsAt: string): string {
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const ms = Math.max(end - now, 0);

  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function getRemainingMs(endsAt: string): number {
  const end = new Date(endsAt).getTime();
  return Math.max(end - Date.now(), 0);
}

export default function StudentQuizAttempt() {
  const navigate = useNavigate();
  const location = useLocation();

  const quizId =
    typeof location.state?.quizId === "number" ? location.state.quizId : null;
  const offeringId =
    typeof location.state?.offeringId === "number"
      ? location.state.offeringId
      : null;
  const activeTab =
    location.state?.activeTab === "assignments" ||
    location.state?.activeTab === "quizzes" ||
    location.state?.activeTab === "attendance" ||
    location.state?.activeTab === "grades"
      ? location.state.activeTab
      : "quizzes";

  const [quizDetail, setQuizDetail] = useState<StudentQuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());
  const hasAutoSubmittedRef = useRef(false);
  const hadTimeRemainingOnLoadRef = useRef<boolean | null>(null);

  useEffect(() => {
    hasAutoSubmittedRef.current = false;
    hadTimeRemainingOnLoadRef.current = null;
  }, [quizId]);

  useEffect(() => {
    if (!quizId) {
      setIsLoading(false);
      setError("Quiz context is missing.");
      return;
    }

    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await studentQuizService.getQuizDetail(quizId);
        hadTimeRemainingOnLoadRef.current = getRemainingMs(response.endsAt) > 0;
        setQuizDetail(response);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuiz();
  }, [quizId]);

  const questions = quizDetail?.questions || [];
  const currentQuestion = questions[currentQ];

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentQ + 1) / questions.length) * 100;
  }, [currentQ, questions.length]);

  const selectedValue = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  const handleSelect = (idx: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }));
  };

  const handleSubmitQuiz = async (forceSubmit = false) => {
    if (!quizDetail || !quizId) {
      return;
    }

    const payload = Object.entries(answers).map(
      ([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex,
      }),
    );

    if (!forceSubmit && payload.length === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await studentQuizService.submitQuizAttempt({
        quizId,
        answers: payload,
      });

      navigate("/student/courses", {
        state: offeringId ? { offeringId, activeTab } : { activeTab },
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      return;
    }

    void handleSubmitQuiz();
  };

  useEffect(() => {
    if (!quizDetail?.endsAt) {
      return;
    }

    const interval = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [quizDetail?.endsAt]);

  useEffect(() => {
    if (!quizDetail?.endsAt || isSubmitting) {
      return;
    }

    // Only auto-submit when timer expires during an active attempt.
    if (hadTimeRemainingOnLoadRef.current !== true) {
      return;
    }

    const remainingMs = getRemainingMs(quizDetail.endsAt);
    if (remainingMs > 0 || hasAutoSubmittedRef.current) {
      return;
    }

    hasAutoSubmittedRef.current = true;
    void handleSubmitQuiz(true);
  }, [quizDetail?.endsAt, nowTick, isSubmitting]);

  if (isLoading) {
    return <div className="card settings-container">Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className="card settings-container">
        <p style={{ color: "#b91c1c" }}>{error}</p>
        <button
          className="btn"
          onClick={() =>
            navigate("/student/courses", {
              state: offeringId ? { offeringId, activeTab } : { activeTab },
            })
          }
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Courses
        </button>
      </div>
    );
  }

  if (!quizDetail || !currentQuestion) {
    return (
      <div className="card settings-container">
        <p>No quiz questions found.</p>
      </div>
    );
  }

  if (!quizDetail.canAttempt) {
    return (
      <div className="card settings-container">
        <h3 style={{ marginTop: 0 }}>{quizDetail.title}</h3>
        <p style={{ color: "#6b7280" }}>
          This quiz is currently {quizDetail.window} or attempt limit is
          reached.
        </p>
        <p style={{ color: "#6b7280" }}>
          Attempts used: {quizDetail.attemptsUsed}/{quizDetail.maxAttempts}
        </p>
        <button
          className="btn"
          onClick={() =>
            navigate("/student/courses", {
              state: offeringId ? { offeringId, activeTab } : { activeTab },
            })
          }
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="quiz-attempt-header">
        <h3 className="card-title quiz-attempt-title">{quizDetail.title}</h3>
        <div className="quiz-timer">
          <FontAwesomeIcon icon={faClock} />{" "}
          {formatCountdown(quizDetail.endsAt)}
        </div>
      </div>

      <p className="quiz-attempt-info">
        Attempts left: {quizDetail.attemptsRemaining} / {quizDetail.maxAttempts}
      </p>

      <div className="quiz-progress">
        <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="question-block quiz-attempt-question">
        <h4>
          Q{currentQ + 1}: {currentQuestion.question}
        </h4>

        <div className="quiz-options-grid">
          {currentQuestion.options.map((opt, idx) => (
            <div
              key={idx}
              className={`quiz-option ${selectedValue === idx ? "selected" : ""}`}
              onClick={() => handleSelect(idx)}
            >
              <div className="quiz-option-radio">
                {selectedValue === idx && (
                  <div className="quiz-option-radio-dot" />
                )}
              </div>
              {opt}
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "#b91c1c", marginTop: "1rem" }}>{error}</p>}

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          className="btn"
          onClick={() => setCurrentQ((prev) => Math.max(prev - 1, 0))}
          disabled={currentQ === 0 || isSubmitting}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Previous
        </button>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {currentQ === questions.length - 1
            ? isSubmitting
              ? "Submitting..."
              : "Submit Quiz"
            : "Next Question"}{" "}
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
}
