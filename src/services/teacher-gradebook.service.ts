import apiClient from "../config/api.config";

export type TeacherGradeType = "assignment" | "quiz" | "custom";

export interface TeacherGradebookRow {
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

export interface TeacherGradebookResponse {
  offering: {
    id: number;
    sectionName?: string | null;
    courseName?: string | null;
  };
  data: TeacherGradebookRow[];
}

export interface TeacherGradeView {
  gradeId: number | null;
  gradeType: TeacherGradeType;
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

export interface TeacherStudentGradesResponse {
  offering: {
    id: number;
    sectionName?: string | null;
    courseName?: string | null;
  };
  student: {
    studentProfileId: number;
    studentId?: number | null;
    studentName: string;
    rollNo: string;
  };
  summary: {
    totalGrades: number;
    pendingGrades?: number;
    assessmentCount?: number;
    averagePercentage: number | null;
    averagesByType: {
      assignment: number | null;
      quiz: number | null;
      custom: number | null;
    };
  };
  data: TeacherGradeView[];
}

export interface CreateCustomGradeDto {
  offeringId: number;
  studentProfileId: number;
  score: number;
  feedback?: string;
}

export interface CreateCustomGradesDto {
  offeringId: number;
  title: string;
  maxGrade: number;
  grades: Array<{
    studentProfileId: number;
    score: number;
    feedback?: string;
  }>;
}

export interface UpdateTeacherGradeDto {
  gradeId: number;
  score: number;
  feedback?: string;
}

class TeacherGradebookService {
  private readonly BASE_PATH = "/v1/assessment/teacher";

  async getGradebook(offeringId: number): Promise<TeacherGradebookResponse> {
    const response = await apiClient.post<TeacherGradebookResponse>(
      `${this.BASE_PATH}/gradebook`,
      { offeringId },
    );
    return response.data;
  }

  async getStudentGrades(
    offeringId: number,
    studentProfileId: number,
  ): Promise<TeacherStudentGradesResponse> {
    const response = await apiClient.post<TeacherStudentGradesResponse>(
      `${this.BASE_PATH}/student-grades`,
      { offeringId, studentProfileId },
    );
    return response.data;
  }

  async createCustomGrade(data: CreateCustomGradeDto) {
    const response = await apiClient.post(
      `${this.BASE_PATH}/custom-grade`,
      data,
    );
    return response.data;
  }

  async createCustomGrades(data: CreateCustomGradesDto) {
    const response = await apiClient.post(
      `${this.BASE_PATH}/custom-grades`,
      data,
    );
    return response.data;
  }

  async updateGrade(data: UpdateTeacherGradeDto) {
    const response = await apiClient.post(
      `${this.BASE_PATH}/grade/update`,
      data,
    );
    return response.data;
  }
}

export const teacherGradebookService = new TeacherGradebookService();
export default teacherGradebookService;
