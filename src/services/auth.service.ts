import apiClient from "../config/api.config";
import {
  SendOtpDto,
  SendOtpResponse,
  SignupDto,
  LoginDto,
  AuthResponse,
  ResetPasswordDto,
  ResetPasswordResponse,
  User,
} from "../types";

class AuthService {
  private readonly BASE_PATH = "/v1/auth";

  /**
   * Send OTP to email for signup or password reset
   */
  async sendOtp(data: SendOtpDto): Promise<SendOtpResponse> {
    try {
      const response = await apiClient.post<SendOtpResponse>(
        `${this.BASE_PATH}/send-otp`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sign up a new user with OTP verification
   */
  async signup(data: SignupDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.BASE_PATH}/signup`,
        data
      );

      // Store auth data in localStorage
      if (response.data.accessToken) {
        this.saveAuthData(response.data);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login with email/username and password
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.BASE_PATH}/login`,
        data
      );

      // Store auth data in localStorage
      if (response.data.accessToken) {
        this.saveAuthData(response.data);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with OTP verification
   */
  async resetPassword(data: ResetPasswordDto): Promise<ResetPasswordResponse> {
    try {
      const response = await apiClient.post<ResetPasswordResponse>(
        `${this.BASE_PATH}/reset-password`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(`${this.BASE_PATH}/me`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(authData: AuthResponse): void {
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("user", JSON.stringify(authData.user));
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Logout - Clear all auth data
   */
  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
