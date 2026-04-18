import apiClient from "../config/api.config";
import {
  CreateInstitutionAdminDto,
  UpdateInstitutionAdminDto,
  UpdateInstitutionAdminProfileDto,
  ListFiltersDto,
} from "../types";

interface PaginatedAdminsResponse {
  data: InstitutionAdmin[];
  total: number;
  page: number;
  limit: number;
}

export interface InstitutionAdmin {
  id: number;
  authId: number;
  name: string;
  email: string;
  username: string;
  isActive: boolean;
  institutionId: number;
  createdAt: string;
  updatedAt: string;
  profilePictureFileId?: string;
  profilePicture?: {
    id: string;
    fileId: string;
    publicUrl: string;
  } | null;
}

interface CreateAdminResponse {
  success: boolean;
  message: string;
  admin?: InstitutionAdmin;
}

interface UpdateAdminResponse {
  success: boolean;
  message: string;
  admin?: InstitutionAdmin;
}

interface UpdateOwnProfileResponse {
  id: number;
  email?: string;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
  updatedAt: string;
}

interface DeleteAdminResponse {
  success: boolean;
  message: string;
}

class InstitutionAdminService {
  private readonly BASE_PATH = "/v1/institution-admin";

  /**
   * Fetch all institution admins with pagination and filters
   */
  async getAdmins(filters?: ListFiltersDto): Promise<PaginatedAdminsResponse> {
    try {
      const response = await apiClient.post<PaginatedAdminsResponse>(
        `${this.BASE_PATH}/all`,
        filters || { page: 1, size: 10, filters: {} },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new institution admin
   */
  async createAdmin(
    data: CreateInstitutionAdminDto,
  ): Promise<CreateAdminResponse> {
    try {
      const response = await apiClient.post<CreateAdminResponse>(
        `${this.BASE_PATH}`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an institution admin
   */
  async updateAdmin(
    adminId: number,
    data: Partial<UpdateInstitutionAdminDto>,
  ): Promise<UpdateAdminResponse> {
    try {
      const payload = {
        institutionAdminId: adminId,
        ...data,
      };
      const response = await apiClient.put<UpdateAdminResponse>(
        `${this.BASE_PATH}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete an institution admin
   */
  async deleteAdmin(adminId: number): Promise<DeleteAdminResponse> {
    try {
      const response = await apiClient.delete<DeleteAdminResponse>(
        `${this.BASE_PATH}`,
        {
          data: { institutionAdminId: adminId },
        },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle admin activation status
   */
  async toggleStatus(
    adminId: number,
    isActive: boolean,
  ): Promise<UpdateAdminResponse> {
    try {
      return await this.updateAdmin(adminId, { isActive });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update own institution-admin profile (recovery email, password, picture)
   */
  async updateMyProfile(
    data: UpdateInstitutionAdminProfileDto,
    profilePicture?: File,
  ): Promise<UpdateOwnProfileResponse> {
    try {
      const hasFile = !!profilePicture;
      let payload: FormData | UpdateInstitutionAdminProfileDto;

      if (hasFile) {
        const formData = new FormData();

        if (data.email) formData.append("email", data.email);
        if (data.otp) formData.append("otp", data.otp);
        if (data.password) formData.append("password", data.password);
        formData.append("profilePicture", profilePicture as Blob);

        payload = formData;
      } else {
        payload = data;
      }

      const response = await apiClient.put<UpdateOwnProfileResponse>(
        `${this.BASE_PATH}/profile/me`,
        payload,
        hasFile
          ? {
              headers: { "Content-Type": "multipart/form-data" },
            }
          : undefined,
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const institutionAdminService = new InstitutionAdminService();
export default institutionAdminService;
