import apiClient from "../config/api.config";
import { ListFiltersDto } from "../types";

export interface Student {
  id: number;
  studentProfileId: number;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
  recoveryEmail?: string;
  profilePictureFileId?: string;
  profilePicture?: {
    id: string;
    fileId: string;
    publicUrl: string;
  } | null;
  rollNo: string;
  grade: string;
  institutionPrefix: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStudentDto {
  name: string;
  password: string;
  rollNo: string;
  grade: string;
  recoveryEmail?: string;
  otp?: string;
  profilePicture?: File;
}

export interface UpdateStudentDto {
  studentId: number;
  name?: string;
  password?: string;
  rollNo?: string;
  grade?: string;
  recoveryEmail?: string;
  isActive?: boolean;
  profilePicture?: File;
}

interface PaginatedStudentsResponse {
  data: Student[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface StudentMutationResponse {
  success?: boolean;
  message?: string;
  id?: number;
  studentProfileId?: number;
  username?: string;
  name?: string;
  role?: string;
  isActive?: boolean;
  recoveryEmail?: string;
  profilePictureFileId?: string;
  profilePicture?: {
    id: string;
    fileId: string;
    publicUrl: string;
  } | null;
  rollNo?: string;
  grade?: string;
  institutionPrefix?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DeleteStudentResponse {
  success: boolean;
  message: string;
}

class StudentService {
  private readonly BASE_PATH = "/v1/student";

  async getStudents(
    filters?: ListFiltersDto,
  ): Promise<PaginatedStudentsResponse> {
    const response = await apiClient.post<PaginatedStudentsResponse>(
      `${this.BASE_PATH}/all`,
      filters || { page: 1, size: 10, filters: {} },
    );
    return response.data;
  }

  async createStudent(
    data: CreateStudentDto,
  ): Promise<StudentMutationResponse> {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("password", data.password);
    formData.append("rollNo", data.rollNo);
    formData.append("grade", data.grade);
    if (data.recoveryEmail) {
      formData.append("recoveryEmail", data.recoveryEmail);
    }
    if (data.otp) {
      formData.append("otp", data.otp);
    }
    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture);
    }

    const response = await apiClient.post<StudentMutationResponse>(
      `${this.BASE_PATH}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  async updateStudent(
    data: UpdateStudentDto,
  ): Promise<StudentMutationResponse> {
    const formData = new FormData();
    formData.append("studentId", String(data.studentId));
    if (data.name !== undefined) formData.append("name", data.name);
    if (data.password !== undefined) formData.append("password", data.password);
    if (data.rollNo !== undefined) formData.append("rollNo", data.rollNo);
    if (data.grade !== undefined) formData.append("grade", data.grade);
    if (data.recoveryEmail !== undefined) {
      formData.append("recoveryEmail", data.recoveryEmail);
    }
    if (data.isActive !== undefined) {
      formData.append("isActive", String(data.isActive));
    }
    if (data.profilePicture) {
      formData.append("profilePicture", data.profilePicture);
    }

    const response = await apiClient.put<StudentMutationResponse>(
      `${this.BASE_PATH}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }

  async deleteStudent(studentId: number): Promise<DeleteStudentResponse> {
    const response = await apiClient.delete<DeleteStudentResponse>(
      `${this.BASE_PATH}`,
      {
        data: { studentId },
      },
    );
    return response.data;
  }
}

export const studentService = new StudentService();
