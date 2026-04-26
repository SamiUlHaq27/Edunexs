import apiClient from "../config/api.config";
import { ListFiltersDto } from "../types";

export interface Course {
  id: number;
  code: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ListCoursesResponse {
  data: Course[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface DeleteCourseResponse {
  success: boolean;
  message: string;
}

class CourseService {
  private readonly BASE_PATH = "/v1/course";

  async getCourses(filters?: ListFiltersDto): Promise<ListCoursesResponse> {
    try {
      const response = await apiClient.post<ListCoursesResponse>(
        `${this.BASE_PATH}/all`,
        filters || { page: 1, size: 20, filters: {} },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCourse(data: {
    code: string;
    title: string;
    description?: string;
  }): Promise<Course> {
    try {
      const response = await apiClient.post<Course>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateCourse(
    courseId: number,
    data: {
      code?: string;
      title?: string;
      description?: string;
      isActive?: boolean;
    },
  ): Promise<Course> {
    try {
      const response = await apiClient.put<Course>(this.BASE_PATH, {
        courseId,
        ...data,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteCourse(courseId: number): Promise<DeleteCourseResponse> {
    try {
      const response = await apiClient.delete<DeleteCourseResponse>(
        this.BASE_PATH,
        {
          data: { courseId },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const courseService = new CourseService();
export default courseService;
