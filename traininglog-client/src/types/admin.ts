export interface AdminUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface UpdateUserRolesDto {
  roles: string[];
}
