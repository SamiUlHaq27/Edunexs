import apiClient from "../config/api.config";

export interface StudentAssessmentReportFilters {
  page: number;
  size: number;
  offeringId?: number;
  studentProfileId?: number;
  assessmentType?: "assignment" | "quiz" | "custom";
}

export interface StudentAssessmentGradeItem {
  gradeId: number;
  gradeType: "assignment" | "quiz" | "custom";
  assessmentId?: number;
  title?: string | null;
  score: number;
  maxGrade?: number | null;
  percentage?: number | null;
  feedback?: string | null;
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

class StudentAssessmentService {
  private readonly BASE_PATH = "/v1/assessment";

  async getGradeReport(
    filters: StudentAssessmentReportFilters,
  ): Promise<PaginatedResponse<StudentAssessmentGradeItem>> {
    const response = await apiClient.post<
      PaginatedResponse<StudentAssessmentGradeItem>
    >(`${this.BASE_PATH}/report`, filters);
    return response.data;
  }
}

export const studentAssessmentService = new StudentAssessmentService();
export default studentAssessmentService;
