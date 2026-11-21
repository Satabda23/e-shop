import { redisClient } from "../services/storage/redis.service";
import { OTP_REQUEST_LIMIT, OTP_TTL, OTP_VERIFY_LIMIT, OTP_WINDOW, RedisKey } from "./redisKeys";

export async function canRequestOtp(phone: string): Promise<boolean> {
  const key = RedisKey.otpLimit(phone);
  try {
    const currentCount = await redisClient.incr(key);
    if (currentCount === 1) {
      await redisClient.expire(key, OTP_WINDOW);
    }
    return currentCount <= OTP_REQUEST_LIMIT;
  } catch (err) {
    console.error("canRequestOtp error:", err);
    return true; // Fallback to allow if Redis is temporarily unreachable
  }
}

export async function canVerifyOtp(phone: string): Promise<boolean> {
  const key = RedisKey.otpVerifyLimit(phone);
  try {
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, OTP_TTL);
    }
    return count <= OTP_VERIFY_LIMIT;
  } catch (err) {
    console.error("canVerifyOtp error:", err);
    return true;
  }
}

export async function resetOtpVerifyLimit(phone: string): Promise<void> {
  try {
    await redisClient.del(RedisKey.otpVerifyLimit(phone));
  } catch (err) {
    console.error("resetOtpVerifyLimit error:", err);
  }
}

export async function resetOtpCode(phone: string): Promise<void> {
  try {
    await redisClient.del(RedisKey.otpCode(phone));
  } catch (err) {
    console.error("resetOtpCode error:", err);
  }
}