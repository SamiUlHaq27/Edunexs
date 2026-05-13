import apiClient from "../config/api.config";
import type { StudentOfferingSummary } from "./student-offering.service";

export interface StudentDashboardActiveCourseSummary extends StudentOfferingSummary {
  pendingAssignments: number;
  pendingQuizzes: number;
  attendancePercentage: number;
}

export interface StudentDashboardSummaryResponse {
  activeCourses: StudentDashboardActiveCourseSummary[];
  previousCourses: StudentOfferingSummary[];
}

class StudentDashboardService {
  private readonly BASE_PATH = "/v1/section/offering";

  async getSummary(): Promise<StudentDashboardSummaryResponse> {
    const response = await apiClient.post<StudentDashboardSummaryResponse>(
      `${this.BASE_PATH}/student-dashboard-summary`,
      {},
    );
    return response.data;
  }
}

export const studentDashboardService = new StudentDashboardService();
export default studentDashboardService;
