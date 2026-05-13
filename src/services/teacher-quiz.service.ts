import apiClient from "../config/api.config";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface TeacherQuiz {
  id: number;
  offering?: {
    id?: number;
    sectionName?: string;
    courseName?: string;
  };
  title: string;
  startsAt: string;
  endsAt: string;
  maxAttempts: number;
  totalQuestions?: number;
  totalSubmissions?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAttempt {
  attemptId: number;
  studentProfileId: number;
  studentName?: string;
  rollNo?: string;
  totalQuestionsSnapshot?: number;
  bestGrade?: {
    score: number;
    maxGrade: number;
    percentage: number;
    updatedAt?: string;
  } | null;
  submittedAt?: string;
}

export interface CreateTeacherQuizDto {
  offeringId: number;
  title: string;
  startsAt: string;
  endsAt: string;
  maxAttempts: number;
  questions: QuizQuestion[];
}

export interface UpdateTeacherQuizDto {
  quizId: number;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  maxAttempts?: number;
  questions?: QuizQuestion[];
  isActive?: boolean;
}

export interface ListTeacherQuizzesDto {
  page: number;
  size: number;
  offeringId?: number;
  title?: string;
  isActive?: boolean;
}

export interface ListQuizAttemptsDto {
  quizId: number;
  page: number;
  size: number;
  studentProfileId?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface QuizAttemptListResponse {
  quiz?: {
    id: number;
    title: string;
    startsAt: string;
    endsAt: string;
    maxAttempts: number;
    maxGrade: number;
  };
  data: QuizAttempt[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

class TeacherQuizService {
  private readonly BASE_PATH = "/v1/quiz/teacher";

  async createQuiz(data: CreateTeacherQuizDto): Promise<TeacherQuiz> {
    try {
      const response = await apiClient.post<TeacherQuiz>(
        `${this.BASE_PATH}/create`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateQuiz(data: UpdateTeacherQuizDto): Promise<TeacherQuiz> {
    try {
      const response = await apiClient.post<TeacherQuiz>(
        `${this.BASE_PATH}/update`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async listQuizzes(
    filters: ListTeacherQuizzesDto,
  ): Promise<PaginatedResponse<TeacherQuiz>> {
    try {
      const response = await apiClient.post<PaginatedResponse<TeacherQuiz>>(
        `${this.BASE_PATH}/all`,
        filters,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async listAttempts(
    filters: ListQuizAttemptsDto,
  ): Promise<QuizAttemptListResponse> {
    try {
      const response = await apiClient.post<QuizAttemptListResponse>(
        `${this.BASE_PATH}/submissions`,
        filters,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteQuiz(quizId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.BASE_PATH}/delete`,
        { quizId },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const teacherQuizService = new TeacherQuizService();
export default teacherQuizService;
