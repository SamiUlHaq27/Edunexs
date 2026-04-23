import apiClient from "../config/api.config";

export interface TeacherOfferingSummary {
  id: number;
  sectionId: number;
  sectionName?: string;
  courseId: number;
  courseCode?: string;
  courseTitle?: string;
  teacherId: number;
  teacherName?: string;
  teacherUsername?: string;
  institutionPrefix?: string;
  isActive: boolean;
  studentProfileIds: number[];
  studentIds: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ListMyOfferingsDto {
  page: number;
  size: number;
  filters?: {
    sectionId?: number;
    courseId?: number;
    isActive?: boolean;
    name?: string;
  };
}

export interface TeacherDashboardSnapshot {
  attendanceReport: unknown;
  assignments: {
    items: unknown[];
    total: number;
  };
  quizzes: {
    items: unknown[];
    total: number;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

class TeacherDashboardService {
  private readonly OFFERING_BASE_PATH = "/v1/section/offering";
  private readonly ATTENDANCE_BASE_PATH = "/v1/attendance/teacher";
  private readonly ASSIGNMENT_BASE_PATH = "/v1/assignment/teacher";
  private readonly QUIZ_BASE_PATH = "/v1/quiz/teacher";

  async getMyOfferings(
    params: Partial<ListMyOfferingsDto> = {},
  ): Promise<PaginatedResponse<TeacherOfferingSummary>> {
    try {
      const payload: ListMyOfferingsDto = {
        page: params.page ?? 1,
        size: params.size ?? 200,
        filters: {
          isActive: true,
          ...(params.filters || {}),
        },
      };

      const response = await apiClient.post<
        PaginatedResponse<TeacherOfferingSummary>
      >(`${this.OFFERING_BASE_PATH}/all`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSnapshot(input: {
    offeringId: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<TeacherDashboardSnapshot> {
    try {
      const [attendanceReport, assignments, quizzes] = await Promise.all([
        apiClient.post(`${this.ATTENDANCE_BASE_PATH}/report`, {
          offeringId: input.offeringId,
          fromDate: input.fromDate,
          toDate: input.toDate,
        }),
        apiClient.post<PaginatedResponse<unknown>>(
          `${this.ASSIGNMENT_BASE_PATH}/all`,
          {
            page: 1,
            size: 10,
            offeringId: input.offeringId,
            isActive: true,
          },
        ),
        apiClient.post<PaginatedResponse<unknown>>(
          `${this.QUIZ_BASE_PATH}/all`,
          {
            page: 1,
            size: 10,
            offeringId: input.offeringId,
            isActive: true,
          },
        ),
      ]);

      return {
        attendanceReport: attendanceReport.data,
        assignments: {
          items: assignments.data.data,
          total: assignments.data.total,
        },
        quizzes: {
          items: quizzes.data.data,
          total: quizzes.data.total,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

export const teacherDashboardService = new TeacherDashboardService();
export default teacherDashboardService;
