import apiClient from "../config/api.config";

export interface Parent {
  id: number;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
  linkedStudentCount: number;
  linkedStudentIds?: number[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateParentDto {
  name: string;
  username: string;
  password: string;
  studentProfileIds: number[];
  isEnabled?: boolean;
}

export interface UpdateParentDto {
  name?: string;
  isEnabled?: boolean;
}

export interface AddStudentsDto {
  studentProfileIds: number[];
}

export interface RemoveStudentsDto {
  studentProfileIds: number[];
}

interface PaginatedParentsResponse {
  data: Parent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ParentMutationResponse {
  id?: number;
  username?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
  linkedStudentCount?: number;
  linkedStudentIds?: number[];
  createdAt?: string;
  updatedAt?: string;
  success?: boolean;
  message?: string;
  addedCount?: number;
  removedCount?: number;
  totalLinkedCount?: number;
}

interface LinkedStudentsResponse {
  parentId: number;
  linkedStudents: {
    studentProfileId: number;
    studentName: string;
    studentUsername: string;
    linkedAt: string;
  }[];
}

class ParentService {
  private readonly BASE_PATH = "/v1/parent";

  /**
   * Get all parents in the institution
   */
  async listParents(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedParentsResponse> {
    const response = await apiClient.get<PaginatedParentsResponse>(
      `${this.BASE_PATH}/all`,
      {
        params: { page, limit },
      },
    );
    return response.data;
  }

  /**
   * Create a new parent and link them to students
   */
  async createParent(data: CreateParentDto): Promise<ParentMutationResponse> {
    const response = await apiClient.post<ParentMutationResponse>(
      `${this.BASE_PATH}`,
      data,
    );
    return response.data;
  }

  /**
   * Update parent details (name, enabled status)
   */
  async updateParent(
    parentId: number,
    data: UpdateParentDto,
  ): Promise<ParentMutationResponse> {
    const response = await apiClient.put<ParentMutationResponse>(
      `${this.BASE_PATH}/${parentId}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a parent
   */
  async deleteParent(parentId: number): Promise<ParentMutationResponse> {
    const response = await apiClient.delete<ParentMutationResponse>(
      `${this.BASE_PATH}/${parentId}`,
    );
    return response.data;
  }

  /**
   * Add students to a parent
   */
  async addStudents(
    parentId: number,
    data: AddStudentsDto,
  ): Promise<ParentMutationResponse> {
    const response = await apiClient.post<ParentMutationResponse>(
      `${this.BASE_PATH}/${parentId}/students/add`,
      data,
    );
    return response.data;
  }

  /**
   * Remove students from a parent
   */
  async removeStudents(
    parentId: number,
    data: RemoveStudentsDto,
  ): Promise<ParentMutationResponse> {
    const response = await apiClient.post<ParentMutationResponse>(
      `${this.BASE_PATH}/${parentId}/students/remove`,
      data,
    );
    return response.data;
  }

  /**
   * Get all students linked to a parent
   */
  async getLinkedStudents(parentId: number): Promise<LinkedStudentsResponse> {
    const response = await apiClient.get<LinkedStudentsResponse>(
      `${this.BASE_PATH}/${parentId}/students`,
    );
    return response.data;
  }
}

export const parentService = new ParentService();
