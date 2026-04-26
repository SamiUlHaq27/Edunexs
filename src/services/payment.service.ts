import apiClient from "../config/api.config";

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  fee: {
    id: number;
    invoiceNo: string;
    title: string;
    amount: number;
    status: string;
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  fee: {
    id: number;
    invoiceNo: string;
    title: string;
    amount: number;
    status: string;
  };
  paymentIntentId: string;
}

class PaymentService {
  private readonly BASE_PATH = "/v1/fee";

  async createPaymentIntent(
    feeId: number,
    currency: string = "pkr",
  ): Promise<PaymentIntentResponse> {
    const response = await apiClient.post<PaymentIntentResponse>(
      `${this.BASE_PATH}/payment/create-intent`,
      { feeId, currency },
    );
    return response.data;
  }

  async confirmPayment(
    feeId: number,
    clientSecret: string,
    paymentIntentId: string,
  ): Promise<ConfirmPaymentResponse> {
    const response = await apiClient.post<ConfirmPaymentResponse>(
      `${this.BASE_PATH}/payment/confirm`,
      { feeId, clientSecret, paymentIntentId },
    );
    return response.data;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
