import { USER_ROLES, USER_STATUS } from "../helpers/constants/constants";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export interface UserAttributes {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  status: UserStatus;
  created_at?: Date;
  updated_at?: Date;
}
