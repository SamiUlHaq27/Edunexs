import apiClient from "../config/api.config";
import { ListFiltersDto } from "../types";

export interface Section {
  id: number;
  name: string;
  isActive: boolean;
  institutionPrefix?: string;
  offeringCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionOffering {
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

export interface CreateSectionDto {
  name: string;
}

export interface UpdateSectionDto {
  sectionId: number;
  name?: string;
  isActive?: boolean;
}

export interface DeleteSectionDto {
  sectionId: number;
}

export interface CreateSectionOfferingDto {
  sectionId: number;
  courseId: number;
  teacherId: number;
  studentProfileIds?: number[];
  studentGroupIds?: number[];
}

export interface UpdateSectionOfferingDto {
  offeringId: number;
  courseId?: number;
  teacherId?: number;
  isActive?: boolean;
  studentProfileIds?: number[];
  studentGroupIds?: number[];
}

export interface DeleteSectionOfferingDto {
  offeringId: number;
}

interface PaginatedSectionsResponse {
  data: Section[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface PaginatedSectionOfferingsResponse {
  data: SectionOffering[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface MutationResponse {
  success?: boolean;
  message?: string;
}

class SectionService {
  private readonly SECTION_BASE_PATH = "/v1/section";
  private readonly OFFERING_BASE_PATH = "/v1/section/offering";

  async getSections(
    filters?: ListFiltersDto,
  ): Promise<PaginatedSectionsResponse> {
    try {
      const response = await apiClient.post<PaginatedSectionsResponse>(
        `${this.SECTION_BASE_PATH}/all`,
        filters || { page: 1, size: 20, filters: {} },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createSection(data: CreateSectionDto): Promise<Section> {
    try {
      const response = await apiClient.post<Section>(
        this.SECTION_BASE_PATH,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateSection(data: UpdateSectionDto): Promise<Section> {
    try {
      const response = await apiClient.put<Section>(
        this.SECTION_BASE_PATH,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteSection(sectionId: number): Promise<MutationResponse> {
    try {
      const response = await apiClient.delete<MutationResponse>(
        this.SECTION_BASE_PATH,
        {
          data: { sectionId },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSectionOfferings(
    filters?: ListFiltersDto,
  ): Promise<PaginatedSectionOfferingsResponse> {
    try {
      const response = await apiClient.post<PaginatedSectionOfferingsResponse>(
        `${this.OFFERING_BASE_PATH}/all`,
        filters || { page: 1, size: 20, filters: {} },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createSectionOffering(
    data: CreateSectionOfferingDto,
  ): Promise<SectionOffering> {
    try {
      const response = await apiClient.post<SectionOffering>(
        this.OFFERING_BASE_PATH,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateSectionOffering(
    data: UpdateSectionOfferingDto,
  ): Promise<SectionOffering> {
    try {
      const response = await apiClient.put<SectionOffering>(
        this.OFFERING_BASE_PATH,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteSectionOffering(offeringId: number): Promise<MutationResponse> {
    try {
      const response = await apiClient.delete<MutationResponse>(
        this.OFFERING_BASE_PATH,
        {
          data: { offeringId },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const sectionService = new SectionService();
export default sectionService;
