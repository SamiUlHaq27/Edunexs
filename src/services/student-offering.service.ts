import apiClient from "../config/api.config";

export interface StudentOfferingSummary {
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

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

class StudentOfferingService {
  private readonly BASE_PATH = "/v1/section/offering";

  async getMyOfferings(params?: {
    page?: number;
    size?: number;
    filters?: {
      isActive?: boolean;
      sectionId?: number;
      courseId?: number;
      name?: string;
    };
  }): Promise<PaginatedResponse<StudentOfferingSummary>> {
    const response = await apiClient.post<
      PaginatedResponse<StudentOfferingSummary>
    >(`${this.BASE_PATH}/all`, {
      page: params?.page ?? 1,
      size: params?.size ?? 200,
      filters: {
        isActive: true,
        ...(params?.filters || {}),
      },
    });
    return response.data;
  }
}

export const studentOfferingService = new StudentOfferingService();
export default studentOfferingService;
