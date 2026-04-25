import apiClient from "../config/api.config";

export interface StudentQuizGradeFilters {
  page: number;
  size: number;
  offeringId?: number;
}

export interface StudentQuizGradeItem {
  quizId: number;
  title: string;
  startsAt: string;
  endsAt: string;
  maxAttempts: number;
  attemptsUsed: number;
  maxGrade: number;
  bestScore: number | null;
  percentage: number | null;
  gradedAt?: string | null;
  offering?: {
    id?: number;
    sectionName?: string;
    courseName?: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface StudentQuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface StudentQuizDetail {
  quizId: number;
  title: string;
  startsAt: string;
  endsAt: string;
  offering?: {
    id?: number;
    sectionName?: string;
    courseName?: string;
  };
  totalQuestions: number;
  maxAttempts: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  canAttempt: boolean;
  serverNow: string;
  window: "upcoming" | "active" | "closed";
  questions: StudentQuizQuestion[];
}

export interface SubmitStudentQuizAnswer {
  questionId: string;
  selectedOptionIndex: number;
}

export interface SubmitStudentQuizResponse {
  attemptId: number;
  quiz: {
    id: number;
    title: string;
    startsAt: string;
    endsAt: string;
  };
  submittedAt: string;
  score: number;
  maxGrade: number;
  percentage: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  bestScore: number;
  message?: string;
}

class StudentQuizService {
  private readonly BASE_PATH = "/v1/quiz/student";

  async listQuizGrades(
    filters: StudentQuizGradeFilters,
  ): Promise<PaginatedResponse<StudentQuizGradeItem>> {
    const response = await apiClient.post<
      PaginatedResponse<StudentQuizGradeItem>
    >(`${this.BASE_PATH}/grades`, filters);
    return response.data;
  }

  async getQuizDetail(quizId: number): Promise<StudentQuizDetail> {
    const response = await apiClient.post<StudentQuizDetail>(
      `${this.BASE_PATH}/detail`,
      { quizId },
    );
    return response.data;
  }

  async submitQuizAttempt(input: {
    quizId: number;
    answers: SubmitStudentQuizAnswer[];
  }): Promise<SubmitStudentQuizResponse> {
    const response = await apiClient.post<SubmitStudentQuizResponse>(
      `${this.BASE_PATH}/submit`,
      input,
    );
    return response.data;
  }
}

export const studentQuizService = new StudentQuizService();
export default studentQuizService;
