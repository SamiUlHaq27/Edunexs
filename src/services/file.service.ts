import apiClient from "../config/api.config";

interface UploadResponse {
  success: boolean;
  message: string;
  dbFileId?: string;
  fileId?: string;
  id?: string;
}

class FileService {
  private readonly BASE_PATH = "/v1/auth";

  /**
   * Upload a file and get its ID (UUID string)
   */
  async uploadFile(file: File, fileName?: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (fileName) {
        formData.append("fileName", fileName);
      }

      const response = await apiClient.post<UploadResponse>(
        `${this.BASE_PATH}/upload-profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const fileId =
        response.data.dbFileId || response.data.fileId || response.data.id;
      if (fileId) {
        return fileId;
      } else {
        throw new Error("No file ID returned from upload");
      }
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const fileService = new FileService();
export default fileService;
