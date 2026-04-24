import apiClient from "../config/api.config";

export interface StudentAssessmentReportFilters {
  page: number;
  size: number;
  offeringId?: number;
  assessmentType?: "assignment" | "quiz" | "custom";
}

export interface StudentAssessmentGradeItem {
  id: number;
  gradeType: "assignment" | "quiz" | "custom";
  assessmentId?: number;
  assessmentTitle?: string;
  score: number;
  maxGrade?: number;
  percentage?: number;
  feedback?: string;
  gradedAt?: string;
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

class StudentAssessmentService {
  private readonly BASE_PATH = "/v1/assessment";

  async getGradeReport(
    filters: StudentAssessmentReportFilters,
  ): Promise<PaginatedResponse<StudentAssessmentGradeItem>> {
    const response = await apiClient.post<PaginatedResponse<StudentAssessmentGradeItem>>(
      `${this.BASE_PATH}/report`,
      filters,
    );
    return response.data;
  }
}

export const studentAssessmentService = new StudentAssessmentService();
export default studentAssessmentService;
