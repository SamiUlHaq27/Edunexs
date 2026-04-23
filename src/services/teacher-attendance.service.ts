import apiClient from "../config/api.config";

export type AttendanceStatus = "present" | "absent";

export interface MarkAttendanceRecordDto {
  studentProfileId: number;
  status: AttendanceStatus;
}

export interface MarkAttendanceDto {
  offeringId: number;
  attendanceDate: string;
  periodSlot: string;
  records: MarkAttendanceRecordDto[];
}

export interface ListTeacherAttendanceDto {
  page: number;
  size: number;
  offeringId: number;
  attendanceDate?: string;
  fromDate?: string;
  toDate?: string;
  periodSlot?: string;
  studentProfileId?: number;
}

export interface TeacherAttendanceReportDto {
  offeringId: number;
  fromDate?: string;
  toDate?: string;
  periodSlot?: string;
}

export interface TeacherAttendanceRecord {
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
  status: AttendanceStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherAttendanceReport {
  offeringId: number;
  totalStudents: number;
  data: Array<{
    studentProfileId: number;
    studentId?: number;
    studentName?: string;
    rollNo?: string;
    presentCount: number;
    absentCount: number;
    totalMarked: number;
    attendancePercentage: number;
  }>;
}

export interface MarkAttendanceResponse {
  offeringId: number;
  attendanceDate: string;
  periodSlot: string;
  totalMarked: number;
  data: TeacherAttendanceRecord[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

class TeacherAttendanceService {
  private readonly BASE_PATH = "/v1/attendance/teacher";

  async markAttendance(
    data: MarkAttendanceDto,
  ): Promise<MarkAttendanceResponse> {
    try {
      const response = await apiClient.post<MarkAttendanceResponse>(
        `${this.BASE_PATH}/mark`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async listAttendance(
    filters: ListTeacherAttendanceDto,
  ): Promise<PaginatedResponse<TeacherAttendanceRecord>> {
    try {
      const response = await apiClient.post<
        PaginatedResponse<TeacherAttendanceRecord>
      >(`${this.BASE_PATH}/all`, filters);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAttendanceReport(
    filters: TeacherAttendanceReportDto,
  ): Promise<TeacherAttendanceReport> {
    try {
      const response = await apiClient.post<TeacherAttendanceReport>(
        `${this.BASE_PATH}/report`,
        filters,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const teacherAttendanceService = new TeacherAttendanceService();
export default teacherAttendanceService;
