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
  private readonly TOKEN_KEY = "accessToken";
  private readonly USER_KEY = "user";
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  /**
   * Send OTP to email for signup or password reset
   */
  async sendOtp(data: SendOtpDto): Promise<SendOtpResponse> {
    try {
      const response = await apiClient.post<SendOtpResponse>(
        `${this.BASE_PATH}/send-otp`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sign up a new user with OTP verification
   */
  async signup(
    data: SignupDto,
    profilePictureFile?: File,
  ): Promise<AuthResponse> {
    try {
      const hasFile = !!profilePictureFile;

      let payload: FormData | SignupDto;

      if (hasFile) {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("name", data.name);
        formData.append("password", data.password);
        formData.append("otp", data.otp);
        formData.append("profilePicture", profilePictureFile as Blob);
        payload = formData;
      } else {
        payload = data;
      }

      const response = await apiClient.post<AuthResponse>(
        `${this.BASE_PATH}/signup`,
        payload,
        hasFile
          ? {
              headers: { "Content-Type": "multipart/form-data" },
            }
          : undefined,
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
        data,
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
        data,
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
    localStorage.setItem(this.TOKEN_KEY, authData.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set access token (for manual token refresh if needed)
   */
  setAccessToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Decode JWT token and check expiry (basic implementation)
   * Note: This is a basic check. More robust implementations should validate on the backend.
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Basic JWT decode (payload is middle part)
      const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };

      if (!payload.exp) return false; // No expiry info

      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      return currentTime > expiryTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Consider expired if decode fails
    }
  }

  /**
   * Logout - Clear all auth data and cancel any pending token refresh
   */
  logout(): void {
    // Cancel token refresh timer if running
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    // Clear stored data
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Initialize session management (call on app startup if needed)
   */
  initializeSession(): void {
    // Check if token is expired and logout if necessary
    if (this.isAuthenticated() && this.isTokenExpired()) {
      this.logout();
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
