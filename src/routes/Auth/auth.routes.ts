import express from "express";
import AuthController from "../../controllers/auth/AuthController";
import jwt from "../../middleware/jwt";

const router = express.Router();

// Public OTP Authentication
router.post("/login/send-otp", AuthController.loginSendOtp);
router.post("/login/verify-otp", AuthController.loginVerifyOtp);

// Protected Customer Profile
router.get("/me", jwt.verifyAccessToken, AuthController.getMe);

export default router;