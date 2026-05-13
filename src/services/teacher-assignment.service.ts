import apiClient from "../config/api.config";

export type AssessmentType = "assignment" | "quiz";
export type AssignmentSubmissionStatus = "submitted" | "graded";

export interface TeacherAssignment {
  id: number;
  title: string;
  description?: string;
  offeringId: number;
  assessmentType: AssessmentType;
  dueDate: string;
  maxGrade: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentProfileId: number;
  status: AssignmentSubmissionStatus;
  submittedAt?: string;
  score?: number;
  feedback?: string;
}

export interface CreateTeacherAssignmentDto {
  offeringId: number;
  assessmentType?: AssessmentType;
  title: string;
  description?: string;
  dueDate: string;
  maxGrade: number;
}

export interface ListTeacherAssignmentsDto {
  page: number;
  size: number;
  offeringId?: number;
  title?: string;
  assessmentType?: AssessmentType;
  isActive?: boolean;
}

export interface ListAssignmentSubmissionsDto {
  assignmentId: number;
  page: number;
  size: number;
  studentProfileId?: number;
  isLate?: boolean;
  status?: AssignmentSubmissionStatus;
}

export interface GradeAssignmentDto {
  assignmentId: number;
  studentProfileId: number;
  score: number;
  feedback?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

class TeacherAssignmentService {
  private readonly BASE_PATH = "/v1/assignment/teacher";

  async createAssignment(
    data: CreateTeacherAssignmentDto,
    files: File[] = [],
  ): Promise<TeacherAssignment> {
    try {
      const formData = new FormData();
      formData.append("offeringId", String(data.offeringId));
      formData.append("title", data.title);
      formData.append("dueDate", data.dueDate);
      formData.append("maxGrade", String(data.maxGrade));

      if (data.assessmentType) {
        formData.append("assessmentType", data.assessmentType);
      }

      if (data.description) {
        formData.append("description", data.description);
      }

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await apiClient.post<TeacherAssignment>(
        `${this.BASE_PATH}/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async listAssignments(
    filters: ListTeacherAssignmentsDto,
  ): Promise<PaginatedResponse<TeacherAssignment>> {
    try {
      const response = await apiClient.post<
        PaginatedResponse<TeacherAssignment>
      >(`${this.BASE_PATH}/all`, filters);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async listSubmissions(
    filters: ListAssignmentSubmissionsDto,
  ): Promise<PaginatedResponse<AssignmentSubmission>> {
    try {
      const response = await apiClient.post<
        PaginatedResponse<AssignmentSubmission>
      >(`${this.BASE_PATH}/submissions`, filters);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async gradeSubmission(
    data: GradeAssignmentDto,
  ): Promise<AssignmentSubmission> {
    try {
      const response = await apiClient.post<AssignmentSubmission>(
        `${this.BASE_PATH}/grade`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAssignment(
    assignmentId: number,
    hard = false,
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.BASE_PATH}/delete`,
        { assignmentId, hard },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const teacherAssignmentService = new TeacherAssignmentService();
export default teacherAssignmentService;
