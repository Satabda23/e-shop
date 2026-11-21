import crypto from "crypto";

export const USER_ROLES = {
  ADMIN: 1,
  CUSTOMER: 2,
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 1,
  SUSPENDED: 2,
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Admin",
  [USER_ROLES.CUSTOMER]: "Customer",
} as const;

export const USER_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  SUSPENDED: 2,
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUS.INACTIVE]: "Inactive",
  [USER_STATUS.ACTIVE]: "Active",
  [USER_STATUS.SUSPENDED]: "Suspended",
} as const;

export function generateOtp(): number {
  return crypto.randomInt(100000, 999999);
}