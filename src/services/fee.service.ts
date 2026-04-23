import apiClient from "../config/api.config";
import { ListFiltersDto } from "../types";

export type FeeStatus = "PENDING" | "PAID" | "OVERDUE";

export interface FeeInvoice {
  id: number;
  invoiceNo: string;
  title: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: FeeStatus;
  institutionPrefix?: string;
  studentProfileId: number;
  studentId?: number;
  studentName?: string;
  rollNo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeeDto {
  title: string;
  amount: number;
  dueDate: string;
  status?: FeeStatus;
  paidAt?: string;
  studentProfileIds?: number[];
  studentGroupIds?: number[];
}

export interface UpdateFeeDto {
  feeId: number;
  title?: string;
  amount?: number;
  dueDate?: string;
  status?: FeeStatus;
  paidAt?: string;
  studentProfileId?: number;
}

interface ListFeesResponse {
  data: FeeInvoice[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

interface CreateFeesResponse {
  createdCount: number;
  data: FeeInvoice[];
}

interface DeleteFeeResponse {
  success: boolean;
  message: string;
}

class FeeService {
  private readonly BASE_PATH = "/v1/fee";

  async getFees(filters?: ListFiltersDto): Promise<ListFeesResponse> {
    const response = await apiClient.post<ListFeesResponse>(
      `${this.BASE_PATH}/all`,
      filters || { page: 1, size: 100, filters: {} },
    );
    return response.data;
  }

  async createFee(data: CreateFeeDto): Promise<CreateFeesResponse> {
    const response = await apiClient.post<CreateFeesResponse>(
      this.BASE_PATH,
      data,
    );
    return response.data;
  }

  async updateFee(data: UpdateFeeDto): Promise<FeeInvoice> {
    const response = await apiClient.put<FeeInvoice>(this.BASE_PATH, data);
    return response.data;
  }

  async deleteFee(feeId: number): Promise<DeleteFeeResponse> {
    const response = await apiClient.delete<DeleteFeeResponse>(this.BASE_PATH, {
      data: { feeId },
    });
    return response.data;
  }
}

export const feeService = new FeeService();
export default feeService;
