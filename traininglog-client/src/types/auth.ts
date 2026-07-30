export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  email: string;
  role: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfileDto {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
}

export interface ChangeEmailDto {
  newEmail: string;
  currentPassword: string;
}