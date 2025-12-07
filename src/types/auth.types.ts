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
  EMAIL_VERIFICATION = "email_verification",
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

// Institution Interface
export interface Institution {
  prefix: string;
  name: string;
  city: string;
  country: string;
  address: string;
  logoUrl?: string;
  logo?: {
    id: string;
    fileId: string;
    publicUrl: string;
  } | null;
  isBlocked: boolean;
  owner?: {
    id: number;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateInstitutionStatusDto {
  prefix: string;
  isBlocked: boolean;
  message: string;
}

export interface PaginatedInstitutionsResponse {
  data: Institution[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Institution Admin DTOs
export interface CreateInstitutionAdminDto {
  username: string;
  password: string;
  name: string;
  email?: string;
  otp?: string;
  profilePictureFileId?: string;
}

export interface UpdateInstitutionAdminDto {
  institutionAdminId?: number;
  username?: string;
  password?: string;
  name?: string;
  email?: string;
  otp?: string;
  isActive?: boolean;
  profilePictureFileId?: string;
}

// List Filters DTO
export interface ListFiltersDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
}
