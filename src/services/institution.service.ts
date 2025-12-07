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
        `${this.BASE_PATH}/my-institution`
      );
      return response.data;
    } catch (error) {
      // If 404 or no institution found, return null
      return null;
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
}

// Export singleton instance
export const institutionService = new InstitutionService();
export default institutionService;
