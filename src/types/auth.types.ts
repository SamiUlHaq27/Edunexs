// User Roles
export enum UserRole {
  SYSTEM_ADMIN = "system_admin",
  INSTITUTION_OWNER = "institution_owner",
  INSTITUTION_ADMIN = "institution_admin",
  TEACHER = "teacher",
  STUDENT = "student",
  PARENT = "parent",
}

// OTP Types
export enum OtpType {
  SIGNUP = "signup",
  PASSWORD_RESET = "password_reset",
}

// User Interface
export interface User {
  id: number;
  username: string;
  name: string;
  profilePicture?: {
    dbFileId: number;
    appwriteFileId: string;
    publicUrl: string;
  } | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Auth DTOs
export interface SendOtpDto {
  email: string;
  type?: OtpType;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface SignupDto {
  email: string;
  name: string;
  password: string;
  otp: string;
}

export interface LoginDto {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// API Error Response
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
