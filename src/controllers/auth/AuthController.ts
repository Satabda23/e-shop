import { Request, Response, NextFunction } from "express";
import httpError from "http-errors";
import User from "../../models/user.model";
import { sendOtpMessage, verifyOtpCode } from "../../services/auth/auth.service";
import { canRequestOtp } from "../../helpers/redisUtils";
import { CHANNEL_TYPES} from "../../helpers/status";
import { ACCOUNT_STATUS } from "../../helpers/constants/constants";
import { USER_ROLES, USER_STATUS } from "../../helpers/constants/constants";
import jwt from "../../middleware/jwt";

export default {

  loginSendOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, otpChannelId = CHANNEL_TYPES.SMS } = req.body;

      if (!phone || String(phone).trim().length < 10) {
        throw httpError.BadRequest("A valid 10-digit phone number is required");
      }

      const formattedPhone = String(phone).trim();

      // 1. Rate-limit check in Redis (Max 5 OTP requests per hour)
      const canRequest = await canRequestOtp(formattedPhone);
      if (!canRequest) {
        throw httpError.TooManyRequests(
          "Maximum OTP sending attempts reached. Please try again after an hour."
        );
      }

      // 2. Find or register customer in MySQL
      const [user] = await (User as any).findOrCreate({
        where: { phone: formattedPhone },
        defaults: {
          phone: formattedPhone,
          role: USER_ROLES.CUSTOMER,
          status: USER_STATUS.ACTIVE,
          is_active: true,
        },
      });

      // 3. Ensure account is active
      if (!user.is_active || user.status === ACCOUNT_STATUS.SUSPENDED) {
        throw httpError.Unauthorized("Account is inactive or suspended");
      }

      // 4. Cache OTP in Redis and enqueue SMS dispatch via BullMQ
      const verification = await sendOtpMessage(
        formattedPhone,
        otpChannelId,
        USER_ROLES.CUSTOMER
      );

      if (!verification) {
        throw httpError.InternalServerError("Failed to dispatch OTP");
      }

      // 5. Issue 5-minute intermediate token
      const token = await jwt.signAuthToken({
        identifier: formattedPhone,
        user_id: user.id,
      });

      return res.status(200).json({
        status: true,
        message: "OTP sent successfully",
        data: {
          token,
        },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        status: false,
        message: error.message || "Something went wrong",
      });
    }
  },

  loginVerifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, otp } = req.body;

      if (!token || !otp) {
        throw httpError.BadRequest("Both 'token' and 'otp' are required");
      }

      // 1. Verify intermediate token
      const userData = jwt.verifyAuthToken(token);
      if (!userData) {
        throw httpError.Forbidden(
          "Session has expired or is invalid. Please request a new OTP."
        );
      }

      const { identifier: phone, user_id } = userData;

      // 2. Verify OTP against Redis with brute-force check
      await verifyOtpCode(phone, String(otp));

      // 3. Fetch user record from MySQL
      const user: any = await User.findByPk(user_id);
      if (!user) {
        throw httpError.NotFound("User record not found");
      }

      // 4. Issue final access (1h) and refresh (7d) tokens
      const accessToken = await jwt.signUserAccessToken(user.id);
      const refreshToken = await jwt.signUserRefreshToken(user.id);

      return res.status(200).json({
        status: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        status: false,
        message: error.message || "Authentication failed",
      });
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authUser = (req as any).user;
      const user: any = await User.findByPk(authUser.id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw httpError.NotFound("User not found");
      }

      return res.status(200).json({
        status: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.status || 500).json({
        status: false,
        message: error.message,
      });
    }
  },
};