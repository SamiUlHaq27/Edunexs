import apiClient from "../config/api.config";
import { Institution } from "../types";

class InstitutionService {
  private readonly BASE_PATH = "/v1/institution";

  /**
   * Get the institution owned by the current user
   */
  async getMyInstitution(): Promise<Institution | null> {
    try {
      const response = await apiClient.get<Institution>(
        `${this.BASE_PATH}/my-institution`,
      );
      return response.data;
    } catch (error) {
      // If 404 (not found), return null so callers may redirect to create page.
      // For other errors (network / server), surface a specific error so
      // callers can show a "Service unavailable" toast and avoid redirecting.
      const status = (error as any)?.response?.status;
      if (status === 404) {
        return null;
      }

      throw new Error("Service unavailable");
    }
  }

  /**
   * Create a new institution
   */
  async createInstitution(data: {
    prefix: string;
    name: string;
    city: string;
    country: string;
    address: string;
  }): Promise<Institution> {
    try {
      const response = await apiClient.post<Institution>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update current owner's institution details
   */
  async updateInstitution(data: {
    prefix?: string;
    name?: string;
    city?: string;
    country?: string;
    address?: string;
  }): Promise<Institution> {
    try {
      const response = await apiClient.put<Institution>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload logo for the institution
   */
  async uploadLogo(logoFile: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("logoFile", logoFile);

      await apiClient.post(`${this.BASE_PATH}/upload-logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all institutions for system admin with filters
   */
  async getAllInstitutions(filters: {
    page?: number;
    size?: number;
    filters?: {
      name?: string;
      isBlocked?: boolean;
    };
  }): Promise<any> {
    try {
      const response = await apiClient.post(
        `${this.BASE_PATH}/admin/all`,
        filters,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update institution status (block/unblock)
   */
  async updateStatus(data: {
    institutionId: number;
    isBlocked: boolean;
    message: string;
  }): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_PATH}/admin/status`, data);
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const institutionService = new InstitutionService();
export default institutionService;
