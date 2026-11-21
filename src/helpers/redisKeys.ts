export const REDIS_PREFIX = {
  OTP: "otp",
  SESSION: "session",
  RATE_LIMIT: "rate",
};

export const OTP_REQUEST_LIMIT = 5;       // Max 5 OTP requests per hour
export const OTP_VERIFY_LIMIT = 5;        // Max 5 failed OTP attempts before lockout
export const OTP_WINDOW = 60 * 60;        // 1 hour rate-limit window (in seconds)
export const OTP_TTL = 5 * 60;            // 5 minutes OTP expiration (in seconds)

export const RedisKey = {
  otpCode: (phone: string) => `${REDIS_PREFIX.OTP}:code:${phone}`,
  otpLimit: (phone: string) => `${REDIS_PREFIX.OTP}:limit:${phone}`,
  otpVerifyLimit: (phone: string) => `${REDIS_PREFIX.OTP}:verify:${phone}`,
};