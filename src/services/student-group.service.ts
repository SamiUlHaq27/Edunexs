import apiClient from "../config/api.config";
import { ListFiltersDto } from "../types";

export interface StudentGroup {
  id: number;
  name: string;
  isActive: boolean;
  institutionPrefix: string;
  studentProfileIds: number[];
  studentIds: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStudentGroupDto {
  name: string;
  studentProfileIds: number[];
}

export interface UpdateStudentGroupDto {
  groupId: number;
  name?: string;
  isActive?: boolean;
  studentProfileIds?: number[];
}

interface PaginatedStudentGroupsResponse {
  data: StudentGroup[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface DeleteStudentGroupResponse {
  success: boolean;
  message: string;
}

class StudentGroupService {
  private readonly BASE_PATH = "/v1/student/group";

  async getStudentGroups(
    filters?: ListFiltersDto,
  ): Promise<PaginatedStudentGroupsResponse> {
    const response = await apiClient.post<PaginatedStudentGroupsResponse>(
      `${this.BASE_PATH}/all`,
      filters || { page: 1, size: 10, filters: {} },
    );
    return response.data;
  }

  async createStudentGroup(data: CreateStudentGroupDto): Promise<StudentGroup> {
    const response = await apiClient.post<StudentGroup>(`${this.BASE_PATH}`, data);
    return response.data;
  }

  async updateStudentGroup(data: UpdateStudentGroupDto): Promise<StudentGroup> {
    const response = await apiClient.put<StudentGroup>(`${this.BASE_PATH}`, data);
    return response.data;
  }

  async deleteStudentGroup(groupId: number): Promise<DeleteStudentGroupResponse> {
    const response = await apiClient.delete<DeleteStudentGroupResponse>(
      `${this.BASE_PATH}`,
      {
        data: { groupId },
      },
    );
    return response.data;
  }
}

export const studentGroupService = new StudentGroupService();
