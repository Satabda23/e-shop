import express from "express";
import AuthController from "../../controllers/auth/AuthController";
import jwt from "../../middleware/jwt";

const router = express.Router();

const verifyAccessToken = jwt.verifyAccessToken;

// Public Routes
router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

// Protected Routes
router.get("/profile", verifyAccessToken, AuthController.profile);

router.post("/logout", verifyAccessToken, AuthController.logout);

export default router;
