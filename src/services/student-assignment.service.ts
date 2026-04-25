import apiClient from "../config/api.config";

export interface StudentAssignmentListFilters {
  page: number;
  size: number;
  offeringId?: number;
  assessmentType?: "assignment" | "quiz";
  submissionStatus?: "submitted" | "graded" | "not_submitted";
}

export interface StudentAssignmentItem {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  maxGrade: number;
  isOverdue: boolean;
  status: "submitted" | "graded" | "not_submitted";
  offering?: {
    id?: number;
    sectionName?: string;
    courseName?: string;
  };
  submission?: {
    id: number;
    submittedAt?: string;
    isLate?: boolean;
    status?: "submitted" | "graded";
    file?: {
      id?: string;
      fileName?: string;
      publicUrl?: string;
    } | null;
  } | null;
  grade?: {
    id: number;
    score: number;
    feedback?: string;
    gradedAt?: string;
  } | null;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface SubmitStudentAssignmentResponse {
  submissionId: number;
  assignment: {
    id: number;
    title: string;
    dueDate: string;
    maxGrade: number;
    offeringId: number;
  };
  studentProfileId: number;
  submittedAt: string;
  isLate: boolean;
  status: "submitted" | "graded";
  file?: {
    id?: string;
    fileName?: string;
    publicUrl?: string;
  } | null;
  message?: string;
}

export interface StudentSubmission {
  submission: {
    id: number;
    submittedAt: string;
    isLate: boolean;
    status: "submitted" | "graded";
    file?: {
      dbFileId: number;
      appwriteFileId: string;
      fileName: string;
      mimeType: string;
      sizeOriginal: number;
      publicUrl: string;
    } | null;
  } | null;
  hasSubmission: boolean;
}

class StudentAssignmentService {
  private readonly BASE_PATH = "/v1/assignment/student";

  async listAssignments(
    filters: StudentAssignmentListFilters,
  ): Promise<PaginatedResponse<StudentAssignmentItem>> {
    const response = await apiClient.post<
      PaginatedResponse<StudentAssignmentItem>
    >(`${this.BASE_PATH}/all`, filters);
    return response.data;
  }

  async getMySubmission(assignmentId: number): Promise<StudentSubmission> {
    const response = await apiClient.post<StudentSubmission>(
      `${this.BASE_PATH}/my-submission`,
      { assignmentId },
    );
    return response.data;
  }

  async submitAssignment(input: {
    assignmentId: number;
    file: File;
  }): Promise<SubmitStudentAssignmentResponse> {
    const formData = new FormData();
    formData.append("assignmentId", String(input.assignmentId));
    formData.append("file", input.file);

    const response = await apiClient.post<SubmitStudentAssignmentResponse>(
      `${this.BASE_PATH}/submit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  }

  async removeSubmission(assignmentId: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      `${this.BASE_PATH}/remove-submission`,
      { assignmentId },
    );
    return response.data;
  }
}

export const studentAssignmentService = new StudentAssignmentService();
export default studentAssignmentService;
