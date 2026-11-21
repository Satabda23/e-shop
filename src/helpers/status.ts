export const STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

export const STATUS_LABEL = {
  [STATUS.INACTIVE]: "Inactive",
  [STATUS.ACTIVE]: "Active",
} as const;

export const CHANNEL_TYPES = {
  SMS: 1,
  EMAIL: 2,
} as const;