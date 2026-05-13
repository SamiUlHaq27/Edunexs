import apiClient from "../config/api.config";
import { ListFiltersDto } from "../types";

// Teacher DTOs
export interface CreateTeacherDto {
  name: string;
  username: string;
  password: string;
  recoveryEmail?: string;
  profilePicture?: File;
}

export interface UpdateTeacherDto {
  teacherId: number;
  name?: string;
  username?: string;
  password?: string;
  recoveryEmail?: string;
  isActive?: boolean;
  profilePicture?: File;
}

export interface DeleteTeacherDto {
  teacherId: number;
}

// Teacher Interface (Response from Backend)
export interface Teacher {
  id: number;
  name: string;
  recoveryEmail?: string;
  username?: string;
  password?: string;
  role?: string;
  isActive: boolean;
  institutionPrefix?: string;
  profilePictureFileId?: string;
  profilePicture?: {
    id: string;
    fileId: string;
    publicUrl: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedTeachersResponse {
  data: Teacher[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

type CreateTeacherResponse = Teacher;

type UpdateTeacherResponse = Teacher;

interface DeleteTeacherResponse {
  success: boolean;
  message: string;
}

class TeacherService {
  private readonly BASE_PATH = "/v1/teacher";

  /**
   * Fetch all teachers with pagination and filters
   */
  async getTeachers(
    filters?: ListFiltersDto,
  ): Promise<PaginatedTeachersResponse> {
    try {
      const response = await apiClient.post<PaginatedTeachersResponse>(
        `${this.BASE_PATH}/all`,
        filters || { page: 1, size: 10, filters: {} },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new teacher
   */
  async createTeacher(data: CreateTeacherDto): Promise<CreateTeacherResponse> {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("username", data.username);
      formData.append("password", data.password);
      if (data.recoveryEmail) {
        formData.append("recoveryEmail", data.recoveryEmail);
      }
      if (data.profilePicture) {
        formData.append("profilePicture", data.profilePicture);
      }

      const response = await apiClient.post<CreateTeacherResponse>(
        `${this.BASE_PATH}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a teacher
   */
  async updateTeacher(data: UpdateTeacherDto): Promise<UpdateTeacherResponse> {
    try {
      const formData = new FormData();
      formData.append("teacherId", data.teacherId.toString());
      if (data.name !== undefined) {
        formData.append("name", data.name);
      }
      if (data.username !== undefined) {
        formData.append("username", data.username);
      }
      if (data.password !== undefined) {
        formData.append("password", data.password);
      }
      if (data.recoveryEmail !== undefined) {
        formData.append("recoveryEmail", data.recoveryEmail);
      }
      if (data.isActive !== undefined) {
        formData.append("isActive", data.isActive.toString());
      }
      if (data.profilePicture) {
        formData.append("profilePicture", data.profilePicture);
      }

      const response = await apiClient.put<UpdateTeacherResponse>(
        `${this.BASE_PATH}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete (hard delete) a teacher
   */
  async deleteTeacher(teacherId: number): Promise<DeleteTeacherResponse> {
    try {
      const response = await apiClient.delete<DeleteTeacherResponse>(
        `${this.BASE_PATH}`,
        {
          data: { teacherId },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle teacher activation status (soft delete/deactivate)
   */
  async toggleStatus(
    teacherId: number,
    isActive: boolean,
  ): Promise<UpdateTeacherResponse> {
    try {
      return await this.updateTeacher({ teacherId, isActive });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate a teacher (soft delete)
   */
  async deactivateTeacher(teacherId: number): Promise<UpdateTeacherResponse> {
    try {
      return await this.toggleStatus(teacherId, false);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Activate a teacher
   */
  async activateTeacher(teacherId: number): Promise<UpdateTeacherResponse> {
    try {
      return await this.toggleStatus(teacherId, true);
    } catch (error) {
      throw error;
    }
  }
}

export const teacherService = new TeacherService();
