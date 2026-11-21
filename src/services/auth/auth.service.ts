import httpError from "http-errors";
import { generateOtp } from "../../helpers/constants/constants";
import { RedisKey, OTP_TTL } from "../../helpers/redisKeys";
import {
  canVerifyOtp,
  resetOtpVerifyLimit,
  resetOtpCode,
} from "../../helpers/redisUtils";
import { CHANNEL_TYPES } from "../../helpers/status";
import { getRedis, setRedis } from "../storage/redis.service";
import { otpService } from "./otp.service";

export const sendOtpMessage = async (
  phone_number: string,
  channel_type: number = CHANNEL_TYPES.SMS,
  user_type: number = 1
) => {
  try {
    const otp_code = String(generateOtp());
    const expiresInSeconds = OTP_TTL; // 300 seconds (5 minutes)

    const otpData = {
      otp_code,
      channel_type,
      user_type,
      created_at: new Date().toISOString(),
    };

    const key = RedisKey.otpCode(phone_number);
    await setRedis(key, otpData, expiresInSeconds);

    if (channel_type === CHANNEL_TYPES.SMS) {
      await otpService.sendOtp(phone_number, otp_code);
    }

    return otpData;
  } catch (error) {
    console.error("[AuthService] sendOtpMessage error:", error);
    return null;
  }
};

export const verifyOtpCode = async (phone_number: string, otp: string) => {

  const canAttempt = await canVerifyOtp(phone_number);
  if (!canAttempt) {
    throw httpError.TooManyRequests(
      "Maximum OTP verification attempts reached. Please request a new OTP."
    );
  }

  const otpCodeKey = RedisKey.otpCode(phone_number);
  const otpData: any = await getRedis(otpCodeKey);

  if (!otpData) {
    throw httpError.Unauthorized("Invalid or expired OTP");
  }

  if (String(otpData.otp_code) !== String(otp)) {
    throw httpError.Unauthorized("Incorrect OTP");
  }

  await resetOtpVerifyLimit(phone_number);
  await resetOtpCode(phone_number);

  return otpData;
};