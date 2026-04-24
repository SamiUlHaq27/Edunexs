import apiClient from "../config/api.config";

export interface StudentAttendanceFilters {
  page: number;
  size: number;
  offeringId?: number;
  fromDate?: string;
  toDate?: string;
  periodSlot?: string;
}

export interface StudentAttendanceItem {
  id: number;
  offeringId: number;
  sectionName?: string;
  courseCode?: string;
  courseTitle?: string;
  studentProfileId: number;
  studentName?: string;
  rollNo?: string;
  attendanceDate: string;
  periodSlot: string;
  status: "present" | "absent";
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

class StudentAttendanceService {
  private readonly BASE_PATH = "/v1/attendance/student";

  async listAttendance(
    filters: StudentAttendanceFilters,
  ): Promise<PaginatedResponse<StudentAttendanceItem>> {
    const response = await apiClient.post<
      PaginatedResponse<StudentAttendanceItem>
    >(`${this.BASE_PATH}/all`, filters);
    return response.data;
  }
}

export const studentAttendanceService = new StudentAttendanceService();
export default studentAttendanceService;
